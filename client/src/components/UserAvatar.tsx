import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import sakuraGif from "@assets/sakura_gyoiko_1768303142380.png";
import mokokoGif from "@assets/mokoko_1768303142295.png";
import bobaGif from "@assets/wingman_boba_1768303142419.png";
import bunnyGif from "@assets/freezer_bunny_lovebug_1768303142337.png";
import clownGif from "@assets/im_a_clown_1768303142251.png";
import losSantosGif from "@assets/los_santos_1768303142206.png";

const animations: Record<string, string> = {
  sakura: sakuraGif,
  mokoko: mokokoGif,
  boba: bobaGif,
  bunny: bunnyGif,
  clown: clownGif,
  los_santos: losSantosGif,
};

interface UserAvatarProps {
  user: {
    displayName?: string | null;
    username: string;
    avatarUrl?: string | null;
    isCore?: boolean | null;
    profileAnimation?: string | null;
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

  const animationSrc = user.isCore && user.profileAnimation ? animations[user.profileAnimation] : null;

  return (
    <div className="relative inline-block shrink-0">
      {animationSrc && (
        <div className="absolute inset-[-20%] pointer-events-none z-10 overflow-visible">
          <img src={animationSrc} alt="" className="w-full h-full object-contain scale-125" />
        </div>
      )}
      <Avatar className={cn("h-10 w-10 border border-white/10 rounded-full bg-zinc-900", className)}>
        <AvatarImage 
          src={user.avatarUrl || undefined} 
          className="object-cover w-full h-full rounded-full" 
        />
        <AvatarFallback className="bg-zinc-900 text-zinc-400 font-mono text-xs rounded-full flex items-center justify-center w-full h-full">
          {initials}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
