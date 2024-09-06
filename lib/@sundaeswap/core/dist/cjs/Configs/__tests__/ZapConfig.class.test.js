"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../@types/index.js");
const testing_js_1 = require("../../exports/testing.js");
const ZapConfig_class_1 = require("../ZapConfig.class");
let config;
beforeEach(() => {
    config = new ZapConfig_class_1.ZapConfig();
});
describe("ZapConfig class", () => {
    it("should construct with no parameters", () => {
        expect(config).toBeInstanceOf(ZapConfig_class_1.ZapConfig);
    });
    it("should construct with a config", () => {
        const myConfig = new ZapConfig_class_1.ZapConfig({
            orderAddresses: {
                DestinationAddress: {
                    address: testing_js_1.PREVIEW_DATA.addresses.current,
                    datum: {
                        type: index_js_1.EDatumType.NONE,
                    },
                },
            },
            pool: testing_js_1.PREVIEW_DATA.pools.v1,
            suppliedAsset: testing_js_1.PREVIEW_DATA.assets.tada,
            zapDirection: index_js_1.EPoolCoin.A,
            swapSlippage: 0.3,
        });
        expect(myConfig.buildArgs()).toStrictEqual({
            orderAddresses: {
                DestinationAddress: {
                    address: testing_js_1.PREVIEW_DATA.addresses.current,
                    datum: {
                        type: index_js_1.EDatumType.NONE,
                    },
                },
            },
            pool: testing_js_1.PREVIEW_DATA.pools.v1,
            suppliedAsset: expect.objectContaining({
                amount: testing_js_1.PREVIEW_DATA.assets.tada.amount,
            }),
            referralFee: undefined,
            zapDirection: index_js_1.EPoolCoin.A,
            swapSlippage: 0.3,
        });
    });
    it("should correctly set the setFromObject method", () => {
        const zap = new ZapConfig_class_1.ZapConfig();
        expect(() => zap.buildArgs()).toThrow();
        const myConfig = {
            orderAddresses: {
                DestinationAddress: {
                    address: testing_js_1.PREVIEW_DATA.addresses.current,
                    datum: {
                        type: index_js_1.EDatumType.NONE,
                    },
                },
            },
            pool: testing_js_1.PREVIEW_DATA.pools.v1,
            suppliedAsset: testing_js_1.PREVIEW_DATA.assets.tada,
            zapDirection: index_js_1.EPoolCoin.A,
            swapSlippage: 0.3,
        };
        zap.setFromObject(myConfig);
        expect(zap.buildArgs()).toStrictEqual({
            orderAddresses: {
                DestinationAddress: {
                    address: testing_js_1.PREVIEW_DATA.addresses.current,
                    datum: {
                        type: index_js_1.EDatumType.NONE,
                    },
                },
            },
            pool: testing_js_1.PREVIEW_DATA.pools.v1,
            suppliedAsset: expect.objectContaining({
                amount: testing_js_1.PREVIEW_DATA.assets.tada.amount,
            }),
            referralFee: undefined,
            zapDirection: index_js_1.EPoolCoin.A,
            swapSlippage: 0.3,
        });
    });
    it("it should set the orderAddresses correctly", () => {
        config.setOrderAddresses({
            DestinationAddress: {
                address: "test1",
                datum: {
                    type: index_js_1.EDatumType.HASH,
                    value: "test2",
                },
            },
            AlternateAddress: "test3",
        });
        expect(config.orderAddresses).toMatchObject({
            DestinationAddress: {
                address: "test1",
                datum: {
                    type: index_js_1.EDatumType.HASH,
                    value: "test2",
                },
            },
            AlternateAddress: "test3",
        });
    });
    it("should set the pool correctly", () => {
        config.setPool(testing_js_1.PREVIEW_DATA.pools.v1);
        expect(config.pool).toMatchObject(testing_js_1.PREVIEW_DATA.pools.v1);
    });
    it("should set the suppliedAsset correctly", () => {
        config.setSuppliedAsset(testing_js_1.PREVIEW_DATA.assets.tindy);
        expect(config.suppliedAsset).toStrictEqual(testing_js_1.PREVIEW_DATA.assets.tindy);
    });
    it("should set the zapDirection correctly", () => {
        config.setZapDirection(index_js_1.EPoolCoin.A);
        expect(config.zapDirection).toStrictEqual(index_js_1.EPoolCoin.A);
    });
    it("should set the swapSlippage correctly", () => {
        config.setPool(testing_js_1.PREVIEW_DATA.pools.v1);
        config.setOrderAddresses(testing_js_1.PREVIEW_DATA.orderAddresses);
        config.setSwapSlippage(0.45);
        expect(config.swapSlippage).toEqual(0.45);
        const newConfig = new ZapConfig_class_1.ZapConfig();
        newConfig.setPool(testing_js_1.PREVIEW_DATA.pools.v1);
        newConfig.setOrderAddresses(testing_js_1.PREVIEW_DATA.orderAddresses);
        newConfig.setSuppliedAsset(testing_js_1.PREVIEW_DATA.assets.tada);
        newConfig.setZapDirection(index_js_1.EPoolCoin.A);
        expect(newConfig.swapSlippage).toBeUndefined();
        expect(newConfig.buildArgs().swapSlippage).toBe(0);
    });
    it("should throw the correct errors when building the config", () => {
        expect(() => config.validate()).toThrowError("You haven't set a pool in your Config. Set a pool with .setPool()");
        config.setPool(testing_js_1.PREVIEW_DATA.pools.v1);
        expect(() => config.validate()).toThrowError("You haven't defined the OrderAddresses in your Config. Set with .setOrderAddresses()");
        config.setOrderAddresses(testing_js_1.PREVIEW_DATA.orderAddresses);
        expect(() => config.validate()).toThrowError("You did not provided funding for this deposit! Make sure you supply both sides of the pool with .setSuppliedAssets()");
        config.setSuppliedAsset(testing_js_1.PREVIEW_DATA.assets.tada);
        expect(() => config.validate()).toThrowError("You did not provide a Zap Direction for this deposit! Make sure you supply the Zap Direction with .setZapDirection()");
        config.setZapDirection(index_js_1.EPoolCoin.A);
        config.setSwapSlippage(-1);
        expect(() => config.validate()).toThrowError("You provided an invalid number for the desired swap slippage. Please choose a float number between 0 and 1.");
        config.setSwapSlippage(1.1);
        expect(() => config.validate()).toThrowError("You provided an invalid number for the desired swap slippage. Please choose a float number between 0 and 1.");
    });
});
//# sourceMappingURL=ZapConfig.class.test.js.map