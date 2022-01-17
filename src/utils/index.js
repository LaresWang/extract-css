import fs from 'fs';
import { shell as eShell } from 'electron'
import { machineIdSync } from 'node-machine-id'
import { decrypt } from '@/utils/rsa'; // 单聊
import { Decrypt } from '@/utils/aes'; // 群聊
import UserInfoUtils from '@/utils/UserInfoUtils.js';
import SQLUtils from '@/components/db/sqlite.js';
import { paymentId, pictureTypeArr } from "../utils/const";
import { videoCode} from "@/utils/const";

export const ChatListUtils = {
  listKey: '_messageList',
  setMessageList: function () {
    // 参数： userId, chatList
    // 本地是否有聊天记录？拿出来赋值给list：空数组
    // let list = localStorage[userId + this.listKey] ? JSON.parse(localStorage[userId + this.listKey]) : [];
    // list = [...list, chatList] //chatlist是此时ws推过来的一条消息
    // localStorage.setItem(userId + this.listKey, JSON.stringify(list));
    //TODO 后面入库
  },
  setChatList: function (userId, chatList) {
    localStorage.setItem(userId + this.listKey, JSON.stringify(chatList));
  },
  //删除聊天会话框
  delChat: function (userId, chat) {
    let tempChatList = [];
    for (let item of this.getChatList(userId)) {
      if (String(item.id) !== String(chat.id)) {
        tempChatList.push(item);
      }
    }
    // 放入缓存
    this.setChatList(userId, tempChatList);
    return tempChatList;
  },
  /** 判断是否是当前聊天窗口 */
  isCurrentChat: function (id) {
    if (localStorage.getItem('currentChat')) {
      let currentChat = JSON.parse(localStorage.getItem('currentChat'));
      if (currentChat.id == id) {
        return true;
      }
    }
    return false;
  },

  /**  是否需要加密或解密 */
  needCrypto (fromId, targetId = '', targettype = 1, msgtype = 1) {
    console.log('加密参数', targettype, msgtype);
    if (fromId == '1032384035881537536' || fromId == '1008455862495526912' || fromId == paymentId) {
      return false;
    }
    if (targetId == '1032384035881537536' || targetId == '1008455862495526912' || targetId == paymentId) {
      return false;
    }
    if (msgtype == '1' || msgtype == '25') {
      //1： 文本 25：引用
      return true;
    }
    return false;
  },
  decryptMsg: function (msg, targettype, groupid, msgtype = 1, msgPubkeyVersion = '') {
    //解密消息
    if (msgtype == '1' || msgtype == '25') {
      //文本类消息 解密
      if (targettype == '1') {
        //targettype: 1单聊 2群聊
        let rsd = '';
        if (msgPubkeyVersion != '' && msgPubkeyVersion != UserInfoUtils.getCurrentUserPrivateKeyLastVersion()) {
          //老版本的公钥加密的信息
          console.log('使用的是老版本的公钥', msgPubkeyVersion);
          rsd = SQLUtils.findPrivateKeyByVersion(UserInfoUtils.getCurrentUserId(), msgPubkeyVersion);
        } else {
          rsd = UserInfoUtils.getCurrentUserPrivateKey();
        }
        return decrypt(msg, rsd);
      } else if (targettype == '2') {
        return Decrypt(msg, groupid);
      }
    } else {
      return msg;
    }
    return '';
  }
};
export function contFriSize (a, b) {
  let num1 = parseInt(a);
  let num2 = parseInt(b);
  if (num1 > num2) {
    return a + '@' + b;
  } else {
    return b + '@' + a;
  }
}
export function contGrpSize (a) {
  return 'GROUP@' + a;
}
export function md5 (str) {
  let crypto = require('crypto');
  let md5 = crypto.createHash('md5');
  return md5.update(str).digest('hex');
}

export function diffDays (date) {
  let nowTimes = new Date().getTime();
  let parTimes = new Date(date).getTime();
  // 得出带有两位数字的小数
  return Number(((nowTimes - parTimes) / (1000 * 60 * 60 * 24)).toFixed(2));
}

