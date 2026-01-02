import MarketOverview from '@/components/dashboard/market-overview';
import PortfolioSummary from '@/components/dashboard/portfolio-summary';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back. Here's your asset overview.</p>
      </section>
      <PortfolioSummary />
      <MarketOverview />
    </div>
  );
}
