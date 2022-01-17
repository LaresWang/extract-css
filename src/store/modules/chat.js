import {
  CHAT_REST_SEND, ////发送消息总入口，1，渲染聊天窗口，2,更新消息表 3，更新会话列表
  SET_CHAT, //渲染聊天窗口，新增一条记录
  UPDATE_CHAT_RECORD, //渲染聊天窗口 ,更新一条记录
  CLEAR_CHAT,
  CLEAR_CHAT_ALL,
  SET_APPLY_FRINED_NUMBER,
  SET_CURRENT_CHAT,
  GET_LAST_MSG_LIST,
  SET_LAST_MSG_LIST,
  DEL_LAST_MSG_LIST,
  ADD_LAST_MSG_LIST,
  SET_UN_READ_MSG, //设置会话为未读消息
  SET_CLEAN_UN_MSG, //设置会话为已读
  GO_CHAT_HOME,
  SET_DISTURB,
  SET_CHAT_LIST,
  UPDATE_MESSAGE_READ,
  SET_REJECT_FRIEND_NUMBER,
  SET_REQUEST_FRIEND_NUMBER,
  SET_TOTAL_SYSTEM_NUMBER,
  UPDATE_CHAT_SEND_STATUS,
  SEND_READ_MESSAGE,
  SET_DRAF_LIST,
  SET_DRAFT_LIST_FROM_SQLITE,
  DEL_DRAF_LIST,
  UPDATE_DRAF_LIST,
  GO_MESSAGE_PAGE,
  SET_CURRENT_AUDIO,
  CLEAR_CURRENT_AUDIO,
  UPDATE_ISAT_SESSION,
  CHAT_VIDEO_DOWNLOAD_PERCENT,
  CLEAR_FILE_DOWNLOAD,
  SET_VIDEO_EXIST,
  TO_BE_HANDLED_MSGS,
  UPDATE_CHAT_CONTENT,
} from '../types';
import _ from 'lodash';
// import Ws from '@/utils/ws';
import { sendMessageQueue } from '@/services/messageQueue';
import { v4 as uuidv4 } from 'uuid';
import { parseUniqueCode,lastMessagesInView_msgType } from '@/utils/const';
import Message from '@/services/message';
// import Vue from 'vue'
import { ChatListUtils, contGrpSize, contFriSize } from '@/utils';
import router from '../../routes/router.js';
import Vue from 'vue';
import SQLUtils from '@/components/db/sqlite.js';
import UserInfoUtils from '@/utils/UserInfoUtils.js';
import { sqliteQueryBySQL} from '@/services/sqliteDao';
const EXCLUDE_FROM_TYPES = ['201', '202', '408', '401', '701', '702', '421', '422','423','424','425','437','438'];
import { cloneDeep, debounce } from "lodash";

import sendMessage from '@/services/sendMessage';
// 全局搜索
function sessionSort(obj1, obj2) {
  if (obj1['id'] === '1008455862495526912') return -1;
  if (obj2['id'] === '1008455862495526912') return 1;
  let value1 = Number(obj1['topFlag']);
  let value2 = Number(obj2['topFlag']);
  if (value1 === value2) {
    return Number(obj2['finalTime']) - Number(obj1['finalTime']);
  }
  return value2 - value1;
}

