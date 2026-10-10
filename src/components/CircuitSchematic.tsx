import React from 'react';
import { CircuitConfig, SimulationSample } from '../types/circuit';
import { Zap, PlayCircle, Eye, Activity } from 'lucide-react';

interface CircuitSchematicProps {
  config: CircuitConfig;
  currentSample: SimulationSample;
}

export const CircuitSchematic: React.FC<CircuitSchematicProps> = ({ config, currentSample }) => {
  const { phase, wave, device, load, hasFreewheelingDiode, firingAngleDeg } = config;
  const { conductingDevices, isFreewheelingActive, isGateTriggered, vOutput, iOutput, thetaDeg } = currentSample;

  const isDevActive = (name: string) => conductingDevices.includes(name);
  const isThyristor = device === 'thyristor';
  const devLetter = isThyristor ? 'T' : 'D';

  // SVG dimensions
  const width = 800;
  const height = 480;

  // Render semiconductor device symbol (Diode or Thyristor)
  const renderDevice = (
    name: string,
    x: number,
    y: number,
    orientation: 'right' | 'down' | 'up' | 'left' = 'right',
    labelOffset = { x: 0, y: -24 }
  ) => {
    const active = isDevActive(name);
    let rotation = 0;
    if (orientation === 'down') rotation = 90;
    if (orientation === 'left') rotation = 180;
    if (orientation === 'up') rotation = -90;

    const strokeColor = active ? '#38bdf8' : '#64748b';
    const fillColor = active ? '#0284c7' : '#1e293b';

    return (
      <g key={name} transform={`translate(${x}, ${y})`}>
        {/* Glow halo when conducting */}
        {active && (
          <circle
            cx={0}
            cy={0}
            r={28}
            className="animate-pulse"
            fill="none"
            stroke="#38bdf8"
            strokeWidth={3}
            strokeOpacity={0.5}
            filter="url(#glow-filter)"
          />
        )}

        <g transform={`rotate(${rotation})`}>
          {/* Anode to Cathode main wire */}
          <line x1={-24} y1={0} x2={-12} y2={0} stroke={strokeColor} strokeWidth={3} />
          <line x1={12} y1={0} x2={24} y2={0} stroke={strokeColor} strokeWidth={3} />

          {/* Diode Triangle */}
          <polygon
            points="-12,-14 -12,14 12,0"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={2.5}
          />

          {/* Cathode Bar */}
          <line x1={12} y1={-15} x2={12} y2={15} stroke={strokeColor} strokeWidth={3} />

          {/* Thyristor Gate Terminal if applicable */}
          {isThyristor && name !== 'FWD' && (
            <g>
              <path
                d="M 6,7 L 16,18 L 22,18"
                fill="none"
                stroke={isGateTriggered && active ? '#f59e0b' : '#94a3b8'}
                strokeWidth={2}
              />
              <circle
                cx={22}
                cy={18}
                r={2.5}
                fill={isGateTriggered && active ? '#fbbf24' : '#64748b'}
              />
              {isGateTriggered && (
                <text
                  x={26}
                  y={22}
                  className="text-[10px] fill-amber-400 font-mono font-bold animate-ping"
                >
                  GATE
                </text>
              )}
            </g>
          )}
        </g>

        {/* Device Label & Status */}
        <text
          x={labelOffset.x}
          y={labelOffset.y}
          textAnchor="middle"
          className={`text-xs font-mono font-bold ${
            active ? 'fill-sky-400' : 'fill-slate-400'
          }`}
        >
          {name}
        </text>
        <text
          x={labelOffset.x}
          y={labelOffset.y + 11}
          textAnchor="middle"
          className={`text-[9px] font-mono font-medium ${
            active ? 'fill-emerald-400' : 'fill-slate-500'
          }`}
        >
          {active ? 'ON' : 'OFF'}
        </text>
      </g>
    );
  };

  // Render Load Component (Resistor + optional Inductor)
  const renderLoad = (x: number, y: number, heightPx = 180) => {
    const isCurrentFlowing = iOutput > 0.05;
    const wireColor = isCurrentFlowing ? '#38bdf8' : '#475569';

    return (
      <g transform={`translate(${x}, ${y})`}>
        {/* Load Box outline */}
        <rect
          x={-42}
          y={-12}
          width={84}
          height={heightPx + 24}
          rx={8}
          fill="#0f172a"
          stroke={isCurrentFlowing ? '#0284c7' : '#334155'}
          strokeWidth={1.5}
          strokeDasharray="4 2"
          opacity={0.85}
        />
        <text
          x={0}
          y={-18}
          textAnchor="middle"
          className="text-[11px] font-mono uppercase tracking-wider fill-slate-300 font-semibold"
        >
          LOAD ({load})
        </text>

        {load === 'R' ? (
          // Pure Resistor
          <g>
            <line x1={0} y1={0} x2={0} y2={heightPx * 0.25} stroke={wireColor} strokeWidth={3} />
            {/* Resistor zigzag */}
            <path
              d={`
                M 0,${heightPx * 0.25}
                l 12,${heightPx * 0.06}
                l -24,${heightPx * 0.08}
                l 24,${heightPx * 0.08}
                l -24,${heightPx * 0.08}
                l 24,${heightPx * 0.08}
                l -24,${heightPx * 0.08}
                l 12,${heightPx * 0.06}
                l 0,${heightPx * 0.25}
              `}
              fill="none"
              stroke={wireColor}
              strokeWidth={3}
            />
            <text
              x={22}
              y={heightPx * 0.52}
              className="text-xs font-mono font-bold fill-sky-300"
            >
              R = {config.resistanceOhms}Ω
            </text>
          </g>
        ) : (
          // Series R + L
          <g>
            {/* Top lead */}
            <line x1={0} y1={0} x2={0} y2={heightPx * 0.12} stroke={wireColor} strokeWidth={3} />
            {/* Resistor */}
            <path
              d={`
                M 0,${heightPx * 0.12}
                l 10,${heightPx * 0.05}
                l -20,${heightPx * 0.06}
                l 20,${heightPx * 0.06}
                l -20,${heightPx * 0.06}
                l 10,${heightPx * 0.05}
              `}
              fill="none"
              stroke={wireColor}
              strokeWidth={3}
            />
            <text
              x={20}
              y={heightPx * 0.26}
              className="text-[11px] font-mono font-bold fill-sky-300"
            >
              R = {config.resistanceOhms}Ω
            </text>

            {/* Middle wire */}
            <line
              x1={0}
              y1={heightPx * 0.4}
              x2={0}
              y2={heightPx * 0.48}
              stroke={wireColor}
              strokeWidth={3}
            />

            {/* Inductor coils */}
            <path
              d={`
                M 0,${heightPx * 0.48}
                c 14,-6 14,16 0,16
                c 14,-6 14,16 0,16
                c 14,-6 14,16 0,16
                c 14,-6 14,16 0,16
              `}
              fill="none"
              stroke={wireColor}
              strokeWidth={3}
            />
            <text
              x={20}
              y={heightPx * 0.72}
              className="text-[11px] font-mono font-bold fill-emerald-300"
            >
              L = {config.inductanceMh}mH
            </text>

            {/* Bottom lead */}
            <line
              x1={0}
              y1={heightPx * 0.84}
              x2={0}
              y2={heightPx}
              stroke={wireColor}
              strokeWidth={3}
            />
          </g>
        )}

        {/* Live current readout on load */}
        <g transform={`translate(0, ${heightPx + 38})`}>
          <rect
            x={-52}
            y={-14}
            width={104}
            height={26}
            rx={4}
            fill="#021526"
            stroke={isCurrentFlowing ? '#38bdf8' : '#334155'}
            strokeWidth={1}
          />
          <text
            x={0}
            y={2}
            textAnchor="middle"
            className="text-[11px] font-mono font-bold fill-sky-200 tabular-nums"
          >
            i_o = {iOutput.toFixed(2)} A
          </text>
        </g>
      </g>
    );
  };

  // Render Animated Current Flow Path
  const renderFlowLine = (
    d: string,
    isActive: boolean,
    isReverse = false,
    color = '#38bdf8'
  ) => {
    return (
      <g>
        {/* Base line */}
        <path
          d={d}
          fill="none"
          stroke={isActive ? color : '#334155'}
          strokeWidth={isActive ? 3.5 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-colors duration-150"
        />
        {/* Animated flow pulse dashes */}
        {isActive && (
          <path
            d={d}
            fill="none"
            stroke="#ffffff"
            strokeWidth={2.5}
            strokeDasharray="8 12"
            strokeDashoffset={isReverse ? -40 : 40}
            className="animate-flow-dash pointer-events-none opacity-85"
          />
        )}
      </g>
    );
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl p-4 flex flex-col items-center">
      {/* Schematic Header Info */}
      <div className="w-full flex flex-wrap items-center justify-between pb-3 mb-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Activity className="w-4 h-4 text-sky-400" />
            <span>Interactive Schematic</span>
          </div>
          <span className="text-slate-500">·</span>
          <span className="font-mono text-slate-300">
            {phase.toUpperCase()} {wave === 'half' ? 'Half-Wave' : 'Full-Wave Bridge'} (
            {device === 'diode' ? 'Diode' : 'Thyristor Controlled'})
          </span>
        </div>

        {/* Current State Badges */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Angle ωt:</span>
            <span className="font-bold text-sky-400 tabular-nums">{thetaDeg.toFixed(1)}°</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Conduction:</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                conductingDevices.length > 0
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  : 'bg-rose-950/80 text-rose-300 border border-rose-800'
              }`}
            >
              {conductingDevices.length > 0
                ? `ACTIVE (${conductingDevices.join(', ')})`
                : 'OFF (EXTINGUISHED)'}
            </span>
          </div>

          {hasFreewheelingDiode && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">FWD:</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                  isFreewheelingActive
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800 animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isFreewheelingActive ? 'FREEWHEELING ON' : 'IDLE'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto flex justify-center py-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-[920px] h-auto select-none font-sans"
          style={{ minHeight: '380px' }}
        >
          <defs>
            {/* Filter for glowing active conductors */}
            <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            {/* CSS Animation keyframe in SVG */}
            <style>
              {`
                @keyframes flowAnimation {
                  to {
                    stroke-dashoffset: -40;
                  }
                }
                .animate-flow-dash {
                  animation: flowAnimation 0.8s linear infinite;
                }
              `}
            </style>
          </defs>

          {/* Grid background pattern */}
          <g opacity={0.08}>
            {Array.from({ length: 40 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1={0}
                y1={i * 20}
                x2={width}
                y2={i * 20}
                stroke="#94a3b8"
                strokeWidth={1}
              />
            ))}
            {Array.from({ length: 45 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * 20}
                y1={0}
                x2={i * 20}
                y2={height}
                stroke="#94a3b8"
                strokeWidth={1}
              />
            ))}
          </g>

          {/* ============================================================== */}
          {/* 1-PHASE HALF-WAVE SCHEMATIC */}
          {/* ============================================================== */}
          {phase === '1ph' && wave === 'half' && (
            <g transform="translate(40, 20)">
              {/* AC Voltage Source */}
              <g transform="translate(100, 200)">
                <circle cx={0} cy={0} r={32} fill="#0f172a" stroke="#38bdf8" strokeWidth={2.5} />
                <path
                  d="M -16,0 Q -8,-18 0,0 Q 8,18 16,0"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                />
                <text
                  x={0}
                  y={48}
                  textAnchor="middle"
                  className="text-xs font-mono font-bold fill-slate-300"
                >
                  v_s(t) = V_m sin(ωt)
                </text>
                <text
                  x={0}
                  y={64}
                  textAnchor="middle"
                  className="text-[11px] font-mono fill-sky-400"
                >
                  {currentSample.vSourcePhaseA.toFixed(1)} V
                </text>
              </g>

              {/* Conductor from Source (+) to Diode/Thyristor T1/D1 */}
              {renderFlowLine(
                'M 100,168 L 100,120 L 260,120',
                isDevActive(`${devLetter}1`)
              )}

              {/* T1 / D1 device */}
              {renderDevice(`${devLetter}1`, 280, 120, 'right', { x: 0, y: -26 })}

              {/* Line from device to DC Node */}
              {renderFlowLine(
                'M 304,120 L 460,120',
                isDevActive(`${devLetter}1`)
              )}

              {/* Freewheeling branch if enabled */}
              {hasFreewheelingDiode && (
                <g>
                  {/* FWD connection line */}
                  {renderFlowLine('M 460,120 L 460,160', isFreewheelingActive)}
                  {/* FWD Diode (pointed upward in anti-parallel) */}
                  {renderDevice('FWD', 460, 200, 'up', { x: -34, y: 4 })}
                  {renderFlowLine('M 460,240 L 460,280', isFreewheelingActive)}

                  {/* FWD annotation */}
                  <text
                    x={460}
                    y={105}
                    textAnchor="middle"
                    className="text-[10px] font-mono fill-amber-300 font-semibold"
                  >
                    FWD Branch
                  </text>
                </g>
              )}

              {/* Wire to Load */}
              {renderFlowLine(
                'M 460,120 L 600,120',
                isDevActive(`${devLetter}1`) || isFreewheelingActive
              )}

              {/* Load block */}
              {renderLoad(600, 140, 120)}

              {/* Return wire from Load to Source (-) */}
              {renderFlowLine(
                'M 600,280 L 100,280 L 100,232',
                isDevActive(`${devLetter}1`)
              )}
              {hasFreewheelingDiode &&
                renderFlowLine('M 600,280 L 460,280', isFreewheelingActive)}

              {/* Voltage probe across load */}
              <g transform="translate(680, 200)">
                <line x1={-15} y1={-70} x2={0} y2={-70} stroke="#cbd5e1" strokeWidth={1.5} />
                <line x1={-15} y1={70} x2={0} y2={70} stroke="#cbd5e1" strokeWidth={1.5} />
                <line x1={0} y1={-70} x2={0} y2={70} stroke="#cbd5e1" strokeWidth={1.5} />
                <text
                  x={12}
                  y={4}
                  className="text-xs font-mono font-bold fill-sky-300"
                >
                  v_o = {vOutput.toFixed(1)} V
                </text>
              </g>
            </g>
          )}

          {/* ============================================================== */}
          {/* 1-PHASE FULL-WAVE BRIDGE SCHEMATIC */}
          {/* ============================================================== */}
          {phase === '1ph' && wave === 'full' && (
            <g transform="translate(40, 20)">
              {/* AC Source */}
              <g transform="translate(80, 200)">
                <circle cx={0} cy={0} r={28} fill="#0f172a" stroke="#38bdf8" strokeWidth={2.5} />
                <path
                  d="M -14,0 Q -7,-16 0,0 Q 7,16 14,0"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                />
                <text
                  x={0}
                  y={44}
                  textAnchor="middle"
                  className="text-xs font-mono font-bold fill-slate-300"
                >
                  v_s(t)
                </text>
                <text
                  x={0}
                  y={58}
                  textAnchor="middle"
                  className="text-[11px] font-mono fill-sky-400"
                >
                  {currentSample.vSourcePhaseA.toFixed(1)} V
                </text>
              </g>

              {/* Source Wire Leads into Bridge Midpoints */}
              {renderFlowLine(
                'M 80,172 L 80,140 L 220,140',
                isDevActive(`${devLetter}1`) || isDevActive(`${devLetter}4`)
              )}
              {renderFlowLine(
                'M 80,228 L 80,260 L 320,260',
                isDevActive(`${devLetter}2`) || isDevActive(`${devLetter}3`)
              )}

              {/* 4 Bridge Diodes / Thyristors:
                  Leg 1: (x=220) Top D1/T1 pointing UP to DC+, Bottom D4/T4 pointing UP from DC-
                  Leg 2: (x=320) Top D3/T3 pointing UP to DC+, Bottom D2/T2 pointing UP from DC-
              */}
              {/* D1/T1 Top Left */}
              {renderFlowLine('M 220,140 L 220,110', isDevActive(`${devLetter}1`))}
              {renderDevice(`${devLetter}1`, 220, 95, 'up', { x: -32, y: 4 })}
              {renderFlowLine('M 220,70 L 220,50 L 440,50', isDevActive(`${devLetter}1`))}

              {/* D4/T4 Bottom Left */}
              {renderFlowLine('M 220,350 L 220,330', isDevActive(`${devLetter}4`))}
              {renderDevice(`${devLetter}4`, 220, 310, 'up', { x: -32, y: 4 })}
              {renderFlowLine('M 220,285 L 220,140', isDevActive(`${devLetter}4`))}

              {/* D3/T3 Top Right */}
              {renderFlowLine('M 320,260 L 320,110', isDevActive(`${devLetter}3`))}
              {renderDevice(`${devLetter}3`, 320, 95, 'up', { x: 32, y: 4 })}
              {renderFlowLine('M 320,70 L 320,50 L 440,50', isDevActive(`${devLetter}3`))}

              {/* D2/T2 Bottom Right */}
              {renderFlowLine('M 320,350 L 320,330', isDevActive(`${devLetter}2`))}
              {renderDevice(`${devLetter}2`, 320, 310, 'up', { x: 32, y: 4 })}
              {renderFlowLine('M 320,285 L 320,260', isDevActive(`${devLetter}2`))}

              {/* DC+ Bus Wire */}
              {renderFlowLine(
                'M 220,50 L 580,50',
                isDevActive(`${devLetter}1`) || isDevActive(`${devLetter}3`) || isFreewheelingActive
              )}

              {/* DC- Bus Wire */}
              {renderFlowLine(
                'M 220,350 L 580,350',
                isDevActive(`${devLetter}2`) || isDevActive(`${devLetter}4`) || isFreewheelingActive
              )}

              {/* Freewheeling Diode branch if enabled */}
              {hasFreewheelingDiode && (
                <g>
                  {renderFlowLine('M 440,50 L 440,160', isFreewheelingActive)}
                  {renderDevice('FWD', 440, 200, 'up', { x: -32, y: 4 })}
                  {renderFlowLine('M 440,240 L 440,350', isFreewheelingActive)}
                  <text
                    x={440}
                    y={38}
                    textAnchor="middle"
                    className="text-[10px] font-mono fill-amber-300 font-semibold"
                  >
                    FWD
                  </text>
                </g>
              )}

              {/* Load branch */}
              {renderLoad(580, 80, 230)}

              {/* DC output probe */}
              <g transform="translate(660, 200)">
                <line x1={-15} y1={-110} x2={0} y2={-110} stroke="#cbd5e1" strokeWidth={1.5} />
                <line x1={-15} y1={110} x2={0} y2={110} stroke="#cbd5e1" strokeWidth={1.5} />
                <line x1={0} y1={-110} x2={0} y2={110} stroke="#cbd5e1" strokeWidth={1.5} />
                <text
                  x={12}
                  y={4}
                  className="text-xs font-mono font-bold fill-sky-300"
                >
                  v_o = {vOutput.toFixed(1)} V
                </text>
              </g>
            </g>
          )}

          {/* ============================================================== */}
          {/* 3-PHASE HALF-WAVE SCHEMATIC (3-Pulse) */}
          {/* ============================================================== */}
          {phase === '3ph' && wave === 'half' && (
            <g transform="translate(40, 20)">
              {/* 3-Phase Sources (Star connected) */}
              <g transform="translate(80, 70)">
                <circle cx={0} cy={0} r={22} fill="#0f172a" stroke="#ef4444" strokeWidth={2} />
                <text x={0} y={4} textAnchor="middle" className="text-[11px] font-mono font-bold fill-red-400">
                  Va
                </text>
                <text x={-40} y={4} textAnchor="end" className="text-[10px] font-mono fill-red-300">
                  {currentSample.vSourcePhaseA.toFixed(0)}V
                </text>
              </g>
              <g transform="translate(80, 150)">
                <circle cx={0} cy={0} r={22} fill="#0f172a" stroke="#eab308" strokeWidth={2} />
                <text x={0} y={4} textAnchor="middle" className="text-[11px] font-mono font-bold fill-yellow-400">
                  Vb
                </text>
                <text x={-40} y={4} textAnchor="end" className="text-[10px] font-mono fill-yellow-300">
                  {currentSample.vSourcePhaseB.toFixed(0)}V
                </text>
              </g>
              <g transform="translate(80, 230)">
                <circle cx={0} cy={0} r={22} fill="#0f172a" stroke="#3b82f6" strokeWidth={2} />
                <text x={0} y={4} textAnchor="middle" className="text-[11px] font-mono font-bold fill-blue-400">
                  Vc
                </text>
                <text x={-40} y={4} textAnchor="end" className="text-[10px] font-mono fill-blue-300">
                  {currentSample.vSourcePhaseC.toFixed(0)}V
                </text>
              </g>

              {/* Star neutral point */}
              <path d="M 58,70 L 40,70 L 40,230 L 58,230" fill="none" stroke="#94a3b8" strokeWidth={2} />
              <line x1={40} y1={150} x2={58} y2={150} stroke="#94a3b8" strokeWidth={2} />
              <circle cx={40} cy={150} r={3} fill="#94a3b8" />
              <text x={28} y={154} textAnchor="end" className="text-[11px] font-mono font-bold fill-slate-400">
                N
              </text>

              {/* Lines from phases to rectifiers */}
              {/* Phase A -> T1/D1 */}
              {renderFlowLine('M 102,70 L 250,70', isDevActive(`${devLetter}1`), false, '#ef4444')}
              {renderDevice(`${devLetter}1`, 270, 70, 'right', { x: 0, y: -24 })}
              {renderFlowLine('M 294,70 L 420,70', isDevActive(`${devLetter}1`))}

              {/* Phase B -> T2/D2 */}
              {renderFlowLine('M 102,150 L 250,150', isDevActive(`${devLetter}2`), false, '#eab308')}
              {renderDevice(`${devLetter}2`, 270, 150, 'right', { x: 0, y: -24 })}
              {renderFlowLine('M 294,150 L 420,150', isDevActive(`${devLetter}2`))}

              {/* Phase C -> T3/D3 */}
              {renderFlowLine('M 102,230 L 250,230', isDevActive(`${devLetter}3`), false, '#3b82f6')}
              {renderDevice(`${devLetter}3`, 270, 230, 'right', { x: 0, y: -24 })}
              {renderFlowLine('M 294,230 L 420,230', isDevActive(`${devLetter}3`))}

              {/* Common Cathode bus wire */}
              {renderFlowLine(
                'M 420,70 L 420,230 L 420,50 L 600,50',
                conductingDevices.length > 0 || isFreewheelingActive
              )}

              {/* FWD Branch if present */}
              {hasFreewheelingDiode && (
                <g>
                  {renderFlowLine('M 490,50 L 490,160', isFreewheelingActive)}
                  {renderDevice('FWD', 490, 200, 'up', { x: -32, y: 4 })}
                  {renderFlowLine('M 490,240 L 490,320', isFreewheelingActive)}
                </g>
              )}

              {/* Load branch */}
              {renderLoad(600, 80, 200)}

              {/* Neutral return wire from Load back to N */}
              {renderFlowLine(
                'M 600,320 L 40,320 L 40,150',
                conductingDevices.length > 0
              )}
            </g>
          )}

          {/* ============================================================== */}
          {/* 3-PHASE FULL-WAVE BRIDGE SCHEMATIC (6-Pulse) */}
          {/* ============================================================== */}
          {phase === '3ph' && wave === 'full' && (
            <g transform="translate(30, 15)">
              {/* 3-Phase Input Terminals */}
              <g transform="translate(60, 90)">
                <rect x={-20} y={-14} width={40} height={28} rx={6} fill="#0f172a" stroke="#ef4444" strokeWidth={2} />
                <text x={0} y={4} textAnchor="middle" className="text-xs font-mono font-bold fill-red-400">
                  L1 (A)
                </text>
              </g>
              <g transform="translate(60, 180)">
                <rect x={-20} y={-14} width={40} height={28} rx={6} fill="#0f172a" stroke="#eab308" strokeWidth={2} />
                <text x={0} y={4} textAnchor="middle" className="text-xs font-mono font-bold fill-yellow-400">
                  L2 (B)
                </text>
              </g>
              <g transform="translate(60, 270)">
                <rect x={-20} y={-14} width={40} height={28} rx={6} fill="#0f172a" stroke="#3b82f6" strokeWidth={2} />
                <text x={0} y={4} textAnchor="middle" className="text-xs font-mono font-bold fill-blue-400">
                  L3 (C)
                </text>
              </g>

              {/* Feed lines into the 3 legs:
                  Leg 1 (x=190): Top T1/D1, Bottom T4/D4
                  Leg 2 (x=290): Top T3/D3, Bottom T6/D6
                  Leg 3 (x=390): Top T5/D5, Bottom T2/D2
              */}
              {/* Line A feed */}
              {renderFlowLine('M 80,90 L 190,90 L 190,180', isDevActive(`${devLetter}1`) || isDevActive(`${devLetter}4`), false, '#ef4444')}
              {/* Line B feed */}
              {renderFlowLine('M 80,180 L 290,180', isDevActive(`${devLetter}3`) || isDevActive(`${devLetter}6`), false, '#eab308')}
              {/* Line C feed */}
              {renderFlowLine('M 80,270 L 390,270 L 390,180', isDevActive(`${devLetter}5`) || isDevActive(`${devLetter}2`), false, '#3b82f6')}

              {/* Leg 1: T1 & T4 */}
              {renderFlowLine('M 190,180 L 190,130', isDevActive(`${devLetter}1`))}
              {renderDevice(`${devLetter}1`, 190, 105, 'up', { x: -30, y: 4 })}
              {renderFlowLine('M 190,80 L 190,45 L 480,45', isDevActive(`${devLetter}1`))}

              {renderFlowLine('M 190,320 L 190,290', isDevActive(`${devLetter}4`))}
              {renderDevice(`${devLetter}4`, 190, 265, 'up', { x: -30, y: 4 })}
              {renderFlowLine('M 190,240 L 190,180', isDevActive(`${devLetter}4`))}

              {/* Leg 2: T3 & T6 */}
              {renderFlowLine('M 290,180 L 290,130', isDevActive(`${devLetter}3`))}
              {renderDevice(`${devLetter}3`, 290, 105, 'up', { x: -30, y: 4 })}
              {renderFlowLine('M 290,80 L 290,45 L 480,45', isDevActive(`${devLetter}3`))}

              {renderFlowLine('M 290,320 L 290,290', isDevActive(`${devLetter}6`))}
              {renderDevice(`${devLetter}6`, 290, 265, 'up', { x: -30, y: 4 })}
              {renderFlowLine('M 290,240 L 290,180', isDevActive(`${devLetter}6`))}

              {/* Leg 3: T5 & T2 */}
              {renderFlowLine('M 390,180 L 390,130', isDevActive(`${devLetter}5`))}
              {renderDevice(`${devLetter}5`, 390, 105, 'up', { x: 30, y: 4 })}
              {renderFlowLine('M 390,80 L 390,45 L 480,45', isDevActive(`${devLetter}5`))}

              {renderFlowLine('M 390,320 L 390,290', isDevActive(`${devLetter}2`))}
              {renderDevice(`${devLetter}2`, 390, 265, 'up', { x: 30, y: 4 })}
              {renderFlowLine('M 390,240 L 390,180', isDevActive(`${devLetter}2`))}

              {/* DC+ Bus Line */}
              {renderFlowLine('M 190,45 L 610,45', conductingDevices.length > 0 || isFreewheelingActive)}
              {/* DC- Bus Line */}
              {renderFlowLine('M 190,320 L 610,320', conductingDevices.length > 0 || isFreewheelingActive)}

              {/* Freewheeling Diode Branch */}
              {hasFreewheelingDiode && (
                <g>
                  {renderFlowLine('M 480,45 L 480,150', isFreewheelingActive)}
                  {renderDevice('FWD', 480, 185, 'up', { x: -30, y: 4 })}
                  {renderFlowLine('M 480,220 L 480,320', isFreewheelingActive)}
                  <text
                    x={480}
                    y={35}
                    textAnchor="middle"
                    className="text-[10px] font-mono fill-amber-300 font-semibold"
                  >
                    FWD
                  </text>
                </g>
              )}

              {/* Load */}
              {renderLoad(610, 70, 220)}

              {/* DC probe */}
              <g transform="translate(688, 180)">
                <line x1={-15} y1={-100} x2={0} y2={-100} stroke="#cbd5e1" strokeWidth={1.5} />
                <line x1={-15} y1={110} x2={0} y2={110} stroke="#cbd5e1" strokeWidth={1.5} />
                <line x1={0} y1={-100} x2={0} y2={110} stroke="#cbd5e1" strokeWidth={1.5} />
                <text
                  x={12}
                  y={4}
                  className="text-xs font-mono font-bold fill-sky-300"
                >
                  v_o = {vOutput.toFixed(1)} V
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* Schematic Legend & Interactive Callouts */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
          <span className="text-slate-300 font-medium">Conducting Wire</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-slate-700 border border-slate-600" />
          <span className="text-slate-400">Off / Reverse Biased</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="text-slate-300">Freewheeling Path</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-slate-300">Gate Trigger (α = {firingAngleDeg}°)</span>
        </div>
      </div>
    </div>
  );
};
