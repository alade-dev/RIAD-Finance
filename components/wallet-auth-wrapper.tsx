"use client";

import { ReactNode, useEffect, useState, startTransition } from "react";
import { useWallet } from "@/hooks/useWallet";
import { ShieldAlert, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { loadCachedWalletSession, getOrCreateWalletSession } from "@/lib/client/wallet-auth-fetch";

export function WalletAuthWrapper({ children }: { children: ReactNode }) {
  const { connected, publicKey, signMessage } = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) {
      setIsAuthenticated(false);
      return;
    }

    // Check if we already have a valid session stored
    const cachedSession = loadCachedWalletSession(publicKey);
    if (cachedSession) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [connected, publicKey]);

  const handleAuthenticate = async () => {
    if (!publicKey || !signMessage) return;

    setAuthenticating(true);
    try {
      await getOrCreateWalletSession({
        wallet: publicKey,
        signMessage,
      });
      toast.success("Successfully authenticated!");
      startTransition(() => {
        setIsAuthenticated(true);
      });
    } catch (err: any) {
      console.error("Authentication failed", err);
      toast.error(err?.message || "Failed to authenticate session. Please try signing the message again.");
    } finally {
      setAuthenticating(false);
    }
  };

  // If not connected to a wallet, let the parent layout show the connect prompt
  if (!connected || !publicKey) {
    return <>{children}</>;
  }

  // If connected but not authenticated, show the premium sign-in screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        {/* Decorative background gradients */}
        <div className="absolute inset-0 bg-radial-gradient from-[#a855f7]/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="w-full max-w-md bg-[#0a0a0a]/80 border border-white/10 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#a855f7]/50 to-transparent" />
          
          <div className="w-16 h-16 bg-[#a855f7]/10 rounded-2xl border border-[#a855f7]/20 flex items-center justify-center mb-6 shadow-lg shadow-[#a855f7]/5 shrink-0 animate-pulse">
            <KeyRound size={28} className="text-[#a855f7]" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-sm text-[#a8a8aa] mb-6 max-w-xs leading-relaxed">
            Please sign a secure, gas-free message with your wallet to authenticate and access your payroll workspace.
          </p>

          <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 mb-8 text-left font-mono">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#a8a8aa] mb-1.5">
              Connected Wallet Address
            </div>
            <div className="text-xs text-white truncate">
              {publicKey}
            </div>
          </div>

          <button
            onClick={handleAuthenticate}
            disabled={authenticating}
            className="w-full py-4 bg-[#a855f7] hover:bg-[#a855f7]/85 active:scale-[0.99] text-black font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:shadow-[0_0_45px_rgba(168,85,247,0.35)] disabled:opacity-50 disabled:shadow-none uppercase tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {authenticating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing Message...
              </>
            ) : (
              <>
                <ShieldAlert size={16} />
                Authenticate & Enter
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Once authenticated, render children
  return <>{children}</>;
}
