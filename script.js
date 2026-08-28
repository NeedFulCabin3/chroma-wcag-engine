// State structure to track locks and active colors
const palette = [
  { hex: '#FF5733', locked: false },
  { hex: '#33FF57', locked: false },
  { hex: '#3357FF', locked: false },
  { hex: '#F3FF33', locked: false },
  { hex: '#FF33F3', locked: false }
];

// Helper to generate a random hex color
function getRandomHex() {
  const chars = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += chars[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Convert Hex to Relative Luminance (WCAG Formula)
function getLuminance(hex) {
  let cleanHex = hex.replace('#', '');
  
  // Handle shorthand hex like #fff
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(char => char + char).join('');
  }

  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map(v => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Calculate contrast ratio between two hexes
function getContrastRatio(hex1, hex2) {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Check contrast against white and black to decide text color readability on the card itself
function getIdealTextColor(bgHex) {
  const ratioWithWhite = getContrastRatio(bgHex, '#FFFFFF');
  const ratioWithBlack = getContrastRatio(bgHex, '#000000');
  return ratioWithWhite > ratioWithBlack ? '#FFFFFF' : '#000000';
}

// Generate new palette values for unlocked slots
function generatePalette() {
  palette.forEach(color => {
    if (!color.locked) {
      color.hex = getRandomHex();
    }
  });
  updateUI();
}

// Update DOM elements representing the active palette
function updateUI() {
  palette.forEach((color, index) => {
    const card = document.getElementById(`color-${index}`);
    const preview = card.querySelector('.color-preview');
    const input = card.querySelector('.hex-input');
    const lockBtn = card.querySelector('.lock-btn');
    const contrastBadge = card.querySelector('.contrast-badge');

    // Apply color values
    preview.style.backgroundColor = color.hex;
    input.value = color.hex.toUpperCase();

    // Dynamically show internal text/button contrast compatibility 
    const idealText = getIdealTextColor(color.hex);
    contrastBadge.textContent = `Contrast: ${getContrastRatio(color.hex, '#121212').toFixed(1)}:1`;

    // Render lock states
    lockBtn.textContent = color.locked ? '🔒' : '🔓';
    lockBtn.style.background = color.locked ? '#4b5563' : '#2a2a2a';
  });
}

// Contrast Checker Tool Logic
function runContrastChecker() {
  const bgHex = document.getElementById('bg-hex').value;
  const textHex = document.getElementById('text-hex').value;

  const bgPicker = document.getElementById('bg-picker');
  const textPicker = document.getElementById('text-picker');
  const previewBox = document.getElementById('preview-box');
  const ratioVal = document.getElementById('ratio-val');
  const aaNormal = document.getElementById('aa-normal');
  const aaaLarge = document.getElementById('aaa-large');

  // Validate hex strings before running calculations
  const hexRegex = /^#[0-9A-F]{6}$/i;
  if (!hexRegex.test(bgHex) || !hexRegex.test(textHex)) return;

  // Sync picked states
  bgPicker.value = bgHex;
  textPicker.value = textHex;

  // Apply visual style preview
  previewBox.style.backgroundColor = bgHex;
  previewBox.style.color = textHex;

  // Contrast Math
  const ratio = getContrastRatio(bgHex, textHex);
  ratioVal.textContent = `${ratio.toFixed(2)}:1`;

  // Apply WCAG status tags
  // Normal text (AA limit: 4.5:1)
  if (ratio >= 4.5) {
    aaNormal.textContent = 'Pass';
    aaNormal.className = 'badge pass';
  } else {
    aaNormal.textContent = 'Fail';
    aaNormal.className = 'badge fail';
  }

  // Large text (AAA limit: 4.5:1, Normal AAA: 7:1)
  if (ratio >= 7.0) {
    aaaLarge.textContent = 'Pass';
    aaaLarge.className = 'badge pass';
  } else {
    aaaLarge.textContent = 'Fail';
    aaaLarge.className = 'badge fail';
  }
}

// Event Listeners for Palette Cards
palette.forEach((color, index) => {
  const card = document.getElementById(`color-${index}`);
  const input = card.querySelector('.hex-input');
  const lockBtn = card.querySelector('.lock-btn');
  const copyBtn = card.querySelector('.copy-btn');

  // Manual hex typing changes color dynamically
  input.addEventListener('input', (e) => {
    let val = e.target.value;
    if (val.length === 7 && val.startsWith('#')) {
      color.hex = val;
      card.querySelector('.color-preview').style.backgroundColor = val;
      updateUI();
    }
  });

  // Toggle dynamic color state locks
  lockBtn.addEventListener('click', () => {
    color.locked = !color.locked;
    updateUI();
  });

  // Clipboard copies
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(color.hex).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = 'Copy', 1000);
    });
  });
});

// Event Listeners for Contrast Calculator Inputs
const checkerInputs = [
  { text: 'bg-hex', picker: 'bg-picker' },
  { text: 'text-hex', picker: 'text-picker' }
];

checkerInputs.forEach(group => {
  const textEl = document.getElementById(group.text);
  const pickerEl = document.getElementById(group.picker);

  textEl.addEventListener('input', (e) => {
    if (e.target.value.length === 7) {
      runContrastChecker();
    }
  });

  pickerEl.addEventListener('input', (e) => {
    textEl.value = e.target.value.toUpperCase();
    runContrastChecker();
  });
});

// Spacebar triggers generator hook
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    // Avoid firing when user is typing in forms
    if (document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      generatePalette();
    }
  }
});

document.getElementById('generate-btn').addEventListener('click', generatePalette);

// Initial App Boot
generatePalette();
runContrastChecker();