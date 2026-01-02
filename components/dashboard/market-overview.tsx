"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/components/providers/store-provider";
import AssetTable from "./asset-table";

export default function MarketOverview() {
  const { marketData } = useStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Market Overview</h2>
      </div>
      <Tabs defaultValue="crypto" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] lg:grid-cols-4 bg-muted/50 p-1">
          <TabsTrigger value="crypto" className="rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">Crypto</TabsTrigger>
          <TabsTrigger value="us_stocks" className="rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">US Stocks</TabsTrigger>
          <TabsTrigger value="id_stocks" className="rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">IDX</TabsTrigger>
          <TabsTrigger value="commodities" className="rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">Gold</TabsTrigger>
        </TabsList>
        <div className="min-h-[300px]">
          <TabsContent value="crypto" className="mt-0">
            <AssetTable assets={marketData.crypto} />
          </TabsContent>
          <TabsContent value="us_stocks" className="mt-0">
            <AssetTable assets={marketData.stocksUS} />
          </TabsContent>
          <TabsContent value="id_stocks" className="mt-0">
            <AssetTable assets={marketData.stocksID} />
          </TabsContent>
          <TabsContent value="commodities" className="mt-0">
            <AssetTable assets={marketData.commodities} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
