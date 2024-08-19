import { getCardanoConfig } from "./cardano.config";
//import { Cardanoish } from "../../services/common-interfaces";

export class Cardano {
    private static _instances: { [name: string]: Cardano };
    // public network: NetworkConfig;  
    // public allowedSlippage: string;
    // public gasLimitEstimate: number;
    // public ttl: number; 
    // public chain : string
    private _ready: boolean = false;
    public config:any;
    
    private constructor(network: string) {
        this.config = getCardanoConfig('cardano', network);
        // this.ttl = config.ttl
        // this.gasLimitEstimate = config.gasLimitEstimate
        // this.allowedSlippage = config.allowedSlippage
        // this.network = config.network
    }
    public static getInstance(network: string): Cardano {
        if (Cardano._instances === undefined) {
            Cardano._instances = {};
        }
        if (!(network in Cardano._instances)) {
            Cardano._instances[network] = new Cardano(network);
        }
    
        return Cardano._instances[network];
      }
    
      public static getConnectedInstances(): { [name: string]: Cardano } {
        return Cardano._instances;
      }


      public ready(): boolean {
        return this._ready;
      }

      public async init(): Promise<void> {
        
        this._ready = true;
        return;
      }
}