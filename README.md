# <img src="public/logo.png" width="42" height="42" align="center" style="vertical-align: middle;" /> RIAD Finance

### **Private Real-Time Payroll on Arbitrum — Stream Money Second-by-Second and Keep Salaries Private**

---

[![Network: Arbitrum Sepolia](https://img.shields.io/badge/Network-Arbitrum_Sepolia-blue?logo=arbitrum&style=flat-square)](https://arbitrum.io/)
[![Compute: Fhenix FHE](https://img.shields.io/badge/Confidential_Compute-Fhenix_FHE-purple?style=flat-square)](https://www.fhenix.io/)
[![Streaming: Sablier V2](https://img.shields.io/badge/Streaming-Sablier_V2-orange?style=flat-square)](https://sablier.com/)
[![Stealth: Umbra Protocol](https://img.shields.io/badge/Privacy-Umbra_Stealth-green?style=flat-square)](https://umbra.cash/)
[![Frontend: Next.js 14](https://img.shields.io/badge/Frontend-Next.js_14-black?logo=next.js&style=flat-square)](https://nextjs.org/)

[About the Project](#about-the-project) • [The Problem](#the-problem) • [Why Companies Need This](#why-companies-need-this) • [How It Works Under the Hood](#how-it-works-under-the-hood) • [How We Keep It Safe](#how-we-keep-it-safe) • [How We Compare](#how-we-compare-to-others) • [How to Set Up and Run the Code](#how-to-set-up-and-run-the-code)

---

## About the Project

**RIAD Finance** is a tool that lets companies pay their workers in real-time while keeping everyone's salaries private. 

On normal blockchains (like Ethereum or Arbitrum), every transaction is public. This means anyone can look up how much money your company has, who you are paying, and exactly how much each employee makes. 

RIAD Finance solves this by combining three tools:
1. **Sablier**: Streams money to workers second-by-second.
2. **Fhenix**: Uses private smart contracts to hide the exact salary amounts from the public.
3. **Umbra Protocol**: Lets employees withdraw their earnings to a new, private wallet address so their personal wallet is never linked to the company treasury.

---

## The Problem

### 1. Public Salaries Hurt Team Morale
When everyone's pay is completely public on the blockchain:
* **Jealousy and Resentment**: When workers see that someone else makes more money than them, they get unhappy and might quit.
* **Losing Key Team Members**: Top workers often leave the company if they find out that a newer or less experienced hire negotiated a higher salary.
* **Bonus Expectations**: If a company gives a private bonus to one employee, everyone else can see it online and will expect a bonus too.
* **Office Gossip**: Every pay raise is visible on-chain, which turns team compensation into a topic for office gossip.

### 2. Competitors and Outsiders Can Spy on You
When payroll is public, anyone can read your company's data:
* **Spying on Your Savings**: Competitors and investors can watch your main company wallet to see exactly how much you spend and how much money you have left.
* **Stealing Your Staff**: Competitors can see who works for you and exactly how much they earn. They can use this info to offer your workers a slightly higher salary and steal them away.
* **Scams and Hacking**: Hackers can easily identify which employees are paid the most and target them with scams.
* **Permanent Links**: Every payment leaves a permanent link online between the company's wallet and the worker's wallet.


---

## Why Companies Need This

As more remote teams and internet companies start paying their workers with crypto, having a private and easy way to pay people is very important.

| Who is this for? | Market Size | The Problem | Our Solution |
| :--- | :--- | :--- | :--- |
| **Crypto Companies** | 50,000+ companies | Everyone's pay and company spend are public. | Keeps pay rates and transaction history private. |
| **Remote Teams** | 70M+ workers | High bank wire fees and long waits to get paid. | Streams stablecoins instantly with almost zero fees on Arbitrum. |
| **DAOs & Contributor Hubs** | $25B+ Assets | No way to pay contributors privately. | Lets DAOs stream pay to contributors without revealing addresses. |

---

## How It Works Under the Hood

RIAD Finance uses simple pieces to keep things fast, cheap, and private:

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│                          Next.js Frontend (The Website)                        │
│                                                                                │
│   ┌──────────────────────────┐   ┌──────────────────────────┐   ┌──────────┐   │
│   │    Employer Dashboard    │   │      Employee Portal     │   │ Treasury │   │
│   └────────────┬─────────────┘   └────────────┬─────────────┘   └────┬─────┘   │
│                │                              │                      │         │
│  ┌─────────────▼──────────────────────────────▼──────────────────────▼──────┐  │
│  │                     RainbowKit / Wagmi / Viem (Connect Wallet)           │  │
│  └────────────────────────────────────┬─────────────────────────────────────┘  │
│                                       │ (Secure Signatures & Wallet Info)
│  ┌────────────────────────────────────▼─────────────────────────────────────┐  │
│  │                     Next.js API Layer (Backend Server)                   │  │
│  │                /api/payroll  ·  /api/employees  ·  /api/treasury         │  │
│  └────────────────────────────────────┬─────────────────────────────────────┘  │
└───────────────────────────────────────┼────────────────────────────────────────┘
                                        │
                 ┌──────────────────────▼──────────────────────┐
                 │                   ARBITRUM TESTNET L2       │
                 │                                             │
                 │  ┌───────────────────────────────────────┐  │
                 │  │       RIADFinancePayroll Contract     │  │
                 │  │       (Handles deposits and setups)   │  │
                 │  └───────────────────┬───────────────────┘  │
                 │                      │                      │
                 │                      ▼                      │
                 │  ┌───────────────────────────────────────┐  │
                 │  │           Sablier V2 Contract         │  │
                 │  │       (Streams money second-by-second)│  │
                 │  └───────────────────┬───────────────────┘  │
                 │                      │                      │
                 │                      ▼                      │
                 │  ┌───────────────────────────────────────┐  │
                 │  │         Fhenix Private Compute        │  │
                 │  │       (Hides salary numbers on-chain) │  │
                 │  └───────────────────────────────────────┘  │
                 └─────────────────────────────────────────────┘
```

### The Technology Stack:
1. **Frontend**: Built with **Next.js 16** using Tailwind CSS for a clean, modern design.
2. **Streaming Engine**: Built on **Sablier** to handle the second-by-second streaming of tokens with low transaction costs (gas).
3. **Privacy engine**: Uses **Fhenix** smart contracts to keep salary math hidden from the public blockchain.
4. **Stealth Payouts**: Uses **Umbra Protocol** concepts to let employees claim their money to a new, private address each time.
5. **Database**: Uses **MongoDB** to store user configurations and load dashboards instantly.

---

## How We Keep It Safe

* **Sign-in with Wallet**: Instead of usernames and passwords, users sign in securely using their crypto wallet.
* **Encrypted Keys**: Sensitive keys are locked up safely using industry-standard encryption (AES-256-GCM) so hackers cannot read them.
* **Safe Smart Contracts**: We build on top of trusted, audited smart contract libraries from OpenZeppelin to prevent common hacks.
* **Decimal Helper**: Automatically handles different token formats (like USDC which uses 6 decimals and WETH which uses 18 decimals) so transactions are always correct.
* **Private Destination Wallet**: When workers withdraw their salary, the protocol sends it to a new private address. This cuts the link between the company's main wallet and the employee's personal wallet.

---

## How We Compare to Others

| Feature | Other Streaming Apps (Sablier/Superfluid) | Traditional Bank Wires | RIAD Finance |
| :--- | :---: | :---: | :---: |
| **Stream Money Second-by-Second** |  ✅ Yes | ❌ No | ✅ Yes |
| **Low Fees & Fast Transfer** | ✅ Yes | ❌ No | ✅ Yes |
| **Hides Salary Amounts** | ❌ No | ✅ Yes | ✅ Yes |
| **Hides Employee Wallet Address** | ❌ No | ✅ Yes | ✅ Yes |

---

## How to Set Up and Run the Code

### Prerequisites

You will need the following tools installed on your computer:
* **Node.js** (v18 or higher)
* **Foundry** (to compile and test smart contracts)
* **MongoDB** (installed locally or using a MongoDB Atlas account)

---

### Installation & Setup

#### 1. Clone the Code and Install Packages
Run these commands in your terminal:
```bash
git clone https://github.com/alade-dev/RIAD-Finance.git
cd RIAD-Finance
npm install
```

#### 2. Configure Your Environment Variables
Make a copy of the example environment file:
```bash
cp .env.example .env
```
Open the new `.env` file in your text editor and fill in the values:
* `DATABASE_URL` (Your MongoDB connection string)
* `NEXT_PUBLIC_RPC_URL` (Your Arbitrum Sepolia node endpoint)
* `PRIVATE_KEY` (Your private key for testing and deploying contracts)

---

### Smart Contract Development

To compile and test the Solidity smart contracts:

```bash
cd contracts

# Install foundry libraries
forge install

# Build the contracts
npm run build

# Run tests
npm run test
```

#### Deploying Contracts to Testnet
When you are ready to deploy the contracts to the Arbitrum Sepolia testnet, run:
```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $ARBITRUM_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast -vvv
```

---

### Running the Web Application

Go back to the main folder and start the local website server:

```bash
cd ..
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser. Connect your MetaMask or any other supported Web3 wallet to start using the app.
