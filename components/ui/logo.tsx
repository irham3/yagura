"use client"

import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-all">
        <span className="text-xl font-black text-primary-foreground leading-none" style={{ fontFamily: 'var(--font-heading, sans-serif)' }}>Y</span>
      </div>
      <span className="text-xl font-bold tracking-tight">Yagura</span>
    </div>
  )
}
