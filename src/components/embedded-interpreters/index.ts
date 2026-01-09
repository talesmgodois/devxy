export { PythonInterpreter } from './PythonInterpreter';

export interface EmbeddedInterpreter {
  name: string;
  component: React.ComponentType;
  description: string;
  icon: string;
  language: string;
}

import { PythonInterpreter as PythonComp } from './PythonInterpreter';

export const EMBEDDED_INTERPRETERS: Record<string, EmbeddedInterpreter> = {
  python: {
    name: 'python',
    component: PythonComp,
    description: 'Python interpreter (simulated)',
    icon: '🐍',
    language: 'Python',
  },
};
