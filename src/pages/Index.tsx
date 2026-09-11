import { Terminal } from '@/components/Terminal';
import { FloatingInstallButton } from '@/components/FloatingInstallButton';
import { AdWrapper } from '@/components/AdWrapper';
import { Seo } from '@/components/Seo';

const Index = () => {
  // Set showTopBanner to true when you want to display a sponsor/support banner
  // Set showSideAds to true when you have display ads to show
  return (
    <AdWrapper showTopBanner={false} showSideAds={false}>
      <main className="min-h-screen">
        <Seo
          title="Devxy - Console de Micro-Ferramentas para Desenvolvedores"
          description="Gerador de CPF, CNPJ, Título Eleitoral, emails temporários e mais. Console interativo com +15 ferramentas para desenvolvedores brasileiros. Gratuito e sem cadastro."
          path="/"
        />
        <h1 className="sr-only">Devxy - Console de Micro-Ferramentas para Desenvolvedores</h1>
        <Terminal />
        <FloatingInstallButton />
      </main>
    </AdWrapper>
  );
};

export default Index;
