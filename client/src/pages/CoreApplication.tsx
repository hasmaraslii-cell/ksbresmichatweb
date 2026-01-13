import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Star, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function CoreApplication() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({ title: "Dosya Çok Büyük", description: "Maksimum 10MB yükleyebilirsiniz.", variant: "destructive" });
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!previewUrl) return;
      const res = await apiRequest("POST", "/api/fanarts", { imageUrl: previewUrl });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Başvuru Gönderildi", description: "Fanartınız admin onayına sunuldu." });
      setFile(null);
      setPreviewUrl(null);
    }
  });

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 text-zinc-300 font-mono">
      <Card className="border-white/10 bg-black/50">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white gap-2 uppercase tracking-widest text-[10px]">
                <ArrowLeft className="h-3 w-3" /> GERİ DÖN
              </Button>
            </Link>
          </div>
          <CardTitle className="flex items-center gap-2 text-2xl text-white uppercase tracking-widest">
            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            Core Başvurusu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-zinc-500 text-sm leading-relaxed uppercase tracking-wider">
            Ak Sangur topluluğuna özel bir Fanart hazırlayın. Onaylandığında 30 günlük Core üyeliği kazanırsınız.
          </p>
          
          <div className="space-y-4">
            <div className="relative border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-cyan-500/50 transition-colors">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-md" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-600">
                  <Upload className="h-8 w-8" />
                  <span className="text-xs uppercase tracking-widest">DOSYA SEÇ VEYA SÜRÜKLE</span>
                </div>
              )}
            </div>

            <Button 
              className="w-full bg-cyan-950/50 text-cyan-400 border border-cyan-900/50 hover:bg-cyan-900/50 py-6"
              onClick={() => submitMutation.mutate()} 
              disabled={submitMutation.isPending || !previewUrl}
            >
              <Upload className="mr-2 h-4 w-4" />
              BAŞVURUYU GÖNDER
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Core Avantajları</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>İsminin yanında özel Core rozeti</li>
              <li>Profil kartında animasyonlu çerçeve seçeneği</li>
              <li>Biyografide tıklanabilir link paylaşımı</li>
              <li>Adminlerden özel hediye alma şansı</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Nasıl Onay Alırım?</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Özgün ve yaratıcı Fanart tasarımları</li>
              <li>Yüksek kaliteli görseller</li>
              <li>Topluluk kurallarına uygun içerik</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
