"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LucidHelper = void 0;
const lucid_cardano_1 = require("lucid-cardano");
const index_js_1 = require("../@types/index.js");
/**
 * A helper class that provides utility functions for validating and processing
 * Cardano addresses. These functions include:
 * - Parsing address hashes from a Bech32 or hex encoded address
 * - Validating an address as being a valid Cardano address and that it is on the correct network
 * - Checking if an address is a script address
 * - Validating that an address matches the given network
 * - Throwing an error if the address is on the wrong network
 * - Throwing an error if an invalid address is supplied
 *
 * @example
 * ```typescript
 *  const hashes = LucidHelper.getAddressHashes("addr_test...")
 *  LucidHelper.validateAddressAndDatumAreValid({ address: "addr_test...", network: "mainnet" });
 *  const isScript = LucidHelper.isScriptAddress("addr_test...");
 * ```
 */
class LucidHelper {
    /**
     * Helper function to parse addresses hashes from a Bech32 or hex encoded address.
     * @param address
     * @returns
     */
    static getAddressHashes(address) {
        const details = (0, lucid_cardano_1.getAddressDetails)(address);
        if (!details.paymentCredential) {
            throw new Error("Invalid address. Make sure you are using a Bech32 or Hex encoded address that includes the payment key.");
        }
        return {
            paymentCredentials: details.paymentCredential.hash,
            stakeCredentials: details.stakeCredential?.hash,
        };
    }
    /**
     * Validates that an address and optional datum are valid,
     * and that the address is on the correct network.
     */
    static validateAddressAndDatumAreValid({ address, datum, network, }) {
        LucidHelper.validateAddressNetwork(address, network);
        const isScript = LucidHelper.isScriptAddress(address);
        if (isScript) {
            if (datum.type === index_js_1.EDatumType.NONE) {
                LucidHelper.throwInvalidOrderAddressesError(address, `The address provided is a Script Address, but a datum hash was not supplied. This will brick your funds! Supply a valid datum hash with the address in order to proceed.`);
            }
            try {
                if (datum.type === index_js_1.EDatumType.HASH) {
                    lucid_cardano_1.C.DataHash.from_hex(datum.value);
                }
                else {
                    lucid_cardano_1.Data.from(datum.value);
                }
            }
            catch (e) {
                LucidHelper.throwInvalidOrderAddressesError(address, `The datum provided was not a valid hex string. Original error: ${JSON.stringify({
                    datum,
                    originalErrorMessage: e.message,
                })}`);
            }
        }
    }
    /**
     * Helper function to check if an address is a script address.
     * @param address The Bech32 encoded address.
     * @returns
     */
    static isScriptAddress(address) {
        // Ensure that the address can be serialized.
        const realAddress = lucid_cardano_1.C.Address.from_bech32(address);
        // Ensure the datumHash is valid HEX if the address is a script.
        const isScript = (realAddress.to_bytes()[0] & 0b00010000) !== 0;
        return isScript;
    }
    /**
     * Validates that an address matches the provided network.
     */
    static validateAddressNetwork(address, network) {
        let details;
        try {
            details = (0, lucid_cardano_1.getAddressDetails)(address);
        }
        catch (e) {
            LucidHelper.throwInvalidOrderAddressesError(address, e.message);
        }
        LucidHelper.maybeThrowNetworkError(details.networkId, address, network);
    }
    /**
     * Throws a useful error if the address, network, and instance network are on the wrong network.
     * @param addressNetwork
     * @param address
     */
    static maybeThrowNetworkError(addressNetwork, address, network) {
        if (addressNetwork !== 1 && network === "mainnet") {
            LucidHelper.throwInvalidOrderAddressesError(address, `The given address is not a Mainnet Network address: ${address}.`);
        }
        if (addressNetwork !== 0 && network === "preview") {
            LucidHelper.throwInvalidOrderAddressesError(address, `The given address is not a (Preview/Testnet/PreProd) Network address: ${address}.`);
        }
    }
    static inlineDatumToHash(inline) {
        return lucid_cardano_1.C.hash_plutus_data(lucid_cardano_1.C.PlutusData.from_bytes(Buffer.from(inline, "hex")))?.to_hex();
    }
    /**
     * Throws an error describing the address and contextual information.
     */
    static throwInvalidOrderAddressesError(address, errorMessage) {
        throw new Error(`You supplied an invalid address: ${address}. Please check your arguments and try again. Error message from LucidHelper: ${errorMessage}`);
    }
}
exports.LucidHelper = LucidHelper;
//# sourceMappingURL=LucidHelper.class.js.map