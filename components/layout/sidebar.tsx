"use client"

import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Wallet, Bell, Settings, AreaChart, LogOut, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Logo from "@/components/ui/logo";
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navigate = (path: string) => {
    router.push(path);
  };

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-card/50 backdrop-blur-xl p-4 h-full">
      <div className="mb-8 px-4 pt-4">
        <Logo />
      </div>

      <ScrollArea className="flex-1 -mx-4 px-4">
        <nav className="space-y-2">
          <div className="mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menu</div>
          <NavButton icon={LayoutDashboard} label="Dashboard" active={pathname === '/dashboard'} onClick={() => navigate('/dashboard')} />
          <NavButton icon={AreaChart} label="Analytics" active={pathname === '/analytics'} onClick={() => navigate('/analytics')} />
          <NavButton icon={Wallet} label="Portfolio" active={pathname === '/portfolio'} onClick={() => navigate('/portfolio')} />
          <NavButton icon={Bell} label="Alerts" active={pathname === '/alerts'} onClick={() => navigate('/alerts')} />
          <NavButton icon={Settings} label="Settings" active={pathname === '/settings'} onClick={() => navigate('/settings')} />
        </nav>
      </ScrollArea>

      <div className="mt-auto pt-4 border-t">
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </aside>
  );
}

interface NavButtonProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavButton({ icon: Icon, label, active, onClick }: NavButtonProps) {
  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start gap-3 h-11 px-4 text-sm font-medium transition-all duration-200",
        active ? "bg-primary/10 text-primary hover:bg-primary/15 shadow-sm" : "text-muted-foreground hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  )
}
