import {createApp} from 'vue';
import Dialog from './dialog.vue';

export default ({title, width, component, onCancel, onConfirm}) => {
  const mountNode = document.createElement('div');

  const instance = createApp(Dialog, {
    title, width, modelValue: true, component: component, onCancel: () => {
      instance.unmount(mountNode);
      document.body.removeChild(mountNode);
      onCancel && onCancel();
    }, onConfirm: async () => {
      if (onConfirm) {
        await onConfirm();
      }
      instance.unmount(mountNode);
      document.body.removeChild(mountNode);
    },
  });

  document.body.appendChild(mountNode);
  Object.values(window.kfApp._context.components).map(comp => {
    instance.component(comp.name, comp);
  });
  instance.mount(mountNode);

  instance.showLoading = () => {
    instance._instance.exposed.showLoading();
  };

  instance.hideLoading = () => {
    instance._instance.exposed.hideLoading();
  };

  return instance;
}
