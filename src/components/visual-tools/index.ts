export { TemperatureConverter } from './TemperatureConverter';
export { CsvGenerator } from './CsvGenerator';

export interface VisualTool {
  name: string;
  component: React.ComponentType<{ initialValue?: string }>;
  description: string;
  icon: string;
}

import { TemperatureConverter as TempComp } from './TemperatureConverter';
import { CsvGenerator as CsvComp } from './CsvGenerator';

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
};
