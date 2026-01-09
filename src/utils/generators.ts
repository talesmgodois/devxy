// Brazilian CPF Generator
export function generateCPF(): string {
  const randomDigits = (): number[] => {
    return Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  };

  const calculateVerifier = (digits: number[], weights: number[]): number => {
    const sum = digits.reduce((acc, digit, i) => acc + digit * weights[i], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const digits = randomDigits();
  const firstVerifier = calculateVerifier(digits, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  digits.push(firstVerifier);
  const secondVerifier = calculateVerifier(digits, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  digits.push(secondVerifier);

  return `${digits.slice(0, 3).join('')}.${digits.slice(3, 6).join('')}.${digits.slice(6, 9).join('')}-${digits.slice(9).join('')}`;
}

// Brazilian CNPJ Generator
export function generateCNPJ(): string {
  const randomDigits = (): number[] => {
    return Array.from({ length: 8 }, () => Math.floor(Math.random() * 10));
  };

  const calculateVerifier = (digits: number[], weights: number[]): number => {
    const sum = digits.reduce((acc, digit, i) => acc + digit * weights[i], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const base = randomDigits();
  base.push(0, 0, 0, 1); // Branch indicator (0001)
  
  const firstVerifier = calculateVerifier(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  base.push(firstVerifier);
  
  const secondVerifier = calculateVerifier(base, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  base.push(secondVerifier);

  return `${base.slice(0, 2).join('')}.${base.slice(2, 5).join('')}.${base.slice(5, 8).join('')}/${base.slice(8, 12).join('')}-${base.slice(12).join('')}`;
}

// Brazilian Titulo Eleitoral Generator
export function generateTituloEleitor(): string {
  const randomDigit = () => Math.floor(Math.random() * 10);
  
  // First 8 digits - sequential number
  const seq = Array.from({ length: 8 }, randomDigit);
  
  // State code (01-28)
  const stateCode = Math.floor(Math.random() * 28) + 1;
  const state = stateCode.toString().padStart(2, '0').split('').map(Number);
  
  // Calculate first verifier
  const weights1 = [2, 3, 4, 5, 6, 7, 8, 9];
  const sum1 = seq.reduce((acc, digit, i) => acc + digit * weights1[i], 0);
  const firstVerifier = sum1 % 11 === 0 ? 0 : sum1 % 11 === 1 ? (stateCode <= 19 ? 0 : 1) : 11 - (sum1 % 11);
  
  // Calculate second verifier
  const weights2 = [7, 8, 9];
  const sum2 = [...state, firstVerifier].reduce((acc, digit, i) => acc + digit * weights2[i], 0);
  const secondVerifier = sum2 % 11 === 0 ? 0 : sum2 % 11 === 1 ? (stateCode <= 19 ? 0 : 1) : 11 - (sum2 % 11);
  
  return `${seq.join('')} ${state.join('')}${firstVerifier}${secondVerifier}`;
}

// Username Generator
const adjectives = ['swift', 'bright', 'dark', 'silent', 'wild', 'calm', 'bold', 'quick', 'sharp', 'cool', 'epic', 'mega', 'ultra', 'cyber', 'neo', 'quantum', 'pixel', 'code', 'dev', 'hack'];
const nouns = ['wolf', 'hawk', 'tiger', 'storm', 'blade', 'star', 'shadow', 'flame', 'frost', 'thunder', 'ninja', 'coder', 'byte', 'node', 'stack', 'kernel', 'matrix', 'vector', 'pulse', 'nexus'];

export function generateUserName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}_${noun}${num}`;
}

// Nickname Generator
const nickPrefixes = ['Dr', 'Mr', 'Ms', 'Prof', 'Sir', 'Lord', 'Captain', 'Agent', 'Master', 'Chief'];
const nickSuffixes = ['X', 'Z', 'Pro', 'Max', 'Elite', 'Prime', 'Alpha', 'Omega', 'Zero', 'One'];

export function generateNickName(): string {
  const usePrefix = Math.random() > 0.5;
  const useSuffix = Math.random() > 0.5;
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  let nick = `${adj.charAt(0).toUpperCase() + adj.slice(1)}${noun.charAt(0).toUpperCase() + noun.slice(1)}`;
  
  if (usePrefix) {
    nick = `${nickPrefixes[Math.floor(Math.random() * nickPrefixes.length)]}${nick}`;
  }
  if (useSuffix) {
    nick = `${nick}${nickSuffixes[Math.floor(Math.random() * nickSuffixes.length)]}`;
  }
  
  return nick;
}

// Email Generator
const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'proton.me', 'icloud.com', 'mail.com', 'fastmail.com', 'tutanota.com'];
const firstNames = ['john', 'jane', 'alex', 'chris', 'sam', 'taylor', 'jordan', 'casey', 'morgan', 'riley', 'dev', 'code', 'tech', 'data', 'cloud'];
const lastNames = ['smith', 'jones', 'wilson', 'brown', 'davis', 'miller', 'garcia', 'martinez', 'anderson', 'taylor', 'dev', 'coder', 'hacker', 'ninja', 'guru'];

export function generateEmail(): string {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const separator = Math.random() > 0.5 ? '.' : '_';
  const hasNumber = Math.random() > 0.5;
  const num = hasNumber ? Math.floor(Math.random() * 100) : '';
  
  return `${first}${separator}${last}${num}@${domain}`;
}
