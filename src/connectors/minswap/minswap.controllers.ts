//import { Ethereumish } from "../../services/common-interfaces";
import { MinSwap } from './minswap';
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

const network: Network = 'Preprod';
const blockfrostProjectId = 'preprodfGRaDPrVu6DhhHSNm5w8kzIkQghi2RYR';
const blockfrostUrl = 'https://cardano-preprod.blockfrost.io/api/v0';
const address =
  'addr1qxw0m0mcyvpnkq3atvxm5l9w3uzwt7pqh0djakcqypknt5xum2ypkuc5snqju55m8mkjywxlwrt2v5e6yvcsymjxuxxs5d4gqc';
const poolId =
  '3bb0079303c57812462dec9de8fb867cef8fd3768de7f12c77f6f0dd80381d0d';
const YOUR_PRIVATE_KEY = '';

const api = new BlockfrostAdapter({
  networkId: NetworkId.TESTNET,
  blockFrost: new BlockFrostAPI({
    projectId: blockfrostProjectId,
    network: 'preprod',
  }),
});

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

  const lucid = await getBackendLucidInstance(
    network,
    blockfrostProjectId,
    blockfrostUrl,
    address,
  );

  console.log('lucid : ', lucid);

  /*const pool = await api.getV1PoolById({
      id: '3bb0079303c57812462dec9de8fb867cef8fd3768de7f12c77f6f0dd80381d0d',
    });*/

  const returnedPool = await getPoolById('Preprod', api, poolId);

  console.log(`ADA/MIN pool : ${returnedPool.poolState}`);

  const [a, b] = await api.getV1PoolPrice({ pool: returnedPool.poolState });
  console.log(`ADA/MIN price: ${a.toString()}; MIN/ADA price: ${b.toString()}`);

  /*const minADAPool = returnedPool.poolState.(
         (p) =>
           p.assetA === "lovelace" &&
           p.assetB ===
             "29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e"
       );
       if (minADAPool) {
         const [a, b] = await api.getV1PoolPrice({ pool: minADAPool });
         console.log(
           `ADA/MIN price: ${a.toString()}; MIN/ADA price: ${b.toString()}`
         );
         // we can later use this ID to call getPoolById
         console.log(`ADA/MIN pool ID: ${minADAPool.id}`);
         break;
      }
     }*/

  return {
    network: req.network,
    timestamp: startTimestamp,
    latency: latency(startTimestamp, Date.now()),
    base: '',
    quote: '',
    amount: new Decimal(req.amount).toFixed(2),
    rawAmount: new Decimal(req.amount).toFixed(2).replace('.', ''),
    expectedAmount: new Decimal(b.toString()).toFixed(2),
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

  const lucid = await getBackendLucidInstance(
    network,
    blockfrostProjectId,
    blockfrostUrl,
    address,
  );

  console.log('lucid : ', lucid);

  const utxos = await lucid.utxosAt(address);

  const txComplete = await swapExactInTx('Preprod', lucid, api, address, utxos);

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
    gasPrice: 0.001,
    gasPriceToken: 'gasPriceToken',
    gasLimit: 0.01,
    gasCost: 'gasCost',
    nonce: Math.random(),
    txHash: 'txHash',
  };
}

export async function removeLiquidity(
  req: RemoveLiquidityRequest,
): Promise<RemoveLiquidityResponse> {
  const startTimestamp: number = Date.now();
  const lucid = await getBackendLucidInstance(
    network,
    blockfrostProjectId,
    blockfrostUrl,
    address,
  );

  console.log('lucid : ', lucid);

  const utxos = await lucid.utxosAt(address);

  const txComplete = await withdrawTx('Preprod', lucid, api, address, utxos);

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
  const lucid = await getBackendLucidInstance(
    network,
    blockfrostProjectId,
    blockfrostUrl,
    address,
  );

  console.log('lucid : ', lucid);

  const utxos = await lucid.utxosAt(address);

  const txComplete = await depositTx('Preprod', lucid, api, address, utxos);

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
    token0: 'token0.address',
    token1: 'token1.address',
    fee: req.fee!,
    tokenId: req.tokenId ? req.tokenId : 0,
    gasPrice: 0.001,
    gasPriceToken: 'gasPriceToken',
    gasLimit: 0.01,
    gasCost: 'gasCost',
    nonce: Math.random(),
    txHash: 'txHash',
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
  availableUtxos: UTxO[],
): Promise<TxComplete> {
  const { poolState, poolDatum } = await getPoolById(
    network,
    blockfrostAdapter,
    poolId,
  );

  const swapAmountADA = BigInt(1);

  const { amountOut } = calculateSwapExactIn({
    amountIn: swapAmountADA,
    reserveIn: poolState.reserveA,
    reserveOut: poolState.reserveB,
  });

  // Because pool is always fluctuating, so you should determine the impact of amount which you will receive
  const slippageTolerance = BigInt(5);
  const acceptedAmount =
    (amountOut * (BigInt(100) - slippageTolerance)) / BigInt(100);

  const dex = new Dex(lucid);
  return await dex.buildSwapExactInTx({
    amountIn: swapAmountADA,
    assetIn: ADA,
    assetOut: poolDatum.assetB,
    minimumAmountOut: acceptedAmount,
    isLimitOrder: false,
    sender: address,
    availableUtxos: availableUtxos,
  });
}

async function depositTx(
  network: Network,
  lucid: Lucid,
  blockfrostAdapter: BlockfrostAdapter,
  address: Address,
  availableUtxos: UTxO[],
): Promise<TxComplete> {
  // ID of ADA-MIN Pool on Testnet Preprod

  const { poolState, poolDatum } = await getPoolById(
    network,
    blockfrostAdapter,
    poolId,
  );

  const depositedAmountA = BigInt(5);
  const depositedAmountB = BigInt(1);

  const { necessaryAmountA, necessaryAmountB, lpAmount } = calculateDeposit({
    depositedAmountA: depositedAmountA,
    depositedAmountB: depositedAmountB,
    reserveA: poolState.reserveA,
    reserveB: poolState.reserveB,
    totalLiquidity: poolDatum.totalLiquidity,
  });

  // Because pool is always fluctuating, so you should determine the impact of amount which you will receive
  const slippageTolerance = BigInt(2);
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
): Promise<TxComplete> {
  // ID of ADA-MIN Pool on Testnet Preprod

  const { poolState, poolDatum } = await getPoolById(
    network,
    blockfrostAdapter,
    poolId,
  );

  const lpAsset = Asset.fromString(poolState.assetLP);
  const withdrawalAmount =
    BigInt(1); /*--this is the amount you want to withdraw---*/

  const { amountAReceive, amountBReceive } = calculateWithdraw({
    withdrawalLPAmount: withdrawalAmount,
    reserveA: poolState.reserveA,
    reserveB: poolState.reserveB,
    totalLiquidity: poolDatum.totalLiquidity,
  });

  // Because pool is always fluctuating, so you should determine the impact of amount which you will receive
  const slippageTolerance = BigInt(20);
  const acceptedAmountAReceive =
    (amountAReceive * (BigInt(20) - slippageTolerance)) / BigInt(100);
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
