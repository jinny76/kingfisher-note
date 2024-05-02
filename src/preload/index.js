import {contextBridge} from 'electron';
import {electronAPI} from '@electron-toolkit/preload';
import fs from 'fs';

// Custom APIs for renderer
const api = {};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}

let recorder;
let type;

electronAPI.ipcRenderer.on('/client/record-stop', async (event, params) => {
  if (recorder) {
    recorder.stop();
    recorder = null;
    return {
      code: 200, message: '录制完成',
    };
  } else {
    return {
      code: 500, message: '未找到录制器',
    };
  }
});

electronAPI.ipcRenderer.on('/client/record-start', async (event, params) => {
  type = params.type;
  if (params.type === 'video') {
    const videoSource = await navigator.mediaDevices.getUserMedia({
      audio: false, video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: params.mediaSourceId,
        },
      },
    });

    const audioSource = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'desktop',
        },
      }, video: {
        mandatory: {
          chromeMediaSource: 'desktop',
        },
      },
    });
    (audioSource.getVideoTracks() || []).forEach(
        track => audioSource.removeTrack(track));

    let combinedSource = new MediaStream(
        [...audioSource.getAudioTracks(), ...videoSource.getVideoTracks()]);
    recorder = new MediaRecorder(combinedSource, {
      mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 1.5e6,
    });
  } else {
    const audioSource = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'desktop',
        },
      }, video: {
        mandatory: {
          chromeMediaSource: 'desktop',
        },
      },
    });
    (audioSource.getVideoTracks() || []).forEach(
        track => audioSource.removeTrack(track));

    let combinedSource = new MediaStream([...audioSource.getAudioTracks()]);
    recorder = new MediaRecorder(combinedSource, {
      mimeType: 'audio/webm', audioBitsPerSecond: 128000,
    });
  }

  const timeslice = 5000;
  const fileBits = [];

  recorder.ondataavailable = (event) => {
    fileBits.push(event.data);
  };

  recorder.onstop = () => {
    let file;
    if (type === 'video') {
      file = new Blob(fileBits, {type: 'video/webm;codecs=vp9'});
    } else if (type === 'audio') {
      file = new Blob(fileBits, {type: 'audio/webm'});
    }
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onload = () => {
      const buffer = Buffer.from(fileReader.result);
      const fileName = params.fileName;
      fs.writeFileSync(fileName, buffer);
      electronAPI.ipcRenderer.invoke('/record/save', {
        fileName, type,
      });
    };
  };

  if (timeslice === 0) {
    recorder.start();
  } else {
    recorder.start(timeslice);
  }
});
