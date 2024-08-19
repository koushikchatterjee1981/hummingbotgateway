//import { Ethereumish } from "../../services/common-interfaces";
import { MinSwap } from './minswap';
import { ConfigManagerV2 } from '../../services/config-manager-v2';
//import { AvailableNetworks } from '../../services/config-manager-types';
import {
  PriceRequest,
  PriceResponse,
  TradeRequest,
  TradeResponse,
  AddLiquidityRequest,
  AddLiquidityResponse,
  RemoveLiquidityRequest,
  RemoveLiquidityResponse,
} from '../../amm/amm.requests';
import Decimal from 'decimal.js-light';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import {
  ADA,
  Asset,
  calculateWithdraw,
  calculateDeposit,
  BlockfrostAdapter,
  calculateSwapExactIn,
  Dex,
  NetworkId,
  PoolV1,
} from '@minswap/sdk';

//import {Slippage } from "@minswap/sdk/utils/slippage.internal";
//import invariant from "@minswap/tiny-invariant";
//import BigNumber from "bignumber.js";
import {
  Address,
  Blockfrost,
  Constr,
  Data,
  Lucid,
  Network,
  TxComplete,
  UTxO,
} from 'lucid-cardano';

interface InitialResponse {
    network:Network
    ttl:string,
    slippage:string,
    blockfrostUrl:string,
    blockfrostProjectId:string,
    poolId:string,
    blockfrostAdapterInstance:BlockfrostAdapter,
    address:string,
    lucid:Lucid
};


async function initializePrice(req: PriceRequest): Promise<InitialResponse>{
  const reqNetwork = req.network;
  //let blockAdapternetwork = "preprod";
  let network: Network = "Preprod";
  let networkId=0;
  if(reqNetwork=="mainnet"){
    networkId=1;
    network="Mainnet";
    //blockAdapternetwork="mainnet";
  }
  const ttl =  ConfigManagerV2.getInstance().get("cardano.ttl");
  const slippage = ConfigManagerV2.getInstance().get("cardano.allowedSlippage"); 
  const blockfrostUrl = ConfigManagerV2.getInstance().get(`cardano.contractAddresses.${reqNetwork}.apiurl`);
  const blockfrostProjectId = ConfigManagerV2.getInstance().get("cardano.blockfrostProjectId");
  
  let poolId = ConfigManagerV2.getInstance().get("cardano.defaultPoolId");
  if(req.poolId){
    poolId= req.poolId;
  }
  
  ;//'preprodfGRaDPrVu6DhhHSNm5w8kzIkQghi2RYR';
  //const blockfrostUrl = 'https://cardano-preprod.blockfrost.io/api/v0';
 /* const address =
    'addr1qxw0m0mcyvpnkq3atvxm5l9w3uzwt7pqh0djakcqypknt5xum2ypkuc5snqju55m8mkjywxlwrt2v5e6yvcsymjxuxxs5d4gqc';
  const poolId =req.poolId;
    //'3bb0079303c57812462dec9de8fb867cef8fd3768de7f12c77f6f0dd80381d0d';*/
  

  
  let blockfrostAdapterInstance = new BlockfrostAdapter({
    networkId: networkId,//NetworkId.TESTNET,
    blockFrost: new BlockFrostAPI({
      projectId: blockfrostProjectId,
      network: "preprod",
    }),
  });

  if(network=="Mainnet"){
    blockfrostAdapterInstance = new BlockfrostAdapter({
      networkId: networkId,//NetworkId.TESTNET,
      blockFrost: new BlockFrostAPI({
        projectId: blockfrostProjectId,
        network: "mainnet",
      }),
    });
  }

  let address = ConfigManagerV2.getInstance().get("cardano.defaultAddress");

  
  const lucid = await getBackendLucidInstance(
    network,
    blockfrostProjectId,
    blockfrostUrl,
    address,
  );

  return{
    network,
    ttl,
    slippage,
    blockfrostUrl,
    blockfrostProjectId,
    poolId,
    blockfrostAdapterInstance,
    address,
    lucid
  };
}


