import { findIndex } from "lodash";
import Message from "@/services/message";
import moment from "moment";
import { batchInviteAddGroup } from "../../../components/chat/server";
import { send_add_group_apply } from "../../add-friends-group/add/server";
import { v4 as uuidv4 } from "uuid";
import fileOperational from "@/services/fileOperational";
import emojiList from "@/utils/emoji.js";
import SQLUtils from "@/components/db/sqlite.js";
import {
  // UPDATE_ISAT_SESSION,
  SET_CURRENT_CHAT,
  DEL_LAST_MSG_LIST,
  GO_CHAT_HOME,
  GET_LAST_MSG_LIST,
  SET_CHAT_LIST,
  CHAT_REST_SEND,
  UPDATE_CHAT_RECORD,
  SET_CHAT,
} from "@/store/types";
import { deleteSessionsWithoutDraft } from "@/services/rightClickByDB";
import memberMenuGroup from "../group/message/memberMenu"; // 群聊 和 讨论组不一样
import memberMenuDiscussion from "../discussion/message/memberMenu"; // 群聊 和 讨论组不一样
// import { sqliteQueryBySQL } from "@/services/sqliteDao";
// import { convertToPinyin } from "@/utils/pinyin";
// import UserInfoUtils from "@/utils/UserInfoUtils";
import { mapMutations, mapActions } from "vuex";
import {
  setGroupBase,
  queryGroupByGroupId, releaseGroup,
  quitGroup, uploadPicture, update_person_info,
  removeGroupMember, closeUserExceedWarnNew
} from "../server";

import DialogAddGroupVisible from "@/view/add-friends-group/dialog/add-groups";
import MemberCardOther from "@/components/memberCard/MemberCardOther";
import MessageNotice from "../group/message/MessageNotice";

import { getGroupMember } from '../../../services/syncGroupMember';

