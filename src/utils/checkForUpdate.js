import fs from "fs";
import path from 'path';
import {check_update_by_server} from "@/server";
import store from "@/store";
import {NOTIFY_UPDATE_VERSION} from "@/store/types";
const { ipcRenderer, remote } = require('electron');

let configDir = path.join(remote.app.getPath('appData'), `${process.env.VUE_APP_ID}`);

export function check_for_update(appVersionCode, cb) {
  // 开始检查
  ipcRenderer.send('checkForUpdate');
  let fn = async (event, obj) => {
    if (obj.action === 'updateAva') {
      const updateInfo = await check_update_by_server({
        currentVersion: appVersionCode
      });
      // console.log('接口检查更新', updateInfo);
      if (!updateInfo.data) {
        // 没有数据
        deleteFile();
        await store.dispatch(NOTIFY_UPDATE_VERSION, false);
        return;
      }

      // 读取文件
      if (fs.existsSync(`${configDir}/update.json`) && !updateInfo.data.forceUpgrade) {
        // 存在文件，且从后台获取的版本为非强制更新，先判断版本是否一样
        let data = JSON.parse(fs.readFileSync(`${configDir}/update.json`, 'utf-8'));
        if (updateInfo.data.versionCode !== data.version) {
          // 说明版本不一样咯
          cb && cb(updateInfo, obj);
          ipcRenderer.removeListener('updateMessage', fn);
        }
      } else {
        // 不存在文件，说明第一次获取到更新的数据
        cb && cb(updateInfo, obj);
        ipcRenderer.removeListener('updateMessage', fn);
      }
    }
  }
  // 添加自动更新事件的监听
  ipcRenderer.on('updateMessage', fn);
}

// 写文件
export function writeFile(version) {
  // 版本不一样
  let obj = {
    // 更新版本号
    "version": version,
    // 是否忽略
    "isIgnore": true
  };
  fs.writeFileSync(`${configDir}/update.json`, JSON.stringify(obj));
}

// 删除文件
export function deleteFile() {
  // 检查文件是否存在
  let isExit = fs.existsSync(`${configDir}/update.json`);
  if (isExit) {
    fs.unlinkSync(`${configDir}/update.json`)
  }
}
