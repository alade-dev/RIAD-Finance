"use client";

export default function NetworkSwitchGuide() {
  return (
    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 mb-6">
      <h3 className="text-xl font-bold text-yellow-900 mb-3 flex items-center gap-2">
        <img src="/arbitrum-logo.png" alt="Arbitrum" className="w-6 h-6 object-contain" />
        Important: Switch Your Wallet to Arbitrum Sepolia
      </h3>

      <div className="space-y-4 text-sm">
        <p className="text-yellow-800">
          RIAD Finance is currently deployed on <strong>Arbitrum Sepolia</strong> for testing.
          You need to switch your wallet to Arbitrum Sepolia before creating transactions.
        </p>

        <div className="bg-white rounded-lg p-4">
          <h4 className="font-bold text-gray-900 mb-2">📱 For MetaMask / Rainbow / EVM Wallets:</h4>
          <ol className="list-decimal list-inside space-y-1 text-gray-700">
            <li>Open your wallet extension</li>
            <li>Click the network dropdown at the top</li>
            <li>Select "Arbitrum Sepolia" (or enable Testnets in settings if hidden)</li>
            <li>Verify you are connected to the correct chain</li>
            <li>Refresh this page</li>
          </ol>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100/50 flex items-center justify-center shrink-0 border border-blue-200">
            <img src="/eth-logo.png" alt="ETH" className="w-6 h-6 object-contain" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-blue-900 mb-1">💰 Need Sepolia ETH?</h4>
            <p className="text-blue-800 mb-2">
              Get free testnet ETH for gas:
            </p>
            <a
              href="https://faucet.quicknode.com/arbitrum/sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all text-xs"
            >
              Get Sepolia ETH →
            </a>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-4">
          <h4 className="font-bold text-gray-900 mb-2">🔍 Verify Network:</h4>
          <p className="text-gray-700">
            After switching, you should see a green banner or indicator showing
            "Connected to Arbitrum Sepolia". If you still see a warning, try refreshing the page.
          </p>
        </div>
      </div>
    </div>
  );
}