async function initializeTrade(req: TradeRequest): Promise<InitialResponse>{
  const reqNetwork = req.network;
  //let blockAdapternetwork = "preprod";
  let network: Network = "Preprod";
  let networkId=0;
  if(reqNetwork=="mainnet"){
    networkId=1;
    network="Mainnet";
    //blockAdapternetwork="mainnet";
  }
  const ttl =  ConfigManagerV2.getInstance().get("cardano.ttl");
  const slippage = ConfigManagerV2.getInstance().get("cardano.allowedSlippage"); 
  const blockfrostUrl = ConfigManagerV2.getInstance().get(`cardano.contractAddresses.${reqNetwork}.apiurl`);
  const blockfrostProjectId = ConfigManagerV2.getInstance().get("cardano.blockfrostProjectId");
  
  let poolId = ConfigManagerV2.getInstance().get("cardano.defaultPoolId");
  if(req.poolId){
    poolId= req.poolId;
  }
  
  ;//'preprodfGRaDPrVu6DhhHSNm5w8kzIkQghi2RYR';
  //const blockfrostUrl = 'https://cardano-preprod.blockfrost.io/api/v0';
 /* const address =
    'addr1qxw0m0mcyvpnkq3atvxm5l9w3uzwt7pqh0djakcqypknt5xum2ypkuc5snqju55m8mkjywxlwrt2v5e6yvcsymjxuxxs5d4gqc';
  const poolId =req.poolId;
    //'3bb0079303c57812462dec9de8fb867cef8fd3768de7f12c77f6f0dd80381d0d';*/
  

  
  let blockfrostAdapterInstance = new BlockfrostAdapter({
    networkId: networkId,//NetworkId.TESTNET,
    blockFrost: new BlockFrostAPI({
      projectId: blockfrostProjectId,
      network: "preprod",
    }),
  });

  if(network=="Mainnet"){
    blockfrostAdapterInstance = new BlockfrostAdapter({
      networkId: networkId,//NetworkId.TESTNET,
      blockFrost: new BlockFrostAPI({
        projectId: blockfrostProjectId,
        network: "mainnet",
      }),
    });
  }

  let address = req.address;

  
  const lucid = await getBackendLucidInstance(
    network,
    blockfrostProjectId,
    blockfrostUrl,
    address,
  );

  return{
    network,
    ttl,
    slippage,
    blockfrostUrl,
    blockfrostProjectId,
    poolId,
    blockfrostAdapterInstance,
    address,
    lucid
  };
}

export async function price(
  minSwap: MinSwap,
  req: PriceRequest,
): Promise<PriceResponse> {
  const startTimestamp: number = Date.now();
  console.log(
    'MY connector MinSwap is reached---------------',
    minSwap,
    BlockfrostAdapter,
    NetworkId,
  );

  const initialValue = await initializePrice(req);
  
  

 // console.log('initialValue : ', initialValue.ttl);

    const api = initialValue.blockfrostAdapterInstance;

    const poolidentifier = initialValue.poolId;
  const returnedPool = await getPoolById(initialValue.network, api, poolidentifier);

  
  //console.log("cardano yml found:::", ConfigManagerV2.getInstance().getNamespace("cardano") );
  
 
console.log("ttl:::::",initialValue.ttl);
  console.log(returnedPool.poolState);

  const [a, b] = await api.getV1PoolPrice({ pool: returnedPool.poolState });
  console.log(`ADA/MIN price: ${a.toString()}; MIN/ADA price: ${b.toString()}`);

  return {
    network: req.network,
    timestamp: startTimestamp,
    latency: latency(startTimestamp, Date.now()),
    base: req.base,
    quote: req.quote,
    amount: new Decimal(req.amount).toFixed(2),
    rawAmount: new Decimal(req.amount).toFixed(2).replace('.', ''),
    expectedAmount: new Decimal(b.toString()).toFixed(2),
    price: new Decimal(b.toString()).toFixed(2),
    gasPrice: 0,
    gasPriceToken: "gasPriceToken", 
    gasLimit: 0, 
    gasCost:"n/a"
  };
}

