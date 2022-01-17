<template>
  <div @contextmenu.prevent="handleMediaRightClick($event)">
    <el-container>
      <!-- <el-header
        style="
          text-align: right;
          font-size: 12px;
          background: white;
          height: 20px;
          z-index: 10000;
        "
      >
        <div class="flex align-baseline justify-end topwork2 header-class"  >
          <i @click="hideWin" class="i1">
            <img class="img_12" src="../../assets/images/di_closewin.png" title="最小化" />
          </i>
          <i @click="sizeWindow" v-if="!isMaxed" class="i1">
            <img class="img_12" src="../../assets/images/di_maxmize.png" title="最大化" />
          </i>
          <i @click="sizeWindow" v-if="isMaxed" class="i1">
            <img class="img_12" src="../../assets/images/di_minmize.png" title="还原" />
          </i>
          <i class="i2" @click="closeWindow">
            <img class="img_12" src="../../assets/images/di_min_close.png" title="关闭" />
          </i>
        </div>
      </el-header> -->
     
      <el-main style="height:100vh;" class="media-main">
        <elImageViewer
          ref="elimageviewer"
          :url-list="viewerImgList"
          v-show="msgType == '2'"
          :initial-index="initialIndex"
          :url-data="downloadImglist"
          :agrs="agrs"
          :theme="theme"
        />
        <div style="background:#757575;height: 100%;">
          <video
            v-if="msgType == '10'"
            :src="item.msgBody.fileId"
            style="width: 100%; height: 100%;"
            controls="controls"
            ref="videoPlayer"
          ></video>
        </div>
      </el-main>
    </el-container>

    <el-dialog
        class="dialog-tip"
        :title="$t('Universal_0059')"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="showClose"
        center
        :visible="showDialog"
        @close="closeDialog"
    >
      <p class="cancel-update-dialog-p">
        {{ $t('chat_0122') }}
      </p>
      <div class="dialog-footer">
        <el-button size="mini" @click="closeDialog" class="cancel-btn">
          {{ $t('Universal_0063') }}</el-button>
        <el-button
            size="mini"
            type="primary"
            class="update-btn"
            @click="openVideo"
        >{{ $t('Universal_0356') }}</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import ELImageViewer from 'element-ui/packages/image/src/image-viewer'
import elImageViewer from './elImageViewer';
import { clipboard, ipcRenderer, shell } from 'electron';
import fileOperational from '@/services/fileOperational';
import _ from 'lodash';
import bus from '@/utils/eventbus';

