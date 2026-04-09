/**
 * Minimal EIP-1193 provider type declaration for `window.ethereum`.
 *
 * Covers the subset of the spec used by MetaMask and most injected wallets.
 * For the full spec see: https://eips.ethereum.org/EIPS/eip-1193
 */

export interface EthereumRequestArguments {
  method: string;
  params?: unknown[] | Record<string, unknown>;
}

export type EthereumEventName = 'accountsChanged' | 'chainChanged' | 'connect' | 'disconnect' | 'message';

export interface EthereumConnectInfo {
  chainId: string;
}

export interface EthereumProvider {
  /** Sends a JSON-RPC request to the wallet. */
  request(args: EthereumRequestArguments): Promise<string[]>;

  /** Registers an event listener. */
  on(event: 'accountsChanged', listener: (accounts: string[]) => void): this;
  on(event: 'chainChanged', listener: (chainId: string) => void): this;
  on(event: 'connect', listener: (info: EthereumConnectInfo) => void): this;
  on(event: 'disconnect', listener: (error: {code: number; message: string}) => void): this;
  on(event: string, listener: (...args: unknown[]) => void): this;

  /** Removes an event listener. */
  removeListener(event: string, listener: (...args: unknown[]) => void): this;

  /** True when the provider is MetaMask. */
  isMetaMask?: boolean;

  /** The currently connected chain ID (hex string, e.g. "0x1"). */
  chainId?: string | null;

  /** The currently selected accounts (may be empty before user grants access). */
  selectedAddress?: string | null;
}

declare global {
  interface Window {
    /**
     * Injected EIP-1193 Ethereum provider.
     * Present only when a browser extension wallet (e.g. MetaMask) is installed.
     */
    ethereum?: EthereumProvider;
  }
}
