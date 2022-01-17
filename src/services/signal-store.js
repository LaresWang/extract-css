/* eslint-disable */
const {
  sqliteUpsert,
  sqliteFindOne,
  sqliteDelete,
} = require('@/services/sqliteDao')
let util = require('./signal-help')
let libsignal = window.libsignal
const toArrayBuffer = require('to-arraybuffer')
const { fromBase64,tobase64 } = require('@/utils')
const { Base64 } = require('js-base64')
const toArraybuffer = require('to-arraybuffer')
const { parse, stringify } = JSON;


/* to do: 

    t_signal_sessions中的存储store会话信息
    创建当前会话信息store，按需查询、更新,
    处理get/put操作,实现一个storage ,在t_signal_preKey、t_signal_sessions中查询、更新,

*/
function SignalProtocolStore() {
  this.store = {}
}

SignalProtocolStore.prototype = {
  Direction: {
    SENDING: 1,
    RECEIVING: 2,
  },

  getIdentityKeyPair: function() {
    return Promise.resolve(this.get('identityKey'))
  },
  getLocalRegistrationId: function() {
    return Promise.resolve(this.get('registrationId'))
  },
  put: function(key, value) {
    if (
      key === undefined ||
      value === undefined ||
      key === null ||
      value === null
    )
      throw new Error('Tried to store undefined/null')
    this.store[key] = value
    // 存储到indexDB?
  },
  get: function(key, defaultValue) {
    if (key === null || key === undefined)
      throw new Error('Tried to get value for undefined/null key')
    if (key in this.store) {
      return this.store[key]
    } else {
      return defaultValue
    }
  },
  remove: function(key) {
    if (key === null || key === undefined)
      throw new Error('Tried to remove value for undefined/null key')
    delete this.store[key]
  },

  isTrustedIdentity: function(identifier, identityKey, direction) {
    if (identifier === null || identifier === undefined) {
      throw new Error('tried to check identity key for undefined/null key')
    }
    if (!(identityKey instanceof ArrayBuffer)) {
      throw new Error('Expected identityKey to be an ArrayBuffer')
    }
    let trusted = this.get('identityKey' + identifier)
    if (trusted === undefined) {
      return Promise.resolve(true)
    }
    return Promise.resolve(
      util.toString(identityKey) === util.toString(trusted)
    )
  },
  loadIdentityKey: function(identifier) {
    if (identifier === null || identifier === undefined)
      throw new Error('Tried to get identity key for undefined/null key')
    return Promise.resolve(this.get('identityKey' + identifier))
  },
  saveIdentity: function(identifier, identityKey) {
    if (identifier === null || identifier === undefined)
      throw new Error('Tried to put identity key for undefined/null key')

    let address = new libsignal.SignalProtocolAddress.fromString(identifier)

    let existing = this.get('identityKey' + address.toString())
    this.put('identityKey' + address.toString(), identityKey)

    if (existing && util.toString(identityKey) !== util.toString(existing)) {
      return Promise.resolve(true)
    } else {
      return Promise.resolve(false)
    }
  },

  /* Returns a prekeypair object or undefined */
  loadPreKey: function(keyId) {
    let res = this.get('25519KeypreKey' + keyId)
    if (res !== undefined) {
      res = { pubKey: res.pubKey, privKey: res.privKey }
    }
    return Promise.resolve(res)
  },
  storePreKey: function(keyId, keyPair) {
    return Promise.resolve(this.put('25519KeypreKey' + keyId, keyPair))
  },
  removePreKey: function(keyId) {
    return sqliteDelete('t_signal_preKey', { keyId }).then(() => {
      return Promise.resolve(this.remove('25519KeypreKey' + keyId))
    })
  },

  /* Returns a signed keypair object or undefined */
  loadSignedPreKey: function(keyId) {
    let res = this.get('25519KeysignedKey' + keyId)
    if (res !== undefined) {
      res = { pubKey: res.pubKey, privKey: res.privKey }
    }
    return Promise.resolve(res)
  },
  storeSignedPreKey: function(keyId, keyPair) {
    return Promise.resolve(this.put('25519KeysignedKey' + keyId, keyPair))
  },
  removeSignedPreKey: function(keyId) {
    return Promise.resolve(this.remove('25519KeysignedKey' + keyId))
  },

  loadSession: function(identifier) {
    return Promise.resolve(this.get('session' + identifier))
  },

  storeSession: async function(identifier, record) {
    let [registrationId, deviceId] = identifier.split('.')
    // 同步更新多条 registrationId&&deviceId 的 record,此处暂时无法同步 udid userId
    // t_signal_keys 表中查询 udid userId
    await sqliteUpsert(
      't_signal_sessions',
      {
        registrationId,
        deviceId: deviceId * 1,
      },
      {
        record,
        sessionId: `session${identifier}`,
      }
    )
    return Promise.resolve(this.put('session' + identifier, record))
  },
  removeSession: function(identifier) {
    return Promise.resolve(this.remove('session' + identifier))
  },
  removeAllSessions: function(identifier = '') {
    for (let id in this.store) {
      if (id.startsWith('session' + identifier)) {
        delete this.store[id]
      }
    }
    return Promise.resolve()
  },
  hasSession(identifier) {
    return !!this.get('session' + identifier)
  },
  getCurrentSessionCipher: function(recipientId,deviceId){
    if (recipientId === undefined || deviceId === undefined || recipientId === null || deviceId === null) {
      throw new Error(`recipientId:${recipientId} ~ deviceId:${deviceId} is required！`)
    }
    return new libsignal.SessionCipher(
      window.vm.signalStore,
      new libsignal.SignalProtocolAddress(recipientId, deviceId * 1)
    )
  },
  utoa(str) {
    return window.btoa(unescape(encodeURIComponent(str)))
  },
  atou(str) {
    return decodeURIComponent(escape(window.atob(str)))
  },
  unpad(paddedData) {
    const paddedPlaintext = new Uint8Array(paddedData);
    let plaintext;

    for (let i = paddedPlaintext.length - 1; i >= 0; i -= 1) {
      if (paddedPlaintext[i] === 0x80) {
        plaintext = new Uint8Array(i);
        plaintext.set(paddedPlaintext.subarray(0, i));
        plaintext = plaintext.buffer;
        break;
      } else if (paddedPlaintext[i] !== 0x00) {
        // throw new Error('Invalid padding');
        return paddedData;
      }
    }
    return plaintext;
  },
  processJSString(string) {
    string = unescape(encodeURIComponent(string));
    var ret = [];
    for (var i = 0; i < string.length; i++) {
      ret.push(string.charCodeAt(i));
    }
    return ret;
  },
  // 单条加密消息解密
  decodeSingleMsg: async function(result) {
    console.log(result)
    if(!result['md']){
      return Promise.resolve()
    }
    console.log('~~~~收到加密消息~~~~', result);
    let md = parse(this.atou(result.md))
    try {
      let { fromId, regId, deviceId, type, data } = md;// 消息发送人fromId的regId deviceId data 使用的preKey
      console.log(
        `发送人：${fromId} registrationId:${regId} 发送的加密消息，待解密:`,
        md
      )
      if (fromId == localStorage.userId) {
        console.log('来自我的其他设备同步发送给当前设备的加密消息')
      }
      let sessionCipher = this.getCurrentSessionCipher(regId, deviceId),
        cipherResult = ''
      if (type === 3) {
        cipherResult = await sessionCipher.decryptPreKeyWhisperMessage(
          // (Buffer.from(data, 'base64')).toString('utf8'),
          fromBase64(data),//ios消息解密
          'binary'
        ) //catch to handle identity key conflict
      } else {
        cipherResult = await sessionCipher.decryptWhisperMessage(
          // (Buffer.from(data, 'base64')).toString('utf8'),
          fromBase64(data),//ios消息解密
          'binary'
        )
      }
      console.log('解密反序列化', this.atou(tobase64(this.unpad(Buffer.from(cipherResult))).toString()))
      //ios消息解密
      let plaintextBase64 =  this.atou(tobase64(this.unpad(Buffer.from(cipherResult))).toString());

      console.log('plaintextBase64',(plaintextBase64))
      let res =JSON.parse(plaintextBase64)
      res['id'] = fromId;
      res['fromId'] = fromId;
      res['reqId'] = result['reqId'];
      res['uniqueCode'] = `${fromId}@${res.targetId}`
      res['msgId'] = result?.msd || String(new Date().getTime());
      res['timestamp'] = result['timestamp'];
      res['msgOrder'] = result['timestamp'];
      res['fromType'] = res['fromType'] * 1;
      res['msgBody'] = typeof res.msgBody =='object'?res.msgBody : parse(res.msgBody);
      res['msgHeader'] = typeof res.msgHeader =='object'? res.msgHeader :parse(res.msgHeader);
      // res['refMsgBody'] = res?.refMsgBody ? parse(res.refMsgBody) : {};
      res['single'] = res?.single ? parse(res.single) : {};
      // 过期时间 
      res['msgHeader'].effectiveTimeDate = res?.msgHeader?.effectiveTimeDate || 7 * 24 * 3600000
      console.log('~~~解密处理结果~~~', res)
      return Promise.resolve(res)
    } catch (error) {
      console.error(error,md)
      this.removePreKey(md.fromId)
      await sqliteDelete('t_signal_preKey', { key: md.fromId })
      return Promise.resolve()
    }
  }
}
window.SignalProtocolStore = SignalProtocolStore

module.exports = SignalProtocolStore