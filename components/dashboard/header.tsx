"use client"

import { useStore } from '@/components/providers/store-provider';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import Logo from "@/components/ui/logo";

export default function Header() {
  const { currency, setCurrency } = useStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 md:px-6 backdrop-blur-xl transition-all">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] sm:w-[300px]">
          <div className="flex flex-col gap-6 py-4">
            <Logo />
            <nav className="flex flex-col gap-2">
              {/* Mobile Nav items would go here */}
              <Button variant="ghost" className="justify-start">Dashboard</Button>
              <Button variant="ghost" className="justify-start">Portfolio</Button>
              <Button variant="ghost" className="justify-start">Alerts</Button>
              <Button variant="ghost" className="justify-start">Settings</Button>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        <div className="relative max-w-sm hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search assets (e.g. BTC, NVDA)..."
            className="pl-9 h-9 bg-muted/40 border-border/40 focus-visible:ring-primary/20 transition-all hover:bg-muted/60"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-muted/40 rounded-lg p-1 border border-border/40">
          <button
            onClick={() => setCurrency('IDR')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${currency === 'IDR' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            IDR
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${currency === 'USD' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            USD
          </button>
        </div>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary transition-colors">
          <Bell className="h-5 w-5" />
        </Button>

        <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all">
          <AvatarImage src="#" />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
