import { Ethereumish } from "../../services/common-interfaces";
import { MinSwap } from "./minswap";
import { PriceRequest, PriceResponse } from "../../amm/amm.requests";
import Decimal from 'decimal.js-light';
import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import {BlockfrostAdapter,NetworkId,PoolV1,Dex,ADA,calculateSwapExactIn} from "@minswap/sdk"
import { Cardano } from "../../chains/cardano/cardano";
import {Network,Constr,Data,Lucid,Address,Blockfrost,UTxO,TxComplete} from "lucid-cardano"
import {MinswapConfig} from './minswap.config'
import { find } from 'lodash';

const poolId =
    "6aa2153e1ae896a95539c9d62f76cedcdabdcdf144e564b8955f609d660cf6a2";
    const network: Network = "Mainnet";
    const BLOCKFROST_PROJECT_ID = "mainnetlonRTF3MI354W0JKvhwjlnqH3YBbFvzp";
    const API_URL = "https://cardano-mainnet.blockfrost.io/api/v0";
    const address ="addr1qxw0m0mcyvpnkq3atvxm5l9w3uzwt7pqh0djakcqypknt5xum2ypkuc5snqju55m8mkjywxlwrt2v5e6yvcsymjxuxxs5d4gqc";
export async function price(
    cardanoish: Cardano,
    minSwap: MinSwap,
    req: PriceRequest
  ): Promise<PriceResponse> {

    
    let caddress :any = find(MinswapConfig.currencyConfig.currency, { 'name': 'ADA'})
    console.log('address-----',caddress.id);
    
    const startTimestamp: number = Date.now();
    console.log('MY connector MinSwap is reached---------------',minSwap)
    
    const blockfrostAdapter = new BlockfrostAdapter({
      networkId: NetworkId.MAINNET,
      blockFrost: new BlockFrostAPI({
        projectId: BLOCKFROST_PROJECT_ID,
        network: "mainnet",
      }),
    });
  const { poolState, poolDatum } = await getPoolById(
    network,
    blockfrostAdapter,
    poolId
  );
  const lucid = await getBackendLucidInstance(
    network,
    BLOCKFROST_PROJECT_ID,
    API_URL,
    address
  );
   console.log('poolState',poolState,'poolDatum',poolDatum)
   console.log('lucid',lucid)
   const utxos = await lucid.utxosAt(address);
   console.log('utxos',utxos)
   const txnComplete = await swapExactInTx(lucid,address,utxos,poolState,poolDatum); 
   console.log('txnComplete',txnComplete)
    // const api = new BlockfrostAdapter({
    //   networkId: NetworkId.TESTNET,
    //   blockFrost: new BlockFrostAPI({
    //     projectId: "preprodtagNg5jUXcQMOR8x4n239ts6YDVkTRW9",
    //     network: "preprod",
    //   }),
    // });
    // const pool = await api.getV1PoolById({
    //   id: '3bb0079303c57812462dec9de8fb867cef8fd3768de7f12c77f6f0dd80381d0d',
    // });

    //   const minADAPool = pool.find(
    //     (p) =>
    //       p.assetA === "lovelace" &&
    //       p.assetB ===
    //         "29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e"
    //   );
    //   if (minADAPool) {
    //     const [a, b] = await api.getV1PoolPrice({ pool: minADAPool });
    //     console.log(
    //       `ADA/MIN price: ${a.toString()}; MIN/ADA price: ${b.toString()}`
    //     );
    //     // we can later use this ID to call getPoolById
    //     console.log(`ADA/MIN pool ID: ${minADAPool.id}`);
    //     break;
    //   }
    // }


    return {
      network: cardanoish.config,
      timestamp: startTimestamp,
      latency: latency(startTimestamp, Date.now()),
      base: '',
      quote: '',
      amount: new Decimal(req.amount).toFixed(2),
      rawAmount: new Decimal(req.amount).toFixed(2).replace('.', ''),
      expectedAmount: new Decimal(23).toFixed(2),
      price: new Decimal(25.0).toFixed(8),
      gasPrice: 10.2 / 10 ** 6,
      gasPriceToken: '',
      gasLimit: 0,
      gasCost: new Decimal(10.2).dividedBy(10 ** 6).toFixed(6),
    };
   
  }
  export const latency = (startTime: number, endTime: number): number => {
    return (endTime - startTime) / 1000;
  };
  async function getPoolById(
    network: Network,
    blockfrostAdapter: BlockfrostAdapter,
    poolId: string
  ): Promise<{ poolState: PoolV1.State; poolDatum: PoolV1.Datum }> {
    const pool = await blockfrostAdapter.getV1PoolById({
      id: poolId,
    });
    if (!pool) {
      throw new Error(`Not found PoolState of ID: ${poolId}`);
    }
  
    const rawRoolDatum = await blockfrostAdapter.getDatumByDatumHash(
      pool.datumHash
    );
    const poolDatum = PoolV1.Datum.fromPlutusData(
      network === "Mainnet" ? NetworkId.MAINNET : NetworkId.TESTNET,
      Data.from(rawRoolDatum) as Constr<Data>
    );
    return {
      poolState: pool,
      poolDatum: poolDatum,
    };
  }
  async function getBackendLucidInstance(
    network: Network,
    projectId: string,
    blockfrostUrl: string,
    address: Address
  ): Promise<Lucid> {
    const provider = new Blockfrost(blockfrostUrl, projectId);
    const lucid = await Lucid.new(provider, network);
    lucid.selectWalletFrom({
      address: address,
    });
    return lucid;
  }
  async function swapExactInTx(
    lucid: Lucid,
    address: Address,
    availableUtxos: UTxO[],
    poolState: any,
    poolDatum: any

  ): Promise<TxComplete> {
    // ID of ADA-MIN Pool on Testnet Preprod
    // const poolId =
    //   "3bb0079303c57812462dec9de8fb867cef8fd3768de7f12c77f6f0dd80381d0d";
  
    // const { poolState, poolDatum } = await getPoolById(
    //   network,
    //   blockfrostAdapter,
    //   poolId
    // );
  
    const swapAmountADA = 1n;
  
    const { amountOut } = calculateSwapExactIn({
      amountIn: swapAmountADA,
      reserveIn: poolState.reserveA,
      reserveOut: poolState.reserveB,
    });
  console.log('amountOut',amountOut)
    // Because pool is always fluctuating, so you should determine the impact of amount which you will receive
    const slippageTolerance = 1n;
    const acceptedAmount = (amountOut * (100n - slippageTolerance)) / 100n;
  
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