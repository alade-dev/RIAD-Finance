import { useState, useEffect } from "react";
import { Loader2, X, Wallet, CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { walletAuthenticatedFetch } from "@/lib/client/wallet-auth-fetch";
import { enqueuePendingSetupAction } from "@/lib/client/history-queue";
import { toast } from "sonner";
import Link from "next/link";
import { useWriteContract, useReadContract } from "wagmi";
import {
  RIAD_FINANCE_PAYROLL_ABI,
  PAYROLL_CONTRACT_ADDRESS,
  USDC_ADDRESS,
  ERC20_ABI,
} from "@/lib/client/contract-config";

const FUNDING_HISTORY_TYPE = "fund-treasury";
const FUNDING_SUCCESS_MESSAGE = (amountUi: number) =>
  `Successfully deposited ${amountUi} USDC`;

export function DepositModal({
  isOpen,
  onClose,
  baseBalance = 0,
  privateBalance = 0,
  onDepositSuccess,
  treasuryPubkey,
}: {
  isOpen: boolean;
  onClose: () => void;
  baseBalance?: number;
  privateBalance?: number;
  onDepositSuccess?: () => void;
  treasuryPubkey?: string;
}) {
  const { publicKey, signMessage } = useWallet();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [successSig, setSuccessSig] = useState<string | null>(null);
  const [depositedAmount, setDepositedAmount] = useState<number | null>(null);
  const { writeContractAsync } = useWriteContract();

  // Fetch live base wallet USDC balance using Wagmi
  const { data: usdcBalanceData, refetch: refetchUsdcBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: publicKey ? [publicKey as `0x${string}`] : undefined,
    query: {
      enabled: !!publicKey,
    },
  });

  const liveBaseBalance = usdcBalanceData
    ? Number(usdcBalanceData) / 1_000_000
    : baseBalance;

  useEffect(() => {
    if (!isOpen) return;
    setSuccessSig(null);
    setDepositedAmount(null);
    setAmount("");
    if (publicKey) {
      void refetchUsdcBalance();
    }
  }, [isOpen, publicKey, refetchUsdcBalance]);

  if (!isOpen) return null;

  const handleClose = () => {
    setSuccessSig(null);
    setDepositedAmount(null);
    setAmount("");
    onClose();
  };

  const handleDeposit = async () => {
    if (!publicKey) {
      toast.error("Wallet not connected");
      return;
    }
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    if (val > liveBaseBalance) {
      toast.error("Insufficient base balance");
      return;
    }

    setLoading(true);
    try {
      const owner = publicKey;
      const amountMicro = BigInt(Math.round(val * 1_000_000));

      // 1. Approve USDC transfer to the payroll contract
      toast.info("Approving USDC transfer...");
      const approveTx = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [PAYROLL_CONTRACT_ADDRESS, amountMicro],
      });
      toast.success("USDC transfer approved!");

      // 2. Call depositFunds on the RIADFinancePayroll contract
      toast.info("Depositing funds to payroll treasury...");
      const depositTx = await writeContractAsync({
        address: PAYROLL_CONTRACT_ADDRESS,
        abi: RIAD_FINANCE_PAYROLL_ABI,
        functionName: "depositFunds",
        args: [USDC_ADDRESS, amountMicro],
      });

      // Save deposit to history via API
      try {
        await walletAuthenticatedFetch({
          path: `/api/history?wallet=${owner}`,
          method: "POST",
          signMessage,
          wallet: owner,
          body: {
            kind: "setup-action",
            wallet: owner,
            type: FUNDING_HISTORY_TYPE,
            amount: val,
            txSig: depositTx,
            status: "success",
          },
        });
      } catch (historyErr) {
        console.error("Failed to save deposit to history", historyErr);
        enqueuePendingSetupAction({
          kind: "setup-action",
          wallet: owner,
          type: FUNDING_HISTORY_TYPE,
          amount: val,
          txSig: depositTx,
          status: "success",
        });
      }

      toast.success(FUNDING_SUCCESS_MESSAGE(val));
      setDepositedAmount(val);
      setSuccessSig(depositTx);
      onDepositSuccess?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Deposit failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute right-6 top-6 rounded-xl p-2 text-[#a8a8aa] transition-colors hover:bg-white/5 hover:text-white"
        >
          <X size={18} />
        </button>

        {successSig ? (
          <>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
              <CheckCircle2 size={28} className="text-emerald-400" />
            </div>

            <h2 className="mb-1 text-2xl font-bold tracking-tight text-white">Deposit Complete</h2>
            <p className="mb-8 text-sm text-[#a8a8aa]">
              Your funds have been successfully deposited to the payroll treasury.
            </p>

            <div className="mb-8 rounded-2xl border border-white/5 bg-white/5 p-4">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#a8a8aa]">
                Amount Deposited
              </p>
              <p className="text-xl font-bold text-white">
                {depositedAmount?.toFixed(2)}{" "}
                <span className="text-sm text-emerald-400">
                  USDC
                </span>
              </p>
            </div>

            <div className="mb-8 space-y-2">
              <a
                href={`https://sepolia.arbiscan.io/tx/${successSig}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full items-center justify-between rounded-xl border border-white/5 bg-[#111111] px-4 py-3 transition-all hover:border-white/10 hover:bg-white/5"
              >
                <span className="font-mono text-xs text-[#a8a8aa] transition-colors group-hover:text-white">
                  View on Arbiscan
                </span>
                <div className="flex items-center gap-1.5 font-mono text-xs text-[#a855f7]">
                  {successSig.slice(0, 8)}...
                  <ExternalLink size={11} />
                </div>
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleClose}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#111111] border border-white/10 py-4 text-sm font-bold text-white transition-all hover:bg-white/5"
              >
                Close
              </button>
              <Link
                href="/people"
                onClick={handleClose}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white py-4 text-sm font-bold text-black transition-all hover:bg-white/90"
              >
                Go to Teammates
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 mx-auto">
              <Wallet size={28} className="text-white" />
            </div>

            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#111111] px-3 py-1.5 shadow-sm">
                <ShieldCheck size={14} className="text-[#a855f7]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#a855f7]">
                  Arbitrum Sepolia
                </span>
              </div>
            </div>

            <div className="text-center flex flex-col items-center">
              <h2 className="mb-1 text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <img src="/usdc-logo.png" alt="USDC" className="w-6 h-6 object-contain" />
                Deposit to Treasury
              </h2>
              <p className="mb-8 text-sm text-[#a8a8aa]">
                Add USDC from your wallet to the on-chain treasury to fund payroll streams.
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#a8a8aa] mb-1">
                  Your USDC Balance
                </p>
                <p className="text-xl font-bold text-white">
                  {liveBaseBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className="text-xs text-[#a8a8aa]">
                    USDC
                  </span>
                </p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#a8a8aa] mb-1">Treasury Balance</p>
                <p className="text-xl font-bold text-white">
                  {privateBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className="text-xs text-[#a8a8aa]">USDC</span>
                </p>
              </div>
            </div>

            <div className="mb-6 relative">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#a8a8aa]">
                  Amount (USDC)
                </label>
                <button
                  onClick={() => setAmount(liveBaseBalance.toString())}
                  className="text-[10px] font-bold uppercase tracking-widest text-[#a855f7] hover:text-[#a855f7]/80 transition-colors"
                >
                  Max
                </button>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-2xl border border-white/10 bg-[#111111] px-5 py-4 font-mono text-xl text-white outline-none transition-colors focus:border-[#a855f7]/50 focus:bg-[#a855f7]/5"
                min={0}
                step={0.01}
                max={liveBaseBalance}
              />
            </div>

            <button
              onClick={handleDeposit}
              disabled={
                loading ||
                !amount ||
                parseFloat(amount) <= 0 ||
                parseFloat(amount) > liveBaseBalance
              }
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#a855f7] py-4 text-sm font-bold text-black transition-all hover:bg-[#a855f7]/80 disabled:opacity-40"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? "Processing Deposit..." : "Confirm Deposit"}
            </button>
            <p className="mt-3 text-center text-xs text-[#a8a8aa]">
              Deposit authorizes the payroll smart contract to draw USDC from your wallet.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
