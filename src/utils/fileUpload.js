/***
 * 
 * 
 * wlite-avsdk-vod-upload-node 包含依赖
 * 
 * 
 * */ 

const path = require('path');
const { remote } = require('electron');
import fileOperational from '@/services/fileOperational';
import { Message } from "element-ui"
// const { default: UGCPublish, ImagePublishParam } = require('wlite-avsdk-vod-upload-node');
const VUE_APP_AWS_CONFIG_URL = process.env.VUE_APP_AWS_CONFIG_URL;
import store from "../store"
class FileUpload {
  constructor(imageFile, mark, duration = 0) {
    this.file = imageFile;
    this.mark = mark;
    this.duration = duration;
    this.sessionId=window.vm.$route.query?.id;
    const { default: UGCPublish } = require('wlite-avsdk-vod-upload-node');
    // if (process.platform != 'darwin') {
    //   this.publish = new UGCPublish()
    //     .withAppServerUrl(VUE_APP_AWS_CONFIG_URL);
    // } else {
    this.publish = new UGCPublish()
      .withAppServerUrl(VUE_APP_AWS_CONFIG_URL)
      .withFFmpeg(path.join(remote.app.getAppPath(), `../ffmpeg/ffmpeg-${process.platform === 'darwin' ? 'mac' : 'win'}`));
    // }
  }
  headImageUpload() {
    const { ImagePublishParam } = require('wlite-avsdk-vod-upload-node');
    let param = new ImagePublishParam(this.file, this.mark);
    param.usage = 0; // 0 头像 2 聊天图
    param.duration = -1; // 永不过期
    param.resolutions = [
      { name: 'High', quality: 92,  scale: 1 }, // 设置height=200，固定图片高度为200.
      { name: 'Medium', quality: 92, scale: 0.8, height: 200 }, // scale = 1.0 ，长和宽缩放到原图的1.0倍。
    ];
    return this.publish
      .publishImageAsync(param, progress => {
        console.log('上传进度', progress);
      })
      .then(ret => {
        console.log('ImagePublishParam', ret);
        for (let ele of ret) {
          fileOperational.getImage(ele.url);
        }
        return ret;
      })
      .catch(e => {
        console.error(e);
      });
  }
  imageUpload() {
    const { ImagePublishParam } = require('wlite-avsdk-vod-upload-node');
    let param = new ImagePublishParam(this.file, this.mark);
    param.duration = 0; // 有效期 0 =>7天   -1 => 永久有效
    param.usage = 2; // 0 头像 2 聊天图
    let isPng = this.file.substring(this.file.lastIndexOf('.') + 1).toLowerCase() === 'png';
    let isGif = this.file.substring(this.file.lastIndexOf('.') + 1).toLowerCase() === 'gif';
    if (isGif || isPng) {
      param.resolutions = [{ name: 'Original', quality: 100 }];
    }

    return this.publish
      .publishImageAsync(param, progress => {
        console.log('上传进度', progress);
      })
      .then(ret => {
        console.log('ImagePublishParam', ret);
        for (let ele of ret) {
          fileOperational.getImage(ele.url);
        }
        return ret;
      })
      .catch(e => {
        // e&&Message.error(e?.message)
        console.error(e);
      });
  }

  videoUpload() {
    console.log('videoUpload')
    let videoParam = {
      video: this.file,
      mark: this.mark,
      // 有效期 0 =>7天   -1 => 永久有效
      duration: 0
    };
    return this.publish
      .PublishVideoAsync(videoParam, progress => {
        console.log('上传进度', progress);
        store.dispatch('actionUploadTaskInfo',{sessionId:this.sessionId,reqId:this.mark,progress})
      })
      .then(ret => {
        console.log('ret-- ',ret)
        return ret;
      })
      .catch(e => {
        // console.error(e);
        throw new Error(e);//捕获异常 处理消息发送状态
      });
  }

  fileUpload() {
    let fileParam = {
      file: this.file,
      mark: this.mark,
      // 有效期 0 =>7天   -1 => 永久有效
      duration: 0
    };
    return this.publish
      .PublishFileAsync(fileParam, progress => {
        console.log('上传进度', progress);
        store.dispatch('actionUploadTaskInfo',{sessionId:this.sessionId,reqId:this.mark,progress})
      })
      .then(ret => {
        return ret;
      })
      .catch(e => {
        // console.error(e);
        throw new Error(e);//捕获异常 处理消息发送状态
      });
  }

  getVideoCodeC() {
    return this.publish.getParem(this.file).then(data => {
      return data;
    }).catch(e => {
      if(e?.code==103){
        e?.msg&&Message.error(e?.msg);
      }
      console.error(e);
    });
  }
}
export { FileUpload }