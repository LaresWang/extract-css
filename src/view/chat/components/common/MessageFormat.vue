<template>
  <div>
    <div class="words" v-if="item.msgType == '1' || item.msgType == '25'">
      <MessageFormatText v-bind:text="item.text || item.msgBody.text" />
    </div>

    <div v-else-if="item.msgType == '6'" class="fileBox" v-loading="downloadLoading" element-loading-spinner="el-icon-loading">
      <div class="flex align-center" @click="onOpenFile(item)">
        <div class="flex-sub flex-direction" style="width: 80%">
          <span class="file-title">{{ item.msgBody && (item.msgBody.fileName || item.msgBody.fname) }}</span>
          <p class="file-size">{{ item.msgBody.fsize | formatFileSize }}</p>
        </div>
        <img :src="require(`../../../../assets/images/${getFileType(item.msgBody.format)}.png`)" width="40" height="40" alt />
      </div>
      <!--      <el-progress :percentage="percentageProgress(item.msgBody.downloadPercent)" ></el-progress>-->
      <div class="load-border text-right">
        <span v-if="getCurFileStatus==0">
          {{ $t('personal_0026') }} {{ item.msgBody.downloadPercent }}
        </span>
        <span v-if="getCurFileStatus==-1" ref="downloadbutton" @click="downFile(item.msgBody)"
          >{{ $t('Universal_0358') }}</span
        >
        <template v-if="getCurFileStatus==1">
          <span @click="openFile(item)">
            {{ $t('Universal_0356') }}
          </span>
          <span @click="saveFileAs(item.msgBody)">
            {{ $t('Universal_0357') }}
          </span>
        </template>
      </div>
    </div>
    <div v-else-if="item.msgType == '2'" class="imgMsg">
      <img :src="findImage(item)" alt />
    </div>
    <div v-else-if="item.msgType == '10'" class="videoMsg r"
      :style="{background: item.msgBody.noFirstFrame || item.msgBody.isH265 ? '#cfe1ff': ''}">
      <img
          :src="messageItem.msgBody.firstFrame.mediaId"
          alt=""
          class="videoShow"
          :height="messageItem.msgBody.firstFrame.height || messageItem.msgBody.height"
          :width="messageItem.msgBody.firstFrame.width || messageItem.msgBody.width"
      />
<!--      {{'finished: '+item.msgBody.downloadFinished}}<br>
      {{'percent: '+videoDownloadPercent[item.msgId]}}<br>
      {{'clear: '+!fileBeCleared[item.msgId]}}<br>
      {{'path: '+item.msgBody.downloadPath}}-->
      <i class="el-icon-video-play videoStart"
         v-show="(item.msgBody.downloadFinished||videoDownloadPercent[item.msgId]==100||!item.msgBody.downloadLoading)&&
         !fileBeCleared[item.msgId]" />
      <span class="progress-mask"
            v-show="item.msgBody.downloadLoading&&
            videoDownloadPercent[item.msgId]!==100&&
            !fileBeCleared[item.msgId]"></span>
      <el-progress type="circle"
                   ref="progress"
                   :percentage="videoDownloadPercent[item.msgId]||0"
                   class="videoStart downloadProcess"
                   :show-text="false"
                   :width="40"
                   v-show="videoDownloadPercent[item.msgId]<100"
                   color="#2f54eb"
                   :stroke-width="3"
      ></el-progress>
      <i class="el-icon-warning videoStart"
         v-show="

         fileBeCleared[item.msgId]"></i>
    </div>
    <div v-else-if="item.msgType == '14'">
      <span>{{ $t('chat_0087') }}</span>
    </div>
    <div v-else-if="item.msgType == '44'">
      <span>{{ $t('chat_0088') }}</span>
    </div>
    <div v-else-if="item.msgType == '61' && item.fromType == '999'">
      <span>{{ $t('chat_0127') }}</span>
    </div>
    <div v-else-if="item.msgType == '15'"
         class="card"
         @click="lookcard(item)">
      <div class="cardinfo" v-if="item.msgBody.type == '2'"><!--群名片 -->
        <img :src="item.msgBody.msgUrl" />
        <span class="cardName" style="margin-left:5px;">
          <label class="" style="color: #333">{{ item.msgBody.name }}</label>
          <br />
          <label style="font-size:10px;color:#999">ID:{{ item.msgBody.code }}</label>
        </span>
      </div>
      <div class="cardinfo" v-else>
        <MemberIcon
          :vipType="Number(item.msgBody.vipType)"
          :image="item.msgBody.msgUrl"
          iconType="mini"
          :userRank="+item.msgBody.userRank"
        />
        <div class="topitem">
          <span style="display:flex;align-items:center;margin-bottom:5px;">
            <label class="cardName" style="color: #333">{{ item.msgBody.name }}</label>
            <LevelIcon
              :inviteCode="item.msgBody.code"
              :userRank="+item.msgBody.userRank"
              iconType="small"
              :vipType="+item.msgBody.vipType"
              :inviteCodeType="+item.msgBody.inviteCodeType"
              :listFlag="true"
              style="padding-left: 2px;"
            />
          </span>
          <!-- {{ item.msgBody.code }} -->
          <LuckIdIcon
            :inviteCode="item.msgBody.code"
            :userRank="+item.msgBody.userRank"
            iconType="medium"
            :vipType="+item.msgBody.vipType"
            :inviteCodeType="+item.msgBody.inviteCodeType"
            :listFlag="false"
          />
        </div>
      </div>
      <p v-if="item.msgBody.type == 1">{{ $t('chat_0021') }}</p>
      <p v-else>{{ $t('chat_0023') }}</p>
    </div>
    <div v-else-if="item.msgType == '40'" class="mergeTransferClass" @click="showMergeTransferDialog">
      <div class="flex flex-direction">
