import store from '@/store'
import { UPDATE_CHAT_SEND_STATUS } from '@/store/types'
import {
  sqliteUpdate,
  sqliteQueryBySQL,
} from '@/services/sqliteDao'
import { getCurrentUserId, reportException } from '../utils/socketTools'
import { getAccessToken } from '@/utils/axios'

class HeartBeat {
  constructor(ws, options = {}) {
    this.ws = ws
    // this.socket = ws.socket
    this.time_interval = options.time || 30000
    this.connect = null
  }

  // 检测心跳
  heartbeat() {
    this.connect = setInterval(async () => {
      this.sendHeartbeat()
      // 心跳检查发送失败状态
      await sqliteQueryBySQL('update t_messages set time=time-10')
      doSendFail()
      // 刷新Token
      let loginInfo = localStorage.getItem('loginInfo')
      loginInfo = JSON.parse(loginInfo)
      if (
        Number(loginInfo.expiresAt) <=
        new Date().getTime() + 1000 * 60 * 10
      ) {
        console.log('auth token 即将失效, 主动刷新！')
        await getAccessToken()
      }
    }, this.time_interval)
  }

  async fristSend() {
    //sokect一旦打开，立即先发送心跳订阅,注意这一定是第一步
    this.sendHeartbeat()
    this.subscribe()
    //发送服务器最新信息的更新请求
    const request = {
      platform: 'electron',
      event: 'chat.client.retrievedata',
      ud: getCurrentUserId(), // 用户当前ID
      m: 'PC',
      et: {},
    }
    let searchRet = await window.vm
      .$knex('t_news_version')
      .whereNotIn('name',['gtmn', 'utn', 'gtn', 'lastModify'])
      .andWhereNot('name', 'like', 'msgType%')
      .select('name', 'version')
    if (searchRet && searchRet.length > 0) {
      let etjson = {}
      searchRet.forEach((item) => {
        etjson[item.name] = item.version
      })
      request.et = etjson
      //不要删除，测试使用
      // request.et = { // 先放所有
      //   "utn": 0, // 用户当前最大版本号, 默认0
      //   "gtn": 0, // 群当前最大版本号, 默认0
      //   "gtmn": 0, // 群成员当前最大版本号, 默认0
      //   "pkn": 0, // 公钥 当前最大版本号, 默认0
      //   "mdn": 0, // 会话列表 当前最大版本号, 默认0
      //   "gtmcn": 0  // 群成员本人权限 当前最大版本号, 默认0
      // }
    } else {
      request.et = {
        // 先放所有
        // utn: 0, // 用户当前最大版本号, 默认0
        // gtn: 0, // 群当前最大版本号, 默认0
        // gtmn: 0, // 群成员当前最大版本号, 默认0
        pkn: 0, // 公钥 当前最大版本号, 默认0
        mdn: 0, // 会话列表 当前最大版本号, 默认0
        gtmcn: 0, // 群成员本人权限 当前最大版本号, 默认0
      }
    }
    window.socket.send(JSON.stringify(request))
  }

  subscribe() {
    const uid = getCurrentUserId()
    const request = {
      type: 'ws',
      event: 'chat.client.subscribe',
      platformType: 'PC',
      UDID: localStorage.getItem(uid + '-UDID'),
      fromId: uid,
      data: {},
    }
    this.ws.sendMessage(request)
  }

  async sendHeartbeat() {
    const request = {
      event: 'chat.client.heartbeat',
      fromId: getCurrentUserId(),
      data: {},
      type: 'ws',
    }
    try {
      if (window.socket.readyState == 1 && this.ws._reconnectflg) {
        this.ws.sendMessage(request)
      } else if (this.ws._reconnectflg) {
        this.ws.reConnect()
      }
      // if (this.init_finished) {
      // 发送心跳后更新会话列表 的最后版本时间
      // await window.vm.$knex("t_news_version")
      // .where({ name: 'mdn' })
      // .update({ 'version': new Date().getTime() + '' });
      // }
    } catch (err) {
      console.error('WS errored:', err)
      reportException(err)
      this.ws.reConnect()
    }
  }
}

export default HeartBeat

const doSendFail = async () => {
  try {
    const list = await sqliteQueryBySQL(`select req_id as reqId,
      msg_id as msgId,
      target_type as targetType,
      target_id as targetId,
      from_type as fromType,
      timestamp,
      msg_order as msgOrder,
      unique_code as uniqueCode,
      msg_body as msgBody,
      ref_body as refMsgBody,
      msg_type as msgType,
      status as sendStatus,
      read_status as readStatus,
      from_type as fromType,
      text,
      from_id as fromId,
      isDecrypt as isDecrypt,
      tableName as tableName
      from t_messages where time <= 0`)
    if (list && list.length) {
      for (let item of list) {
        await sqliteUpdate(
          item.tableName,
          {
            req_id: item.reqId,
          },
          {
            status: -1,
          }
        )
        await sqliteUpdate('t_messages', {
          req_id: item.reqId,
        },{
          status: -1,
        })
        store.dispatch(UPDATE_CHAT_SEND_STATUS, {
          ...item,
          sendStatus: -1,
        })
      }
    }
  } catch (err) {
    reportException(err)
    console.error(`消息过期处理失败`, err)
  }
}
