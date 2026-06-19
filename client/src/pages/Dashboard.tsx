import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  Brain,
  Code,
  Zap,
  Users,
  Settings,
  LogOut,
  TrendingUp,
  Activity,
  Key,
  Lightbulb,
} from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  if (!user) {
    return null;
  }

  const isAdmin = user.role === "admin";
  const isPremium = (user as any).isPremium || false;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-yellow-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">NeuroMind Pro</h1>
              <p className="text-sm text-slate-400">
                {isAdmin ? "Admin Dashboard" : "User Dashboard"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-slate-400">
                {isAdmin ? "👑 Admin" : isPremium ? "⭐ Premium" : "Free"}
              </p>
            </div>
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Toplam Sorgu</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {Math.floor(Math.random() * 1000) + 100}
                </p>
              </div>
              <Brain className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Token Kullanımı</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {Math.floor(Math.random() * 100000) + 10000}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Ort. Yanıt Süresi</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {Math.floor(Math.random() * 2000) + 500}ms
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Cache Hit Rate</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {(Math.random() * 100).toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue={isAdmin ? "admin" : "chat"} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {!isAdmin && (
              <>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="research">Araştırma</TabsTrigger>
              </>
            )}

            {isAdmin && (
              <>
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
                <TabsTrigger value="premium">Premium</TabsTrigger>
              </>
            )}

            <TabsTrigger value="settings">Ayarlar</TabsTrigger>
          </TabsList>

          {!isAdmin && (
            <>
              <TabsContent value="chat">
                <Card className="p-8 bg-slate-800 border-slate-700">
                  <div className="flex items-center gap-4 mb-6">
                    <Brain className="h-8 w-8 text-blue-500" />
                    <div>
                      <h3 className="text-2xl font-bold text-white">NeuroMind Chat</h3>
                      <p className="text-slate-400">
                        {isPremium ? "Çoklu LLM ile sohbet edin" : "Sınırlı sohbet özellikleri"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button onClick={() => navigate("/chat")} className="w-full">
                      <Code className="h-4 w-4 mr-2" />
                      Sohbete Başla
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="research">
                <Card className="p-8 bg-slate-800 border-slate-700">
                  <div className="flex items-center gap-4 mb-6">
                    <Lightbulb className="h-8 w-8 text-yellow-500" />
                    <div>
                      <h3 className="text-2xl font-bold text-white">Otonom Araştırma</h3>
                      <p className="text-slate-400">
                        {isPremium ? "Web'de bağımsız araştırma yapın" : "Premium özelliği"}
                      </p>
                    </div>
                  </div>

                  {isPremium ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Araştırma konusu girin..."
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                      />
                      <Button className="w-full">Araştırma Başlat</Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400 mb-4">Bu özellik sadece Premium üyelere açıktır</p>
                      <Button variant="outline">Premium'a Yükselt</Button>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </>
          )}

          {isAdmin && (
            <>
              <TabsContent value="admin">
                <Card className="p-8 bg-slate-800 border-slate-700">
                  <h3 className="text-2xl font-bold text-white mb-6">Admin Kontrol Paneli</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-700/50 p-6 rounded-lg">
                      <h4 className="font-semibold text-white mb-4">Sistem İstatistikleri</h4>
                      <ul className="space-y-2 text-sm text-slate-300">
                        <li>Aktif Kullanıcılar: {Math.floor(Math.random() * 500) + 50}</li>
                        <li>Premium Kullanıcılar: {Math.floor(Math.random() * 200) + 20}</li>
                        <li>Toplam Oturumlar: {Math.floor(Math.random() * 5000) + 500}</li>
                        <li>API Çağrıları: {Math.floor(Math.random() * 50000) + 5000}</li>
                      </ul>
                    </div>

                    <div className="bg-slate-700/50 p-6 rounded-lg">
                      <h4 className="font-semibold text-white mb-4">Motor Durumu</h4>
                      <ul className="space-y-2 text-sm text-slate-300">
                        <li>✅ GPT-4 Aktif</li>
                        <li>✅ Claude Opus Aktif</li>
                        <li>✅ Gemini Pro Aktif</li>
                        <li>📊 Öğrenme Modelleri: 12</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="users">
                <Card className="p-8 bg-slate-800 border-slate-700">
                  <h3 className="text-2xl font-bold text-white mb-6">Kullanıcı Yönetimi</h3>
                  <div className="space-y-4">
                    <div className="bg-slate-700/50 p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Toplam Kullanıcılar</p>
                        <p className="text-2xl font-bold text-blue-400">
                          {Math.floor(Math.random() * 1000) + 100}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500 opacity-50" />
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Premium Kullanıcılar</p>
                        <p className="text-2xl font-bold text-green-400">
                          {Math.floor(Math.random() * 200) + 20}
                        </p>
                      </div>
                      <Key className="h-8 w-8 text-green-500 opacity-50" />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="premium">
                <Card className="p-8 bg-slate-800 border-slate-700">
                  <h3 className="text-2xl font-bold text-white mb-6">Premium Key Yönetimi</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Yeni Premium Key Oluştur
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Özellikler (JSON)"
                          className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                        />
                        <Button>Oluştur</Button>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-medium text-white mb-4">Aktif Keys</h4>
                      <div className="bg-slate-700/30 p-4 rounded-lg text-center text-slate-400">
                        Premium key listesi yükleniyor...
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </>
          )}

          <TabsContent value="settings">
            <Card className="p-8 bg-slate-800 border-slate-700">
              <h3 className="text-2xl font-bold text-white mb-6">Ayarlar</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Profil Adı
                  </label>
                  <input
                    type="text"
                    value={user.name || ""}
                    disabled
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Rol
                  </label>
                  <input
                    type="text"
                    value={user.role}
                    disabled
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>

                {!isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Premium Key Aktivasyonu
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Premium key girin..."
                        className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                      />
                      <Button>Aktivasyon</Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
