<template>
  <div @contextmenu.prevent="rightClick($event)">
    <div class="words"  @mousedown="handleUserSelectText" v-if="messageItem.msgType == '1' || messageItem.msgType == '25'" >
      <MessageFormatText v-bind:text="messageItem.text || messageItem.msgBody.text" :item="item" />
    </div>

    <div
        v-else-if="messageItem.msgType == '6'"
        class="fileBox"
        v-loading="downloadLoading"
        element-loading-spinner="el-icon-loading"
    >
      <div class="flex align-center" @click="onOpenFile(messageItem)">
        <div class="flex-sub flex-direction" style="width: 80%">
          <!-- <p class="text-cut">{{item.msgBody && (item.msgBody.fileName || item.msgBody.fname)}}</p> -->
          <!-- <p>{{item.msgBody.fsize | formatFileSize}}    </p> -->
          <span class="file-title">{{ messageItem.msgBody && (messageItem.msgBody.fileName || messageItem.msgBody.fname) }}</span>
          <p class="file-size">
            {{ messageItem.msgBody.fsize | formatFileSize }}
          </p>
        </div>
        <img :src="require(`../../../../assets/images/${getFileType(messageItem.msgBody.format)}.png`)" width="40" height="40" alt />
      </div>
      <div class="load-border text-right">
        <span v-if="!messageItem.msgBody.downloadFinished && messageItem.msgBody.downloadPercent">
          {{ $t('personal_0026') }}{{ messageItem.msgBody.downloadPercent }}
        </span>
        <span
            v-if="!messageItem.msgBody.downloadPercent && isShowRight && messageItem.sendStatus != 1 && messageItem.sendStatus != -1"
            ref="downloadbutton"
            @click="downFile(messageItem.msgBody)"
        >{{ $t('Universal_0358') }}</span
        >
        <span v-if="messageItem.msgBody.downloadFinished && isShowRight" @click="openFile(messageItem)">
          {{ $t('Universal_0356') }}
        </span>
        <span v-if="messageItem.msgBody.downloadFinished && isShowRight" @click="saveFileAs(messageItem.msgBody)">
          {{ $t('Universal_0357') }}
        </span>
        <!--        <span v-if="isShowRight" @click="delFileListHand(item, 'list')">删除</span>-->
      </div>
    </div>
    <div v-else-if="messageItem.msgType == '2'" class="imgMsg" >
       <el-progress type="circle"
              style="left:50%;transform:translate(-50%,-50%)"
              :percentage="downloadTaskInfoPer"
              class="downloadProcess"
              :show-text="false"
              :width="40"
              v-if="downloadTaskInfoPer<100"
              color="#2f54eb"
              :stroke-width="3"
              :key="messageItem['reqId']"
      ></el-progress>
      <img 
           :src="findImage(messageItem)"
           alt
           @click="viewerShowChild(messageItem)"
           @load="loadImg"
           :class="rate"
           @error="handlerImgErr"
           :style="viewpicStyle"
           :width="messageItem.msgBody.width"
           :height="messageItem.msgBody.height"
      />
    </div>
    <div v-else-if="messageItem.msgType == '10'" class="videoMsg" @click="viewerShowChild(messageItem)">
       <!-- v-if="messageItem.msgBody.firstFrame.height === 0 || messageItem.msgBody.firstFrame.width === 0" -->
      <video
          v-if="!messageItem.msgBody.fileNo && !messageItem.msgBody.downloadFinished && !messageItem.msgBody.firstFrame.mediaId"
          :src="messageItem.msgBody.fileId"
          class="videoShow"
          :height="messageItem.msgBody.firstFrame.height"
          :width="messageItem.msgBody.firstFrame.width"
      ></video>
      <img
          v-else
          :src="messageItem.msgBody.firstFrame.mediaId"
          alt=""
          class="videoShow"
          :height="messageItem.msgBody.firstFrame.height"
          :width="messageItem.msgBody.firstFrame.width"
      />
      <i class="el-icon-video-play videoStart"
         v-show="(messageItem.msgBody.downloadFinished||videoDownloadPercent[messageItem.msgId]===100||
         videoDownloadPercent[messageItem.msgId]===undefined)&&
         messageItem.msgBody.downloadPath&&
         !fileBeCleared[messageItem.msgId]" />
      <span class="progress-mask"
            v-show="messageItem.msgBody.downloadLoading&&
            videoDownloadPercent[messageItem.msgId]!==100&&videoDownloadPercent[messageItem.msgId]!==undefined&&
            !fileBeCleared[messageItem.msgId]"></span>
      <el-progress type="circle"
                   ref="progress"
                   :percentage="videoDownloadPercent[messageItem.msgId]||0"
                   class="downloadProcess"
                   :show-text="false"
                   :width="40"
                   v-show="videoDownloadPercent[messageItem.msgId]<100&&!fileBeCleared[messageItem.msgId]"
                   color="#2f54eb"
                   :stroke-width="3"
                   :key="messageItem.msgId"
      ></el-progress>
      <i class="el-icon-warning videoStart"
         v-show="fileBeCleared[messageItem.msgId]||videoNotInCurrentPC[messageItem.msgId]"></i>
    </div>
    <div v-else-if="messageItem.msgType == '9'" class="audio-wrap" @click="handArm(messageItem.msgBody.fileId)">
      <span>
        <img :src="soundUrl" alt />
        {{ messageItem.msgBody.dur }}"
      </span>
    </div>
    <div v-else-if="messageItem.msgType == '15'" class="carte">
      <div class="cardinfo" v-if="messageItem.msgBody.type == '2'">
        <img :src="messageItem.msgBody.msgUrl" />
        <span class="cardName" style="margin-left:5px;">
          <label class="" style="color: #333">{{ messageItem.msgBody.name }}</label>
          <br />
          <label style="font-size:10px;color:#999">ID:{{ messageItem.msgBody.code }}</label>
        </span>
      </div>
      <div class="cardinfo" v-else>
        <MemberIcon
            :vipType="Number(messageItem.msgBody.vipType)"
            :image="messageItem.msgBody.msgUrl"
            iconType="mini"
            :userRank="+messageItem.msgBody.userRank"
        />
        <div class="topitem">
          <span style="display:flex;align-items:center;margin-bottom:5px;">
            <label class="cardName" style="color: #333">{{ messageItem.msgBody.name }}</label>
            <LevelIcon
                :inviteCode="messageItem.msgBody.code"
                :userRank="+messageItem.msgBody.userRank"
                iconType="small"
                :vipType="+messageItem.msgBody.vipType"
                :inviteCodeType="+messageItem.msgBody.inviteCodeType"
                :listFlag="true"
                style="padding-left: 2px;"
            />
          </span>
          <!-- {{ item.msgBody.code }} -->
          <LuckIdIcon
              :inviteCode="messageItem.msgBody.code"
              :userRank="+messageItem.msgBody.userRank"
              iconType="medium"
              :vipType="+messageItem.msgBody.vipType"
              :inviteCodeType="+messageItem.msgBody.inviteCodeType"
              :listFlag="false"
          />
        </div>
      </div>
      <p v-if="messageItem.msgBody.type == 1">{{ $t('chat_0021') }}</p>
      <p v-else>{{ $t('chat_0023') }}</p>
    </div>
    <div v-else-if="messageItem.msgType == '40'" class="mergeTransferClass" @click="showMergeTransferMessageDialog">
      <div class="flex flex-direction">
        <!--        <span class="title">{{ messageItem.msgBody.title || '多人' }}的聊天记录</span>-->
        <span class="title" v-if="messageItem.msgBody.title">{{ $t('chat_0045',{value: messageItem.msgBody.title}) }}</span>
        <span class="title" v-else>{{ $t('chat_0043') }}</span>
        <span class="content">
          <ul>
            <li
                v-for="(message, index) in messageItem.msgBody.msgs"
                v-if="index < 4"
                :key="index"
                class="flex  align-center justify-between"
            >
              <span v-if="message.msgType == '1' || message.msgType == '25'" class="user-sign">
                <span>{{ `${message.fromName || ''}: ` }}</span>
                <MessageFormatText linkFlag v-bind:text="message.msgBody.text" />
              </span>
              <span class="text" v-else>{{ messageDetail(message) }}</span>
            </li>
          </ul>
        </span>
        <el-divider class="mergeDivider"></el-divider>
        <span class="blue">{{ $t('chat_0042') }}</span>
      </div>
    </div>
    <div v-else-if="messageItem.msgType == '11'" @click="resendCallAudio" class="audio-call-class">
      <div v-if="messageItem.fromType == 700"><img :src="telephoneUrl" class="telephone-class" alt />
        {{ $t('Universal_0088') }}
      </div>
      <div v-if="messageItem.fromType == 703"><img :src="telephoneUrl" class="telephone-class" alt />
        {{ $t('chat_voice_0040') }}
      </div>
      <div v-if="messageItem.fromType == 704">
        <img :src="telephoneUrl" class="telephone-class" alt />{{ $t('chat_voice_0047') }}
        {{ chatTime }}
      </div>
      <div v-if="messageItem.fromType == 705">
        <img :src="telephoneUrl" class="telephone-class" alt />
        <span v-if="isCaller">{{ $t('chat_voice_0035') }}</span>
        <span v-else>{{ $t('chat_voice_0036') }}</span>
      </div>
      <div v-if="messageItem.fromType == 706"><img :src="telephoneUrl" class="telephone-class" alt />
        {{ $t('chat_voice_0041') }}
      </div>
      <div v-if="messageItem.fromType == 707"><img :src="telephoneUrl" class="telephone-class" alt />
        {{ $t('chat_voice_0037') }}
      </div>
      <div v-if="messageItem.fromType == 712">
        <img :src="telephoneUrl" class="telephone-class" alt />{{ $t('chat_voice_0043') }}
        {{ chatTime }}
      </div>
    </div>
    <div v-else-if="messageItem.msgType == '56'" class="acitivity" @click="goActivityPage(messageItem)">
      <img :src="messageItem.msgBody.imgUrl" alt="">
      <p class="title">{{messageItem.msgBody.title}}</p>
      <!-- <p class="content">{{messageItem.msgBody.text}}</p> -->
      <div class="bottom">
        <img src="../../../../assets/images/didi_activity_icon.png" alt=""><p>{{$t('chat_0125')}}</p>
      </div>
    </div>
    <!-- <div v-else>不支持的消息， 请到APP查看</div> -->
    <MergeTransferMessage :title="messageItem.msgBody.title" :msgItem="messageItem" ref="mergeTransferMessageDialog" />
  </div>
