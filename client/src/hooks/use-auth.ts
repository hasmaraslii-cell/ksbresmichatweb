import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertUser } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export function useAuth() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const res = await fetch(api.auth.me.path);
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Kullanıcı bilgileri alınamadı");
      return api.auth.me.responses[200].parse(await res.json());
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: z.infer<typeof api.auth.login.input>) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Geçersiz kullanıcı adı veya şifre");
        throw new Error("Giriş başarısız");
      }
      return api.auth.login.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.auth.me.path], data);
      toast({
        title: "Erişim Onaylandı",
        description: `Tekrar hoş geldin, ${data.username}.`,
        className: "bg-black border-cyan-900 text-cyan-500 font-mono",
      });
    },
    onError: (error) => {
      toast({
        title: "Erişim Reddedildi",
        description: error.message,
        variant: "destructive",
        className: "bg-black border-red-900 font-mono",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: z.infer<typeof api.auth.register.input>) => {
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(errorMsg || "Kayıt başarısız");
      }
      return api.auth.register.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.auth.me.path], data);
      toast({
        title: "Kayıt Başarılı",
        description: `Ak Sangur Birliği'ne hoş geldin, ${data.username}.`,
        className: "bg-black border-cyan-900 text-cyan-500 font-mono",
      });
    },
    onError: (error) => {
      toast({
        title: "Kayıt Hatası",
        description: error.message,
        variant: "destructive",
        className: "bg-black border-red-900 font-mono",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(api.auth.logout.path, {
        method: api.auth.logout.method,
      });
      if (!res.ok) throw new Error("Oturum kapatılamadı");
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null);
      toast({
        title: "Oturum Sonlandırıldı",
        description: "Güvenli bir şekilde çıkış yaptınız.",
        className: "bg-black border-zinc-800 text-zinc-400 font-mono",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: z.infer<typeof api.auth.updateProfile.input>) => {
      const res = await fetch(api.auth.updateProfile.path, {
        method: api.auth.updateProfile.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      
      if (!res.ok) throw new Error("Güncelleme başarısız");
      return api.auth.updateProfile.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.auth.me.path], data);
      toast({
        title: "Profil Güncellendi",
        description: "Personel dosyanız başarıyla güncellendi.",
        className: "bg-black border-cyan-900 text-cyan-500 font-mono",
      });
    },
  });

  return {
    user,
    isLoading,
    error,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
