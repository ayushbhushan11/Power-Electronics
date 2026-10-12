# PowerRectify ⚡
### Power Electronics In-Class Assignment 2
**Student**: Ayush Bhushan (Roll No: **24EE10043**)  
**Department**: Department of Electrical Engineering  

An interactive, laboratory-grade web application for simulating single-phase and three-phase uncontrolled (diode) and controlled (thyristor / SCR) rectifiers in real time. Designed for electrical and electronics engineering students, educators, and power electronics practitioners.

---

## 🌟 Key Features

- **Multi-Topology Switching**:
  - **Phase**: 1-Phase ($1\phi$) & 3-Phase ($3\phi$)
  - **Configuration**: Half-Wave & Full-Wave Bridge (4-diode/thyristor 1-phase bridge, 6-pulse 3-phase bridge)
  - **Devices**: Diodes (uncontrolled) & Thyristors / SCRs (phase-controlled)
  - **Load Types**: Pure Resistive ($R$) & Inductive ($R + L$)
  - **Freewheeling Diode (FWD)**: Toggleable flyback diode to demonstrate inductive kick suppression, voltage clamping, and freewheeling energy loops.
- **Dynamic Circuit Schematics**:
  - Full vector SVG circuit diagrams for all topologies.
  - **Animated Current Paths**: Real-time pulsing flow lines indicating instantaneous current direction through conducting devices and loops.
  - Active conduction indicators and Thyristor gate trigger pulse flashes ($\omega t = \alpha$).
- **Time-Domain Oscilloscope**:
  - Multi-channel traces: Input AC voltage, output rectified voltage $v_o(t)$, load current $i_o(t)$, and gate/FWD conduction pulses.
  - Interactive scrub slider: pause at any angle and inspect exact values.
  - Simulation playback speed: $0.25\times, 0.5\times, 1\times, 2\times$.
- **Conduction Timeline**:
  - Live $0^\circ \to 360^\circ$ conduction breakdown bar highlighting active devices across the AC cycle.
  - Real-time circuit status indicator (`CIRCUIT ON` vs `CIRCUIT OFF`).
- **Analytical Metrics & Formulas**:
  - Computes $V_{dc}, V_{rms}, I_{dc}, I_{rms}, P_{dc}, P_{ac}, \eta$ (efficiency), Ripple Factor, Form Factor, and Ripple Frequency.
  - Theoretical closed-form equations rendered dynamically with current parameter substitutions.

---

## 🚀 How to Deploy to GitHub Pages

This repository includes a pre-configured GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys the site whenever you push code.

### Step 1: Push this Code to your GitHub Repository

If you haven't initialized Git yet:
```bash
git init
git add .
git commit -m "Initial commit: PowerRectify interactive simulator"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
git push -u origin main
```

### Step 2: Enable GitHub Pages in your GitHub Repository Settings

1. On GitHub, navigate to your repository.
2. Click on the **Settings** tab.
3. In the left sidebar, click on **Pages** (under the "Code and automation" section).
4. Under **Build and deployment** > **Source**, choose **GitHub Actions**.
5. Once selected, push a commit or go to the **Actions** tab and trigger the **Deploy to GitHub Pages** workflow.
6. Your website will be live in ~1-2 minutes at:
   ```
   https://<YOUR_GITHUB_USERNAME>.github.io/<YOUR_REPOSITORY_NAME>/
   ```

---

## 💻 Local Development

### Prerequisites
- Node.js (version 18 or 20+)
- npm

### Installation & Run

1. Clone or extract the project:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. Build for production:
   ```bash
   npm run build
   ```
   The production-ready static assets will be in the `dist/` directory.

4. Preview the production build locally:
   ```bash
   npm run preview
   ```

---

## 📐 Circuit Equations Reference

| Topology | Load | Theoretical Average Voltage $V_{dc}$ | Ripple Frequency |
| :--- | :--- | :--- | :--- |
| **1-Phase Half-Wave Diode** | R / RL + FWD | $V_{dc} = \frac{V_m}{\pi} \approx 0.318 V_m$ | $f$ |
| **1-Phase Half-Wave Thyristor** | R / RL + FWD | $V_{dc} = \frac{V_m}{2\pi}(1 + \cos\alpha)$ | $f$ |
| **1-Phase Full-Wave Diode** | R / RL | $V_{dc} = \frac{2V_m}{\pi} \approx 0.637 V_m$ | $2f$ |
| **1-Phase Full-Wave Thyristor** | RL (Continuous) | $V_{dc} = \frac{2V_m}{\pi}\cos\alpha$ | $2f$ |
| **1-Phase Full-Wave Thyristor** | RL + FWD | $V_{dc} = \frac{V_m}{\pi}(1 + \cos\alpha)$ | $2f$ |
| **3-Phase Half-Wave Diode (3-Pulse)** | R / RL | $V_{dc} = \frac{3\sqrt{3}V_m}{2\pi} \approx 0.827 V_m$ | $3f$ |
| **3-Phase Half-Wave Thyristor** | RL (Continuous) | $V_{dc} = \frac{3\sqrt{3}V_m}{2\pi}\cos\alpha$ | $3f$ |
| **3-Phase Full-Wave Diode (6-Pulse)** | R / RL | $V_{dc} = \frac{3\sqrt{3}V_m}{\pi} \approx 1.654 V_m \approx 1.35 V_{LL,rms}$ | $6f$ |
| **3-Phase Full-Wave Thyristor (6-Pulse)**| RL (Continuous) | $V_{dc} = \frac{3\sqrt{3}V_m}{\pi}\cos\alpha$ | $6f$ |

---

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Hosting / CI/CD**: GitHub Actions + GitHub Pages
