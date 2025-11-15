// Cross-browser compatibility
const browserAPI = (() => {
  if (typeof browser !== 'undefined') {
    return browser;
  }
  if (typeof chrome !== 'undefined') {
    return chrome;
  }
  throw new Error('Neither browser nor chrome API is available');
})();

// Debug mode
const DEBUG_MODE = false;
const debugLog = DEBUG_MODE ? console.log.bind(console) : () => {};

// DOM Elements
let redSlider, greenSlider, blueSlider;
let redValue, greenValue, blueValue;
let colorPreview, hexValue;
let addColorBtn, resetBtn;
let savedColorsList, noColorsMessage;
let presetColors;

// Current RGB values
let currentRed = 255;
let currentGreen = 0;
let currentBlue = 255;

// Preset color categories with extreme effects
const presetColorCategories = {
  metallic: [
    { color: '#FFD700', name: 'Gold' },
    { color: '#C0C0C0', name: 'Silver' },
    { color: '#CD7F32', name: 'Bronze' },
    { color: '#B87333', name: 'Copper' },
    { color: '#E5E4E2', name: 'Platinum' }
  ],
  superBright: [
    { color: '#FF0099', name: 'Hot Pink' },
    { color: '#00FF00', name: 'Lime Green' },
    { color: '#00FFFF', name: 'Cyan' },
    { color: '#FF00FF', name: 'Magenta' },
    { color: '#FFFF00', name: 'Yellow' }
  ],
  glow: [
    { color: '#39FF14', name: 'Neon Green' },
    { color: '#FF073A', name: 'Neon Red' },
    { color: '#FE4164', name: 'Neon Pink' },
    { color: '#08F7FE', name: 'Neon Blue' },
    { color: '#FFF01F', name: 'Neon Yellow' }
  ],
  standard: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F39C12', '#E74C3C', '#9B59B6', '#3498DB', '#1ABC9C',
    '#2ECC71', '#F1C40F', '#E67E22', '#FF90A0', '#A8E6CF'
  ]
};

// Initialize internationalization
function initializeI18n() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    const message = browserAPI.i18n.getMessage(key);
    if (message) {
      if (element.tagName === 'INPUT' && element.type === 'button') {
        element.value = message;
      } else if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
        element.placeholder = message;
      } else if (element.tagName === 'TITLE') {
        element.textContent = message;
      } else {
        element.textContent = message;
      }
    }
  });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
  initializeI18n();
  initializeDOMElements();
  setupEventListeners();
  await loadSavedColors();
  renderPresetColors();
  updateColorPreview();
});

// Initialize DOM element references
function initializeDOMElements() {
  redSlider = document.getElementById('redSlider');
  greenSlider = document.getElementById('greenSlider');
  blueSlider = document.getElementById('blueSlider');
  
  redValue = document.getElementById('redValue');
  greenValue = document.getElementById('greenValue');
  blueValue = document.getElementById('blueValue');
  
  colorPreview = document.getElementById('colorPreview');
  hexValue = document.getElementById('hexValue');
  
  addColorBtn = document.getElementById('addColorBtn');
  resetBtn = document.getElementById('resetBtn');
  
  savedColorsList = document.getElementById('savedColorsList');
  noColorsMessage = document.getElementById('noColorsMessage');
  
  presetColors = document.getElementById('presetColors');
}

// Setup event listeners
function setupEventListeners() {
  redSlider.addEventListener('input', handleRedSlider);
  greenSlider.addEventListener('input', handleGreenSlider);
  blueSlider.addEventListener('input', handleBlueSlider);
  
  addColorBtn.addEventListener('click', handleAddColor);
  resetBtn.addEventListener('click', handleReset);
}

// Handle red slider change
function handleRedSlider() {
  currentRed = parseInt(redSlider.value);
  redValue.textContent = currentRed;
  updateColorPreview();
}

// Handle green slider change
function handleGreenSlider() {
  currentGreen = parseInt(greenSlider.value);
  greenValue.textContent = currentGreen;
  updateColorPreview();
}

// Handle blue slider change
function handleBlueSlider() {
  currentBlue = parseInt(blueSlider.value);
  blueValue.textContent = currentBlue;
  updateColorPreview();
}

// Update color preview
function updateColorPreview() {
  const color = rgbToHex(currentRed, currentGreen, currentBlue);
  colorPreview.style.backgroundColor = color;
  colorPreview.style.boxShadow = `
    0 0 40px ${color},
    0 0 80px ${color},
    0 0 120px ${color}40,
    inset 0 0 30px rgba(255, 255, 255, 0.2)
  `;
  hexValue.textContent = color;
  hexValue.style.color = color;
  hexValue.style.textShadow = `0 0 15px ${color}`;
}

// Convert RGB to hex
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

// Convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Handle add color button
async function handleAddColor() {
  const color = rgbToHex(currentRed, currentGreen, currentBlue);
  
  try {
    const response = await browserAPI.runtime.sendMessage({
      action: 'addColor',
      color: color
    });
    
    if (response && response.success) {
      debugLog('Color added successfully:', color);
      await loadSavedColors();
      
      // Show success feedback
      addColorBtn.textContent = '✓ Added!';
      addColorBtn.style.background = 'linear-gradient(135deg, #00ff00 0%, #00cc00 100%)';
      
      setTimeout(() => {
        addColorBtn.textContent = browserAPI.i18n.getMessage('addColorButton') || 'Add This Color';
        addColorBtn.style.background = 'linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)';
      }, 1500);
    }
  } catch (error) {
    debugLog('Error adding color:', error);
  }
}

