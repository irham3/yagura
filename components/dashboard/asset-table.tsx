"use client"
import { Asset } from "@/lib/types";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BellPlus } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { toast } from "sonner";

export default function AssetTable({ assets }: { assets: Asset[] }) {
  const { currency } = useStore();

  const handleAlertClick = (asset: Asset) => {
    toast.info(`Alert Setup for ${asset.symbol}`, {
      description: "This feature will open the alert configuration modal.",
    });
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[200px]">Asset</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">24h Change</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.id} className="hover:bg-muted/50 transition-colors">
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold text-base">{asset.symbol}</span>
                  <span className="text-xs text-muted-foreground">{asset.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono font-medium text-lg">
                {formatCurrency(currency === 'USD' ? asset.priceUSD : asset.priceIDR, currency)}
              </TableCell>
              <TableCell className="text-right">
                <div className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium ${asset.change24h >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {asset.change24h > 0 ? '+' : ''}{formatPercentage(asset.change24h)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all"
                  onClick={() => handleAlertClick(asset)}
                >
                  <BellPlus className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
