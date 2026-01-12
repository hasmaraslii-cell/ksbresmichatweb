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
  displayName: z.string().min(2, "Name too short").optional().or(z.literal("")),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  password: z.string().min(6, "Password too short").optional().or(z.literal("")),
});

export function ProfileDrawer() {
  const { user, logout, updateProfile } = useAuth();
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      avatarUrl: user?.avatarUrl || "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof profileSchema>) {
    // Filter out empty strings to avoid sending them as updates
    const updates: any = {};
    if (data.displayName) updates.displayName = data.displayName;
    if (data.avatarUrl) updates.avatarUrl = data.avatarUrl;
    if (data.password) updates.password = data.password;
    
    await updateProfile(updates);
  }

  if (!user) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[400px] border-r border-white/10 bg-black/95 text-white sm:w-[540px]">
        <SheetHeader className="mb-8 border-b border-white/10 pb-4">
          <SheetTitle className="font-mono tracking-widest text-white">PERSONNEL FILE: {user.username}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-sm border border-white/5">
            <UserAvatar user={user} className="h-20 w-20" />
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-mono tracking-wide text-white">{user.displayName || user.username}</h2>
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">{user.rank || "Unknown"}</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-400 font-mono text-xs uppercase">Display Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-zinc-900/50 border-zinc-800 text-white font-mono focus:border-cyan-900" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-400 font-mono text-xs uppercase">Avatar URL</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-zinc-900/50 border-zinc-800 text-white font-mono focus:border-cyan-900" placeholder="https://..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-400 font-mono text-xs uppercase">Update Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" className="bg-zinc-900/50 border-zinc-800 text-white font-mono focus:border-cyan-900" placeholder="••••••" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-cyan-950/50 text-cyan-400 hover:bg-cyan-900/50 border border-cyan-900/50 font-mono uppercase tracking-widest">
                <Save className="mr-2 h-4 w-4" />
                Update Record
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
              Terminate Session
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
