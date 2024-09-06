"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VOID_REDEEMER = exports.ORDER_ROUTE_DEPOSIT_DEFAULT = exports.ORDER_DEPOSIT_DEFAULT = exports.POOL_MIN_ADA = exports.ADA_METADATA = exports.ADA_ASSET_DECIMAL = exports.ADA_ASSET_ID = exports.V1_MAX_POOL_IDENT_LENGTH = exports.V3_POOL_IDENT_LENGTH = exports.MIN_ASSET_LENGTH = void 0;
/**
 * The minimum asset length is determined by the hex-encoded byte string length of a Policy ID.
 * This condition is ignored for the Cardano $ADA asset, which has a Policy ID and Asset Name of "".
 */
exports.MIN_ASSET_LENGTH = 56;
/**
 * For v3 pools, the pool identifier will always be 28 bytes (56 characters) long.
 * It is impossible for the v1 pool ident to be 28 bytes as:
 *  - There would need to be around 26959946667150639794667015087019630673637144422540572481103610249216 pools available in order for a pool ident to reach 28 bytes
 *  - There's not enough ADA in existence to cover the transaction fees, or the minUTXO cost, for creating that many pools
 */
exports.V3_POOL_IDENT_LENGTH = 56;
/**
 * The max pool ident length for V1 pools. This isn't a technicality, but
 * rather a reasonable threshold by which we can test a pool ident.
 */
exports.V1_MAX_POOL_IDENT_LENGTH = 10;
/**
 * The AssetID for the Cardano native token, $ADA.
 */
exports.ADA_ASSET_ID = "ada.lovelace";
exports.ADA_ASSET_DECIMAL = 6;
exports.ADA_METADATA = {
    description: undefined,
    assetId: exports.ADA_ASSET_ID,
    policyId: "",
    assetName: "43415244414e4f",
    decimals: exports.ADA_ASSET_DECIMAL,
    logo: "/static/images/cardano.png",
    ticker: "ADA",
    dateListed: "2023-07-24 20:56:47.60474487 +0000 UTC m=+3459.540384892",
    marketCap: null,
    sources: [],
    priceToday: null,
    priceYesterday: null,
    priceDiff24H: null,
    poolId: "",
    slotAdded: 0,
    totalSupply: null,
    tvl: null,
    tvlDiff24H: null,
    tvlToday: null,
    tvlYesterday: null,
    volume24H: null,
};
exports.POOL_MIN_ADA = 3000000n;
exports.ORDER_DEPOSIT_DEFAULT = 2000000n;
exports.ORDER_ROUTE_DEPOSIT_DEFAULT = 3000000n;
exports.VOID_REDEEMER = "d87a80";
//# sourceMappingURL=constants.js.map