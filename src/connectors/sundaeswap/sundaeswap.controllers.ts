//import { Ethereumish } from "../../services/common-interfaces";
import { Sundaeswap } from "./sundaeswap";

//import { AssetAmount } from "@sundaeswap/asset";

import { 
  PriceRequest, 
  PriceResponse,
  TradeRequest,
  TradeResponse
 } from "../../amm/amm.requests";
import Decimal from 'decimal.js-light';
import { ETxBuilderType, ISundaeSDKOptions, SundaeSDK,
  //ESwapType,  EDatumType,  ISwapConfigArgs,EContractVersion 
  } from "@sundaeswap/core";
//import { AssetAmount } from "@sundaeswap/asset";
import {Lucid,Blockfrost} from "lucid-cardano"
const API_URL = "https://cardano-preview.blockfrost.io/api/v0"; // Replace with your network endpoint
const BLOCKFROST_PROJECT_ID = "preview7SVcEQM1S4gk91u59dpXLFh14d5b4g8a";//"preprodtagNg5jUXcQMOR8x4n239ts6YDVkTRW9"; // Replace with your Blockfrost project ID
const address =
    "addr1qxw0m0mcyvpnkq3atvxm5l9w3uzwt7pqh0djakcqypknt5xum2ypkuc5snqju55m8mkjywxlwrt2v5e6yvcsymjxuxxs5d4gqc";
export async function price(
    
    sundaeswap: Sundaeswap,
    req: PriceRequest
  ): Promise<PriceResponse> {
    const startTimestamp: number = Date.now();
    console.log(sundaeswap,'MY connector MinSwap is reached---------------',Lucid)
    const lucidInstance = await Lucid.new(
      new Blockfrost(
        API_URL,
        BLOCKFROST_PROJECT_ID
      ),
      "Preview"
    );
    lucidInstance.selectWalletFrom({
      address: address,
    });
    console.log(lucidInstance);
    const options: ISundaeSDKOptions = {
      wallet: {
        name: "yoroi",
        network: "preview",
        builder: {
          lucid: lucidInstance,
          type: ETxBuilderType.LUCID,
        },
      },
    };
    const SDK = new SundaeSDK(options);
//SDK.query().findPoolData
//SDK.builder().

//SDK.builder().queryProvider.findPoolData
//try{
  const poolData = await SDK.builder().queryProvider.findPoolData({
    ident: "08",
  });

  
  console.log("poolData:::::",poolData);

 //const suppliedAsset =  new AssetAmount(25_000_000n, poolData.assetA);
//}catch(error){
 // console.error('Error creating buy order:', error);
//}
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


    return {
      network: req.chain,
      timestamp: startTimestamp,
      latency: latency(startTimestamp, Date.now()),
      base: 'SUNDAE',
      quote: 'ADA',
      amount: new Decimal(req.amount).toFixed(2),
      rawAmount: new Decimal(req.amount).toFixed(2).replace('.', ''),
      expectedAmount:new Decimal(req.amount).toFixed(2).replace('.', ''),
      price: new Decimal(poolData.currentFee).toFixed(8),
      gasPrice: 0.001,
    gasPriceToken: "gasPriceToken", 
    gasLimit: 0.01, 
    gasCost:"0.51"
    };
   
  }
  export async function trade(
    
    sundaeswap: Sundaeswap,
    req: TradeRequest
): Promise<TradeResponse> {
    const startTimestamp: number = Date.now();
    console.log('MY connector sundaeswap is reached for trade---------------',sundaeswap,Lucid);
    

    //const startTimestamp: number = Date.now();
    //console.log(sundaeswap,'MY connector MinSwap is reached---------------',Lucid)
    const lucidInstance = await Lucid.new(
      new Blockfrost(
        API_URL,
        BLOCKFROST_PROJECT_ID
      ),
      "Preview"
    );
    lucidInstance.selectWalletFrom({
      address: address,
    });
    console.log(lucidInstance);
    const options: ISundaeSDKOptions = {
      wallet: {
        name: "yoroi",
        network: "preview",
        builder: {
          lucid: lucidInstance,
          type: ETxBuilderType.LUCID,
        },
      },
    };
    const SDK = new SundaeSDK(options);
//SDK.query().findPoolData
//SDK.builder().

//SDK.builder().queryProvider.findPoolData
//try{
  const poolData = await SDK.builder().queryProvider.findPoolData({
    ident: "08",
  });

  
  console.log("poolData:::::",poolData);
/*
  const args: ISwapConfigArgs = {
    swapType: {
      type: ESwapType.MARKET,
      slippage: 0.03,
    },
    pool: poolData,
    orderAddresses: {
      DestinationAddress: {
        address: address,
        datum: {
          type: EDatumType.NONE,
        },
      },
    },
    suppliedAsset: new AssetAmount(BigInt(100), poolData.assetA),
  };

  const { build, fees } = await SDK
  .builder(EContractVersion.V3)
  .swap(args);


  const builtTx = await build();
const { submit, cbor } = await builtTx.sign();

const txHash = await submit();
*/
    return {
      network: "preprod",
      timestamp: startTimestamp,
      latency: latency(startTimestamp, Date.now()),
      base: "base",
      quote: "quote",
      amount: new Decimal(req.amount).toFixed(2),
      rawAmount: new Decimal(req.amount).toFixed(2),
      expectedIn: new Decimal(req.amount).toFixed(2),
      price: new Decimal(req.amount).toFixed(2),
      gasPrice: 0.001,
      gasPriceToken: "gasPriceToken",
      gasLimit: 0.01,
      gasCost: "gasCost",
      nonce: Math.random(),
      txHash: "txHash",
    };
  }

  export const latency = (startTime: number, endTime: number): number => {
    return (endTime - startTime) / 1000;
  };
 
  