<!--        <span class="title">{{ item.msgBody.title || '社区' }}的聊天记录</span>-->
        <span class="title" v-if="item.msgBody.title">{{ item.msgBody.title }}{{ $t('chat_0044') }}</span>
        <span class="title" v-else>{{ $t('chat_0043') }}</span>
        <span class="content">
          <ul>
            <li
              v-for="(message, index) in item.msgBody.msgs"
              v-if="index < 4"
              :key="index"
              class="flex  align-center justify-between"
            >
              <span v-if="message.msgType == '1' || message.msgType == '25'" class="user-sign">
                <span>{{ `${message.fromName || ''}: ` }}</span>
                <MessageFormatText v-bind:text="message.msgBody.text" />
              </span>
              <span class="text" v-else>{{ messageDetail(message) }}</span>
            </li>
          </ul>
        </span>
        <el-divider class="mergeDivider"></el-divider>
        <span class="blue">{{ $t('chat_0042') }}</span>
      </div>
    </div>
    <div v-else-if="item.msgType == '56'" class="acitivity" @click="goActivityPage(item)">
      <img :src="item.msgBody.imgUrl" alt="">
      <p class="title">{{item.msgBody.title}}</p>
      <!-- <p class="content">{{messageItem.msgBody.text}}</p> -->
      <div class="bottom">
        <img src="../../../../assets/images/didi_activity_icon.png" alt=""><p>{{$t('chat_0125')}}</p>
      </div>
    </div>
    <MergeTransferDialog :title="item.msgBody.title" :msgItem="item" :parentMsgId="parentMsgId" ref="mergeTransferDialog" />
    <member-card-other
      :cardDialogVisible="cardDialogVisible"
      :userId="cardUserId"
      ref="memberCard"
      @handleclosecard="handleclosecard"
    ></member-card-other>
    <GroupCard :groupInfo="groupCardInfo" ref="groupCard"></GroupCard>
  </div>
</template>

