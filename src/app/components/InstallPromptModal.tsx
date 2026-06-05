import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, X, Smartphone, Monitor } from "lucide-react";

const FONT_MONO = "JetBrains Mono, monospace";
const FONT_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

const STORAGE_KEY = "climate-argos-install-dismissed";

interface InstallPromptModalProps {
  onInstalled?: () => void;
}

export function InstallPromptModal({ onInstalled }: InstallPromptModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) return;

    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsVisible(false);
      onInstalled?.();
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md mx-auto px-4"
        >
          <div
            className="bg-card/95 border border-primary/30 rounded-xl p-5 shadow-2xl shadow-primary/10 backdrop-blur-md"
            role="dialog"
            aria-labelledby="install-modal-title"
            aria-describedby="install-modal-desc"
          >
            <button
              onClick={handleDismiss}
              aria-label="Fechar"
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X size={14} />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Download size={24} className="text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  id="install-modal-title"
                  className="text-base font-semibold text-foreground"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  Instale o ClimateArgos como um app!
                </h3>
                <p
                  id="install-modal-desc"
                  className="text-sm text-muted-foreground mt-1 leading-relaxed"
                >
                  Acesse o menu do navegador (ícone de seta) e selecione{" "}
                  <span className="text-primary font-medium">"Adicionar à Tela Inicial"</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Smartphone size={12} />
                <span style={{ fontFamily: FONT_MONO }}>Mobile</span>
              </div>
              <div className="flex-1 h-px bg-border" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Monitor size={12} />
                <span style={{ fontFamily: FONT_MONO }}>Desktop</span>
              </div>
            </div>

            <div className="mt-3 text-xs text-muted-foreground/70 space-y-1">
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
                Acesso rápido pela tela inicial
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />
                Funciona offline após instalação
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
                Notificações de alertas em tempo real
              </p>
            </div>

            {deferredPrompt && (
              <button
                onClick={handleInstall}
                className="mt-4 w-full py-2.5 px-4 rounded-lg bg-primary/15 border border-primary/30 text-primary font-medium text-sm hover:bg-primary/25 focus-visible:bg-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
                style={{ fontFamily: FONT_MONO }}
              >
                INSTALAR AGORA
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<{ outcome: "accepted" | "dismissed" }>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}