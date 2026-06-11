"use client";

import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { useMemo } from "react";

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const truncated = useMemo(() => {
    if (!address) return null;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  return {
    connected: isConnected,
    connecting: isConnecting,
    publicKey: address || null,
    truncated,
    connect: async () => {
      const connector = connectors[0];
      if (connector) {
        connect({ connector });
      }
    },
    disconnect: async () => {
      disconnect();
    },
    wallets: connectors,
    activeWallet: null,
    selectAndConnect: async (connectorId: string) => {
      const connector = connectors.find((c) => c.id === connectorId);
      if (connector) {
        connect({ connector });
      }
    },
    signMessage: async (message: string | Uint8Array) => {
      const msgStr = typeof message === "string" ? message : new TextDecoder().decode(message);
      return await signMessageAsync({ message: msgStr });
    },
    signTransaction: async (tx: any) => {
      return tx;
    },
  };
}

