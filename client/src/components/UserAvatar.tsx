import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: {
    displayName?: string | null;
    username: string;
    avatarUrl?: string | null;
  };
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const initials = (user.displayName || user.username)
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar className={cn("h-10 w-10 border border-white/10 rounded-full", className)}>
      <AvatarImage 
        src={user.avatarUrl || undefined} 
        className="object-cover w-full h-full rounded-full block" 
      />
      <AvatarFallback className="bg-zinc-900 text-zinc-400 font-mono text-xs rounded-full flex items-center justify-center">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
