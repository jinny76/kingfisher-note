import axios from 'axios';
import noteModel from '../model/note';

const stt = async (audioFile, callback) => {
  const formData = new FormData();
  formData.append('file', audioFile);
  const response = await axios.post(
    noteModel.aiServer + 'v1/sound/stt',
    formData,
  );
  callback(response.data);
};

export default {
  stt,
};
