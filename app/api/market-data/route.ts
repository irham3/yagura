import { NextResponse } from 'next/server';
import { MOCK_MARKET_DATA } from '@/lib/mock-data';
import yahooFinance from 'yahoo-finance2';
import { Asset } from '@/lib/types';

// Simplified fetchers with built-in error handling
async function safeFetchCrypto(): Promise<Asset[]> {
    try {
        console.log('[CoinGecko] Fetching crypto prices...');
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,dogecoin&vs_currencies=usd,idr&include_24hr_change=true`,
            { 
                headers: { 'Accept': 'application/json' }, 
                next: { revalidate: 60 },
                cache: 'no-store' // Force fresh data for testing
            }
        );
        
        if (!response.ok) {
            console.error('[CoinGecko] HTTP Error:', response.status, response.statusText);
            throw new Error(`CoinGecko API failed: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[CoinGecko] Success! Sample data:', JSON.stringify(data.bitcoin).substring(0, 100));
        
        const ids = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'dogecoin'];
        const symbols: Record<string, string> = {
            'bitcoin': 'BTC', 'ethereum': 'ETH', 'solana': 'SOL',
            'binancecoin': 'BNB', 'dogecoin': 'DOGE'
        };
        const names: Record<string, string> = {
            'bitcoin': 'Bitcoin', 'ethereum': 'Ethereum', 'solana': 'Solana',
            'binancecoin': 'Binance Coin', 'dogecoin': 'Dogecoin'
        };

        return ids.map(id => ({
            id,
            symbol: symbols[id],
            name: names[id],
            type: 'CRYPTO' as const,
            priceUSD: data[id]?.usd || 0,
            priceIDR: data[id]?.idr || 0,
            change24h: data[id]?.usd_24h_change || 0,
            lastUpdated: new Date().toISOString()
        }));
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[CoinGecko] Error:', errorMessage);
        console.log('[CoinGecko] Falling back to mock data');
        return MOCK_MARKET_DATA.crypto;
    }
}

async function safeFetchYahoo(): Promise<Asset[]> {
    try {
        console.log('[Yahoo Finance] Fetching stocks and commodities...');
        
        const symbols = [
            'AAPL', 'NVDA', 'MSFT', 'TSLA', // US Stocks
            'BBCA.JK', 'BBRI.JK', 'TLKM.JK', 'GOTO.JK', // ID Stocks
            'GC=F', 'SI=F' // Commodities
        ];
        
        const results = await yahooFinance.quote(symbols);
        const rateResult = await yahooFinance.quote('IDR=X');
        const usdIdrRate = (rateResult as any)?.regularMarketPrice || 16350;
        
        console.log('[Yahoo Finance] Success! Fetched', results.length, 'symbols. USD/IDR rate:', usdIdrRate);

        return (results as any[]).map((item: any) => {
            let type: 'STOCK_US' | 'STOCK_ID' | 'COMMODITY' = 'STOCK_US';
            if (item.symbol?.includes('.JK')) type = 'STOCK_ID';
            if (item.symbol?.includes('=F')) type = 'COMMODITY';

            const price = item.regularMarketPrice || 0;
            const changePercent = item.regularMarketChangePercent || 0;
            
            let priceUSD = price;
            let priceIDR = price;

            if (item.currency === 'IDR') {
                priceUSD = price / usdIdrRate;
                priceIDR = price;
            } else {
                priceUSD = price;
                priceIDR = price * usdIdrRate;
            }

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
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Yahoo Finance] Error:', errorMessage);
        console.log('[Yahoo Finance] Falling back to mock data');
        return [
            ...MOCK_MARKET_DATA.stocksUS,
            ...MOCK_MARKET_DATA.stocksID,
            ...MOCK_MARKET_DATA.commodities
        ];
    }
}

export async function GET() {
    console.log('\n[API] ========== Market data request received ==========');
    
    const [crypto, yahoo] = await Promise.all([
        safeFetchCrypto(),
        safeFetchYahoo()
    ]);
    
    const stocksUS = yahoo.filter((a: Asset) => a.type === 'STOCK_US');
    const stocksID = yahoo.filter((a: Asset) => a.type === 'STOCK_ID');
    const commodities = yahoo.filter((a: Asset) => a.type === 'COMMODITY');

    console.log('[API] Response ready:');
    console.log('  - Crypto:', crypto.length, 'items', crypto[0] ? `(BTC: $${crypto[0].priceUSD})` : '');
    console.log('  - US Stocks:', stocksUS.length, 'items');
    console.log('  - ID Stocks:', stocksID.length, 'items');
    console.log('  - Commodities:', commodities.length, 'items');
    console.log('[API] ====================================================\n');

    return NextResponse.json({
        crypto,
        stocksUS,
        stocksID,
        commodities
    });
}
