/**
 * scoket 处理接收消息
 */
// import _ from 'lodash';
import log from 'electron-log';
import store from '@/store';
const { ipcRenderer } = require('electron');
import { paymentId, lastMessagesInView_msgType, lastMessagesNotInView_fromType } from "../utils/const"
import {
  SET_CHAT,
  TO_BE_HANDLED_MSGS,
  UPDATE_MESSAGE_READ,
  SET_TOTAL_SYSTEM_NUMBER,
  GET_NEW_MEG,
  UPDATE_CHAT_SEND_STATUS,
  UPDATE_CACHE,
  ADD_LAST_MSG_LIST,
  NOTIFY_UPDATE_VERSION,
  VIEW_PERSONAL_APPEAL,//获取用户限制信息
  CLEAR_PERSONAL_APPEAL,//解除用户限制信息
  UPDATE_PERSONAL_APPEAL//离线更新用户限制信息
} from '@/store/types';
import { infoCahtUrl, parseUniqueCode } from '@/utils/const';
import { t_friend_apply_builder} from '@/utils/dbDataBuilder';
import fileOperational from '@/services/fileOperational';
import { convertToPinyin } from '@/utils/pinyin';
import Message from '@/services/message';
import { ChatListUtils } from '@/utils/index';
import UserInfoUtils from '@/utils/UserInfoUtils.js';
import SQLUtils from '@/components/db/sqlite.js';
import { logoutAndAlertMessage, getSocketUDID, reportException } from '@/services/websocket';
import { sqliteUpdate, sqliteFindOne, sqliteDelete } from '@/services/sqliteDao';
import chatIndex from '@/view/chat/chatIndex';
import { GET_LAST_MSG_LIST, SET_CURRENT_AUDIO } from '../store/types';
import { check_for_update } from '@/utils/checkForUpdate';
import { sendReport } from '@/services/uploadRecord';
import handles from '@/services/syncInfos'
import createSession from '@/services/createSession'
import sendMessage from '@/services/sendMessage'
// import {customTaskQueue} from './messageQueue'
import { processGroupMember } from './syncGroupMember';
// import { handleFds, handleGds, handleGdns } from '@/services/syncInfos'
// import { _POST } from '@/utils/axios'
// import { fromBase64 } from '@/utils';
const versionName = require('../../package.json').version;
const DiDiPaymentFromType = [224, 225, 226, 227, 228, 1001, 1002, 1003, 1004]; //支付通知
const appVersionCode = require('../../package.json').version_code;
import bus from '@/utils/eventbus';
import { sqliteReplace } from './sqliteDao';

const BatchNum = 200
let Ws = null

