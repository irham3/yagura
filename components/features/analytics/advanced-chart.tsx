"use client"

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from "@/lib/utils";
import { useStore } from "@/components/providers/store-provider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';

type TimeRange = '1D' | '1W' | '1M' | '6M' | '1Y' | '3Y' | '5Y';

interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartDataPoint extends OHLCV {
  displayOpen: number;
  displayHigh: number;
  displayLow: number;
  displayClose: number;
  displayVolume: number;
}

interface ChartStats {
  high24h: number;
  low24h: number;
  vol24h: number;
  currentPrice: number;
  change24h: number;
  isPositive: boolean;
}

const CustomTooltip = ({ active, payload, label, currency }: { active?: boolean; payload?: { payload: ChartDataPoint }[]; label?: string; currency: 'USD' | 'IDR' }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartDataPoint;
    const isGreen = data.close >= data.open;
    return (
      <div className="bg-popover/95 backdrop-blur-md border border-border p-3 rounded-lg shadow-xl text-xs space-y-1 min-w-[150px]">
        <p className="text-muted-foreground font-medium mb-2">{label ? new Date(label).toLocaleString() : ''}</p>
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
  const [dataSource, setDataSource] = useState<'live' | 'synthetic'>('live');
  const [isLoading, setIsLoading] = useState(false);

  const allAssets = useMemo(() => [
    ...marketData.crypto.map(a => ({ ...a, group: 'Crypto' })),
    ...marketData.stocksUS.map(a => ({ ...a, group: 'US Stocks' })),
    ...marketData.stocksID.map(a => ({ ...a, group: 'ID Stocks' })),
    ...marketData.commodities.map(a => ({ ...a, group: 'Commodities' }))
  ], [marketData]);

  const selectedAsset = allAssets.find(a => a.id === selectedAssetId) || allAssets[0];

  const [data, setData] = useState<{ chartData: ChartDataPoint[], stats: ChartStats } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setData(null);
      // setDataSource('none');

      const rate = currency === 'IDR' ? 16350 : 1;
      const currentPrice = selectedAsset[currency === 'USD' ? 'priceUSD' : 'priceIDR'];

      if (selectedAsset.type === 'CRYPTO') {
        try {
          const daysNum = timeRange === '1D' ? '1' : timeRange === '1W' ? '7' : timeRange === '1M' ? '30' : timeRange === '6M' ? '180' : timeRange === '1Y' ? '365' : 'max';
          const res = await fetch(`/api/historical?coin=${selectedAsset.id}&days=${daysNum}`);
          if (res.ok) {
            const history = await res.json();
            if (history.data && history.data.length > 0) {
              const processedLive: ChartDataPoint[] = history.data.map((d: OHLCV) => ({
                ...d,
                displayOpen: d.open * rate,
                displayHigh: d.high * rate,
                displayLow: d.low * rate,
                displayClose: d.close * rate,
                displayVolume: d.volume * rate,
              }));

              const liveOpenPrice = processedLive[0]?.displayClose || currentPrice;
              const liveChangePercent = ((currentPrice - liveOpenPrice) / liveOpenPrice) * 100;

              setData({
                chartData: processedLive,
                stats: {
                  high24h: Math.max(...processedLive.slice(-Math.min(24, processedLive.length)).map((d: ChartDataPoint) => d.displayHigh)),
                  low24h: Math.min(...processedLive.slice(-Math.min(24, processedLive.length)).map((d: ChartDataPoint) => d.displayLow)),
                  vol24h: processedLive.slice(-Math.min(24, processedLive.length)).reduce((acc: number, curr: ChartDataPoint) => acc + curr.displayVolume, 0),
                  currentPrice,
                  change24h: liveChangePercent,
                  isPositive: liveChangePercent >= 0
                }
              });
              setDataSource('live');
            }
          }
        } catch (err: unknown) {
          console.warn("History fetch failed", err);
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, [selectedAsset, timeRange, currency]);

  // Header stats derived from the global store (selectedAsset) or chart stats
  const displayPrice = data?.stats?.currentPrice ?? selectedAsset[currency === 'USD' ? 'priceUSD' : 'priceIDR'];
  const displayChange = data?.stats?.change24h ?? 0;
  const isPositive = data?.stats?.isPositive ?? true;

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
                  <h2 className="text-3xl font-bold tracking-tight">{formatCurrency(displayPrice, currency)}</h2>
                  <span className={`flex items-center text-sm font-semibold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    {displayChange.toFixed(2)}%
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
          <Card className={`flex-1 bg-card/50 backdrop-blur-sm ${isLoading ? 'animate-pulse' : ''}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">24h High</p>
                <p className="text-lg font-bold">{data ? formatCurrency(data.stats.high24h, currency) : '—'}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <ArrowUp className="h-4 w-4 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card className={`flex-1 bg-card/50 backdrop-blur-sm ${isLoading ? 'animate-pulse' : ''}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">24h Low</p>
                <p className="text-lg font-bold">{data ? formatCurrency(data.stats.low24h, currency) : '—'}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                <ArrowDown className="h-4 w-4 text-rose-500" />
              </div>
            </CardContent>
          </Card>
          <Card className={`flex-1 bg-card/50 backdrop-blur-sm ${isLoading ? 'animate-pulse' : ''}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Volume (24h)</p>
                <p className="text-lg font-bold">{data ? formatCurrency(data.stats.vol24h, currency) : '—'}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart2 className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Chart */}
      <Card className="border-none shadow-lg bg-card/40 backdrop-blur-xl min-h-[550px]">
        <CardHeader className="pb-2 border-b border-border/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CardTitle>Market Performance</CardTitle>
              <div className="flex items-center gap-2">
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${dataSource === 'live' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-muted/10 text-muted-foreground border border-border'}`}>
                  {dataSource === 'live' ? '● Live History' : '○ No History'}
                </div>
                {isLoading && (
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                    Updating...
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary"></div> Price</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-muted-foreground/30"></div> Volume</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex items-center justify-center">
          {isLoading ? (
            <div className="h-[500px] w-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Fetching market data...</p>
              </div>
            </div>
          ) : data ? (
            <div className="h-[500px] w-full p-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.chartData}>
                  <defs>
                    <linearGradient id="colorPriceGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(16, 185, 129)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="rgb(16, 185, 129)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPriceRed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(244, 63, 94)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="rgb(244, 63, 94)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(str: string) => {
                      const date = new Date(str);
                      if (timeRange === '1D') {
                        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      } else if (timeRange === '1W' || timeRange === '1M') {
                        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                      } else {
                        // For 6M, 1Y - show year prominently
                        return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
                      }
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
                    tickFormatter={(val: number) => formatCurrency(val, currency)}
                    className="text-xs text-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                    width={80}
                    orientation="right"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="left"
                    tick={false}
                    axisLine={false}
                    domain={[0, 'dataMax * 3']}
                  />
                  <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="displayClose"
                    stroke={data.stats.isPositive ? 'rgb(16, 185, 129)' : 'rgb(244, 63, 94)'}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill={data.stats.isPositive ? 'url(#colorPriceGreen)' : 'url(#colorPriceRed)'}
                    activeDot={{ r: 6, strokeWidth: 0, fill: "var(--foreground)" }}
                  />
                  <Bar yAxisId="right" dataKey="volume" fill="var(--foreground)" opacity={0.1} barSize={4} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[500px] w-full flex flex-col items-center justify-center p-6 text-center">
              <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                <BarChart2 className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <h3 className="text-lg font-semibold text-amber-500">History Not Available</h3>
              <p className="text-sm text-muted-foreground max-w-xs mt-1">
                Real historical data for <strong>{selectedAsset.name}</strong> is not available for the <strong>{timeRange}</strong> timeframe in this tier.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
