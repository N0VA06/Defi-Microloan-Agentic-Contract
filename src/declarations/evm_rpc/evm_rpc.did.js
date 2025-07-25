export const idlFactory = ({ IDL }) => {
  const Regex = IDL.Text;
  const LogFilter = IDL.Variant({
    'ShowAll' : IDL.Null,
    'HideAll' : IDL.Null,
    'ShowPattern' : Regex,
    'HidePattern' : Regex,
  });
  const RegexSubstitution = IDL.Record({
    'pattern' : Regex,
    'replacement' : IDL.Text,
  });
  const OverrideProvider = IDL.Record({
    'overrideUrl' : IDL.Opt(RegexSubstitution),
  });
  const InstallArgs = IDL.Record({
    'logFilter' : IDL.Opt(LogFilter),
    'demo' : IDL.Opt(IDL.Bool),
    'manageApiKeys' : IDL.Opt(IDL.Vec(IDL.Principal)),
    'overrideProvider' : IDL.Opt(OverrideProvider),
    'nodesInSubnet' : IDL.Opt(IDL.Nat32),
  });
  const EthSepoliaService = IDL.Variant({
    'Alchemy' : IDL.Null,
    'BlockPi' : IDL.Null,
    'PublicNode' : IDL.Null,
    'Ankr' : IDL.Null,
    'Sepolia' : IDL.Null,
  });
  const L2MainnetService = IDL.Variant({
    'Alchemy' : IDL.Null,
    'Llama' : IDL.Null,
    'BlockPi' : IDL.Null,
    'PublicNode' : IDL.Null,
    'Ankr' : IDL.Null,
  });
  const ChainId = IDL.Nat64;
  const HttpHeader = IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text });
  const RpcApi = IDL.Record({
    'url' : IDL.Text,
    'headers' : IDL.Opt(IDL.Vec(HttpHeader)),
  });
  const EthMainnetService = IDL.Variant({
    'Alchemy' : IDL.Null,
    'Llama' : IDL.Null,
    'BlockPi' : IDL.Null,
    'Cloudflare' : IDL.Null,
    'PublicNode' : IDL.Null,
    'Ankr' : IDL.Null,
  });
  const RpcServices = IDL.Variant({
    'EthSepolia' : IDL.Opt(IDL.Vec(EthSepoliaService)),
    'BaseMainnet' : IDL.Opt(IDL.Vec(L2MainnetService)),
    'Custom' : IDL.Record({
      'chainId' : ChainId,
      'services' : IDL.Vec(RpcApi),
    }),
    'OptimismMainnet' : IDL.Opt(IDL.Vec(L2MainnetService)),
    'ArbitrumOne' : IDL.Opt(IDL.Vec(L2MainnetService)),
    'EthMainnet' : IDL.Opt(IDL.Vec(EthMainnetService)),
  });
  const ConsensusStrategy = IDL.Variant({
    'Equality' : IDL.Null,
    'Threshold' : IDL.Record({ 'min' : IDL.Nat8, 'total' : IDL.Opt(IDL.Nat8) }),
  });
  const RpcConfig = IDL.Record({
    'responseConsensus' : IDL.Opt(ConsensusStrategy),
    'responseSizeEstimate' : IDL.Opt(IDL.Nat64),
  });
  const AccessListEntry = IDL.Record({
    'storageKeys' : IDL.Vec(IDL.Text),
    'address' : IDL.Text,
  });
  const TransactionRequest = IDL.Record({
    'to' : IDL.Opt(IDL.Text),
    'gas' : IDL.Opt(IDL.Nat),
    'maxFeePerGas' : IDL.Opt(IDL.Nat),
    'gasPrice' : IDL.Opt(IDL.Nat),
    'value' : IDL.Opt(IDL.Nat),
    'maxFeePerBlobGas' : IDL.Opt(IDL.Nat),
    'from' : IDL.Opt(IDL.Text),
    'type' : IDL.Opt(IDL.Text),
    'accessList' : IDL.Opt(IDL.Vec(AccessListEntry)),
    'nonce' : IDL.Opt(IDL.Nat),
    'maxPriorityFeePerGas' : IDL.Opt(IDL.Nat),
    'blobs' : IDL.Opt(IDL.Vec(IDL.Text)),
    'input' : IDL.Opt(IDL.Text),
    'chainId' : IDL.Opt(IDL.Nat),
    'blobVersionedHashes' : IDL.Opt(IDL.Vec(IDL.Text)),
  });
  const BlockTag = IDL.Variant({
    'Earliest' : IDL.Null,
    'Safe' : IDL.Null,
    'Finalized' : IDL.Null,
    'Latest' : IDL.Null,
    'Number' : IDL.Nat,
    'Pending' : IDL.Null,
  });
  const CallArgs = IDL.Record({
    'transaction' : TransactionRequest,
    'block' : IDL.Opt(BlockTag),
  });
  const JsonRpcError = IDL.Record({ 'code' : IDL.Int64, 'message' : IDL.Text });
  const ProviderError = IDL.Variant({
    'TooFewCycles' : IDL.Record({ 'expected' : IDL.Nat, 'received' : IDL.Nat }),
    'InvalidRpcConfig' : IDL.Text,
    'MissingRequiredProvider' : IDL.Null,
    'ProviderNotFound' : IDL.Null,
    'NoPermission' : IDL.Null,
  });
  const ValidationError = IDL.Variant({
    'Custom' : IDL.Text,
    'InvalidHex' : IDL.Text,
  });
  const RejectionCode = IDL.Variant({
    'NoError' : IDL.Null,
    'CanisterError' : IDL.Null,
    'SysTransient' : IDL.Null,
    'DestinationInvalid' : IDL.Null,
    'Unknown' : IDL.Null,
    'SysFatal' : IDL.Null,
    'CanisterReject' : IDL.Null,
  });
  const HttpOutcallError = IDL.Variant({
    'IcError' : IDL.Record({ 'code' : RejectionCode, 'message' : IDL.Text }),
    'InvalidHttpJsonRpcResponse' : IDL.Record({
      'status' : IDL.Nat16,
      'body' : IDL.Text,
      'parsingError' : IDL.Opt(IDL.Text),
    }),
  });
  const RpcError = IDL.Variant({
    'JsonRpcError' : JsonRpcError,
    'ProviderError' : ProviderError,
    'ValidationError' : ValidationError,
    'HttpOutcallError' : HttpOutcallError,
  });
  const CallResult = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : RpcError });
  const ProviderId = IDL.Nat64;
  const RpcService = IDL.Variant({
    'EthSepolia' : EthSepoliaService,
    'BaseMainnet' : L2MainnetService,
    'Custom' : RpcApi,
    'OptimismMainnet' : L2MainnetService,
    'ArbitrumOne' : L2MainnetService,
    'EthMainnet' : EthMainnetService,
    'Provider' : ProviderId,
  });
  const MultiCallResult = IDL.Variant({
    'Consistent' : CallResult,
    'Inconsistent' : IDL.Vec(IDL.Tuple(RpcService, CallResult)),
  });
  const FeeHistoryArgs = IDL.Record({
    'blockCount' : IDL.Nat,
    'newestBlock' : BlockTag,
    'rewardPercentiles' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const FeeHistory = IDL.Record({
    'reward' : IDL.Vec(IDL.Vec(IDL.Nat)),
    'gasUsedRatio' : IDL.Vec(IDL.Float64),
    'oldestBlock' : IDL.Nat,
    'baseFeePerGas' : IDL.Vec(IDL.Nat),
  });
  const FeeHistoryResult = IDL.Variant({ 'Ok' : FeeHistory, 'Err' : RpcError });
  const MultiFeeHistoryResult = IDL.Variant({
    'Consistent' : FeeHistoryResult,
    'Inconsistent' : IDL.Vec(IDL.Tuple(RpcService, FeeHistoryResult)),
  });
  const Block = IDL.Record({
    'miner' : IDL.Text,
    'totalDifficulty' : IDL.Opt(IDL.Nat),
    'receiptsRoot' : IDL.Text,
    'stateRoot' : IDL.Text,
    'hash' : IDL.Text,
    'difficulty' : IDL.Opt(IDL.Nat),
    'size' : IDL.Nat,
    'uncles' : IDL.Vec(IDL.Text),
    'baseFeePerGas' : IDL.Opt(IDL.Nat),
    'extraData' : IDL.Text,
    'transactionsRoot' : IDL.Opt(IDL.Text),
    'sha3Uncles' : IDL.Text,
    'nonce' : IDL.Nat,
    'number' : IDL.Nat,
    'timestamp' : IDL.Nat,
    'transactions' : IDL.Vec(IDL.Text),
    'gasLimit' : IDL.Nat,
    'logsBloom' : IDL.Text,
    'parentHash' : IDL.Text,
    'gasUsed' : IDL.Nat,
    'mixHash' : IDL.Text,
  });
  const GetBlockByNumberResult = IDL.Variant({
    'Ok' : Block,
    'Err' : RpcError,
  });
  const MultiGetBlockByNumberResult = IDL.Variant({
    'Consistent' : GetBlockByNumberResult,
    'Inconsistent' : IDL.Vec(IDL.Tuple(RpcService, GetBlockByNumberResult)),
  });
  const GetLogsRpcConfig = IDL.Record({
    'responseConsensus' : IDL.Opt(ConsensusStrategy),
    'maxBlockRange' : IDL.Opt(IDL.Nat32),
    'responseSizeEstimate' : IDL.Opt(IDL.Nat64),
  });
  const Topic = IDL.Vec(IDL.Text);
  const GetLogsArgs = IDL.Record({
    'fromBlock' : IDL.Opt(BlockTag),
    'toBlock' : IDL.Opt(BlockTag),
    'addresses' : IDL.Vec(IDL.Text),
    'topics' : IDL.Opt(IDL.Vec(Topic)),
  });
  const LogEntry = IDL.Record({
    'transactionHash' : IDL.Opt(IDL.Text),
    'blockNumber' : IDL.Opt(IDL.Nat),
    'data' : IDL.Text,
    'blockHash' : IDL.Opt(IDL.Text),
    'transactionIndex' : IDL.Opt(IDL.Nat),
    'topics' : IDL.Vec(IDL.Text),
    'address' : IDL.Text,
    'logIndex' : IDL.Opt(IDL.Nat),
    'removed' : IDL.Bool,
  });
  const GetLogsResult = IDL.Variant({
    'Ok' : IDL.Vec(LogEntry),
    'Err' : RpcError,
  });
  const MultiGetLogsResult = IDL.Variant({
    'Consistent' : GetLogsResult,
    'Inconsistent' : IDL.Vec(IDL.Tuple(RpcService, GetLogsResult)),
  });
  const GetTransactionCountArgs = IDL.Record({
    'address' : IDL.Text,
    'block' : BlockTag,
  });
  const GetTransactionCountResult = IDL.Variant({
    'Ok' : IDL.Nat,
    'Err' : RpcError,
  });
  const MultiGetTransactionCountResult = IDL.Variant({
    'Consistent' : GetTransactionCountResult,
    'Inconsistent' : IDL.Vec(IDL.Tuple(RpcService, GetTransactionCountResult)),
  });
  const TransactionReceipt = IDL.Record({
    'to' : IDL.Opt(IDL.Text),
    'status' : IDL.Opt(IDL.Nat),
    'transactionHash' : IDL.Text,
    'blockNumber' : IDL.Nat,
    'from' : IDL.Text,
    'logs' : IDL.Vec(LogEntry),
    'blockHash' : IDL.Text,
    'type' : IDL.Text,
    'transactionIndex' : IDL.Nat,
    'effectiveGasPrice' : IDL.Nat,
    'logsBloom' : IDL.Text,
    'contractAddress' : IDL.Opt(IDL.Text),
    'gasUsed' : IDL.Nat,
  });
  const GetTransactionReceiptResult = IDL.Variant({
    'Ok' : IDL.Opt(TransactionReceipt),
    'Err' : RpcError,
  });
  const MultiGetTransactionReceiptResult = IDL.Variant({
    'Consistent' : GetTransactionReceiptResult,
    'Inconsistent' : IDL.Vec(
      IDL.Tuple(RpcService, GetTransactionReceiptResult)
    ),
  });
  const SendRawTransactionStatus = IDL.Variant({
    'Ok' : IDL.Opt(IDL.Text),
    'NonceTooLow' : IDL.Null,
    'NonceTooHigh' : IDL.Null,
    'InsufficientFunds' : IDL.Null,
  });
  const SendRawTransactionResult = IDL.Variant({
    'Ok' : SendRawTransactionStatus,
    'Err' : RpcError,
  });
  const MultiSendRawTransactionResult = IDL.Variant({
    'Consistent' : SendRawTransactionResult,
    'Inconsistent' : IDL.Vec(IDL.Tuple(RpcService, SendRawTransactionResult)),
  });
  const Metrics = IDL.Record({
    'responses' : IDL.Vec(
      IDL.Tuple(IDL.Tuple(IDL.Text, IDL.Text, IDL.Text), IDL.Nat64)
    ),
    'inconsistentResponses' : IDL.Vec(
      IDL.Tuple(IDL.Tuple(IDL.Text, IDL.Text), IDL.Nat64)
    ),
    'cyclesCharged' : IDL.Vec(
      IDL.Tuple(IDL.Tuple(IDL.Text, IDL.Text), IDL.Nat)
    ),
    'requests' : IDL.Vec(IDL.Tuple(IDL.Tuple(IDL.Text, IDL.Text), IDL.Nat64)),
    'errHttpOutcall' : IDL.Vec(
      IDL.Tuple(IDL.Tuple(IDL.Text, IDL.Text, RejectionCode), IDL.Nat64)
    ),
  });
  const RpcAuth = IDL.Variant({
    'BearerToken' : IDL.Record({ 'url' : IDL.Text }),
    'UrlParameter' : IDL.Record({ 'urlPattern' : IDL.Text }),
  });
  const RpcAccess = IDL.Variant({
    'Authenticated' : IDL.Record({
      'publicUrl' : IDL.Opt(IDL.Text),
      'auth' : RpcAuth,
    }),
    'Unauthenticated' : IDL.Record({ 'publicUrl' : IDL.Text }),
  });
  const Provider = IDL.Record({
    'access' : RpcAccess,
    'alias' : IDL.Opt(RpcService),
    'chainId' : ChainId,
    'providerId' : ProviderId,
  });
  const RequestResult = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : RpcError });
  const RequestCostResult = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : RpcError });
  return IDL.Service({
    'eth_call' : IDL.Func(
        [RpcServices, IDL.Opt(RpcConfig), CallArgs],
        [MultiCallResult],
        [],
      ),
    'eth_feeHistory' : IDL.Func(
        [RpcServices, IDL.Opt(RpcConfig), FeeHistoryArgs],
        [MultiFeeHistoryResult],
        [],
      ),
    'eth_getBlockByNumber' : IDL.Func(
        [RpcServices, IDL.Opt(RpcConfig), BlockTag],
        [MultiGetBlockByNumberResult],
        [],
      ),
    'eth_getLogs' : IDL.Func(
        [RpcServices, IDL.Opt(GetLogsRpcConfig), GetLogsArgs],
        [MultiGetLogsResult],
        [],
      ),
    'eth_getTransactionCount' : IDL.Func(
        [RpcServices, IDL.Opt(RpcConfig), GetTransactionCountArgs],
        [MultiGetTransactionCountResult],
        [],
      ),
    'eth_getTransactionReceipt' : IDL.Func(
        [RpcServices, IDL.Opt(RpcConfig), IDL.Text],
        [MultiGetTransactionReceiptResult],
        [],
      ),
    'eth_sendRawTransaction' : IDL.Func(
        [RpcServices, IDL.Opt(RpcConfig), IDL.Text],
        [MultiSendRawTransactionResult],
        [],
      ),
    'getMetrics' : IDL.Func([], [Metrics], ['query']),
    'getNodesInSubnet' : IDL.Func([], [IDL.Nat32], ['query']),
    'getProviders' : IDL.Func([], [IDL.Vec(Provider)], ['query']),
    'getServiceProviderMap' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(RpcService, ProviderId))],
        ['query'],
      ),
    'request' : IDL.Func(
        [RpcService, IDL.Text, IDL.Nat64],
        [RequestResult],
        [],
      ),
    'requestCost' : IDL.Func(
        [RpcService, IDL.Text, IDL.Nat64],
        [RequestCostResult],
        ['query'],
      ),
    'updateApiKeys' : IDL.Func(
        [IDL.Vec(IDL.Tuple(ProviderId, IDL.Opt(IDL.Text)))],
        [],
        [],
      ),
  });
};
export const init = ({ IDL }) => {
  const Regex = IDL.Text;
  const LogFilter = IDL.Variant({
    'ShowAll' : IDL.Null,
    'HideAll' : IDL.Null,
    'ShowPattern' : Regex,
    'HidePattern' : Regex,
  });
  const RegexSubstitution = IDL.Record({
    'pattern' : Regex,
    'replacement' : IDL.Text,
  });
  const OverrideProvider = IDL.Record({
    'overrideUrl' : IDL.Opt(RegexSubstitution),
  });
  const InstallArgs = IDL.Record({
    'logFilter' : IDL.Opt(LogFilter),
    'demo' : IDL.Opt(IDL.Bool),
    'manageApiKeys' : IDL.Opt(IDL.Vec(IDL.Principal)),
    'overrideProvider' : IDL.Opt(OverrideProvider),
    'nodesInSubnet' : IDL.Opt(IDL.Nat32),
  });
  return [InstallArgs];
};
