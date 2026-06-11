// Mock implementation of magicblock-api to remove Solana dependencies during Arbitrum migration.
// These will be fully replaced with EVM/Sablier equivalents in Phase 2-4.

export const DEVNET_USDC = "0x0000000000000000000000000000000000000000"; // Mock USDC address

export interface PrivateTransferPrivacyConfig {
  delaySeconds?: number;
  splitCount?: number;
}

export async function checkHealth(): Promise<{ status: string }> {
  return { status: "ok" };
}

export async function getBalance(walletAddress: string): Promise<{ balance: string }> {
  return { balance: "1000000000" }; // Mock balance (1000.00 USDC in 6 decimals)
}

export async function getPrivateBalance(walletAddress: string, token: string): Promise<{ balance: string }> {
  return { balance: "500000000" }; // Mock private balance (500.00 USDC)
}

export async function fetchTeeAuthToken(publicKey: any, signMessage: any): Promise<string> {
  return "mock-jwt-token";
}

export function isJwtExpired(token: string): boolean {
  return false;
}

export async function deposit(owner: string, amount: number): Promise<{ transactionBase64: string; sendTo: string }> {
  return { transactionBase64: "mock-tx-base64", sendTo: "mock-recipient" };
}

export async function withdraw(owner: string, amount: number): Promise<{ transactionBase64: string; sendTo: string }> {
  return { transactionBase64: "mock-tx-base64", sendTo: "mock-recipient" };
}

export async function buildPrivateTransfer(params: {
  from: string;
  to: string;
  amount: number;
  outputMint: string;
  balances: { fromBalance: string; toBalance: string };
  privacy?: PrivateTransferPrivacyConfig;
}): Promise<{ transactionBase64: string; sendTo: string }> {
  return { transactionBase64: "mock-tx-base64", sendTo: "mock-recipient" };
}

export async function signAndSend(
  transactionBase64: string,
  signTransaction: any,
  options?: { sendTo?: string; signMessage?: any; publicKey?: any }
): Promise<string> {
  return "0xmocktransactionhash";
}

export function deserializeTx(txBase64: string): any {
  return {};
}
