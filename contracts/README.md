# RIAD Finance - Smart Contracts

EVM-based payroll and expense management contracts built on Arbitrum using OpenZeppelin and Sablier.

## Directory Structure

```
contracts/
├── src/
│   ├── RIADFinancePayroll.sol    # Core payroll contract
│   ├── interfaces/
│   │   └── IFhenixConfidential.sol # Fhenix integration interface
│   └── libraries/
│       └── TokenMath.sol         # EVM token decimal handling
├── test/
│   └── RIADFinancePayroll.t.sol  # Foundry tests
├── script/
│   └── Deploy.s.sol              # Deployment script
└── foundry.toml                  # Foundry configuration
```

## Setup

### Prerequisites

- [Foundry](https://getfoundry.sh/) installed
- Node.js 18+ for npm dependencies

### Installation

```bash
# Install Foundry dependencies
cd contracts
forge install

# Install npm dependencies for solhint, etc
npm install
```

## Build & Test

```bash
# Build contracts
npm run build

# Run tests
npm run test

# Generate gas report
npm run test:gas

# Format code
npm run format
```

## Deployment

### Arbitrum Sepolia (Testnet)

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $ARBITRUM_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast -vvv
```

### Arbitrum One (Mainnet)

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $ARBITRUM_ONE_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast -vvv
```

## Architecture

### Token Standards

- **USDC (6 decimals)** - Primary stablecoin for salary disbursement
- **WETH (18 decimals)** - Secondary token, requires decimal normalization
- **Native ETH** - Supported for direct streaming

### Core Features

1. **Streaming Payroll** - Real-time salary distribution via Sablier  
2. **Confidential Metrics** - Fhenix integration for encrypted data processing
3. **Event-Driven Analytics** - Dune-compatible event emission for indexing
4. **Access Control** - Ownable2Step for multi-sig safety
5. **Reentrancy Protection** - ReentrancyGuard on stream operations

## Security

All contracts inherit from OpenZeppelin v5+ standards:
- `Ownable2Step` for secure access control
- `ReentrancyGuard` for protection against reentrancy attacks
- ERC-20 safe transfer patterns
- Event-based change tracking

## Dune Analytics Integration

All critical state changes emit structured events:
- `CompanyRegistered` - Company onboarded
- `TreasuryFunded` - Funds deposited to payroll contract
- `StreamStarted` - Salary stream initiated
- `FundsWithdrawn` - Funds claimed by employee
- `StreamCanceled` - Stream cancelled by employer

These events are indexed and dashboards can be built on Dune Analytics.
