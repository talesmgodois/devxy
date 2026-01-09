export { PythonInterpreter } from './PythonInterpreter';
export { JavaScriptInterpreter } from './JavaScriptInterpreter';

export interface EmbeddedInterpreter {
  name: string;
  component: React.ComponentType;
  description: string;
  icon: string;
  language: string;
}

import { PythonInterpreter as PythonComp } from './PythonInterpreter';
import { JavaScriptInterpreter as JSComp } from './JavaScriptInterpreter';

export const EMBEDDED_INTERPRETERS: Record<string, EmbeddedInterpreter> = {
  python: {
    name: 'python',
    component: PythonComp,
    description: 'Python interpreter (simulated)',
    icon: '🐍',
    language: 'Python',
  },
  javascript: {
    name: 'javascript',
    component: JSComp,
    description: 'JavaScript console (ES6+)',
    icon: '🟨',
    language: 'JavaScript',
  },
  js: {
    name: 'js',
    component: JSComp,
    description: 'JavaScript console (ES6+)',
    icon: '🟨',
    language: 'JavaScript',
  },
};