<script>
import { remote, shell as eShell } from 'electron';
import { checkIsExists, mkdir } from '@/utils/file';
import MessageFormatText from '@/view/chat/components/common/MessageFormatText';
import MemberCardOther from '@/components/memberCard/MemberCardOther';
import GroupCard from '../../group/components/GroupCard';
import fileOperational from '@/services/fileOperational';
import SQLUtils from '@/components/db/sqlite.js';
import request from 'request';
import fs from 'fs';
import path from 'path';
import store from '@/store';
import { queryGroupByGroupId } from '../../group/message/server';
import {goOfficialPage} from '../../../../utils'
import MemberIcon from '@/components/memberIcon/MemberIcon';
import LevelIcon from '@/components/memberIcon/LevelIcon';
import LuckIdIcon from '@/components/memberIcon/luckIdIcon';
import emojiList from '@/utils/emoji.js';
import { mapGetters } from 'vuex';
const configDir = path.join(remote.app.getPath('appData'), `${process.env.VUE_APP_ID}`);
export default {
  name: 'MessageFormat',
  components: {
    MessageFormatText,
    MergeTransferDialog: () => import('./MergeTransferDialog'),
    MemberCardOther,
    GroupCard,
    MemberIcon,
    LevelIcon,
    LuckIdIcon
  },
  computed: {
    ...mapGetters(['videoDownloadPercent', 'fileBeCleared', 'videoNotInCurrentPC']),
    messageDetail() {
      return message => {
        let msgTypeObject = {
          6: this.$t('chat_0017'),
          2: this.$t('chat_0013'),
          10: this.$t('chat_0015'),
          15: this.$t('chat_0024'),
          40: '['+this.$t('chat_0042')+']',
          14: this.$t('chat_0025'),
          44: '[Dapp]',
          56: this.$t('Universal_0454'),
          61: this.$t('chat_0127'),
        };
        let result = '';
        if (message.msgType != 15) {
          result = `${message.fromName || ''}: ${msgTypeObject[message.msgType]}`;
        } else {
          if (message.msgBody.type == '1') {
            result = `${message.fromName || ''}: ${this.$t('chat_0020')}`;
          } else {
            result = `${message.fromName || ''}: ${this.$t('chat_0022')}`;
          }
        }
        return result;
      };
    },
    percentageProgress() {
      return downloadPercent => {
        if (!downloadPercent) {
          return 0;
        } else {
          return +downloadPercent.slice(0, downloadPercent.length - 1);
        }
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
      return {};
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
    getCurFileStatus(){
      let {downloadFinished=false,downloadPercent='',downloadPath}=this.item.msgBody;
      if(downloadFinished&&downloadPath&&downloadPercent=='100%'){
        return 1;//已下载完成
      }else if(downloadPercent&&downloadPercent!='100%'){
        return 0;//下载中
      }else{
        return -1//待下载
      }
    }
  },
  data() {
    return {
      isPlayViedo: false,
      amr: '',
      soundUrl: require('../../../../assets/images/audio.png'),
      messageItem: this.item,
      rate: 'origin', //图片宽高比描述
      mergeTransferMessageVisible: false,
      cardUserId: '',
      cardDialogVisible: false,
      groupCardInfo: {},
      emojiList: emojiList,
      patt: /\[([^\\[])+?\]/g,
      downloadLoading: false
    };
  },
  props: {
    parentMsgId:{type:String},
    item: { require: true },
    imglsit: { require: true },
    isShowRight: { default: true },
    groupAuthByUser: { default: '' },
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
    item: {
      deep: true,
      immediate: true,
      handler: function (val) {
        console.log('302val- ',val)

        if (val.msgType == '10') {
          let width = val.msgBody.firstFrame.width || val.msgBody.width;
          let height = val.msgBody.firstFrame.height || val.msgBody.height;
          const rate = width / height;
          if (rate > 1) {
            // 比例基 300px
            val.msgBody.firstFrame.width = 250;
            val.msgBody.firstFrame.height = 140;
          } else {
            val.msgBody.firstFrame.width = 140;
            val.msgBody.firstFrame.height = 250;
          }
        }
        this.messageItem = val;
      }
    },
    soundUrlObj() {
      if (this.messageItem.msgId !== this.soundUrlObj.id) {
        this.soundUrl = require('../../../../assets/images/audio.png');
      }
      if (this.messageItem.msgId === this.soundUrlObj.id) {
        this.soundUrl = this.soundUrlObj.image;
      }
    }
  },
  methods: {
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
    showMergeTransferDialog() {
      this.$nextTick(() => {
        console.log('this.$refs.mergeTransfer ====== ', this.$refs.mergeTransferDialog);
        this.$refs.mergeTransferDialog.onMergeTransferDisplay();
      });
    },
    async lookcard(item) {
      let msgBody;
      if (item.msgBody instanceof Object) {
        msgBody = item.msgBody;
      } else {
        msgBody = JSON.parse(item.msgBody);
      }
      if (msgBody.type == 1) {
        //个人名片
        this.cardDialogVisible = true;
        this.cardUserId = msgBody.id;
        this.$nextTick(() => {
          this.$refs.memberCard.onCardShow();
        });
      } else {
        this.groupCardInfo = await this.findGroupInfoInServer(msgBody.id);
        if (this.groupCardInfo && this.groupCardInfo.id) {
          this.$refs.groupCard.onPop();
        } else {
          const msg = this.$t('chat_0076');
          this.openMessage(msg);
        }
      }
    },
    async findGroupInfoInServer(groupId) {
      let groupInfo = {};
      let res = await queryGroupByGroupId({ groupId });
      if (res.code == 200) {
        groupInfo = res.data;
        if (groupInfo && groupInfo.country && groupInfo.city) {
          groupInfo.countryName = await SQLUtils.getTAreaCountryOrCityName(groupInfo.country);
          groupInfo.cityName = await SQLUtils.getTAreaCountryOrCityName(groupInfo.city);
          groupInfo.region = groupInfo.countryName + '-' + groupInfo.cityName;
        } else {
          groupInfo.region = '';
          groupInfo.country = '';
          groupInfo.city = '';
        }
      }
      return groupInfo;
    },
    handleclosecard() {
      this.cardDialogVisible = false;
    },
    transferSuccess() {
      this.cardDialogVisible = false;
    },
    // refreshDownloadPercentInStore() {
    //   this.messageItem.msgBody.timer = setInterval(() => {
    //     if (this.downloadFileInfo && this.downloadFileInfo[this.messageItem.msgBody.reqId]) {
    //       this.messageItem.msgBody.downloadFinished = this.downloadFileInfo[this.messageItem.msgBody.reqId].downloadFinished;
    //       this.messageItem.msgBody.downloadPercent = this.downloadFileInfo[this.messageItem.msgBody.reqId].downloadPercent;
    //       this.messageItem.msgBody.downloadPath = this.downloadFileInfo[this.messageItem.msgBody.reqId].downloadPath;
    //     } else {
    //       this.stopLoadDownloadPercent();
    //     }
    //     if (this.messageItem.msgBody.downloadFinished) {
    //       this.stopLoadDownloadPercent();
    //     }
    //   }, 1000);
    // },
    // stopLoadDownloadPercent() {
    //   clearInterval(this.messageItem.msgBody.timer);
    //   this.messageItem.msgBody.timer = null;
    // },
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
      if (fileItem.downloadPercent == undefined || fileItem.downloadPercent == '') {
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

      let baseDir = path.join(configDir, 'files');
      mkdir(baseDir);
      let receivedBytes = 0;
      let totalBytes = 0;
      let fileName = fileItem.fname;
      console.log('fileName', fileName);
      let fullPath = '';
      if (checkIsExists(baseDir, fileName)) {
        let i = 1;
        let suffixIndex = fileName.lastIndexOf('.');
        console.log('suffixIndex', suffixIndex);
        let fileNamePrefix = fileName.substr(0, suffixIndex);
        console.log('fileNamePrefix', fileNamePrefix);
        let fileNameSuffix = fileName.substr(suffixIndex);
        console.log('fileNameSuffix', fileNameSuffix);
        let isExistsFileName = fileNamePrefix
          .concat('(')
          .concat('' + i)
          .concat(')')
          .concat(fileNameSuffix);
        console.log('isExistsFileName', isExistsFileName);
        while (checkIsExists(baseDir, isExistsFileName)) {
          ++i;
          isExistsFileName = fileNamePrefix
            .concat('(')
            .concat('' + i)
            .concat(')')
            .concat(fileNameSuffix);
          console.log('while-isExistsFileName', isExistsFileName);
        }
        fileName = isExistsFileName;
      }

      fullPath = path.join(baseDir, fileName);
      console.log('fullPath', fullPath);

      // let fileState = { key: fileItem.reqId, value: {} };
      // console.log('fileState',fileState);
      // fileState.value.downloadPercent = "";
      // fileState.value.downloadFinished = false;
      // fileState.value.downloadPath = "";
      this.messageItem.msgBody.downloadPercent = '';
      this.messageItem.msgBody.downloadFinished = false;
      this.messageItem.msgBody.downloadPath = '';
      // this.$store.commit("SET_DOWNLOAD_FILE_INFO", fileState);
      // this.refreshDownloadPercentInStore();

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
        this.downloadLoading = false;
      });

      req.on('data', chunk => {
        // 更新下载的文件块字节大小
        receivedBytes += chunk.length;
        fileItem.downloadPercent = ((receivedBytes / totalBytes) * 100).toFixed(0) + '%';
        // this.$store.commit("SET_DOWNLOAD_FILE_INFO", fileState);
        this.downloadLoading = false;
        this.$forceUpdate();
      });
      req.on('error', async () => {
        // fileState.value.downloadPercent = "";
        // fileState.value.downloadFinished = false;
        // fileState.value.downloadPath = "";
        fileItem.downloadPercent = '';
        fileItem.downloadFinished = false;
        fileItem.downloadPath = '';
        this.downloadLoading = false;
        // this.$store.commit("SET_DOWNLOAD_FILE_INFO", fileState);
        // await SQLUtils.updateDownloadFileMsgBody(fileState, this.friendId);
      });
      req.on('end', async () => {
        // fileState.value.downloadPath = fullPath;
        // fileState.value.downloadFinished = true;
        this.$set(fileItem,'downloadPercent','100%')
        this.$set(fileItem,'downloadFinished',true)
        this.$set(fileItem,'downloadPath',fullPath)
        fileItem.downloadPercent = '100%';
        fileItem.downloadFinished = true;
        fileItem.downloadPath = fullPath;
        // this.$store.commit("SET_DOWNLOAD_FILE_INFO", fileState);
        // await SQLUtils.updateDownloadFileMsgBody(fileState, this.friendId);
        this.updateMessageByMsgId(this.item,this.parentMsgId)
        // const {isEqual} =require('lodash')
        // console.info('原始入库消息id',this.parentMsgId)
        // console.info(isEqual(this.item,this.messageItem))
        // console.info(this.item,this.messageItem)
        this.$forceUpdate();
      });
    },
    /** 根据MSG ID 更新消息 */
    async updateMessageByMsgId(msgInfo,parentMsgId) {
      let tableName = `m_${this.$route.query.id}`;
      let msg=await window.vm
        .$knex(tableName)
        .where({
          msg_id: parentMsgId
        })
      let parentMsgBody=JSON.parse(msg[0].msg_body)
      let obj=this.setMsgBody(parentMsgBody,msgInfo.reqId,msgInfo.msgBody)
      await window.vm
        .$knex(tableName)
        .where({
          msg_id: parentMsgId
        })
        .update({
          msg_body: JSON.stringify(obj)
        });
      // console.info('已经更新:')
      // let dd=await window.vm
      // .$knex(tableName)
      // .where({
      //   msg_id: parentMsgId
      // })
      // console.info(JSON.parse(dd?.[0]?.msg_body))
    },
    setMsgBody(msgBody,reqId,msgInfoMsgBody){
      if(msgBody?.msgs){
        msgBody.msgs.forEach(a=>{
          if(a?.reqId==reqId){
            a.msgBody=msgInfoMsgBody
          }else{
            this.setMsgBody(a.msgBody,reqId,msgInfoMsgBody)
          }
        })
      }
      return msgBody
    },
    onOpenFile(item) {
      if (!item.msgBody.downloadPercent && !item.msgBody.downloadFinished) {
        this.downFile(item.msgBody);
      }
      if (item.msgBody.downloadFinished && this.isShowRight) {
        this.openFile(item);
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
          eShell.openPath(path);
        }
      });
    },
    findImage(item) {
      const { localId } = item.msgBody;
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
    viewerShowChild(item) {
      console.log('33333333')
      this.$parent.viewerShow(item);
    },
    goActivityPage(msgInfo){
      console.log(msgInfo)
      goOfficialPage()
      // msgInfo.msgBody?.url && eShell.openExternal(msgInfo.msgBody.url);
    }
    // initFile() {
    //   if (this.messageItem.msgBody.downloadPercent == '100%' && this.messageItem.msgBody.downloadFinished) {
    //     return;
    //   }
    //   let downloadFileInfo = store.state.common.downloadFile;
    //   if (downloadFileInfo && downloadFileInfo[this.messageItem.msgBody.reqId]) {
    //     this.messageItem.msgBody.downloadFinished = downloadFileInfo[this.messageItem.msgBody.reqId].downloadFinished;
    //     this.messageItem.msgBody.downloadPercent = downloadFileInfo[this.messageItem.msgBody.reqId].downloadPercent;
    //     this.messageItem.msgBody.downloadPath = downloadFileInfo[this.messageItem.msgBody.reqId].downloadPath;
    //     this.refreshDownloadPercentInStore();
    //     if (downloadFileInfo[this.messageItem.msgBody.reqId].downloadFinished) {
    //       clearInterval(this.messageItem.msgBody.timer);
    //       this.messageItem.msgBody.timer = null;
    //     }
    //   }
    // }
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
.card {
  width: 230px;
  background: white;
  padding: 5px;
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
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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

.videoStart {
  position: absolute;
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
.mergeTransferClass {
  font-size: 12px;
  width: 220px;
  cursor: pointer;
  background: white;
  padding: 10px;
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
.load-border {
  border-top: 1px solid #b7b7b7;
  margin-top: 5px;
  padding: 5px 0 0;
  font-size: 12px;
  color: #000;
}
.load-border span {
  display: inline-block;
  margin-left: 14px;
}
.fileBox {
  width: 250px;
  background: white;
  padding: 5px;
}
.videoMsg {
  position: relative;
  width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
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
.acitivity{
  max-width: 200px;
  padding: 7px 10px;
  background:#fff;
  border-radius: 10px;
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
