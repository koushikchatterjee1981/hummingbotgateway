import { Ethereumish } from "../../services/common-interfaces";
import { Sundaeswap } from "./sundaeswap";
import { PriceRequest, PriceResponse } from "../../amm/amm.requests";
import Decimal from 'decimal.js-light';
import { ETxBuilderType, ISundaeSDKOptions, SundaeSDK } from "@sundaeswap/core";
import { AssetAmount } from "@sundaeswap/asset";
import {Lucid,Blockfrost,Address,Network,C} from "lucid-cardano"
import { Cardano } from "../../chains/cardano/cardano";

const bip39 = require('bip39');
const { mnemonicToEntropy } = require('bip39');
const API_URL = "https://cardano-preview.blockfrost.io/api/v0"; // Replace with your network endpoint
const BLOCKFROST_PROJECT_ID = "preview7SVcEQM1S4gk91u59dpXLFh14d5b4g8a";//"preprodtagNg5jUXcQMOR8x4n239ts6YDVkTRW9"; // Replace with your Blockfrost project ID
const address =
    "addr1qxw0m0mcyvpnkq3atvxm5l9w3uzwt7pqh0djakcqypknt5xum2ypkuc5snqju55m8mkjywxlwrt2v5e6yvcsymjxuxxs5d4gqc";

    const mnemonic = 'near laundry shuffle romance culture collect bronze because ceiling accuse obtain midnight promote organ endless';
      
export async function price(
    cardanoish: Cardano,
    sundaeswap: Sundaeswap,
    req: PriceRequest
  ): Promise<PriceResponse> {
    const startTimestamp: number = Date.now();
    console.log(sundaeswap,'MY connector MinSwap is reached---------------',C)
    console.log('bip',bip39)
    console.log('mnemonicToEntropy',mnemonicToEntropy)
    const privateKey = await derivePrivateKeyFromMnemonic(mnemonic);
    console.log('privateKey',privateKey) 
    // const lucidInstance = await Lucid.new(
    //   new Blockfrost(
    //     API_URL,
    //     BLOCKFROST_PROJECT_ID
    //   ),
    //   "Preview"
    // );
//     //lucidInstance.utils.generatePrivateKey
//     lucidInstance.selectWalletFrom({
//       address: address,
//     });
//     console.log(lucidInstance);
//     const options: ISundaeSDKOptions = {
//       wallet: {
//         name: "yoroi",
//         network: "preview",
//         builder: {
//           lucid: lucidInstance,
//           type: ETxBuilderType.LUCID,
//         },
//       },
//     };
//     const SDK = new SundaeSDK(options);
// //SDK.query().findPoolData
// //SDK.builder().


// try{
//   const poolData = await SDK.builder().queryProvider.findPoolData({
//     ident: "08",
//   });
//   console.log("poolData:::::",poolData);

//  const suppliedAsset =  new AssetAmount(25_000_000n, poolData.assetA);
// }catch(error){
//   console.error('Error creating buy order:', error);
// }
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

  async function derivePrivateKeyFromMnemonic(mnemonic:any) {
    try {
        // Ensure the mnemonic is valid
        if (!bip39.validateMnemonic(mnemonic)) {
            throw new Error('Invalid mnemonic');
        }
 
        // Convert mnemonic to entropy
        const entropy = mnemonicToEntropy(mnemonic);
 
        // Convert entropy to a seed
        const seed = await bip39.mnemonicToSeed(mnemonic);
 
        // Use the seed to derive the root key (root private key)
        const rootKey = C.Bip32PrivateKey.from_bip39_entropy(
            Buffer.from(entropy, 'hex'),
            Buffer.from('')
        );
 
        // Convert the root key to a private key
        const privateKey = rootKey.to_raw_key().to_bech32();
 
        return privateKey;
    } catch (error) {
        console.error('Error deriving private key:', error);
        return null;
    }
}
  export const latency = (startTime: number, endTime: number): number => {
    return (endTime - startTime) / 1000;
  };
 
  