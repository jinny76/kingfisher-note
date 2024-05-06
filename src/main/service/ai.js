import {ipcMain} from 'electron';
import fs from 'fs';
import storeService from './store';
import axios from 'axios';
import OpenAI from 'openai';

const aiServer = 'https://ai.kingfisher.live/aiapi/';

const openaiServer = 'https://api.moonshot.cn/v1';
const openaiKey = 'sk-oPDHAkwRsZF6oVl3Tb3fRWUs8sFdDa6E0tLFlIstzlqtQCbs';

const install = () => {
  ipcMain.handle('/ai/stt', async (event, params) => {
    console.log(params);
    if (!fs.existsSync(storeService.setting.assetsDir + '/' + params)) {
      return {code: 404, message: '文件不存在'};
    }

    const formData = new FormData();
    formData.append('file',
        fs.createReadStream(storeService.setting.assetsDir + '/' + params));
    await axios.post(aiServer + 'v1/sound/stt', formData);
  });

  ipcMain.handle('/ai/analysisSubtitle', async (event, params) => {
    let path = JSON.parse(params).fileName;

    if (!fs.existsSync(path)) {
      path = storeService.setting.assetsDir + '/' + path;
    }

    if (!fs.existsSync(path)) {
      return {code: 404, message: '文件不存在'};
    } else {
      let contentSubtitle = '';
      if (path.endsWith('.bilibili.json')) {
        let fileContent = fs.readFileSync(path);
        let json = JSON.parse(fileContent);
        if (json && json.body) {
          json.body.map((item) => {
            contentSubtitle += item.content + '\n';
          });
        }
      } else if (path.endsWith('.ass')) {
        //read all content from aas file
        let content = fs.readFileSync(path, 'utf-8');
        let lines = content.toString().split('\n');
        lines.map(line => {
          if (line.startsWith('Dialogue:')) {
            let linePart = line.split(',');
            contentSubtitle += linePart[linePart.length - 1] + '\n';
          }
        });
      }

      if (import.meta.env.DEV && contentSubtitle.length > 1000) { // 限制字幕长度
        contentSubtitle = contentSubtitle.substring(0, 1000);
      }

      if (contentSubtitle) {
        const client = new OpenAI({
          baseURL: openaiServer, apiKey: openaiKey,
        });

        const completion = await client.chat.completions.create({
          model: 'moonshot-v1-128k', messages: [
            {
              role: 'system',
              content: '你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。',
            }, {
              role: 'user',
              content: `以下时一段视频的字幕内容, 请为我生成视频的学习笔记，需要是Markdown格式的。字幕内容是：\n${contentSubtitle}`,
            }], temperature: 0.3,
        });
        console.log(completion.choices[0].message.content);
        return {
          code: 200,
          message: '生成成功',
          data: completion.choices[0].message.content,
        };
      }
    }
  });

  console.log('注册AI服务');
};

export default {
  install,
};
