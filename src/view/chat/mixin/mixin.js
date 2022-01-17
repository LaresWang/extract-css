import quillEditorlContextmenuMethods from "../quillEditorlContextmenuMethods";
import chatIndex from '@/view/chat/chatIndex';
import Delta from "quill-delta";
import BenzAMRRecorder from "benz-amr-recorder";
import MsgBgPopper from "../common-popper/MsgBgPopper";
import UserInfoUtils from "@/utils/UserInfoUtils";
import { clipboard, ipcRenderer, nativeImage } from "electron";
// import { parseUniqueCode,  saveTimeArr, pictureTypeArr, videoTypeArr} from "@/utils/const";
import { parseUniqueCode, pictureTypeArr, videoTypeArr } from "@/utils/const";
import { sqliteUpdate } from '@/services/sqliteDao';
import { queryGroupByGroupId } from "../server";
import fs from "fs";
const path = require("path");
import fileOperational from "@/services/fileOperational";
import { v4 as uuidv4 } from "uuid";
import { contFriSize, resizeFun, fileValidation, checkkArrProps } from "@/utils";
import SQLUtils from "@/components/db/sqlite.js";
import {
  UPDATE_CHAT_RECORD,
  SET_SCREEN_SELECT,
  SET_DOWNLOAD_FILE_INFO
} from "@/store/types";
import { overheadAndNoticeFlagById } from '@/services/rightClickByDB';
import Ws from '@/utils/ws';
import { screenWindow } from "@/utils/screenWindow";
import { mapGetters, mapState } from "vuex";
import { diffTimeInChat } from "@/utils";
import emojiList from "@/utils/emoji.js";
import { debounce } from 'lodash'
import DialogAddFriendVisible from "@/view/add-friends-group/dialog/add-friends";
import GroupAndInviteChat from "@/components/chat/GroupAndInviteChat";
import MessageFormatOnline from "@/view/chat/components/common/MessageFormatOnline";
import MessageSendStauts from "@/view/chat/components/common/MessageSendStatus";
import QuotFormate from "@/view/chat/components/common/QuotFormate";
import MemberIcon from "@/components/memberIcon/MemberIcon";
import LevelIcon from "@/components/memberIcon/LevelIcon";
import LuckIdIcon from "@/components/memberIcon/luckIdIcon";
import AppealsDialog from "@/view/chat/appeals";
import ImpeachDialog from "@/view/chat/impeach";
import { checkVideoIsExists } from '@/utils/file';
const sizeOf = require('image-size')
const { FileUpload } = require('@/utils/fileUpload');
let configDir = path.join(window.vm.$remote.app.getPath('appData'), `${process.env.VUE_APP_ID}`);
const configDirPath = path.join(configDir, 'images');
import bus from '@/utils/eventbus';
export default {
  mixins: [MsgBgPopper],
  provide: {
    scrollToBottom: () => {
      let ele = document.getElementById("talk")
      if (ele) {
        ele.scrollTop = ele.scrollHeight
      }
    }
  },
  components: {
    DialogAddFriendVisible,
    GroupAndInviteChat,
    MessageFormatOnline,
    MessageSendStauts,
    QuotFormate,
    MemberIcon,
    LevelIcon,
    LuckIdIcon,
    AppealsDialog,
    ImpeachDialog,
  },

  directives: {
    // clickDown: {
    //   inserted(el) {
    //     el.onmousedown = function() {
    //       this.resizeChange();
    //     };
    //   }
    // }
  },

  data () {
    return {
      hasMore: false,
      chatlistFlag: false,
      maskVisible: false,
      fileName: '',
      dropFile: [],
      sendFile: false,
      decimalNum: 1500,
      groupInfo: {},
      mutiChooseTag: false,
      mutiPanel: false,
      checkList: [],
      checkList2: [],
      cardDialogVisible: false,
      AppealsVisible: false,
      ImpeachVisible: false,
      impeachFromtype: '',
      cardUserId: '',
      listLoading: false,
      noMoreShowFlg: false,
      quoteFromName: '',
      quoteMsgId: '',
      quoteReqId: '',
      quoteMsg: '',
      quoteVisible: false,
      friendSystemInnerDrawer: false,
      historyVisible: false,
      saveTimeVisible: false,
      saveTime: '',
      msgOrder: -1,
      dialogPersonInfoVisible: false,
      userInfo: {},
      myInfo: this.$store.state.common.userInfo,
      imgUrl: '',
      imglsit: [],
      dialogAddFriendsVisible: false,
      GroupInviteVisible: false,
      Comtit: '',
      transferItem: {},
      TiLength: 0,
      item: {},
      amr: '',
      isPlayViedo: false,
      soundUrlObj: {
        type: Object,
        default: () => ({
          image: require('../../../assets/images/audio.png'),
          id: ''
        })
      },
      fileReqId: '',
      sendBtnDisabled: false,
      screenSelect: this.$store.state.common.screenSelect,
      screenShotVisible: false,
      merge: false,
      mergeTransferName: '',
      leaveElement: '',
      lastTime: Date.now(),
      count: 0,
      emojiList: [],
      sHeight: '',
      changeKey: '',
      isShowMoreList: false, // 是否显示更多消息
      oldReqId: '', // 滑动时最后一条reqId
      newMsgLength: '' // 消息之间的差值
    };
  },

  computed: {
    ...mapGetters(['gettersDownloadTaskInfoByID']),
    saveTimeArr () {
      return [
        { value: '1', label: this.$t('Universal_0004', { value: 1 }) },
        { value: '3', label: this.$t('Universal_0004', { value: 3 }) },
        { value: '12', label: this.$t('Universal_0004', { value: 12 }) },
        { value: '24', label: this.$t('Universal_0004', { value: 24 }) },
        { value: '72', label: this.$t('Universal_0008', { value: 3 }) },
        { value: '120', label: this.$t('Universal_0008', { value: 5 }) },
        { value: '168', label: this.$t('Universal_0008', { value: 7 }) }
      ];
    },
    quill () {
      return this.$refs.myQuillEditor.quill;
    },
    chatList: {
      get () {
        return this.$store.state.chat.chatList;
      },
      set (val) {
        this.$store.state.chat.chatList = val;
      },
    },
    ...mapState({
      personalAppealInfo: (state) => {
        return state.common.personalAppealInfo;
      },
      getNetStatus () {
        return this.$store.state.common.netStatus;
      },
      getSocketStatus () {
        return this.$store.state.common.socketStatus;
      }
    }),
    getLastReqId () {
      return this.chatList?.[this.chatList.length - 1]?.reqId || ''
    },
    chatContent () {
      return this.$store.state.chat.updateChatContent;
    },
    getShowTimestamp () {
      return (timestamp = new Date().getTime(), lastMsgObj) => {
        if (lastMsgObj?.timestamp) {
          if (Math.abs(Number(timestamp - lastMsgObj['timestamp'] > 1000 * 60 * 5))) {
            return true;
          } else {
            return false;
          }
        } else if (this.chatList?.length == 1) {
          return true //当前会话第一条消息 显示时间
        } else {
          return false
        }
      }
    }
  },

  watch: {
    emojiVisible (v) {
      if (v) {
        this.emojiList = emojiList;
      }
    },
    // autoScroll: true,//默认开启自动滚动，转发,引用,删除,撤回,多选
    //默认开启自动滚动，转发,引用,删除,撤回,多选时禁止滚动至底部
    // quoteVisible:"setAutoScroll",
    // mutiChooseTag:"setAutoScroll",
    // GroupInviteVisible:"setAutoScroll",
    // cardDialogVisible:"setAutoScroll",
    getLastReqId: {
      immediate: true,
      handler: async function (reqId, old) {
        if (reqId && reqId !== old) {
          await this.$nextTick()
          if(!this.isShowMoreList) {
            this.scrollBottom();
          }
          console.warn(reqId)
          // 判断是否有网
          if(this.getSocketStatus){
          // 判断是不是自己发的消息
            if (this.chatList?.[this.chatList.length - 1]?.fromId !== UserInfoUtils.getCurrentUserId()) {
              console.log('=====>', this.chatList?.[this.chatList.length - 1]); 
              const oldIndex = this.chatList.indexOf(this.chatList.filter(d=>d.reqId == this.oldReqId)[0]) // 老的reqid
              const newIndex = this.chatList.indexOf(this.chatList.filter(d=>d.reqId == reqId)[0]) // 新的reqid
              console.log('oldReqId ======> newIndex',oldIndex, newIndex) 
              if (oldIndex !== -1 && newIndex !== -1) {
                this.newMsgLength = newIndex - oldIndex
                if (this.newMsgLength > 99) {
                  this.newMsgLength = '99+'
                }
              }
              console.log('newMsgLength',this.newMsgLength)
            }else {
              this.scrollBottom()
            }
          }
        }
      }
    },
    async chatlistFlag () {
      await this.$nextTick()
      this.scrollBottom();
    },
    chatContent () {
      this.getlist && this.getlist();
    },
  },

  filters: {
    diffTimeHand (val) {
      return diffTimeInChat(val);
    }
  },


  mounted () {
    const dropwrapper = document.getElementById('messageBox');
    dropwrapper.addEventListener('drop', this.dropwrapperListenerDrop);
    dropwrapper.addEventListener('dragenter', this.dropwrapperListenerDragenter);
    dropwrapper.addEventListener('dragover', this.dragoverListenerDragenter);
    dropwrapper.addEventListener('dragleave', this.dragleaveListenerDragenter);
    ipcRenderer.on('clipboardImage', this._clipboardImage);
    ipcRenderer.on('media-share', this.handleMediaShare);
    ipcRenderer.on('windows-captureShortcut', this.captureScreen);
    if (this.fromGroupType === 'group' || this.fromGroupType === 'discussion') ipcRenderer.on('group-appeal', this.queryGroupAppealInfo);
    if (this.fromGroupType === 'group') ipcRenderer.on('group-exceed', this.queryGroupExceedInfo);
    bus.$on('_saveTime', this._saveTime);
    document.addEventListener('keydown', this.handleKeydown, true);
    const talk = document.getElementById('talk');
    talk.addEventListener('scroll', this.handleScroll)//监听函数
  },

  methods: {
    // 监听滑动
    handleScroll: debounce(function () {
      this.$nextTick(() => {
        //变量scrollTop是滚动条滚动时，距离顶部的距离
        let scrollTop = document.getElementById("talk")?.scrollTop || document.body.scrollTop;
        //变量windowHeight是可视区的高度
        let windowHeight = document.getElementById("talk")?.clientHeight || document.body.clientHeight;
        //变量scrollHeight是滚动条的总高度
        let scrollHeight = document.getElementById("talk")?.scrollHeight || document.body.scrollHeight;
        //滚动条到底部的条件
        // 处理精度问题
        if (Math.round(scrollTop + windowHeight) !== Math.round(scrollHeight)) {
          //你想做的事情 
          console.log('不在最底部了');
          this.isShowMoreList = true
          // 记录一下最后聊天的reqid
          this.oldReqId = this.chatList?.[this.chatList.length - 1]?.reqId || ''
          console.log('oldReqId ====>', this.oldReqId);
        } else {
          console.log('最底部了-------->');
          this.isShowMoreList = false
          this.newMsgLength = 0
        }
      })
    }, 50),
    handleKeydown (ev) {
      // console.info(ev.keyCode)
      if (this.quill?.hasFocus()) {//焦点在编辑器上
        let data = this.quill.getSelection(true);//已在编辑器上
        if ((ev.ctrlKey || ev.metaKey) && ev.keyCode == 67) {
          ev.preventDefault();
          ev.stopPropagation()
          this._handleQuillcontextmenuCopy(data);//复制
        }
        if ((ev.ctrlKey || ev.metaKey) && ev.keyCode == 88) {
          ev.preventDefault();
          ev.stopPropagation()
          this._handleQuillcontextmenuCut(data);//剪切
        }
      } else {
        if ((ev.ctrlKey || ev.metaKey) && ev.keyCode == 67) {
          console.log("复制");
          ev.preventDefault()
          // this.$remote.getCurrentWebContents().copy();
          let c = document.execCommand('copy')
          navigator.clipboard.readText().then(text=>{
            const txt = text?.trim();
            console.log('复制的文本:', txt)
            if(txt){
              navigator.clipboard.writeText(txt)
            }
          })
          console.log(window.getSelection().toString(), c)
        }
      }
    },
    _saveTime (hour) {
      let obj = Object.fromEntries(this.saveTimeArr.map(o => [o['value'], o.label]))
      this.saveTime = obj[hour];
    },
    ...quillEditorlContextmenuMethods,
    ...chatIndex,
    scrollBottom () {
      console.log('~~~~~~~~~滚动至底部~~~~~~~~~~~~~~~');
      this.$nextTick(() => {
        if (!document.getElementById("talk")) return;
        document.getElementById("talk").scrollTop = document.getElementById("talk").scrollHeight
      });
    },
    maxWidth (item) {
      const str = item?.msgBody?.text + ''
      if (str.startsWith('[')) {
        if (this.mutiPanel) {
          // 多选面板打开了，让消息体窄一些
          return 'samllFullOfEmoji';
        }
        return 'fullOfEmoji';
      }
    },

    imgBubble (item) {
      if (item?.msgType == '2') {
        return 'imgTopSpace'
      } else if (item?.msgType == '6') {
        return 'fileBox'
      }
    },

    cancelSendFile () {
      this.fileName = '';
      this.dropFile = [];
    },

    sendFileConfirm (e) {
      // bug  全局变量 fromGroupType = 'single' || 'group' || 'discussion' sendFileConfirm($event, 'group')
      if (this.fromGroupType === 'group' && this.groupSystemObj.sendFile == '0' && this.authStatus == 3) {
        this.openMessage(this.$t('chat_0099'));
        return;
      }
      console.log('事件', e);
      if (this.dropFile.length > 0) {
        this.changeHand({ ...e, target: { files: this.dropFile } });
      }
      this.dropFile = [];
      this.fileName = '';
    },
    editorWrap () {
      let range = this.quill.getSelection(true);
      let delta = new Delta();
      this.quill.updateContents(
        delta
          .retain(range.index)
          .delete(range.length)
          .insert('\n', { header: 1 }),
        'user'
      );
      this.quill.setSelection(range.index + 1, 'user');
    },

    async handArm (val, msgId, obj) {
      // console.log(val, msgId);
      if (this.amr && this.isPlayViedo && this.isPlayViedo === `${msgId}_true`) {
        this.stopVideo(msgId, obj);
        return;
      }
      if (this.amr || (this.isPlayViedo && this.isPlayViedo !== `${msgId}_true`)) {
        this.stopVideo(msgId, obj);
      }
      this.isPlayViedo = `${msgId}_true`;
      this.amr = new BenzAMRRecorder();
      await this.amr.initWithUrl(val);
      this.amr.play();
      this.soundUrlObj = { image: this.getSoundGif(obj), id: msgId };
      this.amr.onAutoEnded(() => {
        this.stopVideo(msgId, obj);
      });
    },

    stopVideo (msgId, obj) {
      if (this.amr) {
        this.amr.stop();
      }
      this.amr = '';
      this.isPlayViedo = false;
      this.soundUrlObj = {
        image: this.getSoundPng(obj),
        id: msgId
      };
    },

    // 处理图片404问题
    // bug 全局变量 fromGroupType = 'single' || 'group' || 'discussion'  user 
    replaceImg (e) {
      let str = this.fromGroupType === 'single' ? 'user' : 'group'
      UserInfoUtils.replaceDefaultImg(e, str);
    },

    //图片查看器初始化回调方法
    inited (viewer) {
      if (!this._viewer) {
        this._viewer = viewer;
      }
    },
    //显示图片查看器
    async viewerShow (item) {
      console.log('显示图片查看器', item)
      if (item.msgType == '2') {
        // console.log('viewerShow(item)', item.msgBody);
        // //mac os 通过用户设置的默认图片查看器 预览 查看图片
        // const fileName = /\/([^\\/]*?)\/?$/.exec(new URL(item.msgBody?.mediaId).pathname)[1]
        // const exists = checkIsExists(configDirPath, fileName);
        // // 本地不存在&&未在下载中
        // if(!exists&&!this.gettersDownloadTaskInfoByID(item.msgBody?.mediaId)){
        //   download(item.msgBody.mediaId, path.join(configDirPath, fileName))
        // }
        // if(process.platform==='darwin'&&exists){
        //   let localPath= this.findImage(item.msgBody.mediaId);
        //   // await shell.openExternal(localPath)
        //   this.$remote.getCurrentWindow().previewFile(item.msgBody?.localPath||localPath.replace("file:///",""))
        //   return 
        // }
        //1，先从历史记录和在线记录中 生成最新的imglsit
        let imglsitTmp;
        imglsitTmp = this.$store.state.chat.chatList.filter(item => {
          if (item.msgType == '2' && item.sendStatus != 1 && item.sendStatus != -1) {
            return true;
          }
        });
        // 判读item 在不在imglsitTmp里面
        const isExist = imglsitTmp.some((element) => {
          if (element.reqId == item.reqId) { 
            return true;  //返回false
          }
        })
        if (!isExist) {
          imglsitTmp.push(item)
        }
        imglsitTmp = imglsitTmp.map(item => {
          let img = {};
          img.url = item.msgBody.localId || item.msgBody.mediaId;
          img.reqId = item.reqId;
          img.msgBody = item.msgBody;
          img.msgId = item.msgId;
          img.fromId = item.fromId;
          img.targetId = item.targetId;
          return img;
        });
        // console.log('imglsitTmp',imglsitTmp);
        let index = imglsitTmp.findIndex(img => {
          return item.reqId == img.reqId;
        });

        this.$nextTick(() => {
          // console.log('viewer-item:',item);
          this.openMediaViewer(item.msgType, imglsitTmp, index);
        });
      } else if (item.msgType == '10') {
        this.$nextTick(async () => {
          try {
            let flag = await checkVideoIsExists(item.msgBody.downloadPath);
            if (flag) {
              console.log('存在')
              ipcRenderer.send('media-viewer', {
                msgType: item.msgType,
                item
              });
            } else {
              console.log('不存在')
              this.$message.error(this.$t('chat_0124'));
              this.$store.commit('CLEAR_FILE_DOWNLOAD', { msId: item.msgId, beCleared: true });
            }
          } catch (e) {
            console.error('出错了', e)
          }
        });
      }
    },

    openMediaViewer (msgType, imgList, index) {
      // console.log(msgType, imgList, index);
      const flag = checkkArrProps(imgList, 'msgBody')
      console.log('flag ====> imgList 存在undefind ', flag);
      if (flag) {
        ipcRenderer.send('media-viewer', { msgType, imgList, index });
      }
    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion' ; //初始化设置 
    async initSetting () {
      let t;
      const id = this.fromGroupType === 'single' ? this.$route.query.id : this.groupId
      t = await window.vm.$knex('t_sessions').where({ id: id });
      // 这里更新一下群最大容量
      if (this.fromGroupType === 'group') {
        const res = await queryGroupByGroupId({ groupId: this.groupId });
        if (res.code === '200') {
          const item = {
            maxPeople: res.data.maxPeople
          }
          await this.updateGroupInfo(item);
          this.groupInfo.maxPeople = res.data.maxPeople;
          this.$set(this.groupInfo, 'maxPeople', res.data.maxPeople)
          console.log('maxPeople ====>', this.groupInfo);
        }
      }
      if (this.fromGroupType !== 'single') {
        //置顶初始化
        this.groupSystemObj.msgTopValue = String(t[0].topFlag);
        //免打扰初始化
        this.groupSystemObj.msgOutlineValue = String(t[0].noNoticeFlag);
      } else {
        this.friendSystemObj.msgTopValue = String(t[0].topFlag);
        //免打扰初始化
        this.friendSystemObj.msgOutlineValue = String(t[0].noNoticeFlag);
      }
    },

    batchDelMsg () {
      let arryItem = this.checkList.concat(this.checkList2);
      if (arryItem.length == 0) {
        this.$message.warning(this.$t('chat_0102'));
      } else {
        this.$confirm(this.$t('chat_0103'), this.$t('Universal_0059'), {
          confirmButtonText: this.$t('Universal_0062'),
          cancelButtonText: this.$t('Universal_0063'),
          type: 'warning'
        })
          .then(() => {
            this.confirmBatchDelMsgs(arryItem);
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: this.$t('Universal_0383')
            });
          });
      }
    },

    closeMutiPnel () {
      //关闭多选面板
      this.mutiChooseTag = false; //隐藏多选按钮
      this.checkList = [];
      // this.checkList2.forEach(item => (item.checked = false));
      this.checkList2 = [];
    },

    mutiChoose (msgId) {
      //右击多选转发
      this.mutiPanel = true;
      const downHeight = document.getElementById('down').offsetHeight + 10;
      console.log(downHeight);
      document.getElementById('mutiPanel').style.height = downHeight + 20 + 'px';
      document.getElementById('mutiPanel').getElementsByClassName('el-drawer')[0].style.height = downHeight + 'px';
      this.mutiChooseTag = true; //
      // this.$nextTick(() => {
      // 这里用 dom 上的id 来操作
      // this.$refs.talk.scrollTop = this.$refs.talk.scrollTop + 80;
      // document.getElementById("talk").scrollTop = document.getElementById("talk").scrollTop + 80
      // });
      this.chatList.forEach(item => {
        if (item.msgId === msgId) {
          item.checked = true;
        } else {
          item.checked = false;
        }
      });
    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion' 单聊 getFriendInfo  群和讨论组 searchGroupMembersAndInfo
    async handleclosecard () {
      this.cardDialogVisible = false;
      if (this.fromGroupType === 'single') {
        await this.getFriendInfo();
      } else {
        await this.searchGroupMembersAndInfo();
      }
      this.GET_LAST_MSG_LIST();
    },

    async acceptMessage (item) {
      if (item.msgType == '9') {
        item.msgBody.unreadMessage = false;
        let id = parseUniqueCode(item.uniqueCode, item.targetType);
        await sqliteUpdate(
          `m_${id}`,
          { req_id: item.reqId },
          {
            msg_body: JSON.stringify(item.msgBody)
          }
        );
      }
    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    insertImg (file, tag) {
      if (this.personalAppealInfo.endTime) {
        // `因发布色情、暴力、种族歧视等违规消息，违反平台规则，账号自${this.personalAppealInfo.createTime}--${this.personalAppealInfo.endTime}限制社交功能`
        let time = `${this.personalAppealInfo.createTime}--${this.personalAppealInfo.endTime}`;
        this.$confirm(this.$t('appeal_0003', { time }), this.$t('Universal_0059'), {
          confirmButtonText: this.$t('appeal_0017'),
          cancelButtonText: this.$t('book_group_0019'),
          center: true,
          showClose: false,
        }).then(() => {
          this.toAppeal('single');
        }).catch(() => {
        });
        return;
      }
      if (this.fromGroupType !== 'single' && this.showAppealClosureNotice) {
        let message = this.fromGroupType === "group" ? this.$t('appeal_0013') : this.$t('appeal_0014');
        return this.$message.error(message);
      }
      let bitmap = "";
      if (process.platform == "darwin") {
        // eslint-disable-next-line
        bitmap = fs.readFileSync(path.join(window.vm.$remote.app.getAppPath(), `../emoji/${file}`));
      } else {
        bitmap = fs.readFileSync(path.join(process.cwd(), `/resources/emoji/${file}`));
      }
      let base64str = Buffer.from(bitmap, 'binary').toString('base64'); // base64编码
      let range = this.quill.getSelection(true);
      // let contents = this.quill.getContents(range.index - 1, 2);
      let index = range.index;
      let delta = new Delta();
      this.quill.updateContents(
        delta
          .retain(index)
          .delete(range.length)
          .insert({ image: 'data:image;base64,' + base64str }, { height: '22px', width: '22px', alt: tag }),
        'user'
      );
      this.quill.setSelection(range.index + 1, 'user');
    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    onEditorChange (event, decimalNum) {
      this.delNum = 0;
      let length = this.quill.getLength();
      let range = this.quill.getSelection(true);
      const quillContent = this.quill.getContents();
      let imageContentNum = 0;
      quillContent.ops.forEach(delta => {
        if (typeof delta.insert !== 'string') {
          if (delta['attributes'] == undefined && delta.insert?.image) {
            // console.log(delta, imageContentNum++);
            imageContentNum++;
          }
        }
      });
      if (imageContentNum > 9) {
        this.quill.updateContents(new Delta().retain(range.index).delete(1));
        const msg = this.$t('chat_0104');
        this.openMessage(msg);
      }
      event.quill.deleteText(decimalNum, length);
      if (this.texthtml === 0) {
        this.TiLength = 0;
      } else {
        this.TiLength = event.quill.getLength() - 1;
      }
      // console.log("onEditorChange", event);
      // console.log('onEditorChange', this.quill.getContents())
    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    onEditorReady (quill) {
      // this.quill = quill;
      // quill.keyboard.bindings["13"] = [];
      quill.keyboard.addBinding({
        key: 13,
        shiftKey: true,
        handler: this.editorWrap
      });
      quill.keyboard.addBinding({
        key: 13,
        shortKey: false,
        handler: this.enterSend,
      });
      console.log('----enterSend ------')

      // // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
      // if (this.fromGroupType !== 'single') {
      //   quill.keyboard.bindings['13'].splice(1,0,quill.keyboard.bindings["13"].pop())
      // }
      quill.keyboard.bindings['13'].splice(1, 0, quill.keyboard.bindings["13"].pop())

    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    enterSend () {
      console.log('----enterSend  222------')

      // if (this.fromGroupType === 'single') {
      this.sendQuillByThrottle();
      // }
    },

    findImage (image) {
      return fileOperational.getImage(image, true);
    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    async withdrawMessage (item) {
      if (this.personalAppealInfo.endTime) {
        let time = `${this.personalAppealInfo.createTime}--${this.personalAppealInfo.endTime}`;
        this.$confirm(this.$t('appeal_0003', { time }), this.$t('Universal_0059'), {
          confirmButtonText: this.$t('appeal_0017'),
          cancelButtonText: this.$t('book_group_0019'),
          center: true,
          showClose: false,
        }).then(() => {
          this.toAppeal('single');
        }).catch(() => {
        });
        return;
      }
      const netStatus = this.$store.state.common.netStatus;
      const socketStatus = this.$store.state.common.socketStatus;
      if (socketStatus === 'offline' || netStatus === 'offline') {
        return;
      }
      const userInfo = UserInfoUtils.getCurrentUserInfo();
      let ref_body = {}
      if (this.fromGroupType === 'single') {
        ref_body = {
          fromName: userInfo.nickName,
          fromIcon: userInfo.headImg
        }
      } else {
        ref_body = {
          fromName: item.fromName,
          fromIcon: item.fromIcon
        }
      }
      const pararms = {
        reqId: uuidv4(),
        targetType: this.fromGroupType === 'single' ? 1 : 2,
        targetId: item.targetId,
        fromType: 0,
        fromId: this.fromGroupType === 'single' ? item.fromId : userInfo.id,
        msgType: 24,
        uniqueCode: contFriSize(this.fromGroupType === 'single' ? item.fromId : userInfo.id, item.targetId),
        msgHeader: {
          pubKey: '', // this.publickKey, // 单聊是: '' , 群聊讨论组没有这个属性
          version: this.fromGroupType === 'single' ? this.publickKeyVersion : null,
          msgSeqNo: 1,
          msgSeqTotal: 1,
          effectiveTime: -1,
          sourceSite: null,
          language: window.vm.$i18n.locale,
          sign: null,
          signType: null
        },
        text: '',
        msgBody: {
          msgId: item.msgId,
          userId: item.fromId,
          reqId: item.reqId
        },
        refMsgBody: ref_body,
        msgId: item.msgId,
        withDraw: true
      };
      // console.log('~~~~~~撤回消息~~~~~~~',pararms);
      localStorage.setItem('specailChat', true);
      await this.CHAT_REST_SEND({ ...pararms });
      const tableName = `m_${this.fromGroupType === 'single' ? this.$route.query.id : this.groupId}`;
      await window.vm
        .$knex(`${tableName}`)
        .where({ req_id: item.reqId })
        .update({
          status: 1,
          from_id: userInfo.id
        });
      const obj = JSON.parse(JSON.stringify(item));
      // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
      if (this.fromGroupType === 'single') {
        // obj.sendStatus = 1; //解决单聊撤回时，消息一直在转
      } else if (this.fromGroupType === 'group') {
        obj.status = 1;
        obj.fromId = localStorage.userId;
        obj.refMsgBody = ref_body;
      } else {
        obj.sendStatus = 1;
        obj.fromId = localStorage.userId;
        obj.refMsgBody = ref_body;
      }
      obj.msgId = item.msgId;
      obj.id = item.targetId;
      await this.$store.dispatch(UPDATE_CHAT_RECORD, {
        ...obj,
        isUpMsgType: true
      });
      if (this.fromGroupType !== 'single') {
        await this.queryGroupInfo();
      }
      this.$forceUpdate();
    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    transferQuote (item, quoteMsg) {
      if (this.personalAppealInfo.endTime) {
        let time = `${this.personalAppealInfo.createTime}--${this.personalAppealInfo.endTime}`;
        this.$confirm(this.$t('appeal_0003', { time }), this.$t('Universal_0059'), {
          confirmButtonText: this.$t('appeal_0017'),
          cancelButtonText: this.$t('book_group_0019'),
          center: true,
          showClose: false,
        }).then(() => {
          this.toAppeal('single');
        }).catch(() => {
        });
        return;
      }
      this.quoteVisible = true;
      let patt = /\[([^\\[])+?\]/g;
      let originText;
      let arr;
      let emojiFlag = null;
      if (String(quoteMsg)) {
        originText = String(quoteMsg);
        arr = originText.match(patt);
      }
      if (arr && originText) {
        for (let index = 0; index < arr.length; index++) {
          let item = arr[index];
          let ret = emojiList.find(x => x.tag == item);
          if (ret) {
            let img = `<img src="/resources/emoji/${ret.file}" width=22px />`;
            originText = originText.replace(item, img);
            emojiFlag = true
          }
        }
      }
      // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
      if (this.fromGroupType === 'single') {
        const myName = UserInfoUtils.getCurrentUserInfo().nickName;
        if (item.fromId == UserInfoUtils.getCurrentUserId()) {
          if (emojiFlag) {
            this.$refs.quoteMsgs.innerHTML = `${myName} ：${originText}`;
          } else {
            this.$refs.quoteMsgs.innerText = `${myName} ：${originText}`
          }
        } else {
          if (emojiFlag) {
            this.$refs.quoteMsgs.innerHTML = `${this.userInfo.friend_nick_name} ：${originText}`;
          } else {
            this.$refs.quoteMsgs.innerText = `${this.userInfo.friend_nick_name} ：${originText}`;
          }
        }
      } else {
        if (emojiFlag) {
          this.$refs.quoteMsgs.innerHTML = `${item.nickName} ：${originText}`;
        } else {
          this.$refs.quoteMsgs.innerText = `${item.nickName} ：${originText}`;
        }
      }
      this.quoteReqId = item.reqId;
      this.quoteMsgId = item.msgId;
      this.quoteFromName = item.nickName || item.fromName;
      this.quill?.focus?.();
    },

    closeQuote () {
      this.quoteVisible = false;
      this.quoteMsgId = '';
      this.quoteReqId = '';
      this.quoteFromName = '';
      this.$refs.quoteMsgs.innerHTML = '';
    },

    async resizeChange (e) {
      //if (!this.silentMaskShow) {
      // await resizeFun();
      resizeFun(this.sHeight || document.getElementById("talk").scrollHeight, e);
      return false;
    },

    async copyText (item) {
      if (item.msgType == '2') {
        const imagepath = await fileOperational.getPath(item.msgBody.mediaId);
        setTimeout(() => {
          clipboard.writeImage(imagepath, 'clipboard');
        }, 500);
      } else {
        this.$nextTick(() => {
          clipboard.writeText(item.msgBody.text, 'clipboard');
          document.execCommand('copy');
        });
      }
      this.$message.success(this.$t('Universal_0384'));
    },

    handCancelFriDialog (param) {
      this.dialogAddFriendsVisible = param;
    },

    handConfirmFriDialog (param) {
      this.dialogAddFriendsVisible = param;
    },
    multiSelectValidation (item) {
      if (item.checked) { //修复：多选选择多个会话后，点击加载更多，之前选中的状态消失
        item.checked = false
      } else {
        item.checked = true
      }
      if (this.checkList2.length > 30) {
        this.$alert(this.$t('chat_0046'), this.$t('Universal_0059'), {
          confirmButtonText: this.$t('book_group_0019'),
          cancelButtonText: this.$t('Universal_0063'),
          center: true,
          showClose: true,
          customClass: 'message-box-class'
        }).then(() => {
          this.checkList2.pop();
          item.checked = false;
        });
      }
    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    multiRelay (isMerge) {
      if (this.personalAppealInfo.endTime) {
        let time = `${this.personalAppealInfo.createTime}--${this.personalAppealInfo.endTime}`;
        this.$confirm(this.$t('appeal_0003', { time }), this.$t('Universal_0059'), {
          confirmButtonText: this.$t('appeal_0017'),
          cancelButtonText: this.$t('book_group_0019'),
          center: true,
          showClose: false,
        }).then(() => {
          this.toAppeal('single');
        }).catch(() => {
        });
        return;
      }
      let arryItem = this.checkList.concat(this.checkList2);
      if (arryItem.length == 0) {
        this.$message.warning(this.$t('chat_0102'));
      } else {
        let arryItem2 = [];
        arryItem.map(item => {
          arryItem2.push({
            msgId: item.msgId,
            targetId: this.fromGroupType === 'single' ? this.$route.query.fromId : this.groupId,
            msgOrder: item.msgOrder
          }); //此时的targetId就是发送人的id或者是群Id
        });
        this.showDialogRelay(arryItem2, isMerge);
      }
    },

    //去申诉
    toAppeal (impeachFromtype) {
      this.impeachFromtype = impeachFromtype;
      this.AppealsVisible = true;
      this.$refs.appeal.init();
    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    toImpeachDialog () {
      // eslint-disable-next-line max-len
      if (this.authStatus === '3' && this.impeachFromtype !== 'single' && this.fromGroupType !== 'single') return this.$message.error(this.$t('appeal_0012'));
      this.AppealsVisible = false;
      this.ImpeachVisible = true;
      this.$refs.impeach.init()
    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    async showDialogRelay (arrayItem, isMerge) {
      if (this.personalAppealInfo.endTime) {
        let time = `${this.personalAppealInfo.createTime}--${this.personalAppealInfo.endTime}`;
        this.$confirm(this.$t('appeal_0003', { time }), this.$t('Universal_0059'), {
          confirmButtonText: this.$t('appeal_0017'),
          cancelButtonText: this.$t('book_group_0019'),
          center: true,
          showClose: false,
        }).then(() => {
          this.toAppeal('single');
        }).catch(() => {
        });
        return;
      }
      this.Comtit = this.$t('Universal_0202');
      this.GroupInviteVisible = true;
      this.merge = isMerge;
      // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
      this.mergeTransferName = this.fromGroupType === 'single' ? this.userInfo.friend_nick_name : this.$t('chat_search_0005');
      arrayItem.sort((a, b) => {
        return a.msgOrder - b.msgOrder;
      });
      await this.$store.commit('SET_TRANSFER_ITEM', arrayItem);
      this.checkList2.length && this.checkList2.forEach(item => (item.checked = false));
    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    cancelDialogHand () {
      this.GroupInviteVisible = false;
      this.mutiChooseTag = false; //隐藏多选按钮
      this.mutiPanel = false;
      if (this.fromGroupType !== 'single') {
        this.queryMember();
      }
    },

    transferSuccess () {
      this.GroupInviteVisible = false;
      this.cardDialogVisible = false;
      this.$refs.groupCard.onClose();
    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    handUpload () {
      if (this.personalAppealInfo.endTime) {
        let time = `${this.personalAppealInfo.createTime}--${this.personalAppealInfo.endTime}`;
        this.$confirm(this.$t('appeal_0003', { time }), this.$t('Universal_0059'), {
          confirmButtonText: this.$t('appeal_0017'),
          cancelButtonText: this.$t('book_group_0019'),
          center: true,
          showClose: false,
        }).then(() => {
          this.toAppeal('single');
        }).catch(() => {
        });
        return;
      }
      // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
      if (this.fromGroupType !== 'single' && this.showAppealClosureNotice) {
        let message = this.fromGroupType === "group" ? this.$t('appeal_0013') : this.$t('appeal_0014');
        return this.$message.error(message);
      }
      if (this.fromGroupType !== 'single' && this.groupSystemObj.sendFile == "0" && this.authStatus == 3) { // 这里要注意 讨论组是无法禁言的
        this.openMessage(this.$t('chat_0099'));
        return;
      }
      // 上传文件
      this.$refs.files.click();
    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    async changeHand (e) {
      // 上传文件：单个上传（接口限制）
      if (e.target.files.length > this.limit) {
        this.$message.warning(this.$t('chat_0105', { limit: this.limit }));
        return;
      }
      let files = [...new Set(e.target.files)];
      for (let file of files) {
        let flag = await fileValidation(file, this);
        if (!flag) {
          e.target.value = '';
          return false;
        }
        let fileType = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
        file.fileType = fileType;
        if (fileType === 'exe' || fileType === 'bat' || fileType === 'dmg') {
          e.target.value = '';
          this.$message.error(this.$t('chat_0106'));
          return false;
        }
      }
      for (let file of files) {
        let fileType = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
        if (fileType != 'exe' && fileType != 'bat') {
          await this.sendFileLocal(file);
        }
      }
      for (let item in files) {
        let formData = new FormData(); // 这里formData 没有用到 注意一下
        let fileType = files[item].name.substring(files[item].name.lastIndexOf('.') + 1).toLowerCase();
        formData.append('file', files[item]); // 这里formData 没有用到 注意一下
        if (pictureTypeArr.indexOf(fileType) > -1) {
          formData.append('fileFlag', true); // 这里formData 没有用到 注意一下
          this.handSendImg(files[item]);
        } else if (videoTypeArr.indexOf(fileType) > -1) {
          this.mesType = '10';
          this.handSendVideo(files[item]);
        } else {
          if (this.fromGroupType === 'single') {
            this.fileReqId = files[item].reqId;
          }
          this.handSendFile(files[item]);
        }
      }
      e.target.value = '';
    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    async sendVideoLocal (file) {
      let reqId = uuidv4();
      file.reqId = reqId;
      // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
      const id = this.fromGroupType === 'single' ? this.userInfo.id : this.groupId
      let maxMsgOrder = await SQLUtils.getMaxMsgOrderInMessages(id);
      let chat = await this.buildVideoChatContent(file, maxMsgOrder);
      chat.msgBody.firstFrame.width = 140
      chat.msgBody.firstFrame.height = 250
      this.videoImg(file, async (w, h) => {
        // if (w === 0 && h === 0) {
        //   chat.msgBody.noFirstFrame = true;
        // } else {
        //   const rate = w / h
        //   if (rate > 1) {
        //     // 比例基 300px
        //     chat.msgBody.firstFrame.width = 250
        //     chat.msgBody.firstFrame.height = 140
        //   } else {
        //     chat.msgBody.firstFrame.width = 140
        //     chat.msgBody.firstFrame.height = 250
        //   }
        // }
        // 设置默认的宽高
        if (w !== 0 && h !== 0 && (w / h) > 1) {
          // 比例基 300px
          chat.msgBody.firstFrame.width = 250
          chat.msgBody.firstFrame.height = 140
        }

        this.chatList.push(chat);
        await SQLUtils.insertFileChatContent(chat);
      })
    },

    videoImg (file, callback) {
      console.log('videoImg- ', file)
      /*const reader = new FileReader()
    reader.readAsDataURL(file)
    const videoUrl = URL.createObjectURL(file)*/
      const videoUrl = file.path;
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
    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    async sendImageLocal (item, reqId) {
      item.reqId = reqId;
      // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
      const id = this.fromGroupType === 'single' ? this.userInfo.id : this.groupId
      let maxMsgOrder = await SQLUtils.getMaxMsgOrderInMessages(id);
      let chat = await this.buildImageChatContent(item, maxMsgOrder);
      this.chatList.push(chat);
      await SQLUtils.insertFileChatContent(chat);
    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    async sendFileLocal (file) {
      // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
      if (this.fromGroupType === 'single') {
        file.fromId = UserInfoUtils.getCurrentUserId();
        file.friendId = this.userInfo.id;
      } else {
        file.fromId = this.userId;
        file.friendId = this.groupId;
      }
      if (pictureTypeArr.indexOf(file.fileType) > -1) {
        let reqId = uuidv4();
        if (file.fileType.includes('tif')) {
          const Tiff = require('tiff.js');
          let reader = new FileReader();
          reader.onload = async e => {
            if (typeof e.target.result === 'object') {
              let tiff = new Tiff({ buffer: e.target.result });
              file.image = tiff.toDataURL()
              await this.sendImageLocal(file, reqId);
            }
          };
          reader.readAsArrayBuffer(file);
        } else {
          let bitmap = fs.readFileSync(path.resolve(decodeURI(file.path)));
          let base64str = Buffer.from(bitmap, 'binary').toString('base64');
          let imageSrc = 'data:image;base64,' + base64str;
          file.image = imageSrc;
          await this.sendImageLocal(file, reqId);
        }

      } else if (videoTypeArr.indexOf(file.fileType) > -1) {
        await this.sendVideoLocal(file);
      } else {
        let reqId = uuidv4();
        file.reqId = reqId;
        // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
        const id = this.fromGroupType === 'single' ? this.userInfo.id : this.groupId
        let maxMsgOrder = await SQLUtils.getMaxMsgOrderInMessages(id);
        let chat = await this.buildFileChatContent(file, maxMsgOrder);
        this.chatList.push(chat);
        await SQLUtils.insertFileChatContent(chat);
      }
    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    async buildFileChatContent (file, msgOrder) {
      // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
      const id = this.fromGroupType === 'single' ? this.$route.query.fromId : this.groupId
      const str = this.fromGroupType === 'single' ? '1' : '2'
      let effectiveTime = await SQLUtils.getMsgExpireTime(id, str);
      return {
        fromId: this.userId,
        fromPush: true,
        fromType: 999,
        id: id,
        msgBody: {
          format: file.fileType,
          fileName: file.name,
          originTypePsw: true,
          fsize: file.size,
          fname: file.name,
          fileSize: file.size,
          reqId: file.reqId,
          fromId: file.fromId,
          friendId: file.friendId,
          downloadPercent: '100%',
          downloadFinished: true,
          downloadPath: file.path,
          path: file.path
        },
        msgHeader: {
          effectiveTime
        },
        msgId: '',
        msgOrder,
        msgType: 6,
        readStatus: false,
        refMsgBody: {},
        reqId: file.reqId,
        targetId: id,
        // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
        targetType: this.fromGroupType === 'single' ? 1 : 2,
        timestamp: new Date().getTime(),
        // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
        uniqueCode: this.fromGroupType === 'single' ? contFriSize(id, this.userId) : 'GROUP@' + id,
        sendStatus: 1
      };
    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    async buildVideoChatContent (file, msgOrder) {
      // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
      const id = this.fromGroupType === 'single' ? this.$route.query.fromId : this.groupId
      const str = this.fromGroupType === 'single' ? '1' : '2'
      let effectiveTime = await SQLUtils.getMsgExpireTime(id, str);
      return {
        fromId: this.userId,
        fromPush: true,
        fromType: 999,
        id: id,
        msgBody: {
          fileId: file.path,
          fsize: file.size,
          format: file.fileType, // 讨论组 这边是 file.type
          reqId: file.reqId,
          firstFrame: {
            fsize: file.size,
            format: file.fileType
          },
          fromId: file.fromId,
          friendId: file.friendId,
          path: file.path
        },
        msgHeader: {
          effectiveTime
        },
        msgId: '',
        msgOrder,
        msgType: 10,
        readStatus: false,
        refMsgBody: {},
        reqId: file.reqId,
        targetId: id,
        targetType: this.fromGroupType === 'single' ? '1' : '2',
        timestamp: new Date().getTime(),
        // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
        uniqueCode: this.fromGroupType === 'single' ? contFriSize(id, this.userId) : 'GROUP@' + id,
        sendStatus: 1
      };
    },
    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    async buildImageChatContent (file, msgOrder) {
      // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
      const id = this.fromGroupType === 'single' ? this.$route.query.fromId : this.groupId
      const str = this.fromGroupType === 'single' ? '1' : '2'
      let effectiveTime = await SQLUtils.getMsgExpireTime(id, str);
      let dimensions = {}
      let fileType = file.fileType?.toLowerCase()
      if (fileType.indexOf('gif') > -1) {
        dimensions = sizeOf(file.path)
        console.log(dimensions.width, dimensions.height)
      }
      const { width, height } = nativeImage.createFromPath(file.path).getSize();
      return {
        fromId: this.userId,
        fromPush: true,
        fromType: 999,
        id: id,
        msgBody: {
          mediaCondenseId: file.image,
          path: file.path,
          reqId: file.reqId,
          fsize: file.size,
          format: file.fileType,
          fromId: file.fromId,
          friendId: file.friendId,
          width: width || dimensions.width,
          height: height || dimensions.height
        },
        msgHeader: {
          effectiveTime
        },
        msgId: '',
        msgOrder,
        msgType: 2,
        readStatus: false,
        refMsgBody: {},
        reqId: file.reqId,
        targetId: id,
        targetType: this.fromGroupType === 'single' ? '1' : '2',
        timestamp: new Date().getTime(),
        // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
        uniqueCode: this.fromGroupType === 'single' ? contFriSize(id, this.userId) : 'GROUP@' + id,
        sendStatus: 1
      };
    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    async handSendImg (file) {
      console.log('file ====>', file);
      const files = new FileUpload(file.path, file.reqId);
      const upload = await files.imageUpload();
      if (upload == undefined) {
        this.uploadFilesFail(file.reqId);
        return;
      }
      const { width, height } = nativeImage.createFromPath(file.path).getSize();
      const msgBody = {
        fileNo: upload[0].id,
        mediaId: upload[0].url,
        mediaCondenseId: upload[upload.length - 1].url,
        width: upload[0].width || width,
        height: upload[0].height || height,
        fsize: file.size,
        format: file.fileType,
        reqId: file.reqId,
        fromId: file.fromId,
        friendId: file.friendId,
        path: file.path,
        localPath: file.name ? path.join(configDirPath, file.name) : file.path
      };
      if (file.name) {
        const imageData = fs.readFileSync(file.path);
        fs.writeFileSync(path.join(configDirPath, file.name), imageData);
      }
      this.mesType = '2';
      this.quoteVisible = false;
      if (this.fromGroupType === 'single') {
        this.fileReqId = file.reqId;
      }
      this.POST_chat_rest_send(msgBody, '', msgBody.friendId);
    },

    async reHandSendVideo (file) {
      try {
        // console.error('~~~~reHandSendVideo~~~~~~~',file)
        // 重发 本地路径
        const files = new FileUpload(file?.downloadPath || file?.originDistPath || file.path, file.reqId);
        const upload = await files.videoUpload();
        // 判断是否是h265视频
        // let isH265 = false;
        // let res = await files.getVideoCodeC();
        // if (res?.video && (res.video.codec == 'hevc' || res.video.codec.includes('h265'))) {
        //   isH265 = true;
        // } else {
        //   isH265 = false;
        // }


        if (upload?.errorInfo && upload?.errorInfo === 101) {
          this.$message.error(this.$t('Universal_0381'));
          this.uploadFilesFail(file.reqId);
          return;
        }
        if (upload == undefined) {
          this.uploadFilesFail(file.reqId);
          return;
        }
        const msgBody = {
          ...file,
          fileNo: upload.id,
          fileId: upload.url,
          dur: upload.duration,
          width: upload.width,
          height: upload.height,
          path: upload.url,
          firstFrame: {
            mediaId: upload.cover,
            width: upload.width,
            height: upload.height,
            fsize: file.size,
            format: file.fileType
          },
          // isH265
        };
        this.mesType = '10';
        this.quoteVisible = false;
        this.POST_chat_rest_send(msgBody, '', msgBody.friendId);
      } catch (error) {
        this.uploadFilesFail(file.reqId);
        console.error(error)
      }
    },

    async handSendVideo (file) {
      try {
        // 第一次发送,用户磁盘路径
        // console.error('~~~~handSendVideo~~~~~~~',file)
        const files = new FileUpload(file.path, file.reqId);
        const upload = await files.videoUpload();
        // 判断是否是h265视频
        // let isH265 = false;
        // let res = await files.getVideoCodeC();
        // if (res.video && (res.video.codec == 'hevc' || res.video.codec.includes('h265'))) {
        //   isH265 = true;
        // } else {
        //   isH265 = false;
        // }

        if (upload?.errorInfo === 101) {
          this.$message.error(this.$t('Universal_0381'));
          this.uploadFilesFail(file.reqId);
          return;
        }
        if (upload == undefined) {
          this.uploadFilesFail(file.reqId);
          return;
        }
        const msgBody = {
          originDistPath: file['path'],//new FileUpload() 本地路径 消息发送失败重发。使用本地路径重发 非线上服务器地址upload.url
          fileNo: upload.id,
          fileId: upload.url,
          dur: upload.duration,
          fsize: upload.filesize,
          width: upload.width,
          height: upload.height,
          format: file.fileType,
          reqId: file.reqId,
          firstFrame: {
            mediaId: upload.cover,
            fsize: upload.filesize,
            format: file.fileType
          },
          fromId: file.fromId,
          friendId: file.friendId,
          path: upload.url,
          // isH265
        };

        // 设置默认的宽高 
        msgBody.firstFrame.width = 140
        msgBody.firstFrame.height = 250
        // 如果能获取到本地视频的宽高
        this.videoImg(file, (w, h) => {
          if (w !== 0 && h !== 0 && (w / h) > 1) {
            msgBody.firstFrame.width = 250
            msgBody.firstFrame.height = 140
          }
          this.mesType = '10';
          this.quoteVisible = false;
          this.POST_chat_rest_send(msgBody, '', msgBody.friendId);
        })
      } catch (error) {
        this.uploadFilesFail(file.reqId);
        console.error(error)
      }
    },

    async reHandSendFile (file) {
      try {
        // 重发 本地路径
        const files = new FileUpload(file?.downloadPath || file.path, file.reqId);
        const upload = await files.fileUpload();
        if (upload == undefined) {
          this.uploadFilesFail(file.reqId);
          return;
        }
        const msgBody = {
          ...file,
          fileNo: upload.id,
          fileId: upload.url,
          fileUrl: upload.url,
          downloadPercent: '100%',
          downloadFinished: true
        };
        this.mesType = '6';
        this.quoteVisible = false;
        let fileState = { key: file.reqId, value: {} };
        fileState.value.downloadPercent = '100%';
        fileState.value.downloadFinished = true;
        fileState.value.downloadPath = file.path;
        this.$store.commit(SET_DOWNLOAD_FILE_INFO, fileState);
        this.POST_chat_rest_send(msgBody, '', msgBody.friendId);
      } catch (error) {
        this.uploadFilesFail(file.reqId);
        console.error(error)
      }
    },

    async handSendFile (file) {
      try {
        const files = new FileUpload(file.path, file.reqId);
        const upload = await files.fileUpload();
        if (upload == undefined) {
          this.uploadFilesFail(file.reqId);
          return;
        }
        const msgBody = {
          fileNo: upload.id,
          fileId: upload.url,
          fsize: file.size,
          fname: file.name,
          format: file.fileType,
          fileName: file.name,
          fileSize: file.size,
          fileUrl: upload.url,
          reqId: file.reqId,
          fromId: file.fromId,
          friendId: file.friendId,
          downloadPercent: '100%',
          downloadFinished: true,
          downloadPath: file.path,
          path: file.path
        };
        this.mesType = '6';
        this.quoteVisible = false;
        let fileState = { key: file.reqId, value: {} };
        fileState.value.downloadPercent = '100%';
        fileState.value.downloadFinished = true;
        fileState.value.downloadPath = file.path;
        this.$store.commit(SET_DOWNLOAD_FILE_INFO, fileState);
        this.POST_chat_rest_send(msgBody, '', msgBody.friendId);
      } catch (error) {
        this.uploadFilesFail(file.reqId);
        console.error(error)
      }
    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    async uploadFilesFail (reqId) {
      this.chatList.map(item => {
        if (item.reqId == reqId) {
          item.sendStatus = -1;
        }
      });
      // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
      const id = this.fromGroupType === 'single' ? this.userInfo.id : this.groupId
      await SQLUtils.sendMessageFail(id, reqId);
    },

    dataURItoBlob (base64Data) {
      let mimeString = base64Data
        .split(',')[0]
        .split(':')[1]
        .split(';')[0];

      let byteString;
      if (base64Data.split(',')[0].indexOf('base64') >= 0) byteString = atob(base64Data.split(',')[1]);
      else byteString = unescape(base64Data.split(',')[1]);

      let ia = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ia], {
        type: mimeString
      });
    },

    isUrl (link) {
      // eslint-disable-next-line
      let regexp = /((http|https):\/\/([\w\-]+\.)+[\w\-]+(\/[\w\u4e00-\u9fa5\-\.\/?\@\%\!\&=\+\~\:\#\;\,]*)?)/gi;
      let url = link.match(regexp);
      // eslint-disable-next-line
      let regexpWithoutHttp = /(([\w\-]+\.)+[\w\-]+(\/[\w\u4e00-\u9fa5\-\.\/?\@\%\!\&=\+\~\:\#\;\,]*)?)/gi;
      let urlWithoutHttp = link.match(regexpWithoutHttp);
      if (url || urlWithoutHttp) {
        return true;
      } else {
        return false;
      }
    },
    isUrlFlag (link) {
      // eslint-disable-next-line
      let urlReg = /((http|https):\/\/([\w\-]+\.)+[\w\-]+(\/[\w\u4e00-\u9fa5\-\.\/?\@\%\!\&=\+\~\:\#\;\,]*)?)/gi;
      let result;
      result = link.replace(urlReg, (r) => {
        if (!r.startsWith("http")) {
          return r;
        } else {
          let httpn = r.indexOf("//");
          if (httpn == -1) {
            return r;
          } else {
            return `<a href="${r}">${r}</a>`;
          }
        }
      });
      return result.includes('<a href');
    },
    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    sendQuillByThrottle () {
      if (this.personalAppealInfo.endTime) {
        let time = `${this.personalAppealInfo.createTime}--${this.personalAppealInfo.endTime}`;
        this.$confirm(this.$t('appeal_0003', { time }), this.$t('Universal_0059'), {
          confirmButtonText: this.$t('appeal_0017'),
          cancelButtonText: this.$t('book_group_0019'),
          center: true,
          showClose: false,
        }).then(() => {
          this.toAppeal('single');
        }).catch(() => {
        });
        return;
      }
      // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
      if (this.fromGroupType !== 'single') {
        if (this.showAppealClosureNotice) {
          let message = this.fromGroupType === 'group' ? this.$t('appeal_0013') : this.$t('appeal_0014');
          return this.$message.error(message);
        }
        this.onEditorBlur();
      }
      // 判断编辑框内是否都是换行标签，或全部是空格
      let texthtmlStr = this.texthtml.replace(/<p>(\s+|<br>)<\/p>/g, ''), timer;
      if (!this.texthtml || !texthtmlStr) {
        this.$message.warning(this.$t('chat_0107'));
        this.sendBtnDisabled = true;
        this.quill.blur();
        // 将编辑框置空
        this.quill.setText('');
        timer = setTimeout(() => {
          // 出现空消息的情况，在一秒内，让发送按钮不可用，编辑器失去焦点
          this.sendBtnDisabled = false;
          this.quill.focus();
          clearTimeout(timer);
          timer = null;
        }, 1000);
        return;
      }
      let now = Date.now();
      const maxCountPerMinute = 3;
      let isSameSecond = parseInt(this.lastTime / 1000) === parseInt(now / 1000);
      // 在同一秒内发送次数大于3就给出提示
      if (isSameSecond) {
        this.count++;
        if (this.count > maxCountPerMinute) {
          this.$message.warning(this.$t('chat_0108'));
          this.sendBtnDisabled = true;
          this.quill.blur();
          timer = setTimeout(() => {
            // 发送过于频繁，在一秒内，让发送按钮不可用，编辑器失去焦点
            this.sendBtnDisabled = false;
            this.quill.focus();
            clearTimeout(timer);
            timer = null;
          }, 1000);
          return;
        }
        this.sendQuill();
        return;
      }
      this.sendQuill();
      this.lastTime = now;
      this.count = 0;
      this.emojiVisible = false;
    },
    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    async handlelist (list = []) {
      const quotTypes = ['1', '2', '6', '10', '15', '25', '40', '56'];
      if (list.length > 0) {
        const arr = await Promise.all(
          list.map(async ele => {
            if (ele.msgType == 25) {
              ele.quoteMsgId = ele.msgBody.msgs[0].msgId;
              ele.quoteReqId = ele.msgBody.msgs[0].reqId;
              // eslint-disable-next-line max-len
              const quotemsgObj = await SQLUtils.findQuotMsg(this.fromGroupType === 'single' ? this.$route.query.fromId : this.$route.query.targetId, ele.targetType, ele.quoteMsgId, ele.quoteReqId);
              if (quotemsgObj) {
                ele.quotemsgObj = quotemsgObj;
                ele.quotemsgObj.msg_body = ele.quotemsgObj.msgBody;
                ele.quotemsgObj.ref_body = ele.quotemsgObj.refMsgBody;
                ele.quotemsgObj.showfile = false;
                if (ele.quotemsgObj.text == this.$t('chat_0065')) {
                  ele.msgBody.quoteFromName = '';
                } else {
                  if (this.fromGroupType === 'single') {
                    ele.msgBody.quoteFromName =
                      quotemsgObj.ref_body?.fromName || quotemsgObj.fromName || JSON.parse(localStorage.getItem('userInfo')).nickName;
                  } else {
                    ele.msgBody.quoteFromName = quotemsgObj.nickName || quotemsgObj.ref_body?.fromName || quotemsgObj.fromName || '';
                  }
                }
              }
            }
            ele.msgType = ele.msgType + '';
            if (quotTypes.indexOf(ele.msgType) > -1) {
              ele.disabled = false;
            } else {
              ele.disabled = true;
            }
            return ele;
          })
        );
        console.log('=======,', arr)
        return arr;
      } else {
        return [];
      }
    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    //举报
    tipOff () {
      this.$router.push({
        path: "/app/chat/tipoffs",
        query: {
          impeachType: this.fromGroupType === 'single' ? 1 : 2,
          othersId: this.fromGroupType === 'single' ? this.$route.query.fromId : this.groupId,
        },
      });
    },

    //消息置顶
    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    stickyChange (val) {
      // const id = this.fromGroupType === 'single' ? this.userInfo.id : this.groupId
      // const targetType = this.fromGroupType === 'single' ? 1 : 2
      // await overheadAndNoticeFlagById(
      //   {
      //     id: id,
      //     targetType: targetType
      //   },
      //   'topFlag',
      //   val
      // );
      // // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
      // if (this.fromGroupType !== 'single') {
      //   await window.vm
      //     .$knex('t_sessions')
      //     .where('id', '=', this.groupId)
      //     .update({
      //       topFlag: val
      //     });
      // }
      this.changeNotifyStatus(val, 'topFlag')
      // this.GET_LAST_MSG_LIST();
    },

    //消息免打扰
    NotifyChange (val) {
      // const id = this.fromGroupType === 'single' ? this.userInfo.id : this.groupId
      // const targetType = this.fromGroupType === 'single' ? 1 : 2
      // await overheadAndNoticeFlagById(
      //   {
      //     id: id,
      //     targetType: targetType
      //   },
      //   'noNoticeFlag',
      //   val
      // );
      // // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
      // if (this.fromGroupType !== 'single') {
      //   await window.vm
      //     .$knex('t_sessions')
      //     .where('id', '=', this.groupId) // 这里应该是groupId ？ 原值是 this.$route.query.id
      //     .update({
      //       noNoticeFlag: val
      //     });
      // }
      this.changeNotifyStatus(val, 'noNoticeFlag')
      // this.GET_LAST_MSG_LIST();
    },

    async changeNotifyStatus (val, status) { // status = topFlag || noNoticeFlag
      const id = this.fromGroupType === 'single' ? this.userInfo.id : this.groupId
      const targetType = this.fromGroupType === 'single' ? 1 : 2
      await overheadAndNoticeFlagById(
        {
          id: id,
          targetType: targetType
        },
        status,
        val
      );
      // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
      if (this.fromGroupType !== 'single') {
        await window.vm
          .$knex('t_sessions')
          .where('id', '=', this.groupId) // 这里应该是groupId ？ 原值是 this.$route.query.id
          .update({
            [status]: val
          });
      }
      this.GET_LAST_MSG_LIST();
    },

    //消息保存时常
    messageSaveTime () {
      this.saveTimeVisible = true;
    },

    saveTimeSelected (item, index) {
      this.saveTimeActive = index;
    },

    cancelsaveExpireTime () {
      const originIndex = this.saveTimeArr.findIndex(item => {
        return item.label == this.saveTime;
      });
      this.saveTimeActive = originIndex;
      this.saveTimeVisible = false;
    },

    // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
    async loadmorelist () {
      console.log(this.chatList, 'sssss', this.checkList2, 'tttt', this.checkList)
      this.noMoreShowFlg = false;
      let minOrder = 0;
      try {
        if (this.chatList && this.chatList.length > 0) {
          minOrder = this.chatList[0].msgOrder;
        }
        this.topMsgOrder = minOrder;
        let whereClause = `msg_order < ${minOrder}`;
        // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
        let uplist = []
        if (this.fromGroupType === 'single') {
          uplist = await SQLUtils.selectSingleChatList(this.$route.query.fromId, whereClause);
        } else {
          uplist = await SQLUtils.selectGroupChatList(this.groupId, whereClause);
        }
        if (uplist.length < 30) {
          this.hasMore = false;
          this.noMoreShowFlg = true;
        }
        const upNewList = await this.handlelist(uplist);
        await this.chatList.unshift(...upNewList);
        // 全局变量 fromGroupType = 'single' || 'group' || 'discussion'
        if (this.fromGroupType !== 'single') {
          Ws.getManyGroupMessage(this.groupId);
        }
        this.$nextTick(() => {
          if (this.$refs.activeRef) {
            this.$refs.activeRef[0].scrollIntoView();
            //TODO 会往上缩一点，把原来“加载更多”这一行的位置覆盖掉
          }
        });
        this.checkList2 = this.chatList.filter(i => i.checked);
      } catch (err) {
        console.error(err, 'loadmorelist');
      }
      this.listLoading = false;
    },

    reEditMsg (item) {
      let originText;
      if (item.msgBody.text) {
        originText = item.msgBody.text;
      }
      quillEditorlContextmenuMethods.pasteEmoji(originText, this);
      let thisQuillLength = this.quill.getLength();
      this.quill.setSelection(thisQuillLength);
    },

    async getDraft () {
      let texthtml = '';
      if (this.$route.query?.item?.draftHtml) {
        texthtml = this.$route.query?.item?.draftHtml || '';
      } else {
        texthtml = await SQLUtils.getKeyFromSession(this.$route.query.id, 'draftHtml');
      }
      this.quill.pasteHTML(texthtml);
      let thisQuillLength = this.quill.getLength();
      this.quill.setSelection(thisQuillLength);
    },

    screenSelectChange () {
      this.$nextTick(() => {
        this.screenShotVisible = false;
        this.$store.commit(SET_SCREEN_SELECT, this.screenSelect);
      });
    },

    handleMediaShare (e, data) {
      console.log('%c~~~', 'font-size:20px;', e, data);
      if (!data) {
        return;
      }
      this.showDialogRelay([data], false);
    },

    _clipboardImage (e, { dataURL }) {
      this.$nextTick(() => {
        let range = this.quill.getSelection(true);
        let delta = new Delta();
        this.quill.updateContents(
          delta
            .retain(range && range.index ? range.index : 0)
            .delete(range && range.length ? range.length : 0)
            .insert({ image: dataURL }),
          'user'
        );
        // 调整光标到最后
        this.quill.setSelection(range.index + 1, 'user');
      });
    },

    openMessage (msg) {
      this.$alert(msg, this.$t('Universal_0059'), {
        confirmButtonText: this.$t('book_group_0019'),
        center: true,
        showClose: true,
        customClass: 'message-box-class'
      });
    },
    // globalShortcutBol 全局快捷键截图时 过滤 this.screenSelect
    captureScreen (e, globalShortcutBol) {
      console.log(globalShortcutBol)
      if (this.personalAppealInfo.endTime) {
        let time = `${this.personalAppealInfo.createTime}--${this.personalAppealInfo.endTime}`;
        this.$confirm(this.$t('appeal_0003', { time }), this.$t('Universal_0059'), {
          confirmButtonText: this.$t('appeal_0017'),
          cancelButtonText: this.$t('book_group_0019'),
          center: true,
          showClose: false,
        }).then(() => {
          this.toAppeal('single');
        }).catch(() => {
        });
        return;
      }

      if (this.fromGroupType !== 'single' && this.showAppealClosureNotice) {
        let message = this.fromGroupType === "group" ? this.$t('appeal_0013') : this.$t('appeal_0014');
        return this.$message.error(message);
      }
      if (!globalShortcutBol && this.screenSelect) { // 非快捷键截图
        const browserWindow = window.vm.$remote.getCurrentWindow();
        if (!(process.platform == "darwin" && browserWindow.isMaximized())) {
          browserWindow.minimize();
        }
        // browserWindow.minimize();
      }
      if (process.platform !== "darwin") {
        setTimeout(() => {
          screenWindow(globalShortcutBol ? globalShortcutBol : this.screenSelect);
        }, 100)
      } else {
        ipcRenderer.send("capture-screen");
      }
    },

    cancelAppealsDialogHand (param) {
      this.AppealsVisible = param;
    },
    cancelImpeachDialogHand (param) {
      this.ImpeachVisible = param;
    },


  },

  beforeDestroy () {
    document.removeEventListener('keydown', this.handleKeydown, true);
    bus.$off('_saveTime', this._saveTime);
    this.dataLists = [];
    this.chatList = [];
    this.checkList2 = [];
    this.$store.commit('SET_GROUP_MEMBER', []);
    if (this.amr) {
      this.stopVideo();
    }
    localStorage.removeItem('currentChat');
    ipcRenderer.removeListener('clipboardImage', this._clipboardImage)
    ipcRenderer.removeListener('media-share', this.handleMediaShare);
    ipcRenderer.removeListener('windows-captureShortcut', this.captureScreen);
    if (this.fromGroupType === 'group' || this.fromGroupType === 'discussion') {
      ipcRenderer.removeListener('group-appeal', this.queryGroupAppealInfo);
    }
    if (this.fromGroupType === 'group') ipcRenderer.removeListener('group-exceed', this.queryGroupExceedInfo);
    window.removeEventListener('drop', this.dropwrapperListenerDrop);
    window.removeEventListener('dragenter', this.dropwrapperListenerDragenter);
    window.removeEventListener('dragover', this.dragoverListenerDragenter);
    window.removeEventListener('dragleave', this.dragleaveListenerDragenter);
    this.$refs.myQuillEditor.quill = null;
  }

};