let debouceSetMsg = null;
export default {
  state: {
    messageList: [],
    chatList: [],
    applyFriendNumber: 0,
    rejectFriendNumber: 0,
    requestFriendNumber: 0,
    totalSystemNumber: 0,
    currentChat: {},
    lastMsgList: [],
    drafList: [],
    currentAudio: [],
    videoDownloadPercent: {},
    fileBeCleared: {},
    videoNotInCurrentPC: {},
    uploadTaskInfo:{
      // sessionId:{
      //   reqId:{Total,Uploaded}
      // }
    },
    downloadTaskInfo:{
      // mediaId:
    },
    toBeHandledMsgs: [],
    updateChatContent: 0
  },
  getters: {
    messageList: state => state.messageList,
    chatList: state => state.chatList,
    applyFriendNumber: state => state.applyFriendNumber,
    rejectFriendNumber: state => state.rejectFriendNumber,
    requestFriendNumber: state => state.requestFriendNumber,
    totalSystemNumber: state => state.totalSystemNumber,
    currentChat: state => state.currentChat,
    lastMsgList: state => state.lastMsgList,
    drafList: state => state.drafList,
    currentAudio: state => state.currentAudio,
    videoDownloadPercent: state => state.videoDownloadPercent,
    fileBeCleared: state => state.fileBeCleared,
    videoNotInCurrentPC: state => state.videoNotInCurrentPC,
    toBeHandledMsgs: state => state.toBeHandledMsgs,
    updateChatContent: state => state.updateChatContent,
    downloadTaskInfo: state => state.downloadTaskInfo,
    gettersDownloadTaskInfoByID: state => mediaId => {
      return state.downloadTaskInfo[mediaId];
    },
  },
  actions: {
    //发送消息总入口，1，insert消息表 ==>渲染聊天窗口，==>发送消息==>更新消息表==> 更新会话列表
    async [CHAT_REST_SEND]({ commit }, params = {}) {
      // const netStatus = rootState.common.netStatus;
      // if (params.reSendFlag) {
      //   // params.reqId = uuidv4();
      //   params.msgHeader = {
      //     pubKey: '', //this.publickKey,
      //     version: this.publickKeyVersion,
      //     msgSeqNo: 1,
      //     msgSeqTotal: 1,
      //     effectiveTime: -1,
      //     sourceSite: null,
      //     language: window.vm.$i18n.locale,
      //     sign: null,
      //     signType: null,
      //     Authorization: localStorage.accessToken
      //   };
      // }
      // let textOrigin = params.textOrigin;
      // const messagePre = new Message(params.targetId);
      // //查询最大的msgOrder
      // let maxOrder = await SQLUtils.findMaxMsgOrder(params.targetId);
      // params.msgHeader.Authorization = localStorage.accessToken;
      // params.msgHeader.effectiveTimeDate = await SQLUtils.getMsgExpireTime(params.targetId, params.targetType);
      // //todo 重发消息逻辑待定  isReSend => 重新发送
      // const insertObj = {
      //   req_id: params.reqId,
      //   target_type: params.targetType,
      //   target_id: params.targetId,
      //   from_type: params.fromType,
      //   from_id: params.fromId,
      //   msg_type: params.msgType,
      //   unique_code: params.uniqueCode,
      //   text: textOrigin,
      //   msg_order: params.maxOrder ? params.maxOrder : maxOrder,
      //   timestamp: new Date().getTime() + '',
      //   status: 1, //1：发送中 2：发送完成 -1 发送失败  3已读
      //   msg_body: JSON.stringify(params.msgBody),
      //   ref_body: JSON.stringify(params.refMsgBody),
      //   msg_header: JSON.stringify(params.msgHeader),
      //   isDecrypt: 1, //自己发的消息，标记解密成功,
      //   effectiveTimeDate: params.msgHeader.effectiveTimeDate
      // };
      // if (params.msgType == 25) {
      //   //如果是自己发的引用的消息，去表里查询此条引用的消息
      //   const quotemsgObj = await SQLUtils.findQuotMsg(
      //     params.targetId, //被发送人的userid
      //     params.targetType,
      //     params.msgBody.msgs[0].msgId
      //   );
      //   if (quotemsgObj) {
      //     params.quotemsgObj = quotemsgObj;
      //     params.quotemsgObj.msg_body = params.quotemsgObj.msgbody;
      //     params.quotemsgObj.ref_body = params.quotemsgObj.refMsgBody;
      //     params.quotemsgObj.showfile = false; //视频文件的展示tag
      //   }
      // }
      // let setchat = {
      //   ...params,
      //   sendStatus: 1,
      //   text: textOrigin,
      //   fromIcon: UserInfoUtils.getCurrentUserImg(),
      //   fromName: UserInfoUtils.getCurrentUserNickName()
      // };
      // if (params.targetType == 2) {
      //   await SQLUtils.findGroupMemberName(setchat);
      // }
      // if (netStatus == 'offline') {
      //   setchat.sendStatus = -1;
      //   insertObj.status = -1;
      // }
      // //1，先渲染聊天窗口，防止网络慢的时候出现卡顿
      // if (params.msgType != 24 && params.msgType != 11) {
      //   commit(SET_CHAT, setchat);
      // }
      // if (params.msgType == 11) {
      //   if (netStatus == 'offline') {
      //     if (params.fromType == 701) {
      //       params.fromType = 700;
      //     }
      //     if (params.fromType == 702) {
      //       return;
      //     }
      //   }
      //   commit(SET_CURRENT_AUDIO, params);
      //   if (
      //     netStatus == 'offline' ||
      //     params.fromType == 700 ||
      //     params.fromType == 712 ||
      //     params.fromType == 705 ||
      //     (netStatus == 'offline' && params.fromType == 706)
      //   ) {
      //     let result = await messagePre.updateSuspendAudioMessage(params);
      //     if (result != 'ignore') {
      //       setchat.fromType = params.fromType;
      //       setchat.fromId = params.fromId;
      //       setchat.targetId = params.targetId;
      //       commit(SET_CHAT, setchat);
      //     }
      //     return;
      //   }
      // }
      // params.msgBody = JSON.stringify(params.msgBody);
      // params.refMsgBody = JSON.stringify(params.refMsgBody);
      // params.msgHeader = JSON.stringify(params.msgHeader);
      // let timer;
      // if (params.msgType == '1') {
      //   timer = 20;
      // }
      // if (params.msgType == '2') {
      //   timer = 60;
      // }
      // if (!timer) {
      //   timer = 120;
      // }
      // if (params.msgType != 11 || params.fromType == 701) {
      //   await messagePre.insertMessage(insertObj);
      // }
      // delete params.textOrigin;
      // if (netStatus != 'offline') {
      //   await window.vm.$knex('t_messages').insert({
      //     ...insertObj,
      //     tableName: `m_${params.targetId}`,
      //     time: timer
      //   });
      //   await Ws.sendMessage(params);
      // }
      const send = new sendMessage();
      send.autoSendMessage(params);
      //如果存过草稿draflist,则删除
      commit(DEL_DRAF_LIST, params);
    },
    // eslint-disable-next-line no-unused-vars
    async [SEND_READ_MESSAGE]({ commit }, params = {}) {
      if (params.targetType == 1) {
        console.log('马上发送已读', params);
        let pararms = {
          reqId: uuidv4(),
          targetType: '1', // 单聊1 群聊2
          targetId: params.id || params.targetId,
          fromType: 410,
          fromId: UserInfoUtils.getCurrentUserId(),
          msgType: 23, // 23 已读
          msgBody: JSON.stringify({}),
          msgHeader: JSON.stringify({
            Authorization: localStorage.accessToken,
            pubKey: '', //this.publickKey,
            version: this.publickKeyVersion,
            msgSeqNo: 1,
            msgSeqTotal: 1,
            effectiveTime: -1,
            sourceSite: null,
            language: window.vm.$i18n.locale,
            sign: null,
            signType: null
          }),
          refMsgBody: {
            // fromName: JSON.parse(localStorage.userInfo).nickName,
            // fromIcon: JSON.parse(localStorage.userInfo).headImg,
          }
        };
        const option = {
          ...pararms,
          refMsgBody: JSON.stringify({
            ...pararms.refMsgBody
          })
        };
        // await Ws.sendMessage(option);
        await sendMessageQueue.push(option);
        console.log('发送已读');
      }
    },
    async [SET_CHAT]({ commit, dispatch }, params = {}) {
      const message = await window.vm.$knex(`m_${parseUniqueCode(params.uniqueCode, params.targetType)}`).where({ req_id: params.reqId });
      if (params.targetType == 2) {
        await SQLUtils.findGroupMemberName(params);
      }
      if (message.length == 0 || message.length == 1) {
        commit(SET_CHAT, params);
      }
      dispatch("GET_LAST_MSG_LIST")
    },
    async [GO_CHAT_HOME]({ commit }, params = {}) {
      commit(GO_CHAT_HOME, params);
    },
    async [GO_MESSAGE_PAGE]({ commit }, params = {}) {
      commit(GO_MESSAGE_PAGE, params);
    },
    async [ADD_LAST_MSG_LIST]({ commit, rootState,dispatch }, params = {}) {
      if (!lastMessagesInView_msgType.includes(Number(params.msgType))) {
        return;
      }
      // const data = {};
      // if (params.fromId == localStorage.getItem('userId')) {
      //   const info = JSON.parse(localStorage.getItem('userInfo'))
      //   data.sessionName = info.nickName;
      //   data.sessionIcon = info.headImg;
      //   data.fromName = info.nickName;
      // } else if (params.fromPush) {
      //   //从后台发过来的消息
      //   let res1 = await SQLUtils.findNameAndIIcon(params.id, params.targetType);
      //   data.sessionName = res1.sessionName; //会话名称
      //   data.sessionIcon = res1.sessionIcon; // 会话图像URL
      //   if (params.fromId) {
      //     let name = await SQLUtils.findFriendNameById(params.fromId);
      //     if (name) {
      //       data.fromName = name;
      //     } else {
      //       data.fromName = params.refMsgBody?.fromName; //如果是群，显示的发送人
      //     }
      //   } else {
      //     data.fromName = params.refMsgBody?.fromName; //如果是群，显示的发送人
      //   }
      // }
      params.isChatAdd = true;
      let index = -1;
      const lastMsgList = cloneDeep(rootState.chat.lastMsgList);
      let id = parseUniqueCode(params.uniqueCode, params.targetType)
      if (params.uniqueCode) {
        //如果消息发来之后，有这个会话列表，则删掉，替换成传过来的payload。如果没有，则增加进去
        index = _.findIndex(lastMsgList, item => {
          return item.id == id;
        });
      } else {
        //从联系人发送会话 或者其它地方
        index = _.findIndex(lastMsgList, item => {
          return item.id == params.friendId || item.id == params.groupId || item.id == params.id;
        });
      }
      let additionStatus = {};
     
      if(index===-1){
        // 新创建会话的时候需要查询置顶和免打扰状态
        let ret = null;
        if(params.targetType===1 && id){
          // 单聊 t_contacts
          ret = await window.vm
            .$knex('t_contacts')
            .select('topFlag', 'noNoticeFlag')
            .where('friend_id', '=', id)
        } else if(params.targetType===2 && id){
          // 群聊
          // ret = await window.vm
          //   .$knex('t_groups')
          //   .select('topFlag', 'noNoticeFlag')
          //   .where('group_id', '=', id)
          ret = await window.vm
            .$knex('t_groups_member')
            .select('muteNotifications as noNoticeFlag', 'stickyStatus as topFlag')
            .where({
              id: UserInfoUtils.getCurrentUserId(),
              group_id: id
            })
        }
        console.log('status===', ret);
        if(ret&&ret.length){
          additionStatus = ret[0];
        }
      }
      
      
      if (index > -1) {
        const tableName = `m_${lastMsgList[index].id}`;
        if (!(await window.vm.$knex.schema.hasTable(tableName))) {
          const message = new Message(lastMsgList[index].id);
          await message.createTable();
        }
        const lastMessages = await sqliteQueryBySQL(
          `
            select msg_id, text,timestamp, unique_code from ${tableName} where msg_order=(select max(msg_order) from
            ${tableName} where isDeleted=0 and from_type in ('999') and msg_type not in('14','44'))
          `
        );
        let sessionTime = '';
        if (params.updateTime) {
          sessionTime = params.updateTime;
        }
        const lastMessage = lastMessages.length ? lastMessages[0] : null;
        if (lastMessage) {
          if (lastMessage.timestamp) {
            sessionTime = sessionTime ? sessionTime : lastMessage.timestamp;
          }
          await window.vm
            .$knex('t_sessions')
            .where({ id: params.id })
            .update({
              msgType: params.msgType,
              fromType: params.fromType,
              text: lastMessage ? lastMessage.text : '',
              updateTime: sessionTime,
              timestamp: lastMessage.timestamp || new Date().getTime() + '',
              fromId: params.fromId,
              reqId: params.reqId,
              ...additionStatus,
              draftText: '',
              draftHtml: '',
              draftTime: null
            });
          lastMsgList[index].updateTime = sessionTime;
        }
      } else {
        if(!params.isBatch){
          console.log('t_session表插入')
          let sessionTime = params.updateTime ? params.updateTime : params.timestamp;
          let lstParams = {
            id: params.id,
            uniqueCode: params.targetType == 1 ? contFriSize(params.id, localStorage.getItem('userId')) : contGrpSize(params.id),
            lastMsgId: params.msg_id || '',
            msgType: params.msgType,
            fromType: params.fromType,
            targetType: params.targetType,
            unread: 0,
            text: params.text || '',
            updateTime: sessionTime,
            timestamp: params.timestamp || new Date().getTime() + '',
            fromId: params.fromId,
            sessionName: params.sessionName, //会话名称
            sessionIcon: params.sessionIcon, // 会话图像URL
            fromName: params.fromName,
            reqId: params.reqId,
            ...additionStatus
          }
          await SQLUtils.insertSession(lstParams);
          dispatch('GET_LAST_MSG_LIST',params)
        }
      }
      if ((params.fromPush && params.fromId != UserInfoUtils.getCurrentUserId()) 
      || params.fromType == 222 || params.fromType == 305) { // 305 加群小红点显示
        commit(SET_UN_READ_MSG, params);
      }
      // commit(SET_LAST_MSG_LIST, lastMsgList);//消息list入库完成后, 主动调用 dispatch(GET_LAST_MSG_LIST),触发会话列表更新
    },
    async [DEL_LAST_MSG_LIST]({ commit }, params = {}) {
      commit(DEL_LAST_MSG_LIST, params);
    },
    async [SET_APPLY_FRINED_NUMBER]({ commit }, params = {}) {
      commit(SET_APPLY_FRINED_NUMBER, params);
    },
    async [SET_REJECT_FRIEND_NUMBER]({ commit }, params = {}) {
      commit(SET_REJECT_FRIEND_NUMBER, params);
    },
    async [SET_REQUEST_FRIEND_NUMBER]({ commit }, params = {}) {
      commit(SET_REQUEST_FRIEND_NUMBER, params);
    },
    async [SET_TOTAL_SYSTEM_NUMBER]({ commit }, params = {}) {
      commit(SET_TOTAL_SYSTEM_NUMBER, params);
    },
    async [SET_CURRENT_CHAT]({ commit, dispatch }, params = {}) {
      // 立即更新已经存在的会话
      if(params?.id){
        let list= await window.vm.$knex('t_sessions').where({id: params['id']});
        if(list&&list.length){
          await window.vm.$knex('t_sessions').where({id: params['id']}).update({isDeleted:false,unread: 0})
        }
        const message = new Message(params['id']);
        await message.createTable();
      }
      dispatch(SET_CLEAN_UN_MSG, params);
      commit(SET_CURRENT_CHAT, params);
      dispatch(UPDATE_ISAT_SESSION, params);
    },
    async [UPDATE_MESSAGE_READ]({ commit }, params = {}) {
      commit(UPDATE_MESSAGE_READ, params);
    },
    async [UPDATE_CHAT_RECORD]({ commit, rootState }, params = {}) {
      if (ChatListUtils.isCurrentChat(params.id)) {
        let chatListIndex = _.findIndex(rootState.chat.chatList, item => {
          return item.msgId == params.msgId || item.reqId == params.reqId;
        });
        if (params.isUpMsgType && chatListIndex > -1) {
          if(!params.refMsgBody||!params.refMsgBody.fromName){
            const tableName = 'm_'+ (params.uniqueCode?parseUniqueCode(params.uniqueCode,params.targetType):params.id);
            const doc = await SQLUtils.findChatMsgByReqIdOrMsgId(tableName, params.msgId, params.reqId);
            params.refMsgBody = doc&&doc.refMsgBody || {};
          }

          rootState.chat.chatList[chatListIndex].msgType = params.msgType;
          rootState.chat.chatList[chatListIndex].fromId = params.fromId;
          rootState.chat.chatList[chatListIndex].fromType = params.fromType;
          rootState.chat.chatList[chatListIndex].fromName = params.refMsgBody.fromName;
          rootState.chat.chatList[chatListIndex].fromIcon = params.refMsgBody.fromIcon;
          rootState.chat.chatList[chatListIndex].msgBody.userId = params.msgBody.userId
        } else {
          rootState.chat.chatList[chatListIndex] = params;
        }
        // 引用撤回
        rootState.chat.chatList[chatListIndex].disabled = true;
        if (params.msgType == '26') {
          let widthDrawIndex = _.findIndex(rootState.chat.chatList, item => {
            if (item.msgType == '25' && item.quotemsgObj && params.msgId == item.quotemsgObj.msgId) {
              return item;
            }
          });
          if (widthDrawIndex > -1) {
            Vue.set(rootState.chat.chatList[widthDrawIndex].quotemsgObj, 'text', window.vm.$t('chat_0065'));
            Vue.set(rootState.chat.chatList[widthDrawIndex].quotemsgObj, 'fromName', '');
            Vue.set(rootState.chat.chatList[widthDrawIndex].msgBody, 'quoteFromName', ''); //item.msgBody).quoteFromName
            Vue.set(rootState.chat.chatList[widthDrawIndex].quotemsgObj, 'msgType', '26');
          }
        }
        if (params.msgType == '26' && rootState.chat.chatList.length > 0) {
          //app撤回
          if (chatListIndex == rootState.chat.chatList.length - 1) {
            //app撤回，是最后一条消息
            commit(ADD_LAST_MSG_LIST, params);
          }
        }
        if (params.sendStatus === 1) {
          rootState.chat.chatList[chatListIndex].sendStatus = 1;
        }
        commit(SET_CHAT_LIST, rootState.chat.chatList);
      } else {
        if (params.msgType == '26') {
          commit(ADD_LAST_MSG_LIST, params);
        }
      }
    },
    
    /*
      to do : 查询一次所有t_session，后续按需查询更新
      全局关键词 待处理： state.chat.lastMsgList 、 orShowDot
      查询t_session中id为sessionID的当前一条会话数据  更新UI sessionID的这一条会话
    */
    // eslint-disable-next-line 
    async [GET_LAST_MSG_LIST]({ commit } = {},sessionID) {
      !debouceSetMsg && (debouceSetMsg = debounce(async ()=>{
        commit(SET_LAST_MSG_LIST, await SQLUtils.queryLastMsgList())
      },600))
      debouceSetMsg();
    },
    async [SET_UN_READ_MSG]({ commit }, params = {}) {
      commit(SET_UN_READ_MSG, params);
    },
    async [UPDATE_CHAT_SEND_STATUS]({ commit }, params = {}) {
      commit(UPDATE_CHAT_SEND_STATUS, params);
    },
    // eslint-disable-next-line no-unused-vars
    async [UPDATE_ISAT_SESSION]({ commit, rootState, dispatch }, params = {}) {
      await window.vm
        .$knex('t_sessions')
        .where({ id: params.id })
        .update({ isAt: 0 });
    },
    async [SET_CLEAN_UN_MSG]({ commit, dispatch }, params = {}) {
      commit(SET_CLEAN_UN_MSG, params);//已渲染更新页面UI
      dispatch('GET_LAST_MSG_LIST')
    },
    actionUploadTaskInfo({commit},d){
      commit('set_uploadTaskInfo', d);
    },
    actionDownloadTaskInfo({commit},d){
      commit('set_downloadTaskInfo', d);
    }
  },
  mutations: {
    set_downloadTaskInfo(state,data){
      if(data){
        if(!data['url']){
          throw new Error('参数错误');
        }
        window.vm.$set(state.downloadTaskInfo,data['url'],data['per'])
      }else{
        state.downloadTaskInfo={}
      }
    },
    set_uploadTaskInfo(state,data){
      if(data){
        let {sessionId,reqId,progress}=data;
        if(!sessionId||!reqId){
          throw new Error('参数错误');
        }
        if(!state.uploadTaskInfo[sessionId]){
          state.uploadTaskInfo[sessionId]={}
        }
        state.uploadTaskInfo[sessionId][reqId]=progress;
        // console.log(state.uploadTaskInfo)
      }else{
        state.uploadTaskInfo={}
      }
     
    },
    [UPDATE_DRAF_LIST](state, payload) {
      let Dindex = _.findIndex(state.drafList, ele => {
        return ele.id == payload.id;
      });
      state.drafList[Dindex].draftFlag = false;
    },
    [DEL_DRAF_LIST](state, payload) {
      let drafList = state.drafList;
      let Dindex = _.findIndex(drafList, ele => {
        return ele.id == payload.id;
      });
      if (Dindex > -1) {
        state.drafList.splice(Dindex, 1);
      }
    },
    // 从库里获取草稿列表
    async [SET_DRAFT_LIST_FROM_SQLITE](state, payload) {
      state.drafList = payload;
    },
    //草稿列表
    async [SET_DRAF_LIST](state, payload) {
      let drafList = state.drafList;
      const Dindex = _.findIndex(drafList, ele => {
        return ele.id == payload.id;
      });
      if (Dindex > -1) {
        state.drafList[Dindex].msgHtml = payload.msgHtml;
        state.drafList[Dindex].draftFlag = payload.texthtml.length > 1 ? true : false;
        state.drafList[Dindex].msgType = payload.msgType;
        state.drafList[Dindex].texthtml = payload.texthtml;
      } else {
        if (payload.texthtml.length > 1) {
          state.drafList.push({
            id: payload.id,
            msgHtml: payload.msgHtml,
            draftFlag: true,
            msgType: payload.msgType,
            texthtml: payload.texthtml
          });
        }
      }

      //获取之前的draftHtml
      let preDraftHtml = await SQLUtils.getKeyFromSession(payload.id, 'draftHtml');
      if (preDraftHtml != payload.draftHtml) { // 草稿内容变了
        await SQLUtils.updateSession(
          {draftText: payload.draftText, draftTime: payload.draftTime, draftHtml: payload.draftHtml},
          {id: payload.id}, false); //更新数据库
      }
    },
    // 实时更新发送状态
    [UPDATE_CHAT_SEND_STATUS](state, payload) {
      if (payload.targetId) {
        if (
          ChatListUtils.isCurrentChat(
            payload.targetId
            // parseUniqueCode(payload.uniqueCode, payload.targetType)
          )
        ) {
          let chatList = state.chatList;//引用
          let obj = chatList.find(o => o.reqId == payload.reqId);
          if (obj && (payload.reqId || payload.req_id)) {
            // $set
            obj['sendStatus'] = payload.sendStatus || -1;
            obj['msgId'] = payload?.msgId || String(payload.timestamp);//50,
            obj['msgOrder'] = payload?.msgOrder || String(payload.timestamp);//50;
            console.log('实时更新发送状态', state.chatList, payload);
          }
          state.chatList = chatList;
        }
      }
    },
    //更新聊天窗口,新增一条聊天记录
    async [SET_CHAT](state, payload) {
      const message = cloneDeep(payload);
      let chatList = cloneDeep(state.chatList);
      const quotTypes = ['1', '2', '6', '10', '15', '25', '11', '40', '56'];
      if (message.textOrigin) {
        //如果是自己发送的消息，则不解密
        message.text = message.textOrigin;
        // payload.uniqueCode = payload.fromId+'@'+payload.targetId
      }
      if (message.id) {
        //如果已经有id了，不操作
      } else {
        message.id = parseUniqueCode(message.uniqueCode, message.targetType);
      }
      message.msgType = message.msgType + '';
      if (quotTypes.indexOf(message.msgType) > -1) {
        message.disabled = false;
      } else {
        message.disabled = true;
      }
      if (message.msgType == 25) {
        //别人发送过来的实时引用消息
        const msgbody = message.msgBody;
        const quotemsgObj = await SQLUtils.findQuotMsg(message.id, message.targetType, msgbody.msgs[0].msgId, msgbody.msgs[0].reqId);
        if (quotemsgObj) {
          let msgbody = quotemsgObj.msgBody;
          msgbody.text = quotemsgObj.text;
          message.quotemsgObj = quotemsgObj;
          message.quotemsgObj.msg_body = msgbody;
          message.quotemsgObj.ref_body = quotemsgObj.refMsgBody;
          message.quotemsgObj.showfile = false;
          console.log('~~~111', message.quotemsgObj);
          if (!message.msgBody.quoteFromName && message.targetType == 2) {
            message.msgBody.quoteFromName =
              message.quotemsgObj.nickName || message.quotemsgObj.fromName || message.quotemsgObj.ref_body?.fromName || '';
          } else if (!message.msgBody.quoteFromName && message.targetType == 1) {
            message.msgBody.quoteFromName =
              message.quotemsgObj.nickName ||
              message.quotemsgObj.fromName ||
              message.quotemsgObj.ref_body?.fromName ||
              JSON.parse(localStorage.getItem('userInfo')).nickName;
          }
        }
      }
      if (ChatListUtils.isCurrentChat(message.id)) {
        message.isShow = 'true';
        const chatListIndex = _.findIndex(chatList, ele => {
          return ele.reqId == message.reqId;
        });
        if (chatListIndex > -1) {
          // chatList = chatList.map(t => {
          //   if (t.reqId == message.reqId) {
          //     return { ...t, ...message };
          //   } else {
          //     return t;
          //   }
          // });
          
          const oldMessage = chatList.splice(chatListIndex,1);
          state.chatList = chatList;
          state.chatList.push({...oldMessage[0], message});
          // state.chatList = chatList;
        } else {
          const ignoreFromTypes = [701, 702];
          if (!ignoreFromTypes.includes(message.fromType)) {
            state.chatList.push(message);
          }
        }
        console.log(state.chatList, payload, '收到的消息体');
      }
    },
    //更新聊天窗口,更新已经有的一条聊天记录
    [UPDATE_CHAT_RECORD](state, payload) {
      state.chatList = payload;
    },
    [DEL_LAST_MSG_LIST](state, payload) {
      console.log(payload, state.lastMsgList, '删除此处会话');
      const findIndex = state.lastMsgList.findIndex(item => {
        return item.uniqueCode == payload.uniqueCode;
      });
      if (findIndex > -1 && payload.delFlag) {
        state.lastMsgList[findIndex].text = '';
      } else {
        if (findIndex > -1) {
          state.lastMsgList.splice(findIndex, 1);
          // localStorage.lastMsgList = JSON.stringify(state.lastMsgList);
          console.log(state.lastMsgList);
        }
        if (ChatListUtils.isCurrentChat(parseUniqueCode(payload.uniqueCode, payload.targetType))) {
          localStorage.currentChat = '';
          let messageList = payload.uniqueCode + '_messageList';
          localStorage.setItem(messageList, '');
          router.push({ path: '/app/chat' });
        }
      }
    },
    [SET_CHAT_LIST](state, list) {
      state.chatList = list;
    },
    [CLEAR_CHAT](state) {
      state.chatList = [];
    },
    [CLEAR_CHAT_ALL](state) {
      state.messageList = [];
      state.chatList = [];
      state.applyFriendNumber = 0;
      state.currentChat = {};
      state.lastMsgList = [];
      state.rejectFriendNumber = 0;
      state.requestFriendNumber = 0;
      state.totalSystemNumber = 0;
      state.currentAudio = [];
    },
    [SET_APPLY_FRINED_NUMBER](state, payload) {
      state.applyFriendNumber = payload;
    },
    [SET_REJECT_FRIEND_NUMBER](state, payload) {
      state.rejectFriendNumber = payload;
    },
    [SET_REQUEST_FRIEND_NUMBER](state, payload) {
      state.requestFriendNumber = payload;
    },
    [SET_TOTAL_SYSTEM_NUMBER](state, payload) {
      state.totalSystemNumber = payload;
    },
    [SET_CURRENT_CHAT](state, payload) {
      localStorage.setItem('currentChat', JSON.stringify(payload));
      state.currentChat = payload;
    },
    // 突变之前先排序
    [SET_LAST_MSG_LIST](state, payload = []) {
      let newPayload = payload.map(item => {
        return {
          ...item,
          // eslint-disable-next-line max-len
          finalTime: item.updateTime ? Math.max(Number(item.draftTime), Number(item.updateTime)) : Math.max(Number(item.draftTime), Number(item.timestamp))
        }
      });
      newPayload.sort(sessionSort);
      state.lastMsgList = newPayload;
      // console.log('~~~SET_LAST_MSG_LIST~~~')
      // console.log(router.currentRoute);
      if (/^\/app/.test(router.currentRoute['path'])||router.currentRoute?.name=='tray') {
        const { ipcRenderer } = require('electron');
        let unvisibleTrayMsg = sessionStorage.getItem('curChatUnvisibleTray'), sessionArr = cloneDeep(payload), unreadMsgArr;
        // 处理不可见状态下 当前窗口 消息托盘统计
        if (unvisibleTrayMsg) {
          unvisibleTrayMsg = JSON.parse(unvisibleTrayMsg);//id unread;
          let i = sessionArr.findIndex(o => unvisibleTrayMsg['id'] == o['id']);
          if (i >= 0) {
            sessionArr[i] = Object.assign({}, sessionArr[i], unvisibleTrayMsg)
          }
          unreadMsgArr = sessionArr.filter(o => {
            return o['unread'] > 0 && o['noNoticeFlag'] != '1';//mac win过滤免打扰
          })
        } else {
          unreadMsgArr = sessionArr.filter(o => {
            return (!ChatListUtils.isCurrentChat(o['id'])) && o['unread'] > 0 && o['noNoticeFlag'] != '1';//mac win过滤免打扰
          })
        }
        let arr = unreadMsgArr.sort((a, b) => b['updateTime'] - a['updateTime'])
        ipcRenderer.send('update-badge',arr);//处理window托盘、mac通知
      }
    },

    // #### 更新会话列表，更新t_session表 ####
    /**设置会话为未读 */
    async [SET_UN_READ_MSG](state, record) {
      if (lastMessagesInView_msgType.includes(Number(record.msgType)) && !EXCLUDE_FROM_TYPES.includes(String(record.fromType))) {
        // receiveMessage handleMsgsQueueDone 已处理 28 离线消息nrd累加  
        if ((!ChatListUtils.isCurrentChat(record.id) || record.dTmsgType == 27)&&record?.dTmsgType!=28) {
          let unreadNum = 1;
          if (record.unreadNum) {
            unreadNum = record.unreadNum;
          }
          await SQLUtils.updateUnreadMsgUnm(record.id, unreadNum); //更新数据库
        } else {
          const win = window.vm.$remote.getCurrentWindow();
          if (win.isMinimized() || !win.isVisible()) {
            let curChatUnvisibleTrayMsg = sessionStorage.getItem('curChatUnvisibleTray');
            curChatUnvisibleTrayMsg = curChatUnvisibleTrayMsg ? JSON.parse(curChatUnvisibleTrayMsg) : {};
            if (curChatUnvisibleTrayMsg['id'] && curChatUnvisibleTrayMsg['id'] == record['id']) {
              curChatUnvisibleTrayMsg.unread++;
              sessionStorage.setItem('curChatUnvisibleTray', JSON.stringify(curChatUnvisibleTrayMsg));
            } else {
              sessionStorage.setItem('curChatUnvisibleTray', JSON.stringify({ id: record['id'], unread: 1 }));
            }
          }
          if(window.vm.$store.state.common?.winActive){
            this.dispatch(SEND_READ_MESSAGE, record);
          } 
        }
      }
    },
    async [SET_CLEAN_UN_MSG](state, record) {
      //设置会话为已读
      await SQLUtils.updateSessionWithoutTime({ unread: 0 }, { id: record.id }); //更新数据库
      // 快速更新UI
      // let currentChat = state.lastMsgList.find(o => o.id == record.id);
      // if(currentChat){
      // console.log(currentChat)
      // currentChat['unread'] = 0;
      // }
    },
    [SET_DISTURB](state, uniqueCode) {
      // 设置消息免打扰图标
      let arr = state.lastMsgList;
      arr.map((chat, index) => {
        if (String(chat.uniqueCode) === String(uniqueCode)) {
          Vue.nextTick(() => {
            if (state.lastMsgList[index].refMsgBody) {
              state.lastMsgList[index].refMsgBody.noNoticeFlag = state.lastMsgList[index].refMsgBody.noNoticeFlag == 0 ? 1 : 0;
            }
          });
        }
      });
    },
    [UPDATE_MESSAGE_READ](state, payload) {
      console.log('当前窗口已读', payload);
      state.chatList.map((ele, index) => {
        if (state.chatList[index].sendStatus == 2) {
          Vue.set(state.chatList[index], 'sendStatus', 3);
        }
      });
    },
    [GO_CHAT_HOME]() {
      router.push({ path: '/app/chat' });
    },
    [GO_MESSAGE_PAGE](state, payload) {
      this.dispatch('SET_CURRENT_CHAT', {
        uniqueCode: payload.uniqueCode,
        id: parseUniqueCode(payload.uniqueCode, 2),
        sessionIcon: payload.sessionIcon,
        sessionName: payload.sessionName
      });
      let path = `/app/chat/${payload.refMsgBody.groupType == 1 ? 'group' : 'discussion'}/message`;
      const item = {
        path,
        query: {
          targetId: payload.targetId,
          id: payload.targetId,
          timer: new Date().getTime(),
          groupType: payload.refMsgBody.groupType,
          uniqueCode: payload.uniqueCode,
          item: payload
        }
      };
      router.push(item);
      sessionStorage.setItem('groupId', payload.targetId);
    },
    [SET_CURRENT_AUDIO](state, payload) {
      if (payload.fromType == 701 || payload.fromType == 702) {
        state.currentAudio = [];
      }
      state.currentAudio.push(payload);
      console.log('SET_CURRENT_AUDIO ========= ', state.currentAudio);
    },
    [CLEAR_CURRENT_AUDIO](state) {
      state.currentAudio = [];
    },
    [CHAT_VIDEO_DOWNLOAD_PERCENT](state, { msId, percent=0 }){
      if(msId){
        state.videoDownloadPercent[msId] = percent;
        state.videoDownloadPercent = { ...state.videoDownloadPercent };
      }
    },
    [CLEAR_FILE_DOWNLOAD](state, { msId, beCleared}){
      if(msId){
        state.fileBeCleared[msId] = beCleared;
        state.fileBeCleared = { ...state.fileBeCleared };
      }
    },
    [SET_VIDEO_EXIST](state, { msId }){
      if(msId){
        state.videoNotInCurrentPC[msId] = true;
        state.videoNotInCurrentPC = { ...state.fileBeCleared };
      }
    },
    [TO_BE_HANDLED_MSGS](state, msg){
      if(msg){
        state.toBeHandledMsgs.push(msg);
      } else {
        state.toBeHandledMsgs = [];
      }
    },
    [UPDATE_CHAT_CONTENT](state, val){
      state.updateChatContent = val || Date.now();
    }
  }
};
