import { NextResponse } from 'next/server';

// Fetch historical chart data from CoinGecko
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const coinId = searchParams.get('coin') || 'bitcoin';
    const days = searchParams.get('days') || '30';
    
    try {
        console.log(`[Historical] Fetching ${days} days of data for ${coinId}...`);
        
        const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`,
            { 
                headers: { 'Accept': 'application/json' },
                next: { revalidate: 3600 } // Cache for 1 hour
            }
        );
        
        if (!response.ok) {
            throw new Error(`CoinGecko API failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform to OHLC format (using prices as close, interpolating OHLC)
        const ohlcData = data.prices.map((pricePoint: [number, number], index: number) => {
            const [timestamp, close] = pricePoint;
            
            // Simple OHLC approximation from price data
            const prevClose = index > 0 ? data.prices[index - 1][1] : close;
            const open = prevClose;
            const high = Math.max(open, close) * (1 + Math.random() * 0.01);
            const low = Math.min(open, close) * (1 - Math.random() * 0.01);
            const volume = data.total_volumes[index]?.[1] || 0;
            
            return {
                date: new Date(timestamp).toISOString(),
                open,
                high,
                low,
                close,
                volume
            };
        });
        
        console.log(`[Historical] Success! Fetched ${ohlcData.length} data points`);
        
        return NextResponse.json({
            coinId,
            days,
            data: ohlcData
        });
        
    } catch (error: any) {
        console.error('[Historical] Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
