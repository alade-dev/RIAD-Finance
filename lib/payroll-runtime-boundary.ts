export const PAYROLL_RUNTIME_BOUNDARY = {
  base: {
    label: "Arbitrum Sepolia",
    shortLabel: "Arbitrum",
    description:
      "Company setup, treasury funding, and stream creations live on Arbitrum Sepolia.",
  },
  per: {
    label: "Sablier Streams",
    shortLabel: "Sablier",
    description:
      "Live salary accrual and streaming withdrawals live in Sablier   streams.",
  },
  server: {
    label: "RIAD Finance Bridge",
    shortLabel: "Bridge",
    description:
      "RIAD Finance bridges wallet auth, signed snapshot reads, and stealth address generation.",
  },
} as const;

export const PAYROLL_RUNTIME_BOUNDARY_PILLS = [
  {
    key: "base",
    label: PAYROLL_RUNTIME_BOUNDARY.base.label,
    copy: PAYROLL_RUNTIME_BOUNDARY.base.description,
  },
  {
    key: "per",
    label: PAYROLL_RUNTIME_BOUNDARY.per.label,
    copy: PAYROLL_RUNTIME_BOUNDARY.per.description,
  },
] as const;
