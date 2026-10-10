import React from 'react';
import { CircuitConfig, DeviceType, LoadType, PhaseType, WaveType } from '../types/circuit';
import { Sliders, Zap, Shield, Sparkles, Layers, RotateCw } from 'lucide-react';

interface ControlDeckProps {
  config: CircuitConfig;
  onChangeConfig: (newConfig: CircuitConfig) => void;
  onResetDefaults: () => void;
}

export const ControlDeck: React.FC<ControlDeckProps> = ({
  config,
  onChangeConfig,
  onResetDefaults,
}) => {
  const updateConfig = (patch: Partial<CircuitConfig>) => {
    onChangeConfig({ ...config, ...patch });
  };

  const isThyristor = config.device === 'thyristor';
  const isRl = config.load === 'RL';

  return (
    <div className="w-full rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl p-4 flex flex-col gap-4">
      {/* Deck Header */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-bold text-slate-100 tracking-tight">
            Topology & Parameter Controls
          </h2>
        </div>
        <button
          onClick={onResetDefaults}
          className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <RotateCw className="w-3 h-3" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Primary Configuration Segmented Buttons Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Phase Toggle (1-Phase / 3-Phase) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Supply Phases
          </label>
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => updateConfig({ phase: '1ph' })}
              className={`py-1.5 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                config.phase === '1ph'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              1-Phase (1φ)
            </button>
            <button
              onClick={() => updateConfig({ phase: '3ph' })}
              className={`py-1.5 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                config.phase === '3ph'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              3-Phase (3φ)
            </button>
          </div>
        </div>

        {/* Wave Toggle (Half Wave / Full Wave) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Wave Rectification
          </label>
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => updateConfig({ wave: 'half' })}
              className={`py-1.5 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                config.wave === 'half'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Half-Wave
            </button>
            <button
              onClick={() => updateConfig({ wave: 'full' })}
              className={`py-1.5 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                config.wave === 'full'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Full-Wave (Bridge)
            </button>
          </div>
        </div>

        {/* Device Toggle (Diode / Thyristor) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Switching Device
          </label>
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => updateConfig({ device: 'diode' })}
              className={`py-1.5 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                config.device === 'diode'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Diode (Uncontrolled)
            </button>
            <button
              onClick={() => updateConfig({ device: 'thyristor' })}
              className={`py-1.5 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                config.device === 'thyristor'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Thyristor (SCR Controlled)
            </button>
          </div>
        </div>

        {/* Load Toggle (R / RL) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Load Characteristic
          </label>
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => updateConfig({ load: 'R' })}
              className={`py-1.5 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                config.load === 'R'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Resistive (R)
            </button>
            <button
              onClick={() => updateConfig({ load: 'RL' })}
              className={`py-1.5 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                config.load === 'RL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Inductive (R + L)
            </button>
          </div>
        </div>
      </div>

      {/* Freewheeling Diode Toggle Bar */}
      <div className="w-full flex flex-wrap items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-amber-950/60 text-amber-400 border border-amber-800/50">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">
              Freewheeling Diode (FWD / Flyback)
            </div>
            <div className="text-[11px] text-slate-400">
              Clamps negative inductive voltage spikes to zero and dissipates stored inductor energy smoothly.
            </div>
          </div>
        </div>

        <button
          onClick={() => updateConfig({ hasFreewheelingDiode: !config.hasFreewheelingDiode })}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
            config.hasFreewheelingDiode
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <span>FWD:</span>
          <span>{config.hasFreewheelingDiode ? 'ENABLED (ON)' : 'DISABLED (OFF)'}</span>
        </button>
      </div>

      {/* Parameter Sliders Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {/* Firing Angle Slider (Interactive for Thyristor) */}
        <div
          className={`p-3 rounded-lg border transition-opacity ${
            isThyristor
              ? 'bg-slate-950 border-amber-800/40 opacity-100'
              : 'bg-slate-950/40 border-slate-800 opacity-50 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Firing Angle (α)
            </span>
            <span className="text-xs font-mono font-bold text-amber-300 tabular-nums">
              {config.firingAngleDeg}°
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={150}
            step={5}
            value={config.firingAngleDeg}
            onChange={(e) => updateConfig({ firingAngleDeg: Number(e.target.value) })}
            disabled={!isThyristor}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />

          {/* Quick Angle Presets */}
          <div className="flex items-center justify-between mt-2 pt-1">
            {[0, 30, 45, 60, 90, 120].map((deg) => (
              <button
                key={deg}
                disabled={!isThyristor}
                onClick={() => updateConfig({ firingAngleDeg: deg })}
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  config.firingAngleDeg === deg && isThyristor
                    ? 'bg-amber-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {deg}°
              </button>
            ))}
          </div>
        </div>

        {/* Load Resistance Slider */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-200">
              Load Resistance (R)
            </span>
            <span className="text-xs font-mono font-bold text-sky-300 tabular-nums">
              {config.resistanceOhms} Ω
            </span>
          </div>

          <input
            type="range"
            min={2}
            max={50}
            step={1}
            value={config.resistanceOhms}
            onChange={(e) => updateConfig({ resistanceOhms: Number(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
            <span>2 Ω</span>
            <span>25 Ω</span>
            <span>50 Ω</span>
          </div>
        </div>

        {/* Load Inductance Slider (Interactive for RL) */}
        <div
          className={`p-3 rounded-lg border transition-opacity ${
            isRl
              ? 'bg-slate-950 border-indigo-800/40 opacity-100'
              : 'bg-slate-950/40 border-slate-800 opacity-50 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-200">
              Load Inductance (L)
            </span>
            <span className="text-xs font-mono font-bold text-indigo-300 tabular-nums">
              {config.inductanceMh} mH
            </span>
          </div>

          <input
            type="range"
            min={5}
            max={150}
            step={5}
            value={config.inductanceMh}
            onChange={(e) => updateConfig({ inductanceMh: Number(e.target.value) })}
            disabled={!isRl}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
            <span>5 mH</span>
            <span>75 mH</span>
            <span>150 mH</span>
          </div>
        </div>

        {/* AC Supply Voltage */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-200">
              AC Supply Voltage (V_rms)
            </span>
            <span className="text-xs font-mono font-bold text-sky-300 tabular-nums">
              {config.supplyVoltageVrms} V
            </span>
          </div>

          <input
            type="range"
            min={50}
            max={400}
            step={10}
            value={config.supplyVoltageVrms}
            onChange={(e) => updateConfig({ supplyVoltageVrms: Number(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
            <span>50 V</span>
            <span>230 V (Mains)</span>
            <span>400 V</span>
          </div>
        </div>

        {/* AC Supply Frequency */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-200">
              Grid Frequency (f)
            </span>
            <span className="text-xs font-mono font-bold text-sky-300">
              {config.frequencyHz} Hz
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => updateConfig({ frequencyHz: 50 })}
              className={`py-1.5 text-xs font-mono font-semibold rounded cursor-pointer transition-colors ${
                config.frequencyHz === 50
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              50 Hz (EU/Asia)
            </button>
            <button
              onClick={() => updateConfig({ frequencyHz: 60 })}
              className={`py-1.5 text-xs font-mono font-semibold rounded cursor-pointer transition-colors ${
                config.frequencyHz === 60
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              60 Hz (US)
            </button>
          </div>
        </div>

        {/* Quick Engineering Presets */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Lab Presets</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                onChangeConfig({
                  ...config,
                  phase: '1ph',
                  wave: 'full',
                  device: 'diode',
                  load: 'R',
                  resistanceOhms: 10,
                })
              }
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[11px] font-mono text-slate-300 rounded cursor-pointer truncate text-left"
            >
              1φ Full Diode R
            </button>
            <button
              onClick={() =>
                onChangeConfig({
                  ...config,
                  phase: '1ph',
                  wave: 'full',
                  device: 'thyristor',
                  load: 'RL',
                  hasFreewheelingDiode: true,
                  firingAngleDeg: 45,
                  resistanceOhms: 10,
                  inductanceMh: 30,
                })
              }
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[11px] font-mono text-slate-300 rounded cursor-pointer truncate text-left"
            >
              1φ SCR RL + FWD
            </button>
            <button
              onClick={() =>
                onChangeConfig({
                  ...config,
                  phase: '3ph',
                  wave: 'full',
                  device: 'diode',
                  load: 'RL',
                  resistanceOhms: 15,
                  inductanceMh: 20,
                })
              }
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[11px] font-mono text-slate-300 rounded cursor-pointer truncate text-left"
            >
              3φ 6-Pulse Diode
            </button>
            <button
              onClick={() =>
                onChangeConfig({
                  ...config,
                  phase: '3ph',
                  wave: 'full',
                  device: 'thyristor',
                  load: 'RL',
                  firingAngleDeg: 60,
                  resistanceOhms: 15,
                  inductanceMh: 40,
                })
              }
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[11px] font-mono text-slate-300 rounded cursor-pointer truncate text-left"
            >
              3φ SCR (α = 60°)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