// Handle reset button
function handleReset() {
  currentRed = 255;
  currentGreen = 0;
  currentBlue = 255;
  
  redSlider.value = currentRed;
  greenSlider.value = currentGreen;
  blueSlider.value = currentBlue;
  
  redValue.textContent = currentRed;
  greenValue.textContent = currentGreen;
  blueValue.textContent = currentBlue;
  
  updateColorPreview();
}

// Load saved custom colors
async function loadSavedColors() {
  try {
    const result = await browserAPI.storage.local.get(['customColors']);
    const customColors = result.customColors || [];
    
    debugLog('Loaded custom colors:', customColors);
    
    if (customColors.length === 0) {
      savedColorsList.innerHTML = '';
      noColorsMessage.style.display = 'block';
    } else {
      noColorsMessage.style.display = 'none';
      renderSavedColors(customColors);
    }
  } catch (error) {
    debugLog('Error loading saved colors:', error);
  }
}

// Render saved colors
function renderSavedColors(colors) {
  savedColorsList.innerHTML = '';
  
  colors.forEach((colorInfo, index) => {
    const colorItem = document.createElement('div');
    colorItem.className = 'saved-color-item';
    colorItem.style.backgroundColor = colorInfo.color;
    colorItem.style.boxShadow = `
      0 0 20px ${colorInfo.color},
      0 0 40px ${colorInfo.color}80
    `;
    
    // Add color number
    const colorNumber = document.createElement('div');
    colorNumber.className = 'saved-color-number';
    colorNumber.textContent = `#${colorInfo.colorNumber || index + 1}`;
    colorItem.appendChild(colorNumber);
    
    // Add delete button
    const deleteBtn = document.createElement('div');
    deleteBtn.className = 'delete-saved-color';
    deleteBtn.textContent = '×';
    deleteBtn.title = 'Delete this color';
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await deleteCustomColor(colorInfo.id);
    });
    colorItem.appendChild(deleteBtn);
    
    // Click to select color
    colorItem.addEventListener('click', () => {
      const rgb = hexToRgb(colorInfo.color);
      if (rgb) {
        currentRed = rgb.r;
        currentGreen = rgb.g;
        currentBlue = rgb.b;
        
        redSlider.value = currentRed;
        greenSlider.value = currentGreen;
        blueSlider.value = currentBlue;
        
        redValue.textContent = currentRed;
        greenValue.textContent = currentGreen;
        blueValue.textContent = currentBlue;
        
        updateColorPreview();
      }
    });
    
    savedColorsList.appendChild(colorItem);
  });
}

// Delete a custom color
async function deleteCustomColor(colorId) {
  try {
    const result = await browserAPI.storage.local.get(['customColors']);
    let customColors = result.customColors || [];
    
    // Remove the color with matching id
    customColors = customColors.filter(c => c.id !== colorId);
    
    // Update storage
    await browserAPI.storage.local.set({ customColors });
    
    debugLog('Deleted color:', colorId);
    
    // Reload saved colors
    await loadSavedColors();
    
    // Notify background script to update context menus and broadcast to tabs
    await browserAPI.runtime.sendMessage({
      action: 'customColorsUpdated'
    });
  } catch (error) {
    debugLog('Error deleting color:', error);
  }
}

// Render preset colors
function renderPresetColors() {
  presetColors.innerHTML = '';
  
  // Render metallic colors
  presetColorCategories.metallic.forEach(({ color, name }) => {
    const colorItem = createPresetColorItem(color, name, 'metallic');
    presetColors.appendChild(colorItem);
  });
  
  // Render super bright colors
  presetColorCategories.superBright.forEach(({ color, name }) => {
    const colorItem = createPresetColorItem(color, name, 'bright');
    presetColors.appendChild(colorItem);
  });
  
  // Render glow colors
  presetColorCategories.glow.forEach(({ color, name }) => {
    const colorItem = createPresetColorItem(color, name, 'glow');
    presetColors.appendChild(colorItem);
  });
  
  // Render standard colors
  presetColorCategories.standard.forEach(color => {
    const colorItem = createPresetColorItem(color, '', 'standard');
    presetColors.appendChild(colorItem);
  });
}

// Create a preset color item
function createPresetColorItem(color, name, category) {
  const colorItem = document.createElement('div');
  colorItem.className = `preset-color-item ${category}`;
  colorItem.style.backgroundColor = color;
  
  if (name) {
    colorItem.title = name;
  }
  
  // Add click handler to add this color
  colorItem.addEventListener('click', async () => {
    try {
      const response = await browserAPI.runtime.sendMessage({
        action: 'addColor',
        color: color
      });
      
      if (response && response.success) {
        debugLog('Preset color added:', color);
        await loadSavedColors();
        
        // Visual feedback
        colorItem.style.transform = 'scale(1.3) rotate(360deg)';
        setTimeout(() => {
          colorItem.style.transform = '';
        }, 500);
      }
    } catch (error) {
      debugLog('Error adding preset color:', error);
    }
  });
  
  return colorItem;
}
