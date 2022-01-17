<template>
  <div class="audio-main">
    <div :style="audioMainBackground" class="user-background-class"></div>
    <div class="user-background-mask-class"></div>
    <div class="flex align-baseline justify-end topwork2 header-class">
      <i @click="setToTopWin" v-if="!isTop" class="i1">
        <img src="../../assets/images/audio_totop.png" title="置顶" />
      </i>
      <i @click="setToTopWin" v-if="isTop" class="i1">
        <img src="../../assets/images/audio_totop.png" title="取消置顶" />
      </i>
      <i @click="hideWin" class="i1">
        <img class="img_12" src="../../assets/images/audio_min_close.png" style="padding-bottom: 6px;" title="最小化" />
      </i>
      <i class="i2" @click="closeAudioWindow">
        <img class="img_12" src="../../assets/images/audio_closewin.png" style="padding-bottom: 2px;" title="关闭" />
      </i>
    </div>
    <div class="content">
      <div class="audio-user-icon">
        <img :src="findImage(userInfo.url)" class="user-icon" alt />
      </div>
      <div class="audio-user-name">
        <span class="user-name">
          {{ userInfo.name }}
        </span>
      </div>
      <div class="audio-loading">
        <!--        <AudioWaiting start="gray" />-->
        <!--        <AudioWaiting start="lightgray" />-->
        <!--        <AudioWaiting start="white" />-->
        <span>{{ waitingForOthers }}</span>
        <AudioLoading v-if="status != 'chatting' && waitingForOthers != ''" />
      </div>
      <div class="audio-quality" v-if="!networkQuality">
        <span>当前通话连接质量不佳</span>
      </div>
      <div class="audio-sound"></div>
      <div class="audio-stop">
        <img src="../../assets/images/audio_mute.png" @click="muteAudio" v-if="status === 'chatting' && !isMute" alt title="静音" />
        <img src="../../assets/images/audio_muted.png" @click="muteAudio" v-if="status === 'chatting' && isMute" alt title="非静音" />
        <img src="../../assets/images/audio_cancel.png" @click="cancelAudio" alt title="挂断" />
        <img src="../../assets/images/audio_accept.png" @click="acceptAudio" v-if="status === 'waiting' && !isOriginator" alt title="接听" />
        <img src="../../assets/images/audio_sound.png" @click="soundAudio" v-if="status === 'chatting' && !soundChange" alt title="音量" />
        <img src="../../assets/images/audio_soundchange.png" @click="soundAudio"
             v-if="status === 'chatting' && soundChange" alt title="音量"/>
        <div class="audio-sound-control" v-if="soundChange">
          <el-slider id="volumeSlider" v-model="volume" @change="volumeChange" @wheel.native="wheelChange" vertical height="100px">
          </el-slider>
        </div>
        <div class="audio-description" v-show="status === 'chatting'">
          <span>静音</span>
          <span>挂断</span>
          <span>音量</span>
        </div>
      </div>
    </div>
    <audio id="audioWaitingSound" src="./sounds/audioWaiting.mp3" preload="auto" loop="loop" ref="audioWaiting"></audio>
  </div>
</template>

<script>
import AudioLoading from './AudioLoading';
// import fileOperational from '@/services/fileOperational';
// import TRTCCloud from 'trtc-electron-sdk';
// import { TRTCParams, TRTCAppScene, TRTCAudioQuality } from 'trtc-electron-sdk/liteav/trtc_define';