export const messageHandler = async (msgData, ws) => {
  Ws = ws
  // log.info('收到消息', msgData);
  // 解密相关开始
  let results = msgData
  if (msgData?.msgType == 45) {
    // if(sessionStorage.getItem("isSign")!=1){
    //   log.info(`当前账户 ${localStorage.userId} 在此客户端 ${localStorage[localStorage.userId+'-UDID']} 未加入内测,无法解密消息`);
    // }
    receiveSignalMessageAck(msgData.msd)
    results = await window.vm.signalStore.decodeSingleMsg(msgData)
    if (!results) {
      return
    }
    // !results && (results=msgData)
  }
  // 解密结束

  const { msgType, fromType, msgBody } = results;
  if (msgType == 99 || (msgType == 4 && fromType == 371) || fromType == 374 || fromType == 375) {
    return;
  }
  // 全站红包
  if (msgType == 7 && fromType == 388) {
    return
  }
  // 收到看点或资讯点赞评论消息
  if (fromType == '95') {
    return
  }
  // app 强制退出 pc 端
  if (fromType == '419') {
    return
  }
  if (msgType == 46) {
    await processGroupOut(msgData.data.arrs, msgData.data.v)
  }
  if (fromType == '435' || fromType == '417' || fromType == '416') {
    await processLogoutACK(ws.fromId)
    await logoutAndAlertMessage(String(fromType))
  }
  if (msgType == '42') {
    await logoutAndAlertMessage(String(msgType), msgBody)
  }
  if (msgType == '39') {
    ws.socket.send(
      JSON.stringify({
        event: 'chat.client.logan.ack',
        fromId: UserInfoUtils.getCurrentUserId(),
      })
    )
    const time = results.time
    sendReport(time)
  }
  //密钥变更 msgType=13
  if (msgType == '13') {
    await processKeyChange(results)
    return
  }
  if (msgType == '47') {
    await processGroupMember(results);
    return;
  }

  //群成员信息
  if (msgType == 19) {
    if(willDelayHanle(results, ws)) return;
    await ProcessGroupMember(results);
    store.dispatch(GET_LAST_MSG_LIST);
    return;
  }
  //群信息
  if (msgType == 48) {
    handles.gdns(results)
    return
  }
  //群信息类型模块 msgType=18
  if (msgType == 18) {
    if (results.gtn) {
      await ProcessGroupInfo(results)
    } else {
      handles.gds(results)
    }
    return
  }
  //新群信息类型模块 msgType=55
  if (msgType == 55) {
    handles.gds(results)
    return
  }
  //公钥信息
  if (msgType == 21) {
    await ProcessPublicKey(results)
    return
  }
  //群成员个人权限信息
  if (msgType == 22) {
    await ProcessGroupMemberPrivilege(results)
    return
  }
  if (msgType == 32) {
    if (willDelayHanle(results, ws)) return
    const mds = []
    for (let ele of results.dt) {
      if (ele.msgType != 7) {
        ele.targetType = 1
        mds.push({
          md: ele.msgId,
          et: ele.msgHeader.effectiveTimeDate,
        })
        await processMessage(ele, 32)
      } else {
        continue
      }
    }
    if (mds.length) {
      ws.socket.send(
        JSON.stringify({
          m: 'PC',
          event: 's.c.sack',
          mds,
        })
      )
    }
    return
  }
  //单聊离线消息
  if (msgType == '27' && results.dt?.length) {
    //历史单聊
    // const inclues410 = []
    // const unclues410 = []
    // for (let ele of results.dt) {
    //   if (ele.fromType === 410) {
    //     inclues410.push(ele)
    //   }else {
    //     unclues410.push(ele)
    //   }
    // }
    // 根据410 区分出两个数组
    const { inclues410, unclues410 } = discriminateResults(
      results.dt.sort((a, b) => a.timestamp - b.timestamp)
    )
    // 先保证其他消息先处理
    await handleArray(unclues410, 27)
    // 410 消息最后处理
    await handleArray(inclues410, 27)

    // for (let ele of results.dt) {
    //   ele.targetType = 1;
    //   console.log('27 fromType =====>', ele.fromType)
    //   if (ele.msgType !== 11 && ele.fromType !== 418 && ele.fromType !== 419) {
    //     await processMessage(ele, results['msgType'], 27);
    //   } else {
    //     await processAudioHistoryMessage(ele);
    //   }
    // }
    const msgIds = [];
    results.dt.forEach(async ele => {
      // // 离线好友
      if (ele.fromType == 212) {
        if (ele.fromId != UserInfoUtils.getCurrentUserId()) {
          console.log('----离线好友同意了申请');
          await processRequestByFriend(ele);
        }
      }
      // 离线好友拒绝
      if (ele.fromType == 215) {
        await processRejectByFriend(ele);
        console.log('----离线好友拒绝了申请');
      }
      // if (ele.fromType == 222) {
      //   //fromType === 222 你和XXX已经成为好友
      //   await ProcessAddFriend(ele);
      // }
      // 群管理员同意了群申请
      if (ele.fromType == 389) {
        await processGroupAgree(ele);
        console.log('离线管理员同意了群申请');
      }
      // // 管理员拒绝了群申请
      if (ele.fromType == 390 && ele.source == 1) {
        await processGroupReject(ele);
        console.log('离线管理员拒绝了群申请');
      }
      // 401 主动发起群申请 
      // 402 邀请发起群申请
      if (ele.fromType == 401 || ele.fromType == 402) {
        await processRequestByGroup(msgInfo)
        console.log('离线管理员主动发起群申请或邀请发起群申请');
      }

      msgIds.push(ele.msgId);
    });
    await processSingleACK(msgIds, results.fromId);
    console.log('回复ack ----》');
    return;
  }
  if (msgType == '28') {
    //历史群聊
    if (!results.dt || results.dt.length == 0) {
      return
    }
    if (willDelayHanle(results, ws)) return
    await batchInsert28Message(results.qg, results.dt, results.nrd)
    // const msgIds = [];
    // results.dt.forEach(ele => {
    //   msgIds.push({
    //     md: ele.msgId,
    //     et: ele.msgHeader.effectiveTimeDate,
    //     od: ele.msgOrder,
    //     at: !!ele.appoint
    //   });
    // });
    // await processGroupACK(results.qg, msgIds);
    // store.dispatch(GET_LAST_MSG_LIST)
    return
  }
  // send 消息ack回执	29
  // 加密消息ACK	50
  if ([29, 50].includes(msgType * 1)) {
    //发送消息后接到ACK回执
    await sendMessageAfterACK(results)
    return
  }
  // if ([50].includes(msgType * 1)) {
  //   await sensMessageAfterACKBySignal(results);
  //   return;
  // }
  //############## 缓存相关 END ###################
  // 入库用户/好友信息
  // 保留旧的消息类型17，防止老版本推17消息
  if (msgType == '57' || msgType == '17') {
    if (results.utn) {
      // 老的同步逻辑
      if (willDelayHanle(results, ws)) return
      await ProcessContract(results)
    } else {
      handles.fds(results)
    }
    return
  }
  //个人限制离线信息
  if (msgType == '43') {
    await ProcessPersonalAppeal(results)
    return
  }
  if (fromType === 222) {
    //fromType === 222 你和XXX已经成为好友
    await ProcessAddFriend(results)
  }
  if (fromType === 215) {
    //fromType === 215 xxx 拒绝了你的好友申请
    await processRejectByFriend(results);
    return;
  }
  // 群管理员同意了群申请
  if (fromType === 389) {
    // await processGroupAgree(results);
    await processGroupAgree(results);
    console.log('群管理员同意了群申请');
  }
  // // 管理员拒绝了群申请
  if (fromType === 390 && results.source == 1) {
    //fromType === 390 xxx 管理员拒绝了群申请
    // await processGroupReject(results);
    // return;
    await processGroupReject(results);
    console.log('管理员拒绝了群申请');
  }

  // if ((results.fromType === 401 || results.fromType === 402)) {
  //   //fromType === 401 主动发起群申请   402 // 邀请发起群申请
  //   await processRequestByGroup(results);
  //   return;
  // }
  if (fromType === 409) {
    // 群基本信息（全量）修改
    await store.dispatch(UPDATE_CACHE, results)
    await store.dispatch(SET_CHAT, results)
    return
  }
  if (fromType === 373) {
    // 讨论组升级到群
    await discussionToGroup(results)
  }
  if (msgType === 11) {
    // 音频聊天
    await processAudioChat(results)
  }
  // if (results.msgType == 23) {
  //   //read	已读消息回执	23
  //   await ProcessReadMessage(results);
  //   return;
  // }
  if (fromType === 407) {
    let myInfo = results.refMsgBody.users[0]
    let userInfo = localStorage.getItem('userInfo')
    userInfo = JSON.parse(userInfo)
    userInfo.nickName = myInfo.nickName
    userInfo.userHeadImg = myInfo.userHeadImg
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    await updateGroupMemberUserInfoBy407(myInfo)
    return
  }

  // 版本更新 422： 强制  421： 非强制
  if (fromType === 421 || fromType === 422) {
    check_for_update(appVersionCode, async (updateInfo) => {
      if (updateInfo.data) {
        if (updateInfo.data.versionCode !== versionName) {
          // 版本不一样
          if (fromType === 422) {
            ws.close(false)
            // 且为强制更新，则弹出提示框
            await store.dispatch(NOTIFY_UPDATE_VERSION, {
              versionSign: Math.random(),
              updateInfo: updateInfo.data,
            })
          } else {
            // 非强制更新，如果提示框是打开的，则要关闭
            await store.dispatch(NOTIFY_UPDATE_VERSION, {
              versionSign: Math.random() + 1,
              updateInfo: updateInfo.data,
            })
          }
        }
      } else {
        // 版本一样
        await store.dispatch(NOTIFY_UPDATE_VERSION, false)
      }
    })
    return
  }
  // console.log('是否进入队列：'+store.state.common.willSyncData)
  // 如果在同步数据的时候收到聊天消息，需要把聊天消息存起来，等同步信息结束后再处理聊天消息
  // if (store.state.common.willSyncData) {
  //   // console.log('进入队列', results);
  //   store.commit(TO_BE_HANDLED_MSGS, { results, ws })
  //   return;
  // }
  if (willDelayHanle(results, ws)) return

  let msgId = results.msgId
  let targetType = results.targetType
  if (msgId == '' || msgId == undefined) return
  if (msgId && targetType) {
    console.log('[以下为聊天信息]')
  }
  let msgInfo
  if (msgId && results.targetType && results.reqId && msgType) {
    msgInfo = results
  }
  if (!msgInfo) {
    return
  }
  console.log('WS 聊天内容', JSON.parse(JSON.stringify(msgInfo)))
  const { messageInfo, messageRet } = await processMessage(
    {
      ...msgInfo,
    },
    results['msgType']
  )
  if (messageRet === 'N') {
    return
  }
  messageInfo['msgId'] = msgId
  if (messageRet == 'U') {
    return
  }
  let myId
  let isMe = false
  // let myId = messageInfo.refMsgBody.users[0].id || messageInfo.refMsgBody.users[0].userId;
  // let isMe = (messageInfo.refMsgBody.users && myId == UserInfoUtils.getCurrentUserId());
  switch (messageInfo.fromType) {
  case 0:
    // 撤回消息
    console.log('撤回了消息', messageInfo)
    await store.dispatch('UPDATE_CHAT_RECORD', {
      id: parseUniqueCode(messageInfo.uniqueCode, messageInfo.targetType),
      isUpMsgType: true,
      msgId: messageInfo.msgBody.msgId,
      reqId: messageInfo.msgBody.reqId,
      msgType: 26,
      fromType: 0,
      fromId: messageInfo.fromId,
      refMsgBody: messageInfo.refMsgBody,
      withDraw: true,
      targetType: messageInfo.targetType,
      uniqueCode: messageInfo.uniqueCode,
      fromName: messageInfo.fromName,
      sendStatus: messageInfo.sendStatus,
      msgBody: messageInfo.msgBody,
    })
    await store.dispatch('GET_LAST_MSG_LIST')
    break
  case 210:
  case 211:
    // 删除好友提示（我被删除了）,更新联系人列表
    await store.dispatch('GET_FRIENDS_LIST', {
      userId: ws.fromId,
      pageSize: 100000,
    })
    await store.dispatch('GET_LAST_MSG_LIST')
    infoCahtUrl.map((item) => {
      if (
        item == window.vm.$route.path &&
          localStorage.currentChat &&
          JSON.parse(localStorage.currentChat)?.uniqueCode ==
            messageInfo.uniqueCode
      ) {
        //判断路由在群聊相关页面，并且当前推送的群解散消息是最后一次点击的群聊
        store.dispatch('GO_CHAT_HOME')
      } else {
        return
      }
    })
    // await store.dispatch('ADD_LAST_MSG_LIST', messageInfo);
    break
  case 212:
    break
  case 222:
    await store.dispatch(SET_CHAT, messageInfo)
    break
  case 224:
  case 225:
  case 226:
  case 227:
  case 228:
  case 1001: //退款到账通知
  case 1002: //还款凭证
  case 1003: //收款到账通知
  case 1004: //资金借出
    // console.log('%c～在线消息～','font-size:30px',results,messageInfo,store.state.chat?.currentChat)
    store.dispatch('actionCurrentPayment', results)
    results['id'] = results['fromId']
    // if(store.state.chat?.currentChat?.id==results['fromId']){//当前会话窗口
    if (sessionStorage.getItem('paymentId') == results['fromId']) {
      //当前会话窗口
      // console.log('%c设置会话为已读','font-size:30px',store.state.chat);
      store.dispatch('SET_CLEAN_UN_MSG', results)
    }
    break
  case 1005: //退款到账通知
  case 1006: //还款凭证
  case 1007: //收款到账通知
    await store.dispatch(SET_CHAT, messageInfo)
    break
  case 302:
  case 381:
  case 303:
  case 386:
  case 387:
    console.log('case 303')
    await store.dispatch(SET_CHAT, messageInfo)
    break
  case 304:
    // xxx 邀请了 你 加入了群
    await store.dispatch('GET_FRIENDS_LIST', {
      userId: ws.fromId,
      pageSize: 100000,
    })
    await store.dispatch('ADD_LAST_MSG_LIST', messageInfo)
    await store.dispatch(SET_CHAT, messageInfo)
    break
  case 308:
    //退出群聊(没有这种情况，后台没有推过来))
    if (
      localStorage.currentChat &&
        JSON.parse(localStorage.currentChat)?.uniqueCode ==
          messageInfo.uniqueCode
    ) {
      await store.dispatch('DEL_LAST_MSG_LIST', messageInfo)
      await store.dispatch('GO_CHAT_HOME')
    }
    await store.dispatch('ADD_LAST_MSG_LIST', messageInfo)
    await store.dispatch('GET_LAST_MSG_LIST')
    break
  case 384:
  case 312: // 移出群聊
    myId =
        messageInfo.refMsgBody.users[0].id ||
        messageInfo.refMsgBody.users[0].userId
    isMe =
        messageInfo.refMsgBody.users && myId == UserInfoUtils.getCurrentUserId()
    if (isMe) {
      await store.dispatch('GO_CHAT_HOME')
    }
    await store.dispatch(SET_CHAT, messageInfo)
    break
  case 313: // 解散群聊
  case 383: // 解散讨论组
    myId =
        (messageInfo.refMsgBody.users &&
          (messageInfo.refMsgBody.users[0].id ||
            messageInfo.refMsgBody.users[0].userId)) ||
        ''
    isMe =
        messageInfo.refMsgBody.users && myId == UserInfoUtils.getCurrentUserId()
    if (
      isMe ||
        (localStorage.currentChat &&
          JSON.parse(localStorage.currentChat)?.uniqueCode ==
            messageInfo.uniqueCode)
    ) {
      if (window.vm.$route.path.indexOf('/app/contact') >= 0) {
        window.vm.$router.push({ name: 'contact' })
      } else {
        await store.dispatch('GO_CHAT_HOME')
      }
    }
    await store.dispatch('GET_LAST_MSG_LIST')
    break
  case 320: // 关闭截屏提醒
  case 322: // 开启截屏提醒
  case 324: // 截取了当前屏幕
  case 336: // 开启禁止成员单聊
  case 338: // 关闭禁止成员单聊
  case 345: // 开启禁止成员发送图片
  case 347: // 关闭禁止成员发送图片
  case 349: // 开启禁止发送链接
  case 351: // 关闭禁止发送链接
  case 405: // 开启红包发送
  case 406: // 关闭红包发送
    await store.dispatch(SET_CHAT, messageInfo)
    break
  case 373:
    await store.dispatch('GET_LAST_MSG_LIST')
    if (
      localStorage.currentChat &&
        JSON.parse(localStorage.currentChat)?.uniqueCode ==
          messageInfo.uniqueCode
    ) {
      await store.dispatch('GO_MESSAGE_PAGE', messageInfo)
    }
    break
  case 401: // 主动发起群申请
  case 402: // 邀请发起群申请
    break
  case 372: // 消息保存时长
  case 409: // 群基本信息（全量）修改
    await store.dispatch('GET_LAST_MSG_LIST', messageInfo)
    break
  case 408: // 群成员备注/昵称/头像修改
    messageInfo.fromPush = true
    await store.dispatch(UPDATE_CACHE, messageInfo)
    await store.dispatch(SET_CHAT, messageInfo)
    break
  case 301:
  case 380:
    //发起群聊
    await store.dispatch('ADD_LAST_MSG_LIST', messageInfo)
    await store.dispatch('GET_LAST_MSG_LIST')
    if (messageInfo.refMsgBody.groupType == 0) {
      messageInfo.groupType = messageInfo.refMsgBody.groupType
      messageInfo.id = messageInfo.targetId
      myId =
          messageInfo.refMsgBody.users[0].id ||
          messageInfo.refMsgBody.users[0].userId
      isMe =
          messageInfo.refMsgBody.users &&
          myId == UserInfoUtils.getCurrentUserId()
      if (isMe) {
        await store.dispatch('GO_MESSAGE_PAGE', messageInfo)
      }
    }
    break
  case 305:
    //加群
    await store.dispatch('SET_CHAT', messageInfo)
    break
  case 309:
  case 388:
  case 382:
    //退群
    myId =
        messageInfo.refMsgBody.users[0].id ||
        messageInfo.refMsgBody.users[0].userId
    isMe =
        messageInfo.refMsgBody.users && myId == UserInfoUtils.getCurrentUserId()
    if (isMe) {
      if (window.vm.$route.path.indexOf('/app/contact') >= 0) {
        window.vm.$router.push({ name: 'contact' })
      } else {
        await store.dispatch('GO_CHAT_HOME')
      }
    }
    await store.dispatch(SET_CHAT, messageInfo)
    break
  case 326: // 禁止全员发言
  case 328: // 允许全员发言
  case 330: // 开启禁言
  case 333: // 关闭禁言
    await store.dispatch(SET_CHAT, messageInfo)
    // await store.dispatch('ADD_LAST_MSG_LIST', messageInfo);
    break
  case 361: // 设置为管理员
  case 363: // 取消为管理员
    // await store.dispatch('ADD_LAST_MSG_LIST', messageInfo);
    if (
      localStorage.currentChat &&
        JSON.parse(localStorage.currentChat)?.uniqueCode ==
          messageInfo.uniqueCode
    ) {
      await store.dispatch('GET_MEM_LIST', messageInfo)
    }
    myId =
        messageInfo.refMsgBody.users[0].id ||
        messageInfo.refMsgBody.users[0].userId
    isMe =
        messageInfo.refMsgBody.users && myId == UserInfoUtils.getCurrentUserId()
    if (isMe) {
      store.commit(GET_NEW_MEG, messageInfo)
    }
    await store.dispatch(SET_CHAT, messageInfo)
    break
  case 369: // 免打扰状态变更
  case 370: // 置顶状态变更
    await store.dispatch(UPDATE_CACHE, messageInfo)
    await store.dispatch(GET_LAST_MSG_LIST)
    break
  case 997:
    if (messageInfo.msgType == '13') {
      // 对方密钥变更
      await store.dispatch('SET_CHAT', messageInfo)
    }
    break
  case 376:
    // case 379:
    if (messageInfo.msgType == '31') {
      // 场外交易
      await store.dispatch('ADD_LAST_MSG_LIST', messageInfo)
      await store.dispatch('SET_CHAT', messageInfo)
    }
    break
  case 420:
    // case 379:
    if (messageInfo.msgType == '44') {
      // 场外交易
      if (messageInfo.fromId != UserInfoUtils.getCurrentUserId()) {
        await store.dispatch(GET_NEW_MEG, messageInfo)
      }
      await store.dispatch('SET_CHAT', messageInfo)
    }
    break
  case 423: //群警告
  case 424: //群封停
  case 425: //解除群封停
  case 437: //解除群警告
  case 438: //解除群全部限制
    console.log(messageInfo, '群限制相关类的消息下发')
    await SQLUtils.updateGroupsAppealInfo(messageInfo)
    break
  case 427: //限制登录
  case 429: //限制社交
    console.log(messageInfo, '个人限制相关类的消息下发')
    store.commit(VIEW_PERSONAL_APPEAL, messageInfo)
    break
  case 428: //解除限制登录
  case 430: //解除限制社交
  case 436: //解除个人全部限制
    console.log(messageInfo, '解除个人限制相关类的消息下发')
    store.commit(CLEAR_PERSONAL_APPEAL, messageInfo)
    break
  case 439: //群上限预警
  case 440: //解除群上限预警
    console.log(messageInfo, '群上限预警相关类的消息下发')
    await SQLUtils.updateGroupsExceedInfo(messageInfo)
    break
  case 999:
    //消息助手
    if (messageInfo.msgType == '54' || messageInfo.msgType == '62') {
      store.dispatch('currentActAssistant', results);
      results['id'] = results['fromId'];
      //当前会话窗口
      if (sessionStorage.getItem('ActAssistantId') == results['fromId']) {
        store.dispatch('SET_CLEAN_UN_MSG', results)
      }
    }
    // 矿
    if (messageInfo.msgType == '61') {
      // await store.dispatch('ADD_LAST_MSG_LIST', messageInfo);
      await store.dispatch('SET_CHAT', messageInfo)
    }
    //聊天消息
    if (messageInfo.fromId != UserInfoUtils.getCurrentUserId()) {
      await store.dispatch(GET_NEW_MEG, messageInfo)
    }
    await store.dispatch('SET_CHAT', messageInfo)
    break
  default:
    break
  }
}

