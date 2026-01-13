import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "./UserAvatar";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Settings, LogOut, Save, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import type { User } from "@shared/schema";

const profileSchema = z.object({
  displayName: z.string().min(2, "İsim çok kısa").optional().or(z.literal("")),
  avatarUrl: z.string().optional().or(z.literal("")),
  password: z.string().min(6, "Parola çok kısa").optional().or(z.literal("")),
  biography: z.string().max(200, "Biyografi çok uzun").optional().or(z.literal("")),
  profileAnimation: z.string().optional().or(z.literal("")),
});

export function ProfileDrawer() {
  const { user, logout, updateProfile } = useAuth();
  const [viewedUser, setViewedUser] = useState<User | null>(null);
  const [isSelf, setIsSelf] = useState(true);
  const [open, setOpen] = useState(false);
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      avatarUrl: "",
      password: "",
      biography: "",
      profileAnimation: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName || "",
        avatarUrl: user.avatarUrl || "",
        password: "",
        biography: user.biography || "",
        profileAnimation: user.profileAnimation || "",
      });
    }
  }, [user, form]);

  useEffect(() => {
    (window as any).openProfileDrawer = (targetUser: User) => {
      setViewedUser(targetUser);
      setIsSelf(user?.id === targetUser.id);
      setOpen(true);
    };
    return () => { delete (window as any).openProfileDrawer; };
  }, [user?.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("avatarUrl", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: z.infer<typeof profileSchema>) {
    const updates: any = {};
    if (data.displayName && data.displayName.trim() !== "") updates.displayName = data.displayName;
    if (data.avatarUrl && data.avatarUrl.trim() !== "") updates.avatarUrl = data.avatarUrl;
    if (data.password && data.password.trim() !== "") updates.password = data.password;
    if (data.biography !== undefined) updates.biography = data.biography;
    if (data.profileAnimation !== undefined) updates.profileAnimation = data.profileAnimation;
    
    try {
      await updateProfile(updates);
    } catch (err) {}
  }

  const activeUser = viewedUser || user;
  if (!activeUser) return null;

  const renderBiography = (bio: string | null | undefined) => {
    if (!bio) return null;
    const parts = bio.split(/((?:https?:\/\/[^\s]+))/g);
    return parts.map((part, i) => {
      if (part.match(/https?:\/\/[^\s]+/)) {
        if (!activeUser.isCore) return <span key={i}>{part}</span>;
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline break-all">
            {part}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5" onClick={() => { setViewedUser(null); setIsSelf(true); }}>
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full border-r border-white/10 bg-black/95 text-white sm:w-[500px] h-[100dvh] overflow-y-auto">
        <SheetHeader className="mb-8 border-b border-white/10 pb-4">
          <SheetTitle className="font-mono tracking-widest text-white uppercase">
            {isSelf ? "PERSONEL DOSYASI" : "HEDEF PROFİLİ"}: {activeUser.username}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-sm border border-white/5">
            <UserAvatar user={activeUser as any} className="h-20 w-20" />
            <div className="space-y-1 flex-1">
              <h2 className="text-xl font-bold font-mono tracking-wide text-white">{activeUser.displayName || activeUser.username}</h2>
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">{activeUser.rank || "Bilinmiyor"}</p>
              {!isSelf && (
                <Button 
                  size="sm" 
                  className="mt-2 bg-cyan-950/30 text-cyan-400 border border-cyan-900/30 hover:bg-cyan-900/50 text-[10px] h-7"
                  onClick={() => {
                    setOpen(false);
                    if ((window as any).setSelectedUserForDM) {
                      (window as any).setSelectedUserForDM(activeUser);
                    }
                  }}
                >
                  <MessageSquare className="mr-2 h-3 w-3" /> DM GÖNDER
                </Button>
              )}
            </div>
          </div>

          {!isSelf ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-zinc-400 font-mono text-xs uppercase">Biyografi</Label>
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-md min-h-[100px] text-sm text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {renderBiography(activeUser.biography) || <span className="text-zinc-600 italic">Biyografi eklenmemiş.</span>}
                </div>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-400 font-mono text-xs uppercase">Görünen Ad</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-zinc-900/50 border-zinc-800 text-white font-mono focus:border-cyan-900" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label className="text-zinc-400 font-mono text-xs uppercase">Profil Resmi</Label>
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="bg-zinc-900/50 border-zinc-800 text-white font-mono focus:border-cyan-900 cursor-pointer"
                  />
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-400 font-mono text-xs uppercase">Şifreyi Güncelle</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" className="bg-zinc-900/50 border-zinc-800 text-white font-mono focus:border-cyan-900" placeholder="••••••" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="biography"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-400 font-mono text-xs uppercase">Biyografi</FormLabel>
                      <FormControl>
                        <textarea 
                          {...field} 
                          className="w-full min-h-[100px] p-3 bg-zinc-900/50 border border-zinc-800 text-white font-mono focus:border-cyan-900 rounded-md outline-none resize-none" 
                          placeholder="Kendinden bahset..." 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {user.isCore && (
                  <FormField
                    control={form.control}
                    name="profileAnimation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-yellow-500 font-mono text-xs uppercase">Core Animasyon Çerçevesi</FormLabel>
                        <FormControl>
                          <select 
                            {...field} 
                            className="w-full h-10 bg-zinc-900/50 border-zinc-800 text-white font-mono rounded-md px-3 focus:border-yellow-500 outline-none"
                          >
                            <option value="">Yok</option>
                            <option value="sakura">Sakura Gyoiko</option>
                            <option value="mokoko">Mokoko Love</option>
                            <option value="boba">Wingman Boba</option>
                            <option value="bunny">Freezer Bunny</option>
                            <option value="clown">Clown Fun</option>
                            <option value="los_santos">City of Los Santos</option>
                            <option value="gawblehop">Gawblehop</option>
                            <option value="glop">Glop</option>
                            <option value="chewbert">Chewbert</option>
                            <option value="doodlezard">Doodlezard</option>
                            <option value="winkle">Winkle</option>
                            <option value="chuck">Chuck</option>
                            <option value="beamchop">Beamchop</option>
                            <option value="stinkums">Stinkums</option>
                            <option value="scrumptious">Scrumptious</option>
                            <option value="panic">Panic</option>
                            <option value="nervous">Nervous</option>
                            <option value="awe">Awe</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="submit" className="w-full bg-cyan-950/50 text-cyan-400 hover:bg-cyan-900/50 border border-cyan-900/50 font-mono uppercase tracking-widest">
                  <Save className="mr-2 h-4 w-4" />
                  KAYDI GÜNCELLE
                </Button>
              </form>
            </Form>
          )}

          {isSelf && (
            <div className="border-t border-white/10 pt-6 mt-auto">
              <Button 
                variant="destructive" 
                onClick={() => logout()} 
                className="w-full bg-red-950/20 text-red-500 hover:bg-red-950/40 border border-red-900/30 font-mono uppercase tracking-widest"
              >
                <LogOut className="mr-2 h-4 w-4" />
                OTURUMU SONLANDIR
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
