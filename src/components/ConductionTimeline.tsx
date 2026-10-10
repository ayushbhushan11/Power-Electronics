import React from 'react';
import { CircuitConfig, ConductionInterval, SimulationSample } from '../types/circuit';
import { Power, CheckCircle2, XCircle, ArrowRight, Zap, RefreshCw } from 'lucide-react';

interface ConductionTimelineProps {
  config: CircuitConfig;
  intervals: ConductionInterval[];
  currentSample: SimulationSample;
}

export const ConductionTimeline: React.FC<ConductionTimelineProps> = ({
  config,
  intervals,
  currentSample,
}) => {
  const { thetaDeg, isCircuitOn, conductingDevices, isFreewheelingActive, vOutput, iOutput } = currentSample;

  // Find currently active interval
  const activeInterval = intervals.find(
    (inv) => thetaDeg >= inv.startDeg && thetaDeg < inv.endDeg
  ) || intervals[0];

  return (
    <div className="w-full rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl p-4 flex flex-col gap-3">
      {/* Circuit Conduction State Banner */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isCircuitOn
                ? 'bg-emerald-950 border border-emerald-600/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-rose-950 border border-rose-600/50 text-rose-400'
            }`}
          >
            <Power className="w-5 h-5 stroke-[2.5]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-mono text-slate-400 font-semibold">
                Current Circuit State:
              </span>
              <span
                className={`text-sm font-mono font-bold px-2 py-0.5 rounded ${
                  isCircuitOn
                    ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/60'
                    : 'bg-rose-900/50 text-rose-300 border border-rose-700/60'
                }`}
              >
                {isCircuitOn ? 'CIRCUIT ON (CONDUCTING)' : 'CIRCUIT OFF (BLOCKING / IDLE)'}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-1">
              {isCircuitOn ? (
                <>
                  {isFreewheelingActive ? (
                    <span className="text-amber-300">
                      Freewheeling Diode (FWD) is conducting stored inductive energy.
                    </span>
                  ) : conductingDevices.length > 0 ? (
                    <span>
                      Active devices <strong className="text-sky-300">{conductingDevices.join(' & ')}</strong> are
                      delivering energy to the load ({config.load} Load).
                    </span>
                  ) : (
                    <span>Load current discharging through inductive path.</span>
                  )}
                </>
              ) : (
                <span className="text-slate-400">
                  {config.device === 'thyristor'
                    ? `No conduction at ωt = ${thetaDeg.toFixed(0)}°. Awaiting gate trigger pulse at firing angle α = ${config.firingAngleDeg}°.`
                    : `No conduction. AC voltage is reverse-biasing the diode in this half cycle.`}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Operating metrics pill */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
            <span className="text-slate-400">Instantaneous v_o: </span>
            <span className="text-sky-300 font-bold tabular-nums">{vOutput.toFixed(1)} V</span>
          </div>
          <div className="bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
            <span className="text-slate-400">Instantaneous i_o: </span>
            <span className="text-emerald-300 font-bold tabular-nums">{iOutput.toFixed(2)} A</span>
          </div>
        </div>
      </div>

      {/* Conduction Intervals Across One Cycle (0° to 360°) */}
      <div className="w-full flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300">
            Device Conduction Breakdown Across AC Cycle (0° – 360°)
          </span>
          <span className="font-mono text-[11px]">
            Instantaneous Pointer: <strong className="text-sky-400">{thetaDeg.toFixed(1)}°</strong>
          </span>
        </div>

        {/* Timeline Visual Bar */}
        <div className="relative w-full h-11 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex">
          {intervals.map((inv, idx) => {
            const widthPct = Math.max(0, ((inv.endDeg - inv.startDeg) / 360) * 100);
            if (widthPct <= 0) return null;

            const isCurrentActive = thetaDeg >= inv.startDeg && thetaDeg < inv.endDeg;
            const isFwd = inv.isFreewheeling;
            const isOff = inv.devices.length === 0;

            let bgColor = 'bg-sky-950/80 border-sky-800/80 text-sky-200';
            if (isFwd) bgColor = 'bg-amber-950/80 border-amber-800/80 text-amber-200';
            if (isOff) bgColor = 'bg-slate-900 border-slate-800 text-slate-500';

            return (
              <div
                key={`interval-${idx}`}
                style={{ width: `${widthPct}%` }}
                className={`relative h-full border-r border-slate-800 px-2 py-1 flex flex-col justify-center transition-all ${bgColor} ${
                  isCurrentActive ? 'ring-2 ring-sky-400 z-10 brightness-125' : 'opacity-80'
                }`}
              >
                <div className="text-[11px] font-mono font-bold truncate flex items-center gap-1">
                  {inv.devices.length > 0 ? inv.devices.join('+') : 'OFF'}
                  {isCurrentActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  )}
                </div>
                <div className="text-[9px] font-mono text-slate-400 truncate">
                  {inv.startDeg}°–{inv.endDeg}°
                </div>
              </div>
            );
          })}

          {/* Synchronized Indicator Line at thetaDeg */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] z-20 pointer-events-none"
            style={{ left: `${(thetaDeg / 360) * 100}%` }}
          >
            <div className="w-2.5 h-2.5 bg-rose-500 rotate-45 -ml-1 -top-1 absolute" />
          </div>
        </div>

        {/* 0, 90, 180, 270, 360 Tick Labels */}
        <div className="w-full flex justify-between text-[10px] font-mono text-slate-500 px-1">
          <span>0°</span>
          <span>90°</span>
          <span>180° (π)</span>
          <span>270°</span>
          <span>360° (2π)</span>
        </div>
      </div>

      {/* Summary Chips for All Devices */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1 text-xs font-mono">
        {intervals.map((inv, idx) => (
          <div
            key={`detail-${idx}`}
            className={`p-2 rounded-lg border flex items-center justify-between ${
              thetaDeg >= inv.startDeg && thetaDeg < inv.endDeg
                ? 'bg-sky-950/60 border-sky-600/80 text-sky-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  inv.devices.length > 0
                    ? inv.isFreewheeling
                      ? 'bg-amber-400'
                      : 'bg-sky-400'
                    : 'bg-slate-600'
                }`}
              />
              <span className="font-semibold text-slate-200">{inv.label}</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {inv.startDeg}° to {inv.endDeg}° ({inv.endDeg - inv.startDeg}°)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