</template>

<script>
import { remote, shell as eShell } from 'electron';
import { checkIsExists, checkVideoIsExists, mkdir } from '@/utils/file';
import MessageFormatText from '@/view/chat/components/common/MessageFormatText';
import MergeTransferMessage from '@/view/chat/components/common/MergeTransferMessage';
import fileOperational from '@/services/fileOperational';
import SQLUtils from '@/components/db/sqlite.js';
import request from 'request';
import fs from 'fs';
import path from 'path';
import store from '@/store';
import MemberIcon from '@/components/memberIcon/MemberIcon';
import LevelIcon from '@/components/memberIcon/LevelIcon';
import LuckIdIcon from '@/components/memberIcon/luckIdIcon';
import UserInfoUtils from '@/utils/UserInfoUtils.js';
import emojiList from '@/utils/emoji.js';
import { mapActions, mapGetters } from "vuex";
import { otherVideoTypeArr } from '@/utils/const';
import {checkFileIsExists, checkUrl } from "@/utils/file";
import { parseUniqueCode } from '@/utils/const';
import { goOfficialPage } from '@/utils';
let configDir = path.join(remote.app.getPath('appData'), `${process.env.VUE_APP_ID}`);
let baseDir = path.join(configDir, 'files');
const { FileUpload } = require('@/utils/fileUpload');
import { videoCode} from "@/utils/const";

