<div align="center">

# Axoo

### Swap. Escrow. Own.

**A stablecoin commerce app built natively on Arc Testnet - powered by Circle.**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://arcora-opal.vercel.app/)
[![Built with Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Arc Testnet](https://img.shields.io/badge/network-Arc%20Testnet-8A2BE2)](https://docs.arc.io)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](#license)

[Live Demo](https://arcora-opal.vercel.app/) · [Report a Bug](../../issues) · [Twitter](https://x.com/forbyuu) · [Telegram](https://t.me/timer28)

</div>

---

## Overview

Axoo is a Web3 application on **Arc Testnet**, Circle's stablecoin-native L1. It brings together onchain trade escrow, token swaps, cross-chain bridging, and stablecoin transfers into a single interface — built on Arc's officially pre-deployed ERC-8004 / ERC-8183 contracts and Circle's App Kit.

Access to the app is gated by a **Genesis Pass NFT**, an ERC-721 contract deployed by this project.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Smart Contracts](#smart-contracts)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [Changelog](#changelog)
- [License](#license)

---

## Features

### 🔗 Wallet Connection
- Connect via Reown AppKit
- Multi-wallet support (MetaMask and any EIP-6963-compatible wallet)
- Real-time account info and network status

### 📊 Portfolio Dashboard
- USDC and EURC balances
- NFT holdings
- Total assets overview

### 🤝 Trade Escrow
Built on Arc's **ERC-8004** (Identity Registry) and **ERC-8183** (Agentic Commerce) contracts.
- Onchain trade identity registration for buyers and suppliers
- Purchase order creation with supplier-set pricing
- Milestone-based USDC escrow: `Created → Funded → Submitted → Completed`
- Proof-of-delivery submission before funds release
- Every step is a real onchain transaction — no off-chain state

### 💱 Token Swap
Powered by Circle App Kit.
- USDC ⇄ EURC swaps
- Quote estimation with configurable slippage
- Swap history with ArcScan explorer links

### 🌉 Cross-Chain Bridge
Powered by Circle's CCTP (Cross-Chain Transfer Protocol).
- Bridge USDC from Base Sepolia to Arc Testnet
- Bridge history tracking
- Multi-chain support

### 💸 Send
Powered by Circle App Kit's browser wallet flow.
- Direct wallet-to-wallet USDC transfers on Arc Testnet
- Transaction estimation before sending
- ArcScan transaction verification

### 🎫 Genesis Pass
- ERC-721 access pass, deployed by this project
- Gates access to Escrow, Swap, Bridge, and Send

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS |
| **Web3** | Wagmi, Viem, Reown AppKit |
| **Circle Ecosystem** | `@circle-fin/app-kit`, `@circle-fin/adapter-viem-v2` |
| **Data & UI** | TanStack Query, Recharts, Sonner, Lucide React |

---

## Smart Contracts

Contract addresses on Arc Testnet:

| Contract | Address | Deployed by |
|---|---|---|
| Genesis Pass (ERC-721) | `[fill in NEXT_PUBLIC_GENESIS_PASS_CONTRACT]` | This project |
| Identity Registry (ERC-8004) | `0x8004A818BFB912233c491871b3d84c89A494BD9e` | Arc (shared, official) |
| Agentic Commerce / Escrow (ERC-8183) | `0x0747EEf0706327138c69792bF28Cd525089e4583` | Arc (shared, official) |
| Reputation Registry | `0x8004B663056A597Dffe9eCcC1965A193B7388713` | Arc (shared, official) |
| Validation Registry | `0x8004Cb1BF31DAf7788923b405b754f57acEB4272` | Arc (shared, official) |

> The Genesis Pass is the only contract deployed specifically for ARCora. Escrow and identity functionality build on Arc's shared, officially pre-deployed tutorial contracts rather than reimplementing them — Swap and Bridge run through Circle's App Kit / CCTP infrastructure.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/Arcticoz/arcora.git
cd arcora
npm install
```

### Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
PRIVATE_KEY=your_private_key
KIT_KEY=KIT_KEY:your_key_id:your_key_secret
NEXT_PUBLIC_GENESIS_PASS_CONTRACT=0x...
```

> `PRIVATE_KEY` and `KIT_KEY` are server-only secrets — never commit them or expose them to the client. `NEXT_PUBLIC_GENESIS_PASS_CONTRACT` is safe to expose since it's a public contract address.

---

## Screenshots

### Dashboard
<img width="1768" height="907" alt="Dashboard" src="https://github.com/user-attachments/assets/b8f4540a-324c-4df7-8daa-fabd5a02358b" />

### Portfolio
<img width="1404" height="904" alt="Portfolio" src="https://github.com/user-attachments/assets/374e45e3-7889-4c1d-b517-d7639d076518" />

### Trade Escrow
<img width="1324" height="905" alt="Trade Escrow" src="https://github.com/user-attachments/assets/b1c8a2a1-f082-4a25-8276-93789775af5f" />

### Swap
<img width="1322" height="905" alt="Swap" src="https://github.com/user-attachments/assets/5e6abea1-467e-4d52-b139-0937cabc2970" />

### Bridge
<img width="1571" height="905" alt="Bridge" src="https://github.com/user-attachments/assets/1c84ba12-d8ef-41d1-b031-1f9e203f103f" />

### Send
<img width="1752" height="905" alt="Send" src="https://github.com/user-attachments/assets/66d16adb-501e-459b-8e28-33180f1da098" />

### Genesis Pass
<img width="1603" height="901" alt="Genesis Pass" src="https://github.com/user-attachments/assets/591280ab-aea7-4c7a-85ec-4e39d63c1900" />

---

## Roadmap

- [ ] Fully client-signed Swap flow (currently routed through a backend proxy due to CORS on Circle's Stablecoin Kit service)
- [ ] Autonomous agent provider for Trade Escrow — an automated wallet that listens for jobs and fulfills them without manual interaction
- [ ] Deeper integration with Circle Agent Stack (Agent Wallets, Circle CLI, Agent Marketplace)

---

## Changelog

### Refactor: NFT Contract Deployment
Replaced the custom Solidity ERC-721 contract with Circle's official Smart Contract Template.

- Migrated deployment to the Circle SDK workflow
- Removed dependency on a manually maintained ERC-721 contract
- Standardized deployment according to Circle documentation
- Improved integration with the Circle Developer Platform

---

## License

MIT

---

<div align="center">

Built with ❤️ using Next.js and Circle Web3 Services.

[Twitter](https://x.com/forbyuu) · [Telegram](https://t.me/timer28)

</div>
