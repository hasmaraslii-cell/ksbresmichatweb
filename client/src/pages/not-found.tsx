import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center text-white">
      <AlertTriangle className="h-16 w-16 text-red-500 mb-6 animate-pulse" />
      <h1 className="text-4xl font-mono font-bold tracking-widest mb-2">404 ERROR</h1>
      <p className="text-zinc-500 font-mono uppercase tracking-wider mb-8">Signal Lost // Coordinates Invalid</p>
      
      <Link href="/">
        <Button variant="outline" className="border-zinc-800 bg-black text-zinc-300 hover:text-white hover:border-white/20 font-mono uppercase tracking-widest">
          Return to Base
        </Button>
      </Link>
    </div>
  );
}