export async function trade(
  minSwap: MinSwap,
  req: TradeRequest,
): Promise<TradeResponse> {
  const startTimestamp: number = Date.now();
  console.log(
    'MY connector MinSwap is reached for trade---------------',
    minSwap,
    BlockfrostAdapter,
    NetworkId,
  );
 
  const YOUR_PRIVATE_KEY="";
 
  const initialTradeVal = await initializeTrade(req);

  const utxos = await initialTradeVal.lucid.utxosAt(req.address);

  const api = initialTradeVal.blockfrostAdapterInstance;

  const txComplete = await swapExactInTx(initialTradeVal.network, initialTradeVal.lucid, api, req.address,initialTradeVal.poolId, utxos,req,initialTradeVal);

  console.log('swapTransaction::::', txComplete);
  
  const signedTx = await txComplete
    .signWithPrivateKey(YOUR_PRIVATE_KEY)
    .complete();
  const txId = await signedTx.submit();
  // eslint-disable-next-line no-console
  console.info(`Transaction submitted successfully: ${txId}`);

  
  return {
    network: req.network,
    timestamp: startTimestamp,
    latency: latency(startTimestamp, Date.now()),
    base: req.base,
    quote: req.quote,
    amount: new Decimal(req.amount).toFixed(2),
    rawAmount: new Decimal(req.amount).toFixed(2),
    expectedIn: new Decimal(req.amount).toFixed(2),
    price: new Decimal(req.amount).toFixed(2),
    gasPrice: txComplete.fee,
    gasPriceToken: '',
    gasLimit: 0,
    gasCost: '',
    nonce: Math.random(),
    txHash: txId,
  };
}

export async function removeLiquidity(
  req: RemoveLiquidityRequest,
): Promise<RemoveLiquidityResponse> {
  

  const startTimestamp: number = Date.now();
  const YOUR_PRIVATE_KEY="";
  const reqNetwork = req.network;
  //let blockAdapternetwork = "preprod";
  let network: Network = "Preprod";
  let networkId=0;
  if(reqNetwork=="mainnet"){
    networkId=1;
    network="Mainnet";
    //blockAdapternetwork="mainnet";
  }
  //const ttl =  ConfigManagerV2.getInstance().get("cardano.ttl");
  const slippage = ConfigManagerV2.getInstance().get("cardano.allowedSlippage"); 
  const blockfrostUrl = ConfigManagerV2.getInstance().get(`cardano.contractAddresses.${reqNetwork}.apiurl`);
  const blockfrostProjectId = ConfigManagerV2.getInstance().get("cardano.blockfrostProjectId");
  
  let blockfrostAdapterInstance = new BlockfrostAdapter({
    networkId: networkId,//NetworkId.TESTNET,
    blockFrost: new BlockFrostAPI({
      projectId: blockfrostProjectId,
      network: "preprod",
    }),
  });

  if(network=="Mainnet"){
    blockfrostAdapterInstance = new BlockfrostAdapter({
      networkId: networkId,//NetworkId.TESTNET,
      blockFrost: new BlockFrostAPI({
        projectId: blockfrostProjectId,
        network: "mainnet",
      }),
    });
  }

  const lucid = await getBackendLucidInstance(
    network,
    blockfrostProjectId,
    blockfrostUrl,
    req.address,
  );

  console.log('lucid : ', lucid);

  const utxos = await lucid.utxosAt(req.address);

 // const txComplete = await depositTx(network, lucid, blockfrostAdapterInstance, req.address, utxos, req, slippage);

  //console.log('depositTx::::', txComplete);

  const txComplete = await withdrawTx(network, lucid, blockfrostAdapterInstance, req.address, utxos, req, slippage);

  console.log('depositTx::::', txComplete);

  const signedTx = await txComplete
    .signWithPrivateKey(YOUR_PRIVATE_KEY)
    .complete();
  const txId = await signedTx.submit();
  // eslint-disable-next-line no-console
  console.info(`Transaction submitted successfully: ${txId}`);

  return {
    network: req.chain,
    timestamp: startTimestamp,
    latency: latency(startTimestamp, Date.now()),
    tokenId: req.tokenId,
    gasPrice: 0.001,
    gasPriceToken: 'gasPriceToken',
    gasLimit: 0.01,
    gasCost: 'gasCost',
    nonce: Math.random(),
    txHash: 'txHash',
  };
}

