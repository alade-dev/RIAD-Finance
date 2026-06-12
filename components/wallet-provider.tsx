"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import {
  rainbowWallet,  
  metaMaskWallet,
  coinbaseWallet,
  trustWallet,
  ledgerWallet,
  phantomWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { WagmiProvider } from "wagmi";
import { arbitrum, arbitrumSepolia } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactNode } from "react";

const queryClient = new QueryClient();

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "3a8170812b534d0ff9d794f1953d50d1";

const config = getDefaultConfig({
  appName: "RIAD Finance",
  projectId,
  chains: [arbitrum, arbitrumSepolia],
  wallets: [
    {
      groupName: "Popular",
      wallets: [
        metaMaskWallet,
        rainbowWallet,
        coinbaseWallet,
        trustWallet,
        ledgerWallet,
        phantomWallet,
        walletConnectWallet,
      ],
    },
  ],
  ssr: true,
});

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
