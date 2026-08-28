# Chroma WCAG Engine

Deterministic color palette generation paired with real-time WCAG relative luminance validation.

---

## Overview

Design systems often struggle with accessible contrast ratios. `chroma-wcag-engine` addresses this by generating five-slot hex palettes while running concurrent WCAG 2.1 relative luminance math on individual colors and dedicated sample pairs. 

It operates completely client-side. Every hex change recalculates dynamic contrast scores across dark and light surfaces, letting you lock preferred tokens while mutating unlocked slots on the fly.

---

## How It Works

The engine computes relative luminance ($L$) for any 6-character hex code using the standard WCAG algorithm:

1. Standardizes hex values into RGB floating points between `0.0` and `1.0`.
2. Applies sRGB gamma decompression:
   $$V_{linear} = \begin{cases} \frac{V_{srgb}}{12.92}, & V_{srgb} \le 0.03928 \\ \left(\frac{V_{srgb} + 0.055}{1.055}\right)^{2.4}, & V_{srgb} > 0.03928 \end{cases}$$
3. Calculates coefficients for spectral sensitivity:
   $$L = 0.2126 \cdot R + 0.7152 \cdot G + 0.0722 \cdot B$$
4. Evaluates the ratio between brightest ($L_1$) and darkest ($L_2$) colors:
   $$\text{Ratio} = \frac{L_1 + 0.05}{L_2 + 0.05}$$

---

## Key Features

* **Stateful Slot Locking:** Lock specific color slots using internal state arrays while randomizing remaining values.
* **Live Hex Input Synced UI:** Type directly into card fields or pickers; calculations update immediately.
* **Automated Ratio Verification:** Real-time ratio outputs targeting AA (4.5:1) and AAA (7.0:1) WCAG thresholds.
* **Clipboard Interaction:** Quick copy handlers targeting system clipboard APIs.
* **Keyboard Hotkeys:** Global listener handling spacebar events with input field guard conditions.

---

## Tech Stack

* **HTML5:** Structural DOM layout with form controls, color pickers, and accessibility tags.
* **Vanilla CSS:** Custom properties, grid layout patterns, and responsive media queries.
* **JavaScript (ES6+):** Pure function math calculations, array mutation tracking, and DOM event handling.

---

## Web-Based Quick Start

You don't need a local terminal or node runtime to run or modify this project.

### Option 1: GitHub Codespaces (In-Browser)

1. Press `.` on your keyboard inside this repository (or change `.com` to `.dev` in the URL) to open GitHub Web Editor.
2. Alternatively, click **Code** > **Codespaces** > **Create codespace on main**.
3. Install the **Live Server** extension in the browser editor.
4. Right-click `index.html` and select **Open with Live Server**.

### Option 2: Local Execution

```bash
git clone [https://github.com/your-username/chroma-wcag-engine.git](https://github.com/your-username/chroma-wcag-engine.git)
cd chroma-wcag-engine
open index.html
```

## Project Structure

```text
chroma-wcag-engine/
├── .github/
│   └── workflows/
│       └── health-check.yml   # Linter and validation automation pipeline
├── .gitignore                 # Exclusion rules for local OS/editor files
├── LICENSE                    # MIT open-source license permissions
├── README.md                  # System architecture and user documentation
├── index.html                 # UI structure and WCAG score layout
├── script.js                  # Luminance logic, state management, event listeners
└── style.css                  # Custom properties, grid layouts, theme styles
```

## Roadmap

[ ] Add option to export palettes to Tailwind config files or CSS root variables.

[ ] Support APCA (Advanced Perceptual Contrast Algorithm) scoring alongside WCAG 2.1.

[ ] Implement color blindness simulation previews (Protanopia, Deuteranopia, Tritanopia).

```text"Accessibility is not a feature to be added; it is an inherent quality of well-crafted software."```
