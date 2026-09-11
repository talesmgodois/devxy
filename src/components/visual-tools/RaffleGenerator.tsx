import { useState, useCallback, useEffect } from 'react';
import { Copy, Check, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateRaffleNumber } from '@/utils/generators';

interface RaffleGeneratorProps {
  initialValue?: string;
}

export function RaffleGenerator({ initialValue }: RaffleGeneratorProps) {
  const [start, setStart] = useState('1');
  const [end, setEnd] = useState('100');
  const [exclude, setExclude] = useState('');
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Support v.raffle(start,end) to prefill the range
  useEffect(() => {
    if (!initialValue) return;
    const [initStart, initEnd] = initialValue.split(',').map(v => v.trim());
    if (initStart) setStart(initStart);
    if (initEnd) setEnd(initEnd);
  }, [initialValue]);

  const draw = useCallback(() => {
    const startNum = parseInt(start, 10);
    const endNum = parseInt(end, 10);

    if (isNaN(startNum) || isNaN(endNum)) {
      setError('Início e fim precisam ser números inteiros válidos.');
      setResults([]);
      return;
    }
    if (startNum > endNum) {
      setError(`Início (${startNum}) deve ser menor ou igual ao fim (${endNum}).`);
      setResults([]);
      return;
    }

    const excludeList = exclude
      .split(',')
      .map(v => parseInt(v.trim(), 10))
      .filter(n => !isNaN(n));

    try {
      const drawn = Array.from({ length: count }, () => generateRaffleNumber(startNum, endNum, excludeList));
      setResults(drawn);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível sortear um número.');
      setResults([]);
    }
  }, [start, end, exclude, count]);

  const copyToClipboard = useCallback(async () => {
    if (results.length === 0) return;
    await navigator.clipboard.writeText(results.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [results]);

  return (
    <div className="h-full flex flex-col gap-5 p-6 bg-background text-foreground overflow-auto">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground mb-1">🎟️ Raffle Generator</h2>
        <p className="text-sm text-muted-foreground">Sorteie número(s) aleatório(s) dentro de um intervalo</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Início</label>
          <Input
            type="number"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="h-10 text-base font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Fim</label>
          <Input
            type="number"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="h-10 text-base font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">Excluir números (opcional)</label>
        <Input
          type="text"
          placeholder="ex: 13, 27, 40"
          value={exclude}
          onChange={(e) => setExclude(e.target.value)}
          className="h-10 font-mono"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-muted-foreground">Quantidade:</label>
        <Input
          type="number"
          min={1}
          max={100}
          value={count}
          onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
          className="w-20 h-9"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={draw} className="gap-2 flex-1">
          <Shuffle className="h-4 w-4" />
          Sortear
        </Button>
        <Button
          variant="ghost"
          onClick={copyToClipboard}
          disabled={results.length === 0}
          className="gap-2"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copiado!' : 'Copiar'}
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-md border border-destructive/50 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Resultado{results.length > 1 ? 's' : ''}:
          </span>
          <div className="flex flex-wrap gap-2 p-3 rounded-md border border-border bg-muted/30">
            {results.map((n, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-md bg-primary/20 text-primary font-mono text-lg font-bold"
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