export async function addLiquidity(
  req: AddLiquidityRequest,
): Promise<AddLiquidityResponse> {
  const startTimestamp: number = Date.now();
  const YOUR_PRIVATE_KEY="";
  const reqNetwork = req.network;
  //let blockAdapternetwork = "preprod";
  let network: Network = "Preprod";
  let networkId=0;
  if(reqNetwork=="mainnet"){
    networkId=1;
    network="Mainnet";
    //blockAdapternetwork="mainnet";
  }
  //const ttl =  ConfigManagerV2.getInstance().get("cardano.ttl");
  const slippage = ConfigManagerV2.getInstance().get("cardano.allowedSlippage"); 
  const blockfrostUrl = ConfigManagerV2.getInstance().get(`cardano.contractAddresses.${reqNetwork}.apiurl`);
  const blockfrostProjectId = ConfigManagerV2.getInstance().get("cardano.blockfrostProjectId");
  
  let blockfrostAdapterInstance = new BlockfrostAdapter({
    networkId: networkId,//NetworkId.TESTNET,
    blockFrost: new BlockFrostAPI({
      projectId: blockfrostProjectId,
      network: "preprod",
    }),
  });

  if(network=="Mainnet"){
    blockfrostAdapterInstance = new BlockfrostAdapter({
      networkId: networkId,//NetworkId.TESTNET,
      blockFrost: new BlockFrostAPI({
        projectId: blockfrostProjectId,
        network: "mainnet",
      }),
    });
  }

  const lucid = await getBackendLucidInstance(
    network,
    blockfrostProjectId,
    blockfrostUrl,
    req.address,
  );

  console.log('lucid : ', lucid);

  const utxos = await lucid.utxosAt(req.address);

  const txComplete = await depositTx(network, lucid, blockfrostAdapterInstance, req.address, utxos, req, slippage);

  console.log('depositTx::::', txComplete);

  const signedTx = await txComplete
    .signWithPrivateKey(YOUR_PRIVATE_KEY)
    .complete();
  const txId = await signedTx.submit();
  // eslint-disable-next-line no-console
  console.info(`Transaction submitted successfully: ${txId}`);

  return {
    network: req.chain,
    timestamp: startTimestamp,
    latency: latency(startTimestamp, Date.now()),
    token0: req.token0,
    token1: req.token1,
    fee: req.fee!,
    tokenId: req.tokenId ? req.tokenId : 0,
    gasPrice: 0,
    gasPriceToken: 'gasPriceToken',
    gasLimit: 0,
    gasCost: 'gasCost',
    nonce: Math.random(),
    txHash: txId,
  };
}
export const latency = (startTime: number, endTime: number): number => {
  return (endTime - startTime) / 1000;
};

async function getBackendLucidInstance(
  network: Network,
  projectId: string,
  blockfrostUrl: string,
  address: Address,
): Promise<Lucid> {
  const provider = new Blockfrost(blockfrostUrl, projectId);
  const lucid = await Lucid.new(provider, network);
  lucid.selectWalletFrom({
    address: address,
  });
  return lucid;
}
async function getPoolById(
  network: Network,
  blockfrostAdapter: BlockfrostAdapter,
  poolId: string,
): Promise<{ poolState: PoolV1.State; poolDatum: PoolV1.Datum }> {
  const pool = await blockfrostAdapter.getV1PoolById({
    id: poolId,
  });
  if (!pool) {
    throw new Error(`Not found PoolState of ID: ${poolId}`);
  }

  const rawRoolDatum = await blockfrostAdapter.getDatumByDatumHash(
    pool.datumHash,
  );
  const poolDatum = PoolV1.Datum.fromPlutusData(
    network === 'Mainnet' ? NetworkId.MAINNET : NetworkId.TESTNET,
    Data.from(rawRoolDatum) as Constr<Data>,
  );
  return {
    poolState: pool,
    poolDatum: poolDatum,
  };
}

async function swapExactInTx(
  network: Network,
  lucid: Lucid,
  blockfrostAdapter: BlockfrostAdapter,
  address: Address,
  poolId : string,
  availableUtxos: UTxO[],
  req:TradeRequest,
  initialTradeVal:InitialResponse,
): Promise<TxComplete> {
  const { poolState, poolDatum } = await getPoolById(
    network,
    blockfrostAdapter,
    poolId,
  );

  const swapAmountADA = BigInt(req.amount);

  const { amountOut } = calculateSwapExactIn({
    amountIn: swapAmountADA,
    reserveIn: poolState.reserveA,
    reserveOut: poolState.reserveB,
  });

  // Because pool is always fluctuating, so you should determine the impact of amount which you will receive
  const slippageTolerance = BigInt(initialTradeVal.slippage);
  const acceptedAmount =
    (amountOut * (BigInt(100) - slippageTolerance)) / BigInt(100);

  const dex = new Dex(lucid);

  if(req.side=="BUY"){
    return await dex.buildSwapExactInTx({
      amountIn: swapAmountADA,
      assetIn: ADA,
      assetOut: poolDatum.assetB,
      minimumAmountOut: acceptedAmount,
      isLimitOrder: false,
      sender: address,
      availableUtxos: availableUtxos,
    });
  }else{
    return await dex.buildSwapExactInTx({
      amountIn: swapAmountADA,
      assetIn: poolDatum.assetB,
      assetOut: ADA,
      minimumAmountOut: acceptedAmount,
      isLimitOrder: false,
      sender: address,
      availableUtxos: availableUtxos,
    });
  }
  
  
}

