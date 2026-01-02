import { Asset, MarketData, PortfolioItem, PriceAlert } from './types';
import { USD_IDR_RATE } from './utils';

const createAsset = (id: string, symbol: string, name: string, type: any, priceUSD: number, change: number): Asset => ({
  id,
  symbol,
  name,
  type,
  priceUSD,
  priceIDR: priceUSD * USD_IDR_RATE,
  change24h: change,
  lastUpdated: new Date().toISOString(),
});

export const MOCK_MARKET_DATA: MarketData = {
  crypto: [
    createAsset('bitcoin', 'BTC', 'Bitcoin', 'CRYPTO', 64230.50, 2.4),
    createAsset('ethereum', 'ETH', 'Ethereum', 'CRYPTO', 3450.12, 1.8),
    createAsset('solana', 'SOL', 'Solana', 'CRYPTO', 145.20, -0.5),
    createAsset('bnb', 'BNB', 'Binance Coin', 'CRYPTO', 590.10, 0.4),
    createAsset('dogecoin', 'DOGE', 'Dogecoin', 'CRYPTO', 0.16, 5.2),
  ],
  stocksUS: [
    createAsset('aapl', 'AAPL', 'Apple Inc.', 'STOCK_US', 214.50, 1.2),
    createAsset('nvda', 'NVDA', 'NVIDIA Corp', 'STOCK_US', 135.58, -2.1),
    createAsset('msft', 'MSFT', 'Microsoft', 'STOCK_US', 448.37, 0.9),
    createAsset('tsla', 'TSLA', 'Tesla Inc', 'STOCK_US', 250.00, 4.5),
  ],
  stocksID: [
    createAsset('bbca', 'BBCA', 'Bank Central Asia', 'STOCK_ID', 0.61, 0.5), // ~10000 IDR
    createAsset('bbri', 'BBRI', 'Bank Rakyat Indonesia', 'STOCK_ID', 0.28, -1.0), // ~4500 IDR
    createAsset('tlkm', 'TLKM', 'Telkom Indonesia', 'STOCK_ID', 0.18, 0.0), // ~3000 IDR
    createAsset('goto', 'GOTO', 'GoTo Gojek Tokopedia', 'STOCK_ID', 0.003, -2.5), // ~50 IDR
  ],
  commodities: [
    createAsset('gold', 'XAU', 'Gold', 'COMMODITY', 2330.50, 0.4),
    createAsset('silver', 'XAG', 'Silver', 'COMMODITY', 29.50, 1.1),
  ]
};

// Fix ID stocks manually to look nicer in IDR
MOCK_MARKET_DATA.stocksID[0].priceIDR = 9950;
MOCK_MARKET_DATA.stocksID[1].priceIDR = 4450;
MOCK_MARKET_DATA.stocksID[2].priceIDR = 2900;
MOCK_MARKET_DATA.stocksID[3].priceIDR = 54;

MOCK_MARKET_DATA.stocksID[0].priceUSD = 9950 / USD_IDR_RATE;
MOCK_MARKET_DATA.stocksID[1].priceUSD = 4450 / USD_IDR_RATE;
MOCK_MARKET_DATA.stocksID[2].priceUSD = 2900 / USD_IDR_RATE;
MOCK_MARKET_DATA.stocksID[3].priceUSD = 54 / USD_IDR_RATE;

export const MOCK_PORTFOLIO: PortfolioItem[] = [
  { id: '1', assetId: 'bitcoin', amount: 0.05, avgBuyPriceUSD: 60000 },
  { id: '2', assetId: 'nvda', amount: 10, avgBuyPriceUSD: 120 },
  { id: '3', assetId: 'bbca', amount: 500, avgBuyPriceUSD: 0.55 }, // Bought cheap
  { id: '4', assetId: 'gold', amount: 2, avgBuyPriceUSD: 2300 },
];

export const MOCK_ALERTS: PriceAlert[] = [
  { id: '1', assetId: 'bitcoin', targetPrice: 70000, currency: 'USD', condition: 'ABOVE', isActive: true, createdAt: new Date().toISOString() },
  { id: '2', assetId: 'solana', targetPrice: 140, currency: 'USD', condition: 'BELOW', isActive: true, createdAt: new Date().toISOString() },
];
