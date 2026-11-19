"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Bot, User } from "lucide-react";

interface CopilotMessage {
  role: "model" | "user";
  content: string;
}

interface DriverCopilotSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeOrdersCount: number;
}

export function DriverCopilotSheet({
  isOpen,
  onOpenChange,
  activeOrdersCount,
}: DriverCopilotSheetProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      role: "model",
      content: "¡Hola! Soy Copo, tu asistente logístico de Reparto Fácil. ¿Querés que revise las direcciones o te indique la entrega más cercana?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    const newMsgs = [...messages, { role: "user" as const, content: userText }];
    setMessages(newMsgs);
    setInput("");
    setIsThinking(true);

    setTimeout(() => {
      let reply = "Entendido. Según el tráfico y las direcciones de entrega, la mejor ruta es tomar las avenidas principales para evitar demoras.";
      if (userText.toLowerCase().includes("orden") || userText.toLowerCase().includes("ruta") || userText.toLowerCase().includes("siguiente")) {
        reply = `Tenés ${activeOrdersCount} entrega(s) en camino. Te recomiendo entregar primero las que están dentro del radio de 2 km.`;
      }
      setMessages([...newMsgs, { role: "model", content: reply }]);
      setIsThinking(false);
    }, 700);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 p-0 flex flex-col h-full">
        <SheetHeader className="p-4 border-b border-slate-800 flex flex-row items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <SheetTitle className="text-base font-black text-white">Copiloto IA · Copo</SheetTitle>
            <p className="text-[11px] text-slate-400 font-medium">Asistente de ruta para repartidores</p>
          </div>
        </SheetHeader>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "model" && (
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                  m.role === "user"
                    ? "bg-emerald-500 text-white rounded-br-xs"
                    : "bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-xs"
                }`}
              >
                {m.content}
              </div>
              {m.role === "user" && (
                <div className="w-6 h-6 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-2 items-center text-xs text-slate-400 italic">
              <Bot className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span>Copo está pensando...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 space-y-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {["¿Cuál es la más cercana?", "Optimizar mi ruta", "Ver estado de entrega"].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5">
            <Input
              placeholder="Escribile a tu copiloto..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              className="bg-slate-800 border-slate-700 text-white text-xs h-10 rounded-xl"
            />
            <Button
              onClick={() => handleSend(input)}
              className="h-10 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