export default {
  name: 'MessageFormatOnline',
  inject: ["scrollToBottom"],
  components: {
    MessageFormatText,
    MergeTransferMessage,
    MemberIcon,
    LevelIcon,
    LuckIdIcon
  },
  computed: {
    ...mapGetters(['videoDownloadPercent', 'fileBeCleared', 'videoNotInCurrentPC','chatList','gettersDownloadTaskInfoByID']),
    getCurDownloadTaskInfo() {
      return this.gettersDownloadTaskInfoByID(this.item?.msgBody?.mediaId)||100;
    },
    messageDetail() {
      return message => {
        let msgTypeObject = {
          6: this.$t('chat_0017'),
          2: this.$t('chat_0013'),
          10: this.$t('chat_0015'),
          15: this.$t('chat_0024'),
          40: '['+this.$t('chat_0042')+']',
          14: '['+this.$t('opinions_0006')+']',
          44: '[Dapp]',
          56: this.$t('Universal_0454'),
          61: this.$t('chat_0127'),
        };
        let result = '';
        if (message.msgType != 15) {
          result = `${message.fromName || ''}: ${msgTypeObject[message.msgType]}`;
        } else {
          if (message.msgBody.type == '1') {
            result = `${message.fromName || ''}: [${this.$t('chat_0021')}]`;
          } else {
            result = `${message.fromName || ''}: [${this.$t('chat_0023')}]`;
          }
        }
        return result;
      };
    },
    viewpicStyle() {
      if (this.rate === 'Hcale3Midwidth') {
        return {
          width: `${this.item.msgBody.width}px`,
          height: `${(this.item.msgBody.width * 1) / 3}px`
        };
      }
      if (this.rate === 'Wcale3MidHight') {
        return {
          width: `${(this.item.msgBody.height * 1) / 3}px`,
          height: this.item.msgBody.height
        };
      }
      this.$nextTick(() => {
        if(document.getElementById(this.messageItem.reqId) && this.messageItem.msgBody.format == 'gif'){
          console.log(this.$refs[this.messageItem.reqId].naturalWidth,'wswww',
            document.getElementById(this.messageItem.reqId).naturalHeight)
          return{
            width: `${this.$refs[this.messageItem.reqId].naturalWidth}px`,
            height: `${this.$refs[this.messageItem.reqId].naturalHeight}px`
          }
        }
      })
      return{}
    },
    downloadFileInfo() {
      return store.state.common.downloadFile;
    },
    loadDownloadPercent() {
      let downloadFile = this.$store.state.common.downloadFile;
      if (downloadFile && downloadFile[this.messageItem.msgBody.reqId]) {
        return downloadFile[this.messageItem.msgBody.reqId].downloadPercent;
      } else {
        return '';
      }
    },
    loadDownloadPath() {
      let downloadFile = this.$store.state.common.downloadFile;
      if (downloadFile && downloadFile[this.messageItem.msgBody.reqId]) {
        return downloadFile[this.messageItem.msgBody.reqId].downloadPath;
      } else {
        return '';
      }
    },
    chatTime() {
      if (!this.item.msgBody || !this.item.msgBody.time) {
        return '';
      }
      let time = this.item.msgBody.time;
      if (time == 0) {
        return '';
      }
      let hour = Math.floor(time / 3600);
      let minute = Math.floor((time - 3600 * hour) / 60);
      let seconds = time - 3600 * hour - 60 * minute;
      if (hour > 0) {
        return `${this.prefixInteger(hour)}:${this.prefixInteger(minute)}:${this.prefixInteger(seconds)}`;
      } else {
        return `${this.prefixInteger(minute)}:${this.prefixInteger(seconds)}`;
      }
    },
    isCaller() {
      return this.item.fromId == UserInfoUtils.getCurrentUserId();
    },
    // 语音消息
    isAudioMsgType() {
      return this.item['msgType'] == 9;
    },
    getMyInfo() {
      return this.$store.state.common?.userInfo || {}; //自己的信息
    },
    getSoundPng() {
      let that = this;
      // eslint-disable-next-line no-unused-vars
      let { vipType, userRank, fromId } = that.messageItem || {},
        imgSrc;
      // console.log('%c～before、online png～','font-size:30px',vipType)
      if (that.getMyInfo['id'] == fromId) {
        //单聊->自己的语音
        vipType = that.getMyInfo['vipType'] || vipType;
        // userRank = that.getMyInfo['userRank'] || userRank;
      } else {
        vipType = vipType || that.userInfo?.vipType || 0;
        // userRank = userRank || that.userInfo?.userRank;
      }
      // console.log('%c～after、online png～','font-size:30px',vipType)
      // imgSrc = userRank >= 31 ?
      //   require("../../../../assets/images/audio_master.png")
      //   :
      imgSrc = vipType == 1 ? require('../../../../assets/images/audio_vip.png') : require('../../../../assets/images/audio.png');
      return imgSrc;
    },
    getSoundGif() {
      let that = this;
      // eslint-disable-next-line no-unused-vars
      let { vipType, userRank, fromId } = that.messageItem || {},
        imgSrc;
      if (that.getMyInfo['id'] == fromId) {
        //单聊->自己的语音
        vipType = that.getMyInfo['vipType'] || vipType;
        // userRank = that.getMyInfo['userRank'] || userRank;
      } else {
        vipType = vipType || that.userInfo?.vipType || 0;
        // userRank = userRank || that.userInfo?.userRank;
      }
      // imgSrc = userRank >= 31 ?
      //   require("../../../../assets/images/audio_play_vip.gif")
      //   :
      imgSrc = vipType == 1 ? require('../../../../assets/images/audio_play_vip.gif') : require('../../../../assets/images/audio_play.gif');
      return imgSrc;
    }
  },
  data() {
    return {
      downloadTaskInfoPer:100,
      isPlayViedo: false,
      amr: '',
      soundUrl: require('../../../../assets/images/audio.png'),
      messageItem: this.item,
      rate: 'origin', //图片宽高比描述
      mergeTransferMessageVisible: false,
      telephoneUrl: require('../../../../assets/images/telephone.png'),
      emojiList: emojiList,
      patt: /\[([^\\[])+?\]/g,
      downloadLoading: false,
      tiffKey: '',
      showText: Boolean(false),
      progressWidth: 40,
      downloadKey: ''
    };
  },
  props: {
    item: { require: true },
    userInfo: { type: Object, default: () => {} }, //单聊绑定userInfo(对方);群聊、讨论存在 vipType, userRank,用不着该props
    imglsit: { require: true },
    isShowRight: { default: true },
    showAppealClosureNotice: { default: false },//群聊是否封停标识
    fromGroupType: { default: "" },//来源类型是群还是讨论组
    groupAuthByUser: { default: "" },
    soundUrlObj: {
      type: Object,
      default: () => ({
        image: require('../../../../assets/images/audio.png'),
        id: ''
      })
    },
    friendId: {
      type: String,
      default() {
        return '';
      }
    }
  },
  watch: {
    getCurDownloadTaskInfo(v){
      this.downloadTaskInfoPer=v;
    },
    item: {
      immediate: true,
      deep: true,
      handler: async function(val) {
        if(val.msgBody && val.msgBody.firstFrame) {
          const rate = val.msgBody.firstFrame.width / val.msgBody.firstFrame.height;
          if (rate > 1) {
            // 比例基 300px
            val.msgBody.firstFrame.width = 250
            val.msgBody.firstFrame.height = 140
          }else {
            val.msgBody.firstFrame.width = 140
            val.msgBody.firstFrame.height = 250
          }
        }
        // if (val.msgBody.format && val.msgBody.format === 'tiff' && !val.msgBody.tiffPath) {
        //   await this.showTiff(val, val.msgBody.localId);
        // }
        if (val.msgType === '10') {
          // 视频，自动下载
          // 如果有downloadPath,判断是否是在本机
          let inCurrentPC = true;
          if (val.msgBody.downloadPath) {
            let paths = val.msgBody.downloadPath.split('\\files\\')[0];
            inCurrentPC = configDir.includes(paths);
          }

          if (val.msgId && (!val.msgBody.downloadPath || !inCurrentPC)) {
            if(!this.isDownloading){
              console.log('视频，自动下载')
              this.isDownloading = true;
              await this.downloadVideo(val);
              this.isDownloading = false;
              this.$store.commit('CLEAR_FILE_DOWNLOAD', {msId: val.msgId, beCleared: false});
            }
          }
          // 针对手机端发送过来的视频
          // if (!val.msgBody.noFirstFrame && !val.msgBody.isH265) {
          //   await videoImg(val, async (flag) => {
          //     val.msgBody.noFirstFrame = flag;
          //     if (val.msgId) {
          //       await this.updateMessageByMsgId(val);
          //     }
          //   });
          // }
          // if (!val.msgBody.isSupportVideo) {
          //   // 需要判断是否
          //   // const files = new FileUpload(val.msgBody.downloadPath,val.reqId);
          //   // const isSupportVideo = await this.isSupportVideoPlay(files)
          //   // console.log('isSupportVideo ====>', isSupportVideo);
          //   await videoImg(val, async (flag) => {
          //     val.msgBody.isSupportVideo = flag;
          //     if (val.msgId) {
          //       await this.updateMessageByMsgId(val);
          //     }
          //   });
          // }
        }
        this.messageItem = val;
      }
    },
    soundUrlObj: {
      deep: true,
      immediate: true,
      handler: function() {
        if (this.messageItem.msgId !== this.soundUrlObj.id) {
          this.soundUrl = this.getSoundPng;
        }
        if (this.messageItem.msgId === this.soundUrlObj.id) {
          this.soundUrl = this.soundUrlObj.image;
        }
      }
    },
    getMyInfo: {
      deep: true,
      handler: function({ vipType, id }) {
        let { fromId, msgType } = this.item;
        if (msgType == 9 && fromId == id) {
          //更新会员信息 语音图标
          this.$set(this.messageItem, 'vipType', vipType);
          this.soundUrl = this.getSoundPng;
        }
      }
    },
    // 单聊绑定userInfo(对方);
    userInfo: {
      deep: true,
      handler(v) {
        if (v) {
          // console.log(v,v.vipType)
          this.soundUrl = this.getSoundPng;
        }
      }
    }
  },
  methods: {
    ...mapActions(['actionCurrentMsgId']),
    replaceEmoji(newVal) {
      let originText;
      let arr;
      if (newVal) {
        originText = newVal;
        arr = originText.match(this.patt);
      }
      if (arr && originText) {
        for (let index = 0; index < arr.length; index++) {
          let item = arr[index];
          let ret = this.emojiList.find(x => x.tag == item);
          if (ret) {
            /*eslint max-len: ["error", { "code": 140 }]*/
            let img = `<img src="/resources/emoji/${ret.file}" width=22px style="vertical-align: middle;margin: -5px 2px 0 2px" />`;
            originText = originText.replace(item, img);
          }
        }
      }
      return originText;
    },
    showMergeTransferMessageDialog() {
      console.log('showMergeTransferMessageDialog- ',this.messageItem)
      this.messageItem.msgBody.msgs.forEach(item => {
        item.uniqueCode = this.messageItem.uniqueCode;
        item.targetType = this.messageItem.targetType;
      });
      this.$nextTick(() => {
        this.$refs.mergeTransferMessageDialog.onPop();
      });
    },
    prefixInteger(num) {
      return (Array(2).join('0') + num).slice(-2);
    },
    loadImg() {
      // console.log("11111111111111111111111111")
      //加载图片完成后，scroll到最下面，防止图片加载过慢时，屏幕在中间的情况
      // 加判断条件：第一屏消息，否则加载更多时，总是滚动到最底部
      if(this.chatList?.[this.chatList.length-1]?.reqId==this.messageItem.reqId && this.chatList.length < 31){
        this.scrollToBottom()
      }
      // this.$emit('scrollBottom');
    },
    refreshDownloadPercentInStore() {
      this.messageItem.msgBody.timer = setInterval(() => {
        if (this.downloadFileInfo && this.downloadFileInfo[this.messageItem.msgBody.reqId]) {
          this.messageItem.msgBody.downloadFinished = this.downloadFileInfo[this.messageItem.msgBody.reqId].downloadFinished;
          this.messageItem.msgBody.downloadPercent = this.downloadFileInfo[this.messageItem.msgBody.reqId].downloadPercent;
          this.messageItem.msgBody.downloadPath = this.downloadFileInfo[this.messageItem.msgBody.reqId].downloadPath;
        } else {
          this.stopLoadDownloadPercent();
        }
        if (this.messageItem.msgBody.downloadFinished) {
          this.stopLoadDownloadPercent();
        }
      }, 1000);
    },
    stopLoadDownloadPercent() {
      clearInterval(this.messageItem.msgBody.timer);
      this.messageItem.msgBody.timer = null;
    },
    viewerShowChild(item) {
      // 没有下载完成的视频点击无效
      if (item.msgType == '10' && this.videoDownloadPercent[item.msgId]<100) return;
      //TODO 组件通用化 禁止直接使用$parent
      if (item.sendStatus != 1 && item.sendStatus != -1) {
        this.$parent.viewerShow(item);
      }
    },
    async handArm(val) {
      await this.$nextTick();
      let obj = JSON.parse(JSON.stringify(this.messageItem)),timer;
      this.$emit('handArm', val, this.messageItem.msgId, obj);
      timer = setTimeout(()=>{
        this.$emit('acceptMessage',this.messageItem);
        clearTimeout(timer);
        timer = null;
      },1000)

    },
    async downloadFile(fileItem) {
      const fullPath = await fileOperational.downloadFile(fileItem.fileId, fileItem.fname);
      let fileState = { key: fileItem.reqId, value: {} };
      fileState.value.downloadPercent = '100%';
      fileState.value.downloadPath = fullPath;
      fileState.value.downloadFinished = true;
      this.messageItem.msgBody.downloadPercent = '100%';
      this.messageItem.msgBody.downloadPath = fullPath;
      this.messageItem.msgBody.downloadFinished = true;
      this.$store.commit('SET_DOWNLOAD_FILE_INFO', fileState);
    },
    async saveFileAs(fileItem) {
      if (!fileItem.downloadPath) return;
      let filePath = fileItem.downloadPath.replace('\\', '/');
      console.log('file-path', filePath);
      fs.exists(filePath, exists => {
        if (!exists) {
          this.$message.error(this.$t('chat_0097'));
        } else {
          const ipc = require('electron').ipcRenderer;
          ipc.send('saveAsFile', fileItem);
        }
      });
    },
    debounce(fn, delay) {
      delay = delay || 200;
      let timer;
      return function() {
        let th = this;
        let args = arguments;
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(function() {
          timer = null;
          fn.apply(th, args);
        }, delay);
      };
    },
    startDownloadFile(fileItem) {
      this.$refs.downloadbutton.style.visibility = 'hidden';
      this.$nextTick(() => {
        this.downFile(fileItem);
      });
    },
    async downFile(fileItem) {
      console.log('downFile--fileItem--', fileItem);
      this.downloadLoading = true;
      if (fileItem.downloadPercent == undefined) {
        this.messageItem.msgBody.reqId = this.messageItem.reqId;
        this.messageItem.msgBody.downloadPercent = '';
        this.messageItem.msgBody.downloadFinished = false;
        this.messageItem.msgBody.downloadPath = '';
        fileItem.reqId = this.messageItem.reqId;
        fileItem.downloadPercent = '';
        fileItem.downloadFinished = false;
        fileItem.downloadPath = '';
      }
      const percentFloat = fileItem.downloadPercent.slice(0, -1) / 100;
      if (0 < percentFloat && percentFloat < 1) return;
      let configDir = path.join(remote.app.getPath('appData'), `${process.env.VUE_APP_ID}`);
      let baseDir = path.join(configDir, 'files');
      mkdir(baseDir);
      let receivedBytes = 0;
      let totalBytes = 0;
      let fileName = fileItem.fname;
      let fullPath = '';
      if (checkIsExists(baseDir, fileName)) {
        let i = 1;
        let suffixIndex = fileName.lastIndexOf('.');
        let fileNamePrefix = fileName.substr(0, suffixIndex);
        let fileNameSuffix = fileName.substr(suffixIndex);
        let isExistsFileName = fileNamePrefix
          .concat('(')
          .concat('' + i)
          .concat(')')
          .concat(fileNameSuffix);
        while (checkIsExists(baseDir, isExistsFileName)) {
          ++i;
          isExistsFileName = fileNamePrefix
            .concat('(')
            .concat('' + i)
            .concat(')')
            .concat(fileNameSuffix);
        }
        fileName = isExistsFileName;
      }
      fullPath = path.join(baseDir, fileName);
      let fileState = { key: fileItem.reqId, value: {} };
      console.log('fileState', fileState);
      fileState.value.downloadPercent = '';
      fileState.value.downloadFinished = false;
      fileState.value.downloadPath = '';
      this.messageItem.msgBody.downloadPercent = '';
      this.messageItem.msgBody.downloadFinished = false;
      this.messageItem.msgBody.downloadPath = '';
      this.$store.commit('SET_DOWNLOAD_FILE_INFO', fileState);
      this.refreshDownloadPercentInStore();

      const req = request({
        method: 'GET',
        uri: fileItem.fileId,
        strictSSL: false
      });

      req.pipe(fs.createWriteStream(fullPath));

      req.on('response', data => {
        console.log('response-data', data);
        // 更新总文件字节大小
        totalBytes = parseInt(data.headers['content-length'], 10);
        console.log('response-totalBytes', totalBytes);
      });

      req.on('data', chunk => {
        // 更新下载的文件块字节大小
        receivedBytes += chunk.length;
        fileState.value.downloadPercent = ((receivedBytes / totalBytes) * 100).toFixed(0) + '%';
        this.$store.commit('SET_DOWNLOAD_FILE_INFO', fileState);
        this.downloadLoading = false;
      });
      req.on('error', async () => {
        fileState.value.downloadPercent = '';
        fileState.value.downloadFinished = false;
        fileState.value.downloadPath = '';
        this.downloadLoading = false;
        this.$store.commit('SET_DOWNLOAD_FILE_INFO', fileState);
        await SQLUtils.updateDownloadFileMsgBody(fileState, this.friendId);
      });
      req.on('end', async () => {
        fileState.value.downloadPath = fullPath;
        fileState.value.downloadFinished = true;
        this.$store.commit('SET_DOWNLOAD_FILE_INFO', fileState);
        await SQLUtils.updateDownloadFileMsgBody(fileState, this.friendId);
      });
    },
    onOpenFile(item) {
      if (!item.msgBody.downloadPercent && !item.msgBody.downloadFinished) {
        this.downFile(item.msgBody);
      }
      if (item.msgBody.downloadFinished && this.isShowRight) {
        if(process.platform==='darwin'){
          this.$remote.getCurrentWindow().previewFile(item.msgBody.downloadPath.replace("file:///",""))
        }else{
          this.openFile(item);
        }
      }
    },
    openFile(item) {
      if (!item.msgBody.downloadPath) return;
      let filePath = item.msgBody.downloadPath.replace('\\', '/');
      fs.exists(filePath, exists => {
        if (!exists) {
          this.$message.error(this.$t('chat_0097'));
        } else {
          let path = item.msgBody.downloadPath.replace(/\\/g, '\\\\');
          if (otherVideoTypeArr.includes(item.msgBody.format)) {
            // 不支持的视频格式
            this.$confirm(
              this.$t('chat_0122'),
              this.$t('Universal_0059'),
              {
                confirmButtonText: this.$t('Universal_0356'),
                cancelButtonText: this.$t('Universal_0063'),
                type: "info",
              }
            ).then(() => {
              eShell.showItemInFolder(item.msgBody.downloadPath);
            }).catch(e => {
              console.error(e);
            });
            return;
          } else {
            eShell.openPath(path);
          }
        }
      });
    },
    delFileListHand(item) {
      this.$emit('delMsg', 2, item);
    },
    rightClick(e) {
      console.log('rightClick=====>');
      //判断群聊是否封停
      if(this.showAppealClosureNotice){
        let message = this.fromGroupType === 'group' ? this.$t('appeal_0013') : this.$t('appeal_0014');
        this.$message.error(message);
        return;
      }
      if (
        this.messageItem.msgType == 11 ||
          (this.messageItem.msgType != '14' &&
              this.messageItem.msgType != '16' &&
              this.messageItem.sendStatus != 1 &&
              this.messageItem.sendStatus != -1 &&
              this.messageItem.isDecrypt != 0)
      ) {
        e.preventDefault();
        this.addClick();
      }else if(
        this.messageItem.msgType == 11 ||
          (this.messageItem.msgType != '14' &&
              this.messageItem.msgType != '16' &&
              this.messageItem.sendStatus == -1 &&
              this.messageItem.isDecrypt != 0)
      ){
        e.preventDefault();
        this.addClickFailMsg();
      }
    },
    delFileChatListHand(item) {
      this.$emit('delMsg', 2, item);
    },
    addClick() {
      console.log('右击item  ', this.messageItem);
      let infocard;
      let fileName;
      if (this.messageItem.msgBody && this.messageItem.msgType == 15 && !(this.messageItem.msgBody instanceof Object)) {
        let msgBody = JSON.parse(this.messageItem.msgBody);
        infocard = msgBody.type == 1 ? `[${this.$t('chat_0021')}]${msgBody.name}` : `[${this.$t('chat_0023')}]${msgBody.name}`;
      } else {
        let card = this.messageItem.msgBody.type == 1 ? '['+this.$t('chat_0021')+']' : '['+this.$t('chat_0023')+']';
        infocard = `${card}${this.messageItem.msgBody.name}`;
      }
      if (this.messageItem.msgBody && this.messageItem.msgType == 6 && !(this.messageItem.msgBody instanceof Object)) {
        let msgBody = JSON.parse(this.messageItem.msgBody);
        fileName = msgBody.fname ? `${this.$t('chat_0017')}${msgBody.fname}` : `${this.$t('chat_0017')}${msgBody.fileName}`;
      } else {
        fileName = this.messageItem.msgBody.fname
          ? `${this.$t('chat_0017')}${this.messageItem.msgBody.fname}`
          : `${this.$t('chat_0017')}${this.messageItem.msgBody.fileName}`;
      }
      const quoteMsg = {
        1: this.messageItem.msgBody.text,
        2: this.$t('chat_0013'),
        15: infocard,
        10: this.$t('chat_0015'),
        6: fileName,
        25: this.messageItem.msgBody.text,
        56: this.$t('Universal_0454')+' '+this.messageItem.msgBody.text
      }[this.messageItem.msgType];
      const quotTypes = ['1', '2', '6', '10', '15', '25', '40', '56'];
      const isAudioMessage = this.messageItem.msgType == 11;
      const rightClickOptions = [
        //   {
        //   name: "复制",
        //   fun: () => {
        //     const buffer = Buffer.from(this.messageItem.text, 'utf8')
        //     clipboard.writeBuffer('public.utf8-plain-text', buffer)
        //   }
        // },
      ];
      if (this.messageItem.msgType == '1' || this.messageItem.msgType == '25' || this.messageItem.msgType == '2') {
        if (this.messageItem.msgType == '2') {
          const fileName = fileOperational.getFileName(this.messageItem.msgBody.mediaId);
          if (fileName.split('.')[1] != 'gif') {
            rightClickOptions.push({
              name: this.$t('chat_0026'),
              fun: () => {
                this.$parent.copyText(this.messageItem);
              }
            });
          }
        } else {
          rightClickOptions.push({
            name: this.$t('chat_0026'),
            fun: () => {
              this.$parent.copyText(this.messageItem);
            }
          });
        }
      }
      this.messageItem.msgType = this.messageItem.msgType + '';
      // 转发
      if (this.messageItem.msgType != '9' && !isAudioMessage) {
        rightClickOptions.push({
          name: this.$t('chat_0027'),
          fun: () => {
            // store.commit(SET_TRANSFER_ITEM, [this.messageItem]);
            this.$parent.showDialogRelay([this.messageItem]);
          }
        });
      }
      if (this.messageItem.msgType != '40' && quotTypes.indexOf(this.messageItem.msgType) > -1) {
        rightClickOptions.push({
          name: this.$t('chat_0028'),
          fun: () => {
            this.$parent.transferQuote(this.messageItem, quoteMsg);
          }
        });
      }

      // 文件另存为
      if (this.messageItem.msgType == '6' && this.messageItem.msgBody.downloadFinished) {
        rightClickOptions.push({
          name: this.$t('Universal_0357'),
          fun: () => {
            this.saveFileAs(this.messageItem.msgBody);
          }
        });
      }
      // 自己发的消息任何时候都可以撤回
      if (
        !isAudioMessage &&
          (this.messageItem.fromId == localStorage.getItem('userId') ||
              (this.messageItem.targetType == 2 && [1, 2].includes(this.groupAuthByUser)))
      ) {
        rightClickOptions.push({
          name: this.$t('chat_0031'),
          fun: () => {
            console.log('撤回');
            this.$emit('withdrawMessage', this.messageItem);
          }
        });
      }
      rightClickOptions.push({
        name: this.$t('chat_0032'),
        fun: () => {
          this.$emit('delMsg', 2, this.messageItem);
        }
      });
      if (quotTypes.indexOf(this.messageItem.msgType) > -1) {
        rightClickOptions.push({
          name: this.$t('Universal_0044'),
          fun: () => {
            this.$emit('mutiChoose', this.messageItem.msgId);
          }
        });
      }
      if (!this.isShowRight) {
        return;
      } else {
        return this.$RightClick(rightClickOptions).popup({
          window: remote.getCurrentWindow()
        });
      }

    },
    addClickFailMsg(){
      const rightClickOptions = [];
      // 重发
      rightClickOptions.push({
        name: this.$t('Universal_0048'),
        fun: async () => {
          this.messageItem.sendStatus = 1;
          this.messageItem.fromResend = true;
          await SQLUtils.sendMessageStatusSending(this.messageItem.targetId, this.messageItem.reqId);
          if (this.messageItem.msgType == 2) {
            this.messageItem.path = this.messageItem.msgBody.path;
            this.messageItem.reqId = this.messageItem.msgBody.reqId;
            this.messageItem.size = this.messageItem.msgBody.fsize;
            this.messageItem.fileType = this.messageItem.msgBody.format
            this.messageItem.fromId = this.messageItem.msgBody.fromId;
            this.messageItem.friendId = this.messageItem.msgBody.friendId;
            console.log('messageItem ====>',this.messageItem);
            this.$emit('handSendImg', this.messageItem);
          }
          if (this.messageItem.msgType == 6) {
            this.$emit('reHandSendFile', this.messageItem.msgBody);
          }
          if (this.messageItem.msgType == 10) {
            this.$emit('reHandSendVideo', this.messageItem.msgBody);
          } else if (this.messageItem.msgType == 1 || this.messageItem.msgType == 25 
          || this.messageItem.msgType == 15 || this.messageItem.msgType == 40) {
            await this.$store.dispatch('CHAT_REST_SEND', { ...this.messageItem });
          }
        }
      });
      // // 复制 
      // rightClickOptions.push({
      //   name: this.$t('chat_0026'),
      //   fun: () => {
      //     this.$parent.copyText(this.messageItem);
      //   }
      // });
      // 删除
      rightClickOptions.push({
        name: this.$t('chat_0032'),
        fun: () => {
          this.$emit('delMsg', 2, this.messageItem);
        }
      });
      if (!this.isShowRight) {
        return;
      } else {
        return this.$RightClick(rightClickOptions).popup({
          window: remote.getCurrentWindow()
        });
      }
    },
    findImage(item) {
      // const { localPath } = item.msgBody;
      const { localId } = item.msgBody;

      // console.log('path ===>', localPath);
      item.msgBody.localId = fileOperational.getImage(item.msgBody.mediaId);
      let W = item.msgBody.width;
      let H = item.msgBody.height;
      let R = W / H;
      if (R > 3) {
        if (W >= 120) {
          this.rate = 'Hcale40Midwidth';
        } else {
          this.rate = 'Hcale3Midwidth';
        }
      }
      if (1 <= R && R <= 3) {
        if (W >= 120) {
          this.rate = 'midwidth';
        } else {
          this.rate = 'origin';
        }
      }
      if (1 / 3 <= R && R < 1) {
        if (H >= 100) {
          this.rate = 'midhight';
        } else {
          this.rate = 'origin';
        }
      }
      if (R < 1 / 3) {
        if (H >= 100) {
          this.rate = 'Wcale30MidHight';
        } else {
          this.rate = 'Wcale3MidHight';
        }
      }
      // if (localPath && checkIsExists(localPath)) {
      //   return `file://${localPath}`;
      // }
      if (localId && checkIsExists(localId)) {
        return item.msgBody.localId
      }
      return fileOperational.getImage(item.msgBody.mediaCondenseId);
      // return fileOperational.getImage(item.msgBody.mediaId || item.msgBody.mediaCondenseId);
    },
    getFileType(format) {
      if (format == 'zip' || format == 'rar' || format == 'pdf') {
        return format;
      } else if (format == 'doc' || format == 'docx') {
        return 'word';
      } else if (format == 'ppt' || format == 'pptx') {
        return 'ppt';
      } else if (format == 'xls' || format == 'xlsx' || format == 'csv') {
        return 'excel';
      } else if (format == 'txt') {
        return 'txt';
      } else {
        return 'icon_un';
      }
    },
    initFile() {
      if (this.messageItem.msgBody.downloadPercent == '100%' && this.messageItem.msgBody.downloadFinished) {
        return;
      }
      let downloadFileInfo = store.state.common.downloadFile;
      if (downloadFileInfo && downloadFileInfo[this.messageItem.msgBody.reqId]) {
        this.messageItem.msgBody.downloadFinished = downloadFileInfo[this.messageItem.msgBody.reqId].downloadFinished;
        this.messageItem.msgBody.downloadPercent = downloadFileInfo[this.messageItem.msgBody.reqId].downloadPercent;
        this.messageItem.msgBody.downloadPath = downloadFileInfo[this.messageItem.msgBody.reqId].downloadPath;
        this.refreshDownloadPercentInStore();
        if (downloadFileInfo[this.messageItem.msgBody.reqId].downloadFinished) {
          clearInterval(this.messageItem.msgBody.timer);
          this.messageItem.msgBody.timer = null;
        }
      }
    },
    resendCallAudio() {
      this.$parent.callAudio();
    },
    handleUserSelectText(){
      this.actionCurrentMsgId(this.item?.msgId)
    },

    // 不处理tiff
    // async showTiff(item, url) {
    //   let xhr = new XMLHttpRequest();
    //   xhr.responseType = 'arraybuffer';
    //   xhr.open('GET', url);
    //   let _this = this;
    //   xhr.onload = async function () {
    //     let tiff = new Tiff({buffer: xhr.response});
    //     const imgData = await tiff.toDataURL();
    //     _this.messageItem.msgBody.tiffPath = imgData;
    //     _this.tiffKey = Math.random(); // 保存每次都能渲染成功
    //     await _this.updateMessageByMsgId(_this.messageItem);
    //   };
    //   await xhr.send();
    // },
    
    // 自动下载视频
    async downloadVideo(file) {
      console.log('online自动下载视频')
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
          file.msgBody.downloadPath = localPath;
        }
        if (!exists) {
          console.log('不存在，下啊')
          await this.download(file, url, localPath);
        }
      }
    },
    // 自动下载
    async download(fileItem, url, path) {
      // 下载
      const bakPath = path + '-bak';
      // 下载之前先清除历史数据
      if (checkFileIsExists(bakPath)) {
        fs.unlinkSync(bakPath);
      }
      let receivedBytes = 0;
      let totalBytes = 0;
      fileItem.msgBody.downloadLoading = true;
      fileItem.msgBody.downloadPath = path;
      fileItem.msgBody.downloadPercent = 0;
      fileItem.msgBody.downloadFinished = false;
      await this.updateMessageByMsgId(fileItem);
      const req = await request({
        method: 'GET',
        url,
        strictSSL: false
      });
      req.pipe(fs.createWriteStream(path));
      req.on('response', data => {
        // 更新总文件字节大小
        totalBytes = parseInt(data.headers['content-length'], 10);
        console.log('response-totalBytes', totalBytes);
      });
      req.on('data', chunk => {
        // 更新下载的文件块字节大小
        receivedBytes += chunk.length;
        let percent = Number(((receivedBytes / totalBytes) * 100).toFixed(0));
        if (fileItem.msgBody.downloadPercent < percent) {
          fileItem.msgBody.downloadPercent = percent;
          this.$store.commit('CHAT_VIDEO_DOWNLOAD_PERCENT', {
            msId: fileItem.msgId,
            percent: fileItem.msgBody.downloadPercent
          });
          this.messageItem.msgBody = fileItem.msgBody; // 保证中途发送别的消息时，进度条能正常进行
        }
      });
      req.on('error', async () => {
        fileItem.msgBody.downloadPercent = 0;
        fileItem.msgBody.downloadFinished = false;
        fileItem.msgBody.downloadPath = '';
        fileItem.msgBody.downloadLoading = false;
        this.messageItem.msgBody = fileItem.msgBody;
        this.$store.commit('CHAT_VIDEO_DOWNLOAD_PERCENT', {msId: fileItem.msgId, percent: 0});
        await this.updateMessageByMsgId(this.messageItem);
      });
      req.on('end', async () => {
        fileItem.msgBody.downloadPercent = 100;
        fileItem.msgBody.downloadFinished = true;
        fileItem.msgBody.downloadPath = path;
        fileItem.msgBody.downloadLoading = false;
        const files = new FileUpload(fileItem.msgBody.downloadPath,fileItem.reqId);
        const isSupportVideo = await this.isSupportVideoPlay(files)
        fileItem.msgBody.isSupportVideo = isSupportVideo
        console.log('isSupportVideo ====>', isSupportVideo);
        this.messageItem.msgBody = fileItem.msgBody;
        this.$store.commit('CHAT_VIDEO_DOWNLOAD_PERCENT', {msId: fileItem.msgId, percent: 100});
        await this.updateMessageByMsgId(fileItem);
        console.log('end-- ',fileItem.msgBody)
      });
    },

    // 判断是否支持播放
    async isSupportVideoPlay(files) {
      let isSupportVideo = false
      const res = await files.getVideoCodeC();
      // video 标签 支持 Mp4格式 H264编码  WebM格式 VP8编码  Ogg格式 Theora编码
      if (videoCode.indexOf(res.metadata?.video?.codec) > -1 ) {
        isSupportVideo = true
      }
      console.log('isSupportVideo ===>', isSupportVideo);
      return isSupportVideo
    },

    /** 根据MSG ID 更新消息 */
    async updateMessageByMsgId(msgInfo) {
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
      await window.vm
        .$knex(tableName)
        .where({
          msg_id: msgInfo.msgId
        })
        .update({
          msg_body: JSON.stringify(msgBody)
        });
    },
    goActivityPage(msgInfo){
      console.log(msgInfo)
      goOfficialPage()
      // msgInfo.msgBody?.url && eShell.openExternal(msgInfo.msgBody.url);
    },
    handlerImgErr(e){
      // console.log(e.target.style)
      e.target.style.width="50px"
      e.target.style.height="80px"
      e.target.style.opacity=0;
    }
  },
  mounted() {
    if (this.messageItem.msgType == '6') {
      this.initFile();
    }
  },
  beforeUpdate() {
    if (this.messageItem.msgType == '6') {
      this.initFile();
    }
  },
  beforeDestroy() {
    if (this.amr) {
      this.shopVideo();
    }
  }
};
</script>

