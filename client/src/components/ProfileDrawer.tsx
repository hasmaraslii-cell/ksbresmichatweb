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
import { Settings, LogOut, Save } from "lucide-react";

const profileSchema = z.object({
  displayName: z.string().min(2, "İsim çok kısa").optional().or(z.literal("")),
  avatarUrl: z.string().optional().or(z.literal("")),
  password: z.string().min(6, "Parola çok kısa").optional().or(z.literal("")),
  biography: z.string().max(200, "Biyografi çok uzun").optional().or(z.literal("")),
  profileAnimation: z.string().optional().or(z.literal("")),
});

export function ProfileDrawer() {
  const { user, logout, updateProfile } = useAuth();
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      avatarUrl: user?.avatarUrl || "",
      password: "",
      biography: user?.biography || "",
      profileAnimation: user?.profileAnimation || "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert("Dosya boyutu çok büyük (Maksimum 20MB)");
        return;
      }
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
    
    if (Object.keys(updates).length === 0) return;
    
    try {
      await updateProfile(updates);
    } catch (err) {
      // Error handled by hook toast
    }
  }

  if (!user) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full border-r border-white/10 bg-black/95 text-white sm:w-[500px] h-[100dvh] overflow-y-auto">
        <SheetHeader className="mb-8 border-b border-white/10 pb-4">
          <SheetTitle className="font-mono tracking-widest text-white">PERSONEL DOSYASI: {user.username}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-sm border border-white/5">
            <UserAvatar user={user} className="h-20 w-20" />
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-mono tracking-wide text-white">{user.displayName || user.username}</h2>
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">{user.rank || "Bilinmiyor"}</p>
            </div>
          </div>

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
                      <Input {...field} className="bg-zinc-900/50 border-zinc-800 text-white font-mono focus:border-cyan-900" placeholder="Kendinden bahset..." />
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