export const getCurrentTime = () => {
  let nowTimes = setTime();
  return `${nowTimes.Y}/${nowTimes.M}/${nowTimes.D} ${nowTimes.H}:${nowTimes.MM}:${nowTimes.S}`;
};

function setTime (time) {
  let d = new Date();
  time ? d.setTime(time) : d;
  let date = d;
  let year = date.getFullYear();
  let month = (date.getMonth() + 1).toString().length > 1 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
  let day = date.getDate().toString().length > 1 ? date.getDate() : '0' + date.getDate();
  let hour = date.getHours().toString().length > 1 ? date.getHours() : '0' + date.getHours();
  let minute = date.getMinutes().toString().length > 1 ? date.getMinutes() : '0' + date.getMinutes();
  let second = date.getSeconds().toString().length > 1 ? date.getSeconds() : '0' + date.getSeconds();
  return {
    Y: year,
    M: month,
    D: day,
    H: hour,
    MM: minute,
    S: second
  };
}
export function diffTime (timer) {
  //根基当前时间： 24小时以内展示具体时间，24到48展示昨天，其他的展示日期：YYYY/MM/DD
  let nowTimes = setTime();
  let parTimes = setTime(timer);
  let showDate = `${('' + parTimes.Y).substr(2)}/${parTimes.M}/${parTimes.D}`;
  let showTime = `${parTimes.H}:${parTimes.MM}`;
  if (nowTimes.Y - parTimes.Y > 0) {
    // 年份不同
    return showDate;
  } else if (nowTimes.M - parTimes.M > 0) {
    // 年份一样，月份不同
    return showDate;
  } else if (nowTimes.D - parTimes.D > 0) {
    // 年份月份一样，比较天数
    if (nowTimes.D - parTimes.D >= 2) {
      return showDate;
    } else {
      return window.vm.$t('Universal_0022');
    }
  } else if (nowTimes.D - parTimes.D == 0) {
    // 年份月份天数一样，同一天
    return showTime;
  } else {
    return showDate;
  }
}

export function diffTimeInChat (timer) {
  //根基当前时间： 24小时以内展示具体时间，24到48展示昨天，其他的展示日期：YYYY/MM/DD
  let nowTimes = setTime();
  let parTimes = setTime(timer);
  let showDate = `${('' + parTimes.Y).substr(2)}/${parTimes.M}/${parTimes.D} ${parTimes.H}:${parTimes.MM}`;
  let showTime = `${parTimes.H}:${parTimes.MM}`;
  if (nowTimes.Y - parTimes.Y > 0) {
    // 年份不同
    return showDate;
  } else if (nowTimes.M - parTimes.M > 0) {
    // 年份一样，月份不同
    return showDate;
  } else if (nowTimes.D - parTimes.D > 0) {
    // 年份月份一样，比较天数
    if (nowTimes.D - parTimes.D >= 2) {
      return showDate;
    } else {
      return window.vm.$t('Universal_0022') + ' ' + showTime;
    }
  } else if (nowTimes.D - parTimes.D == 0) {
    // 年份月份天数一样，同一天
    return showTime;
  } else {
    return showDate;
  }
}

