import { Terminal } from '@/components/Terminal';
import { FloatingInstallButton } from '@/components/FloatingInstallButton';

const Index = () => {
  return (
    <main className="min-h-screen">
      <h1 className="sr-only">Devxy - Console de Micro-Ferramentas para Desenvolvedores</h1>
      <Terminal />
      <FloatingInstallButton />
    </main>
  );
};

export default Index;