export default {
  components: {
    DialogAddGroupVisible,
    MemberCardOther,
    MessageNotice
  },
  data () {
    return {
      topMsgOrder: 0,
      sending: false, //消息发送中
      groupSystemObj: {
        msgTopValue: '0',
        msgTopClick: false,
        msgOutlineValue: '0',
        msgOutlineClick: false,
        // screenNotice: '',
        // screenNoticeClick: false,
        forbiddenWordsStatus: '',
        forbiddenWordsStatusClick: false,
        chatSingle: '',
        chatSingleClick: false,
        sendFile: '',
        sendFileClick: false,
        sendUrl: '',
        sendUrlClick: false,
        sendRedpacketStatus: '',
        sendRedpacketStatusClick: false
      },
      dialogMember: false,
      groupSystemAble: false,
      saveTimeActive: '6',
      authorityOpen: false,
      groupType: this.$t('chat_createcommunity_0008'),
      groupTypeVisible: false,
      groupTypeSelect: 0,
      groupTypeActive: '1',
      groupValidation: this.$t('chat_comm_manage_0003'),
      groupValidationVisible: false,
      groupValidationActive: '0',
      index: 0,
      rightStatus: true,
      groupId:
        this.$route.query.id ||
        this.$route.query.targetId ||
        this.$route.query.groupId,
      addGroupVisible: false,
      dialogAddGroupsVisible: false,
      text: '',
      texthtml: '',
      listArry: [],
      userId: localStorage.userId,
      dataLists: [],
      membersAuthStatus: {},
      allMemb: 1,
      name: '',
      authStatus: '',
      groupName: '',
      multiple: true,
      uploadLoading: false,
      msgBody: {},
      keyStr: '',
      groupData: {},
      limit: 9,
      friendData: {},
      searchMeb: '',
      emojiList: [],
      actionUrl: uploadPicture(),
      headers: {
        Authorization: localStorage.getItem('accessToken')
      },
      groupSystemAbleSet: false,
      groupSystemAbleMem: false,
      groupSystemAbleInfo: false,
      remarkVisible: false,
      changeValueV: '',
      memberNotes: '',
      silentMaskShow: false,
      fromType: '',
      silentMaskHeight: 0,
      groupCardInfo: {}, // 群信息
      groupAuthByUser: '',
      memberImg: {},
      memberLevel: {},
      memberAdminName: {},
      memberFriendName: {},
      unknownMember: require('@/assets/images/default.png'),
      emojiVisible: false,
      atUserInfo: [],
      atHoverIndex: 0,
      delNum: 0,
      showAppealWarnNotice: false,
      showAppealClosureNotice: false,
      showUpGroupNotice: false,//控制群聊扩容提示
      groupExceedInfo: {},//群聊容量上限信息
      appealInfo: {},//群举报信息
      isReconn: false,
      isNetOff: false,
      initFlag: false
    };
  },
  computed: {
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
    groupTypeArr () {
      return [
        { value: '1', label: this.$t('chat_createcommunity_0008') },
        { value: '2', label: this.$t('chat_createcommunity_0009') }
      ];
    },
    menu () {
      return [
        this.$t('chat_comm_set_0020'),
        this.$t('chat_comm_set_0021'),
        this.$t('chat_comm_manage_0001'),
        this.$t('Universal_0065')
      ];
    },
    groupValidationArr () {
      return [
        { value: '0', name: this.$t('chat_comm_manage_0003'), label: this.$t('chat_comm_manage_0003') },
        { value: '1', name: this.$t('chat_comm_manage_0005'), label: this.$t('chat_comm_manage_0005') },
        { value: '2', name: this.$t('chat_comm_manage_0007'), label: this.$t('chat_comm_manage_0007') }
      ];
    },

    winActive () {
      return this.$store.state.common.winActive;
    }
    /*groupType: {
      get() {
        return this.$t('chat_createcommunity_0008');
      },
      set() {
        // this.groupType = newValue;
      }
    },*/
    /*groupValidation: {
      get() {
        return this.$t('chat_comm_manage_0003');
      },
      set() {
        // this.groupValidation = newValue;
      }
    },*/
  },
  watch: {
    winActive (current, prev) {
      console.log(current, prev)
      if (current) {
        this.getlist(true);
      }
    }
  },
  mounted () {
    this.TiLength = this.$refs.myQuillEditor.quill.getLength() - 1;
  },

  methods: {
    ...mapActions([
      CHAT_REST_SEND,
      "GET_MEM_LIST",
      UPDATE_CHAT_RECORD,
      GET_LAST_MSG_LIST,
    ]),
    ...mapMutations([SET_CHAT, SET_CHAT_LIST]),

    async getlist (isForce) {
      if(isForce) {
        this.getGroupHistory()
        this.$store.dispatch('SET_CLEAN_UN_MSG', {
          id: this.groupId
        });
      }
    },


    onEditorBlur () {
      this.quill?.getModule("mention")?.hideMentionList();
    },

    async queryGroupInfo () {
      this.groupInfo = await this.getGroupInfo(this.groupId);
      await this.setSilentMask();
      let unit = 60 * 60 * 1000;
      const saveTimeIndex = findIndex(this.saveTimeArr, ele => {
        if (this.groupInfo.saveTime >= unit) {
          return ele.value == this.groupInfo.saveTime / unit;
        }
        return ele.value == this.groupInfo.saveTime;
      });
      if (saveTimeIndex > -1) {
        await window.vm
          .$knex('t_groups')
          .where({ group_id: this.groupId })
          .update({
            save_time: this.saveTimeArr[saveTimeIndex].value
          });
        this.saveTimeActive = saveTimeIndex;
        this.saveTime = this.saveTimeArr[saveTimeIndex].label;
      }
      this.imgUrl = this.groupInfo.groupAvatar;
      this.groupName = this.groupInfo.groupName;
      this.$forceUpdate();
    },

    async confirmBatchDelMsgs (list) {
      let message = new Message(this.groupId);
      localStorage.setItem('specailChat', true);
      let j = this.chatList.length;
      console.log(message, list);
      if (j == 1) {
        //当即时消息只有一条时，清空此时这个回话最新一条消息
        if (list[0].reqId) {
          await message.deleteMessageByreqId(list[0].reqId); //从表里删除
        }
        this.$store.commit('DEL_LAST_MSG_LIST', list[0]);
      } else {
        //删除多条
        let reqIds = '';
        list.map(item => {
          if (item.reqId) {
            reqIds = reqIds
              .concat("'")
              .concat(item.reqId)
              .concat("'")
              .concat(',');
          }
        });
        reqIds = reqIds.substr(0, reqIds.length - 1);
        await message.deleteMessageByReqIds(reqIds);
        await this.init();
      }
      this.chatList = this.chatList.map(obj => {
        list.forEach(item => {
          if (obj.msgType == '25' && obj.quotemsgObj && item.msgId == obj.quotemsgObj.msgId) {
            obj.quotemsgObj = null;
          }
        });
        return obj;
      });
    },

    async delMsg (a, item) {
      console.log('删除一条消息', a, item);
      //删除一条消息
      let message = new Message(this.groupId);
      if (item.reqId || item.msgBody.reqId) {
        await message.deleteMessageByReqId(item.reqId || item.msgBody.reqId);
      }
      // else {
      //   await message.deleteMessageByMsgId(item.msgId); //从表里删除
      // }
      console.log(this.chatList, 'miss');
      let i = this.chatList.length;
      if (i == 1) {
        //当历史消息只有一条时，清空此时这个回话最新一条消息
        item.delFlag = true;
        this.$store.commit('DEL_LAST_MSG_LIST', item);
      } else if (this.chatList[i - 1].reqId == item.reqId) {
        //消息中最后一条
        let ele = {
          ...this.chatList[i - 2],
          id: this.groupId,
          updateSource: 'SOURCE_DEL_MSG'
        };
        await this.$store.dispatch('ADD_LAST_MSG_LIST', ele);
      }
      await this.$nextTick();
      this.$store.dispatch('GET_LAST_MSG_LIST')
      this.chatList = this.chatList.filter(obj => {
        localStorage.setItem('specailChat', true);
        return item.reqId != obj.reqId;
      });
      this.chatList = this.chatList.map(obj => {
        if (obj.msgType == '25' && obj.quotemsgObj && item.msgId == obj.quotemsgObj.msgId) {
          obj.quotemsgObj = null;
        }
        return obj;
      });
    },

    async lookcard (item) {
      //当群聊被封禁时看点名片及用户名片不予点击
      // bug  全局变量 type = 'single' || 'group' || 'discussion'
      let message = this.fromGroupType === 'group' ? this.$t('appeal_0013') : this.$t('appeal_0014');
      if (this.showAppealClosureNotice) return this.$message.error(message);
      //实时群名片的时候，item.msgBody是obj
      let msgBody;
      if (item.msgBody instanceof Object) {
        msgBody = item.msgBody;
      } else {
        msgBody = JSON.parse(item.msgBody);
      }
      if (msgBody.type == 1) {
        //个人名片
        console.log('个人名片')
        this.cardDialogVisible = true;
        this.cardUserId = msgBody.id;
        this.$nextTick(() => {
          this.$refs.cardOther.onCardShow();
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

    async lookQuoteCard (quotemsgObj) {
      let msgBody;
      if (quotemsgObj.msg_body instanceof Object) {
        msgBody = quotemsgObj.msg_body;
      } else {
        msgBody = JSON.parse(quotemsgObj.msg_body);
      }
      if (msgBody.type == 1) {
        //个人名片
        this.cardDialogVisible = true;
        this.cardUserId = msgBody.id;
        this.$nextTick(() => {
          this.$refs.cardOther.onCardShow();
        });
      } else {
        //群名片
        this.groupCardInfo = await this.findGroupInfoInServer(msgBody.id);
        if (this.groupCardInfo && this.groupCardInfo.id) {
          this.$refs.groupCard.onPop();
        } else {
          const msg = this.$t('chat_0076');
          this.openMessage(msg);
        }
      }
    },
    // 全局变量 type = 'single' || 'group' || 'discussion'
    ShowGroupInvite () {
      this.Comtit = `${this.fromGroupType === 'group' ? this.$t('chat_comm_invite_0001') : this.$t('chat_select_chat_0002')}`;
      this.GroupInviteVisible = true;
    },
    confirmDialogHand (obj) {
      //邀请入群
      const inviteGroupList = [];
      for (let item of obj) {
        inviteGroupList.push({
          applyTime: moment().format('yyyy-MM-DD hh:mm:ss'),
          beInviteUserId: this.userId,
          channelCode: '2',
          content: this.$t('book_friend_0022') + item.friendNickName,
          groupPassCode: this.groupInfo.groupCode,
          groupId: this.groupInfo.id,
          userId: item.friendId
        });
      }
      batchInviteAddGroup(inviteGroupList).then(async res => {
        if (res.code == '200') {
          this.searchGroupMembersAndInfo();
          this.$message.success(this.$t('invite_activity_0035'));
        } else {
          if (res.data.code == '200112') {
            const inviteGroups = [];
            inviteGroupList.map(item => {
              inviteGroups.push({
                channelCode: 2,
                groupId: item.groupId,
                content: item.content,
                userId: item.userId
              });
            });
            let addGroupRes = await send_add_group_apply(inviteGroups);
            if (addGroupRes.code == 200) {
              this.$message.success(this.$t('chat_joincommunity_0010'));
            } else {
              this.$message.error(addGroupRes.msg);
            }
          }
          if (res?.data?.code == "500") {
            this.$message.error(res.data?.msg);
          }
        }
      });
      //转发
      this.GroupInviteVisible = false;
      this.mutiChooseTag = false; //隐藏多选按钮
      this.mutiPanel = false;
    },
    //查询群警告封停状态
    async queryGroupAppealInfo () {
      let groupAppealInfo = await SQLUtils.retrieveGroupsAppealInfo(this.groupId);
      this.appealInfo = groupAppealInfo;
      if (this.appealInfo.endTime && this.fromGroupType === 'group') this.showUpGroupNotice = false;
      if (groupAppealInfo.showAppealClosureNotice === 1 && groupAppealInfo.showAppealWarnNotice === 1) {
        this.showAppealClosureNotice = true;
        this.showAppealWarnNotice = false;
      } else {
        this.showAppealClosureNotice = groupAppealInfo.showAppealClosureNotice === 1 ? true : false;
        this.showAppealWarnNotice = groupAppealInfo.showAppealWarnNotice === 1 ? true : false;
      }
      if (this.fromGroupType === 'group') await this.queryGroupExceedInfo();
    },
    //查询群人数上限预警状态
    async queryGroupExceedInfo () {
      let groupExceedInfo = await SQLUtils.retrieveGroupsExceedInfo(this.groupId);
      this.groupExceedInfo = groupExceedInfo;
      this.showUpGroupNotice = groupExceedInfo.showExceedNotice === 1 ? true : false;
      if (this.appealInfo.endTime) this.showUpGroupNotice = false;
    },
    //关闭扩容提示
    closeUpGroupNotice () {
      const params = { groupId: this.groupExceedInfo.groupId, userId: this.userId };
      closeUserExceedWarnNew(params).then(async res => {
        if (res.code == '200') {
          await window.vm
            .$knex('t_groups_exceed')
            .where('group_id', '=', this.groupExceedInfo.groupId)
            .update({
              exceed_num: 0,
              show_exceed_notice: 0,
            });
          this.showUpGroupNotice = false;
          this.groupExceedInfo = {};
        }
      });
    },
    async goSetting (val) {
      console.log(val);
      this.groupSystemAble = true;
      await this.initSetting(); //初始化设置 
      if (val == '1') {
        this.groupSystemAbleSet = true;
        this.groupSystemAbleMem = false;
        this.groupSystemAbleInfo = false;
      } else if (val == '2') {
        this.groupSystemAbleMem = true;
        this.groupSystemAbleSet = false;
        this.groupSystemAbleInfo = false;
      } else if (val == '0') {
        this.groupSystemAbleInfo = true;
        this.groupSystemAbleMem = false;
        this.groupSystemAbleSet = false;
      }
    },

    async sendQuill () {
      this.sendBtnDisabled = false;
      let textList = [];
      let j = 0;
      // let inCurrentGroup = await this.inCurrentGroup();
      // if (!inCurrentGroup) {
      //   return;
      // }
      let cannotSendPictures = await this.cannotSendPictures();
      if (!cannotSendPictures) {
        return;
      }
      //console.log('发送', this.quill.editor.delta.ops);
      for (let _delta of this.quill.editor.delta.ops) {
        if (typeof _delta.insert != 'string') {
          if (_delta.insert.image && !_delta.attributes) {
            let reqId = uuidv4();
            const blob = this.dataURItoBlob(_delta.insert.image);
            const filePath = await fileOperational.saveImageToFile(_delta.insert.image, reqId + '.png');
            _delta.insert.path = filePath;
            _delta.insert.size = blob.size;
            _delta.insert.fromId = this.userId;
            _delta.insert.friendId = this.groupId;
            _delta.insert.fileType = '2';
            this.sendImageLocal(_delta.insert, reqId);
            //console.log(_delta.insert.image);
          }
        }
      }
      const textcontent = this.texthtml; //临时存消息体，防止字数超过时置空了
      this.texthtml = '';
      for (let _delta of this.quill.editor.delta.ops) {
        if (typeof _delta.insert == 'string') {
          let text1 = _delta.insert;
          // text1 = text1.replace(/(^\s*)|(\s*$)/g, "");
          if (this.groupSystemObj.sendUrl == '0' && this.isUrlFlag(text1) && this.authStatus == '3') {
            const msg = this.$t('chat_0100');
            this.openMessage(msg);
            return;
          }
          if (text1) {
            textList.push({ content: text1, type: 'text', j: j++ });
          }
        } else {
          if (_delta.insert.image && _delta.attributes && _delta.attributes.alt && _delta.attributes.width && _delta.attributes.height) {
            let ret = emojiList.find(x => x.tag == _delta.attributes.alt);
            if (ret) {
              textList.push({
                content: _delta.attributes.alt,
                type: 'text',
                j: j++
              });
            }
          }
          // 复制的表情
          if (_delta.insert.image && _delta.attributes && !_delta.attributes.alt && _delta.attributes.width) {
            const imageStr = _delta.insert.image;
            const imageStrArr = imageStr.split('/emoji_');
            const imageName = `emoji_${imageStrArr[imageStrArr.length - 1]}`;
            const tagIndex = findIndex(emojiList, item => {
              return item.file == imageName;
            });
            if (tagIndex > -1) {
              textList.push({
                content: emojiList[tagIndex].tag,
                type: 'text',
                j: j++
              });
            }
          }
          if (_delta.insert.image && !_delta.attributes) {
            this.quoteVisible = false;
            textList.push({
              content: _delta.insert,
              type: 'image',
              j: j++
            });
          }
          // mention
          if (_delta.insert?.mention?.denotationChar == '@') {
            let { denotationChar, value } = _delta.insert.mention;
            textList.push({
              content: `${denotationChar + value}`,
              type: "text",
              j: j++,
            });
          }
        }
      }
      const sendList = [];
      for (let i = 0; i < textList.length; i++) {
        if (i === 0) {
          if (textList[i].type === 'text') {
            sendList.push({
              text: textList[i].content,
              type: 'text'
            });
          } else {
            sendList.push(textList[i]);
          }
        }
        if (i > 0) {
          if (textList[i].type === 'text') {
            if (sendList[sendList.length - 1].type === 'image') {
              if (textList[i].type === 'text') {
                sendList.push({
                  text: textList[i].content,
                  type: 'text'
                });
              } else {
                sendList.push(textList[i]);
              }
            } else {
              sendList[sendList.length - 1].text = sendList[sendList.length - 1].text += textList[i].content;
            }
          } else {
            sendList.push(textList[i]);
          }
        }
      }
      for (let ele of sendList) {
        let msgBody;
        let text = '';
        let sum = 0;
        if (ele.type === 'text') {
          text = ele.text;
          if (text.split('')[text.length - 1] == '\n') {
            let arr = text.split('');
            arr.pop();
            text = arr.join('');
            text = text.replace(/^\s+|\s+$/g, '');
          }
          sum = sum + text.length;
          if (this.quoteVisible) {
            msgBody = {
              quoteFromName: this.quoteFromName,
              msgs: [{ msgId: this.quoteMsgId, reqId: this.quoteReqId }],
              text
            };
          } else {
            msgBody = {
              text
            };
          }
          this.mesType = '1';
          if (sum > 1500) {
            this.$message.error(this.$t('Universal_0238', { value: 1500 }));
            this.texthtml = textcontent;
            return;
          } else if (!text.trim()) {
            continue;
          } else {
            this.POST_chat_rest_send(msgBody, text, this.groupId);
          }
        }
        if (ele.type === 'image') {
          this.mesType = '2';
          this.fileReqId = ele.reqId;
          this.handSendImg(ele.content);
          // this.POST_chat_rest_send(ele.image, "", this.groupId);
        }
      }
      this.$nextTick(() => {
        this.$refs.talkGroup.scrollTop = this.$refs.talkGroup.scrollHeight;
        this.resetSilentMaskHeight();
      });
      this.sending = false;
      return;
    },

    async POST_chat_rest_send (msgBody, textOrigin, ...friendId) {
      let targetId = friendId ? friendId[0] : this.groupId;
      let pararms = {
        reqId: msgBody.reqId ? msgBody.reqId : uuidv4(),
        targetType: '2', // 单聊1 群聊2
        id: targetId, //定义消息属于那个窗口
        targetId: targetId,
        fromType: '999',
        fromId: msgBody.fromId ? msgBody.fromId : this.userId,
        uniqueCode: `GROUP@${targetId}`,
        msgType: this.quoteVisible ? '25' : this.mesType, // 1文本
        msgBody: msgBody,
        msgHeader: {
          pubKey: null,
          version: null,
          msgSeqNo: 1,
          msgSeqTotal: 1,
          effectiveTime: -1,
          sourceSite: null,
          language: this.$i18n.locale,
          sign: null,
          signType: null,
          Authorization: localStorage.accessToken
        },
        refMsgBody: {
          fromName: JSON.parse(localStorage.userInfo).nickName,
          fromIcon: JSON.parse(localStorage.userInfo).headImg
        }
      };
      if (msgBody.reqId) {
        await SQLUtils.insertFileChatContent(pararms);
      }
      console.log("@消息验证", this.quill.getContents());
      // 获取所有被at 的人 this.quill.editor.delta.ops
      let mentionArr = this.quill.getContents().ops.filter(menObj => menObj?.insert?.mention?.denotationChar == '@');
      if (mentionArr.length && (pararms.msgType == "1" || pararms.msgType == '25')) {
        const atus = {};
        mentionArr.forEach((item) => {
          if (item.insert.mention.id === "all") {
            atus["all"] = 0;
          } else {
            atus[item.insert.mention.id] = 0;
          }
        });
        pararms.appoint = 1;
        pararms.refMsgBody.atus = atus;
      }
      this.CHAT_REST_SEND({
        ...pararms,
        refMsgBody: {
          ...pararms.refMsgBody,
          tUrl: this.imgUrl,
          tName: this.friendName || this.groupName
        },
        textOrigin: textOrigin
      });
      // this.text = "";
      // this.texthtml = "";
      this.quoteVisible = false;
      this.quoteMsgId = '';
      this.fileReqId = '';
    },

    async init () {
      this.$nextTick(() => {
        document.getElementById('talk').style.height = 'calc(100vh - 228px)';
        document.getElementById('down').style.height = '161px';
        // const height = localStorage.getItem('quillHeight') || '155px'
        // document.getElementById('talk').style.height =  `calc(100vh - ${height} - 73px)` || 'calc(100vh - 228px)';
        // document.getElementById('down').style.height =  height || '155px';
        // console.log('talk ===>', height)
      });
      this.texthtml = '';
      this.quoteVisible = false;
      this.mutiChooseTag = false;
      this.mutiPanel = false;
      this.hasMore = false;
      this.noMoreShowFlg = false;
      this.showUpGroupNotice = false;
      this.showAppealWarnNotice = false;
      this.showAppealClosureNotice = false;
      this.groupId = this.$route.query.id;
      if (!this.groupId) {
        this.groupId = this.$route.query.targetId;
      }
      await getGroupMember(this.groupId);
      
      this.keyStr = this.groupId;
      await this.searchGroupMembersAndInfo()
      await this.getGroupHistory(decodeURIComponent(this.groupId));
      let current = {
        id: this.groupId,
        targetType: 2,
        targetId: this.groupId,
        sessionName: this.groupName,
        sessionIcon: this.imgUrl,
        uniqueCode: `GROUP@${this.groupId}`
      };
      this.$store.commit(SET_CURRENT_CHAT, current);
      this.getDraft();
      this.$nextTick(() => {
        this.chatlistFlag = true;//展示消息框顶部的头像信息，确保在chatlist拿到数据以后显示
      });
    },


    async saveExpireTime (index) {
      this.saveTimeVisible = false;
      const item = this.saveTimeArr[index];
      console.log('修改群聊保存时间', item);
      return setGroupBase({
        id: this.groupId,
        saveTime: item.value
      }).then(async res => {
        this.saveTimeActive = index;
        this.saveTime = item.label;
        await window.vm
          .$knex('t_groups')
          .update('save_time', item.value)
          .where('group_id', this.groupId);
        this.showResponseMessages(res);
        this.init();
      });
    },

    // bug  全局变量 type = 'single' || 'group' || 'discussion'
    async lookMemberCard (id) {
      if (this.groupSystemObj.chatSingle == 0 && this.authStatus == 3 && id != this.userId) {
        // bug  全局变量 type = 'single' || 'group' || 'discussion'
        if (this.fromGroupType === 'group') {
          this.$message.warning(this.$t('chat_comm_manage_0035'));
        }
        return;
      } else if (this.showAppealClosureNotice) {
        let message = this.fromGroupType === 'group' ? this.$t('appeal_0013') : this.$t('appeal_0014');
        this.$message.error(message);
        return;
      }
      this.cardDialogVisible = true;
      this.cardUserId = id;
      this.$nextTick(() => {
        this.$refs.cardOther.onCardShow();
      });
    },

    async findGroupInfoInServer (groupId) {
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

    async ShowRemark (obj) {
      obj.userNameAndId = obj.groupMemberName;
      this.memberNotes = obj.memberNotes;
      this.remarkVisible = true;
      this.changeValueV = obj;
    },

    showResponseMessages (res) {
      if (res.code == '200') {
        this.$message({
          type: 'success',
          message: res.msg
        });
      } else {
        this.$message({
          type: 'error',
          message: res.msg
        });
      }
    },

    //清除聊天记录
    async clearLocal () {
      await deleteSessionsWithoutDraft(this.groupId);
      this.$message.success(this.$t('chat_0059'));
      this.GET_LAST_MSG_LIST();
      this.historyVisible = false;
      this.$router.replace('/app/chat'); //删除成功后返回聊天列表页面
    },

    async releaseGroup () {
      let message = this.authStatus === '1' ? this.$t('chat_comm_set_0005') : this.$t('chat_comm_set_0007');
      this.$confirm(message, this.$t('Universal_0059'), {
        confirmButtonText: this.$t('Universal_0062'),
        cancelButtonText: this.$t('Universal_0063'),
        type: 'warning'
      })
        .then(() => {
          releaseGroup({
            gId: this.$route.query.id
          }).then(async res => {
            if (res.code == '200') {
              this.$message.success(res.msg);
              await SQLUtils.deleteGroupsById(this.groupId);
              await SQLUtils.deleteGroupsMember(this.groupId);
              await SQLUtils.deleteSessionsById(this.groupId);
              await SQLUtils.deleteGroupsAppealById(this.groupId);
              if (this.fromGroupType === 'group') await SQLUtils.deleteGroupsExceedById(this.groupId);
              let GROUPEncode = 'GROUP@' + this.groupId;
              localStorage.setItem(GROUPEncode, '');
              let current = {
                uniqueCode: GROUPEncode
              };
              await this.$store.dispatch(DEL_LAST_MSG_LIST, current);
              await this.$store.dispatch(GO_CHAT_HOME);
            } else {
              this.$message.error(res.msg);
            }
          });
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('Universal_0370')
          });
        });
    },

    // 主动退出社区 或者 讨论组
    async quitGroup () {
      // bug  全局变量 type = 'single' || 'group' || 'discussion'
      let message = this.authStatus === '1' ? this.$t('chat_comm_set_0005') : this.$t('chat_comm_set_0007');
      this.$confirm(message, this.$t('Universal_0059'), {
        confirmButtonText: this.$t('Universal_0062'),
        cancelButtonText: this.$t('Universal_0063'),
        type: 'warning'
      })
        .then(() => {
          quitGroup({
            gId: this.groupId
          }).then(async res => {
            if (res.code == '200') {
              this.$message.success(res.msg);
              await this.deleteTableById();
              let GROUPEncode = 'GROUP@' + sessionStorage.getItem('groupId');
              localStorage.setItem(GROUPEncode, '');
              this.$router.replace('/app/chat');
              let current = {
                uniqueCode: GROUPEncode
              };
              this.$store.dispatch(DEL_LAST_MSG_LIST, current);
            } else {
              this.$message.error(res.msg);
            }
          });
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('Universal_0370')
          });
        });
    },

    closeDialog () {
      this.groupSystemAble = false;
      this.groupSystemAbleMem = false
      this.groupSystemAbleInfo = false
      this.groupSystemAbleSet = false
    },

    son (item, idx) {
      this.index = idx;
      if (this.index == 3) {
        this.$router.push('/app/chat/group/setting');
      } else if (this.index == 0) {
        this.$router.push('/app/chat/group/information');
      } else if (this.index == 2) {
        this.$router.push('/app/chat/group/manage');
      }
    },

    async searchGroupMembersAndInfo () {
      await this.queryMember();
      await this.queryGroupInfo();
      await this.queryGroupAuth();
      await this.queryGroupAppealInfo();
      if (this.$refs.groupmember) {
        this.$nextTick(async () => {
          if (this.groupSystemAble == true && this.groupSystemAbleMem == true) {
            await this.$refs.groupmember.onMemberOpen();
          } else {
            await this.$refs.groupmember.onMemberClose();
          }
        });
      }
      this.$forceUpdate();
    },
    openMessageNotInGroup (msg) {
      this.$alert(msg, this.$t('Universal_0059'), {
        confirmButtonText: this.$t('book_group_0019'),
        center: true,
        showClose: true,
        customClass: 'message-box-class',
        callback: () => {
          this.deleteTableById();
          this.$store.dispatch(GO_CHAT_HOME);
        }
      });
    },

    async deleteTableById () {
      await SQLUtils.deleteGroupsById(this.groupId);
      await SQLUtils.deleteGroupsMember(this.groupId);
      await SQLUtils.deleteSessionsById(this.groupId);
      await SQLUtils.deleteGroupsAppealById(this.groupId);
      if (this.fromGroupType === 'group') await SQLUtils.deleteGroupsExceedById(this.groupId);
      this.GET_LAST_MSG_LIST();
    },

    async inCurrentGroup () {
      let groupInSession = await window.vm.$knex('t_sessions').where({ id: this.groupId });
      if (groupInSession && groupInSession.length > 0) {
        let res = await queryGroupByGroupId({ groupId: this.groupId });
        if (!res.data || (res.code == '200' && res.data.inGroup == 0)) {
          const msg = this.$t('book_community_0009');
          this.openMessageNotInGroup(msg);
          return false;
        }
      }
      return true;
    },

    async cannotSendPictures () {
      if (
        ((this.texthtml.indexOf('<img') >= 0 ) 
        || this.texthtml.indexOf('<video') >= 0) &&
        this.groupSystemObj.sendFile == '0' &&
        this.authStatus == 3
      ) {   
        // 排除表情
        let isAllexpression = true //
        this.quill.editor.delta.ops.forEach((_delta) => {
          if (_delta.insert?.image) {
            if (_delta.attributes === undefined) { // 说明不是表情
              isAllexpression = false
              return isAllexpression
            }
          }  
        })
        if (!isAllexpression) {
          this.openMessage(this.$t('chat_0099'));
          return false;
        }else {
          return true
        }
      }
      return true;
    },

    getAuthStatusInGroup (id) {
      return '' + this.membersAuthStatus[id];
    },

    // bug  全局变量 type = 'single' || 'group' || 'discussion'
    async rightClick (e, item) {
      await this.$store.dispatch('GET_MEM_LIST', this.groupId);
      let memberInfo = this.$store.state.search.membList.filter(d => d.id == item.fromId && d.is_show == 'true');
      if (memberInfo.length == 0) {
        // e.preventDefault();
        let value = this.fromGroupType === 'group' ? this.$t('chat_search_0005') : this.$t('chat_search_0007');
        window.vm.$alert(this.$t('chat_0101', { value }), this.$t('Universal_0059'), {
          confirmButtonText: this.$t('Universal_0062'),
          cancelButtonText: this.$t('Universal_0063'),
          center: true
        });
        return;
      }
      if (this.authStatus != '3') {
        item.userId = item.fromId;
        item.userNameAndId = this.memberAdminName[item.fromId];
        item.groupMemberName = this.memberAdminName[item.fromId];
        item.memberNotes = memberInfo?.[0]?.member_notes;
        item.forbiddenWordsStatus = memberInfo[0].forbiddenWordsStatus;
        item.userHeadImg = this.memberImg[item.fromId];
      }
      this.addClick(item);
    },

    // bug  全局变量 type = 'single' || 'group' || 'discussion'
    addClick (item) {
      let menu
      if (this.fromGroupType === 'group') {
        menu = memberMenuGroup(this.authStatus, item, this);
      } else {
        menu = memberMenuDiscussion(this.authStatus, item, this);
      }
      return this.$RightClick(menu).popup({
        window: window.vm.$remote.getCurrentWindow()
      });
    },


    setMemberNotes (item) {
      this.memberNotes = item.memberNotes;
      this.remarkVisible = true;
      this.changeValueV = item;
    },

    setAsAdmin (item, auth) {
      let message = this.$t('chat_comm_manage_0030', { member: item.groupMemberName });
      if (auth == 3) {
        message = this.$t('chat_comm_manage_0031', { member: item.groupMemberName });
      }
      this.$confirm(message, this.$t('Universal_0059'), {
        confirmButtonText: this.$t('Universal_0062'),
        cancelButtonText: this.$t('Universal_0063'),
        type: 'warning'
      })
        .then(async () => {
          let res = await update_person_info({
            authStatus: auth,
            groupId: this.groupId,
            userId: item.userId
          });
          if (res.code == 200) {
            this.$message.success(res.msg);
            await window.vm
              .$knex('t_groups_member')
              .where('id', '=', item.userId)
              .where('group_id', '=', this.groupId)
              .update({ auth_status: auth });
            await this.init();
          } else {
            this.$message.error(res.data.msg);
          }
        })
        .catch(() => { });
    },

    async setMemberForbiddenWords (item, forbiddenWordsStatus) {
      let res = await update_person_info({
        groupId: this.groupId,
        userId: item.userId,
        forbiddenWordsStatus
      });
      if (res.code == 200) {
        this.$message.success(res.msg);
        await SQLUtils.updateGroupsMemberForbiddenWordsStatus({
          userId: item.userId,
          groupId: this.groupId,
          forbiddenWordsStatus
        });
        await this.queryMember();
      } else {
        this.$message.error(res.msg);
      }
    },

    removeFromGroup (item) {
      // eslint-disable-next-line max-len
      let message = '';
      if (this.fromGroupType === 'group') {
        message = this.$t('chat_0054', { member: item.groupMemberName })
      } else {
        message = this.$t('book_group_0015', { member: item.groupMemberName })
      }
      this.$confirm(message, this.$t('Universal_0059'), {
        confirmButtonText: this.$t('Universal_0062'),
        cancelButtonText: this.$t('Universal_0063'),
        type: 'warning'
      })
        .then(async () => {
          let res = await removeGroupMember({
            gId: this.groupId,
            beQuitUserId: item.userId
          });
          if (res.code == '200') {
            this.$message.success(res.msg);
            await SQLUtils.deleteGroupsMemberById(this.groupId, item.userId);
            await SQLUtils.deleteGroupsPeople(this.groupId);
            await this.init();
          } else {
            this.$message.error(res.data.msg);
          }
        })
        .catch(() => { });
    },

    // async getALLAtUserList() {
    //   const sql = `SELECT
    //       m.*, c.friend_friendNotes as friendNotes,
    //       c.friend_friendNotes_pinyin As friendNotes_pinyin
    //     FROM t_groups_member AS m
    //     LEFT JOIN t_contacts AS c ON m.id = c.friend_id
    //     WHERE m.isDeleted = 0 and m.is_show = 'true' and m.group_id = '${this.groupId}'
    //     order by m.auth_status, m.joinTime`;
    //   let list = await sqliteQueryBySQL(sql);
    //   list = list.map(item => {
    //     return {
    //       id: item.id,
    //       image: item.user_head_img,
    //       nickName: item.friendNotes || item.nick_name,
    //       value: item.nick_name,//mention
    //       nick_name: item.nick_name,
    //       nick_name_pinyin: convertToPinyin(item.nick_name),
    //       auth_status: item.auth_status,
    //       member_notes: item.member_notes,
    //       member_notes_pinyin: item.member_notes_pinyin,
    //       friendNotes: item.friendNotes,
    //       friendNotes_pinyin: item.friendNotes_pinyin,
    //       inviteCode: item.inviteCode,
    //       joinTime: item.joinTime // 群聊 没有这个字段？
    //     };
    //   });
    //   if (['2', '1'].includes(this.authStatus)) {
    //     list.push({
    //       image: '',
    //       nickName: '所有人',
    //       nick_name: '所有人',
    //       nick_name_pinyin: 'suoyouren',
    //       value:'all',//mention
    //       id: "all",
    //     });
    //   }
    //   list = list.filter(item => item.id != UserInfoUtils.getCurrentUserId());
    //   return list;
    // },

    AtonBlur () {
      this.atUserList = false;
      this.onEditorBlur();
    },

    showGroup () {
      this.goSetting(0);
    },

    handCancelGroupDialog (param) {
      this.dialogAddGroupsVisible = param;
    },

    handConfirmGroupDialog (param) {
      this.dialogAddGroupsVisible = param;
    },

    showGroupMemberIcon (item) {
      return this.memberImg[item.fromId] || item.fromIcon || this.unknownMember;
    },

    showGroupMemberLevel (item) {
      return (
        this.memberLevel[item.fromId] || {
          vipType: 0,
          inviteCodeType: 0,
          userRank: 1,
          inviteCode: ''
        }
      );
    },
    // 全局搜索 showReceiverName
    showReceiverName (item) {
      if (item.refMsgBody && item.refMsgBody.users) {
        let isMe=(item.refMsgBody?.users?.[0]?.id||item.refMsgBody?.users?.[0]?.userId)==localStorage.userId?this.$t('Universal_0036'):'';
        if (this.authStatus == 3) {
          return (
            // this.memberFriendName[item.refMsgBody.users[0].id] ||
            // this.memberFriendName[item.refMsgBody.users[0].userId] ||
            isMe ||
            item.refMsgBody.users[0].name ||
            item.refMsgBody.users[0].nickName ||
            ''
          );
        } else {
          return (
            // this.memberAdminName[item.refMsgBody.users[0].id] ||
            // this.memberAdminName[item.refMsgBody.users[0].userId] ||
            isMe ||
            item.refMsgBody.users[0].name ||
            item.refMsgBody.users[0].nickName ||
            ''
          );
        }
      }
      return '';
    },

    showGroupMemberName (item) {
      if (this.authStatus == 3) {
        return this.memberFriendName[item.fromId] || item.friendFriendNotes || item.nickName || '';
      } else {
        return this.memberAdminName[item.fromId] || item.friendFriendNotes || item.nickName || '';
      }
    },

    // bug  全局变量 type = 'single' || 'group' || 'discussion'
    async queryMember () {
      await this.$store.dispatch('GET_MEM_LIST', this.groupId);
      await this.membList.map(item => {
        if (item.id == this.userId) {
          this.authStatus = item.auth_status + '';
          sessionStorage.setItem('authStatus', this.authStatus);
          return item;
        }
      });
      this.dataLists = this.membList;
      this.membersAuthStatus = {};
      this.memberImg = {};
      this.memberAdminName = {};
      this.memberFriendName = {};
      if (this.fromGroupType === 'group') { // 群聊逻辑
        this.memberLevel = {};
        this.memberNickName = {};
      }
      this.dataLists.map(item => {
        this.membersAuthStatus[item.id] = item.auth_status;
        this.memberImg[item.id] = item.user_head_img;
        this.memberLevel[item.id] = {
          vipType: item.vipType,
          inviteCodeType: item.inviteCodeType,
          userRank: item.userRank,
          inviteCode: item.inviteCode
        };
        this.memberAdminName[item.id] = item.group_member_name;
        this.memberFriendName[item.id] = item.group_member_friend_name;
        if (this.fromGroupType === 'group') { // 群聊逻辑
          this.memberNickName[item.id] = item.friend_nick_name || item.group_member_friend_name;
        }
      });
    },

    async getGroupInfo (groupId) {
      let groupInfo = await SQLUtils.retrieveGroupsInfo(groupId);
      console.log(groupInfo, 'groupInfogroupInfogroupInfo****')
      if (groupInfo && groupInfo.country && groupInfo.city) {
        groupInfo.countryName = await SQLUtils.getTAreaCountryOrCityName(groupInfo.country);
        groupInfo.cityName = await SQLUtils.getTAreaCountryOrCityName(groupInfo.city);
        console.log(groupInfo.countryName, groupInfo.cityName);
        groupInfo.region = groupInfo.countryName + '-' + groupInfo.cityName;
      } else {
        groupInfo.region = '';
        groupInfo.country = '';
        groupInfo.city = '';
      }
      await this.$store.dispatch('GET_MEM_LIST', this.groupId);
      // let memberNums = await this.membList.filter(item => item.is_show == 'true').length;
      // if (groupInfo.people != memberNums) {
      //   groupInfo.people = memberNums;
      // }
      console.log('groupInfo ========== ', groupInfo);
      // if (groupInfo.people >= this.dataLists.length) {
      let _this = this;
      setTimeout(async () => {
        // await this.$store.dispatch('GET_MEM_LIST', this.groupId);
        _this.dataLists = await this.$store.state.search.membList;
        _this.dataLists.map(item => {
          this.membersAuthStatus[item.id] = item.auth_status;
          this.memberImg[item.id] = item.user_head_img;
          this.memberLevel[item.id] = {
            vipType: item.vipType,
            inviteCodeType: item.inviteCodeType,
            userRank: item.userRank,
            inviteCode: item.inviteCode
          };
          this.memberAdminName[item.id] = item.group_member_name;
          this.memberFriendName[item.id] = item.group_member_friend_name;
          // bug  全局变量 type = 'single' || 'group' || 'discussion'
          if (this.fromGroupType === 'group') {
            // groupInfo.people = _this.dataLists.filter(item => item.is_show == 'true').length;
            this.memberNickName[item.id] = item.friend_nick_name || item.group_member_friend_name;
          }
        });
        // bug  全局变量 type = 'single' || 'group' || 'discussion'
        // if (this.fromGroupType === 'group') {
        //   groupInfo.people = _this.dataLists.filter(item => item.is_show == 'true').length;
        // }
      }, 200);
      // }
      return groupInfo;
    },


    async refreshGroupInfo () {
      this.$store.dispatch('GET_MEM_LIST', this.groupId);
      await this.queryGroupInfo();
      if (this.$refs.groupDetailsInfo) {
        this.$refs.groupDetailsInfo.reloadGroupInfo();
      }
      this.$store.dispatch(GET_LAST_MSG_LIST, {
        userId: localStorage.userId,
        lastTime: 0
      });
      this.$forceUpdate();
    },

    /**查询历史消息 */
    async getGroupHistory () {
      const list = await SQLUtils.selectGroupChatList(this.groupId);
      const chats = await this.handlelist(list);
      this.$store.commit(SET_CHAT_LIST, chats);
      if (list.length >= 30) {
        this.hasMore = true;
      }
      // this.scrollBottom();
    },

    getText (item) {
      let text = '<span  class="words">' + item.text + '</span>';
      return text;
    },

    async queryGroupAuth () {
      const groupId = this.groupId;
      const userId = localStorage.getItem('userId');
      const memberInfos = await window.vm.$knex(`t_groups_member`).where({
        group_id: groupId,
        id: userId
      });
      // console.log(memberInfos)
      let auth_status = memberInfos?.[0]?.auth_status || sessionStorage.getItem('authStatus') || ""
      this.groupAuthByUser = auth_status;
      this.authStatus = auth_status + '';
      // this.groupSystemObj.screenNotice = '' + this.groupInfo.screenshotsReminderStatus;
      this.groupSystemObj.forbiddenWordsStatus = '' + this.groupInfo.forbiddenWordsStatus;
      this.groupSystemObj.chatSingle = '' + this.groupInfo.memberSingleChatStatus;
      this.groupSystemObj.sendFile = '' + this.groupInfo.sendPicturesStatus;
      this.groupSystemObj.sendUrl = '' + this.groupInfo.sendConnectionStatus;
      this.groupSystemObj.sendRedpacketStatus = '' + this.groupInfo.sendRedpacketStatus;

      let groupType = this.groupTypeArr.find(item => item.value == this.groupInfo.groupStatus);
      if (groupType) {
        this.groupType = this.groupTypeArr.find(item => item.value == this.groupInfo.groupStatus).label;
        this.groupTypeActive = this.groupTypeArr.find(item => item.value == this.groupInfo.groupStatus).value;
      }
      this.groupValidation = this.groupValidationArr.find(item => item.value == this.groupInfo.addCheck).name;
      this.groupValidationActive = this.groupValidationArr.find(item => item.value == this.groupInfo.addCheck).value;
    },

    setSilentMask () {
      if (this.groupInfo.forbiddenWordsStatus == 0) {
        if (this.authStatus == '3') {
          this.fromType = '326';
          this.silentMaskShow = true;
        } else {
          this.silentMaskShow = false;
        }
      } else {
        // console.warn(this.dataLists)
        let currentUser = this.dataLists.filter(item => item.id == this.userId);
        if (currentUser.length > 0 && currentUser[0].forbiddenWordsStatus == 1 && currentUser[0].auth_status == 3) {
          this.fromType = '330';
          this.silentMaskShow = true;
        } else {
          this.silentMaskShow = false;
        }
      }
      if (this.silentMaskShow) {
        this.resetSilentMaskHeight();
      }
    },

    resetSilentMaskHeight (height = 0) {
      let offset = height;
      if (this.$refs.down && this.$refs.down.clientHeight) {
        this.silentMaskHeight = this.$refs.down.clientHeight + offset + 'px';
        this.$forceUpdate();
      }
    },

    updatePeopleInGroup (num) {
      this.groupInfo.people = num;
      this.$forceUpdate();
    },
  },

  beforeDestroy () {
    this.onEditorBlur();
  },
};
