import { CircuitConfig, CircuitMetrics, ConductionInterval, SimulationSample } from '../types/circuit';

/**
 * Solves the rectifier circuit behavior across time and calculates both
 * numerical samples and analytical formulas.
 */
export function simulateRectifier(config: CircuitConfig): {
  samples: SimulationSample[];
  intervals: ConductionInterval[];
  metrics: CircuitMetrics;
} {
  const {
    phase,
    wave,
    device,
    load,
    hasFreewheelingDiode,
    firingAngleDeg,
    supplyVoltageVrms,
    frequencyHz,
    resistanceOhms,
    inductanceMh,
  } = config;

  const omega = 2 * Math.PI * frequencyHz;
  const VmPhase = Math.SQRT2 * supplyVoltageVrms;
  const VmLine = Math.sqrt(3) * VmPhase;
  const R = Math.max(resistanceOhms, 0.1);
  const L = load === 'RL' ? Math.max(inductanceMh * 1e-3, 1e-5) : 0;
  const alphaRad = (firingAngleDeg * Math.PI) / 180;
  const periodSec = 1 / frequencyHz;
  const totalCycles = 2;
  const numSteps = 720 * totalCycles; // 0.5 deg per step
  const dt = (periodSec * totalCycles) / numSteps;

  // Track instantaneous current
  let iLoad = 0;
  const samples: SimulationSample[] = [];

  // Device naming conventions:
  // 1-ph half: T1 / D1, FWD
  // 1-ph full: T1, T2 (pair 1), T3, T4 (pair 2), FWD
  // 3-ph half: T1 (Phase A), T2 (Phase B), T3 (Phase C), FWD
  // 3-ph full: T1, T3, T5 (upper), T4, T6, T2 (lower), FWD

  // We run 1 cycle as warm-up for RL steady state, then record steady-state 2nd & 3rd cycles
  const totalSimSteps = numSteps + 360 * 2; // Warmup steps
  let recordedIndex = 0;

  for (let step = 0; step < totalSimSteps; step++) {
    const timeSec = step * dt;
    const thetaTotalRad = omega * timeSec;
    const thetaCycleRad = thetaTotalRad % (2 * Math.PI);
    const thetaCycleDeg = (thetaCycleRad * 180) / Math.PI;

    // Instantaneous supply voltages
    const va = VmPhase * Math.sin(thetaTotalRad);
    const vb = VmPhase * Math.sin(thetaTotalRad - (2 * Math.PI) / 3);
    const vc = VmPhase * Math.sin(thetaTotalRad - (4 * Math.PI) / 3);

    const vab = Math.sqrt(3) * VmPhase * Math.sin(thetaTotalRad + Math.PI / 6);
    const vbc = Math.sqrt(3) * VmPhase * Math.sin(thetaTotalRad - Math.PI / 2);
    const vca = Math.sqrt(3) * VmPhase * Math.sin(thetaTotalRad + (5 * Math.PI) / 6);

    let vApplied = 0;
    const activeDevices: string[] = [];
    let isFwdActive = false;
    let isGateActive = false;

    // Gate pulse window threshold: within 2.5 degrees of alpha trigger points
    const isAtAngle = (angleDeg: number, targetDeg: number) => {
      const diff = Math.abs(angleDeg - targetDeg);
      return diff <= 2.5;
    };

    if (phase === '1ph' && wave === 'half') {
      // 1-PHASE HALF-WAVE
      const isPositiveHalf = va > 0;
      const canTrigger = device === 'diode' ? isPositiveHalf : (thetaCycleRad >= alphaRad && thetaCycleRad <= Math.PI);

      if (device === 'thyristor') {
        if (isAtAngle(thetaCycleDeg, firingAngleDeg)) {
          isGateActive = true;
        }
      }

      if (canTrigger) {
        vApplied = va;
        activeDevices.push(device === 'thyristor' ? 'T1' : 'D1');
      } else if (iLoad > 0) {
        // Inductor discharge
        if (hasFreewheelingDiode) {
          // Freewheeling diode turns on as soon as va drops below 0 while iLoad > 0
          vApplied = 0;
          isFwdActive = true;
          activeDevices.push('FWD');
        } else {
          // No FWD: Diode / SCR stays on because of inductor current even though va < 0
          vApplied = va;
          activeDevices.push(device === 'thyristor' ? 'T1' : 'D1');
        }
      } else {
        vApplied = 0;
      }
    } else if (phase === '1ph' && wave === 'full') {
      // 1-PHASE FULL-WAVE BRIDGE
      const d1d2Trigger = device === 'diode'
        ? (thetaCycleRad >= 0 && thetaCycleRad < Math.PI)
        : (thetaCycleRad >= alphaRad && thetaCycleRad < Math.PI + alphaRad && (thetaCycleRad < Math.PI || !hasFreewheelingDiode));

      const d3d4Trigger = device === 'diode'
        ? (thetaCycleRad >= Math.PI && thetaCycleRad < 2 * Math.PI)
        : (thetaCycleRad >= Math.PI + alphaRad || (thetaCycleRad < alphaRad && !hasFreewheelingDiode && iLoad > 0));

      if (device === 'thyristor') {
        if (isAtAngle(thetaCycleDeg, firingAngleDeg) || isAtAngle(thetaCycleDeg, (firingAngleDeg + 180) % 360)) {
          isGateActive = true;
        }
      }

      if (device === 'diode') {
        if (thetaCycleRad < Math.PI) {
          vApplied = Math.abs(va);
          activeDevices.push('D1', 'D2');
        } else {
          vApplied = Math.abs(va);
          activeDevices.push('D3', 'D4');
        }
      } else {
        // Controlled Bridge
        const devPair1 = ['T1', 'T2'];
        const devPair2 = ['T3', 'T4'];

        if (thetaCycleRad >= alphaRad && thetaCycleRad < Math.PI) {
          // T1, T2 active, positive input
          vApplied = va;
          activeDevices.push(...devPair1);
        } else if (thetaCycleRad >= Math.PI && thetaCycleRad < Math.PI + alphaRad) {
          if (hasFreewheelingDiode && iLoad > 0) {
            // FWD conducts, clamping vo to 0
            vApplied = 0;
            isFwdActive = true;
            activeDevices.push('FWD');
          } else if (iLoad > 0) {
            // Inductive current pulls va negative through T1, T2
            vApplied = va; // negative!
            activeDevices.push(...devPair1);
          } else {
            vApplied = 0;
          }
        } else if (thetaCycleRad >= Math.PI + alphaRad && thetaCycleRad < 2 * Math.PI) {
          // T3, T4 active, negative input inverted
          vApplied = -va;
          activeDevices.push(...devPair2);
        } else {
          // thetaCycleRad < alphaRad
          if (hasFreewheelingDiode && iLoad > 0) {
            vApplied = 0;
            isFwdActive = true;
            activeDevices.push('FWD');
          } else if (iLoad > 0) {
            vApplied = -va; // negative!
            activeDevices.push(...devPair2);
          } else {
            vApplied = 0;
          }
        }
      }
    } else if (phase === '3ph' && wave === 'half') {
      // 3-PHASE HALF-WAVE (3-Pulse Star)
      // Natural crossover points at 30° (pi/6), 150° (5pi/6), 270° (9pi/6 = 3pi/2)
      // Phase A max from 30° to 150°
      // Phase B max from 150° to 270°
      // Phase C max from 270° to 390° (30°)
      const devA = device === 'thyristor' ? 'T1' : 'D1';
      const devB = device === 'thyristor' ? 'T2' : 'D2';
      const devC = device === 'thyristor' ? 'T3' : 'D3';

      const firingRad = device === 'thyristor' ? alphaRad : 0;
      const angleRef = (thetaCycleRad - Math.PI / 6 - firingRad + 4 * Math.PI) % (2 * Math.PI);

      if (device === 'thyristor') {
        const fireA = (30 + firingAngleDeg) % 360;
        const fireB = (150 + firingAngleDeg) % 360;
        const fireC = (270 + firingAngleDeg) % 360;
        if (isAtAngle(thetaCycleDeg, fireA) || isAtAngle(thetaCycleDeg, fireB) || isAtAngle(thetaCycleDeg, fireC)) {
          isGateActive = true;
        }
      }

      let activePhaseVolt = 0;
      let devName = '';

      if (angleRef >= 0 && angleRef < (2 * Math.PI) / 3) {
        activePhaseVolt = va;
        devName = devA;
      } else if (angleRef >= (2 * Math.PI) / 3 && angleRef < (4 * Math.PI) / 3) {
        activePhaseVolt = vb;
        devName = devB;
      } else {
        activePhaseVolt = vc;
        devName = devC;
      }

      if (activePhaseVolt > 0) {
        vApplied = activePhaseVolt;
        activeDevices.push(devName);
      } else {
        // Phase voltage is negative
        if (hasFreewheelingDiode && iLoad > 0) {
          vApplied = 0;
          isFwdActive = true;
          activeDevices.push('FWD');
        } else if (load === 'RL' && iLoad > 0) {
          vApplied = activePhaseVolt; // inductive conduction through negative
          activeDevices.push(devName);
        } else {
          vApplied = 0;
        }
      }
    } else {
      // 3-PHASE FULL-WAVE BRIDGE (6-Pulse)
      // Line voltages cycle every 60 degrees (pi/3)
      // Devices: Upper T1(A), T3(B), T5(C); Lower T4(A), T6(B), T2(C)
      // Conduction pairs:
      // 30°..90°: Vab (T1, T6)
      // 90°..150°: Vac (T1, T2)
      // 150°..210°: Vbc (T3, T2)
      // 210°..270°: Vba (T3, T4)
      // 270°..330°: Vca (T5, T4)
      // 330°..390°(30°): Vcb (T5, T6)
      const devPrefix = device === 'thyristor' ? 'T' : 'D';
      const firingRad = device === 'thyristor' ? alphaRad : 0;
      const angleRef = (thetaCycleRad - Math.PI / 6 - firingRad + 4 * Math.PI) % (2 * Math.PI);
      const sector = Math.floor(angleRef / (Math.PI / 3));

      let currentLineV = 0;
      let pair: string[] = [];

      switch (sector) {
        case 0:
          currentLineV = vab;
          pair = [`${devPrefix}1`, `${devPrefix}6`];
          break;
        case 1:
          currentLineV = -vca; // Vac = -Vca
          pair = [`${devPrefix}1`, `${devPrefix}2`];
          break;
        case 2:
          currentLineV = vbc;
          pair = [`${devPrefix}3`, `${devPrefix}2`];
          break;
        case 3:
          currentLineV = -vab; // Vba = -Vab
          pair = [`${devPrefix}3`, `${devPrefix}4`];
          break;
        case 4:
          currentLineV = vca;
          pair = [`${devPrefix}5`, `${devPrefix}4`];
          break;
        default:
          currentLineV = -vbc; // Vcb = -Vbc
          pair = [`${devPrefix}5`, `${devPrefix}6`];
          break;
      }

      if (device === 'thyristor') {
        const trigA = (30 + firingAngleDeg) % 360;
        const trigB = (90 + firingAngleDeg) % 360;
        const trigC = (150 + firingAngleDeg) % 360;
        const trigD = (210 + firingAngleDeg) % 360;
        const trigE = (270 + firingAngleDeg) % 360;
        const trigF = (330 + firingAngleDeg) % 360;
        if (
          isAtAngle(thetaCycleDeg, trigA) ||
          isAtAngle(thetaCycleDeg, trigB) ||
          isAtAngle(thetaCycleDeg, trigC) ||
          isAtAngle(thetaCycleDeg, trigD) ||
          isAtAngle(thetaCycleDeg, trigE) ||
          isAtAngle(thetaCycleDeg, trigF)
        ) {
          isGateActive = true;
        }
      }

      if (currentLineV >= 0) {
        vApplied = currentLineV;
        activeDevices.push(...pair);
      } else {
        // Line voltage went negative (possible when alpha > 60)
        if (hasFreewheelingDiode && iLoad > 0) {
          vApplied = 0;
          isFwdActive = true;
          activeDevices.push('FWD');
        } else if (load === 'RL' && iLoad > 0) {
          vApplied = currentLineV;
          activeDevices.push(...pair);
        } else {
          vApplied = 0;
        }
      }
    }

    // Solve load current using Euler / RK integration
    if (load === 'R') {
      iLoad = Math.max(0, vApplied / R);
    } else {
      // RL load: L * di/dt + R * i = vApplied
      const di_dt = (vApplied - R * iLoad) / L;
      iLoad += di_dt * dt;
      if (iLoad < 0) {
        iLoad = 0;
      }
    }

    const isCircuitOn = activeDevices.length > 0 && (Math.abs(vApplied) > 0.1 || iLoad > 0.01);

    // Save sample if past warmup
    if (step >= 360 * 2) {
      samples.push({
        timeMs: (recordedIndex * dt * 1000),
        thetaDeg: thetaCycleDeg,
        thetaRad: thetaCycleRad,
        vSourcePhaseA: va,
        vSourcePhaseB: vb,
        vSourcePhaseC: vc,
        vSourceLineAB: vab,
        vSourceLineBC: vbc,
        vSourceLineCA: vca,
        vOutput: vApplied,
        iOutput: iLoad,
        iFreewheeling: isFwdActive ? iLoad : 0,
        conductingDevices: activeDevices,
        isCircuitOn,
        isFreewheelingActive: isFwdActive,
        isGateTriggered: isGateActive,
      });
      recordedIndex++;
    }
  }

  // Calculate Average and RMS metrics across the steady-state recorded samples
  let sumVo = 0;
  let sumVoSq = 0;
  let sumIo = 0;
  let sumIoSq = 0;
  const sampleCount = samples.length;

  for (let i = 0; i < sampleCount; i++) {
    const s = samples[i];
    sumVo += s.vOutput;
    sumVoSq += s.vOutput * s.vOutput;
    sumIo += s.iOutput;
    sumIoSq += s.iOutput * s.iOutput;
  }

  const vDcAvg = sumVo / sampleCount;
  const vRms = Math.sqrt(sumVoSq / sampleCount);
  const iDcAvg = sumIo / sampleCount;
  const iRms = Math.sqrt(sumIoSq / sampleCount);
  const powerDc = vDcAvg * iDcAvg;
  const powerAc = vRms * iRms;
  const formFactor = vDcAvg > 0.001 ? vRms / vDcAvg : 0;
  const rippleFactor = formFactor >= 1 ? Math.sqrt(Math.max(0, formFactor * formFactor - 1)) : 0;
  const efficiencyPercent = powerAc > 0.001 ? Math.min(100, (powerDc / powerAc) * 100) : 0;

  // Determine ripple frequency
  let rippleFreqMultiplier = 1;
  if (phase === '1ph') {
    rippleFreqMultiplier = wave === 'half' ? 1 : 2;
  } else {
    rippleFreqMultiplier = wave === 'half' ? 3 : 6;
  }
  const rippleFrequencyHz = frequencyHz * rippleFreqMultiplier;

  // Compile analytical formulas and explanations
  let formulaVdc = '';
  let formulaVdcLatex = '';
  let formulaExplanation = '';
  let conductionSummary = '';

  const cosAlpha = Math.cos(alphaRad).toFixed(3);

  if (phase === '1ph' && wave === 'half') {
    if (device === 'diode') {
      formulaVdc = `V_dc = V_m / π = (${VmPhase.toFixed(1)} / π) = ${(VmPhase / Math.PI).toFixed(1)} V`;
      formulaVdcLatex = `V_{dc} = \\frac{V_m}{\\pi}`;
      formulaExplanation = load === 'R'
        ? `Diode conducts for the positive half cycle [0, π]. Peak inverse voltage PIV = Vm.`
        : hasFreewheelingDiode
        ? `Diode conducts [0, π]. FWD freewheels during [π, 2π], clamping output voltage to zero and preventing negative inductive spikes.`
        : `Inductor energy extends diode conduction past π up to extinction angle β. Output voltage goes negative during [π, β].`;
      conductionSummary = hasFreewheelingDiode && load === 'RL'
        ? `D1 conducts for 0°–180°, FWD freewheels for 180°–360°`
        : `D1 conducts for 0°–180° (positive half cycle)`;
    } else {
      // Thyristor
      if (hasFreewheelingDiode || load === 'R') {
        formulaVdc = `V_dc = (V_m / 2π) · (1 + cos α) = ${(VmPhase / (2 * Math.PI) * (1 + Math.cos(alphaRad))).toFixed(1)} V`;
        formulaVdcLatex = `V_{dc} = \\frac{V_m}{2\\pi}(1 + \\cos\\alpha)`;
      } else {
        formulaVdc = `V_dc = (V_m / 2π) · (cos α - cos β)`;
        formulaVdcLatex = `V_{dc} = \\frac{V_m}{2\\pi}(\\cos\\alpha - \\cos\\beta)`;
      }
      formulaExplanation = `Thyristor T1 remains OFF until trigger pulse α = ${firingAngleDeg}°. Conduction is delayed, controlling average DC output.`;
      conductionSummary = `T1 triggers at α = ${firingAngleDeg}°, conducts until π ${hasFreewheelingDiode ? 'when FWD takes over' : ''}`;
    }
  } else if (phase === '1ph' && wave === 'full') {
    if (device === 'diode') {
      formulaVdc = `V_dc = (2 · V_m) / π = (2 · ${VmPhase.toFixed(1)}) / π = ${((2 * VmPhase) / Math.PI).toFixed(1)} V`;
      formulaVdcLatex = `V_{dc} = \\frac{2V_m}{\\pi}`;
      formulaExplanation = `Full-wave diode bridge rectifies both positive and negative half-cycles. D1 & D2 conduct for [0, π]; D3 & D4 conduct for [π, 2π].`;
      conductionSummary = `0°–180°: D1 & D2 conduct | 180°–360°: D3 & D4 conduct`;
    } else {
      // Controlled bridge
      if (hasFreewheelingDiode) {
        formulaVdc = `V_dc = (V_m / π) · (1 + cos α) = ${((VmPhase / Math.PI) * (1 + Math.cos(alphaRad))).toFixed(1)} V`;
        formulaVdcLatex = `V_{dc} = \\frac{V_m}{\\pi}(1 + \\cos\\alpha)`;
        formulaExplanation = `With FWD, at π the freewheeling diode turns ON and clamps v_o = 0, avoiding negative load voltage dips during [π, π+α].`;
      } else {
        formulaVdc = `V_dc = (2 · V_m / π) · cos α = (${((2 * VmPhase) / Math.PI).toFixed(1)}) · cos(${firingAngleDeg}°) = ${(((2 * VmPhase) / Math.PI) * Math.cos(alphaRad)).toFixed(1)} V`;
        formulaVdcLatex = `V_{dc} = \\frac{2V_m}{\\pi}\\cos\\alpha`;
        formulaExplanation = `Fully controlled 1-phase converter. For continuous conduction, T1 & T2 conduct from α to π+α, carrying negative voltage until T3 & T4 fire.`;
      }
      conductionSummary = `α to 180°: T1 & T2 | 180° to 180°+α: ${hasFreewheelingDiode ? 'FWD' : 'T1 & T2'} | 180°+α to 360°: T3 & T4`;
    }
  } else if (phase === '3ph' && wave === 'half') {
    // 3-phase half wave (3-pulse)
    if (device === 'diode') {
      formulaVdc = `V_dc = (3√3 · V_m) / (2π) = ${( (3 * Math.sqrt(3) * VmPhase) / (2 * Math.PI) ).toFixed(1)} V`;
      formulaVdcLatex = `V_{dc} = \\frac{3\\sqrt{3}V_m}{2\\pi} = 0.827 V_m`;
      formulaExplanation = `3-pulse star rectifier. Each diode conducts for 120° (2π/3) when its respective phase voltage is higher than the other two phases.`;
      conductionSummary = `30°–150°: D1 (Phase A) | 150°–270°: D2 (Phase B) | 270°–390°: D3 (Phase C)`;
    } else {
      formulaVdc = `V_dc = (3√3 · V_m / 2π) · cos α = ${( ((3 * Math.sqrt(3) * VmPhase) / (2 * Math.PI)) * Math.cos(alphaRad) ).toFixed(1)} V`;
      formulaVdcLatex = `V_{dc} = \\frac{3\\sqrt{3}V_m}{2\\pi}\\cos\\alpha`;
      formulaExplanation = `3-phase half-wave controlled converter. Firing angle α is measured from the natural commutation crossover points (30°, 150°, 270°).`;
      conductionSummary = `(30°+α) to (150°+α): T1 | (150°+α) to (270°+α): T2 | (270°+α) to (390°+α): T3`;
    }
  } else {
    // 3-phase full wave (6-pulse bridge)
    if (device === 'diode') {
      formulaVdc = `V_dc = (3√3 · V_m) / π = (3 · V_m,LL) / π = ${( (3 * Math.sqrt(3) * VmPhase) / Math.PI ).toFixed(1)} V`;
      formulaVdcLatex = `V_{dc} = \\frac{3\\sqrt{3}V_m}{\\pi} = \\frac{3 V_{m,LL}}{\\pi} \\approx 1.35 V_{LL,rms}`;
      formulaExplanation = `6-pulse full-wave diode bridge. Two diodes conduct simultaneously (one upper, one lower) for 60° sectors, yielding a low 4.2% ripple factor.`;
      conductionSummary = `6 commutations per cycle: D1D6 → D1D2 → D3D2 → D3D4 → D5D4 → D5D6 (each device conducts 120°)`;
    } else {
      formulaVdc = `V_dc = (3√3 · V_m / π) · cos α = ${( ((3 * Math.sqrt(3) * VmPhase) / Math.PI) * Math.cos(alphaRad) ).toFixed(1)} V`;
      formulaVdcLatex = `V_{dc} = \\frac{3\\sqrt{3}V_m}{\\pi}\\cos\\alpha`;
      formulaExplanation = `Fully controlled 6-pulse bridge converter. If α < 90°, it operates in rectification mode. If α > 90° with active source, it inverts power back to AC.`;
      conductionSummary = `Thyristors fire in pairs: (T1,T6) → (T1,T2) → (T3,T2) → (T3,T4) → (T5,T4) → (T5,T6) delayed by α = ${firingAngleDeg}°`;
    }
  }

  // Generate Conduction Intervals array for the visual timeline
  const intervals: ConductionInterval[] = generateConductionIntervals(config);

  const metrics: CircuitMetrics = {
    vPeakPhase: VmPhase,
    vPeakLine: VmLine,
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
  };

  return { samples, intervals, metrics };
}