// 单聊加密 ACK 回执
const receiveSignalMessageAck = async (msd) => {
  console.log('加密消息ack')
  await Ws.sendMessage({
    type: 'ws',
    event: 'single.c.ack.new',
    msd: msd,
  })
  // return;
}

// 单聊ACK 回执
const processSingleACK = async (msgIds, id, fromType) => {
  if (msgIds.length) {
    const obj = {
      event: 'c.c.ack',
      Authorization: localStorage.accessToken,
      td: id,
      m: 'PC',
      md: msgIds,
      type: 'ws',
    }
    if (fromType && fromType == '10000') {
      obj.event = 's.c.sack'
    }
    Ws.sendMessage(obj)
  }
}

// 单聊离线410消息息
const handleArray = async (array, msgType) => {
  for (let ele of array) {
    ele.targetType = 1
    if (ele.msgType !== 11 && ele.fromType !== 418 && ele.fromType !== 419) {
      await processMessage(ele, msgType)
    } else {
      await processAudioHistoryMessage(ele)
    }
  }
}
// 区别410 消息 返回参数 410 数组 和 ！410 数组
const discriminateResults = (results) => {
  console.log('重新排序，', results)
  const inclues410 = []
  const unclues410 = []
  for (let ele of results) {
    if (ele.fromType === 410) {
      inclues410.push(ele)
    } else {
      unclues410.push(ele)
    }
  }
  return { inclues410, unclues410 }
}

const getSingleChatHistory = async () => {
  try {
    const data = {
      event: 'c.c.single',
      m: 'PC',
      Authorization: localStorage.accessToken,
      type: 'ws',
    }
    Ws.sendMessage(data)
  } catch (err) {
    reportException(err)
    console.error(err)
  }
}

export const getGroupChatHistory = async () => {
  try {
    const udid = await getSocketUDID()
    Ws.sendMessage({
      event: 'g.c.gimsg',
      ud: UserInfoUtils.getCurrentUserId(),
      m: 'PC',
      em: udid,
      type: 'ws',
    })
  } catch (err) {
    reportException(err)
    console.error(err)
  }
}
const audioOthersProcessing = async (data, tableName) => {
  window.vm.$message.warning('已在其他设备处理')
  ipcRenderer.send('audio-window-others-processing-call', {
    userInfo: {},
    userSig: '',
    roomId: '',
  })
  if (data.oldMsgId) {
    await window.vm.$knex.raw(
      `delete from ${tableName} where msg_id = '${data.oldMsgId}'`
    )
  }
}

const sendMessageAfterACK = async (data) => {
  console.log('发送消息后接到消息送达服务器', data)
  if (data['ack'] == 217) {
    await sqliteDelete('t_signal_keys', { key: data['ud'] })
    // http://showdoc.vonechain.com:8801/web/#/50?page_id=240
    log.info(`设备认证不成功,重新获取${data['ud']}的有效设备信息后再次发送`)
    const chatSession = new createSession(data['ud'])
    await chatSession.upsertUserAccount()
    const unsendMessage = await sqliteFindOne('t_messages', {
      req_id: data['reqId'],
    })
    if (!unsendMessage) {
      console.log('发送失败的消息不存在')
      return
    }
    const sendToMessage = new sendMessage(data['ud'])
    const message = sendToMessage.formatUnsendMessage(unsendMessage)
    await sendToMessage.autoSendMessage(message)
    return
  }
  if (!['200', '203'].includes(String(data.ack))) {
    console.log('发送消息错误', data)
    return
  }
  const result = await sqliteFindOne('t_messages', {
    req_id: data.reqId,
  })
  if (!result) {
    console.log('发送其他类型消息收到回执')
    return
  }
  let tableName = result.tableName
  const doc = {
    msg_id: data.msgId || String(data.timestamp), //50 无msgId
    req_id: data.reqId,
    msg_order: data.msgOrder || String(data.timestamp),
    status: 2,
    effectiveTimeDate: data.effectiveTimeDate,
  }
  console.log(data.reqId, tableName)
  if (data.fromType != 701 && data.fromType != 702) {
    store.dispatch(UPDATE_CHAT_SEND_STATUS, {
      ...data,
      sendStatus: 2,
      targetId:
        data.msgType == 50 && data['targetId'] == localStorage.userId
          ? result.tableName.slice(2)
          : data.targetId, //加密发送消息回执 为接收方id 更新视图上发送状态
    })
    store.dispatch(GET_LAST_MSG_LIST)
  }

  // 处理撤回的消息
  let withdrwFlag = false
  if (result.msg_type == 24 && data.msgType == 50) {
    let { tableName, msg_body } = result
    const msgBody =
      typeof msg_body === 'string' ? JSON.parse(msg_body) : msg_body
    await SQLUtils.updateChatMsgByReqIdOrMsgId(
      tableName,
      msgBody.msgId,
      msgBody.reqId,
      {
        msg_type: 26,
        from_type: 0,
        status: 2,
      }
    )
    const content = await SQLUtils.findChatMsgByReqIdOrMsgId(
      tableName,
      msgBody.msgId,
      msgBody.reqId
    )
    if (content) {
      await store.dispatch('UPDATE_CHAT_RECORD', {
        id: parseUniqueCode(content.uniqueCode, content.targetType),
        isUpMsgType: true,
        msgId: content.msgId,
        reqId: content.reqId,
        msgType: 26,
        fromType: 0,
        fromId: content.fromId,
        refMsgBody: content.refMsgBody,
        withDraw: true,
        targetType: content.targetType,
        uniqueCode: content.uniqueCode,
        fromName: content.fromName,
        sendStatus: content.status,
        msgBody: content.msgBody,
      })
      store.dispatch('GET_LAST_MSG_LIST')
    }

    withdrwFlag = true
  }

  await sqliteDelete('t_messages', {
    req_id: data.reqId,
  })
  if (data.ack == '701' || data.ack == '703') {
    data.fromType = 707
    doc.from_type = 707
    doc.effectiveTimeDate = result.effectiveTimeDate
    setTimeout(() => {
      ipcRenderer.send('audio-window-busy-call', {
        userInfo: {},
        userSig: '',
        roomId: data.roomId,
      })
    }, 1000)
  }

  if (!withdrwFlag) {
    await sqliteUpdate(
      tableName,
      {
        req_id: data.reqId,
      },
      doc
    )
  }

  const hasAudioOldMessage = data.oldMsgType === 11

  if (hasAudioOldMessage && data.ack == '200') {
    if (data.fromType == 701 || data.fromType == 702) {
      let lastCurrentAudioIndex = store.state.chat.currentAudio.length - 1
      if (
        data.fromType == 702 &&
        store.state.chat.currentAudio &&
        store.state.chat.currentAudio[lastCurrentAudioIndex].fromType != 702
      ) {
        await audioOthersProcessing(data, tableName)
        return
      }
      ipcRenderer.send('audio-window-connecting-call', {
        userInfo: {},
        userSig: '',
        roomId: data.roomId,
      })
    } else {
      let lastCurrentAudioIndex = store.state.chat.currentAudio.length - 1
      if (
        data.fromType == 703 &&
        store.state.chat.currentAudio &&
        store.state.chat.currentAudio[lastCurrentAudioIndex].fromType != 703
      ) {
        await audioOthersProcessing(data, tableName)
        return
      }
      if (!data.oldMsgId) {
        if (
          store.state.chat.currentAudio[0] &&
          (store.state.chat.currentAudio[0].fromType == 701 ||
            store.state.chat.currentAudio[0].fromType == 702)
        ) {
          const oldMessage = await window.vm.$knex.raw(
            `select from_id, target_id, req_id, msg_id, from_type from ${tableName} 
            where req_id = '${store.state.chat.currentAudio[0].reqId}'`
          )
          if (oldMessage) {
            data.oldMsgId = oldMessage[0].msg_id
          }
        }
      }
    }
    await processAudioACK(data)
  }
  // if (data.fromType != 701 && data.fromType != 702) {
  //   store.dispatch(UPDATE_CHAT_SEND_STATUS,{...chatData, msgId: data.msgId, fromName, fromIcon});
  //   store.dispatch(GET_LAST_MSG_LIST);
  // }
  if (hasAudioOldMessage) {
    const chatData = await sqliteFindOne(
      tableName,
      {
        req_id: data.reqId,
      },
      [
        'req_id as reqId',
        'msg_id as msgId',
        'target_type as targetType',
        'target_id as targetId',
        'from_type as fromType',
        'timestamp',
        'msg_order as msgOrder',
        'unique_code as uniqueCode',
        'msg_body as msgBody',
        'ref_body as refMsgBody',
        'msg_type as msgType',
        'status as sendStatus',
        'read_status as readStatus',
        'from_type as fromType',
        'text',
        'from_id as fromId',
        'isDecrypt as isDecrypt',
      ]
    )
    let fromName
    let fromIcon
    if (data.fromId == UserInfoUtils.getCurrentUserId()) {
      fromName = UserInfoUtils.getCurrentUserNickName()
      fromIcon = UserInfoUtils.getCurrentUserImg()
    } else {
      const contact = await sqliteFindOne('t_contacts', {
        friend_id: chatData.fromId,
      })
      if (contact) {
        fromIcon = contact.friend_head_img
        fromName = contact.friend_friendNotes
          ? contact.friend_friendNotes
          : contact.friend_nick_name
      }
    }
    chatData.msgBody = JSON.parse(chatData.msgBody)
    chatData.refMsgBody = JSON.parse(chatData.refMsgBody)
    setTimeout(() => {
      store.dispatch(SET_CHAT, {
        ...chatData,
        msgId: data.msgId,
        fromName,
        fromIcon,
      })
    }, 1000)
  }
}

