import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import sakuraGif from "@assets/sakura_gyoiko_1768305112703.png";
import mokokoGif from "@assets/mokoko_1768305112788.png";
import bobaGif from "@assets/wingman_boba_1768305112577.png";
import bunnyGif from "@assets/freezer_bunny_lovebug_1768305112661.png";
import clownGif from "@assets/im_a_clown_1768305112748.png";
import losSantosGif from "@assets/los_santos_1768305112615.png";
import gawblehopGif from "@assets/gawblehop_1768305112015.png";
import glopGif from "@assets/glop_1768305112072.png";
import chewbertGif from "@assets/chewbert_1768305112114.png";
import doodlezardGif from "@assets/doodlezard_1768305112157.png";
import winkleGif from "@assets/winkle_1768305112199.png";
import chuckGif from "@assets/chuck_1768305112242.png";
import beamchopGif from "@assets/beamchop_1768305112286.png";
import stinkumsGif from "@assets/stinkums_1768305112341.png";
import scrumptiousGif from "@assets/feelin_scrumptious_1768305112394.png";
import panicGif from "@assets/feelin_panic_1768305112441.png";
import nervousGif from "@assets/feelin_nervous_1768305112490.png";
import aweGif from "@assets/feelin_awe_1768305112539.png";

const animations: Record<string, string> = {
  sakura: sakuraGif,
  mokoko: mokokoGif,
  boba: bobaGif,
  bunny: bunnyGif,
  clown: clownGif,
  los_santos: losSantosGif,
  gawblehop: gawblehopGif,
  glop: glopGif,
  chewbert: chewbertGif,
  doodlezard: doodlezardGif,
  winkle: winkleGif,
  chuck: chuckGif,
  beamchop: beamchopGif,
  stinkums: stinkumsGif,
  scrumptious: scrumptiousGif,
  panic: panicGif,
  nervous: nervousGif,
  awe: aweGif,
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
  showBadge?: boolean;
}

export function UserAvatar({ user, className, showBadge = true }: UserAvatarProps) {
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
        <div className="absolute inset-[-5%] pointer-events-none z-10 overflow-visible">
          <img src={animationSrc} alt="" className="w-full h-full object-contain scale-100" />
        </div>
      )}
      <div className="relative">
        <Avatar className={cn("h-10 w-10 border border-white/10 rounded-full bg-zinc-900", className)}>
          <AvatarImage 
            src={user.avatarUrl || undefined} 
            className="object-cover w-full h-full rounded-full" 
          />
          <AvatarFallback className="bg-zinc-900 text-zinc-400 font-mono text-xs rounded-full flex items-center justify-center w-full h-full">
            {initials}
          </AvatarFallback>
        </Avatar>
        {user.isCore && showBadge && (
          <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5 border border-yellow-500/50 z-20">
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
          </div>
        )}
      </div>
    </div>
  );
}
