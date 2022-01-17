import fs from 'fs';
import path from 'path';
import request from 'request';
import store from "../store"
/**
 * 文件创建
 * @param {*} dir
 */
export const mkdir = dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  return;
};

/**
 * 文件读取
 * @param {*} dir
 */
export const readFile = dir => {
  return new Promise((resolve, reject) => {
    fs.readFile(dir, 'utf-8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * 文件下载
 * @param {*} url
 * @param {*} dir
 */
export const downImage = async (url, dir) => {
  let size;
  request(url)
    .on('error', e => {
      console.error('error', e);
    })
    .on('response', resp => {
      console.error('response: ' + url, resp);
      size = resp.headers['content-length'];
    })
    .on('complete', (resp, body) => {
      console.error('complete', resp, body);
    })
    .on('close', e => {
      console.error('close', e);
      return url;
    })
    .pipe(fs.createWriteStream(dir))
    .on('close', () => {
      const localFile = fs.statSync(dir);
      if (!size || size != localFile.size) {
        console.log('图片大小对比不满足, 本次放弃下载，等待下次下载', dir);
        fs.unlinkSync(dir);
      }
      console.error('download XXXX' + url, fs.statSync(dir));
    });
};

// 下载
export const download = async (url, path, flag) => {
  let size,cur=0;
  const bakPath = path + '-bak';
  console.log('下载一次', url);
  // 下载之前先清除历史数据
  if (checkFileIsExists(bakPath)) {
    fs.unlinkSync(bakPath);
  }
  // console.info(store.getters?.downloadTaskInfo?.[url])
  // 下载中
  return new Promise(resolve => {
    try {
      request
        .get({ url, strictSSL: false })
        .on('response', response => {
          size = response.headers['content-length'];
          !flag && response.on('data', function(data) {
            cur+=data.length
            // console.info(cur,size)
            store.dispatch('actionDownloadTaskInfo',{url,per:(cur/size)*100})
          })
        })
        .pipe(fs.createWriteStream(bakPath))
        .on('error', e => {
          console.log('download pipe error', e);
          resolve();
        })
        .on('finish', () => {
          // console.log('finish');
        })
        .on('close', () => {
          console.log('close');
          try {
            let localFile = fs.statSync(bakPath);
            console.log('finish', size, localFile.size);
            if (!size || size != localFile.size) {
              console.log('下载内容大小对比不满足, 本次放弃下载，等待下次下载', bakPath);
              fs.unlinkSync(bakPath);
              resolve();
            } else {
              fs.renameSync(bakPath, path);
              !flag && store.dispatch('actionDownloadTaskInfo',{url,per:100})
              resolve();
            }
          } catch (err) {
            resolve();
          }
        });
    } catch (err) {
      console.log('err', err);
      resolve();
    } finally {
      resolve();
    }
  });
};

/**
 * 检查文件是否存在
 * @param {*} fileName
 * @param {*} dir
 */

export const checkIsExists = (dir, fileName) => {
  try {
    const dirPath = fileName ? path.join(dir, fileName) : dir;
    const stats = fs.statSync(dirPath);
    if (stats.size === 0) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
};

export const checkVideoIsExists = async (dir, fileName) => {
  try {
    const dirPath = fileName ? path.join(dir, fileName) : dir;
    const stats = await fs.statSync(dirPath);
    if (stats.size === 0) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
};

export const checkFileIsExists = filePath => {
  try {
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
};
/**
 * 检查是否是合法的URL
 * @param {*} URL
 */
export const checkUrl = URL => {
  const objExp = new RegExp(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/); // eslint-disable-line
  return objExp.test(URL);
};
