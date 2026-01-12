import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}

export function BentoCard({ children, className, title, action }: BentoCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden bg-[#0a0a0b]/80 backdrop-blur-sm border border-white/5 rounded-sm p-6 group transition-all duration-300 hover:border-white/10",
      className
    )}>
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />
      
      {(title || action) && (
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
          {title && <h3 className="font-mono text-sm tracking-widest text-zinc-400 uppercase">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      
      {children}
    </div>
  );
}
