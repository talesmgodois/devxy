import { Terminal } from '@/components/Terminal';
import { FloatingInstallButton } from '@/components/FloatingInstallButton';
import { AdWrapper } from '@/components/AdWrapper';

const Index = () => {
  // Set showTopBanner to true when you want to display a sponsor/support banner
  // Set showSideAds to true when you have display ads to show
  return (
    <AdWrapper showTopBanner={false} showSideAds={false}>
      <main className="min-h-screen">
        <h1 className="sr-only">Devxy - Console de Micro-Ferramentas para Desenvolvedores</h1>
        <Terminal />
        <FloatingInstallButton />
      </main>
    </AdWrapper>
  );
};

export default Index;
