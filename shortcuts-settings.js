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

function getMessage(key, substitutions = null) {
  return browserAPI.i18n.getMessage(key, substitutions);
}

// Apply localization to all elements with data-i18n attribute
function applyLocalization() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    const message = getMessage(key);
    if (message) {
      // For HTML content that includes <br/> and <strong> tags
      if (element.innerHTML.includes('<br')) {
        element.innerHTML = message;
      } else {
        element.textContent = message;
      }
    }
  });
}

// Color definitions matching background.js
const COLORS = [
  { id: 'yellow', nameKey: 'yellowColor', color: '#FFFF00', commandName: 'highlight_yellow' },
  { id: 'green', nameKey: 'greenColor', color: '#AAFFAA', commandName: 'highlight_green' },
  { id: 'blue', nameKey: 'blueColor', color: '#AAAAFF', commandName: 'highlight_blue' },
  { id: 'pink', nameKey: 'pinkColor', color: '#FFAAFF', commandName: 'highlight_pink' },
  { id: 'orange', nameKey: 'orangeColor', color: '#FFAA55', commandName: 'highlight_orange' }
];

const CUSTOM_COMMANDS = [
  { slot: 1, nameKey: 'highlightWithCustom1', commandName: 'highlight_custom_1' },
  { slot: 2, nameKey: 'highlightWithCustom2', commandName: 'highlight_custom_2' },
  { slot: 3, nameKey: 'highlightWithCustom3', commandName: 'highlight_custom_3' },
  { slot: 4, nameKey: 'highlightWithCustom4', commandName: 'highlight_custom_4' },
  { slot: 5, nameKey: 'highlightWithCustom5', commandName: 'highlight_custom_5' }
];

// Detect browser
const isFirefox = typeof browser !== 'undefined' && typeof browser.runtime !== 'undefined';
const isChrome = typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined' && !isFirefox;

// Display shortcuts list
async function displayShortcuts() {
  const shortcutsList = document.getElementById('shortcuts-list');
  shortcutsList.innerHTML = '';

  try {
    // Get all commands
    const commands = await browserAPI.commands.getAll();
    
    // Get custom colors to show which slots are in use
    const result = await browserAPI.storage.local.get(['customColors']);
    const customColors = result.customColors || [];
    
    // Create shortcut items for each default color
    COLORS.forEach(color => {
      const command = commands.find(cmd => cmd.name === color.commandName);
      const shortcutItem = document.createElement('div');
      shortcutItem.className = 'shortcut-item';
      
      const label = document.createElement('div');
      label.className = 'shortcut-label';
      label.textContent = getMessage(color.nameKey);
      
      const value = document.createElement('div');
      value.className = 'shortcut-value';
      if (command && command.shortcut) {
        value.textContent = command.shortcut;
      } else {
        value.textContent = getMessage('notSet') || 'Not set';
        value.classList.add('not-set');
      }
      
      shortcutItem.appendChild(label);
      shortcutItem.appendChild(value);
      shortcutsList.appendChild(shortcutItem);
    });
    
    // Add section header for custom colors if any exist
    if (customColors.length > 0) {
      const sectionHeader = document.createElement('div');
      sectionHeader.style.marginTop = '20px';
      sectionHeader.style.marginBottom = '10px';
      sectionHeader.style.fontWeight = 'bold';
      sectionHeader.style.fontSize = '16px';
      sectionHeader.textContent = 'Custom Colors';
      shortcutsList.appendChild(sectionHeader);
    }
    
    // Create shortcut items for custom color slots
    CUSTOM_COMMANDS.forEach((customCmd, index) => {
      const customColor = customColors[index];
      
      // Only show slot if there's a custom color or if previous slots are filled
      if (!customColor && index > 0 && !customColors[index - 1]) {
        return; // Skip empty slots after the first empty one
      }
      
      const command = commands.find(cmd => cmd.name === customCmd.commandName);
      const shortcutItem = document.createElement('div');
      shortcutItem.className = 'shortcut-item';
      
      const label = document.createElement('div');
      label.className = 'shortcut-label';
      
      if (customColor) {
        // Show color preview for assigned custom colors
        const colorPreview = document.createElement('span');
        colorPreview.style.display = 'inline-block';
        colorPreview.style.width = '20px';
        colorPreview.style.height = '20px';
        colorPreview.style.backgroundColor = customColor.color;
        colorPreview.style.border = '1px solid #999';
        colorPreview.style.borderRadius = '3px';
        colorPreview.style.marginRight = '8px';
        colorPreview.style.verticalAlign = 'middle';
        label.appendChild(colorPreview);
        label.appendChild(document.createTextNode(`Custom Color ${customCmd.slot}`));
      } else {
        label.textContent = getMessage(customCmd.nameKey);
        label.style.color = '#999';
        label.style.fontStyle = 'italic';
      }
      
      const value = document.createElement('div');
      value.className = 'shortcut-value';
      if (command && command.shortcut) {
        value.textContent = command.shortcut;
      } else {
        value.textContent = getMessage('notSet') || 'Not set';
        value.classList.add('not-set');
      }
      
      shortcutItem.appendChild(label);
      shortcutItem.appendChild(value);
      shortcutsList.appendChild(shortcutItem);
    });
  } catch (error) {
    console.error('Error loading shortcuts:', error);
    shortcutsList.innerHTML = '<p>Error loading shortcuts. Please try again.</p>';
  }
}

// Initialize the page
async function init() {
  // Apply localization
  applyLocalization();
  
  // Display appropriate info box based on browser
  if (isChrome) {
    document.getElementById('chrome-info').style.display = 'block';
    document.getElementById('open-shortcuts').style.display = 'inline-block';
    
    // Check if chrome.commands.update is available (Chrome 117+)
    if (!browserAPI.commands.update) {
      document.getElementById('update-notice').style.display = 'block';
    }
  } else if (isFirefox) {
    document.getElementById('firefox-info').style.display = 'block';
  }
  
  // Display shortcuts
  await displayShortcuts();
}

// Open Chrome shortcuts page (only works in Chrome)
document.getElementById('open-shortcuts').addEventListener('click', () => {
  if (isChrome) {
    browserAPI.tabs.create({ url: 'chrome://extensions/shortcuts' });
  }
});

// Back button
document.getElementById('back-button').addEventListener('click', () => {
  window.close();
});

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