<style lang="less" scoped>
.midwidth {
  width: 120px;
  object-fit: cover;
  object-position: center;
  height: auto;
}
.midhight {
  height: 100px;
  width: auto;
  object-fit: cover;
  object-position: center;
}
.Hcale40Midwidth {
  height: 40px;
  width: 120px;
  object-fit: cover;
  object-position: center;
}
.Wcale30MidHight {
  width: 30px;
  height: 100px;
  object-fit: cover;
  object-position: center;
}

.Hcale3Midwidth,
.Wcale3MidHight {
  object-fit: cover;
  object-position: center;
}
.carte {
  p {
    border-top: #eee solid 1px;
    margin-top: 5px;
    line-height: 20px;
    padding-top: 5px;
  }
  .topitem {
    padding-left: 20px;
  }
  .cardinfo {
    display: flex;
    width: 200px;

    .cardName {
      color: #333;
      display: inline-block;
      max-width: 110px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: pre;
      .name {
        color: #333;
        max-width: 75%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    img,
    span {
      vertical-align: middle;
    }

    img {
      border: #ddd solid 1px;
      width: 40px;
      height: 40px;
      border-radius: 20px;
      display: inline-block;
    }

    span {
      // padding-left: 20px;
      line-height: 20px;
    }
  }
}

.file-title {
  text-overflow: ellipsis;
  overflow: hidden;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  // font-size: 14px;
  color: #000;
  // line-height: 17px;
}

.file-size {
  font-size: 12px !important;
  color: #999 !important;
}
.videoShow {
  max-width: 100%;
  min-height: 100%;
  &.height140 {
    max-height: 140px;
  }
  &.height170 {
    max-height: 170px;
  }
}
.videoStart {
  position: absolute;
  // left: 44%;
  // top: 44%;
  top: 50%;
  transform: translateY(-50%);
  -webkit-transform: translateY(-50%);
  font-size: 40px;
  color: whitesmoke;
}
.progress-mask {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, .5);
}
.downloadProcess {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  -webkit-transform: translateY(-50%);
}
.mergeTransferClass {
  font-size: 12px;
  width: 220px;
  cursor: pointer;
  .title {
    font-weight: 500;
    font-size: 13px;
  }
  .content {
    color: #999999;
    li {
      span {
        width: 220px;
      }
      .text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 20px;
      }
      .user-sign {
        word-break: break-all;
        font-size: 12px;
        font-weight: 500;
        color: rgba(153, 153, 153, 1);
        line-height: 20px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        -webkit-box-flex: 1;
      }
    }
  }
  .mergeDivider {
    margin: 1px 0;
    background-color: #b7b7b7;
  }
}
.videoMsg {
  position: relative;
  width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
}

.telephone-class {
  width: 14px;
  height: 16px;
  padding-right: 10px;
  margin-bottom: -4px;
}
.audio-call-class {
  cursor: pointer;
}
.imgMsg {
  position: relative;
  width: fit-content;
  .el-icon-loading {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
.acitivity{
  max-width: 200px;
  padding: 0;
  font-family: PingFangSC, PingFangSC-Regular;
  font-weight: 400;
  img{
    max-width: 100%;
    display: block;
  }
  .title{
    margin-top: 5px;
    font-size: 14px; 
    color: #333333;
    line-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .content{
    font-size: 12px;
    text-align: left;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #999999;
    line-height: 17px;
  }
  .bottom{
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-top: 5px;
    img{
      width: 16px;
    }
    p{
      margin-left: 5px;
      font-size: 11px;
      text-align: left;
      color: #999999;
      line-height: 16px;
    }
  }
}
</style>
