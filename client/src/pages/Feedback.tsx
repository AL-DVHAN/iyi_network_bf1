import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { MessageSquare, Upload, X, CheckCircle, AlertCircle, Image, Video } from "lucide-react";
import { toast } from "sonner";

const FEEDBACK_TYPES = [
  { value: "suggestion", label: "💡 Öneri", desc: "Sunucu veya topluluk için önerinizi paylaşın" },
  { value: "complaint", label: "⚠️ Şikayet", desc: "Bir sorun veya şikayetinizi bildirin" },
  { value: "report", label: "🚨 Oyuncu Raporu", desc: "Kural ihlali yapan oyuncuyu rapor edin" },
  { value: "other", label: "📝 Diğer", desc: "Diğer konularda iletişime geçin" },
];

export default function Feedback() {
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    type: "suggestion" as "suggestion" | "complaint" | "report" | "other",
    subject: "",
    message: "",
    guestName: "",
    guestEmail: "",
  });
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.feedback.submit.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      if (data.discordSent) {
        toast.success("Geri bildiriminiz Discord'a iletildi!");
      } else {
        toast.success("Geri bildiriminiz alındı!");
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        if (file.size > 50 * 1024 * 1024) {
          toast.error(`${file.name} çok büyük (max 50MB)`);
          continue;
        }
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          newUrls.push(data.url);
        } else {
          // Fallback: use placeholder
          newUrls.push(`[Dosya: ${file.name}]`);
        }
      }
      setAttachments(prev => [...prev, ...newUrls]);
      toast.success(`${newUrls.length} dosya yüklendi`);
    } catch {
      toast.error("Dosya yüklenirken hata oluştu");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error("Konu ve mesaj alanları zorunludur");
      return;
    }
    if (!isAuthenticated && !form.guestName.trim()) {
      toast.error("Misafir olarak gönderim için adınızı girin");
      return;
    }
    submitMutation.mutate({
      type: form.type,
      subject: form.subject,
      message: form.message,
      guestName: isAuthenticated ? undefined : form.guestName,
      guestEmail: isAuthenticated ? undefined : form.guestEmail || undefined,
      attachmentUrls: attachments,
    });
  };

  if (submitted) {
    return (
      <div className="container py-8">
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "oklch(0.60 0.15 145 / 0.15)" }}>
            <CheckCircle size={32} style={{ color: "oklch(0.60 0.15 145)" }} />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>Teşekkürler!</h2>
          <p className="text-sm text-muted-foreground mb-6">Geri bildiriminiz alındı. En kısa sürede değerlendireceğiz.</p>
          <button onClick={() => { setSubmitted(false); setForm({ type: "suggestion", subject: "", message: "", guestName: "", guestEmail: "" }); setAttachments([]); }} className="px-4 py-2 rounded text-sm font-semibold" style={{ background: "oklch(0.72 0.14 75)", color: "oklch(0.10 0.01 60)" }}>
            Yeni Geri Bildirim
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.65 0.12 200 / 0.15)" }}>
          <MessageSquare size={20} style={{ color: "oklch(0.65 0.12 200)" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Oswald', sans-serif" }}>Geri Bildirim</h1>
          <p className="text-sm text-muted-foreground">Öneri, şikayet veya oyuncu raporu gönderin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="rounded-lg border p-6 space-y-5" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
            {/* Type Selection */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">Tür</label>
              <div className="grid grid-cols-2 gap-2">
                {FEEDBACK_TYPES.map(type => (
                  <button key={type.value} type="button" onClick={() => setForm(p => ({ ...p, type: type.value as typeof p.type }))} className="p-3 rounded border text-left transition-all" style={{
                    background: form.type === type.value ? "oklch(0.72 0.14 75 / 0.1)" : "oklch(0.14 0.01 58)",
                    borderColor: form.type === type.value ? "oklch(0.72 0.14 75 / 0.4)" : "oklch(0.25 0.02 60)",
                  }}>
                    <p className="text-sm font-medium text-foreground">{type.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Guest fields */}
            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Adınız *</label>
                  <input value={form.guestName} onChange={e => setForm(p => ({ ...p, guestName: e.target.value }))} placeholder="Oyuncu adı" className="w-full h-9 px-3 text-sm rounded border outline-none" style={{ background: "oklch(0.18 0.01 60)", borderColor: "oklch(0.28 0.03 60)", color: "oklch(0.92 0.02 80)" }} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">E-posta (opsiyonel)</label>
                  <input type="email" value={form.guestEmail} onChange={e => setForm(p => ({ ...p, guestEmail: e.target.value }))} placeholder="ornek@email.com" className="w-full h-9 px-3 text-sm rounded border outline-none" style={{ background: "oklch(0.18 0.01 60)", borderColor: "oklch(0.28 0.03 60)", color: "oklch(0.92 0.02 80)" }} />
                </div>
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Konu *</label>
              <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Kısaca konuyu belirtin" className="w-full h-9 px-3 text-sm rounded border outline-none" style={{ background: "oklch(0.18 0.01 60)", borderColor: "oklch(0.28 0.03 60)", color: "oklch(0.92 0.02 80)" }} />
            </div>

            {/* Message */}
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Mesaj *</label>
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Detaylı açıklamanızı yazın..." rows={6} className="w-full px-3 py-2 text-sm rounded border outline-none resize-none" style={{ background: "oklch(0.18 0.01 60)", borderColor: "oklch(0.28 0.03 60)", color: "oklch(0.92 0.02 80)" }} />
              <p className="text-xs text-muted-foreground mt-1">{form.message.length}/5000</p>
            </div>

            {/* Attachments */}
            <div>
              <label className="text-xs text-muted-foreground block mb-2">Ekler (Görsel/Video)</label>
              <label className="flex items-center gap-2 px-4 py-3 rounded border border-dashed cursor-pointer transition-all hover:border-primary/50" style={{ borderColor: "oklch(0.28 0.03 60)", background: "oklch(0.14 0.01 58)" }}>
                <Upload size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {uploading ? "Yükleniyor..." : "Dosya seç (görsel, video — max 50MB)"}
                </span>
                <input type="file" multiple accept="image/*,video/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
              </label>
              {attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {attachments.map((url, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded text-xs" style={{ background: "oklch(0.20 0.01 60)", border: "1px solid oklch(0.28 0.03 60)" }}>
                      {url.includes("video") || url.includes("mp4") ? <Video size={11} /> : <Image size={11} />}
                      <span className="text-muted-foreground max-w-32 truncate">{url.split("/").pop() || `Dosya ${i + 1}`}</span>
                      <button type="button" onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-foreground">
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={submitMutation.isPending || !form.subject || !form.message} className="w-full py-2.5 rounded font-semibold text-sm transition-all disabled:opacity-50" style={{ background: "linear-gradient(135deg, oklch(0.72 0.14 75), oklch(0.65 0.12 70))", color: "oklch(0.10 0.01 60)" }}>
              {submitMutation.isPending ? "Gönderiliyor..." : "Gönder"}
            </button>
          </form>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border p-4" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
            <h3 className="font-semibold text-sm mb-3">Nasıl Çalışır?</h3>
            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "oklch(0.72 0.14 75 / 0.2)", color: "oklch(0.75 0.16 75)" }}>1</span>
                <p>Formu doldurun ve türü seçin</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "oklch(0.72 0.14 75 / 0.2)", color: "oklch(0.75 0.16 75)" }}>2</span>
                <p>İsterseniz görsel veya video ekleyin</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "oklch(0.72 0.14 75 / 0.2)", color: "oklch(0.75 0.16 75)" }}>3</span>
                <p>Gönderim Discord kanalına otomatik iletilir</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "oklch(0.72 0.14 75 / 0.2)", color: "oklch(0.75 0.16 75)" }}>4</span>
                <p>Admin ekibi 24 saat içinde yanıt verir</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={14} style={{ color: "oklch(0.70 0.15 30)" }} />
              <h3 className="font-semibold text-sm">Önemli Not</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Oyuncu raporlarında mümkünse ekran görüntüsü veya video kanıtı ekleyin. Kanıtsız raporlar işleme alınmayabilir.
            </p>
          </div>

          {isAuthenticated && user && (
            <div className="rounded-lg border p-4" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
              <p className="text-xs text-muted-foreground">Giriş yapıldı:</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{user.name || user.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
