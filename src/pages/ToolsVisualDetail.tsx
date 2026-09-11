import { useParams, useNavigate } from 'react-router-dom';
import { VISUAL_TOOLS } from '@/components/visual-tools';
import { ToolWrapper, NotFoundState } from '@/components/visual-tools/ToolPageChrome';

const ToolsVisualDetail = () => {
  const { tool } = useParams<{ tool: string }>();
  const navigate = useNavigate();

  const visualTool = tool ? VISUAL_TOOLS[tool] : undefined;

  if (!visualTool) {
    return (
      <NotFoundState
        message={`Visual tool "${tool}" not found`}
        onBack={() => navigate('/tools/visual')}
        backLabel="Back to Visual Tools"
      />
    );
  }

  const ToolComponent = visualTool.component;

  return (
    <ToolWrapper
      icon={visualTool.icon}
      name={visualTool.name}
      description={visualTool.description}
      onBack={() => navigate('/tools/visual')}
      backLabel="Back to Visual Tools"
    >
      <ToolComponent />
    </ToolWrapper>
  );
};

export default ToolsVisualDetail;