export default {
  name: 'Media',
  components: {
    elImageViewer
  },
  data() {
    return {
      imgList: [],
      chatList: [],
      reqId: '',
      src: '',
      initialIndex: 0,
      viewerImgList: [],
      msgType: '',
      item: {},
      isMaxed: false,
      downloadImglist: [],
      showDialog: false,
      showClose: true,
      agrs: {},
      theme: '',
    };
  },
  methods: {
    inited(viewer) {
      if (!this._viewer) {
        this._viewer = viewer;
      }
    },
    sizeWindow() {
      const browserWindow = window.vm.$remote.getCurrentWindow();
      if (!this.isMaxed) {
        browserWindow.maximize();
        this.isMaxed = true;
      } else {
        browserWindow.unmaximize();
        this.isMaxed = false;
      }
    },
    hideWin() {
      const browserWindow = window.vm.$remote.getCurrentWindow();
      browserWindow.minimize();
    },
    async closeWindow() {
      this.imgList = [];
      this.chatList = [];
      this.reqId = '';
      this.src = '';
      this.msgType="";
      this.item={};
      this.initialIndex = 0;
      this.viewerImgList = [];
      this.downloadImglist=[];
      if (this.$refs.videoPlayer) {
        this.$refs.videoPlayer.currentTime = 0;
        this.$refs.videoPlayer.pause();
      }
      this.showDialog = false;
      await this.$nextTick();
      setTimeout(()=>{
        const browserWindow = window.vm.$remote.getCurrentWindow();
        console.log('hide');
        // 将组件内部errorImg变量重置成false, 不然加载一张失败图片以后就无法正常加载图片
        this.$refs.elimageviewer.errorImg = false
        browserWindow.hide();
      },150)
    },
    openImageViewer(imgUrl) {
      let imgIndex = _.findIndex(this.downloadImglist, item => {
        if (item.url == imgUrl) {
          return item;
        }
      });
      const reqId = this.downloadImglist[imgIndex].reqId;
      let msgBody = this.downloadImglist[imgIndex].msgBody;
      let url = this.downloadImglist[imgIndex].url;
      const { ipcRenderer } = require('electron');
      this.ipcRenderer = ipcRenderer;
      this.ipcRenderer.send('image-viewer', {
        reqId: reqId,
        msgBody: msgBody,
        url: url
      });
    },
    handleMediaRightClick(e) {
      console.log('进入右击事件')
      if (e) {
        e.preventDefault();
      }
      let that = this,
        obj = this.$refs?.elimageviewer?.currentItem || {},
        params = that.msgType == 2 ? obj : that.item,
        rightClickOptions,
        copy = {
          name: this.$t('chat_0026'),
          enabled: true,
          fun: () => {
            that.copyImage(params);
          }
        },
        save = {
          name: this.$t('Universal_0357'),
          enabled: true,
          fun: () => {
            that.handleSave(params);
          }
        },
        share = {
          name: this.$t('chat_0027'),
          enabled: true,
          fun: () => {
            that.handleShare(params);
          }
        };
      console.log('params===', params)
      if (that.msgType == 2) {
        // 如果是头像查看 隐藏转发功能
        if(params?.msgBody?.isCheckAvatar) {
          rightClickOptions = [copy, save, ];
        } else {
          rightClickOptions = [copy, save, share];
        }
        const fileName = fileOperational.getFileName(params?.msgBody?.mediaId);
        if (fileName.split('.')[1] == 'gif') {
          rightClickOptions.shift();
        }
      }
      if (that.msgType == 10) {
        rightClickOptions = [share];
      }
      return that.$RightClick(rightClickOptions).popup({
        window: window.vm.$remote.getCurrentWindow()
      });
    },
    // 图片复制
    async copyImage(item) {
      let { msgBody } = item,
        timer;
      // console.log(item,msgBody.mediaId);
      let mediaId = msgBody?.mediaId;
      if (mediaId) {
        const imagepath = await fileOperational.getPath(mediaId);
        timer = setTimeout(() => {
          clipboard.writeImage(imagepath, 'clipboard');
          this.$message.success(this.$t('Universal_0384'));
          clearTimeout(timer);
          timer = null;
        }, 500);
      }
    },
    // 图片另存为
    handleSave() {
      this.$refs.elimageviewer.saveImages(this.$refs.elimageviewer.index);
    },
    // 图片、视频转发
    handleShare(mediaData) {
      console.log(mediaData);
      ipcRenderer.send('media-share', mediaData);
    },
    _loadMedia(e,data){
      console.log('%cloadMedia','font-size:30px',data);
      this.msgType = data.msgType;
      if (this.msgType == '2') {
        this.item={};
        this.imgList=[];
        // console.log('data.imgList === ',data.imgList);
        // console.log('data.index === ',data.index);
        this.downloadImglist = data.imgList;
        data.imgList.map(img => {
          this.imgList.push(img.url);
        });
        this.src = this.imgList[data.index];
        // this.initialIndex = data.index;
        // this.$forceUpdate();
        // this.imgList = data.imgList;
        // this._viewer.images = this.imgList;
        // this._viewer.update();
        // this._viewer.view(data.index);
        // this._viewer.index = data.index;
        // this._viewer.show();
        // let arrayBefore = this.imgList.slice(0, data.index);
        // let arrayAfter = this.imgList.slice(data.index);
        // this.viewerImgList = arrayAfter.concat(arrayBefore);
        this.viewerImgList = this.imgList;
        this.initialIndex = data.index;
        this.agrs = data
        console.log('agrs ====>',this.agrs)
        console.log('imgList ====>',this.imgList)
        // console.log('this.viewerImgList ======== ',this.viewerImgList);
      } else if (this.msgType == '10') {
        // if ((data.item.msgBody.isH265 || data.item.msgBody.noFirstFrame) && data.item.msgBody.downloadPath) {
        //   // 是h265视频
        //   this.showDialog = true;
        // }

        if(data.item.msgBody.isSupportVideo!== undefined && !data.item.msgBody.isSupportVideo) {
          this.showDialog = true;
        }
        this.item = data.item;
      }
    },

    // 获取系统主题
    nativeTheme(e, data) {
      console.log('%Theme ====>','font-size:30px',data.theme);
      this.theme = data.theme
    },

    closeDialog() {
      this.showDialog = false;
      this.closeWindow();
    },
    openVideo() {
      shell.showItemInFolder(this.item.msgBody.downloadPath);
      this.showDialog = false;
      this.closeWindow();
    },
    _keyup(e){
      console.log(e.keyCode);
      if (e.keyCode == 27) {
        const browserWindow = window.vm.$remote.getCurrentWindow();
        if (browserWindow.isMaximized()) {
          browserWindow.setFullScreen(false);
        } else {
          setTimeout(() => {
            this.closeWindow();
          }, 100);
        }
      }
    },
    _imageTap(v){
      this.initialIndex = v;
    },
    changeLan(e, data) {
      this.$i18n.locale = data.lan.lan;
    }
  },
  async mounted() {
    bus.$on('imageTap', this._imageTap);
    ipcRenderer.on('clearMedia', this.closeWindow);
    ipcRenderer.on('loadMedia', this._loadMedia);
    ipcRenderer.on('lanChanged', this.changeLan)
    ipcRenderer.on('loadTheme', this.nativeTheme)
    await this.$nextTick();
    document.addEventListener('keyup', this._keyup);
  },
  beforeDestroy(){
    bus.$off('imageTap', this._imageTap);
    ipcRenderer.removeListener('clearMedia', this.closeWindow);
    ipcRenderer.removeListener('loadMedia', this._loadMedia);
    ipcRenderer.removeListener('loadTheme', this.nativeTheme)
    document.removeEventListener('keyup', this._keyup)
    ipcRenderer.removeListener('lanChanged', this.changeLan);
  }
};
</script>

<style>
.el-main .el-image-viewer__mask {
  top: 0px;
  background-color: transparent;
}
.el-main .el-image-viewer__canvas {
  padding-top: 20px;
  /* width: 96%; */
  height: 94%;
  /* padding-left: 15px; */
}
</style>
<style scoped>
.header-class {
  -webkit-app-region: drag;
  width: 100%;
  z-index: 1001;
}
video:focus{
  outline: none;
}
.dialog-footer {
  margin-top: 10px;
  text-align: center;
}
.dialog-tip {
  margin-top: 18vh;
}
</style>
