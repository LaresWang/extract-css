import path from "path";
import {checkFileIsExists, checkUrl, mkdir, checkVideoIsExists} from "./file";
import fs from "fs";
import { parseUniqueCode } from '@/utils/const';
import {remote} from "electron";
let configDir = path.join(remote.app.getPath('appData'), `${process.env.VUE_APP_ID}`);
let baseDir = path.join(configDir, 'files');
import request from 'request';

// 自动下载视频
export async function downloadVideo(file, self, fromMobile = false) {
  console.log('自动下载视频')
  let url = file.msgBody.fileId;
  let fileName = '';
  let arr = file.msgBody.fileId.split('.');
  let format = arr[arr.length - 1];
  fileName = file.reqId+'.'+format;
  let localPath = path.join(baseDir, fileName);
  if (checkUrl(url)) {
    mkdir(baseDir);
    const exists = await checkVideoIsExists(baseDir, fileName);
    if (exists) {
      /* if (fromMobile) {
        console.log('从手机转发的，聊天记录里---')
        // 从手机转发的，聊天记录里
        await download(file, url, path.join(baseDir, fileName), self);
        return;
      }*/
      console.log('有视频')
      file.msgBody.downloadPath = localPath;
      await updateMessageByMsgId(file);
      const { ipcRenderer } = require('electron');
      ipcRenderer.send('media-viewer', {
        msgType: file.msgType,
        item: file
      });
    }
    if (!exists) {
      console.log('没有哦')
      await download(file, url, path.join(baseDir, fileName), self, fromMobile);
    }
  }
}
// 自动下载
export async function download(fileItem, url, path, self) {
  // 下载
  const bakPath = path + '-bak';
  // 下载之前先清除历史数据
  if (checkFileIsExists(bakPath)) {
    fs.unlinkSync(bakPath);
  }
  let receivedBytes = 0;
  let totalBytes = 0;

  fileItem.msgBody.downloadLoading = true;
  await updateMessageByMsgId(fileItem);
  fileItem.msgBody.downloadPercent = 0;

  const req = await request({
    method: 'GET',
    url,
    strictSSL: false
  });
  req.pipe(fs.createWriteStream(path));
  req.on('response', data => {
    // 更新总文件字节大小
    totalBytes = parseInt(data.headers['content-length'], 10);
  });
  req.on('data', chunk => {
    // 更新下载的文件块字节大小
    receivedBytes += chunk.length;
    fileItem.msgBody.downloadPercent = Number(((receivedBytes / totalBytes) * 100).toFixed(0));
    self.$store.commit('CHAT_VIDEO_DOWNLOAD_PERCENT', {msId: fileItem.msgId, percent: fileItem.msgBody.downloadPercent});
    console.log('fileItem.msgBody.downloadPercent- ',fileItem.msgBody.downloadPercent)
    self.$forceUpdate();
  });
  req.on('error', async () => {
    fileItem.msgBody.downloadPercent = '';
    fileItem.msgBody.downloadFinished = false;
    fileItem.msgBody.downloadPath = '';
    fileItem.msgBody.downloadLoading = false;
    self.$store.commit('CHAT_VIDEO_DOWNLOAD_PERCENT', {msId: fileItem.msgId, percent: 0});
    await updateMessageByMsgId(fileItem);
    self.$forceUpdate();
  });
  req.on('end', async () => {
    fileItem.msgBody.downloadPercent = 100;
    fileItem.msgBody.downloadFinished = true;
    fileItem.msgBody.downloadPath = path;
    fileItem.msgBody.downloadLoading = false;
    self.$store.commit('CHAT_VIDEO_DOWNLOAD_PERCENT', {msId: fileItem.msgId, percent: 100});
    await updateMessageByMsgId(fileItem);
    // self.$forceUpdate();
  });
}
/** 根据MSG ID 更新消息 */
export async function updateMessageByMsgId(msgInfo) {
  let msgBody = msgInfo.msgBody;
  if (!msgInfo.msgId) {
    throw new Error('msgId不存在');
  }
  let id;
  if (msgInfo.uniqueCode) {
    id = parseUniqueCode(msgInfo.uniqueCode, msgInfo.targetType);
  } else {
    throw new Error('uniqueCode不存在');
  }
  let tableName = `m_${id}`;
  console.log('tableName- ',tableName)
  await window.vm
    .$knex(tableName)
    .where({
      msg_id: msgInfo.msgId
    })
    .update({
      msg_body: JSON.stringify(msgBody)
    });
  console.log('更改后的msgBody-- ',msgBody)
}