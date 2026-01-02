export type AssetType = 'CRYPTO' | 'STOCK_US' | 'STOCK_ID' | 'COMMODITY';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  priceUSD: number;
  priceIDR: number;
  change24h: number; // percentage
  lastUpdated: string; // ISO date
}

export interface PortfolioItem {
  id: string;
  assetId: string;
  amount: number;
  avgBuyPriceUSD: number;
}

export interface PriceAlert {
  id: string;
  assetId: string;
  targetPrice: number;
  currency: 'USD' | 'IDR';
  condition: 'ABOVE' | 'BELOW';
  isActive: boolean;
  createdAt: string;
}

export interface MarketData {
  crypto: Asset[];
  stocksUS: Asset[];
  stocksID: Asset[];
  commodities: Asset[];
}
