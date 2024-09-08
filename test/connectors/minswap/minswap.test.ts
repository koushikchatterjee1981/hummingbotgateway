jest.useFakeTimers();
//const { MockProvider } = require('mock-ethers-provider');
import {price as minswapPrice} from '../../../src/connectors/minswap/minswap.controllers';
import { Cardano as CardanoChain} from '../../../src/chains/cardano/cardano';
import { PriceRequest,PriceResponse} from '../../../src/amm/amm.requests';
import { MinSwap } from '../../../src/connectors/minswap/minswap';
describe('verify Minswap estimateSellTrade', () => {
      it('Should return an ExpectedTrade when available', async () => {
        let request:  PriceRequest = {
            chain:  "cardano",
            network: "mainnet", // the target network of the chain (e.g. mainnet)
            connector: "minswap", //the target connector (e.g. uniswap or pangolin)
            quote: "MIN",
            base: "ADA",
            amount: "5",
            side: "BUY"
        }
        const expectedTrade = await minswapPrice(CardanoChain.getInstance('preprod'),MinSwap.getInstance(request.network),request)
        expect(expectedTrade).toHaveProperty('price');
        expect(expectedTrade).toHaveProperty('expectedAmount');
      });
 
  });
  
