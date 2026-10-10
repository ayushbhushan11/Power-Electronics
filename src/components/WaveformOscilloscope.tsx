import React, { useRef, useState } from 'react';
import { CircuitConfig, CircuitMetrics, SimulationSample } from '../types/circuit';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Sliders, Eye } from 'lucide-react';

interface WaveformOscilloscopeProps {
  config: CircuitConfig;
  samples: SimulationSample[];
  metrics: CircuitMetrics;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  simSpeed: number;
  onChangeSpeed: (speed: number) => void;
}

export const WaveformOscilloscope: React.FC<WaveformOscilloscopeProps> = ({
  config,
  samples,
  metrics,
  currentIndex,
  onIndexChange,
  isPlaying,
  onTogglePlay,
  simSpeed,
  onChangeSpeed,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeChannel, setActiveChannel] = useState<'all' | 'vo' | 'io' | 'vin'>('all');
  const [showAverageLines, setShowAverageLines] = useState<boolean>(true);

  if (!samples || samples.length === 0) return null;

  const currentSample = samples[currentIndex] || samples[0];
  const maxIdx = samples.length - 1;

  // SVG graphing geometry
  const width = 860;
  const channelHeight = 110;
  const paddingLeft = 64;
  const paddingRight = 24;
  const graphWidth = width - paddingLeft - paddingRight;

  // Max scale bounds
  const vMax = Math.max(metrics.vPeakPhase * 1.3, 100);
  const iMax = Math.max(metrics.iRms * 2.2, (vMax / Math.max(config.resistanceOhms, 1)) * 1.1, 5);

  // Time conversion
  const mapThetaToX = (thetaDeg: number) => {
    // 2 full cycles = 720 degrees
    return paddingLeft + (thetaDeg / 720) * graphWidth;
  };

  const mapSampleIdxToX = (idx: number) => {
    return paddingLeft + (idx / maxIdx) * graphWidth;
  };

  const currentCursorX = mapSampleIdxToX(currentIndex);

  // Path generators for SVG
  const generatePath = (getY: (s: SimulationSample) => number, height: number, yCenter: number, scaleY: number) => {
    return samples
      .map((s, i) => {
        const x = mapSampleIdxToX(i);
        const y = yCenter - getY(s) * scaleY;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  // Handle drag / click scrubbing on the canvas
  const handleGraphPointer = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const normalizedX = (clickX / rect.width) * width;
    if (normalizedX >= paddingLeft && normalizedX <= width - paddingRight) {
      const ratio = (normalizedX - paddingLeft) / graphWidth;
      const targetIdx = Math.round(ratio * maxIdx);
      onIndexChange(Math.min(maxIdx, Math.max(0, targetIdx)));
    }
  };

  // Stepping helpers
  const handleStep = (deltaDeg: number) => {
    const stepsPerDeg = samples.length / 720;
    const deltaSteps = Math.round(deltaDeg * stepsPerDeg);
    let nextIdx = (currentIndex + deltaSteps) % samples.length;
    if (nextIdx < 0) nextIdx += samples.length;
    onIndexChange(nextIdx);
  };

  return (
    <div className="w-full rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl p-4 flex flex-col">
      {/* Scope Toolbar */}
      <div className="w-full flex flex-wrap items-center justify-between pb-3 mb-2 border-b border-slate-800 gap-3 text-xs">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm'
            }`}
            title={isPlaying ? 'Pause Simulation' : 'Play Continuous Simulation'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleStep(-10)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Step Back 10°"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleStep(10)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Step Forward 10°"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onIndexChange(0)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Reset to 0°"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 ml-1">
            {[0.25, 0.5, 1, 2].map((spd) => (
              <button
                key={spd}
                onClick={() => onChangeSpeed(spd)}
                className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors cursor-pointer ${
                  simSpeed === spd
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Live Scrubber Readout */}
        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            <span className="text-slate-400">Angle:</span>
            <span className="text-sky-300 font-bold tabular-nums">
              {currentSample.thetaDeg.toFixed(1)}°
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            <span className="text-slate-400">v_o:</span>
            <span className="text-sky-300 font-bold tabular-nums">
              {currentSample.vOutput.toFixed(1)} V
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            <span className="text-slate-400">i_o:</span>
            <span className="text-emerald-300 font-bold tabular-nums">
              {currentSample.iOutput.toFixed(2)} A
            </span>
          </div>

          {/* Average Line Toggle */}
          <button
            onClick={() => setShowAverageLines(!showAverageLines)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors cursor-pointer text-[11px] ${
              showAverageLines
                ? 'bg-slate-800 border-sky-500 text-sky-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Avg Guides</span>
          </button>
        </div>
      </div>

      {/* Main Oscilloscope Screen */}
      <div
        ref={containerRef}
        className="w-full overflow-x-auto relative rounded-lg bg-slate-950 border border-slate-800 select-none"
      >
        <svg
          viewBox={`0 0 ${width} 440`}
          className="w-full min-w-[760px] h-auto cursor-crosshair"
          onClick={handleGraphPointer}
          onMouseMove={(e) => {
            if (e.buttons === 1) handleGraphPointer(e);
          }}
        >
          {/* Background Grid */}
          <g opacity={0.15}>
            {/* Horizontal divisions */}
            {[50, 100, 150, 200, 250, 300, 350, 400].map((y) => (
              <line
                key={`h-grid-${y}`}
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#64748b"
                strokeWidth={1}
                strokeDasharray="2 3"
              />
            ))}
            {/* Vertical Angle divisions: 0, 90, 180, 270, 360, 450, 540, 630, 720 */}
            {[0, 90, 180, 270, 360, 450, 540, 630, 720].map((deg) => {
              const x = mapThetaToX(deg);
              return (
                <line
                  key={`v-grid-${deg}`}
                  x1={x}
                  y1={15}
                  x2={x}
                  y2={410}
                  stroke={deg % 360 === 0 ? '#94a3b8' : '#475569'}
                  strokeWidth={deg % 360 === 0 ? 1.5 : 1}
                  strokeDasharray={deg % 360 === 0 ? undefined : '3 3'}
                />
              );
            })}
          </g>

          {/* ============================================================== */}
          {/* CHANNEL 1: INPUT AC VOLTAGES (yCenter = 75) */}
          {/* ============================================================== */}
          <g>
            {/* Zero Axis */}
            <line
              x1={paddingLeft}
              y1={75}
              x2={width - paddingRight}
              y2={75}
              stroke="#475569"
              strokeWidth={1.5}
            />
            <text
              x={paddingLeft - 8}
              y={79}
              textAnchor="end"
              className="text-[10px] font-mono fill-slate-400 font-semibold"
            >
              0 V
            </text>
            <text
              x={paddingLeft - 8}
              y={38}
              textAnchor="end"
              className="text-[9px] font-mono fill-slate-500"
            >
              +{vMax.toFixed(0)}V
            </text>
            <text
              x={paddingLeft - 8}
              y={118}
              textAnchor="end"
              className="text-[9px] font-mono fill-slate-500"
            >
              -{vMax.toFixed(0)}V
            </text>

            <text
              x={paddingLeft + 12}
              y={30}
              className="text-xs font-mono font-bold fill-sky-300"
            >
              CH1: Input AC Voltage {config.phase === '3ph' ? '(Va, Vb, Vc)' : 'v_s(t)'}
            </text>

            {config.phase === '1ph' ? (
              // 1-Phase Waveform
              <path
                d={generatePath((s) => s.vSourcePhaseA, channelHeight, 75, 45 / vMax)}
                fill="none"
                stroke="#38bdf8"
                strokeWidth={2}
                strokeLinecap="round"
              />
            ) : (
              // 3-Phase Waveforms
              <g>
                <path
                  d={generatePath((s) => s.vSourcePhaseA, channelHeight, 75, 45 / vMax)}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth={1.8}
                />
                <path
                  d={generatePath((s) => s.vSourcePhaseB, channelHeight, 75, 45 / vMax)}
                  fill="none"
                  stroke="#eab308"
                  strokeWidth={1.8}
                />
                <path
                  d={generatePath((s) => s.vSourcePhaseC, channelHeight, 75, 45 / vMax)}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={1.8}
                />
              </g>
            )}
          </g>

          {/* ============================================================== */}
          {/* CHANNEL 2: RECTIFIED OUTPUT VOLTAGE v_o (yCenter = 205) */}
          {/* ============================================================== */}
          <g>
            {/* Zero Axis */}
            <line
              x1={paddingLeft}
              y1={205}
              x2={width - paddingRight}
              y2={205}
              stroke="#475569"
              strokeWidth={1.5}
            />
            <text
              x={paddingLeft - 8}
              y={209}
              textAnchor="end"
              className="text-[10px] font-mono fill-slate-400 font-semibold"
            >
              0 V
            </text>
            <text
              x={paddingLeft - 8}
              y={168}
              textAnchor="end"
              className="text-[9px] font-mono fill-slate-500"
            >
              +{vMax.toFixed(0)}V
            </text>

            <text
              x={paddingLeft + 12}
              y={160}
              className="text-xs font-mono font-bold fill-amber-300"
            >
              CH2: Output Voltage v_o(t)
            </text>

            {/* Average Vdc dashed line */}
            {showAverageLines && (
              <g>
                <line
                  x1={paddingLeft}
                  y1={205 - metrics.vDcAvg * (50 / vMax)}
                  x2={width - paddingRight}
                  y2={205 - metrics.vDcAvg * (50 / vMax)}
                  stroke="#fbbf24"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  opacity={0.8}
                />
                <text
                  x={width - paddingRight - 8}
                  y={200 - metrics.vDcAvg * (50 / vMax)}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-amber-300 font-semibold"
                >
                  V_dc = {metrics.vDcAvg.toFixed(1)} V
                </text>
              </g>
            )}

            {/* Output Voltage curve */}
            <path
              d={generatePath((s) => s.vOutput, channelHeight, 205, 50 / vMax)}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* ============================================================== */}
          {/* CHANNEL 3: LOAD CURRENT i_o (yCenter = 325) */}
          {/* ============================================================== */}
          <g>
            {/* Zero Axis */}
            <line
              x1={paddingLeft}
              y1={325}
              x2={width - paddingRight}
              y2={325}
              stroke="#475569"
              strokeWidth={1.5}
            />
            <text
              x={paddingLeft - 8}
              y={329}
              textAnchor="end"
              className="text-[10px] font-mono fill-slate-400 font-semibold"
            >
              0 A
            </text>
            <text
              x={paddingLeft - 8}
              y={288}
              textAnchor="end"
              className="text-[9px] font-mono fill-slate-500"
            >
              +{iMax.toFixed(1)}A
            </text>

            <text
              x={paddingLeft + 12}
              y={280}
              className="text-xs font-mono font-bold fill-emerald-300"
            >
              CH3: Load Current i_o(t) {config.load === 'RL' ? '(Inductive Filtering)' : '(Resistive)'}
            </text>

            {/* Average Idc dashed line */}
            {showAverageLines && (
              <g>
                <line
                  x1={paddingLeft}
                  y1={325 - metrics.iDcAvg * (50 / iMax)}
                  x2={width - paddingRight}
                  y2={325 - metrics.iDcAvg * (50 / iMax)}
                  stroke="#34d399"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  opacity={0.8}
                />
                <text
                  x={width - paddingRight - 8}
                  y={320 - metrics.iDcAvg * (50 / iMax)}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-emerald-300 font-semibold"
                >
                  I_dc = {metrics.iDcAvg.toFixed(2)} A
                </text>
              </g>
            )}

            {/* Output Current curve */}
            <path
              d={generatePath((s) => s.iOutput, channelHeight, 325, 50 / iMax)}
              fill="none"
              stroke="#10b981"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* ============================================================== */}
          {/* CHANNEL 4: GATE TRIGGER & FREEWHEELING PULSES (yCenter = 390) */}
          {/* ============================================================== */}
          <g>
            <line
              x1={paddingLeft}
              y1={400}
              x2={width - paddingRight}
              y2={400}
              stroke="#334155"
              strokeWidth={1}
            />
            <text
              x={paddingLeft + 12}
              y={380}
              className="text-[11px] font-mono font-bold fill-purple-300"
            >
              CH4: {config.device === 'thyristor' ? 'Thyristor Gate Pulses' : 'Conduction Status'} &{' '}
              {config.hasFreewheelingDiode ? 'FWD Freewheeling' : 'Device Activity'}
            </text>

            {/* Freewheeling & Gate Pulses */}
            {samples.map((s, idx) => {
              if (idx % 2 !== 0) return null;
              const x = mapSampleIdxToX(idx);
              if (s.isGateTriggered) {
                return (
                  <line
                    key={`gate-${idx}`}
                    x1={x}
                    y1={400}
                    x2={x}
                    y2={370}
                    stroke="#c084fc"
                    strokeWidth={2.5}
                  />
                );
              }
              if (s.isFreewheelingActive) {
                return (
                  <rect
                    key={`fwd-${idx}`}
                    x={x - 1}
                    y={385}
                    width={2}
                    height={15}
                    fill="#fbbf24"
                    opacity={0.7}
                  />
                );
              }
              return null;
            })}
          </g>

          {/* Angle Scale at Bottom */}
          <g transform="translate(0, 424)">
            {[0, 90, 180, 270, 360, 450, 540, 630, 720].map((deg) => (
              <text
                key={`deg-label-${deg}`}
                x={mapThetaToX(deg)}
                y={0}
                textAnchor="middle"
                className="text-[10px] font-mono fill-slate-400"
              >
                {deg}°
              </text>
            ))}
          </g>

          {/* ============================================================== */}
          {/* SYNCHRONIZED TIME CURSOR (Interactive Scrub Line) */}
          {/* ============================================================== */}
          <g>
            <line
              x1={currentCursorX}
              y1={15}
              x2={currentCursorX}
              y2={410}
              stroke="#38bdf8"
              strokeWidth={2}
              strokeDasharray="4 2"
              className="drop-shadow-[0_0_6px_#38bdf8]"
            />
            {/* Cursor Handle at Top */}
            <polygon
              points={`${currentCursorX - 6},15 ${currentCursorX + 6},15 ${currentCursorX},23`}
              fill="#38bdf8"
            />
            {/* Probe dots on curves */}
            <circle
              cx={currentCursorX}
              cy={75 - currentSample.vSourcePhaseA * (45 / vMax)}
              r={4}
              fill="#38bdf8"
              stroke="#0f172a"
              strokeWidth={1.5}
            />
            <circle
              cx={currentCursorX}
              cy={205 - currentSample.vOutput * (50 / vMax)}
              r={5}
              fill="#f59e0b"
              stroke="#ffffff"
              strokeWidth={2}
            />
            <circle
              cx={currentCursorX}
              cy={325 - currentSample.iOutput * (50 / iMax)}
              r={5}
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth={2}
            />
          </g>
        </svg>
      </div>

      {/* Scrub Range Slider for smooth touch / mouse scrub */}
      <div className="w-full mt-3 flex items-center gap-3">
        <span className="text-xs font-mono text-slate-400">Scrub (0°–720°):</span>
        <input
          type="range"
          min={0}
          max={maxIdx}
          value={currentIndex}
          onChange={(e) => onIndexChange(Number(e.target.value))}
          className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
        />
        <span className="text-xs font-mono text-sky-400 font-bold tabular-nums w-14 text-right">
          {((currentIndex / maxIdx) * 720).toFixed(0)}°
        </span>
      </div>
    </div>
  );
};
