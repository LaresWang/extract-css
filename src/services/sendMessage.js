import { v4 as uuidv4 } from 'uuid'
// import toArrayBuffer from 'to-arraybuffer'
// import { tobase64 } from '@/utils'
import { SET_CHAT, DEL_DRAF_LIST } from '@/store/types'
import { sendMessageQueue } from '@/services/messageQueue'
import store from '@/store'
import createSession from '@/services/createSession'
import Message from '@/services/message'
import SQLUtils from '@/components/db/sqlite.js'
import UserInfoUtils from '@/utils/UserInfoUtils.js'
import { sqliteFindOne, sqliteUpsert } from '@/services/sqliteDao'
// import { Base64 } from 'js-base64';
let util = require('./signal-help')
import { cloneDeep } from 'lodash'
class sendmessage {
  constructor() {}
  async autoSendMessage(newOrResendMsgObj) {
    // 同一消息reqId 发送给好友/自己其他设备
    let params = cloneDeep(newOrResendMsgObj)
    if (!params['reqId']) {
      params['reqId'] = uuidv4()
    }
    try {
      // 非加密提示或撤回消息不加密
      if (sessionStorage.getItem('isSign') != 1 || params.targetType != 1) {
        this.sendNormalMessage(params)
        return Promise.resolve()
      } else {
        let sendToMyDevice = []
        const selfSession = new createSession(localStorage.userId)
        const myOtherAccount = await selfSession.getSessions()
        if (myOtherAccount?.identityKey && myOtherAccount?.devices?.length) {
          sendToMyDevice = await this.sendEncryptedMessage(
            cloneDeep(params),
            myOtherAccount,
            true
          )
          console.log(
            '给自己app扫码的账户发送 加密消息/内容',
            myOtherAccount,
            sendToMyDevice
          )
        } else {
          console.log(
            '查询到自己的其他设备信息不全,不同步加密消息',
            myOtherAccount
          )
        }
        const session = new createSession(params.id || params.targetId) //重发 无id
        const account = await session.getSessions()
        if (account?.identityKey && account?.devices?.length) {
          let sendToMyFriendDevice = await this.sendEncryptedMessage(
            params,
            account,
            false
          )
          console.log('mds集合', [...sendToMyDevice, ...sendToMyFriendDevice])
          await sendMessageQueue.push({
            sendType: 'signal',
            sendTime: new Date().getTime(),
            myMds: [...sendToMyDevice],
            mds: [...sendToMyFriendDevice],
            reqId: params.reqId,
          })
        } else {
          console.log('查询到好友的其他设备信息不全,不发送加密消息', account)
          await this.sendNormalMessage(params)
        }
        return Promise.resolve()
      }
    } catch (err) {
      console.error('分流处理加密/非加密发送消息失败', err)
    }
  }
  // 普通消息
  async sendNormalMessage(params, isSendToMyOtherDevices) {
    try {
      const netStatus = store.state.common.netStatus;
      const socketStatus = store.state.common.socketStatus;
      if (params.msgHeader && typeof params.msgHeader == 'string') {
        params.msgHeader = JSON.parse(params.msgHeader)
      }
      if (params.msgBody && typeof params.msgBody == 'string') {
        params.msgBody = JSON.parse(params.msgBody)
      }
      if (params.refMsgBody && typeof params.refMsgBody == 'string') {
        params.refMsgBody = JSON.parse(params.refMsgBody)
      }
      params.msgHeader = Object.assign({}, params?.msgHeader || {}, {
        pubKey: null, //this.publickKey,
        version: null,
        msgSeqNo: 1,
        msgSeqTotal: 1,
        effectiveTime: -1,
        sourceSite: null,
        language: window.vm.$i18n.locale,
        sign: null,
        signType: null,
        Authorization: localStorage.accessToken,
      })
      let textOrigin = params.textOrigin||params.text || params.msgBody.text;
      const messagePre = new Message(params.targetId)
      //查询最大的msgOrder
      let maxOrder = await SQLUtils.findMaxMsgOrder(params.targetId)
      // http://showdoc.vonechain.com:8801/web/#/50?page_id=369
      params.msgHeader.effectiveTimeDate = await SQLUtils.getMsgExpireTime(
        params.targetId,
        params.targetType
      )
      params.msgHeader.effectiveTime =
        params.msgHeader.effectiveTimeDate - new Date().getTime()
      //todo 重发消息逻辑待定  isReSend => 重新发送
      const insertObj = {
        req_id: params.reqId,
        target_type: params.targetType,
        target_id: params.targetId,
        from_type: params.fromType,
        from_id: params.fromId,
        msg_type: params.msgType,
        unique_code: params.uniqueCode,
        text: textOrigin,
        msg_order: params.maxOrder ? params.maxOrder : maxOrder,
        timestamp: new Date().getTime() + '',
        status: 1, //1：发送中 2：发送完成 -1 发送失败  3已读
        msg_body: JSON.stringify(params.msgBody),
        ref_body: JSON.stringify(params.refMsgBody),
        msg_header: JSON.stringify(params.msgHeader),
        isDecrypt: 1, //自己发的消息，标记解密成功,
        effectiveTimeDate: params.msgHeader.effectiveTimeDate,
        fromResend: params.fromResend,
      }
      if (params.msgType == 25) {
        //如果是自己发的引用的消息，去表里查询此条引用的消息
        const quotemsgObj = await SQLUtils.findQuotMsg(
          params.targetId, //被发送人的userid
          params.targetType,
          params.msgBody.msgs[0].msgId,
          params.msgBody.msgs[0].reqId
        )
        if (quotemsgObj) {
          params.quotemsgObj = quotemsgObj
          params.quotemsgObj.msg_body = params.quotemsgObj.msgbody
          params.quotemsgObj.ref_body = params.quotemsgObj.refMsgBody
          params.quotemsgObj.showfile = false //视频文件的展示tag
        }
      }
      let setchat = {
        ...params,
        sendStatus: 1,
        text: textOrigin,
        fromIcon: UserInfoUtils.getCurrentUserImg(),
        fromName: UserInfoUtils.getCurrentUserNickName(),
      }
      if (params.targetType == 2) {
        await SQLUtils.findGroupMemberName(setchat)
      }
      if (netStatus == 'offline') {
        setchat.sendStatus = -1
        insertObj.status = -1
      }
      //1，先渲染聊天窗口，防止网络慢的时候出现卡顿
      if (
        params.msgType != 24 &&
        params.msgType != 11 &&
        !isSendToMyOtherDevices
      ) {
        store.commit(SET_CHAT, setchat)
      }
      // if (params.msgType == 11) {
      //   if (netStatus == 'offline') {
      //     if (params.fromType == 701) {
      //       params.fromType = 700
      //     }
      //     if (params.fromType == 702) {
      //       return
      //     }
      //   }
      //   store.commit(SET_CURRENT_AUDIO, params)
      //   if (
      //     netStatus == 'offline' ||
      //     params.fromType == 700 ||
      //     params.fromType == 712 ||
      //     params.fromType == 705 ||
      //     (netStatus == 'offline' && params.fromType == 706)
      //   ) {
      //     let result = await messagePre.updateSuspendAudioMessage(params)
      //     if (result != 'ignore') {
      //       setchat.fromType = params.fromType
      //       setchat.fromId = params.fromId
      //       setchat.targetId = params.targetId
      //       store.commit(SET_CHAT, setchat)
      //     }
      //     return Promise.resolve(setchat)
      //   }
      // }
      params.msgBody = JSON.stringify(params.msgBody)
      params.refMsgBody = JSON.stringify(params.refMsgBody)
      params.msgHeader = JSON.stringify(params.msgHeader)
      let timer
      if (params.msgType == '1') {
        timer = 20
      }
      if (params.msgType == '2') {
        timer = 60
      }
      if (!timer) {
        timer = 120
      }
      if (
        (params.msgType != 11 || params.fromType == 701) &&
        !isSendToMyOtherDevices
      ) {
        await messagePre.insertMessage(insertObj)
      }
      delete params.textOrigin
      if ((netStatus != 'offline' || socketStatus === "online") && !isSendToMyOtherDevices) {
        await sqliteUpsert(
          't_messages',
          {
            req_id: insertObj.req_id,
            tableName: `m_${params.targetId}`,
          },
          {
            ...insertObj,
            time: timer,
          }
        )
        if (!params.isSignal) {
          await sendMessageQueue.push(params)
        }
      }
      //如果存过草稿draflist,则删除
      store.commit(DEL_DRAF_LIST, params)
      return Promise.resolve(params)
    } catch (err) {
      console.log('发送普通消息失败', err)
    }
  }
  // 发送加密消息
  async sendEncryptedMessage(p, account, isSendToMyOtherDevices) {
    // 加密前数据处理
    let params = await this.sendNormalMessage(
      { ...p, isSignal: true },
      isSendToMyOtherDevices
    )
    try {
      let list = []
      console.log('这里是发送加密消息', account, params)
      const userInfo = await sqliteFindOne('t_userInfo', {
        id: params.fromId,
      })

      for (let item of account.devices) {
        item.registrationId = Number(item.registrationId)
        item.deviceId = Number(item.deviceId)
        const options = {
          ud: isSendToMyOtherDevices ? localStorage.userId : params.id || params.targetId, // 接收人用户ID
          et: item.udid, //equipment 接收人用户设备唯一标识 就是UDID didi.pc-
          deviceId: item.deviceId, // 接收人设备ID
          regId: item.registrationId, // 接收人注册ID
          // http://showdoc.vonechain.com:8801/web/#/50?page_id=240
          // "timestamp"
          // msd:'',
        }
        if (params.msgHeader && typeof params.msgHeader == 'string') {
          params.msgHeader = JSON.parse(params.msgHeader)
        }
        if (params.msgBody && typeof params.msgBody == 'string') {
          params.msgBody = JSON.parse(params.msgBody)
        }
        // params 原始未加密消息数据结构
        const encryptOptions = {
          targetType: params.targetType,
          targetId: params.targetId,
          fromType: params.fromType,
          msgType: params.msgType,
          msgBody: params.msgBody,
          msgHeader: params.msgHeader,
        }
        let sessionCipher = window.vm.signalStore.getCurrentSessionCipher(
          item.registrationId, //接收方
          item.deviceId //接收方
        )
        let ciphertext = await sessionCipher.encrypt(
          // tobase64(Buffer.from(encryptOptions).toString())
          // string = unescape(encodeURIComponent(string))
          util.toArrayBuffer(
            unescape(encodeURIComponent(JSON.stringify(encryptOptions)))
          ) //binary
        )
        let md = {
          fromId: isSendToMyOtherDevices ? localStorage.userId : params.fromId, // 发送人
          deviceId: userInfo.deviceId, // 发送人设备ID
          regId: userInfo.registrationId, //发送方的 registrationId
          type: ciphertext.type, //解密方式 1->decryptWhisperMessage 3->decryptPreKeyWhisperMessage
          data: this.utoa(ciphertext.body),
          // data: Base64.encode(ciphertext.body),
        }
        options.md = this.utoa(JSON.stringify(md))
        list.push(options)
        // console.warn(this.atob(options.md))
        console.log('md:', JSON.parse(this.atou(options.md)))
      }
      // if(isSendToMyOtherDevices){
      //   console.log('给自己app扫码的账户发送成功', list)
      // }
      // console.log('准备发送加密消息成功', list)
      // const sendTime = new Date().getTime()
      // await Ws.sendMessage({
      //   sendType: 'signal',
      //   sendTime,
      //   mds: list,
      //   reqId: reqId
      // });
      return Promise.resolve(list)
      // await sendMessageQueue.push({
      //   sendType: 'signal',
      //   sendTime,
      //   mds: list,
      //   reqId: params.reqId,
      // })
    } catch (err) {
      console.error('发送加密消息失败, 再次尝试发送非加密消息', err)
      params.isSignal = false;
      await this.sendNormalMessage(params)
    } finally {
      console.log('发送消息完成')
    }
  }
  utoa(str) {
    return window.btoa(str)
  }
  atou(str) {
    return window.atob(str)
  }
  formatUnsendMessage(data) {
    return {
      id: data.target_id,
      reqId: data.req_id ? data.req_id : '',
      targetType: data.target_type,
      targetId: data.target_id,
      fromType: data.from_type,
      fromId: data.from_id,
      msgType: data.msg_type,
      uniqueCode: data.unique_code,
      maxOrder: data.msg_order,
      msgBody: JSON.parse(data.msg_body),
      refMsgBody: JSON.parse(data.ref_body),
      msgHeader: JSON.parse(data.msg_header),
    }
  }
}

export default sendmessage
