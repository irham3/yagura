# <img src="public/logo.svg" width="32" height="32" align="center" /> agura

**Yagura** (Japanese: 櫓) is a high-performance market surveillance platform built for the modern trader. Drawing inspiration from the traditional Japanese watchtowers used in feudal fortresses, Yagura stands tall above the market landscape, providing a strategic vantage point to monitor movements across Crypto, Stocks, and Forex.

Just as a watchtower allows a sentry to spot opportunities or threats from a distance and signal the troops below, Yagura monitors real-time market data and dispatches critical signals via Telegram to keep you ahead of the curve.

## The Philosophy
**Yagura (櫓)** is a Japanese term for "Watchtower".

- **Watchtower (櫓):** Positioned at the highest point, offering a comprehensive view of the entire market landscape.
- **Strategic Command:** Precise, real-time data monitoring to identify patterns and signals.
- **Signal Fire:** Immediate notifications sent directly to your command center (Telegram).

## Features

- **Real-Time Surveillance:** Low-latency market data integration via WebSockets (Binance, Stock/Forex APIs).
- **Advanced Analytics:** Interactive, high-performance charts for deep technical analysis.
- **Multi-Asset Monitoring:** Unified view for Crypto, Stocks, and Forex markets.
- **Signal Integration:** Automated Telegram alerts for market movements and custom indicators.
- **Intelligent Caching:** Optimized data fetching to minimize API overhead and maximize speed.
- **Modern Tech Stack:** Built with Next.js 15, TypeScript, and high-performance caching layers.

## 🛠 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Runtime:** [Bun](https://bun.sh/)
- **Styling:** Tailwind CSS & Lucide Icons
- **Real-time Data:** WebSockets & Optimized REST fetching
- **Charts:** Advanced Analytical Charting Components

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (Recommended) or Node.js
- API Keys for market data providers (Binance, etc.)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/irham3/yagura.git
   cd yagura
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Setup environment variables:
   Create a `.env.local` file with your API keys.

4. Run the development server:
   ```bash
   bun dev
   ```
