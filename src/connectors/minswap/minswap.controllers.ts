//import { Cardanoish } from "../../services/common-interfaces";
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
  calculateSwapExactOut,
  Dex,
  DexV2,
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

interface InitialPriceResponse {
  network:Network
  ttl:string,
  slippage:string,
  blockfrostUrl:string,
  blockfrostProjectId:string,
  poolId:string,
  blockfrostAdapterInstance:BlockfrostAdapter
};


async function initializePrice(req: PriceRequest): Promise<InitialPriceResponse>{
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
  
  ;
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

  //let address = ConfigManagerV2.getInstance().get("cardano.defaultAddress");

  /*const lucid = await getBackendLucidInstance(
    network,
    blockfrostProjectId,
    blockfrostUrl,
    address,
  );*/

  return{
    network,
    ttl,
    slippage,
    blockfrostUrl,
    blockfrostProjectId,
    poolId,
    blockfrostAdapterInstance
    
    
  };
}


async function initializeTrade(req: TradeRequest): Promise<InitialResponse>{
  const reqNetwork = req.network;
  let network: Network = "Preprod";
  let networkId=0;
  if(reqNetwork=="mainnet"){
    networkId=1;
    network="Mainnet";
  }
  const ttl =  ConfigManagerV2.getInstance().get("cardano.ttl");
  const slippage = ConfigManagerV2.getInstance().get("cardano.allowedSlippage"); 
  const blockfrostUrl = ConfigManagerV2.getInstance().get(`cardano.contractAddresses.${reqNetwork}.apiurl`);
  const blockfrostProjectId = ConfigManagerV2.getInstance().get("cardano.blockfrostProjectId");
  
  let poolId = ConfigManagerV2.getInstance().get(`cardano.defaultPoolId.${reqNetwork}.poolId`);
  if(req.poolId){
    poolId= req.poolId;
  }  
  ;
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
 let seedphrase = "";
 if(req.seedPhrase){
  seedphrase = req.seedPhrase;
 }
  
  const lucid = await getBackendLucidInstance(
    network,
    blockfrostProjectId,
    blockfrostUrl,
    req.address,
    seedphrase
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


async function commitTransaction(txCompleteReq:TxComplete): Promise<string>{


  const signedTx = await txCompleteReq.sign().complete();
   
     console.log("signedTx:::",signedTx);
     
  const txId = await signedTx.submit();
  // eslint-disable-next-line no-console
  console.info(`Transaction submitted successfully: ${txId}`);
  return txId;
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

  /** here a is ADA/MIN and b is  MIN/ADA*/
 // console.log(`with 1 assetA(ADA) I will get assetB(MIN): ${b.toString()};`);
 // console.log(`with 1 assetB(MIN) I will get assetA(ADA): ${a.toString()};`);
  let reqType=req.side;
  let amountToSpend: number = Number(req.amount);
  let totalValue=0.0;
  let expectedAmount="";
  let conversionFactor=0.0;

 //a 0.04010113164210906381
//b 24.9369521270548956691
  
  if(reqType=="BUY"){
    let wantToBuy = req.base;
    let willspend = req.quote;
    console.log(wantToBuy,"----",willspend);
    /*

    //To BUY 5 base ADA,  calculate amount of quote MIN required
    quote=MIN
    base=ADA
    amount=5
    */

    if(willspend=="MIN" && wantToBuy=="ADA"){
      conversionFactor = Number(b);
    }else if(willspend=="ADA" && wantToBuy=="MIN"){
      conversionFactor = Number(a);
      /*

    //To BUY 5 base MIN,  calculate amount of quote ADA required
    quote=ADA
    base=MIN
    amount=5
    */
      
    }
    
  }else if(reqType=="SELL"){
    /*
    //When I sell 5 base ADA how many quote MIN can I get in return
    quote=MIN
    base=ADA
    amount=5
    I need to use b.toString as conversion factor
    */
   /*
    //When I sell 5 base MIN how many quote ADA can I get in return
    quote=ADA
    base=MIN
    amount=5
    I need to use a.toString as conversion factor
    */
    let wantToSell = req.base;
    let tokenReceive = req.quote;
    if(tokenReceive=="MIN" && wantToSell=="ADA"){
      conversionFactor = Number(b);
    }else if(tokenReceive=="ADA" && wantToSell=="MIN"){
      conversionFactor = Number(a);
    }

    totalValue = amountToSpend * conversionFactor;
    expectedAmount = totalValue.toFixed(2).replace('.', '');
    
  }

  return {
    network: req.network,
    timestamp: startTimestamp,
    latency: latency(startTimestamp, Date.now()),
    base: req.base,
    quote: req.quote,
    amount: new Decimal(req.amount).toFixed(2),
    rawAmount: expectedAmount,
    expectedAmount: expectedAmount,
    price: new Decimal(b.toString()).toFixed(2),
    gasPrice: 0,
    gasPriceToken: "n/a", 
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
 
  
  const initialTradeVal = await initializeTrade(req);
  const api = initialTradeVal.blockfrostAdapterInstance;
  let txnHash = "";

if(req.isCancelled && req.txnHash){
    txnHash = req.txnHash;
    const txnId = cancelTx(initialTradeVal.lucid, api,txnHash);
    return {
      network: req.network,
      timestamp: startTimestamp,
      latency: latency(startTimestamp, Date.now()),
      base: '',
      quote: '',
      amount: '',
      rawAmount: '',
      expectedIn: '',
      price: '',
      gasPrice: 0.0,
      gasPriceToken: 'n/a',
      gasLimit: 0,
      gasCost: '',
      nonce: Math.random(),
      txHash: txnId,
    };
}
  
  const utxos = await initialTradeVal.lucid.utxosAt(req.address);



  let txnId=""  ;
  if(req.side=="SELL"){
   txnId = await swapExactInTx(initialTradeVal.network, initialTradeVal.lucid, api, initialTradeVal.poolId, utxos,req,initialTradeVal);

  }else if(req.side=="BUY"){
   txnId = await swapExactOutTx(initialTradeVal.network, initialTradeVal.lucid, api, initialTradeVal.poolId, utxos,req,initialTradeVal);

  }
   

  console.log('txnid::::', txnId);
  
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
    gasPrice: 0.0,
    gasPriceToken: 'n/a',
    gasLimit: 0,
    gasCost: '',
    nonce: Math.random(),
    txHash: txnId,
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
  let seedphrase = "";
  if(req.seedPhrase){
    seedphrase=req.seedPhrase;
  }
  const lucid = await getBackendLucidInstance(
    network,
    blockfrostProjectId,
    blockfrostUrl,
    req.address,
    seedphrase
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

  let seedphrase = "";
  if(req.seedPhrase){
    seedphrase=req.seedPhrase;
  }
  

  const lucid = await getBackendLucidInstance(
    network,
    blockfrostProjectId,
    blockfrostUrl,
    req.address,
    seedphrase
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
  seedPhrase: string
): Promise<Lucid> {
  const provider = new Blockfrost(blockfrostUrl, projectId);
  const lucid = await Lucid.new(provider, network);
 /* lucid.selectWalletFrom({
    address: address,
  });*/
  console.log("address:::",address);
  lucid.selectWalletFromSeed(seedPhrase);//in the adrdress field we actually need to get the seed phrase to identify the wallet
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
  poolId : string,
  availableUtxos: UTxO[],
  req:TradeRequest,
  initialTradeVal:InitialResponse,
): Promise<string> {
  const { poolState, poolDatum } = await getPoolById(
    network,
    blockfrostAdapter,
    poolId,
  );

  /*
  BUY : acquire particular base by selling quote  calculateSwapExactOut
SELL : sell particular base to acquire quote  calculateSwapExactIn
*/
  const swapAmountADA = BigInt(req.amount);

  const { amountOut } = calculateSwapExactIn({
    amountIn: swapAmountADA,//exact amount of input tokens that the user wants to swap
    reserveIn: poolState.reserveA,//total amount of the input token currently available in the liquidity pool
    reserveOut: poolState.reserveB,//total amount of the output token currently available in the liquidity pool
  });

  // Because pool is always fluctuating, so you should determine the impact of amount which you will receive
  const slippageTolerance = BigInt(initialTradeVal.slippage);
  const acceptedAmount =
    (amountOut * (BigInt(100) - slippageTolerance)) / BigInt(100);

  const dex = new Dex(lucid);

  /*return await dex.buildSwapExactInTx({
    amountIn: swapAmountADA,
    assetIn: ADA,
    assetOut: poolDatum.assetB,
    minimumAmountOut: acceptedAmount,
    isLimitOrder: false,
    sender: req.address,
    availableUtxos: availableUtxos,
  });*/

  const txComplete = await dex.buildSwapExactInTx({
    amountIn: swapAmountADA,
    assetIn: ADA,
    assetOut: poolDatum.assetB,
    minimumAmountOut: acceptedAmount,
    isLimitOrder: false,
    sender: req.address,
    availableUtxos: availableUtxos,
  });

 const transactionId = await commitTransaction(txComplete);
  
  return transactionId;
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

async function swapExactOutTx(
  network: Network,
  lucid: Lucid,
  blockfrostAdapter: BlockfrostAdapter,
  poolId : string,
  availableUtxos: UTxO[],
  req:TradeRequest,
  initialTradeVal:InitialResponse,
): Promise<string> {
  const { poolState, poolDatum } = await getPoolById(
    network,
    blockfrostAdapter,
    poolId,
  );

  /*
  swap MIN to get ADA
base: ADA , quote : MIN

*/
  const exactAmountOutADA = BigInt(req.amount);

  const { amountIn } = calculateSwapExactOut({
    exactAmountOut: exactAmountOutADA,
    reserveIn: poolState.reserveA,
    reserveOut: poolState.reserveB,
  });


  // Because pool is always fluctuating, so you should determine the impact of amount which you will receive
  const slippageTolerance = BigInt(initialTradeVal.slippage);
  const necessaryAmountIn  =
    (amountIn * (BigInt(100) - slippageTolerance)) / BigInt(100);

  const dex = new Dex(lucid);

  const txComplete =  await dex.buildSwapExactOutTx({
    maximumAmountIn: necessaryAmountIn,
    assetIn: ADA,
    assetOut: poolDatum.assetB,
    expectedAmountOut: exactAmountOutADA,
    sender: req.address,
    availableUtxos: availableUtxos,
  });

  const transactionId = await commitTransaction(txComplete);
  
  return transactionId;
  }
  
  async function cancelTx(
    lucid: Lucid,
    blockFrostAdapter: BlockfrostAdapter,
    transactionHash : string
  ): Promise<string> {
    const txComplete =  new DexV2(lucid, blockFrostAdapter).cancelOrder({
      orderOutRefs: [
        {
          txHash: transactionHash,
          outputIndex: 0,
        },
      ],
    });

    const transactionId = await commitTransaction(txComplete);
  
  return transactionId;
  }
