import { ipcRenderer, nativeImage } from "electron";
import fileOperational from '@/services/fileOperational';
import { getBigPic } from '../server.js';

/**
 * 动态插入css
 */

export const loadStyle = url => {
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;
  const head = document.getElementsByTagName('head')[0];
  head.appendChild(link);
};

/**
 * 
 * 查看大图
 * @param {
 *  originAvatarUrl   图片地址，一般是小图地址,
 *  id                用户或者群组或者社区id
 * }
 */
export const imgView = async (originAvatarUrl, id) => {
  // 先通过id查询大图
  let bigPic = ''
  if(id) {
    const { data } = await getBigPic({ id })
    bigPic = data
  }
  console.log('chen-util-imgView-查询到的大图==', bigPic)
  console.log('chen-util-imgView-id==', id)

  // 先查找本地图片，查找不到通过加载的方式获取宽高
  let avatarUrl = bigPic || originAvatarUrl // 图片的远程地址
  let localAvatarUrl = findImage(avatarUrl)
  console.log('chen-util-imgView-localAvatarUrl==', localAvatarUrl)
  
  if(localAvatarUrl.startsWith('file')) {
    const {width, height} = nativeImage.createFromPath(localAvatarUrl.slice(8)).getSize()
    sendMediaViewerMess(avatarUrl, width, height)
  } else {
    const img = new Image();   // 创建img元素
    img.src = avatarUrl  // 设置图片源地址
    console.log('chen-util-imgView-new image方式图片url=', avatarUrl)
    console.log('chen-util-imgView-new image方式图片加载完成以后width=', img.width)
    console.log('chen-util-imgView-new image方式图片加载完成以后height=', img.height)
    img.onload = function(){
      sendMediaViewerMess(avatarUrl, img.width, img.height)
    }
  }
}

/**
 * 
 * 给主进程发送打开图片图片查看器的消息
 */
function sendMediaViewerMess(originAvatarUrl, width, height) {
  ipcRenderer.send('media-viewer', { 
    msgType: 2, // type = 2 代表是图片查看
    imgList: [
      {
        url: originAvatarUrl,
        msgBody: { width, height, mediaId: originAvatarUrl, isCheckAvatar: true }
      }
    ], 
    index: 0
  });
}

/**
 * 
 * 根据https的地址获取本地图片
 */
function findImage(image) {
  return fileOperational.getImage(image);
}
