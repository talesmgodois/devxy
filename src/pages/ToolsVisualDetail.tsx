import { useParams, useNavigate } from 'react-router-dom';
import { VISUAL_TOOLS } from '@/components/visual-tools';
import { ToolWrapper, NotFoundState } from '@/components/visual-tools/ToolPageChrome';
import { Seo, SITE_URL } from '@/components/Seo';

const ToolsVisualDetail = () => {
  const { tool } = useParams<{ tool: string }>();
  const navigate = useNavigate();

  const visualTool = tool ? VISUAL_TOOLS[tool] : undefined;

  if (!visualTool) {
    return (
      <>
        <Seo
          title="Ferramenta não encontrada - Devxy"
          description="A ferramenta visual solicitada não existe ou foi removida."
          path={`/tools/visual/${tool ?? ''}`}
          noindex
        />
        <NotFoundState
          message={`Visual tool "${tool}" not found`}
          onBack={() => navigate('/tools/visual')}
          backLabel="Back to Visual Tools"
        />
      </>
    );
  }

  const ToolComponent = visualTool.component;
  const path = `/tools/visual/${visualTool.name}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `Devxy - v.${visualTool.name}`,
    description: visualTool.description,
    url: `${SITE_URL}${path}`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
    },
    isPartOf: {
      '@type': 'WebApplication',
      name: 'Devxy',
      url: SITE_URL,
    },
  };

  return (
    <>
      <Seo
        title={`v.${visualTool.name} - ${visualTool.description} | Devxy`}
        description={`${visualTool.description}. Ferramenta visual gratuita do Devxy, console de micro-ferramentas para desenvolvedores.`}
        path={path}
        jsonLd={jsonLd}
      />
      <ToolWrapper
        icon={visualTool.icon}
        name={visualTool.name}
        description={visualTool.description}
        onBack={() => navigate('/tools/visual')}
        backLabel="Back to Visual Tools"
      >
        <ToolComponent />
      </ToolWrapper>
    </>
  );
};

export default ToolsVisualDetail;
