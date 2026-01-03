"use client"

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useStore } from "@/components/providers/store-provider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Asset } from "@/lib/types";

type TimeRange = '1D' | '1W' | '1M' | '1Y' | '5Y';

function generateHistoricalData(basePrice: number, points: number, volatility: number) {
  let currentPrice = basePrice;
  const data = [];
  const now = new Date();

  for (let i = points; i >= 0; i--) {
    const date = new Date(now.getTime() - i * (24 * 60 * 60 * 1000) / (points / 30)); // Rough scaling
    const change = (Math.random() - 0.5) * volatility;
    currentPrice = currentPrice * (1 + change);
    data.push({
      date: date.toISOString(),
      price: currentPrice
    });
  }
  return data;
}

export default function AssetPerformanceChart() {
  const { marketData, currency } = useStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('bitcoin');

  // Combine all assets for selection
  const allAssets = useMemo(() => [
    ...marketData.crypto,
    ...marketData.stocksUS,
    ...marketData.stocksID,
    ...marketData.commodities
  ], [marketData]);

  const selectedAsset = allAssets.find(a => a.id === selectedAssetId) || allAssets[0];

  interface ChartData {
    date: string;
    price: number;
    displayPrice: number;
  }

  const chartData = useMemo<ChartData[]>(() => {
    const points = timeRange === '1D' ? 24 : timeRange === '1W' ? 7 : timeRange === '1M' ? 30 : timeRange === '1Y' ? 365 : 1825;
    const volatility = selectedAsset.type === 'CRYPTO' ? 0.05 : 0.02;

    // Generate consistent fake data based on seed (asset id + time range) logic effectively
    // For now just random but stable-ish for the session
    return generateHistoricalData(selectedAsset.priceUSD, 50, volatility).map((d: { date: string, price: number }) => ({
      ...d,
      displayPrice: currency === 'USD' ? d.price : d.price * 16350 // simplified rate
    }));
  }, [selectedAsset, timeRange, currency]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle>Price History</CardTitle>
            <CardDescription>Real-time performance for {selectedAsset.name}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Asset" />
              </SelectTrigger>
              <SelectContent>
                {allAssets.map(asset => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.symbol} - {asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <TabsList>
                <TabsTrigger value="1D">1D</TabsTrigger>
                <TabsTrigger value="1W">1W</TabsTrigger>
                <TabsTrigger value="1M">1M</TabsTrigger>
                <TabsTrigger value="1Y">1Y</TabsTrigger>
                <TabsTrigger value="5Y">5Y</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(str: string) => {
                  const date = new Date(str);
                  if (timeRange === '1D') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                }}
                className="text-xs text-muted-foreground"
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis
                domain={['auto', 'auto']}
                tickFormatter={(val: number) => formatCurrency(val, currency)}
                className="text-xs text-muted-foreground"
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}
                itemStyle={{ color: 'var(--foreground)' }}
                labelFormatter={(label: string) => label ? new Date(label).toLocaleString() : ''}
                formatter={(value: number | string) => [formatCurrency(Number(value), currency), 'Price']}
              />
              <Area
                type="monotone"
                dataKey="displayPrice"
                stroke="var(--primary)"
                fillOpacity={1}
                fill="url(#colorPrice)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
