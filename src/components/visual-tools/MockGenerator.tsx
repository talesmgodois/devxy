import { useState, useCallback } from 'react';
import { Plus, Trash2, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MockField, 
  MockFieldType, 
  FIELD_TYPES, 
  generateMocks, 
  formatMocksAsJson 
} from '@/utils/mockGenerator';

interface FieldRow {
  id: string;
  fieldName: string;
  type: MockFieldType;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export function MockGenerator() {
  const [fields, setFields] = useState<FieldRow[]>([
    { id: generateId(), fieldName: 'id', type: 'uuid' },
    { id: generateId(), fieldName: 'name', type: 'name' },
    { id: generateId(), fieldName: 'email', type: 'email' },
  ]);
  const [count, setCount] = useState(5);
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const addField = useCallback(() => {
    setFields(prev => [...prev, { id: generateId(), fieldName: '', type: 'string' }]);
  }, []);

  const removeField = useCallback((id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
  }, []);

  const updateField = useCallback((id: string, updates: Partial<FieldRow>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  const generateJson = useCallback(() => {
    const validFields: MockField[] = fields
      .filter(f => f.fieldName.trim())
      .map(f => ({ fieldName: f.fieldName.trim(), type: f.type }));
    
    if (validFields.length === 0) return;
    
    const mocks = generateMocks(validFields, count);
    setJsonOutput(formatMocksAsJson(mocks));
  }, [fields, count]);

  const copyToClipboard = useCallback(async () => {
    if (!jsonOutput) return;
    await navigator.clipboard.writeText(jsonOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [jsonOutput]);

  const hasValidFields = fields.some(f => f.fieldName.trim());

  return (
    <div className="h-full flex flex-col gap-4 p-4 bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Quantidade:</span>
          <Input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-20 h-8 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateJson}
            disabled={!hasValidFields}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Gerar JSON
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            disabled={!jsonOutput}
            className="gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Fields List */}
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Campos</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={addField}
              className="h-7 w-7"
              title="Adicionar campo"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-2">
              {fields.map((field) => (
                <div 
                  key={field.id} 
                  className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border"
                >
                  <Input
                    placeholder="Nome do campo"
                    value={field.fieldName}
                    onChange={(e) => updateField(field.id, { fieldName: e.target.value })}
                    className="flex-1 h-8 text-sm"
                  />
                  
                  <Select
                    value={field.type}
                    onValueChange={(value: MockFieldType) => updateField(field.id, { type: value })}
                  >
                    <SelectTrigger className="w-32 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeField(field.id)}
                    disabled={fields.length <= 1}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* JSON Preview */}
        <div className="flex flex-col gap-2 min-h-0">
          <span className="text-sm font-medium text-muted-foreground">Preview JSON</span>
          
          <ScrollArea className="flex-1 rounded-md border border-border bg-muted/30">
            <pre className="p-3 text-xs font-mono whitespace-pre-wrap break-words text-foreground">
              {jsonOutput || '// Clique em "Gerar JSON" para visualizar o resultado'}
            </pre>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