// 批量处理接收群聊28离线消息
// async function batchProcessMessage(groupId, msgList, nrd) {
//   const isExists = await window.vm.$knex.schema.hasTable(`m_${groupId}`)
//   if (!isExists) {
//     const message = new Message(groupId)
//     message.createTable()
//   }
//   if (msgList) {
//     // 区分群聊 410 消息  先处理其他消息
//     let queue = customTaskQueue(msgList.length)
//     handleMsgsByQueue(queue, msgList, async () => {
//       await handleMsgsQueueDone(groupId, msgList, nrd)
//       await setSessionByGroup(groupId)
//     })
//   }
// }

const batchInsert28Message = async (groupId, msgList, nrd) => {
  try {
    const isExists = await window.vm.$knex.schema.hasTable(`m_${groupId}`)
    if (!isExists) {
      const message = new Message(groupId)
      await message.createTable()
    }
    const columns = ['req_id', 'target_type', 'target_id', 'from_type', 'from_id', 'msg_type', 'msg_id', 'msg_order', 'unique_code',
      'timestamp', 'appoint', 'msg_header', 'msg_body', 'ref_body', 'read_status', 'text', 'effectiveTimeDate', 'isDecrypt', 'status'];
    const list = [];
    for (let item of msgList) {
      let detext = '';
      if (item.msgBody && item.msgBody.text) {
        detext = item.msgBody.text
      }
      list.push({
        req_id: item.reqId,
        msg_id: item.msgId,
        target_type: item.targetType,
        target_id: item.targetId,
        from_type: item.fromType,
        from_id: item.fromId,
        msg_type: item.msgType,
        msg_order: item.msgOrder,
        unique_code: item.uniqueCode,
        timestamp: item.timestamp ? item.timestamp : new Date().getTime(),
        appoint: item.appoint,
        msg_header: JSON.stringify(item.msgHeader),
        msg_body: JSON.stringify(item.msgBody),
        ref_body: JSON.stringify(item.refMsgBody),
        read_status: item.readStatus,
        text: detext || null,
        effectiveTimeDate: (item.msgHeader ? item.msgHeader.effectiveTimeDate : (item.timestamp + (7 * 24 * 60 * 60 * 1000))),
        isDecrypt: true,
        status: 2,
      });
      await sqliteReplace(`m_${item.targetId}`, columns, list).then(async() => {
        await handleMsgsQueueDone(groupId, msgList, nrd)
        await setSessionByGroup(groupId)
      })
    }
    // const data
  } catch (err) {
    log.error(err);
  }
}

const setSessionByGroup = async function(groupId) {
  const lastMessage = await window.vm.$knex.raw(`
    select * from m_${groupId} as m where m.msg_type in (${lastMessagesInView_msgType.toString()}) and
    m.from_type not in (${lastMessagesNotInView_fromType.toString()}) and m.status > 1 and
    m.isDeleted = 0 ORDER BY m.msg_order DESC, m.timestamp DESC LIMIT 1
  `)
  let body = {};
  if (lastMessage.length && lastMessage[0].msg_body) {
    body = JSON.parse(lastMessage[0].msg_body);
  } else {
    body = { text: '' }
  }
  console.log('最后一条消息',lastMessage)
  await window.vm.$knex('t_sessions').insert({
    id: groupId,
    uniqueCode: lastMessage[0].unique_code,
    targetType: lastMessage[0].target_type,
    timestamp: lastMessage[0].timestamp,
    updateTime: lastMessage[0].timestamp || Date.now() + '',
    isDeleted: false,
    lastMsgId: lastMessage[0].msg_id, // 发送消息时不存在
    msgType: lastMessage[0].msg_type,
    text: body.text,
    refMsgBody: lastMessage[0].ref_body,
    msgBody: lastMessage[0].msg_body,
    fromId: lastMessage[0].from_id,
    fromType: lastMessage[0].from_type,
    reqId: lastMessage[0].req_id,
  }).onConflict('id').merge();
}

const handleMsgsQueueDone = async function(groupId, msgList, nrd) {
  if (nrd && nrd > 0) {
    console.log('修改群聊未读计数增加', nrd)
    await window.vm.$knex.raw(
      `update t_sessions set unread = unread + ${nrd} where uniqueCode="${msgList[0].uniqueCode}"`
    )
  }
  const msgIds = []
  msgList.forEach((ele) => {
    msgIds.push({
      md: ele.msgId,
      et: ele.msgHeader.effectiveTimeDate,
      od: ele.msgOrder,
      at: !!ele.appoint,
    })
  })

  await processGroupACK(groupId, msgIds)
  await store.dispatch(GET_LAST_MSG_LIST)
}

const processLogoutACK = async (fromId) => {
  const obj = {
    event: 'chat.client.logout.ack',
    fromId,
    type: 'ws',
  }
  Ws.sendMessage(obj)
}

// 群聊 ACK回执
const processGroupACK = async (groupId, mds) => {
  if (mds.length > 0) {
    mds = mds.map((ele) => {
      return {
        md: String(ele.md),
        et: parseInt(ele.et),
        od: parseInt(ele.od),
        at: Number(ele.at),
      }
    })
    const udid = await getSocketUDID()
    const obj = {
      event: 'c.c.gack',
      Authorization: localStorage.accessToken,
      fd: UserInfoUtils.getCurrentUserId(),
      td: groupId,
      m: 'PC',
      mds,
      em: udid,
      type: 'ws',
    }
    Ws.sendMessage(obj)
  }
}

// const getManyGroupMessage = async groupId => {
//   const udid = await getSocketUDID();
//   const obj = {
//     event: 'g.c.gmsg.tp100',
//     m: 'PC',
//     ud: UserInfoUtils.getCurrentUserId(),
//     td: groupId,
//     em: udid,
//     type: 'ws'
//   };
//   Ws.sendMessage(obj);
// };

