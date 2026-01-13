import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Star } from "lucide-react";

export default function CoreApplication() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState("");

  const submitMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest("POST", "/api/fanarts", { imageUrl: url });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Başvuru Gönderildi", description: "Fanartınız admin onayına sunuldu." });
      setImageUrl("");
    }
  });

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            Core Başvurusu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Core üye olmak için topluluğumuza özel bir Fanart hazırlayıp paylaşın. Adminlerimiz onayladığında Core yetkisine sahip olacaksınız!
          </p>
          <div className="flex gap-2">
            <Input 
              placeholder="Fanart Görsel URL'si" 
              value={imageUrl} 
              onChange={(e) => setImageUrl(e.target.value)} 
            />
            <Button onClick={() => submitMutation.mutate(imageUrl)} disabled={submitMutation.isPending}>
              <Upload className="mr-2 h-4 w-4" />
              Gönder
            </Button>
          </div>
          {imageUrl && (
            <div className="mt-4 rounded-lg overflow-hidden border border-primary/10">
              <img src={imageUrl} alt="Önizleme" className="w-full h-auto object-cover max-h-64" />
            </div>
          )}
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
