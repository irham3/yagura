"use client"

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { formatCurrency } from "@/lib/utils";
import { useStore } from "@/components/providers/store-provider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';

type TimeRange = '1D' | '1W' | '1M' | '6M' | '1Y';

interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Generate realistic financial data
function generateFinancialData(basePrice: number, points: number, volatility: number): OHLCV[] {
  let currentPrice = basePrice;
  const data: OHLCV[] = [];
  const now = new Date();

  for (let i = points; i >= 0; i--) {
    const date = new Date(now.getTime() - i * (24 * 60 * 60 * 1000) / (points / 30));
    const change = (Math.random() - 0.5) * volatility;
    const open = currentPrice;
    const close = currentPrice * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.random() * 1000000 * basePrice;

    data.push({
      date: date.toISOString(),
      open,
      high,
      low,
      close,
      volume
    });
    currentPrice = close;
  }
  return data;
}

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isGreen = data.close >= data.open;
    return (
      <div className="bg-popover/95 backdrop-blur-md border border-border p-3 rounded-lg shadow-xl text-xs space-y-1 min-w-[150px]">
        <p className="text-muted-foreground font-medium mb-2">{new Date(label).toLocaleString()}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="text-muted-foreground">Price:</span>
          <span className={`font-mono font-bold ${isGreen ? 'text-emerald-500' : 'text-rose-500'}`}>
            {formatCurrency(data.displayClose, currency)}
          </span>
          <span className="text-muted-foreground">Open:</span>
          <span className="font-mono">{formatCurrency(data.displayOpen, currency)}</span>
          <span className="text-muted-foreground">High:</span>
          <span className="font-mono">{formatCurrency(data.displayHigh, currency)}</span>
          <span className="text-muted-foreground">Low:</span>
          <span className="font-mono">{formatCurrency(data.displayLow, currency)}</span>
          <span className="text-muted-foreground">Vol:</span>
          <span className="font-mono">{formatCurrency(data.volume, currency).replace(/[^0-9.,]/g, '')}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function AdvancedChart() {
  const { marketData, currency } = useStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('bitcoin');

  const allAssets = useMemo(() => [
    ...marketData.crypto.map(a => ({ ...a, group: 'Crypto' })),
    ...marketData.stocksUS.map(a => ({ ...a, group: 'US Stocks' })),
    ...marketData.stocksID.map(a => ({ ...a, group: 'ID Stocks' })),
    ...marketData.commodities.map(a => ({ ...a, group: 'Commodities' }))
  ], [marketData]);

  const selectedAsset = allAssets.find(a => a.id === selectedAssetId) || allAssets[0];

  const { chartData, stats } = useMemo(() => {
    const points = timeRange === '1D' ? 24 : timeRange === '1W' ? 7 : timeRange === '1M' ? 30 : timeRange === '6M' ? 180 : 365;
    const volatility = selectedAsset.type === 'CRYPTO' ? 0.05 : 0.02;
    const rawData = generateFinancialData(selectedAsset.priceUSD, points, volatility);

    const rate = currency === 'IDR' ? 16350 : 1;

    const processedData = rawData.map(d => ({
      ...d,
      displayOpen: d.open * rate,
      displayHigh: d.high * rate,
      displayLow: d.low * rate,
      displayClose: d.close * rate,
      displayVolume: d.volume * rate,
    }));

    const high24h = Math.max(...processedData.slice(-24).map(d => d.displayHigh));
    const low24h = Math.min(...processedData.slice(-24).map(d => d.displayLow));
    const vol24h = processedData.slice(-24).reduce((acc, curr) => acc + curr.displayVolume, 0);
    const currentPrice = processedData[processedData.length - 1].displayClose;
    const open24h = processedData[processedData.length - 24]?.displayOpen || processedData[0].displayOpen;
    const change24h = ((currentPrice - open24h) / open24h) * 100;

    return { chartData: processedData, stats: { high24h, low24h, vol24h, currentPrice, change24h } };
  }, [selectedAsset, timeRange, currency]);

  return (
    <div className="flex flex-col gap-6">
      {/* Asset Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-4 bg-muted/20 border-none shadow-none pb-0">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-4">
              <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                <SelectTrigger className="w-[240px] h-12 text-lg font-bold bg-background shadow-sm">
                  <SelectValue placeholder="Select Asset" />
                </SelectTrigger>
                <SelectContent>
                  {allAssets.map(asset => (
                    <SelectItem key={asset.id} value={asset.id}>
                      <span className="font-bold">{asset.symbol}</span> <span className="text-muted-foreground text-xs ml-2">{asset.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-bold tracking-tight">{formatCurrency(stats.currentPrice, currency)}</h2>
                  <span className={`flex items-center text-sm font-semibold ${stats.change24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {stats.change24h >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    {stats.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)} className="w-full md:w-auto">
              <TabsList className="grid w-full grid-cols-5 md:w-auto">
                <TabsTrigger value="1D">1D</TabsTrigger>
                <TabsTrigger value="1W">1W</TabsTrigger>
                <TabsTrigger value="1M">1M</TabsTrigger>
                <TabsTrigger value="6M">6M</TabsTrigger>
                <TabsTrigger value="1Y">1Y</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </Card>

        {/* Key Stats Cards */}
        <div className="contents md:flex md:gap-4 md:col-span-4">
          <Card className="flex-1 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">24h High</p>
                <p className="text-lg font-bold">{formatCurrency(stats.high24h, currency)}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <ArrowUp className="h-4 w-4 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="flex-1 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">24h Low</p>
                <p className="text-lg font-bold">{formatCurrency(stats.low24h, currency)}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                <ArrowDown className="h-4 w-4 text-rose-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="flex-1 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Volume (24h)</p>
                <p className="text-lg font-bold">{formatCurrency(stats.vol24h, currency)}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart2 className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Chart */}
      <Card className="border-none shadow-lg bg-card/40 backdrop-blur-xl">
        <CardHeader className="pb-2 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle>Market Performance</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary"></div> Price</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-muted-foreground/30"></div> Volume</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[500px] w-full p-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(str) => {
                    const date = new Date(str);
                    if (timeRange === '1D') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                  }}
                  className="text-xs text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={50}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => formatCurrency(val, currency)}
                  className="text-xs text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  width={80}
                  orientation="right" // Financial standard
                />
                <YAxis
                  yAxisId="right"
                  orientation="left"
                  tick={false}
                  axisLine={false}
                  domain={[0, 'dataMax * 3']} // Push volume down
                />
                <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="displayClose"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "var(--foreground)" }}
                />
                <Bar yAxisId="right" dataKey="volume" fill="var(--foreground)" opacity={0.1} barSize={4} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
