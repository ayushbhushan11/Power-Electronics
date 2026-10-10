import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CircuitConfig, SimulationSample } from './types/circuit';
import { simulateRectifier } from './physics/rectifierSimulation';
import { CircuitSchematic } from './components/CircuitSchematic';
import { WaveformOscilloscope } from './components/WaveformOscilloscope';
import { ConductionTimeline } from './components/ConductionTimeline';
import { ParametersAndFormulas } from './components/ParametersAndFormulas';
import { ControlDeck } from './components/ControlDeck';
import {
  Activity,
  Cpu,
  Layers,
  Sparkles,
  BookOpen,
  Info,
  Maximize2,
  RefreshCw,
  Zap,
} from 'lucide-react';

const DEFAULT_CONFIG: CircuitConfig = {
  phase: '1ph',
  wave: 'full',
  device: 'diode',
  load: 'RL',
  hasFreewheelingDiode: true,
  firingAngleDeg: 30,
  supplyVoltageVrms: 230,
  frequencyHz: 50,
  resistanceOhms: 10,
  inductanceMh: 25,
};

export default function App() {
  const [config, setConfig] = useState<CircuitConfig>(DEFAULT_CONFIG);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'schematic' | 'waveforms' | 'both'>('both');

  // Compute simulation data when configuration changes
  const { samples, intervals, metrics } = useMemo(() => {
    return simulateRectifier(config);
  }, [config]);

  // Keep currentIndex bounded if samples size changes
  useEffect(() => {
    if (currentIndex >= samples.length) {
      setCurrentIndex(0);
    }
  }, [samples.length, currentIndex]);

  // Animation frame loop for continuous simulation playback
  const lastTimeRef = useRef<number>(performance.now());
  const currentIndexRef = useRef<number>(currentIndex);
  currentIndexRef.current = currentIndex;

  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Rate: normal speed = 1 cycle per 20ms * (1 / simSpeed)
      // Samples array has 2 full cycles (720 steps per cycle * 2 = 1440 steps)
      // At 50 Hz, 1 full cycle is 20ms.
      // So at 1x speed, 1440 steps = 40ms real time.
      // To make it visually observable, advance at 360 degrees per second * simSpeed:
      const stepsPerSecond = (samples.length / 2) * simSpeed * 0.8;
      const stepDelta = (stepsPerSecond * dt) / 1000;

      if (stepDelta >= 1) {
        const nextIdx = Math.round(currentIndexRef.current + stepDelta) % samples.length;
        setCurrentIndex(nextIdx);
        lastTimeRef.current = now;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, simSpeed, samples.length]);

  const currentSample: SimulationSample = samples[currentIndex] || samples[0];

  const handleResetDefaults = () => {
    setConfig(DEFAULT_CONFIG);
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center shadow-lg shadow-sky-600/30">
            <Zap className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif]">
            PowerRectify
          </span>
        </div>

        {/* Zone 2: 4-6 text navigation anchors */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <a href="#schematic-section" className="hover:text-slate-200 transition-colors">
            Circuit Schematic
          </a>
          <a href="#oscilloscope-section" className="hover:text-slate-200 transition-colors">
            Oscilloscope Graphs
          </a>
          <a href="#conduction-section" className="hover:text-slate-200 transition-colors">
            Conduction Timeline
          </a>
          <a href="#parameters-section" className="hover:text-slate-200 transition-colors">
            Analytical Formulas
          </a>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm'
            }`}
          >
            {isPlaying ? 'Pause Sim' : 'Start Sim'}
          </button>
          <button
            onClick={handleResetDefaults}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
            title="Reset All Parameters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Sub-Header / Briefing */}
      <section className="px-6 py-4 bg-slate-900/40 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Interactive Power Electronics Laboratory</span>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-sky-950 text-sky-400 border border-sky-800">
                {config.phase.toUpperCase()} · {config.wave.toUpperCase()} · {config.device.toUpperCase()}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
              Simulate 1-phase and 3-phase diode and thyristor rectifiers in real time. Inspect current loop directions, semiconductor conduction intervals, freewheeling diode dynamics, and theoretical mathematical formulas.
            </p>
          </div>

          {/* Quick View Mode Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('both')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                activeTab === 'both' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setActiveTab('schematic')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                activeTab === 'schematic' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Schematic Only
            </button>
            <button
              onClick={() => setActiveTab('waveforms')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                activeTab === 'waveforms' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Waveforms Only
            </button>
          </div>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Interactive Controls Deck */}
        <section id="controls-section">
          <ControlDeck
            config={config}
            onChangeConfig={setConfig}
            onResetDefaults={handleResetDefaults}
          />
        </section>

        {/* Visual Laboratory Canvas (Schematic & Waveforms) */}
        <section className="w-full flex flex-col gap-6">
          {activeTab === 'both' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              <div id="schematic-section" className="w-full">
                <CircuitSchematic config={config} currentSample={currentSample} />
              </div>
              <div id="oscilloscope-section" className="w-full">
                <WaveformOscilloscope
                  config={config}
                  samples={samples}
                  metrics={metrics}
                  currentIndex={currentIndex}
                  onIndexChange={setCurrentIndex}
                  isPlaying={isPlaying}
                  onTogglePlay={() => setIsPlaying(!isPlaying)}
                  simSpeed={simSpeed}
                  onChangeSpeed={setSimSpeed}
                />
              </div>
            </div>
          )}

          {activeTab === 'schematic' && (
            <div id="schematic-section" className="w-full">
              <CircuitSchematic config={config} currentSample={currentSample} />
            </div>
          )}

          {activeTab === 'waveforms' && (
            <div id="oscilloscope-section" className="w-full">
              <WaveformOscilloscope
                config={config}
                samples={samples}
                metrics={metrics}
                currentIndex={currentIndex}
                onIndexChange={setCurrentIndex}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                simSpeed={simSpeed}
                onChangeSpeed={setSimSpeed}
              />
            </div>
          )}
        </section>

        {/* Conduction Timeline: Below the Graphs */}
        <section id="conduction-section" className="w-full">
          <ConductionTimeline
            config={config}
            intervals={intervals}
            currentSample={currentSample}
          />
        </section>

        {/* Parameters, Mathematical Formulas & Operational Principles */}
        <section id="parameters-section" className="w-full">
          <ParametersAndFormulas config={config} metrics={metrics} />
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 px-6 py-4 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4">
        <div>PowerRectify · Power Electronics Laboratory Simulator</div>
        <div className="flex items-center gap-4">
          <span>IEC 60146 / IEEE 519 Standard Reference Models</span>
          <span aria-hidden="true">·</span>
          <span>1-Phase & 3-Phase Controlled Rectification</span>
        </div>
      </footer>
    </div>
  );
}