//处理消息入库,对方撤回消息也在这里入库，msgtype =24
const processMessage = async (msgInfo, dTmsgType, isBatch) => {
  try {
    if (typeof msgInfo.msgBody === 'string') {
      msgInfo.msgBody = JSON.parse(msgInfo.msgBody)
    }
    if (msgInfo.msgType == 99) {
      return Promise.resolve({
        messageInfo: {
          ...msgInfo,
        },
        messageRet: 'N',
      })
    }
    // 禁止复制
    if (msgInfo.fromType == '355' || msgInfo.fromType == '353') {
      return Promise.resolve({
        messageInfo: {
          ...msgInfo,
        },
        messageRet: 'N',
      })
    }
    // 置顶/免打扰
    if (msgInfo.fromType == '369' || msgInfo.fromType == '370') {
      return Promise.resolve({
        messageInfo: {
          ...msgInfo,
        },
        messageRet: 'I',
      })
    }
    // 只记录 376 发起场外交易，其他消息不处理
    if (
      msgInfo.msgType == 31 &&
      (msgInfo.fromType == '377' || msgInfo.fromType == '379')
    ) {
      return Promise.resolve({
        messageInfo: {
          ...msgInfo,
        },
        messageRet: 'N',
      })
    }
    let id = parseUniqueCode(msgInfo.uniqueCode, msgInfo.targetType)
    //设置从后台推送的消息的特殊字段
    msgInfo.id = id
    if (msgInfo.msgBody) {
      msgInfo.msgBody.originTypePsw = true
      if (msgInfo.msgType == '9' && msgInfo.fromType == '999') {
        msgInfo.msgBody.unreadMessage = true
      }
    }
    if (msgInfo.fromType == 324) {
      msgInfo.msgType = '4'
    }
    if (msgInfo.fromId == UserInfoUtils.getCurrentUserId()) {
      msgInfo.sendStatus = 2
    }
    if (msgInfo.fromType == 408) {
      return Promise.resolve({
        messageInfo: {
          ...msgInfo,
        },
        messageRet: 'I',
      })
    }
    if (msgInfo.fromType == 409 && dTmsgType !== 28) {
      await store.dispatch(UPDATE_CACHE, msgInfo)
    }
    if (msgInfo.fromType == 401 || msgInfo.fromType == 402) {
      await processRequestByGroup(msgInfo)
      return Promise.resolve({
        messageInfo: {
          ...msgInfo,
        },
        messageRet: 'N',
      })
    }
    if (msgInfo.fromType == 212) {
      if (msgInfo.fromId != UserInfoUtils.getCurrentUserId()) {
        await processRequestByFriend(msgInfo);
      }
      processSingleACK([msgInfo.msgId], msgInfo.fromId)
      return Promise.resolve({
        messageInfo: {
          ...msgInfo,
        },
        messageRet: 'N',
      })
    }

    if (msgInfo.appoint === 1 && msgInfo.msgType !== 26) {
      let bol =
        Object.keys(msgInfo.refMsgBody.atus).includes(
          UserInfoUtils.getCurrentUserId()
        ) ||
        (Object.keys(msgInfo.refMsgBody.atus).includes('all') &&
          msgInfo.fromId != UserInfoUtils.getCurrentUserId())
      if (bol) {
        if (!ChatListUtils.isCurrentChat(id)) {
          await window.vm
            .$knex('t_sessions')
            .where({
              id,
            })
            .update({
              isAt: 1,
            })
          // console.log('%c非当前窗口 at me', "font-size:30px;", id, msgInfo)
          store.dispatch('actionSessionAt', {
            sessionId: id,
            atMsgObj: JSON.parse(JSON.stringify(msgInfo)),
          })
        } else {
          // console.log('%c当前窗口at me～～', "font-size:30px;", id, msgInfo)
          store.dispatch('actionSessionAt', {
            sessionId: id,
            atMsgObj: JSON.parse(JSON.stringify(msgInfo)),
          })
        }
      }
    }
    msgInfo.fromPush = true
    let detext
    let isDecrypt = true
    if (msgInfo.msgBody && msgInfo.msgBody.text) {
      detext = msgInfo.msgBody.text
    }
    const updateAudioFromType = [702, 703, 704, 705, 706, 707, 712, 700]
    if (updateAudioFromType.includes(msgInfo.fromType)) {
      if (!store.state.common.isAudioWindowDisplay) {
        return Promise.resolve({
          messageInfo: {
            ...msgInfo,
          },
          messageRet: 'N',
        })
      }
      let updateAudioResult = await updateAudioMessage(
        msgInfo,
        msgInfo.msgBody.msgId
      )
      if (
        msgInfo.fromType != 701 &&
        msgInfo.fromType != 702 &&
        updateAudioResult != 'ignore'
      ) {
        await store.dispatch(ADD_LAST_MSG_LIST, {
          ...msgInfo,
          fromPush: true,
        })
        await store.dispatch(SET_CHAT, msgInfo)
      }
      return Promise.resolve({
        messageInfo: {
          ...msgInfo,
        },
        messageRet: 'N',
      })
    }
    const message = new Message(msgInfo.id)
    if (msgInfo.msgType == 40) {
      let msg_body = JSON.stringify(msgInfo.msgBody)
      msg_body = msg_body.replace(/"downloadFinished":true,/g, '')
      msg_body = msg_body.replace(/"downloadPercent":"100%",/g, '')
      msgInfo.msgBody = JSON.parse(msg_body)
    }
    let messageObj = {
      req_id: msgInfo.reqId,
      target_type: msgInfo.targetType,
      target_id: msgInfo.targetId,
      from_type: msgInfo.fromType,
      from_id: msgInfo.fromId,
      msg_type: msgInfo.msgType,
      msg_id: msgInfo.msgId,
      msg_order: msgInfo.msgOrder,
      unique_code: msgInfo.uniqueCode,
      timestamp: msgInfo.timestamp ? msgInfo.timestamp : new Date().getTime(),
      appoint: msgInfo.appoint,
      msg_header: JSON.stringify(msgInfo.msgHeader),
      msg_body: msgInfo.msgBody ? JSON.stringify(msgInfo.msgBody) : null,
      ref_body: JSON.stringify(msgInfo.refMsgBody),
      read_status: msgInfo.readStatus,
      text: detext,
      effectiveTimeDate: msgInfo.msgHeader.effectiveTimeDate || 0,
      isDecrypt: isDecrypt,
      // 接收成功
      status: 2,
    }
    let isExist = false
    if (msgInfo.msgType == 24 && msgInfo.msgBody?.reqId) {
      isExist = await window.vm
        .$knex('t_sessions')
        .select()
        .where({
          reqId: msgInfo.msgBody.reqId,
        })
    }
    let messageRet = null
    if (msgInfo.msgType != 24 || (isExist && isExist.length)) {
      messageRet = await message.insertMessage(messageObj)
    }

    if (msgInfo.fromType == 372) {
      await store.dispatch(UPDATE_CACHE, msgInfo)
      await store.dispatch(SET_CHAT, msgInfo)
    }
    if (msgInfo.msgType == 26 && dTmsgType == '28') {
      chatIndex.widthDrawMsg(msgInfo, dTmsgType)
    }
    if (msgInfo.msgType == 24) {
      const INCLUDE_MSG_TYPES = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '14',
        '44',
        '15',
        '25',
        '40',
      ]
      let chatList = (store.state?.chat?.chatList || []).filter((o) =>
        INCLUDE_MSG_TYPES.includes(o['msgType'])
      )
      console.log(chatList)
      //fix 35905 撤回的是最后一条可撤回的消息时更新 会话列表
      if (
        chatList.length &&
        (chatList[chatList.length - 1]?.msgId == msgInfo?.msgBody?.msgId ||
          chatList[chatList.length - 1]?.reqId == msgInfo?.msgBody?.reqId)
      ) {
        await window.vm.$knex.raw(
          `update t_sessions set
            isAt=0,
            fromType=24,
            updateTime=${new Date().getTime().toString()},
            timestamp=${new Date().getTime().toString()}
            where id=${msgInfo.targetId}`
        )
      }
      chatIndex.widthDrawMsg(msgInfo, dTmsgType)
      return Promise.resolve({
        messageInfo: {
          ...msgInfo,
        },
        messageRet: 'Y',
      })
    }
    //其它需要操作的消息
    if (
      msgInfo.fromType !== 999 &&
      dTmsgType !== 28 &&
      msgInfo.fromType != 372
    ) {
      await store.dispatch(UPDATE_CACHE, msgInfo)
    }
    if (msgInfo.targetType == '1' && dTmsgType !== 32) {
      processSingleACK([msgInfo.msgId], msgInfo.fromId, msgInfo.fromType)
    }
    if (msgInfo.targetType == '2' && dTmsgType != '28') {
      processGroupACK(msgInfo.targetId, [
        {
          md: msgInfo.msgId,
          et: msgInfo.msgHeader.effectiveTimeDate,
          od: msgInfo.msgOrder,
          at: !!msgInfo.appoint,
        },
      ])
    }
    if (
      msgInfo.targetType == '1' &&
      msgInfo.msgType == '23' &&
      msgInfo.fromType == '410'
    ) {
      if (msgInfo.fromId != UserInfoUtils.getCurrentUserId()) {
        await ProcessReadMessage(msgInfo)
      }
    }

    // 上面已经处理301加未读数
    if (msgInfo.fromType != '380' && msgInfo.fromType != '301') {
      await store.dispatch(ADD_LAST_MSG_LIST, {
        ...msgInfo,
        fromPush: true,
        dTmsgType,
        isBatch,
      })
    }
    if (msgInfo.msgType == '2') {
      fileOperational.getImage(msgInfo.msgBody.mediaCondenseId)
      fileOperational.getImage(msgInfo.msgBody.mediaId)
    }
    if (
      msgInfo.msgType == 6 &&
      (msgInfo.fromId != UserInfoUtils.getCurrentUserId() ||
        !msgInfo.msgBody.reqId)
    ) {
      if (!msgInfo.msgBody.reqId) {
        msgInfo.msgBody.reqId = msgInfo.reqId
      }
      msgInfo.msgBody.downloadPercent = ''
      msgInfo.msgBody.downloadFinished = false
      msgInfo.msgBody.downloadPath = ''
      autoDownloadFile(msgInfo, msgInfo.msgBody)
    }

    if (
      DiDiPaymentFromType.includes(msgInfo.fromType * 1) &&
      dTmsgType == 27 &&
      msgInfo.msgType == 41
    ) {
      await store.dispatch('actionCurrentPayment', msgInfo)
    }
    if (dTmsgType == 27 && (msgInfo.msgType == 54 || msgInfo.msgType == 62)) { 
      /**
       * 54 是老的消息类型， 62是新的活动消息类型，增加了一些活动字段
          http://showdoc.vonechain.com:8801/web/#/50?page_id=968
       **/ 
      await store.dispatch('currentActAssistant', msgInfo);
    }
    if (dTmsgType == 27 && ChatListUtils.isCurrentChat(id)) {
      await store.dispatch('ADD_LAST_MSG_LIST', msgInfo)
    }
    // 处理群聊28
    if (dTmsgType == 28 && ChatListUtils.isCurrentChat(id)) {
      await store.dispatch('ADD_LAST_MSG_LIST', msgInfo)
    }
    return Promise.resolve({
      messageInfo: {
        ...msgInfo,
      },
      messageRet,
    })
  } catch (err) {
    console.error('processMessage ERR', err, msgInfo)
    reportException(err)
    return Promise.resolve({
      messageInfo: {
        ...msgInfo,
      },
      messageRet: 'N',
    })
  }
};
const processAudioHistoryMessage = async msgInfo => {
  try {
    let id = parseUniqueCode(msgInfo.uniqueCode, msgInfo.targetType)
    //设置从后台推送的消息的特殊字段
    msgInfo.id = id
    msgInfo.fromPush = true
    const updateAudioFromType = [705, 706]
    if (!updateAudioFromType.includes(msgInfo.fromType)) {
      return Promise.resolve({
        messageInfo: {
          ...msgInfo,
        },
        messageRet: 'N',
      })
    }
    const message = new Message(msgInfo.id)
    const msg = await message.getMessage(msgInfo.msgBody.msgId)
    if (msg.length > 0) {
      return Promise.resolve({
        messageInfo: {
          ...msgInfo,
        },
        messageRet: 'N',
      })
    }
    if (msgInfo.fromId == UserInfoUtils.getCurrentUserId()) {
      return Promise.resolve({
        messageInfo: {
          ...msgInfo,
        },
        messageRet: 'N',
      })
    }
    const messageRet = await message.insertMessage({
      req_id: msgInfo.reqId,
      target_type: msgInfo.targetType,
      target_id: msgInfo.targetId,
      from_type: msgInfo.fromType,
      from_id: msgInfo.fromId,
      msg_type: msgInfo.msgType,
      msg_id: msgInfo.msgId,
      msg_order: msgInfo.msgOrder,
      unique_code: msgInfo.uniqueCode,
      timestamp: msgInfo.timestamp,
      msg_header: JSON.stringify(msgInfo.msgHeader),
      msg_body: msgInfo.msgBody ? JSON.stringify(msgInfo.msgBody) : null,
      ref_body: JSON.stringify(msgInfo.refMsgBody),
      read_status: msgInfo.readStatus,
      text: '',
      effectiveTimeDate: msgInfo.msgHeader.effectiveTimeDate || 0,
      isDecrypt: true,
      // 接收成功
      status: 2,
    })
    await store.dispatch(ADD_LAST_MSG_LIST, {
      ...msgInfo,
      fromPush: true,
    })
    await store.dispatch('GET_LAST_MSG_LIST')
    return Promise.resolve({
      messageInfo: {
        ...msgInfo,
      },
      messageRet,
    })
  } catch (err) {
    console.error('processAudioHistoryMessage ERR', err, msgInfo)
    return Promise.resolve({
      messageInfo: {
        ...msgInfo,
      },
      messageRet: 'N',
    })
  }
};

