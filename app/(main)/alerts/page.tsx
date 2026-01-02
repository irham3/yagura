import { Bell } from 'lucide-react';

export default function AlertsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
      <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center ring-8 ring-muted/20">
        <Bell className="h-10 w-10 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Alert Configuration</h2>
        <p className="text-muted-foreground max-w-sm mt-2 text-lg">Manage your price alerts and telegram notifications settings here.</p>
      </div>
    </div>
  );
}
