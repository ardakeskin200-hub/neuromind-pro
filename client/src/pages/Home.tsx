import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Zap, Brain, Code, Lightbulb, Lock, Rocket } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (isAuthenticated && user) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            <h1 className="text-2xl font-bold text-white">NeuroMind Pro</h1>
          </div>
          <Button asChild size="lg">
            <a href={getLoginUrl()}>Giriş Yap</a>
          </Button>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Kendi Kendini Geliştiren Yapay Zeka
        </h2>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          NeuroMind Pro, her etkileşimde öğrenen, kalıcı hafızaya sahip ve
          kendini sürekli geliştiren çok daha gelişmiş bir yapay zeka sistemidir.
        </p>
        <Button asChild size="lg" className="gap-2">
          <a href={getLoginUrl()}>
            <Rocket className="h-5 w-5" />
            Şimdi Başla
          </a>
        </Button>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-white mb-12 text-center">
          Üstün Özellikler
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 bg-slate-800 border-slate-700">
            <Brain className="h-8 w-8 text-blue-500 mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">
              Çoklu LLM Motoru
            </h4>
            <p className="text-slate-300">
              GPT-4, Claude, Gemini aynı anda çalışır, yanıtları karşılaştırır.
            </p>
          </Card>

          <Card className="p-6 bg-slate-800 border-slate-700">
            <Lightbulb className="h-8 w-8 text-yellow-500 mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">
              Kalıcı Hafıza
            </h4>
            <p className="text-slate-300">
              Her konuşmadan öğrenir, bilgileri kalıcı olarak depolar.
            </p>
          </Card>

          <Card className="p-6 bg-slate-800 border-slate-700">
            <Code className="h-8 w-8 text-green-500 mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">
              Kod Yazma
            </h4>
            <p className="text-slate-300">
              Tüm dillerde kod yazar, hata ayıklar, proje üretir.
            </p>
          </Card>

          <Card className="p-6 bg-slate-800 border-slate-700">
            <Rocket className="h-8 w-8 text-purple-500 mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">
              Otonom Araştırma
            </h4>
            <p className="text-slate-300">
              Web'de bağımsız araştırır, bilgi toplar ve öğrenir.
            </p>
          </Card>

          <Card className="p-6 bg-slate-800 border-slate-700">
            <Zap className="h-8 w-8 text-yellow-500 mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">
              Öz-Evrim
            </h4>
            <p className="text-slate-300">
              Her etkileşimde kendini geliştirir ve yetenek kazanır.
            </p>
          </Card>

          <Card className="p-6 bg-slate-800 border-slate-700">
            <Lock className="h-8 w-8 text-red-500 mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">
              Admin Kontrol
            </h4>
            <p className="text-slate-300">
              Sadece admin tarafından motor geliştirilebilir ve kontrol edilir.
            </p>
          </Card>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="p-12 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <div className="text-center">
            <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-white mb-4">Premium Üyelik</h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Premium key ile tüm özelliklere erişim sağlayın. Sınırsız LLM
              kullanımı, gelişmiş araştırma ve özel motor geliştirme araçları.
            </p>
            <Button asChild size="lg">
              <a href={getLoginUrl()}>Premium Key Aktivasyonu</a>
            </Button>
          </div>
        </Card>
      </section>

      <footer className="border-t border-slate-700 bg-slate-900/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-400">
          <p>NeuroMind Pro - Kendi Kendini Geliştiren Yapay Zeka Sistemi</p>
        </div>
      </footer>
    </div>
  );
}