export function resizeFun (sHeight, e) {
  let resize = document.getElementById('resize');
  let up = document.getElementById('talk');
  let down = document.getElementById('down');
  let box = document.getElementById('resizeBox');
  let at = document.querySelector('.by-at');
  console.log(up.clientHeight, 'sssssssss', resize.offsetTop);

  console.log(e, 'eeeeeeeeeeeee');
  let startY = e.clientY - 1; //437-109
  resize.top = resize.offsetTop - 1; //分割线距离跟元素顶部的高 ///resize.offsetTop =>372
  document.onmousemove = function (e) {
    console.log(e, 'E2');
    let endY = e.clientY - 1;
    let moveH = resize.top + (endY - startY); //往上拉，后面是负值
    //
    let maxT = box.clientHeight - resize.offsetHeight; //maxT是整个高度-中间线的高度，
    console.log(box.clientHeight, startY, endY, resize.offsetHeight, moveH, maxT);
    if (moveH > maxT * 0.7) {
      //往下拉，下面盒子有个最小高度
      moveH = maxT * 0.7;
    }
    if (moveH < maxT - maxT * 0.6) {
      //往上拉，下面盒子有个最大高度。
      moveH = maxT - maxT * 0.6;
    }

    resize.style.top = moveH;
    up.style.height = moveH + 'px';

    if (sHeight >= up.scrollHeight) {
      //如果当前页面在底部，则来了新消息，图片加载完成等事件后自动滚屏到底部
      up.scrollTop = up.scrollHeight
    }

    // 这里保存一下富文本输入框的高度
    console.log('down ====>', down.style.height);
    // localStorage.setItem('quillHeight', down.style.height)

    down.style.height = box.clientHeight - moveH - resize.offsetHeight + 'px';
    if (at) {
      at.style.bottom = box.clientHeight - moveH - resize.offsetHeight + 'px';
    }
    console.log(moveH, up.clientHeight, box.clientHeight - moveH - 5 + 'px');
    // scrollBottom();
  };
  document.onmouseup = function () {
    document.onmousemove = null;
    document.onmouseup = null;
    resize.releaseCapture && resize.releaseCapture();
    console.log('888');
    // resetSilentMaskHeight(0);
  };
  resize.setCapture && resize.setCapture();
}

export const fileValidation = async (file, vm) => {
  const stat = fs.lstatSync(file.path);
  if (stat.isDirectory()) {
    vm.$alert(vm.$t('chat_0081'), vm.$t('Universal_0059'), {
      confirmButtonText: vm.$t('Universal_0062'),
      center: true,
      showClose: true
    });
    return false;
  }

  const isLt10M = file.size / 1024 / 1024 > 200;
  if (isLt10M) {
    vm.$message.error(vm.$t('chat_0082'));
    return false;
  }

  const isEmptyFile = file.size == 0;
  if (isEmptyFile) {
    vm.$alert(vm.$t('chat_0083'), vm.$t('Universal_0059'), {
      confirmButtonText: vm.$t('Universal_0062'),
      center: true,
      showClose: true
    });
    return false;
  }

  const isLt50M = file.size / 1024 / 1024 > 50;
  if (file.type.substr(0, 5) == 'video') {
    if (isLt10M) {
      vm.$message.error(vm.$t('chat_0051'));
      return false;
    }
  }
  // 图片格式
  let fileType = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
  let flag = true;
  // 1、先通过后缀判断发送的文件是否在map内；
  if (pictureTypeArr.includes(fileType)) {
    // 2、在，就判断真实类型与后缀是否一致；
    await getFileMimeType(file).then(async res => {
      // 录音格式 m4a在某些手机(iphone 6s)上传保存后，二进制头部是0000001C(mp4\mp3)，而有些手机上传后二进制头部是00000018(m4a)，所以在这里特殊处理下
      /*if (fileType === 'm4a' && (res === 'mp4' || res === 'mp3')) {
        flag = true;
        return;
      }*/
      // m4a改为mp3
      /*if (fileType === 'mp3' && res === 'mp4') {
        flag = true;
        return;
      }*/
      // 判断是否是图片
      if (pictureTypeArr.includes(res)) {
        if (!pictureTypeArr.includes(fileType)) {
          vm.$message.error(vm.$t('chat_0095'));
          flag = false;
        }
        if (isLt50M) {
          vm.$message.error(vm.$t('chat_0096'));
          flag = false;
        }
        return;
      }
      if (res !== fileType) {
        // console.log('文件内容与后缀不一致！');
        vm.$message.error(vm.$t('chat_0095'));
        flag = false;
        return;
      }
    }).catch(err => {
      console.log(err);
      flag = false;
    });
  }
  // 视频
  /*if (videoTypeArr.includes(fileType)) {
    const files = new FileUpload(file.path, file.reqId);
    const upload = await files.videoUpload();
    console.log('upload-- ',upload)
    if (upload.errorInfo === 101) {
      console.log('0000000000',upload.errorInfo, typeof upload.errorInfo);
      vm.$message.error(vm.$t('Universal_0381'));
      return false;
    }
  }*/
  return flag;
};

