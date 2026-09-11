import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ToolWrapperProps {
  icon: string;
  name: string;
  description: string;
  onBack: () => void;
  backLabel?: string;
  children: React.ReactNode;
}

export const ToolWrapper = ({ icon, name, description, onBack, backLabel = 'Back', children }: ToolWrapperProps) => (
  <div className="min-h-screen bg-background text-foreground flex flex-col">
    {/* Header */}
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0"
          title={backLabel}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl">{icon}</span>
          <div className="min-w-0">
            <h1 className="font-mono font-semibold text-sm truncate">{name}</h1>
            <p className="text-xs text-muted-foreground truncate">{description}</p>
          </div>
        </div>
      </div>
    </header>

    {/* Content */}
    <main className="flex-1 container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
    </main>
  </div>
);

interface NotFoundStateProps {
  message: string;
  onBack: () => void;
  backLabel?: string;
}

export const NotFoundState = ({ message, onBack, backLabel = 'Back to Terminal' }: NotFoundStateProps) => (
  <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="text-6xl">🔍</div>
      <h1 className="text-xl font-semibold">Tool Not Found</h1>
      <p className="text-muted-foreground">{message}</p>
      <Button onClick={onBack} variant="outline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {backLabel}
      </Button>
    </div>
  </div>
);
