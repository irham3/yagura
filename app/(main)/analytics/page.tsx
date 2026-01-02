"use client"

import AdvancedChart from "@/components/features/analytics/advanced-chart";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Analytics</h1>
          <p className="text-muted-foreground">Advanced market analysis, price history, and volume indicators.</p>
        </div>
      </div>
      <AdvancedChart />
    </div>
  );
}