export function storeDraft () {
  return '';
}
// 根据二进制来判断文件类型
export async function getFileMimeType (file) {
  if (!file.fileType) {
    return new Promise((resolve) => {
      resolve('png')
    });
  }
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  return await new Promise((resolve, reject) => {
    reader.onload = (event) => {
      try {
        let array = new Uint8Array(event.target.result);
        array = array.slice(0, 4);
        let arr = [...array]
        let key = arr.map(item => item.toString(16)
          .toUpperCase()
          .padStart(2, '0'))
          .join('')
        resolve(getFileType(key))
      } catch (e) {
        reject(e);
      }
    };
  });
}
export function getFileType (file) {
  switch (file) {
  case 'FFD8FFE0':
  case '89504E47':
  case '47494638':
  case '52494646':
  case '49492A00':
  case '424DA00':
  case '4D4D002A':
  case '424D3E':  // BMP
  case '424D1EBE':  // BMP
    return 'png';
  case '41564920':
  case '0000001C':
    return 'mp4';
  case '2E524D46':
    return 'rm';
  case '2E7261':
    return 'ram';
  case '57415645':
  case '49443304':
  case '49443303':
  case '00000018':
    return 'mp3';
  default:
    return undefined;
  }
}

// export function ensureStringed(thing) {
//   if (getStringable(thing)) return getString(thing);
//   else if (thing instanceof Array) {
//     const res = [];
//     for (let i = 0; i < thing.length; i += 1)
//       res[i] = ensureStringed(thing[i]);
//     return res;
//   } else if (thing === Object(thing)) {
//     const res = {};
//     for (const key in thing) res[key] = ensureStringed(thing[key]);
//     return res;
//   } else if (thing === null) {
//     return null;
//   }
//   throw new Error(`unsure of how to jsonify object of type ${typeof thing}`);
// }
// const StaticByteBufferProto = new window.dcodeIO.ByteBuffer().__proto__;
// const StaticArrayBufferProto = new ArrayBuffer().__proto__;
// const StaticUint8ArrayProto = new Uint8Array().__proto__;

// function getString(thing) {
//   if (thing === Object(thing)) {
//     if (thing.__proto__ === StaticUint8ArrayProto)
//       return String.fromCharCode.apply(null, thing);
//     if (thing.__proto__ === StaticArrayBufferProto)
//       return getString(new Uint8Array(thing));
//     if (thing.__proto__ === StaticByteBufferProto)
//       return thing.toString('binary');
//   }
//   return thing;
// }

// function getStringable(thing) {
//   return (
//     typeof thing === 'string' ||
//     typeof thing === 'number' ||
//     typeof thing === 'boolean' ||
//     (thing === Object(thing) &&
//       (thing.__proto__ === StaticArrayBufferProto ||
//         thing.__proto__ === StaticUint8ArrayProto ||
//         thing.__proto__ === StaticByteBufferProto))
//   );
// }

export const isFunction = (fun) => {
  let t = Object.prototype.toString.call(fun).slice(8, -1);
  return t === 'Function' || t === 'AsyncFunction';
}

export const fromBase64 = (value) => {
  return Buffer.from(value, 'base64');
}

export const tobase64 = (data) => {
  return Buffer.from(data).toString('base64');
}

export const getSyncDataStatus = async (id) => {
  let isFirstLogin = false;
  let longtermOffline = false;
  const isExist = await window.vm.$knex.schema.hasTable('t_userInfo');
  if (!isExist) {
    isFirstLogin = true;
  } else {
    console.log('查询数量')
    const isHaveUserInfo = await window.vm.$knex.raw('select count(0) as count from t_userInfo where id=' + id);
    console.log(isHaveUserInfo, '查询数量')
    !isHaveUserInfo[0]?.count && (isFirstLogin = true);

    // 判断离线120小时, 432000000ms
    if (!isFirstLogin) {
      const ret = await window.vm.$knex('t_news_version').where({ name: 'lastModify' }).select('version');
      const modifyVer = ret && ret[0]?.version || 0;
      if (Date.now() - modifyVer > 432000000) {
        longtermOffline = true;
      }
    }
  }
  return { isFirstLogin, longtermOffline };
}

