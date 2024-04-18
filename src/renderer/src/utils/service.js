const invoke = (service, params, callback) => {
  console.log("发送请求", service, params);
  try {
    window.electron.ipcRenderer.invoke(service, params).then((result) => {
      console.log("请求结果", result);
      callback && callback(result);
    });
  } catch (e) { }
}

const send = (command, params) => {
  console.log("发送请求", command, params);
  window.electron.ipcRenderer.send(command, params)
}

export default {
  invoke, send
}