async function processGroupOut(list, version) {
  const q = [];
  for(let item of list) {
    q.push(sqliteUpdate('t_groups_member', { group_id: item.groupId, id: item.userId }, { is_show: false }));
  }

  await Promise.all(q);
  await sqliteUpdate('t_news_version', {name: 'msgType46'}, { version: String(version) });
  // 订阅群离线消息
  getGroupChatHistory();
}
async function ProcessReadMessage (msgInfo) {
  let id = parseUniqueCode(msgInfo.uniqueCode, msgInfo.targetType);
  // 已读消息回执
  // 这边增加延迟执行函数 已读消息回执
  // setTimeout(async function () {
  const message = new Message(id)
  await message.updateReadStatus({
    msg_order: msgInfo.msgOrder,
    status: 3,
  })
  //   console.log('setTimeout ====> 延迟更新消息',)
  // }, 2000);
  //TODO 需要实时更新当前窗口
  if (ChatListUtils.isCurrentChat(id)) {
    await store.dispatch(UPDATE_MESSAGE_READ, {
      ...msgInfo,
      id,
    })
  }
}

//密钥变更 msgType=13
async function processKeyChange(results) {
  await SQLUtils.insertOrUpdateTContactsPubkey(results.fromId)
}

//########### 缓存相关 #############
// 入库用户/好友信息 57
export async function ProcessContract(results, from) {
  const lists = (from === 'syncInfo' ? results.arrs : results.dt) || []
  const promise = []
  for (let item of lists) {
    // const friend_head_img_local = await fileOperational.getImage(item.userHeadImg);
    const obj = {
      friend_nick_name: item.userNickName,
      friend_nick_name_pinyin:
        item.userNickName == undefined
          ? ''
          : convertToPinyin(item.userNickName),
      friend_head_img: item.userHeadImg,
      friend_head_img_local: '',
      friend_friendNotes: item.friendNotes,
      friend_friendNotes_pinyin:
        item.friendNotes == undefined ? '' : convertToPinyin(item.friendNotes),
      invite_code: item.inviteCode,
      vipType: item.vipType,
      inviteCodeType: item.inviteCodeType,
      userRank: item.userRank,
      msgExpireTime: (item.msgExpireTime) / 3600000,
      topFlag: item.topFlag,
      noNoticeFlag: item.noNoticeFlag,
    };
    item.friendId = String(item.friendId);
    let searchRet = await window.vm.$knex('t_contacts').where({
      friend_id: item.friendId,
    })
    if (searchRet && searchRet.length) {
      if (item.t == 4) {
        // 删除
        promise.push(
          await window.vm
            .$knex('t_contacts')
            .where({ friend_id: item.friendId })
            .del()
        )
      } else {
        //更新
        promise.push(
          await window.vm
            .$knex('t_contacts')
            .where({ friend_id: item.friendId })
            .update(obj)
        )
      }
    }
    if (searchRet && !searchRet.length) {
      if (item.t == 4) {
        continue
      } else {
        obj.friend_id = item.friendId
        promise.push(
          await window.vm
            .$knex('t_contacts')
            .insert(obj)
            .onConflict('friend_id')
            .ignore()
        )
      }
    }
  }
  await Promise.all(promise)
  getSingleChatHistory()
  if (from !== 'syncInfo') {
    if (results.utn) {
      let _version = '' + results.utn
      await window.vm
        .$knex('t_news_version')
        .where({
          name: 'utn',
        })
        .update({
          version: _version,
          updatedOn: new Date().getTime() + '',
        })
    } else {
      console.log('results.utn 不存在')
    }
  }
}
//群信息类型模块 msgType=18
export async function ProcessGroupInfo(results, from) {
  console.log(results, '离线群信息同步++++++++++++++++++++++++++++')
  const lists = (from === 'syncInfo' ? results.arrs : results.dt) || []
  for (const item of lists) {
    // const group_avatar_local = await fileOperational.getImage(item.groupAvatar);
    const obj = {
      group_name: item.groupName,
      group_status: item.groupStatus,
      group_profile: item.groupProfile,
      group_avatar: item.groupAvatar,
      group_avatar_local: '',
      add_check: item.addCheck,
      invite_auth: item.inviteAuth,
      country: item.country,
      city: item.city,
      screenshotsReminderStatus: item.screenshotsReminderStatus,
      forbiddenWordsStatus: item.forbiddenWordsStatus,
      memberSingleChatStatus: item.memberSingleChatStatus,
      sendPicturesStatus: item.sendPicturesStatus,
      sendConnectionStatus: item.sendConnectionStatus,
      copyMessagesStauts: item.copyMessagesStauts,
      sendRedpacketStatus: item.sendRedpacketStatus,
      create_time: item.createdOn,
      save_time:
        Number(item.saveTime) > 1000 ? item.saveTime / 3600000 : item.saveTime,
      people: item.people,
      maxPeople: item.maxPeople,
      member_level_status: item.memberLevelStatus,
      group_level: item.groupLevel,
      updatedOn: item.updatedOn,
      code: item.code,
      group_name_pinyin:
        item.groupName == undefined ? '' : convertToPinyin(item.groupName),
      is_show: 'true',
      group_code: item.groupCode,
      group_type: item.groupType != 1 ? 0 : 1,
      groupTab: item.groupTab,
    };
    let searchRet = await window.vm
      .$knex('t_groups')
      .where({
        group_id: item.id,
      })
      .select('group_id')
    if (searchRet && searchRet.length > 0) {
      if (item.t == 4) {
        // 删除
        await window.vm
          .$knex('t_groups')
          .where('group_id', '=', item.id)
          .del()
        await window.vm
          .$knex('t_groups_member')
          .where('group_id', '=', item.id)
          .del()
        await window.vm
          .$knex('t_sessions')
          .where('id', '=', item.id)
          .del()
        const message = new Message(item.id)
        await message.deleteTable()
      } else {
        //更新
        await window.vm
          .$knex('t_groups')
          .where('group_id', '=', item.id)
          .update(obj)
      }
    } else {
      if (item.t == 4) {
        await window.vm
          .$knex('t_groups_member')
          .where('group_id', '=', item.id)
          .del()
        await window.vm
          .$knex('t_sessions')
          .where('id', '=', item.id)
          .del()
        continue
      } else {
        //新增
        obj['group_id'] = item.id
        await window.vm.$knex('t_groups').insert(obj)
      }
    }
  }
  //更新t_new_session
  if (results.gtn) {
    let _version = '' + results.gtn;
    await window.vm
      .$knex('t_news_version')
      .where({
        name: 'gtn'
      })
      .update({
        version: _version,
        updatedOn: new Date().getTime() + ''
      });
  } else {
    console.log('results.gtn 不存在')
  }
  //更新群限制状态t_groups_appeal
  if (results.dr) {
    const appealObj = {
      closure_create_time: '',
      closure_end_time: '',
      closure_impeach_reason: '',
      closure_limit_day: 0,
      closure_limit_type: 0,
      show_appeal_closure_notice: 0,
      warn_create_time: '',
      warn_end_time: '',
      warn_impeach_reason: '',
      warn_limit_day: 0,
      warn_limit_type: 0,
      show_appeal_warn_notice: 0,
    }
    await window.vm.$knex('t_groups_appeal').update(appealObj)
    if (results.dr.length !== 0) {
      for (const item of results.dr) {
        await SQLUtils.updateGroupsAppealInfoByLimitType(item)
      }
    }
  }
  //更新群预警状态t_groups_exceed
  if (results.er) {
    const exceedObj = {
      exceed_num: 0,
      show_exceed_notice: 0,
    }
    await window.vm.$knex('t_groups_exceed').update(exceedObj)
    if (results.er.length !== 0) {
      for (const item of results.er) {
        await SQLUtils.updateGroupsExceedInfoByLimitType(item)
      }
    }
  }
}
//群成员信息 msgType= 19
export async function ProcessGroupMember(results) {
  const insertDatas = []
  let idsMap = {}
  // 先去重 再一次性的把数据都拿出来
  let key = ''
  let dts = []
  results.dt.forEach((item) => {
    key = `${item.userId}_${item.groupId}`
    if (typeof idsMap[key] === 'undefined') {
      idsMap[key] = dts.length
    }
    dts[idsMap[key]] = item
  })
  console.log(results.dt.length, dts.length)
  idsMap = {}
  try {
    for (let item of dts) {
      const obj = {
        auth_status: item.authStatus,
        nick_name: item.nickName,
        user_head_img: item.userHeadImg,
        user_head_img_local: '',
        is_show: 'true',
        member_notes: item.memberNotes || null,
        member_notes_pinyin: convertToPinyin(item.memberNotes || null),
        forbiddenWordsStatus: item.forbiddenWordsStatus,
        muteNotifications: item.muteNotifications,
        additionalStatus: item.additionalStatus,
        mutedStatus: item.mutedStatus,
        stickyStatus: item.stickyStatus,
        vipType: item.vipType,
        inviteCodeType: item.inviteCodeType,
        userRank: item.userRank,
        inviteCode: item.inviteCode,
        joinTime: Date.now(item.joinTime),
      }
      key = `${item.userId}_${item.groupId}`
      if (item.t == 4) {
        // 删除
        await window.vm
          .$knex('t_groups_member')
          .where({
            id: item.userId,
            group_id: item.groupId,
          })
          .update({
            is_show: 'false',
          })
        if (item.userId != UserInfoUtils.getCurrentUserId()) {
          await SQLUtils.deleteGroupsMemberById(item.groupId, item.userId)
          await SQLUtils.deleteGroupsMemberAuthById(item.groupId, item.userId)
        } else {
          await SQLUtils.deleteSessionsById(item.groupId)
          await SQLUtils.deleteGroupsById(item.groupId)
          await SQLUtils.deleteGroupsMember(item.groupId)
          await SQLUtils.deleteGroupsMemberAuth(item.groupId)
          const message = new Message(item.groupId)
          await message.deleteTable()
        }
      } else {
        //更新或新增
        obj['id'] = item.userId
        obj['group_id'] = item.groupId
        if (typeof idsMap[key] === 'undefined') {
          idsMap[key] = insertDatas.length
        }
        insertDatas[idsMap[key]] = obj
      }
    }

    if (insertDatas.length) {
      if (insertDatas.length <= BatchNum) {
        await window.vm
          .$knex('t_groups_member')
          .insert(insertDatas)
          .onConflict(['id', 'group_id'])
          .merge()
      } else {
        let i = 0
        for (; i < insertDatas.length; i += BatchNum) {
          await window.vm
            .$knex('t_groups_member')
            .insert(insertDatas.slice(i, i + BatchNum))
            .onConflict(['id', 'group_id'])
            .merge()
        }
        if (insertDatas.length - (i / BatchNum - 1) * BatchNum > 0) {
          // eslint-disable-next-line max-len
          await window.vm
            .$knex('t_groups_member')
            .insert(insertDatas.slice((i / BatchNum - 1) * BatchNum))
            .onConflict(['id', 'group_id'])
            .merge()
        }

        // await window.vm.$knex('t_groups_member').insert(insertDatas);
      }
    }
    //更新t_new_session
    if (results.gtmn > 0) {
      let _version = '' + results.gtmn
      await window.vm
        .$knex('t_news_version')
        .where({
          name: 'gtmn',
        })
        .andWhere('version', '<', +_version)
        .update({
          version: _version,
          updatedOn: new Date().getTime() + '',
        })
    }

    // getGroupChatHistory();
  } catch (error) {
    console.error('ProcessGroupMember ERR', error)
  }
}
//群成员本人信息 msgType= 48
export async function ProcessSelfGroupMember (results) {
  try {
    const userInfo = results.userInfo
    for (let item of results.arrs) {
      const obj = {
        auth_status: item.authStatus,
        nick_name: userInfo.nickName,
        user_head_img: userInfo.userHeadImg,
        user_head_img_local: '',
        is_show: 'true',
        member_notes: item.memberNotes || null,
        member_notes_pinyin: convertToPinyin(item.memberNotes || null),
        forbiddenWordsStatus: item.forbiddenWordsStatus,
        muteNotifications: item.muteNotifications,
        additionalStatus: item.additionalStatus,
        mutedStatus: item.mutedStatus,
        stickyStatus: item.stickyStatus,
        vipType: userInfo.vipType,
        inviteCodeType: userInfo.inviteCodeType,
        userRank: userInfo.userRank,
        inviteCode: userInfo.inviteCode,
        joinTime: Date.now(item.joinTime),
      }
      const uid = results.userId
      let searchRet = await window.vm.$knex('t_groups_member').where({
        id: uid,
        group_id: item.groupId,
      })
      if (searchRet && searchRet.length > 0) {
        if (item.t == 4) {
          // 删除
          await window.vm
            .$knex('t_groups_member')
            .where({
              id: uid,
              group_id: item.groupId,
            })
            .update({
              is_show: 'false',
            })
          await SQLUtils.deleteSessionsById(item.groupId)
          await SQLUtils.deleteGroupsById(item.groupId)
          await SQLUtils.deleteGroupsMember(item.groupId)
          await SQLUtils.deleteGroupsMemberAuth(item.groupId)
          const message = new Message(item.groupId)
          await message.deleteTable()
        } else {
          //更新
          await window.vm
            .$knex('t_groups_member')
            .where({
              id: uid,
              group_id: item.groupId,
            })
            .update(obj)
        }
      } else if (item.t != 4) {
        //新增
        obj['id'] = uid
        obj['group_id'] = item.groupId
        await window.vm.$knex('t_groups_member').insert(obj)
      }
    }
  } catch (error) {
    console.error('ProcessSelfGroupMember ERR ', error)
  }
}

