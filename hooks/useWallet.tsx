"use client";

import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { useMemo, useCallback } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { openConnectModal } = useConnectModal();

  const truncated = useMemo(() => {
    if (!address) return null;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  const connectFn = useCallback(async () => {
    if (openConnectModal) {
      openConnectModal();
    } else {
      const connector = connectors[0];
      if (connector) {
        connect({ connector });
      }
    }
  }, [openConnectModal, connectors, connect]);

  const disconnectFn = useCallback(async () => {
    disconnect();
  }, [disconnect]);

  const selectAndConnectFn = useCallback(async (connectorId: string) => {
    const connector = connectors.find((c) => c.id === connectorId);
    if (connector) {
      connect({ connector });
    }
  }, [connectors, connect]);

  const signMessageFn = useCallback(async (message: string | Uint8Array) => {
    const msgStr = typeof message === "string" ? message : new TextDecoder().decode(message);
    return await signMessageAsync({ message: msgStr });
  }, [signMessageAsync]);

  const signTransactionFn = useCallback(async (tx: any) => {
    return tx;
  }, []);

  return useMemo(() => ({
    connected: isConnected,
    connecting: isConnecting,
    publicKey: address || null,
    truncated,
    connect: connectFn,
    disconnect: disconnectFn,
    wallets: connectors,
    activeWallet: null,
    selectAndConnect: selectAndConnectFn,
    signMessage: signMessageFn,
    signTransaction: signTransactionFn,
  }), [
    isConnected,
    isConnecting,
    address,
    truncated,
    connectFn,
    disconnectFn,
    connectors,
    selectAndConnectFn,
    signMessageFn,
    signTransactionFn,
  ]);
}

