/**
 *  [[link-chainstack]] provides a third-party service for connecting to
 *  various blockchains over JSON-RPC.
 *
 *  **Supported Networks**
 *
 *  - Ethereum Mainnet (``mainnet``)
 *  - Polygon Mainnet (``polygon``)
 *  - BSC Mainnet (``bsc``)
 *  - Avalanche Mainnet (``avalanche``)
 *  - Arbitrum Mainnet (``arbitrum``)
 *  - Scroll Testnet (``scroll``)
 *  - Fantom Mainnet (``fantom``)
 *
 *  @_subsection: api/providers/thirdparty:Chainstack  [providers-chainstack]
 */
import {
    defineProperties, FetchRequest, assertArgument
} from "../utils/index.js";

import { showThrottleMessage } from "./community.js";
import { Network } from "./network.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";

import type { AbstractProvider } from "./abstract-provider.js";
import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";

const defaultApiKey = "";

function getHost(name: string): string {
    switch(name) {
        case "mainnet":
            return "ethereum-mainnet.core.chainstack.com";
        case "polygon":
            return "polygon-mainnet.core.chainstack.com";
        case "bsc":
            return "bsc-mainnet.core.chainstack.com";
        case "avalanche":
            return "avalanche-mainnet.core.chainstack.com";
        case "arbitrum":
            return "arbitrum-mainnet.core.chainstack.com";
        case "scroll":
            return "scroll-sepolia.core.chainstack.com";
        case "fantom":
            return "fantom-mainnet.core.chainstack.com";
    }

    assertArgument(false, "unsupported network", "network", name);
}

/**
 *  The **ChainstackProvider** connects to the [[link-chainstack]]
 *  JSON-RPC end-points.
 *
 *  By default, a highly-throttled API key is used, which is
 *  appropriate for quick prototypes and simple scripts. To
 *  gain access to an increased rate-limit, it is highly
 *  recommended to [sign up here](link-chainstack-signup).
 */
export class ChainstackProvider extends JsonRpcProvider implements CommunityResourcable {
    /**
     *  The API key for the Chainstack connection.
     */
    readonly apiKey!: string;

    /**
     *  Create a new **ChainstackProvider**.
     *
     *  By default connecting to ``mainnet`` with a highly throttled
     *  API key.
     */
    constructor(_network?: Networkish, apiKey?: null | string) {
        if (_network == null) { _network = "mainnet"; }
        const network = Network.from(_network);
        if (apiKey == null) { apiKey = defaultApiKey; }

        const request = ChainstackProvider.getRequest(network, apiKey);
        super(request, network, { staticNetwork: network });

        defineProperties<ChainstackProvider>(this, { apiKey });
    }

    _getProvider(chainId: number): AbstractProvider {
        try {
            return new ChainstackProvider(chainId, this.apiKey);
        } catch (error) { }
        return super._getProvider(chainId);
    }

    isCommunityResource(): boolean {
        return (this.apiKey === defaultApiKey);
    }

    /**
     *  Returns a prepared request for connecting to %%network%% with
     *  %%apiKey%%.
     */
    static getRequest(network: Network, apiKey?: string): FetchRequest {
        if (apiKey == null) { apiKey = defaultApiKey; }

        const request = new FetchRequest(`https:/\/${ getHost(network.name) }/${ apiKey }`);
        request.allowGzip = true;

        if (apiKey === defaultApiKey) {
            request.retryFunc = async (request, response, attempt) => {
                showThrottleMessage("ChainstackProvider");
                return true;
            }
        }

        return request;
    }
}
