import WebSocket from 'websocket'
import moment from 'moment'
import store from '@/store'
import { SOCKET_STATUS, NET_STATUS } from '@/store/types'
import { getCurrentTime, isFunction } from '@/utils'
import {
  getCurrentUserId,
  getSocketUDID,
  logoutAndAlertMessage,
  reportException,
  formatSendMessage,
} from '../utils/socketTools'
import { saveReport } from '@/services/uploadRecord'
import { getAccessToken } from '@/utils/axios'

const w3cwebsocket = WebSocket.w3cwebsocket;
const versionCode = require('../../package.json').version_code

export { logoutAndAlertMessage, reportException, getSocketUDID }

const AUTO_RECONNECT_TIME = 10000;
const LOGOUT_CODES = ['4001', '4004', '4002', '4006', '4003', '4007']
const CALLBACKNAMES = [
  'open',
  'error',
  'close',
  'message',
  'beforeClose',
  'beforeReconnect',
]

class WS{
  constructor(){
    this.whost = process.env.VUE_APP_WSHOST;
    this.fromId = '';
    window.socket = null;
    this._reconnectflg = true;
    this.lockReconnect = false;
    this.reTimer = '';
    this.isConnecting = false;
    this.connectDoneCallbacks = [];
    CALLBACKNAMES.forEach(name=>{
      this[name+'Callback']=[];
    })
  }
  setUp(options = {}) {
    CALLBACKNAMES.forEach((name) => {
      if (isFunction(options[name])) {
        this[name + 'Callback'].push(options[name])
      }
    })
    return this
  }

  executeCallback(name, ...rest) {
    this[name + 'Callback'].forEach((fn) => {
      fn(...rest)
    })
  }

  genWsUrl() {
    const uid = getCurrentUserId()
    let lan = localStorage.lang || 'zh-cn';
    //eslint-disable-next-line
    return `${this.whost}?UDID=${localStorage.getItem(
      uid + '-UDID'
    )}&token=${
      localStorage.accessToken
    }&userId=${uid}&platformType=PC&language=${lan}&version=${versionCode}&clientType=pc&clientPlatform=nl&PCPlatform=${
      process.platform === 'darwin' ? 'Mac' : 'Windows'
    }`
  }
  registerEvent() {
    window.socket.onopen = this.openHandler.bind(this)
    window.socket.onclose = this.closeHandler.bind(this)
    window.socket.onerror = this.errHandler.bind(this)
    window.socket.onmessage = this.messageHandler.bind(this)
  }
  openHandler(event) {
    console.info('socket Has Opened', event)
    this.isConnecting = false;
    // sendReport(moment().format("YYYY-MM-DD"));
    this.updateNetStatus('online');
    this.updateSocketStatus('online');
    this.executeCallback('open', event, this);

    this.connectDoneCallbacks.forEach(cb=>{
      isFunction(cb) && cb(this);
    })
    this.connectDoneCallbacks = [];
    window.socket.send(JSON.stringify({event: "single.c.history"}));
  }
  closeHandler(event) {
    console.error('[socket closed]:', moment().format('yyyy-MM-DD hh:mm:ss'), event, this._reconnectflg)
    this.isConnecting = false;
    if (window.socket) {
      window.socket.close();
    }
    window.socket = null
    this.executeCallback('close', event, this)

    if (LOGOUT_CODES.includes(String(event.code))) {
      this._reconnectflg = false
      logoutAndAlertMessage(String(event.code),event?.reason)
    } else if (String(event.code) == '4005') {
      this._reconnectflg = false
    } else if (this._reconnectflg) {
      this.reConnect()
    } else {
      //处理退出后不关闭app，再登录的情况
      this._reconnectflg = true
    }
    // this.init_finished = false;
  }
  errHandler(event) {
    console.error('socket errored:', event)
    if (event.target.readyState == 3 && !event.code) {
      this.whost = this.whost == process.env.VUE_APP_WSHOST ? process.env.VUE_APP_WSHOST_BK : process.env.VUE_APP_WSHOST;
    }
    this.executeCallback('error', event, this)
    this.isConnecting = false;
    this.reConnect();
  }
  async messageHandler(event) {
    try {
      const data = JSON.parse(event.data)
      saveReport(data || {}, 1)
      this.executeCallback('message', data, this)
    } catch (err) {
      reportException(err)
      console.error('WS onMessage', err, event)
    }
  }
  async init(cb) {
    if (!store.state.common.loginfinished && !store.state.common.willSyncData) {
      console.log(4);
      //如果登录没有完成，则不初始化ws
      console.error('如果登录没有完成，则不初始化ws')
      return
    }
    this.fromId = getCurrentUserId();

    if(cb && !this.connectDoneCallbacks.includes(cb)){
      this.connectDoneCallbacks.push(cb);
    }

    try {
      console.log('window.socket', window.socket, this.isConnecting)
      if (this.isConnecting || !!window.socket && window.socket.readyState == 0) {
        console.warn('正在连接，请勿重复连接')
      } else if (!this.isConnecting && !window.socket){
        this.isConnecting = true;
        getAccessToken().then(()=>{
          window.socket = new w3cwebsocket(this.genWsUrl())
          this.registerEvent()
        }, e => {
          console.log('getTokenError', e)
          this.isConnecting = false;
          if(e?.message==="Network Error"){
            this.updateNetStatus('offline');
          }
          setTimeout(()=>{
            this.reConnect();
          },AUTO_RECONNECT_TIME)
        })
        
      } else if(window.socket && window.socket.readyState == 1) {
        console.warn('已连接，请勿重复连接')
        this.updateSocketStatus('online')
        return window.socket;
      }
      // window.socket = new WebSocket(`ws://test01.zhidianjh.com:50001`);

    } catch (err) {
      reportException(err)
      console.error('WS init Exception:', err)
    }
  }
  updateSocketStatus(status) {
    store.dispatch(SOCKET_STATUS, {
      socketStatus: status,
    })
  }
  updateNetStatus(status) {
    store.dispatch(NET_STATUS, {
      netStatus: status
    });
  }
  async sendMessage(message) {
    if (window.socket && window.socket.readyState == 1) {
      // $raw属性值为true的时候不对消息进行处理
      if (message.$raw) {
        delete message.$raw
      } else {
        formatSendMessage(message)
        this.updateSocketStatus('online')
        delete message.type
      }
      //message 加密、非加密数据结构
      window.socket.send(JSON.stringify(message))
    } else {
      this.reConnect(()=>{
        this.sendMessage(message);
      });
    }
  }

