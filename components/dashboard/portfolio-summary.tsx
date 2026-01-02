"use client"
import { useStore } from "@/components/providers/store-provider";
import { PortfolioItem } from "@/lib/types";
import { formatCurrency, formatPercentage, USD_IDR_RATE } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, Activity, BellRing } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

export default function PortfolioSummary() {
  const { portfolio, marketData, currency } = useStore();

  // Calculate total value
  const { totalValue, pnl, pnlPercent } = useMemo(() => {
    let currentTotal = 0;
    let costTotal = 0;

    const findPrice = (assetId: string) => {
      const allAssets = [
        ...marketData.crypto,
        ...marketData.stocksUS,
        ...marketData.stocksID,
        ...marketData.commodities
      ];
      const asset = allAssets.find(a => a.id === assetId);
      return asset ? (currency === 'USD' ? asset.priceUSD : asset.priceIDR) : 0;
    };

    const findCost = (item: PortfolioItem) => {
      const rate = currency === 'IDR' ? USD_IDR_RATE : 1;
      return item.avgBuyPriceUSD * item.amount * rate;
    };

    portfolio.forEach(item => {
      currentTotal += findPrice(item.assetId) * item.amount;
      costTotal += findCost(item);
    });

    const pnl = currentTotal - costTotal;
    const pnlPercent = costTotal > 0 ? (pnl / costTotal) * 100 : 0;

    return { totalValue: currentTotal, totalCost: costTotal, pnl, pnlPercent };
  }, [portfolio, marketData, currency]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="col-span-2 bg-gradient-to-br from-primary/5 via-background to-background border-primary/10 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio Value</CardTitle>
          <Wallet className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">
            {formatCurrency(totalValue, currency)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className={`flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full border ${pnl >= 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
              {pnl >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {formatCurrency(Math.abs(pnl), currency)} ({formatPercentage(pnlPercent)})
            </div>
            <span className="text-xs text-muted-foreground">All time PnL</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">24h Change</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalValue * 0.012, currency)}</div>
          <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1 font-medium"><TrendingUp className="h-3 w-3" /> +1.20%</p>
        </CardContent>
      </Card>
      <Card className="bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Alerts</CardTitle>
          <BellRing className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2</div>
          <p className="text-xs text-muted-foreground mt-1">Waiting for triggers...</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper hack for formatPercentage assignment in expression above logic if needed, but logic seems fine.
