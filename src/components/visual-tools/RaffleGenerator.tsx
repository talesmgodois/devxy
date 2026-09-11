import { useState, useCallback, useEffect } from 'react';
import { Copy, Check, Shuffle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { generateRaffleNumber } from '@/utils/generators';

interface RaffleGeneratorProps {
  initialValue?: string;
}

export function RaffleGenerator({ initialValue }: RaffleGeneratorProps) {
  const [start, setStart] = useState('1');
  const [end, setEnd] = useState('100');
  const [count, setCount] = useState(1);
  const [excludePrevious, setExcludePrevious] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const [lastDrawCount, setLastDrawCount] = useState(0);
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
      return;
    }
    if (startNum > endNum) {
      setError(`Início (${startNum}) deve ser menor ou igual ao fim (${endNum}).`);
      return;
    }

    const excludeSet = new Set<number>(excludePrevious ? history : []);

    try {
      const drawn: number[] = [];
      for (let i = 0; i < count; i++) {
        const n = generateRaffleNumber(startNum, endNum, Array.from(excludeSet));
        drawn.push(n);
        if (excludePrevious) excludeSet.add(n);
      }
      setError(null);
      setHistory(prev => [...prev, ...drawn]);
      setLastDrawCount(drawn.length);
    } catch {
      setError(
        excludePrevious
          ? `Não há mais números disponíveis entre ${startNum} e ${endNum} (todos já foram sorteados).`
          : `Não foi possível sortear um número entre ${startNum} e ${endNum}.`
      );
    }
  }, [start, end, count, excludePrevious, history]);

  const reset = useCallback(() => {
    setHistory([]);
    setLastDrawCount(0);
    setError(null);
  }, []);

  const copyToClipboard = useCallback(async () => {
    if (history.length === 0) return;
    await navigator.clipboard.writeText(history.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [history]);

  const lastDrawStartIndex = history.length - lastDrawCount;

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
        <Checkbox
          id="exclude-previous"
          checked={excludePrevious}
          onCheckedChange={(checked) => setExcludePrevious(checked === true)}
        />
        <label htmlFor="exclude-previous" className="text-sm text-muted-foreground cursor-pointer">
          Excluir resultados anteriores
        </label>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={draw} className="gap-2 flex-1">
          <Shuffle className="h-4 w-4" />
          Sortear
        </Button>
        <Button
          variant="ghost"
          onClick={copyToClipboard}
          disabled={history.length === 0}
          className="gap-2"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copiado!' : 'Copiar'}
        </Button>
        <Button
          variant="outline"
          onClick={reset}
          disabled={history.length === 0}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-md border border-destructive/50 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {history.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Histórico ({history.length}):
          </span>
          <div className="flex flex-wrap gap-2 p-3 rounded-md border border-border bg-muted/30">
            {history.map((n, i) => (
              <span
                key={i}
                className={
                  i >= lastDrawStartIndex
                    ? 'px-3 py-1.5 rounded-md bg-primary/20 text-primary font-mono text-lg font-bold'
                    : 'px-3 py-1.5 rounded-md bg-muted text-muted-foreground font-mono text-sm'
                }
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
