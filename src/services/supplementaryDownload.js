import fs from 'fs'
import path from 'path'
import request from 'request';
import { remote } from 'electron'

const fse = require('fs-extra')

// const appName = require('../../package.json').name;

const downloadSDK = async () => {
  let receivedBytes = 0;
  let totalBytes = 0;
  const downloadPath = path.join(remote.app.getAppPath(), `../ffmpeg/mac/`)
  await fse.ensureDir(downloadPath)
  fse.writeFileSync(path.join(downloadPath, 'test.txt'), 'dsdsdsdsd');
  console.log('----------------',downloadPath, '----------------')
  const req = await request({
    method: 'GET',
    url: 'https://didisit.oss-cn-hongkong.aliyuncs.com/other/ffmpeg/ffmpeg-mac',
    strictSSL: false
  });
  req.pipe(fs.createWriteStream(path.join(downloadPath, 'ffmpeg-mac')));
  req.on('response', data => {
    // 更新总文件字节大小
    totalBytes = parseInt(data.headers['content-length'], 10);
    console.log('下载总大小', totalBytes)
  });
  req.on('data', chunk => {
    // 更新下载的文件块字节大小
    receivedBytes += chunk.length;
    console.log(Number(((receivedBytes / totalBytes) * 100).toFixed(0)));
  });
  req.on('error', async (error) => {
    console.log(error)
  });
  req.on('end', async () => {
    console.log('sdk download end')
    console.log('下载地址： ----------------',downloadPath, '----------------')
    fse.fchmodSync(path.join(downloadPath, 'ffmpeg-mac'), '0755')
  });
}

export default downloadSDK;