function generateConductionIntervals(config: CircuitConfig): ConductionInterval[] {
  const { phase, wave, device, load, hasFreewheelingDiode, firingAngleDeg } = config;
  const prefix = device === 'thyristor' ? 'T' : 'D';
  const alpha = device === 'thyristor' ? firingAngleDeg : 0;

  if (phase === '1ph' && wave === 'half') {
    if (device === 'diode') {
      return [
        { startDeg: 0, endDeg: 180, devices: ['D1'], label: 'D1 Conducting' },
        ...(hasFreewheelingDiode && load === 'RL'
          ? [{ startDeg: 180, endDeg: 360, devices: ['FWD'], isFreewheeling: true, label: 'FWD Freewheeling' }]
          : [{ startDeg: 180, endDeg: 360, devices: [], label: 'Off / Blocking' }]),
      ];
    } else {
      // Thyristor
      const items: ConductionInterval[] = [
        { startDeg: 0, endDeg: alpha, devices: [], label: 'Off (Awaiting Pulse α)' },
      ];
      if (hasFreewheelingDiode && load === 'RL') {
        items.push({ startDeg: alpha, endDeg: 180, devices: ['T1'], label: 'T1 Conducting' });
        items.push({ startDeg: 180, endDeg: 360, devices: ['FWD'], isFreewheeling: true, label: 'FWD Freewheeling' });
      } else {
        // Without FWD
        const endAngle = load === 'RL' ? Math.min(360, 180 + Math.min(60, alpha + 30)) : 180;
        items.push({ startDeg: alpha, endDeg: endAngle, devices: ['T1'], label: 'T1 Conducting' });
        if (endAngle < 360) {
          items.push({ startDeg: endAngle, endDeg: 360, devices: [], label: 'Off / Extinguished' });
        }
      }
      return items;
    }
  } else if (phase === '1ph' && wave === 'full') {
    if (device === 'diode') {
      return [
        { startDeg: 0, endDeg: 180, devices: ['D1', 'D2'], label: 'D1 & D2 Active' },
        { startDeg: 180, endDeg: 360, devices: ['D3', 'D4'], label: 'D3 & D4 Active' },
      ];
    } else {
      // Controlled bridge
      if (hasFreewheelingDiode && load === 'RL') {
        return [
          { startDeg: 0, endDeg: alpha, devices: ['FWD'], isFreewheeling: true, label: 'FWD Freewheeling' },
          { startDeg: alpha, endDeg: 180, devices: ['T1', 'T2'], label: 'T1 & T2 Active' },
          { startDeg: 180, endDeg: 180 + alpha, devices: ['FWD'], isFreewheeling: true, label: 'FWD Freewheeling' },
          { startDeg: 180 + alpha, endDeg: 360, devices: ['T3', 'T4'], label: 'T3 & T4 Active' },
        ];
      } else {
        return [
          { startDeg: 0, endDeg: alpha, devices: ['T3', 'T4'], label: 'T3 & T4 Inductive Continuation' },
          { startDeg: alpha, endDeg: 180 + alpha, devices: ['T1', 'T2'], label: 'T1 & T2 Active' },
          { startDeg: 180 + alpha, endDeg: 360, devices: ['T3', 'T4'], label: 'T3 & T4 Active' },
        ];
      }
    }
  } else if (phase === '3ph' && wave === 'half') {
    const a1 = (30 + alpha) % 360;
    const a2 = (150 + alpha) % 360;
    const a3 = (270 + alpha) % 360;
    return [
      { startDeg: 0, endDeg: 30 + alpha, devices: [`${prefix}3`], label: `${prefix}3 (Phase C)` },
      { startDeg: 30 + alpha, endDeg: 150 + alpha, devices: [`${prefix}1`], label: `${prefix}1 (Phase A)` },
      { startDeg: 150 + alpha, endDeg: 270 + alpha, devices: [`${prefix}2`], label: `${prefix}2 (Phase B)` },
      { startDeg: 270 + alpha, endDeg: 360, devices: [`${prefix}3`], label: `${prefix}3 (Phase C)` },
    ];
  } else {
    // 3-ph full bridge 6-pulse
    const shift = 30 + alpha;
    return [
      { startDeg: (shift + 0) % 360, endDeg: (shift + 60) % 360, devices: [`${prefix}1`, `${prefix}6`], label: `${prefix}1 & ${prefix}6 (Vab)` },
      { startDeg: (shift + 60) % 360, endDeg: (shift + 120) % 360, devices: [`${prefix}1`, `${prefix}2`], label: `${prefix}1 & ${prefix}2 (Vac)` },
      { startDeg: (shift + 120) % 360, endDeg: (shift + 180) % 360, devices: [`${prefix}3`, `${prefix}2`], label: `${prefix}3 & ${prefix}2 (Vbc)` },
      { startDeg: (shift + 180) % 360, endDeg: (shift + 240) % 360, devices: [`${prefix}3`, `${prefix}4`], label: `${prefix}3 & ${prefix}4 (Vba)` },
      { startDeg: (shift + 240) % 360, endDeg: (shift + 300) % 360, devices: [`${prefix}5`, `${prefix}4`], label: `${prefix}5 & ${prefix}4 (Vca)` },
      { startDeg: (shift + 300) % 360, endDeg: (shift + 360) % 360, devices: [`${prefix}5`, `${prefix}6`], label: `${prefix}5 & ${prefix}6 (Vcb)` },
    ].sort((a, b) => a.startDeg - b.startDeg);
  }
}
