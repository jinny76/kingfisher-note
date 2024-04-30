const invoke = (service, params, callback, fail) => {
  console.log('发送请求', service, params);
  try {
    window.electron.ipcRenderer.invoke(service, params).then(result => {
      console.log('请求结果', result);
      callback && callback(result);
    }).catch(e => {
      console.error(e);
      fail && fail(e);
    });
  } catch (e) {
    console.error(e);
    fail && fail(e);
  }
};

const send = (command, params) => {
  console.log('发送请求', command, params);
  window.electron.ipcRenderer.send(command, params);
};

export default {
  invoke, send,
};