async function depositTx(
  network: Network,
  lucid: Lucid,
  blockfrostAdapter: BlockfrostAdapter,
  address: Address,
  availableUtxos: UTxO[],
  req: AddLiquidityRequest,
  slippage : number,
): Promise<TxComplete> {
  // ID of ADA-MIN Pool on Testnet Preprod

 // let reqPoolId = req.poolId;

  let reqPoolId = ConfigManagerV2.getInstance().get("cardano.defaultPoolId");
  if(req.poolId){
    reqPoolId= req.poolId;
  }
  const { poolState, poolDatum } = await getPoolById(
    network,
    blockfrostAdapter,
    reqPoolId,
  );

  const depositedAmountA = BigInt(req.token0);
  const depositedAmountB = BigInt(req.token1);

  const { necessaryAmountA, necessaryAmountB, lpAmount } = calculateDeposit({
    depositedAmountA: depositedAmountA,
    depositedAmountB: depositedAmountB,
    reserveA: poolState.reserveA,
    reserveB: poolState.reserveB,
    totalLiquidity: poolDatum.totalLiquidity,
  });

  // Because pool is always fluctuating, so you should determine the impact of amount which you will receive
  const slippageTolerance = BigInt(slippage);
  const acceptedLPAmount =
    (lpAmount * (BigInt(100) - slippageTolerance)) / BigInt(100);

  const dex = new Dex(lucid);
  return await dex.buildDepositTx({
    amountA: necessaryAmountA,
    amountB: necessaryAmountB,
    assetA: poolDatum.assetA,
    assetB: poolDatum.assetB,
    sender: address,
    minimumLPReceived: acceptedLPAmount,
    availableUtxos: availableUtxos,
  });
}


async function withdrawTx(
  network: Network,
  lucid: Lucid,
  blockfrostAdapter: BlockfrostAdapter,
  address: Address,
  availableUtxos: UTxO[],
  req: RemoveLiquidityRequest,
  slippage : number,
): Promise<TxComplete> {
  // ID of ADA-MIN Pool on Testnet Preprod

  let reqPoolId = ConfigManagerV2.getInstance().get("cardano.defaultPoolId");
  if(req.tokenId){
    reqPoolId= req.tokenId;
  }
  const { poolState, poolDatum } = await getPoolById(
    network,
    blockfrostAdapter,
    reqPoolId,
  );

  const lpAsset = Asset.fromString(poolState.assetLP);
  const withdrawalAmount =
    BigInt(1); //this is the amount you want to withdraw---

  const { amountAReceive, amountBReceive } = calculateWithdraw({
    withdrawalLPAmount: withdrawalAmount,
    reserveA: poolState.reserveA,
    reserveB: poolState.reserveB,
    totalLiquidity: poolDatum.totalLiquidity,
  });

  // Because pool is always fluctuating, so you should determine the impact of amount which you will receive
  const slippageTolerance = BigInt(slippage);
  const acceptedAmountAReceive =
    (amountAReceive * (BigInt(100) - slippageTolerance)) / BigInt(100);
  const acceptedAmountBReceive =
    (amountBReceive * (BigInt(100) - slippageTolerance)) / BigInt(100);

  const dex = new Dex(lucid);
  return await dex.buildWithdrawTx({
    lpAsset: lpAsset,
    lpAmount: withdrawalAmount,
    sender: address,
    minimumAssetAReceived: acceptedAmountAReceive,
    minimumAssetBReceived: acceptedAmountBReceive,
    availableUtxos: availableUtxos,
  });
}
