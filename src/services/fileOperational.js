import path from 'path'
import { download, checkIsExists, checkUrl, mkdir } from '@/utils/file'
import fs from 'fs'
import { remote } from 'electron'
import store from "../store"

let configDir = path.join(remote.app.getPath('appData'), `${process.env.VUE_APP_ID}`);
const configDirPath = path.join(configDir, 'images')
const filesPath = path.join(configDir, 'files')

class FileOperational {
  getFileName(url) {
    return /\/([^\\/]*?)\/?$/.exec(new URL(url).pathname)[1]
  }
  getImage(url, flag) { // flag - true 只下载不关注进度
    if (checkUrl(url)) {
      mkdir(configDirPath)
      const fileName = /\/([^\\/]*?)\/?$/.exec(new URL(url).pathname)[1]
      const exists = checkIsExists(configDirPath, fileName)
      if (fileName.indexOf('default.png') > -1) {
        // if (!exists) {
        //   download(url, path.join(configDirPath, fileName)) //托盘用default.png
        // }
        // return require('../view/chat/images/default.png');
        return require('../assets/images/default.png')
      }

      if (!exists) {
        if(!store.getters?.downloadTaskInfo?.[url]){
          !flag && store.dispatch('actionDownloadTaskInfo',{url,per:1})
          window.requestIdleCallback(download.bind(this, url, path.join(configDirPath, fileName), flag))
        }
        return url
      } else {
        return `file:///${path.join(configDirPath, fileName)}`
      }
    } else {
      return url
    }
  }

  async getPath(url) {
    if (checkUrl(url)) {
      const fileName = /\/([^\\/]*?)\/?$/.exec(new URL(url).pathname)[1]
      const exists = checkIsExists(configDirPath, fileName)
      if (!exists) {
        await download(url, path.join(configDirPath, fileName))
      }
      return `${path.join(configDirPath, fileName)}`
    }
  }

  // 判断文件是否存在
  checkIfFile(file, cb) {
    fs.stat(file, function fsStat(err, stats) {
      if (err) {
        if (err.code === 'ENOENT') {
          return cb(null, false)
        } else {
          return cb(err)
        }
      }
      return cb(null, stats.isFile())
    })
  }

  saveImageToFile(image, fileName) {
    let base64str = image.substr(image.indexOf(',') + 1)
    fs.writeFileSync(path.join(configDirPath, fileName), base64str, 'base64')
    return `${path.join(configDirPath, fileName)}`
  }

  async downloadFile(url, fileName, repeat = true) {
    if (checkUrl(url)) {
      mkdir(filesPath);
      const exists = checkIsExists(filesPath, fileName);
      if (exists && !repeat) return; // 针对于视频自动下载
      if (!exists) {
        download(url, path.join(filesPath, fileName))
      } else {
        let i = 1
        let suffixIndex = fileName.lastIndexOf('.')
        let fileNamePrefix = fileName.substr(0, suffixIndex)
        let fileNameSuffix = fileName.substr(suffixIndex)
        let isExistsFileName = fileNamePrefix
          .concat('(')
          .concat('' + i)
          .concat(')')
          .concat(fileNameSuffix)
        while (checkIsExists(filesPath, isExistsFileName)) {
          ++i
          isExistsFileName = fileNamePrefix
            .concat('(')
            .concat('' + i)
            .concat(')')
            .concat(fileNameSuffix)
        }
        download(url, path.join(filesPath, isExistsFileName))
        fileName = isExistsFileName
      }
      return `${path.join(filesPath, fileName)}`
    }
    return ''
  }
}

const fileOperational = new FileOperational()

export default fileOperational
