import { ConfigManagerV2 } from '../../services/config-manager-v2';
export interface NetworkConfig {
  name: string;
  routerAddress:string;
}

interface Config {
  network: NetworkConfig;  
  allowedSlippage: string;
  gasLimitEstimate: number;
  ttl: number;
}

export function getCardanoConfig(
  chainName: string,
  networkName: string
): Config {
  const network = networkName;
  return {
    network: {
      name: network,
      routerAddress: ConfigManagerV2.getInstance().get(
        chainName + '.contractAddresses.' + networkName + '.routerAddress'
      )
    },
    
      allowedSlippage: ConfigManagerV2.getInstance().get(
        chainName + '.allowedSlippage'
      ),
      gasLimitEstimate: ConfigManagerV2.getInstance().get(
        chainName + '.gasLimitEstimate'
      ),
      ttl: ConfigManagerV2.getInstance().get(
        chainName + '.ttl'
      )
  };
}