//个人限制离线信息 msgType=43
async function ProcessPersonalAppeal(results) {
  console.log(results, '个人限制离线信息同步++++++++++++++++++++++')
  if (results.dt) {
    store.commit(UPDATE_PERSONAL_APPEAL, results.dt)
  }
}

export async function addDiDiServiceInSession() {
  let id = '1008455862495526912'
  let uniqueCode = `${UserInfoUtils.getCurrentUserId()}@${id}`
  let seatchContactRet = await window.vm
    .$knex('t_contacts')
    .where({
      friend_id: '1008455862495526912',
    })
    .select('friend_id')
  if (!seatchContactRet || seatchContactRet.length == 0) {
    await window.vm.$knex.raw(
      `insert into t_contacts
      ('friend_id','friend_nick_name','friend_head_img','friend_type','invite_code','is_show')
      values('1008455862495526912','DiDimessage Service',
      'https://oss.didimessage.com/images/permanent/logo/logo_v2.png','6','100100','false')`
    )
  }
  await window.vm
    .$knex('t_sessions')
    .insert({
      id,
      uniqueCode,
      topFlag: 1,
      targetType: 1,
      textOrigin: '',
      text: '',
    })
    .onConflict('id')
    .merge({
      targetType: 1,
      uniqueCode,
      topFlag: 1,
    })
  // store.dispatch('GET_LAST_MSG_LIST');//进入到chat路由 已调用
}
export async function addDiDiPaymentInContacts() {
  // let paymentId = '1109675932474322944';
  // let uniqueCode = `${UserInfoUtils.getCurrentUserId()}@${paymentId}`;
  await window.vm
    .$knex('t_contacts')
    .insert({
      friend_id: paymentId,
      friend_nick_name: 'DiDimessage Payment',
      friend_head_img:
        'https://oss.didimessage.com/images/permanent/payment_assistant.png',
      friend_type: '', //"where s.targetType=1 and (c.friend_type !=6 or c.friend_type is null)"
      invite_code: '',
      is_show: 'false',
    })
    .onConflict('friend_id')
    .merge()
}

//公钥信息 21
async function ProcessPublicKey(results) {
  for (let item of results.dt) {
    const obj = {
      rsa_pub: item.rsaPub,
      rsa_pub_version: item.rsaPubVersion,
      latest_version: item.latestVersion,
    }
    let searchRet = await window.vm
      .$knex('t_contacts_pubkey')
      .where({
        user_id: item.userId,
      })
      .select('user_id')
    if (searchRet && searchRet.length > 0) {
      if (item.t == 4) {
        // 删除
        await window.vm
          .$knex('t_contacts_pubkey')
          .where('user_id', '=', item.userId)
          .del()
      } else {
        //更新
        await window.vm
          .$knex('t_contacts_pubkey')
          .where('user_id', '=', item.userId)
          .update(obj)
      }
    } else {
      if (item.t == 4) {
        continue
      } else {
        //新增
        obj['user_id'] = item.userId
        await window.vm.$knex('t_contacts_pubkey').insert(obj)
      }
    }
  }
  //更新t_new_session
  if (results.pkn) {
    let _version = '' + results.pkn
    await window.vm
      .$knex('t_news_version')
      .where({
        name: 'pkn',
      })
      .update({
        version: _version,
        updatedOn: new Date().getTime() + '',
      })
  } else {
    console.log('results.pkn 不存在')
  }
}

//群成员个人权限信息 22
async function ProcessGroupMemberPrivilege(results) {
  for (let item of results.dt) {
    const obj = {
      group_id: item.groupId,
      user_id: item.userId,
      member_leval: item.memberLeval,
      muted_status: item.mutedStatus,
      additional_status: item.additionalStatus,
      mute_notifications: item.muteNotifications,
      forbidden_words_status: item.forbiddenWordsStatus,
      sticky_status: item.stickyStatus,
      user_level: item.userLevel,
    }
    let searchRet = await window.vm
      .$knex('t_groups_member_auth')
      .where({
        group_id: item.groupId,
      })
      .select('group_id')
    if (searchRet && searchRet.length > 0) {
      if (item.t == 4) {
        // 删除
        await window.vm
          .$knex('t_groups_member_auth')
          .where('group_id', '=', item.groupId)
          .del()
      } else {
        //更新
        await window.vm
          .$knex('t_groups_member_auth')
          .where('group_id', '=', item.groupId)
          .update(obj)
      }
    } else {
      if (item.t == 4) {
        continue
      } else {
        //新增
        await window.vm.$knex('t_groups_member_auth').insert(obj)
      }
    }
  }
  //更新t_new_session
  if (results.gtmcn) {
    let _version = '' + results.gtmcn
    await window.vm
      .$knex('t_news_version')
      .where({
        name: 'gtmcn',
      })
      .update({
        version: _version,
        updatedOn: new Date().getTime() + '',
      })
  } else {
    console.log('results.gtmcn 不存在')
  }
}
//fromType === 222 你和XXX已经成为好友
async function ProcessAddFriend(results) {
  //你和XXX已经成为好友
  console.log(
    '你和XXX已经成为好友,好友 ID',
    parseUniqueCode(results.uniqueCode),
    results
  )
  if (results.refMsgBody && results.refMsgBody.users) {
    let item = results.refMsgBody.users[0]
    if (item.userId == UserInfoUtils.getCurrentUserId()) {
      item = results.refMsgBody.users[1]
    }
    let friendId = item.userId
    const obj = {
      friend_id: friendId,
      friend_nick_name: item.userNickName,
      friend_nick_name_pinyin: convertToPinyin(item.userNickName),
      friend_head_img: item.userHeadImg,
      friend_head_img_local: '',
      friend_friendNotes: item.friendNotes || '',
      friend_friendNotes_pinyin: '',
      invite_code: item.inviteCode,
      vipType: item.vipType,
      inviteCodeType: item.inviteCodeType,
      userRank: item.userRank,
    }
    await window.vm
      .$knex('t_contacts')
      .insert(obj)
      .onConflict('friend_id')
      .merge()
  }
  // 更新申请记录表
  await updateFriendsApply(results)
  // store.dispatch('GET_FRIENDS_LIST', {
  //   userId: parseUniqueCode(results.uniqueCode),
  //   pageSize: 100000
  // });
}
//fromType === 212 xxx 用户向你发起了好友申请
async function processRequestByFriend (results) {
  // await SQLUtils.updateRequestFriendNumber();
  // let totalNumber = await SQLUtils.getTotalSystemNumber();
  // store.dispatch(SET_TOTAL_SYSTEM_NUMBER, totalNumber);
  const item = await findFriendsApplyItem(results)
  if(item.id && item.id != '') {
    await updateFriendsApply(results)
  }else {
    await insertFriendsApply(results)
  }
}
//fromType === 215 xxx 拒绝了你的好友申请
async function processRejectByFriend (results) {
  // await SQLUtils.updateRejectFriendNumber();
  // let totalNumber = await SQLUtils.getTotalSystemNumber();
  // store.dispatch(SET_TOTAL_SYSTEM_NUMBER, totalNumber);
  console.log('processRejectByFriend ===>', results);
  // 更新申请记录表
  const item = await findFriendsApplyItem(results)
  if(item.id && item.id != '') {
    await updateFriendsApply(results)
  }else {
    await insertFriendsApply(results)
  }
}


