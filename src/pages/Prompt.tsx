import { Terminal } from '@/components/Terminal';
import { Seo } from '@/components/Seo';

const Prompt = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Devxy - Terminal"
        description="Console interativo com +15 ferramentas para desenvolvedores brasileiros."
        path="/"
        noindex
      />
      <Terminal />
    </div>
  );
};

export default Prompt;
