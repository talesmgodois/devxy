import { useState, useEffect } from 'react';

interface TemperatureConverterProps {
  initialValue?: string;
}

export function TemperatureConverter({ initialValue }: TemperatureConverterProps) {
  const [fahrenheit, setFahrenheit] = useState(initialValue || '32');
  const [celsius, setCelsius] = useState('0');
  const [kelvin, setKelvin] = useState('273.15');
  const [activeInput, setActiveInput] = useState<'f' | 'c' | 'k'>('f');

  useEffect(() => {
    if (initialValue) {
      const f = parseFloat(initialValue);
      if (!isNaN(f)) {
        updateFromFahrenheit(f);
      }
    }
  }, [initialValue]);

  const updateFromFahrenheit = (f: number) => {
    const c = (f - 32) * 5 / 9;
    const k = c + 273.15;
    setFahrenheit(f.toString());
    setCelsius(c.toFixed(2));
    setKelvin(k.toFixed(2));
  };

  const updateFromCelsius = (c: number) => {
    const f = c * 9 / 5 + 32;
    const k = c + 273.15;
    setFahrenheit(f.toFixed(2));
    setCelsius(c.toString());
    setKelvin(k.toFixed(2));
  };

  const updateFromKelvin = (k: number) => {
    const c = k - 273.15;
    const f = c * 9 / 5 + 32;
    setFahrenheit(f.toFixed(2));
    setCelsius(c.toFixed(2));
    setKelvin(k.toString());
  };

  const handleFahrenheitChange = (value: string) => {
    setFahrenheit(value);
    setActiveInput('f');
    const f = parseFloat(value);
    if (!isNaN(f)) {
      updateFromFahrenheit(f);
    }
  };

  const handleCelsiusChange = (value: string) => {
    setCelsius(value);
    setActiveInput('c');
    const c = parseFloat(value);
    if (!isNaN(c)) {
      updateFromCelsius(c);
    }
  };

  const handleKelvinChange = (value: string) => {
    setKelvin(value);
    setActiveInput('k');
    const k = parseFloat(value);
    if (!isNaN(k)) {
      updateFromKelvin(k);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">🌡️ Temperature Converter</h2>
        <p className="text-sm text-muted-foreground">Convert between Fahrenheit, Celsius, and Kelvin</p>
      </div>

      <div className="grid gap-4">
        {/* Fahrenheit */}
        <div className={`p-4 rounded-lg border transition-colors ${
          activeInput === 'f' ? 'border-primary bg-primary/10' : 'border-border bg-card'
        }`}>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Fahrenheit (°F)
          </label>
          <input
            type="number"
            value={fahrenheit}
            onChange={(e) => handleFahrenheitChange(e.target.value)}
            onFocus={() => setActiveInput('f')}
            className="w-full px-4 py-3 text-2xl font-mono bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Arrow indicator */}
        <div className="flex justify-center text-muted-foreground">
          <span className="text-2xl">↕</span>
        </div>

        {/* Celsius */}
        <div className={`p-4 rounded-lg border transition-colors ${
          activeInput === 'c' ? 'border-primary bg-primary/10' : 'border-border bg-card'
        }`}>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Celsius (°C)
          </label>
          <input
            type="number"
            value={celsius}
            onChange={(e) => handleCelsiusChange(e.target.value)}
            onFocus={() => setActiveInput('c')}
            className="w-full px-4 py-3 text-2xl font-mono bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Arrow indicator */}
        <div className="flex justify-center text-muted-foreground">
          <span className="text-2xl">↕</span>
        </div>

        {/* Kelvin */}
        <div className={`p-4 rounded-lg border transition-colors ${
          activeInput === 'k' ? 'border-primary bg-primary/10' : 'border-border bg-card'
        }`}>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Kelvin (K)
          </label>
          <input
            type="number"
            value={kelvin}
            onChange={(e) => handleKelvinChange(e.target.value)}
            onFocus={() => setActiveInput('k')}
            className="w-full px-4 py-3 text-2xl font-mono bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Quick presets */}
      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Quick presets:</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Freezing', f: 32 },
            { label: 'Room temp', f: 68 },
            { label: 'Body temp', f: 98.6 },
            { label: 'Boiling', f: 212 },
            { label: 'Absolute zero', k: 0 },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                if (preset.f !== undefined) {
                  handleFahrenheitChange(preset.f.toString());
                } else if (preset.k !== undefined) {
                  handleKelvinChange(preset.k.toString());
                }
              }}
              className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors border border-border"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
