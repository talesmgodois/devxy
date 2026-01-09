import { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isStandalone) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">App Instalado!</h1>
          <p className="text-muted-foreground">
            Você já está usando o Devxy como aplicativo. Aproveite!
          </p>
          <Button asChild className="w-full">
            <a href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ir para o Terminal
            </a>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Instalar Devxy</h1>
          <p className="text-muted-foreground">
            Instale o Devxy no seu dispositivo para acesso rápido, mesmo offline.
          </p>
        </div>

        {/* Install Options */}
        <div className="space-y-4">
          {isInstalled ? (
            <div className="p-6 rounded-lg border border-green-500/30 bg-green-500/10 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-foreground mb-2">Instalação Concluída!</h2>
              <p className="text-sm text-muted-foreground">
                O Devxy foi adicionado à sua tela inicial.
              </p>
            </div>
          ) : deferredPrompt ? (
            <Button 
              onClick={handleInstallClick} 
              className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
            >
              <Download className="w-5 h-5 mr-2" />
              Instalar Agora
            </Button>
          ) : isIOS ? (
            <div className="p-6 rounded-lg border border-border bg-muted/50 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Instruções para iOS</h2>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">1</span>
                  <span>Toque no botão <strong className="text-foreground">Compartilhar</strong> (ícone de quadrado com seta)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">2</span>
                  <span>Role para baixo e toque em <strong className="text-foreground">"Adicionar à Tela de Início"</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">3</span>
                  <span>Toque em <strong className="text-foreground">"Adicionar"</strong> no canto superior direito</span>
                </li>
              </ol>
            </div>
          ) : (
            <div className="p-6 rounded-lg border border-border bg-muted/50 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Como Instalar</h2>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">1</span>
                  <span>Abra o menu do navegador (três pontos ou linhas)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">2</span>
                  <span>Toque em <strong className="text-foreground">"Instalar aplicativo"</strong> ou <strong className="text-foreground">"Adicionar à tela inicial"</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">3</span>
                  <span>Confirme a instalação</span>
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Benefícios</h3>
          <div className="grid gap-3">
            {[
              'Acesso instantâneo pela tela inicial',
              'Funciona mesmo sem internet',
              'Experiência de app nativo',
              'Sem ocupar espaço de armazenamento',
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {benefit}
              </div>
            ))}
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <a 
            href="/" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Terminal
          </a>
        </div>
      </div>
    </main>
  );
};

export default Install;