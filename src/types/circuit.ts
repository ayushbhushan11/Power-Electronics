export type PhaseType = '1ph' | '3ph';
export type WaveType = 'half' | 'full';
export type DeviceType = 'diode' | 'thyristor';
export type LoadType = 'R' | 'RL';

export interface CircuitConfig {
  phase: PhaseType;
  wave: WaveType;
  device: DeviceType;
  load: LoadType;
  hasFreewheelingDiode: boolean;
  firingAngleDeg: number; // 0 to 180 degrees (for thyristor)
  supplyVoltageVrms: number; // Volts (RMS phase voltage)
  frequencyHz: number; // Hz (50 or 60)
  resistanceOhms: number; // Ohms
  inductanceMh: number; // milliHenries
}

export interface ConductionInterval {
  startDeg: number;
  endDeg: number;
  devices: string[];
  isFreewheeling?: boolean;
  label: string;
}

export interface SimulationSample {
  timeMs: number;
  thetaDeg: number; // angle 0..360 (or 0..720)
  thetaRad: number;
  // Voltages
  vSourcePhaseA: number;
  vSourcePhaseB: number;
  vSourcePhaseC: number;
  vSourceLineAB: number;
  vSourceLineBC: number;
  vSourceLineCA: number;
  vOutput: number;
  // Currents
  iOutput: number;
  iFreewheeling: number;
  // Device conducting states
  conductingDevices: string[];
  isCircuitOn: boolean;
  isFreewheelingActive: boolean;
  // Gate trigger active at this instant?
  isGateTriggered: boolean;
}

export interface CircuitMetrics {
  vPeakPhase: number;
  vPeakLine: number;
  vDcAvg: number;
  vRms: number;
  iDcAvg: number;
  iRms: number;
  powerDc: number;
  powerAc: number;
  rippleFactor: number;
  formFactor: number;
  efficiencyPercent: number;
  rippleFrequencyHz: number;
  formulaVdc: string;
  formulaVdcLatex: string;
  formulaExplanation: string;
  conductionSummary: string;
}