  reConnect(cb) {
    // this.updateSocketStatus('reconn')
    console.log(
      '当前socket状态',
      window.socket,
      moment().format('yyyy-MM-DD hh:mm:ss')
    )

    if(cb && !this.connectDoneCallbacks.includes(cb)){
      this.connectDoneCallbacks.push(cb)
    }
    if (window.socket && window.socket.readyState == 0) {
      console.log(
        'socket 正在尝试重新建立连接, 本次不发起重连',
        moment().format('yyyy-MM-DD hh:mm:ss')
      )
      return
    }
    if (window.socket && window.socket.readyState == 1) {
      this.updateSocketStatus('online')
      console.log('socket 连接正常', moment().format('yyyy-MM-DD hh:mm:ss'))
      return 'online';
    } else {
      if (this.lockReconnect) {
        return
      }
      this.updateSocketStatus('reconn')
      this.lockReconnect = true
      this.reTimer && clearTimeout(this.reTimer)
      this.reTimer = setTimeout(() => {
        this.lockReconnect = false
        console.log(
          'socket 连接断开，正在尝试重新建立连接',
          moment().format('yyyy-MM-DD hh:mm:ss')
        )
        this.executeCallback('beforeReconnect', this)
        if (window.socket) {
          window.socket?.close && window.socket.close();
          // this._reconnectflg = false;  // 这里close不需要走reConnect()，下面init会进行重连操作
        }
        this.init(cb)
      }, 5000)
      return 'online';
    }
  }

  close(reconnectflg) {
    this.executeCallback('beforeClose', this)
    console.error('socket 主动连接断开', reconnectflg, getCurrentTime())
    if (reconnectflg != undefined || reconnectflg != '')
      this._reconnectflg = reconnectflg
    try {
      console.log('socket 主动连接断开',window.socket)
      if (window.socket) {
        window.socket?.close();
      }
      window.socket = null
      console.error('socket 已经关闭！')
    } catch (err) {
      reportException(err)
      console.error('socket close:', err)
    }
  }

  async getManyGroupMessage(groupId) {
    const udid = await getSocketUDID()
    const obj = {
      event: 'g.c.gmsg.tp100',
      m: 'PC',
      ud: getCurrentUserId(),
      td: groupId,
      em: udid,
      type: 'ws',
    }
    this.sendMessage(obj)
  }
}

export default new WS()
