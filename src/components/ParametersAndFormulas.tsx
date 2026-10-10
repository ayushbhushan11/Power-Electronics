import React from 'react';
import { CircuitConfig, CircuitMetrics } from '../types/circuit';
import { Calculator, BookOpen, Check, HelpCircle } from 'lucide-react';

interface ParametersAndFormulasProps {
  config: CircuitConfig;
  metrics: CircuitMetrics;
}

export const ParametersAndFormulas: React.FC<ParametersAndFormulasProps> = ({
  config,
  metrics,
}) => {
  const {
    vPeakPhase,
    vPeakLine,
    vDcAvg,
    vRms,
    iDcAvg,
    iRms,
    powerDc,
    powerAc,
    rippleFactor,
    formFactor,
    efficiencyPercent,
    rippleFrequencyHz,
    formulaVdc,
    formulaVdcLatex,
    formulaExplanation,
    conductionSummary,
  } = metrics;

  return (
    <div className="w-full rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl p-4 flex flex-col gap-4">
      {/* Section Header */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-slate-100 tracking-tight">
            Output Performance Parameters & Formulas
          </h2>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Steady-State Analysis
        </div>
      </div>

      {/* Primary Quantitative Metrics Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {/* Vdc */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col">
          <span className="text-[11px] font-mono text-slate-400">Average V_dc</span>
          <span className="text-lg font-mono font-bold text-sky-400 mt-1 tabular-nums">
            {vDcAvg.toFixed(1)} <span className="text-xs font-normal text-slate-400">V</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500 mt-0.5">DC Component</span>
        </div>

        {/* Vrms */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col">
          <span className="text-[11px] font-mono text-slate-400">RMS V_rms</span>
          <span className="text-lg font-mono font-bold text-slate-200 mt-1 tabular-nums">
            {vRms.toFixed(1)} <span className="text-xs font-normal text-slate-400">V</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500 mt-0.5">Total Effective</span>
        </div>

        {/* Idc */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col">
          <span className="text-[11px] font-mono text-slate-400">Average I_dc</span>
          <span className="text-lg font-mono font-bold text-emerald-400 mt-1 tabular-nums">
            {iDcAvg.toFixed(2)} <span className="text-xs font-normal text-slate-400">A</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500 mt-0.5">Load Current</span>
        </div>

        {/* Irms */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col">
          <span className="text-[11px] font-mono text-slate-400">RMS I_rms</span>
          <span className="text-lg font-mono font-bold text-slate-200 mt-1 tabular-nums">
            {iRms.toFixed(2)} <span className="text-xs font-normal text-slate-400">A</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500 mt-0.5">Thermal Current</span>
        </div>

        {/* Efficiency */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col">
          <span className="text-[11px] font-mono text-slate-400">Efficiency (η)</span>
          <span className="text-lg font-mono font-bold text-amber-400 mt-1 tabular-nums">
            {efficiencyPercent.toFixed(1)} <span className="text-xs font-normal text-slate-400">%</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500 mt-0.5">P_dc / P_ac</span>
        </div>

        {/* Ripple Factor */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col">
          <span className="text-[11px] font-mono text-slate-400">Ripple Factor (RF)</span>
          <span className="text-lg font-mono font-bold text-purple-400 mt-1 tabular-nums">
            {rippleFactor.toFixed(3)}
          </span>
          <span className="text-[10px] font-mono text-slate-500 mt-0.5">√((FF)² - 1)</span>
        </div>

        {/* Form Factor */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col">
          <span className="text-[11px] font-mono text-slate-400">Form Factor (FF)</span>
          <span className="text-lg font-mono font-bold text-slate-200 mt-1 tabular-nums">
            {formFactor.toFixed(3)}
          </span>
          <span className="text-[10px] font-mono text-slate-500 mt-0.5">V_rms / V_dc</span>
        </div>

        {/* Ripple Frequency */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col">
          <span className="text-[11px] font-mono text-slate-400">Ripple Freq</span>
          <span className="text-lg font-mono font-bold text-sky-300 mt-1 tabular-nums">
            {rippleFrequencyHz} <span className="text-xs font-normal text-slate-400">Hz</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500 mt-0.5">Harmonic Base</span>
        </div>
      </div>

      {/* Analytical Mathematical Formulation & Theoretical Insights */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
        {/* Exact Theoretical Formulas */}
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>Theoretical Closed-Form Formulation</span>
          </div>

          <div className="p-3 rounded bg-slate-900 border border-slate-800 font-mono text-xs flex flex-col gap-1.5">
            <div className="text-slate-400">Average Output Voltage Formula:</div>
            <div className="text-sm font-bold text-amber-300 font-mono tracking-wide py-1">
              {formulaVdc}
            </div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              Peak Phase Voltage: <span className="text-slate-200">V_m = √2 · V_rms = {vPeakPhase.toFixed(1)} V</span>
              {config.phase === '3ph' && (
                <span className="ml-3">
                  Peak Line-Line Voltage: <span className="text-slate-200">V_m,LL = √3 · V_m = {vPeakLine.toFixed(1)} V</span>
                </span>
              )}
            </div>
          </div>

          {/* Quick Formula Table */}
          <div className="text-xs text-slate-300 flex flex-col gap-1.5 pt-1">
            <div className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">
              Standard Governing Relations:
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">P_dc: </span>
                <span className="text-emerald-300 font-semibold">{powerDc.toFixed(1)} W</span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">P_ac: </span>
                <span className="text-sky-300 font-semibold">{powerAc.toFixed(1)} W</span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">T_firing delay: </span>
                <span className="text-amber-300 font-semibold">
                  {config.device === 'thyristor'
                    ? `${((config.firingAngleDeg / 360) * (1000 / config.frequencyHz)).toFixed(2)} ms`
                    : '0.00 ms (Diode)'}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Time Constant τ: </span>
                <span className="text-indigo-300 font-semibold">
                  {config.load === 'RL'
                    ? `${((config.inductanceMh * 1e-3 / config.resistanceOhms) * 1000).toFixed(2)} ms`
                    : '0.00 ms (Pure R)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Engineering Physics & Operating Explanations */}
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>Circuit Conduction & Waveform Notes</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {formulaExplanation}
            </p>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs">
              <span className="font-semibold text-slate-300">Conduction Profile: </span>
              <span className="text-sky-300 font-mono text-[11px]">{conductionSummary}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex flex-col gap-1 border-t border-slate-800 pt-2">
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Freewheeling Diode (FWD) Effect:</span>
            </div>
            <p className="text-[11px] text-slate-400">
              In inductive (RL) loads, when the source voltage reverses, the collapsing inductor magnetic field produces a forward voltage across the FWD. This forces the rectifier devices to commutate OFF at the zero-crossing, maintaining v_o ≥ 0, improving power factor, and preventing negative average voltage degradation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
