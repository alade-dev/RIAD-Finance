import { secp256k1 } from "@noble/curves/secp256k1.js";
import { keccak256, getAddress } from "viem";

/**
 * Derives an Ethereum address from an uncompressed public key hex string.
 */
export function publicKeyToAddress(publicKeyHex: string): string {
  let cleanHex = publicKeyHex.startsWith("0x") ? publicKeyHex.slice(2) : publicKeyHex;
  if (cleanHex.startsWith("04")) {
    cleanHex = cleanHex.slice(2);
  }
  const hash = keccak256(("0x" + cleanHex) as `0x${string}`);
  const address = "0x" + hash.slice(-40);
  return getAddress(address as `0x${string}`);
}

/**
 * Generates a one-time stealth destination address for a recipient's wallet address.
 * Under the hood, this simulates the Umbra Protocol SDK.
 */
export function generateStealthAddress(recipientAddress: string): {
  stealthAddress: string;
  ephemeralPublicKey: string;
} {
  // 1. Derive deterministic spending/viewing private keys for the recipient wallet address
  const cleanAddr = recipientAddress.toLowerCase();
  const spendingPrivateKeyHex = keccak256(Buffer.from(cleanAddr + "-spending-key-salt"));
  const viewingPrivateKeyHex = keccak256(Buffer.from(cleanAddr + "-viewing-key-salt"));

  const spendingPrivateKey = BigInt(spendingPrivateKeyHex);
  const viewingPrivateKey = BigInt(viewingPrivateKeyHex);

  // 2. Derive spending/viewing public key points (P = k * G)
  const P_s = secp256k1.Point.BASE.multiply(spendingPrivateKey);
  const P_v = secp256k1.Point.BASE.multiply(viewingPrivateKey);

  // 3. Generate a random ephemeral private key
  const randomBytes = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 32; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }
  const ephemeralPrivateKeyHex = "0x" + Array.from(randomBytes).map(b => b.toString(16).padStart(2, "0")).join("");
  const r = BigInt(ephemeralPrivateKeyHex);

  // 4. Compute ephemeral public key (R = r * G)
  const R = secp256k1.Point.BASE.multiply(r);
  const ephemeralPublicKey = "0x" + R.toHex(false); // Uncompressed hex string (starts with 04)

  // 5. Compute shared secret (S = r * P_v)
  const S = P_v.multiply(r);
  const sharedSecretHex = "0x" + S.toHex(false);

  // 6. Compute scalar offset (s = hash(S))
  const sHex = keccak256(Buffer.from(sharedSecretHex));
  const s = BigInt(sHex);

  // 7. Compute stealth public key (P_stealth = P_s + s * G)
  const sG = secp256k1.Point.BASE.multiply(s);
  const P_stealth = P_s.add(sG);

  // 8. Convert stealth public key to Ethereum address
  let stealthPubHex = P_stealth.toHex(false);
  if (!stealthPubHex.startsWith("04")) {
    stealthPubHex = "04" + stealthPubHex;
  }
  const stealthAddress = publicKeyToAddress(stealthPubHex);

  return {
    stealthAddress,
    ephemeralPublicKey,
  };
}
