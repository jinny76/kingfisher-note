import bible from './bible.vue';
import {ref} from 'vue';

export const plugins = [];

export const registerPlugin = (plugin) => {
  plugins.push(plugin);
  window.kfApp.component(plugin.name, plugin);
};

export const handleEvent = (event, cb) => {
  plugins.forEach(widget => {
    if (widget.handleEvent) {
      widget.handleEvent(event, cb);
    }
  });
};

export const initPlugins = () => {
  registerPlugin(bible);
}
