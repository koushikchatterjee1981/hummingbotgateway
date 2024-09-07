import { getCardanoConfig,NetworkConfig } from "./cardano.config";
import { Cardanoish } from "../../services/common-interfaces";

export class Cardano {
    private static _instances: { [name: string]: Cardano };
    public network: NetworkConfig;  
    public allowedSlippage: string;
    public gasLimitEstimate: number;
    public ttl: number; 
    //public chain : string
    public config:any;
    private _ready: boolean = false;
    
    private constructor(network: string) {
        this.config = getCardanoConfig('cardano', network);
        this.ttl = this.config.ttl
        this.gasLimitEstimate = this.config.gasLimitEstimate
        this.allowedSlippage = this.config.allowedSlippage
        this.network = this.config.network
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
      public async init() {
        if (!this.ready()){
            this._ready = true
        }
      }
      public ready(): boolean {
        return this._ready;
      }
}