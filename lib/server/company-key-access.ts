import { loadCompanyPrivateKey } from "./company-key-vault";

/**
 * Internal-only helpers for backend worker.
 * Never expose these privateKeys from API routes.
 */

export function loadCompanyTreasuryPrivateKey(companyId: string) {
  return loadCompanyPrivateKey({
    companyId,
    kind: "treasury",
  });
}

export function loadCompanySettlementPrivateKey(companyId: string) {
  return loadCompanyPrivateKey({
    companyId,
    kind: "settlement",
  });
}
