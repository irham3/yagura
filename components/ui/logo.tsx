"use client"

import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center", className)}>
      <Image src="/logo.svg" alt="Yagura Logo" width={32} height={32} className="rounded-lg shadow-lg shadow-primary/20" />
      <span className="text-2xl font-bold tracking-tight ml-1">agura</span>
    </div>
  )
}
