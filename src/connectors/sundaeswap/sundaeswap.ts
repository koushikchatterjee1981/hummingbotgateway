import { logger } from "../../services/logger";

export class Sundaeswap  {
    private static _instances: { [name: string]: Sundaeswap };
    constructor(network: string) {
       logger.info('Sundaeswap Network',network)
      }
    public static getInstance(network: string): Sundaeswap {
        if (Sundaeswap._instances === undefined) {
            this._instances = {};
        }
        if (!(network in this._instances)) {
            this._instances[network] = new Sundaeswap(network);
        }
    
        return this._instances[network];
      }
    public async init() {  }
    public ready(): boolean {
        return true;
      }
}