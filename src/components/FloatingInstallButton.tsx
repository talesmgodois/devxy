import { Download, X } from 'lucide-react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/ui/button';

export const FloatingInstallButton = () => {
  const { canInstall, promptInstall, dismiss } = usePWAInstall();

  if (!canInstall) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-2 bg-card border border-border rounded-full pl-4 pr-2 py-2 shadow-lg">
        <span className="text-sm text-muted-foreground hidden sm:inline">
          Instalar Devxy
        </span>
        <Button
          onClick={promptInstall}
          size="sm"
          className="rounded-full bg-green-600 hover:bg-green-700 h-8 px-3"
        >
          <Download className="w-4 h-4 mr-1" />
          Instalar
        </Button>
        <button
          onClick={dismiss}
          className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
