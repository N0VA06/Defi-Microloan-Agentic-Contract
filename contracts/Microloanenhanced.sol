// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DynamicMicroloanBank {
    address public owner;
    uint256 public loanCounter;
    
    // Reputation constants
    uint256 public constant MIN_REPUTATION = 50;
    uint256 public constant MAX_REPUTATION = 100;
    uint256 public constant REPUTATION_INCREASE = 10;
    uint256 public constant REPUTATION_DECREASE = 20;
    uint256 public constant DEFAULT_REPUTATION = 70;
    
    // Loan configuration constants
    uint256 public constant LARGE_LOAN_THRESHOLD = 1 ether; // Above this amount, split into tranches
    uint256 public constant MAX_TRANCHE_SIZE = 0.5 ether;
    uint256 public constant BASE_DURATION = 30 days;
    uint256 public constant MIN_DURATION = 15 days;
    uint256 public constant MAX_DURATION = 90 days;
    
    // Interest rate basis points (100 = 1%)
    uint256 public constant BASE_INTEREST_RATE = 1000; // 10%
    uint256 public constant MIN_INTEREST_RATE = 500;   // 5%
    uint256 public constant MAX_INTEREST_RATE = 2000;  // 20%

    enum LoanStatus {
        Requested,
        Approved,
        Funded,
        PartiallyRepaid,
        Repaid,
        Defaulted
    }

    struct Installment {
        uint256 amount;
        uint256 dueDate;
        bool paid;
    }

    struct LoanTerms {
        uint256 duration;
        uint256 interestRate; // in basis points
        uint256 totalAmount; // principal + interest
        uint256 numInstallments;
    }

    struct Loan {
        uint256 id;
        address borrower;
        address lender;
        uint256 principalAmount;
        LoanTerms terms;
        uint256 fundedDate;
        LoanStatus status;
        bool exists;
        Installment[] installments;
        uint256 paidInstallments;
    }

    mapping(uint256 => Loan) public loans;
    mapping(address => uint256) public borrowerReputation;
    mapping(address => uint256[]) public borrowerLoans;
    mapping(address => uint256[]) public lenderLoans;
    mapping(address => uint256) public totalBorrowedAmount;
    mapping(address => uint256) public totalRepaidAmount;

    event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount, LoanTerms terms);
    event LoanApproved(uint256 indexed loanId);
    event LoanFunded(uint256 indexed loanId, address indexed lender);
    event InstallmentPaid(uint256 indexed loanId, address indexed borrower, uint256 installmentIndex, uint256 amount);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower);
    event LoanDefaulted(uint256 indexed loanId, address indexed borrower);
    event ReputationUpdated(address indexed borrower, uint256 newReputation);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier loanExists(uint256 _loanId) {
        require(loans[_loanId].exists, "Loan does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
        loanCounter = 0;
    }

    function requestLoan(uint256 _amount) external returns (uint256) {
        require(_amount > 0, "Loan amount must be greater than 0");
        
        // Initialize reputation if new borrower
        if (borrowerReputation[msg.sender] == 0) {
            borrowerReputation[msg.sender] = DEFAULT_REPUTATION;
        }
        
        // Calculate dynamic loan terms based on reputation and amount
        LoanTerms memory terms = _calculateLoanTerms(_amount, borrowerReputation[msg.sender]);
        
        loanCounter++;
        uint256 loanId = loanCounter;
        
        // Create new loan
        loans[loanId].id = loanId;
        loans[loanId].borrower = msg.sender;
        loans[loanId].lender = address(0);
        loans[loanId].principalAmount = _amount;
        loans[loanId].terms = terms;
        loans[loanId].status = LoanStatus.Requested;
        loans[loanId].exists = true;
        loans[loanId].paidInstallments = 0;
        
        // Create installment schedule
        _createInstallmentSchedule(loanId, terms);
        
        borrowerLoans[msg.sender].push(loanId);
        
        emit LoanRequested(loanId, msg.sender, _amount, terms);
        
        // Auto-approve if reputation is sufficient and amount is reasonable
        if (borrowerReputation[msg.sender] >= MIN_REPUTATION && _isLoanAmountReasonable(msg.sender, _amount)) {
            loans[loanId].status = LoanStatus.Approved;
            emit LoanApproved(loanId);
        }
        
        return loanId;
    }

    function _calculateLoanTerms(uint256 _amount, uint256 _reputation) private pure returns (LoanTerms memory) {
        LoanTerms memory terms;
        
        // Calculate interest rate based on reputation (lower reputation = higher interest)
        terms.interestRate = MAX_INTEREST_RATE - ((_reputation - MIN_REPUTATION) * (MAX_INTEREST_RATE - MIN_INTEREST_RATE)) / (MAX_REPUTATION - MIN_REPUTATION);
        terms.interestRate = terms.interestRate < MIN_INTEREST_RATE ? MIN_INTEREST_RATE : terms.interestRate;
        terms.interestRate = terms.interestRate > MAX_INTEREST_RATE ? MAX_INTEREST_RATE : terms.interestRate;
        
        // Calculate duration based on reputation and amount
        terms.duration = BASE_DURATION;
        if (_reputation >= 80) {
            terms.duration = BASE_DURATION + 15 days; // Extend for high reputation
        } else if (_reputation < 60) {
            terms.duration = BASE_DURATION - 10 days; // Shorten for low reputation
        }
        
        // Adjust duration based on loan amount
        if (_amount >= LARGE_LOAN_THRESHOLD) {
            terms.duration = terms.duration + 30 days; // Longer duration for large loans
        }
        
        // Ensure duration is within bounds
        terms.duration = terms.duration < MIN_DURATION ? MIN_DURATION : terms.duration;
        terms.duration = terms.duration > MAX_DURATION ? MAX_DURATION : terms.duration;
        
        // Calculate number of installments (split large loans)
        if (_amount >= LARGE_LOAN_THRESHOLD) {
            terms.numInstallments = (_amount / MAX_TRANCHE_SIZE) + 1;
            if (terms.numInstallments > 6) terms.numInstallments = 6; // Max 6 installments
        } else {
            terms.numInstallments = 1;
        }
        
        // Calculate total amount with interest
        terms.totalAmount = _amount + (_amount * terms.interestRate) / 10000;
        
        return terms;
    }

    function _createInstallmentSchedule(uint256 _loanId, LoanTerms memory _terms) private {
        uint256 installmentAmount = _terms.totalAmount / _terms.numInstallments;
        uint256 installmentDuration = _terms.duration / _terms.numInstallments;
        
        for (uint256 i = 0; i < _terms.numInstallments; i++) {
            // Handle remainder in last installment
            uint256 currentAmount = installmentAmount;
            if (i == _terms.numInstallments - 1) {
                currentAmount = _terms.totalAmount - (installmentAmount * i);
            }
            
            loans[_loanId].installments.push(Installment({
                amount: currentAmount,
                dueDate: 0, // Will be set when loan is funded
                paid: false
            }));
        }
    }

    function _isLoanAmountReasonable(address _borrower, uint256 _amount) private view returns (bool) {
        // Check if borrower has capacity based on their history
        uint256 totalBorrowed = totalBorrowedAmount[_borrower];
        uint256 totalRepaid = totalRepaidAmount[_borrower];
        uint256 reputation = borrowerReputation[_borrower];
        
        // Calculate maximum loan amount based on reputation
        uint256 maxLoanAmount = (reputation * 1 ether) / 100; // 1 ETH per 100 reputation points
        
        // Consider outstanding loans
        uint256 outstandingAmount = totalBorrowed - totalRepaid;
        
        return (_amount + outstandingAmount) <= maxLoanAmount;
    }

    function fundLoan(uint256 _loanId) external payable loanExists(_loanId) {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Approved, "Loan must be approved");
        require(msg.value == loan.principalAmount, "Must send exact principal amount");
        require(msg.sender != loan.borrower, "Cannot fund your own loan");
        
        loan.lender = msg.sender;
        loan.status = LoanStatus.Funded;
        loan.fundedDate = block.timestamp;
        
        // Set due dates for installments
        for (uint256 i = 0; i < loan.installments.length; i++) {
            loan.installments[i].dueDate = block.timestamp + ((i + 1) * loan.terms.duration / loan.terms.numInstallments);
        }
        
        lenderLoans[msg.sender].push(_loanId);
        totalBorrowedAmount[loan.borrower] += loan.principalAmount;
        
        // Transfer funds to borrower
        payable(loan.borrower).transfer(msg.value);
        
        emit LoanFunded(_loanId, msg.sender);
    }

    function repayInstallment(uint256 _loanId, uint256 _installmentIndex) external payable loanExists(_loanId) {
        Loan storage loan = loans[_loanId];
        require(msg.sender == loan.borrower, "Only borrower can repay");
        require(loan.status == LoanStatus.Funded || loan.status == LoanStatus.PartiallyRepaid, "Invalid loan status");
        require(_installmentIndex < loan.installments.length, "Invalid installment index");
        require(!loan.installments[_installmentIndex].paid, "Installment already paid");
        require(msg.value == loan.installments[_installmentIndex].amount, "Must pay exact installment amount");
        
        loan.installments[_installmentIndex].paid = true;
        loan.paidInstallments++;
        
        // Transfer funds to lender
        payable(loan.lender).transfer(msg.value);
        
        totalRepaidAmount[loan.borrower] += (msg.value * loan.principalAmount) / loan.terms.totalAmount;
        
        emit InstallmentPaid(_loanId, msg.sender, _installmentIndex, msg.value);
        
        // Check if loan is fully repaid
        if (loan.paidInstallments == loan.installments.length) {
            loan.status = LoanStatus.Repaid;
            _updateReputation(msg.sender, true);
            emit LoanRepaid(_loanId, msg.sender);
        } else {
            loan.status = LoanStatus.PartiallyRepaid;
        }
    }

    function checkAndDefaultLoans() external {
        for (uint256 i = 1; i <= loanCounter; i++) {
            Loan storage loan = loans[i];
            if ((loan.status == LoanStatus.Funded || loan.status == LoanStatus.PartiallyRepaid)) {
                // Check if any installment is overdue
                for (uint256 j = 0; j < loan.installments.length; j++) {
                    if (!loan.installments[j].paid && block.timestamp > loan.installments[j].dueDate + 7 days) {
                        loan.status = LoanStatus.Defaulted;
                        _updateReputation(loan.borrower, false);
                        emit LoanDefaulted(i, loan.borrower);
                        break;
                    }
                }
            }
        }
    }

    function _updateReputation(address _borrower, bool _increase) private {
        uint256 currentRep = borrowerReputation[_borrower];
        
        if (_increase) {
            // Bonus reputation for early repayment
            uint256 increase = REPUTATION_INCREASE;
            currentRep = currentRep + increase > MAX_REPUTATION 
                ? MAX_REPUTATION 
                : currentRep + increase;
        } else {
            // Penalty for default
            uint256 decrease = REPUTATION_DECREASE;
            currentRep = currentRep < decrease 
                ? MIN_REPUTATION 
                : currentRep - decrease;
        }
        
        borrowerReputation[_borrower] = currentRep;
        emit ReputationUpdated(_borrower, currentRep);
    }

    function getLoanDetails(uint256 _loanId) external view loanExists(_loanId) 
        returns (
            address borrower,
            address lender,
            uint256 principalAmount,
            LoanTerms memory terms,
            LoanStatus status,
            uint256 paidInstallments
        ) {
        Loan memory loan = loans[_loanId];
        return (
            loan.borrower,
            loan.lender,
            loan.principalAmount,
            loan.terms,
            loan.status,
            loan.paidInstallments
        );
    }

    function getLoanInstallments(uint256 _loanId) external view loanExists(_loanId) returns (Installment[] memory) {
        return loans[_loanId].installments;
    }

    function getNextDueInstallment(uint256 _loanId) external view loanExists(_loanId) returns (uint256, uint256, uint256) {
        Loan memory loan = loans[_loanId];
        for (uint256 i = 0; i < loan.installments.length; i++) {
            if (!loan.installments[i].paid) {
                return (i, loan.installments[i].amount, loan.installments[i].dueDate);
            }
        }
        return (0, 0, 0); // No pending installments
    }

    function getBorrowerLoans(address _borrower) external view returns (uint256[] memory) {
        return borrowerLoans[_borrower];
    }

    function getLenderLoans(address _lender) external view returns (uint256[] memory) {
        return lenderLoans[_lender];
    }

    function getBorrowerStats(address _borrower) external view returns (
        uint256 reputation,
        uint256 totalBorrowed,
        uint256 totalRepaid,
        uint256 outstandingAmount
    ) {
        return (
            borrowerReputation[_borrower],
            totalBorrowedAmount[_borrower],
            totalRepaidAmount[_borrower],
            totalBorrowedAmount[_borrower] - totalRepaidAmount[_borrower]
        );
    }

    function approveLoan(uint256 _loanId) external onlyOwner loanExists(_loanId) {
        require(loans[_loanId].status == LoanStatus.Requested, "Loan must be in requested status");
        loans[_loanId].status = LoanStatus.Approved;
        emit LoanApproved(_loanId);
    }

    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}