import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Plus, Zap, Brain, Code, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  modelUsed?: string;
  createdAt: Date;
}

export default function Chat() {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createSessionMutation = trpc.chat.createSession.useMutation();
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  useEffect(() => {
    if (!sessionId) {
      createSessionMutation.mutate(
        { title: "NeuroMind Pro Chat" },
        {
          onSuccess: () => {
            setSessionId(1);
          },
        }
      );
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !sessionId || isLoading) return;

    const userMessage = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        sessionId,
        content: userMessage,
        useMultipleModels: true,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: "user",
          content: userMessage,
          createdAt: new Date(),
        },
      ]);

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: "assistant",
          content: response.response,
          modelUsed: response.model,
          createdAt: new Date(),
        },
      ]);

      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="border-b border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              NeuroMind Pro
            </h1>
            <p className="text-sm text-muted-foreground">Premium AI Assistant</p>
          </div>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border-b border-border bg-secondary/30 px-4 py-3">
        <div className="flex items-center gap-6 overflow-x-auto text-sm">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Brain className="h-4 w-4 text-blue-500" />
            <span>Çoklu LLM</span>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Code className="h-4 w-4 text-green-500" />
            <span>Kod Yazma</span>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Search className="h-4 w-4 text-purple-500" />
            <span>Araştırma</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Card className="p-8 max-w-md text-center">
              <h2 className="text-xl font-semibold mb-2">Hoş geldiniz!</h2>
              <p className="text-muted-foreground mb-4">
                NeuroMind Pro ile sohbet etmeye başlayın.
              </p>
            </Card>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={index}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                      isUser
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-card border border-border rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.modelUsed && (
                      <p className="text-xs mt-1 opacity-70">{message.modelUsed}</p>
                    )}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border px-4 py-3 rounded-lg rounded-bl-none">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t border-border bg-card p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Mesajınızı yazın..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