//fromType === 389 管理员同意了群申请
async function processGroupAgree (results) {
  // await SQLUtils.updateRequestFriendNumber();
  // let totalNumber = await SQLUtils.getTotalSystemNumber();
  // store.dispatch(SET_TOTAL_SYSTEM_NUMBER, totalNumber);
  //fromType === 389 群管理员同意了群申请
  const item = await findFriendsApplyItem(results)
  if(item.id && item.id != '') {
    await updateFriendsApply(results)
  }else {
    await insertFriendsApply(results)
  }
}

//fromType === 390 管理员拒绝了群申请
async function processGroupReject (results) {
  // await SQLUtils.updateRequestFriendNumber();
  // let totalNumber = await SQLUtils.getTotalSystemNumber();
  // store.dispatch(SET_TOTAL_SYSTEM_NUMBER, totalNumber);
  const item = await findFriendsApplyItem(results)
  console.log('item ===>', item);
  if(item.id && item.id != '') {
    await updateFriendsApply(results)
  }else {
    await insertFriendsApply(results)
  }
}

async function processRequestByGroup (results) {
  // if (results.targetType == 2 && results.fromId == UserInfoUtils.getCurrentUserId()) {
  //   return;
  // }
  await processSingleACK([results.msgId], results.targetId);
  const item = {
    fromId: UserInfoUtils.getCurrentUserId(),
    targetId: results.targetId,
  }
  const groupAuth = await SQLUtils.findGroupMemberName(item)
  if (groupAuth.authStatus != 3) {
    // await SQLUtils.updateRequestFriendNumber();
    // let totalNumber = await SQLUtils.getTotalSystemNumber();
    // store.dispatch(SET_TOTAL_SYSTEM_NUMBER, totalNumber);
    // 封装对象 需要申请记录id
    // 申请群
    const item = await findFriendsApplyItem(results)
    if(item.id && item.id != '') {
      await updateFriendsApply(results)
    }else {
      await insertFriendsApply(results)
    }
  }
}

// 查找id
async function findFriendsApplyItem (results) {
  let item
  if (results.msgBody.text) {
    const obj = JSON.parse(results.msgBody.text) // 这里是个array
    const rows = obj.map((row) => {
      return t_friend_apply_builder(row)
    });
    if (rows[0].id) {
      item = await SQLUtils.findFriendsApplyItem(rows[0].id)
    }
  }
  console.log('findFriendsApplyItem ===>', item);

  return item
}

// 好友申请记录表 插入数据库方法
async function insertFriendsApply(results) {
  if (results.msgBody.text) {
    await SQLUtils.updateRequestFriendNumber();
    let totalNumber = await SQLUtils.getTotalSystemNumber();
    store.dispatch(SET_TOTAL_SYSTEM_NUMBER, totalNumber);
    const obj = JSON.parse(results.msgBody.text) // 这里是个array
    if (Array.isArray(obj) && obj.length > 0) {
      const rows = obj.map((row) => {
        return t_friend_apply_builder(row)
      });
      await SQLUtils.insertFriendsApply(rows)
      console.log('processRequestByFriend ===>', obj);
    }
    bus.$emit('refreshApplyList'); // 更新好友申请列表
  }
}

// 好友申请记录表 更新数据库方法
async function updateFriendsApply(results) {
  if (results.msgBody.text) {
    const obj = JSON.parse(results.msgBody.text) // 这里是个array
    if (Array.isArray(obj) && obj.length > 0) {
      obj.forEach(async (element) => {
        await SQLUtils.updateFriendsApplyByItem(t_friend_apply_builder(element))
      });
      console.log('updateFriendsApply ===>', obj);
    }
  }
}


//eslint-disable-next-line
async function processRejectByGroup() {
  await SQLUtils.updateRequestFriendNumber()
  let totalNumber = await SQLUtils.getTotalSystemNumber()
  store.dispatch(SET_TOTAL_SYSTEM_NUMBER, totalNumber)
}

//eslint-disable-next-line
async function processGroupMemberName(results) {
  if (results.refMsgBody && results.refMsgBody.users) {
    await SQLUtils.updateTGroupsMemberMemberNotes(results)
  }
}
async function autoDownloadFile(msgInfo, msgBody) {
  if (msgBody && msgBody.fileId && msgBody.fname) {
    let fileState = {
      key: msgBody.reqId,
      value: {},
    }
    if (msgBody.downloadFinished) {
      let downloadFileInfo = store.state.common.downloadFile
      if (downloadFileInfo && downloadFileInfo[msgBody.reqId]) {
        fileState.value.downloadPercent = '100%'
        fileState.value.downloadPath = msgBody.downloadPath
        fileState.value.downloadFinished = true
      } else {
        fileState.value.downloadPercent = ''
        fileState.value.downloadPath = ''
        fileState.value.downloadFinished = false
        msgBody.downloadPercent = ''
        msgBody.downloadPath = ''
        msgBody.downloadFinished = false
      }
    } else {
      fileState.value.downloadPercent = ''
      fileState.value.downloadPath = ''
      fileState.value.downloadFinished = false
      msgBody.downloadPercent = ''
      msgBody.downloadPath = ''
      msgBody.downloadFinished = false
    }
    await store.commit('SET_DOWNLOAD_FILE_INFO', fileState)
    const id = parseUniqueCode(msgInfo.uniqueCode, msgInfo.targetType)
    await window.vm
      .$knex(`m_${id}`)
      .where({
        req_id: msgInfo.reqId,
      })
      .update({
        msg_body: JSON.stringify(msgBody),
      })
  }
}
// eslint-disable-next-line no-unused-vars
async function downloadFile(fileItem) {
  const fullPath = await fileOperational.downloadFile(
    fileItem.fileId,
    fileItem.fname
  )
  let fileState = {
    key: fileItem.reqId,
    value: {},
  }
  fileState.value.downloadPercent = '100%'
  fileState.value.downloadPath = fullPath
  fileState.value.downloadFinished = true
  fileItem.downloadPercent = '100%'
  fileItem.downloadPath = fullPath
  fileItem.downloadFinished = true
  await store.commit('SET_DOWNLOAD_FILE_INFO', fileState)
}

async function discussionToGroup(msgInfo) {
  await window.vm
    .$knex('t_groups')
    .where({
      group_id: msgInfo.targetId,
    })
    .update({
      group_type: 1,
    })
  store.dispatch('GET_GROUP_LIST')
}
// 407 修改群成员表本人信息
async function updateGroupMemberUserInfoBy407(data) {
  await window.vm
    .$knex('t_groups_member')
    .update({
      nick_name: data.nickName,
      user_head_img: data.userHeadImg,
    })
    .where({
      id: data.userId,
    })
}
// msgType = 11 音频聊天消息处理
async function processAudioChat(results) {
  console.log('msgType = 11 音频聊天消息处理', results)
  const ignoreUpdateFromType = [703, 704, 705, 706, 707, 712, 700]
  if (results.fromType == 701 && store.state.common.isAudioWindowDisplay) {
    return
  }
  if (
    ignoreUpdateFromType.includes(results.fromType) &&
    !store.state.common.isAudioWindowDisplay
  ) {
    return
  }
  if (results.fromType == 712 && !results.msgId) {
    window.vm.$message.info('通话已关闭')
  }
  results.msgType = 11
  store.commit(SET_CURRENT_AUDIO, results)
  await store.dispatch(UPDATE_CACHE, results)
}
async function updateAudioMessage(msgInfo, oldMsgId) {
  let tableName =
    'm_' +
    (msgInfo.fromId == UserInfoUtils.getCurrentUserId()
      ? msgInfo.targetId
      : msgInfo.fromId)
  console.log('tableName ======= ', tableName, msgInfo)
  if (oldMsgId) {
    const oldMessage = await window.vm.$knex.raw(
      `select from_id, target_id, req_id, msg_id, from_type from ${tableName} where msg_id = '${oldMsgId}'`
    )
    if (!oldMessage || oldMessage.length == 0) {
      return 'ignore'
    }
    let effectiveTimeDate = 0
    if (msgInfo.msgHeader && msgInfo.msgHeader.effectiveTimeDate) {
      effectiveTimeDate = msgInfo.msgHeader.effectiveTimeDate
    } else if (msgInfo.effectiveTimeDate) {
      effectiveTimeDate = msgInfo.effectiveTimeDate
    }
    const ignoreUpdateFromType = [703, 704, 705, 706, 707, 712, 700]
    if (oldMessage && oldMessage.length > 0) {
      if (ignoreUpdateFromType.includes(oldMessage[0].from_type)) {
        return 'ignore'
      }
      console.log('更新音频原消息', msgInfo)
      await window.vm
        .$knex(`${tableName}`)
        .update({
          from_type: msgInfo.fromType,
          msg_order: msgInfo.msgOrder,
          timestamp: msgInfo.timestamp,
          effectiveTimeDate,
          isDecrypt: 1,
          status: 2,
          msg_type: 11,
          msg_body: JSON.stringify(msgInfo.msgBody),
          ref_body: JSON.stringify(msgInfo.refMsgBody),
          req_id: msgInfo.reqId,
        })
        .where({
          msg_id: oldMsgId,
        })
      msgInfo.fromId = oldMessage[0].from_id
      msgInfo.targetId = oldMessage[0].target_id
    }
  }
}
// eslint-disable-next-line no-unused-vars
async function processAudioACK(data) {
  console.log('processAudioACK 音频回执处理', data)
  let lastCurrentAudioIndex = store.state.chat.currentAudio.length - 1
  if (
    !data.msgBody &&
    data.reqId == store.state.chat.currentAudio[lastCurrentAudioIndex].reqId
  ) {
    data.msgBody =
      typeof store.state.chat.currentAudio[lastCurrentAudioIndex].msgBody ==
      'string'
        ? JSON.parse(
          store.state.chat.currentAudio[lastCurrentAudioIndex].msgBody
        )
        : store.state.chat.currentAudio[lastCurrentAudioIndex].msgBody
    data.refMsgBody =
      typeof store.state.chat.currentAudio[lastCurrentAudioIndex].refMsgBody ==
      'string'
        ? JSON.parse(
          store.state.chat.currentAudio[lastCurrentAudioIndex].refMsgBody
        )
        : store.state.chat.currentAudio[lastCurrentAudioIndex].refMsgBody
  }
  let result = ''
  if (data.oldMsgId && data.fromType != 701) {
    result = await updateAudioMessage(data, data.oldMsgId)
  }
  if (result != 'ignore') {
    await store.dispatch(UPDATE_CACHE, data)
  }
}

function willDelayHanle(results, ws) {
  // console.log('是否进入队列：'+store.state.common.willSyncData)
  // 如果在同步数据的时候收到聊天消息，需要把聊天消息存起来，等同步信息结束后再处理聊天消息
  if (store.state.common.willSyncData) {
    // console.log('进入队列', results);
    store.commit(TO_BE_HANDLED_MSGS, { results, ws })
    return true
  }
  return false
}
