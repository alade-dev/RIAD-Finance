import { generateStealthAddress, publicKeyToAddress } from "../lib/server/umbra.ts";
import { privateKeyToAccount } from "viem/accounts";
import { toHex } from "viem";
import { secp256k1 } from "@noble/curves/secp256k1";

function test() {
  const recipient = "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1";
  console.log("Recipient Address:", recipient);
  
  const result = generateStealthAddress(recipient);
  console.log("Stealth Address:", result.stealthAddress);
  console.log("Ephemeral Public Key:", result.ephemeralPublicKey);

  // Cross-verify public key address derivation for a known private key
  const privKeyNum = 123456789n;
  const privateKeyHex = toHex(privKeyNum, { size: 32 });
  
  // 1. Get address via viem privateKeyToAccount
  const acc = privateKeyToAccount(privateKeyHex);
  console.log("Viem Derived Address:", acc.address);

  // 2. Get address via @noble/curves and our publicKeyToAddress helper
  const P = secp256k1.ProjectivePoint.BASE.multiply(privKeyNum);
  const derivedAddress = publicKeyToAddress(P.toHex(false));
  console.log("Noble Derived Address:", derivedAddress);

  if (acc.address === derivedAddress) {
    console.log("Address derivation matches successfully!");
  } else {
    throw new Error("Address derivation mismatch!");
  }
}

test();
