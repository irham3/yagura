import yahooFinance from 'yahoo-finance2';

// 1. Crypto Fetcher (CoinGecko via simple fetch to avoid heavy library)
// Using pure fetch for CoinGecko nicely handles the lightweight nature we need
// but we'll map it to our format
const COINGECKO_IDS = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'dogecoin'];

export async function fetchCryptoPrices() {
    try {
        const ids = COINGECKO_IDS.join(',');
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,idr&include_24hr_change=true`, 
            { headers: { 'Accept': 'application/json' } }
        );
        
        if (!response.ok) {
            throw new Error('CoinGecko API failed');
        }

        const data = await response.json();
        
        // Transform to our Asset format
        return COINGECKO_IDS.map(id => {
            const item = data[id];
            // ID mapping for specific symbols
            const symbols: Record<string, string> = {
                'bitcoin': 'BTC', 'ethereum': 'ETH', 'solana': 'SOL', 
                'binancecoin': 'BNB', 'dogecoin': 'DOGE'
            };
            const names: Record<string, string> = {
                'bitcoin': 'Bitcoin', 'ethereum': 'Ethereum', 'solana': 'Solana',
                'binancecoin': 'Binance Coin', 'dogecoin': 'Dogecoin'
            };

            return {
                id,
                symbol: symbols[id] || id.toUpperCase(),
                name: names[id] || id,
                type: 'CRYPTO',
                priceUSD: item.usd,
                priceIDR: item.idr,
                change24h: item.usd_24h_change,
                lastUpdated: new Date().toISOString()
            };
        });

    } catch (error) {
        console.error("Crypto fetch error:", error);
        return [];
    }
}

// 2. Stocks & Commodities Fetcher (Yahoo Finance)
// "GC=F" -> Gold, "SI=F" -> Silver
// "IDX" stocks have .JK suffix
const YAHOO_SYMBOLS = [
    'AAPL', 'NVDA', 'MSFT', 'TSLA', // US Stocks
    'BBCA.JK', 'BBRI.JK', 'TLKM.JK', 'GOTO.JK', // ID Stocks
    'GC=F', 'SI=F' // Commodities
];

export async function fetchYahooData() {
    try {
        const results: any[] = await yahooFinance.quote(YAHOO_SYMBOLS);
        
        // We need USD/IDR rate for normalization if source is in one currency but we need the other
        // Let's fetch the rate as well
        const rateResult: any = await yahooFinance.quote('IDR=X');
        const usdIdrRate = rateResult.regularMarketPrice || 16350;

        return results.map(item => {
            let type = 'STOCK_US';
            if (item.symbol.includes('.JK')) type = 'STOCK_ID';
            if (item.symbol.includes('=F')) type = 'COMMODITY';

            const price = item.regularMarketPrice || 0;
            const changePercent = item.regularMarketChangePercent || 0;
            
            // Yahoo returns price in currency of the exchange
            // US Stocks (USD), ID Stocks (IDR), Gold/Silver (USD)
            
            let priceUSD = price;
            let priceIDR = price;

            if (item.currency === 'IDR') {
                priceUSD = price / usdIdrRate;
                priceIDR = price;
            } else {
                priceUSD = price;
                priceIDR = price * usdIdrRate;
            }

            // Friendly Names
            let name = item.shortName || item.longName || item.symbol;
            if (item.symbol === 'GC=F') name = 'Gold';
            if (item.symbol === 'SI=F') name = 'Silver';

            return {
                id: item.symbol.toLowerCase().replace(/[^a-z0-9]/g, ''),
                symbol: item.symbol.replace('.JK', '').replace('=F', ''),
                name,
                type,
                priceUSD,
                priceIDR,
                change24h: changePercent,
                lastUpdated: new Date().toISOString()
            };
        });

    } catch (error) {
        console.error("Yahoo Finance fetch error:", error);
        return [];
    }
}
