export { TemperatureConverter } from './TemperatureConverter';
export { CsvGenerator } from './CsvGenerator';
export { CurlGenerator } from './CurlGenerator';
export { JsonFormatter } from './JsonFormatter';
export { HelpVisualTool } from './HelpVisualTool';
export { EmbedManager } from './EmbedManager';
export { EmbedViewer } from './EmbedViewer';

export interface VisualTool {
  name: string;
  component: React.ComponentType<{ initialValue?: string }>;
  description: string;
  icon: string;
}

import { TemperatureConverter as TempComp } from './TemperatureConverter';
import { CsvGenerator as CsvComp } from './CsvGenerator';
import { CurlGenerator as CurlComp } from './CurlGenerator';
import { JsonFormatter as JsonComp } from './JsonFormatter';
import { HelpVisualTool as HelpComp } from './HelpVisualTool';
import { EmbedManager as EmbedComp } from './EmbedManager';

export const VISUAL_TOOLS: Record<string, VisualTool> = {
  temp: {
    name: 'temp',
    component: TempComp,
    description: 'Temperature converter (F/C/K)',
    icon: '🌡️',
  },
  csv: {
    name: 'csv',
    component: CsvComp,
    description: 'JSON to CSV converter',
    icon: '📊',
  },
  curl: {
    name: 'curl',
    component: CurlComp,
    description: 'cURL request generator',
    icon: '🔗',
  },
  json: {
    name: 'json',
    component: JsonComp,
    description: 'JSON formatter & validator',
    icon: '📋',
  },
  help: {
    name: 'help',
    component: HelpComp,
    description: 'Command reference & help',
    icon: '📖',
  },
  embeds: {
    name: 'embeds',
    component: EmbedComp,
    description: 'Manage embedded URL tools',
    icon: '🔗',
  },
};