export default {
  name: 'Audio',
  components: {
    AudioLoading
  },
  computed: {
    audioMainBackground() {
      if (this.userInfo.url) {
        return `background: url(${this.userInfo.url});`;
      }
      return 'background: white;';
    }
  },
  data() {
    return {
      userInfo: {},
      isTop: false,
      status: 'waiting',
      isOriginator: true,
      isMute: false,
      waitingForOthers: '正在呼叫中',
      userSig: {},
      roomId: '',
      timer: 0,
      hour: 0,
      minutes: 0,
      seconds: 0,
      chatTime: 0,
      isJoined: false,
      client: {},
      localStream: {},
      trtcCloud: {},
      trtcParams: {},
      networkQuality: true,
      volume: 80,
      soundChange: false,
      showWindowTimer: 0,
      count: 70,
      connectTimer: 0,
      connectCount: 20,
      noNetworkCall: true
    };
  },
  // methods: {
  //   findImage(image) {
  //     return fileOperational.getImage(image);
  //   },
  //   setToTopWin() {
  //     const browserWindow = window.vm.$remote.getCurrentWindow();
  //     browserWindow.setAlwaysOnTop(true);
  //     if (!this.isTop) {
  //       browserWindow.setAlwaysOnTop(true);
  //       this.isTop = true;
  //     } else {
  //       browserWindow.setAlwaysOnTop(false);
  //       this.isTop = false;
  //     }
  //   },
  //   unsetToTopWin() {
  //     const browserWindow = window.vm.$remote.getCurrentWindow();
  //     browserWindow.setAlwaysOnTop(false);
  //   },
  //   hideWin() {
  //     const browserWindow = window.vm.$remote.getCurrentWindow();
  //     browserWindow.minimize();
  //   },
  //   closeWindow() {
  //     this.leaveRoom();
  //     const { ipcRenderer } = require('electron');
  //     ipcRenderer.send('audio-window-close');
  //     setTimeout(() => {
  //       const browserWindow = window.vm.$remote.getCurrentWindow();
  //       browserWindow.hide();
  //     }, 100);
  //   },
  //   muteAudio() {
  //     this.isMute = !this.isMute;
  //     this.trtcCloud.muteLocalAudio(this.isMute);
  //   },
  //   closeAudioWindow() {
  //     if (this.status == 'chatting') {
  //       this.$confirm('关闭窗口将结束语音聊天，确定要关闭吗？', '提示', {
  //         confirmButtonText: '确定',
  //         cancelButtonText: '取消',
  //         type: 'warning',
  //         customClass: 'message-box-class'
  //       })
  //         .then(() => {
  //           setTimeout(() => {
  //             this.cancelAudio();
  //           }, 200);
  //         })
  //         .catch(() => {});
  //     } else {
  //       this.cancelAudio();
  //     }
  //   },
  //   cancelAudio() {
  //     this.leaveSocket();
  //     this.clearParams();
  //     this.closeWindow();
  //   },
  //   overTimeCancelAudio() {
  //     const { ipcRenderer } = require('electron');
  //     console.log('leaveSocket ====== 705');
  //     ipcRenderer.send('overtimeCall', {
  //       userInfo: this.userInfo,
  //       roomId: this.roomId,
  //       time: this.chatTime
  //     });
  //     this.clearParams();
  //     this.closeWindow();
  //   },
  //   cancelCall() {
  //     this.clearParams();
  //     this.closeWindow();
  //   },
  //   connectingAudio() {
  //     this.noNetworkCall = false;
  //   },
  //   async acceptAudioConnect() {
  //     console.log('this.roomId ======= ', this.roomId);
  //     await this.joinRoom();
  //     this.acceptCall();
  //   },
  //   acceptAudio() {
  //     const { ipcRenderer } = require('electron');
  //     ipcRenderer.send('acceptCall', {
  //       userInfo: this.userInfo,
  //       roomId: this.roomId,
  //       time: this.chatTime
  //     });
  //     this.waitingForOthers = '连接中';
  //     this.checkConnectTimeout();
  //   },
  //   acceptCall() {
  //     this.$refs.audioWaiting.currentTime = 0;
  //     this.$refs.audioWaiting.pause();
  //     this.status = 'chatting';
  //     this.waitingForOthers = '00:00';
  //     this.hour = 0;
  //     this.minutes = 0;
  //     this.seconds = 0;
  //     this.chatTime = 0;
  //     this.timer = window.setInterval(this.startTimer, 1000);
  //     this.soundChange = false;
  //     this.trtcCloud.setAudioPlayoutVolume(this.volume);
  //   },
  //   refuseAudio() {
  //     const { ipcRenderer } = require('electron');
  //     ipcRenderer.send('refuseCall', {
  //       userInfo: this.userInfo,
  //       roomId: this.roomId,
  //       time: this.chatTime
  //     });
  //     this.clearParams();
  //     this.closeWindow();
  //   },
  //   refuseCall() {
  //     this.clearParams();
  //     this.closeWindow();
  //   },
  //   leaveAudio() {
  //     this.leaveSocket();
  //     this.clearParams();
  //     this.closeWindow();
  //   },
  //   leaveCall() {
  //     this.clearParams();
  //     this.closeWindow();
  //   },
  //   overtimeCall() {
  //     this.clearParams();
  //     this.closeWindow();
  //   },
  //   busyCall() {
  //     this.clearParams();
  //     this.closeWindow();
  //   },
  //   suspendCall() {
  //     this.clearParams();
  //     this.closeWindow();
  //   },
  //   socketCloseAudio() {
  //     console.log('leaveSocket ====== 712');
  //     this.suspendSocket();
  //     this.clearParams();
  //     this.closeWindow();
  //   },
  //   suspendSocket() {
  //     const { ipcRenderer } = require('electron');
  //     if (this.waitingForOthers == '连接中' || this.waitingForOthers == '正在呼叫中') {
  //       ipcRenderer.send('noNetworkCall', {
  //         userInfo: this.userInfo,
  //         roomId: this.roomId,
  //         time: this.chatTime
  //       });
  //     } else {
  //       ipcRenderer.send('suspendCall', {
  //         userInfo: this.userInfo,
  //         roomId: this.roomId,
  //         time: this.chatTime
  //       });
  //     }
  //   },
  //   othersProcessingAudio() {
  //     this.clearParams();
  //     this.closeWindow();
  //   },
  //   onlineAudio() {
  //     this.noNetworkCall = false;
  //   },
  //   offlineAudio() {
  //     this.noNetworkCall = true;
  //   },
  //   startTimer() {
  //     this.seconds += 1;
  //     if (this.seconds >= 60) {
  //       this.seconds = 0;
  //       this.minutes = this.minutes + 1;
  //     }

  //     if (this.minutes >= 60) {
  //       this.minutes = 0;
  //       this.hour = this.hour + 1;
  //     }
  //     if (this.hour > 0) {
  //       this.waitingForOthers = 
  //        `${this.prefixInteger(this.hour)}:${this.prefixInteger(this.minutes)}:${this.prefixInteger(this.seconds)}`;
  //     } else {
  //       this.waitingForOthers = `${this.prefixInteger(this.minutes)}:${this.prefixInteger(this.seconds)}`;
  //     }
  //     this.chatTime = this.hour * 3600 + this.minutes * 60 + this.seconds;
  //     console.log('this.chatTime ===== ', this.chatTime, new Date());
  //     if (this.chatTime > 14400) {
  //       console.log('超过4小时 14400s 自动挂断');
  //       this.socketCloseAudio();
  //     }
  //   },
  //   prefixInteger(num) {
  //     return (Array(2).join('0') + num).slice(-2);
  //   },
  //   soundAudio() {
  //     this.soundChange = !this.soundChange;
  //   },
  //   wheelChange(e) {
  //     if (e.deltaY > 0) {
  //       if (this.volume > 0) {
  //         --this.volume;
  //       } else if (this.volume == 0) {
  //         this.volume = 0;
  //       }
  //     } else {
  //       if (this.volume < 100) {
  //         ++this.volume;
  //       } else if (this.volume == 100) {
  //         this.volume = 100;
  //       }
  //     }
  //     this.trtcCloud.setAudioPlayoutVolume(this.volume);
  //   },
  //   volumeChange() {
  //     this.soundChange = !this.soundChange;
  //     this.trtcCloud.setAudioPlayoutVolume(this.volume);
  //   },
  //   checkWindowTimeout() {
  //     const TIME_COUNT = 70;
  //     if (!this.showWindowTimer) {
  //       this.count = TIME_COUNT;
  //       this.showWindowTimer = setInterval(() => {
  //         if (this.count > 0 && this.count <= TIME_COUNT) {
  //           this.count--;
  //         } else {
  //           clearInterval(this.showWindowTimer);
  //           this.showWindowTimer = null;
  //           if (this.status == 'waiting') {
  //             this.overTimeCancelAudio();
  //           }
  //         }
  //       }, 1000);
  //     }
  //   },
  //   async joinRoom() {
  //     this.trtcParams = new TRTCParams();
  //     this.trtcParams.sdkAppId = this.userSig.sdkappid;
  //     this.trtcParams.roomId = +this.roomId;
  //     this.trtcParams.userId = this.userSig.UserID;
  //     this.trtcParams.userSig = this.userSig.UserSig;

  //     this.trtcCloud = new TRTCCloud();
  //     let onEnterRoom = function(result) {
  //       if (result > 0) {
  //         console.log(`onEnterRoom，进房成功，使用了 ${result} 秒`);
  //       } else {
  //         console.warn(`onEnterRoom: 进房失败 ${result}`);
  //       }
  //     };
  //     let onNetworkQuality = (localQuality, remoteQuality) => {
  //       if (localQuality.quality > 3) {
  //         this.networkQuality = false;
  //       } else {
  //         this.networkQuality = true;
  //       }
  //       if (remoteQuality.length > 0 && this.networkQuality) {
  //         if (remoteQuality[0].quality > 3) {
  //           this.networkQuality = false;
  //         } else {
  //           this.networkQuality = true;
  //         }
  //       }
  //     };
  //     // 订阅进房成功事件
  //     this.trtcCloud.on('onNetworkQuality', onNetworkQuality);
  //     this.trtcCloud.on('onEnterRoom', onEnterRoom);
  //     this.trtcCloud.enterRoom(this.trtcParams, TRTCAppScene.TRTCAppSceneVideoCall);
  //     this.trtcCloud.startLocalAudio(TRTCAudioQuality.TRTCAudioQualitySpeech);
  //     this.isJoined = true;
  //   },
  //   async leaveRoom() {
  //     if (!this.trtcCloud) {
  //       return;
  //     }
  //     console.log('this.isJoined ======== ', this.isJoined);
  //     if (!this.isJoined) {
  //       console.warn('leave() - please join() firstly');
  //       return;
  //     }
  //     let onExitRoom = function(reason) {
  //       console.log(`onExitRoom, reason: ${reason}`);
  //     };
  //     this.trtcCloud.exitRoom();
  //     this.trtcCloud.on('onExitRoom', onExitRoom);
  //     this.isJoined = false;
  //   },
  //   joinSocket() {
  //     const { ipcRenderer } = require('electron');
  //     ipcRenderer.send('sendCall', {
  //       userInfo: this.userInfo,
  //       roomId: this.roomId,
  //       time: this.chatTime
  //     });
  //   },
  //   checkConnectTimeout() {
  //     const TIME_COUNT = 20;
  //     if (!this.connectTimer) {
  //       this.connectCount = TIME_COUNT;
  //       this.connectTimer = setInterval(() => {
  //         if (this.connectCount > 0 && this.connectCount <= TIME_COUNT) {
  //           this.connectCount--;
  //         } else {
  //           clearInterval(this.connectTimer);
  //           this.connectTimer = null;
  //           console.log('checkConnectTimeout ===== ', this.connectCount, this.noNetworkCall);
  //           if (this.noNetworkCall || this.waitingForOthers == '连接中' || this.waitingForOthers == '正在呼叫中') {
  //             this.noNetworkCallCancelAudio();
  //           }
  //         }
  //       }, 1000);
  //     }
  //   },
  //   noNetworkCallCancelAudio() {
  //     console.log('leaveSocket ====== 700');
  //     this.suspendSocket();
  //     this.clearParams();
  //     this.closeWindow();
  //   },
  //   leaveSocket() {
  //     const { ipcRenderer } = require('electron');
  //     console.log('leaveSocket === ', this.status, this.isOriginator, this.noNetworkCall);
  //     if (this.status == 'waiting' && this.isOriginator) {
  //       // 706
  //       console.log('leaveSocket ====== 706');
  //       ipcRenderer.send('cancelCall', {
  //         userInfo: this.userInfo,
  //         roomId: this.roomId,
  //         time: this.chatTime
  //       });
  //     } else if (this.status == 'waiting' && !this.isOriginator) {
  //       // 703
  //       console.log('leaveSocket ====== 703');
  //       ipcRenderer.send('refuseCall', {
  //         userInfo: this.userInfo,
  //         roomId: this.roomId,
  //         time: this.chatTime
  //       });
  //     } else if (this.status == 'chatting') {
  //       // 704
  //       console.log('leaveSocket ====== 704');
  //       ipcRenderer.send('leaveCall', {
  //         userInfo: this.userInfo,
  //         roomId: this.roomId,
  //         time: this.chatTime
  //       });
  //     }
  //   },
  //   clearParams() {
  //     const browserWindow = window.vm.$remote.getCurrentWindow();
  //     this.userInfo = {};
  //     browserWindow.setAlwaysOnTop(false);
  //     this.isTop = false;
  //     this.timer = window.clearInterval(this.timer);
  //     this.hour = 0;
  //     this.minutes = 0;
  //     this.seconds = 0;
  //     this.chatTime = 0;
  //     this.status = 'waiting';
  //     this.isOriginator = true;
  //     this.isMute = false;
  //     this.waitingForOthers = '';
  //     this.networkQuality = true;
  //     this.soundChange = false;
  //     this.volume = 80;
  //     clearInterval(this.showWindowTimer);
  //     this.showWindowTimer = null;
  //     this.soundChange = false;
  //     this.count = 70;
  //     clearInterval(this.connectTimer);
  //     this.connectTimer = null;
  //     this.connectCount = 20;
  //     (this.noNetworkCall = true), (this.$refs.audioWaiting.currentTime = 0);
  //     this.$refs.audioWaiting.pause();
  //   },
  //   initAudio() {
  //     const { ipcRenderer } = require('electron');
  //     ipcRenderer.removeAllListeners('loadAudio');
  //     ipcRenderer.removeAllListeners('connectingAudio');
  //     ipcRenderer.removeAllListeners('cancelAudio');
  //     ipcRenderer.removeAllListeners('acceptAudio');
  //     ipcRenderer.removeAllListeners('refuseAudio');
  //     ipcRenderer.removeAllListeners('leaveAudio');
  //     ipcRenderer.removeAllListeners('overtimeAudio');
  //     ipcRenderer.removeAllListeners('busyAudio');
  //     ipcRenderer.removeAllListeners('suspendAudio');
  //     ipcRenderer.removeAllListeners('socketCloseAudio');
  //     ipcRenderer.removeAllListeners('othersProcessingAudio');
  //     ipcRenderer.removeAllListeners('onlineAudio');
  //     ipcRenderer.removeAllListeners('offlineAudio');
  //     ipcRenderer.removeAllListeners('cancelAudioForceCloseWin');
  //     ipcRenderer.on('loadAudio', (e, data) => {
  //       this.$nextTick(async () => {
  //         console.log('loadAudio', data);
  //         this.userInfo = data.userInfo;
  //         this.userSig = data.userSig;
  //         this.roomId = data.roomId;
  //         this.status = 'waiting';
  //         this.networkQuality = true;
  //         this.isMute = false;
  //         this.isOriginator = this.userInfo.isOriginator ? this.userInfo.isOriginator : false;
  //         this.timer = window.clearInterval(this.timer);
  //         this.hour = 0;
  //         this.minutes = 0;
  //         this.seconds = 0;
  //         this.chatTime = 0;
  //         this.soundChange = false;
  //         this.volume = 80;
  //         if (this.isOriginator) {
  //           this.waitingForOthers = '正在呼叫中';
  //           this.joinSocket();
  //           this.checkConnectTimeout();
  //         } else {
  //           this.connectingAudio();
  //           this.waitingForOthers = '邀请你接受通话';
  //           this.checkWindowTimeout();
  //         }
  //         this.$refs.audioWaiting.play();
  //       });
  //     });
  //     ipcRenderer.on('connectingAudio', (e, data) => {
  //       this.$nextTick(() => {
  //         console.log('connectingAudio');
  //         this.userSig = data.userSig;
  //         this.roomId = data.roomId;
  //         if (this.isOriginator) {
  //           this.waitingForOthers = '等待对方接受邀请';
  //         } else {
  //           this.waitingForOthers = '邀请你接受通话';
  //         }
  //         this.connectingAudio();
  //         this.checkWindowTimeout();
  //       });
  //     });
  //     ipcRenderer.on('cancelAudio', (e, data) => {
  //       this.$nextTick(() => {
  //         console.log('cancelAudio');
  //         if (data && data.userSig) {
  //           this.userSig = data.userSig;
  //           this.roomId = data.roomId;
  //         }
  //         this.cancelCall();
  //       });
  //     });
  //     ipcRenderer.on('acceptAudio', (e, data) => {
  //       this.$nextTick(async () => {
  //         console.log('acceptAudio');
  //         // this.userInfo = data.userInfo;
  //         if (this.isJoined) {
  //           return;
  //         }
  //         this.userSig = data.userSig;
  //         this.roomId = data.roomId;
  //         await this.joinRoom();
  //         this.acceptCall();
  //         clearInterval(this.showWindowTimer);
  //         this.showWindowTimer = null;
  //       });
  //     });
  //     ipcRenderer.on('refuseAudio', (e, data) => {
  //       this.$nextTick(() => {
  //         // this.userInfo = data.userInfo;
  //         this.userSig = data.userSig;
  //         this.roomId = data.roomId;
  //         console.log('refuseAudio');
  //         this.refuseCall();
  //       });
  //     });
  //     ipcRenderer.on('leaveAudio', (e, data) => {
  //       this.$nextTick(() => {
  //         // this.userInfo = data.userInfo;
  //         this.userSig = data.userSig;
  //         this.roomId = data.roomId;
  //         console.log('leaveAudio');
  //         this.leaveCall();
  //       });
  //     });
  //     ipcRenderer.on('overtimeAudio', (e, data) => {
  //       this.$nextTick(() => {
  //         // this.userInfo = data.userInfo;
  //         this.userSig = data.userSig;
  //         this.roomId = data.roomId;
  //         console.log('overtimeAudio');
  //         this.overtimeCall();
  //       });
  //     });
  //     ipcRenderer.on('busyAudio', (e, data) => {
  //       this.$nextTick(() => {
  //         // this.userInfo = data.userInfo;
  //         this.userSig = data.userSig;
  //         console.log('busyAudio');
  //         // this.roomId = data.roomId;
  //         if (this.roomId != data.roomId) {
  //           return;
  //         } else {
  //           this.busyCall();
  //         }
  //       });
  //     });
  //     ipcRenderer.on('suspendAudio', (e, data) => {
  //       this.$nextTick(() => {
  //         // this.userInfo = data.userInfo;
  //         if (data && data.userSig) {
  //           this.userSig = data.userSig;
  //           this.roomId = data.roomId;
  //         }
  //         console.log('suspendAudio');
  //         this.suspendCall();
  //       });
  //     });
  //     ipcRenderer.on('socketCloseAudio', () => {
  //       this.$nextTick(() => {
  //         console.log('socketCloseAudio');
  //         this.socketCloseAudio();
  //       });
  //     });
  //     ipcRenderer.on('othersProcessingAudio', () => {
  //       this.$nextTick(() => {
  //         console.log('othersProcessingAudio');
  //         this.othersProcessingAudio();
  //       });
  //     });
  //     ipcRenderer.on('onlineAudio', () => {
  //       this.$nextTick(() => {
  //         console.log('onlineAudio');
  //         this.onlineAudio();
  //       });
  //     });
  //     ipcRenderer.on('offlineAudio', () => {
  //       this.$nextTick(() => {
  //         console.log('offlineAudio');
  //         this.offlineAudio();
  //       });
  //     });
  //     ipcRenderer.on('cancelAudioForceCloseWin', () => {
  //       this.$nextTick(() => {
  //         console.log('cancelAudioForceCloseWin');
  //         this.cancelAudio();
  //       });
  //     });
  //   }
  // },
  beforeCreate() {
    this.userInfo = {};
  },
  // mounted() {
  //   this.initAudio();
  //   this.$nextTick(() => {
  //     document.addEventListener('keyup', e => {
  //       if (e.keyCode == 27) {
  //         this.closeWindow();
  //       }
  //     });
  //   });
  // }
};
</script>

