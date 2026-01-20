// Mock Data Generator - Shared core logic for CLI (r.mock) and Visual (v.mock)

export type MockFieldType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'uuid' 
  | 'email' 
  | 'name' 
  | 'date' 
  | 'phone'
  | 'url'
  | 'address'
  | 'company';

export interface MockField {
  fieldName: string;
  type: MockFieldType;
}

// Type definitions for generator functions
type FieldGenerator = () => string | number | boolean;

// Generator functions for each type
const generators: Record<MockFieldType, FieldGenerator> = {
  string: () => {
    const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit'];
    const wordCount = Math.floor(Math.random() * 4) + 2;
    return Array.from({ length: wordCount }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
  },
  
  number: () => Math.floor(Math.random() * 10000),
  
  boolean: () => Math.random() > 0.5,
  
  uuid: () => {
    const hex = '0123456789abcdef';
    const segments = [8, 4, 4, 4, 12];
    return segments
      .map(len => Array.from({ length: len }, () => hex[Math.floor(Math.random() * 16)]).join(''))
      .join('-');
  },
  
  email: () => {
    const names = ['john', 'jane', 'alex', 'chris', 'sam', 'taylor', 'jordan', 'casey', 'morgan', 'riley'];
    const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'proton.me', 'example.com'];
    const name = names[Math.floor(Math.random() * names.length)];
    const num = Math.floor(Math.random() * 100);
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${name}${num}@${domain}`;
  },
  
  name: () => {
    const firstNames = ['John', 'Jane', 'Alex', 'Chris', 'Sam', 'Taylor', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Emma', 'Liam', 'Olivia', 'Noah', 'Sophia'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Wilson'];
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${first} ${last}`;
  },
  
  date: () => {
    const start = new Date(2020, 0, 1);
    const end = new Date();
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
  },
  
  phone: () => {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const prefix = Math.floor(Math.random() * 900) + 100;
    const lineNum = Math.floor(Math.random() * 9000) + 1000;
    return `(${areaCode}) ${prefix}-${lineNum}`;
  },
  
  url: () => {
    const protocols = ['https://'];
    const domains = ['example', 'test', 'demo', 'sample', 'mock'];
    const tlds = ['.com', '.org', '.net', '.io', '.dev'];
    const paths = ['', '/about', '/products', '/api', '/docs'];
    return `${protocols[0]}${domains[Math.floor(Math.random() * domains.length)]}${tlds[Math.floor(Math.random() * tlds.length)]}${paths[Math.floor(Math.random() * paths.length)]}`;
  },
  
  address: () => {
    const streets = ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Pine Rd', 'Elm Blvd', 'Park Way'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'San Diego', 'Dallas'];
    const number = Math.floor(Math.random() * 9000) + 100;
    const street = streets[Math.floor(Math.random() * streets.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    return `${number} ${street}, ${city}`;
  },
  
  company: () => {
    const prefixes = ['Tech', 'Global', 'Digital', 'Smart', 'Prime', 'Alpha', 'Next', 'Meta'];
    const suffixes = ['Corp', 'Inc', 'Labs', 'Systems', 'Solutions', 'Group', 'Co', 'Industries'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix} ${suffix}`;
  },
};

// Available field types for UI dropdown
export const FIELD_TYPES: { value: MockFieldType; label: string }[] = [
  { value: 'string', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'uuid', label: 'UUID' },
  { value: 'email', label: 'Email' },
  { value: 'name', label: 'Name' },
  { value: 'date', label: 'Date' },
  { value: 'phone', label: 'Phone' },
  { value: 'url', label: 'URL' },
  { value: 'address', label: 'Address' },
  { value: 'company', label: 'Company' },
];

// Type aliases for CLI compatibility
export const TYPE_ALIASES: Record<string, MockFieldType> = {
  str: 'string',
  text: 'string',
  int: 'number',
  num: 'number',
  integer: 'number',
  bool: 'boolean',
  id: 'uuid',
  mail: 'email',
  fullname: 'name',
  pessoa: 'name',
  data: 'date',
  tel: 'phone',
  telefone: 'phone',
  link: 'url',
  endereco: 'address',
  empresa: 'company',
};

// Resolve type alias to actual type
export function resolveType(type: string): MockFieldType {
  const lower = type.toLowerCase();
  return (TYPE_ALIASES[lower] || lower) as MockFieldType;
}

// Generate a single mock object based on field definitions
export function generateMockObject(fields: MockField[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  
  for (const field of fields) {
    const generator = generators[field.type];
    if (generator) {
      obj[field.fieldName] = generator();
    } else {
      obj[field.fieldName] = null;
    }
  }
  
  return obj;
}

// Generate multiple mock objects
export function generateMocks(fields: MockField[], count: number): Record<string, unknown>[] {
  return Array.from({ length: count }, () => generateMockObject(fields));
}

// Parse CLI fields string: "nome:name,email:email,idade:number"
export function parseFieldsString(fieldsStr: string): MockField[] {
  return fieldsStr.split(',').map(pair => {
    const [fieldName, typeStr] = pair.trim().split(':');
    const type = resolveType(typeStr?.trim() || 'string');
    return { fieldName: fieldName.trim(), type };
  }).filter(f => f.fieldName);
}

// Format mock data as JSON string
export function formatMocksAsJson(mocks: Record<string, unknown>[], pretty = true): string {
  return JSON.stringify(mocks, null, pretty ? 2 : 0);
}
