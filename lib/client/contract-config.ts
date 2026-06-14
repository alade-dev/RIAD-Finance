// Configuration for the RIADFinancePayroll contract deployment and ERC-20 tokens on EVM/Arbitrum.

export const PAYROLL_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_PAYROLL_CONTRACT_ADDRESS as `0x${string}`) ||
  "0xD61f56213E17F131DC0A34AB16C982742C56586b"; // Fallback Sepolia / local address

export const USDC_ADDRESS =
  (process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`) ||
  "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"; // Fallback Arbitrum Sepolia USDC

export const RIAD_FINANCE_PAYROLL_ABI = [
  {
    type: "constructor",
    inputs: [
      { name: "initialOwner", type: "address", internalType: "address" },
      { name: "_sablierLockup", type: "address", internalType: "address" }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "registerCompany",
    inputs: [{ name: "name", type: "string", internalType: "string" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "depositFunds",
    inputs: [
      { name: "token", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "withdrawFunds",
    inputs: [
      { name: "token", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "createStream",
    inputs: [
      { name: "recipient", type: "address", internalType: "address" },
      { name: "token", type: "address", internalType: "address" },
      { name: "depositAmount", type: "uint128", internalType: "uint128" },
      { name: "cliffDuration", type: "uint40", internalType: "uint40" },
      { name: "totalDuration", type: "uint40", internalType: "uint40" }
    ],
    outputs: [{ name: "streamId", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "cancelStream",
    inputs: [{ name: "streamId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "registerConfidentialEmployee",
    inputs: [
      { name: "employee", type: "address", internalType: "address" },
      { name: "encryptedName", type: "bytes", internalType: "bytes" },
      { name: "encryptedSalary", type: "bytes", internalType: "bytes" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "processConfidentialSalary",
    inputs: [
      { name: "employee", type: "address", internalType: "address" },
      { name: "encryptedSalaryProof", type: "bytes", internalType: "bytes" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "companies",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [
      { name: "name", type: "string", internalType: "string" },
      { name: "employerWallet", type: "address", internalType: "address" },
      { name: "treasury", type: "address", internalType: "address" },
      { name: "isRegistered", type: "bool", internalType: "bool" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "treasuryBalances",
    inputs: [
      { name: "", type: "address", internalType: "address" },
      { name: "", type: "address", internalType: "address" }
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "streams",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "streamId", type: "uint256", internalType: "uint256" },
      { name: "employer", type: "address", internalType: "address" },
      { name: "employee", type: "address", internalType: "address" },
      { name: "token", type: "address", internalType: "address" },
      { name: "amount", type: "uint128", internalType: "uint128" },
      { name: "active", type: "bool", internalType: "bool" }
    ],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "StreamCreated",
    inputs: [
      { name: "streamId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "employer", type: "address", indexed: true, internalType: "address" },
      { name: "employee", type: "address", indexed: true, internalType: "address" },
      { name: "token", type: "address", indexed: false, internalType: "address" },
      { name: "amount", type: "uint128", indexed: false, internalType: "uint128" }
    ],
    anonymous: false
  },
  {
    type: "function",
    name: "setTeeTreasury",
    inputs: [{ name: "teeTreasury", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "teeTransfer",
    inputs: [
      { name: "employer", type: "address", internalType: "address" },
      { name: "token", type: "address", internalType: "address" },
      { name: "recipients", type: "address[]", internalType: "address[]" },
      { name: "amounts", type: "uint256[]", internalType: "uint256[]" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  }
] as const;

export const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" }
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "recipient", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" }
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable"
  }
] as const;