export const updateLastModify = async () => {
  await window.vm.$knex('t_news_version').where({ name: 'lastModify' }).update({ version: Date.now() + '' });
}
// export function videoImg(file, callback) {
//   const videoUrl = file.msgBody.localId || file.msgBody.fileId;
//   let width = 0
//   let height = 0
//   const videoObj = document.createElement('video')
//   videoObj.preload = 'metadata';
//   videoObj.src = videoUrl;
//   videoObj.onerror= function () {
//     callback(false);
//   }
//   videoObj.onloadedmetadata = function () {
//     URL.revokeObjectURL(videoUrl);
//     width = videoObj.videoWidth;
//     height = videoObj.videoHeight;
//     if (width === 0 && height === 0) {
//       callback(false);
//     } else {
//       callback(true);
//     }
//   }
// }


export function videoImg (file, callback) {
  console.log('videoImg- ', file)
  if (file instanceof File) {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    const videoUrl = URL.createObjectURL(file)
    // const videoUrl = file.path;
    let width = 0
    let height = 0
    const videoObj = document.createElement('video')
    videoObj.preload = 'metadata'
    videoObj.src = videoUrl
    videoObj.onerror = function () {
      callback(0, 0);
    }
    videoObj.onloadedmetadata = function () {
      URL.revokeObjectURL(videoUrl)
      width = videoObj.videoWidth
      height = videoObj.videoHeight
      callback(width, height)
    }
  }
}

// 判断是否支持播放
export async function isSupportVideoPlay (files) {
  let isSupportVideo = false
  const res = await files.getVideoCodeC();
  // video 标签 支持 Mp4格式 H264编码  WebM格式 VP8编码  Ogg格式 Theora编码
  if (videoCode.indexOf(res.metadata?.video?.codec) > -1) {
    isSupportVideo = true
  }
  console.log('isSupportVideo ===>', isSupportVideo);
  return isSupportVideo
}

export const goOfficialPage = function () {
  eShell.openExternal('https://www.didimessage.com/')
}


/** 判断数组对象是否有这个属性 防止数据引起的报错
 * 参数 目标数据 array 检测属性 是否是undefind
 * return booblean
 */  
export function checkkArrProps(array, props) {
  let flag = false
  if (!Array.isArray(array) || array.length <= 0) {
    return flag 
  }
  if (typeof(props) !== 'string') {
    return flag
  }
  console.log('checkkArrProps ===>', array);
  // 遍历数组检查属性
  for (const obj of array) { 
    if (obj[props] === undefined) {
      return flag
    }
  }
  flag = true
  return flag
}

export const getMachineId = () => {
  const machineIds = machineIdSync();
  console.log('machineIds',machineIds)
  return `${machineIds}`;
}

export const sortArr = (arr, str) => {
  let _arr = [],
    _t = [],
    // 临时的变量
    _tmp;
 
  // 按照特定的参数将数组排序将具有相同值得排在一起
  arr = arr.sort(function(a, b) {
    let s = a[str],
      t = b[str];
 
    return s < t ? -1 : 1;
  });
 
  if ( arr.length ){
    _tmp = arr[0][str];
  }
  // console.log( arr );
  // 将相同类别的对象添加到统一个数组
  for (let i in arr) {
    console.log( _tmp);
    if ( arr[i][str] === _tmp ){
      console.log(_tmp)
      _t.push( arr[i] );
    } else {
      _tmp = arr[i][str];
      _arr.push( _t );
      _t = [arr[i]];
    }
  }
  // 将最后的内容推出新数组
  _arr.push( _t );
  return _arr;
}