<style scoped>
.header-class {
  -webkit-app-region: drag;
  width: 100%;
  z-index: 1001;
}

.audio-main {
  position: relative;
  display: flex;
  width: 300px;
  height: 450px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.user-background-class {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0px;
  top: 0px;
  background-size: 450px !important;
  background-size: cover !important;
  background-position: center !important;
  filter: blur(15px);
}

.user-background-mask-class {
  background: black;
  opacity: 0.7;
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0px;
  top: 0px;
  background-size: 450px !important;
  background-size: cover !important;
  background-position: center !important;
}

.content {
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  width: 300px;
  height: 450px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

/*.content img {*/
/*  width: 54px;*/
/*  height: 54px;*/
/*  border-radius: 50%;*/
/*}*/

.user-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.user-name {
  font-size: 16px;
  color: white;
}

.i1,
.i2 {
  padding-top: 0px;
}
.i1:hover {
  background: #222222;
}
.i2:hover {
  background: #fa5151;
}

.audio-loading {
  display: flex;
  flex-direction: row;
  height: 30px;
  align-items: flex-end;
}

.audio-loading span {
  color: white;
}

.audio-quality span {
  color: white;
}

.audio-user-icon {
  height: 110px;
  display: flex;
  flex-direction: column-reverse;
}

.audio-user-name {
  height: 30px;
  display: flex;
  flex-direction: column-reverse;
}

.audio-sound {
  height: 100px;
}

.audio-stop {
  position: relative;
  height: 100px;
  display: flex;
  align-items: flex-end;
  width: 270px;
  justify-content: space-around;
}

.audio-description {
  position: absolute;
  height: 10px;
  display: flex;
  align-items: flex-end;
  width: 270px;
  justify-content: space-around;
  color: white;
  font-size: 12px;
  top: 113px;
}

.audio-sound-control {
  position: absolute;
  left: 206px;
  top: -60px;
}
.message-box-class {
  width: 280px;
}
</style>
<style>
.audio-sound-control .el-slider__button {
  width: 10px;
  height: 10px;
}
</style>
