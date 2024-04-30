import {ref, watch} from 'vue';
import hotkeys from 'hotkeys-js';

function registerKeys(key, handler, option) {
  hotkeys(key, option, handler);
}

const lastKeys = ref('');

const lastShortcut = ref('');

let keysProcessors = {};

let hotkeyProcessors = {};

let keysDescription = {};

let hotkeyDescription = {};

const cleanKeys = function() {
  lastKeys.value = '';
};

const cleanShortcut = function() {
  lastShortcut.value = '';
};

let cleanKeyTimer = null;
let cleanShortcutTimer = null;

let initFlag = false;

const storeKey = function(key) {
  lastKeys.value += key;

  if (cleanKeyTimer) {
    clearTimeout(cleanKeyTimer);
  }
  cleanKeyTimer = setTimeout(cleanKeys, 500);
};

const registerKeysProcessor = function(key, handler, description) {
  if (keysProcessors[key] == null) {
    keysProcessors[key] = handler;
    keysDescription[key] = description;
  } else {
    console.error(`按键系列'${key}'已经被注册了.`);
  }
};

const registerHotkeyProcessor = function(key, processor, description, option) {
  //check system is mac, replace the key, ctrl as command, and alt as option
  if (navigator.userAgent.indexOf('Mac OS X') !== -1) {
    key = key.replace('ctrl', 'command').replace('alt', 'option');
  }

  if (hotkeyProcessors[key] == null || option) {
    hotkeyProcessors[key] = 'true';
    hotkeyDescription[key] = description;
    registerKeys(key, (event, handler) => {
      lastShortcut.value = key;
      if (cleanShortcutTimer) {
        clearTimeout(cleanShortcutTimer);
      }
      cleanShortcutTimer = setTimeout(cleanShortcut, 500);
      if (processor) {
        processor(event, handler);
      }
    }, option);
  } else {
    console.error(`按键系列'${key}'已经被注册了.`);
  }
};

const init = function() {
  hotkeys.filter = function(event) {
    let tag = event.target || event.srcElement;
    let tagName = tag.tagName;
    return !((tag.isContentEditable ||
            tagName === 'INPUT' ||
            tagName === 'SELECT' ||
            tagName === 'TEXTAREA') &&
        (tag.className.indexOf('monaco-mouse-cursor-text') === -1 ||
            !event.ctrlKey));
  };

  if (!initFlag) {
    initFlag = true;
    let chars = [
      ...Array.apply(null, {length: 26}).map(function(x, i) {
        return String.fromCharCode(97 + i);
      }), '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    chars.forEach(c => registerKeys(c, (event, handler) => storeKey(c)));
  } else {
    keysProcessors = {};
    hotkeyProcessors = {};
    lastKeys.value = '';
  }

  watch(lastKeys, (newValue, oldValue) => {
    let processor = keysProcessors[lastKeys.value];
    if (processor) {
      processor();
    }
  });
};

export default {
  lastKeys,
  lastShortcut,
  init,
  registerKeysProcessor,
  registerHotkeyProcessor,
  keysDescription: {
    keys: keysDescription,
    hotkeys: hotkeyDescription,
  },
};
