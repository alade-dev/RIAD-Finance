import { markEmployeePrivateRecipientInitialized } from "./payroll-store";

export async function sponsorInitializeEmployeeVault(
  employeeWallet: string,
  employerWallet: string,
): Promise<boolean> {
  try {
    // Mock the initialization of the private vault on Arbitrum / EVM by marking it initialized in DB.
    await markEmployeePrivateRecipientInitialized(employeeWallet);
    return true;
  } catch (error) {
    console.error("Failed to sponsor init employee vault:", error);
    return false;
  }
}
