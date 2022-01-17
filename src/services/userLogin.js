import _ from 'lodash'
import toArrayBuffer from 'to-arraybuffer'
import log from 'electron-log'
import UserInfoUtils from '@/utils/UserInfoUtils.js';

import { sqliteUpsert, sqliteFindOne, sqliteFind, sqliteDelete } from '@/services/sqliteDao'
import { fromBase64, tobase64 } from '@/utils'
import { _POST } from '@/utils/axios'
import createSession from '@/services/createSession';

/**
 * 用户登录完成之后数据库相关操作
 * @class userLogin
 */
class userLogin {
  // id： 用户ID
  constructor(id) {
    this.id = id
  }
  /**
   *
   * @param {*} data
   * {
   *    refreshToken
   *    identityData
   *    privKey
   * }
   */
  async saveTokenAndSignalData(data) {
    try {
      let userInfo = await sqliteFindOne('t_userInfo', { id: this.id })
      const doc = {
        refreshToken: data.refreshToken,
      }
      const libsignal = window.libsignal
      const KeyHelper = libsignal.KeyHelper
      const uid = UserInfoUtils.getCurrentUserId();
      if (!userInfo || !userInfo.udid) {
        doc.udid = `didi.pc-${localStorage.getItem(uid + '-UDID')}`
      } else {
        doc.udid = userInfo.udid
      }
      let identityKeyPair
      // 扫码登陆传递秘钥
      if (data.identityData) {
        log.info('解析秘钥')
        identityKeyPair = await this.getIdentityByScan(
          data.identityData,
          data.privKey
        )
        log.info('identityKeyPair ==>>>>', identityKeyPair)
        // 暂时不做多设备, PC端作为独立设备
        doc.identityKeyPub = tobase64(identityKeyPair.pubKey)
        doc.identityKeyPriv = tobase64(identityKeyPair.privKey)
        window.vm.signalStore.put('identityKey', identityKeyPair)
      } else {
        // 独立设备, 生成独立的 IdentityKey
        identityKeyPair = await KeyHelper.generateIdentityKeyPair()
        doc.identityKeyPub = tobase64(identityKeyPair.pubKey)
        doc.identityKeyPriv = tobase64(identityKeyPair.privKey)
        window.vm.signalStore.put('identityKey', identityKeyPair)
      }
      if (
        !(identityKeyPair.privKey instanceof ArrayBuffer) ||
        identityKeyPair.privKey.byteLength != 32 ||
        !(identityKeyPair.pubKey instanceof ArrayBuffer) ||
        identityKeyPair.pubKey.byteLength != 33
      ) {
        log.error('identityKeyPair 校验不通过', identityKeyPair)
      }
      // if (!userInfo && !data.identityData) {
      //   window.vm.$alert('首次登陆必须扫码' , '提示', {
      //     confirmButtonText: '确定',
      //     customClass: 'quitip',
      //     center: true,
      //     callback: () => {
      //       window.vm.$message({
      //         type: 'info',
      //         message: ``
      //       });
      //     }
      //   });
      // }
      // 检查preKey数量
      const accountData = await _POST('/api/signal/api/keys/getKeysCount', {
        userId: this.id,
        udid: doc.udid,
      })

      // 用户加密信息不全 全部重新生成
      if (
        !userInfo ||
        !userInfo.registrationId ||
        !userInfo.identityKeyPub ||
        !userInfo.identityKeyPriv ||
        (userInfo && userInfo.identityKeyPub && userInfo.identityKeyPub != doc.identityKeyPub)
      ) {
        log.info('用户加密信息不全，重新生成上传')
        // if (await window.vm.$knex.schema.hasTable(`t_signal_sessions`)) {
        //   await window.vm.$knex('t_signal_sessions').del()
        // }
        // if (await window.vm.$knex.schema.hasTable(`t_signal_keys`)) {
        //   await window.vm.$knex('t_signal_keys').del()
        // }
        await sqliteDelete('t_signal_keys', {});
        await sqliteDelete('t_signal_preKey', {});
        await sqliteDelete('t_signal_sessions', {});
        
        const registrationId = await KeyHelper.generateRegistrationId()
        doc.registrationId = registrationId
        window.vm.signalStore.put('registrationId', registrationId)
        
        const signedPreKey = await KeyHelper.generateSignedPreKey(
          identityKeyPair,
          registrationId - 1
        )
        doc.signedPreKeyId = signedPreKey.keyId
        doc.signedPreKeypubKey = tobase64(signedPreKey.keyPair.pubKey)
        doc.signedPreKeyprivKey = tobase64(signedPreKey.keyPair.privKey)
        doc.signature = tobase64(signedPreKey.signature)
        log.error(signedPreKey)
        log.error(tobase64(signedPreKey.signature))
        log.error(toArrayBuffer(fromBase64(doc.signature)))
        log.error(doc.signature == toArrayBuffer(fromBase64(doc.signature)))
        window.vm.signalStore.storeSignedPreKey(
          signedPreKey.keyId,
          signedPreKey.keyPair
        )
      } else {
        doc.uuid = userInfo.uuid
        doc.registrationId = userInfo.registrationId
        doc.signedPreKeyId = userInfo.signedPreKeyId
        doc.signedPreKeypubKey = userInfo.signedPreKeypubKey
        doc.signedPreKeyprivKey = userInfo.signedPreKeyprivKey
        doc.signature = userInfo.signature

        log.info(userInfo)
        log.info('put registrationId')
        window.vm.signalStore.put('registrationId', userInfo.registrationId)
        log.info('put identityKey')
        const identityKeyPair = {
          pubKey: toArrayBuffer(fromBase64(userInfo.identityKeyPub)),
          privKey: toArrayBuffer(fromBase64(userInfo.identityKeyPriv)),
        }

        window.vm.signalStore.put('identityKey', identityKeyPair)
        log.info('put storeSignedPreKey')
        const signedPreKeyPair = {
          pubKey: toArrayBuffer(fromBase64(userInfo.signedPreKeypubKey)),
          privKey: toArrayBuffer(fromBase64(userInfo.signedPreKeyprivKey)),
        }
        window.vm.signalStore.storeSignedPreKey(
          userInfo.signedPreKeyId,
          signedPreKeyPair
        )
        await this.restoreSession()
      }

      // 发送数据到服务器
      const sendServerJson = {
        registrationId: doc.registrationId,
        udid: doc.udid,
        userId: this.id,
        preKeys: {
          identityKey: doc.identityKeyPub,
          signedPreKey: {
            keyId: doc.signedPreKeyId,
            publicKey: doc.signedPreKeypubKey,
            signature: doc.signature,
          },
        },
      }
      if (
        accountData.data < 30 ||
        !userInfo ||
        !userInfo.registrationId ||
        !userInfo.identityKeyPub ||
        !userInfo.identityKeyPriv
      ) {
        const signedPreKey = await KeyHelper.generateSignedPreKey(
          identityKeyPair,
          doc.registrationId - 1
        )
        doc.signedPreKeyId = signedPreKey.keyId
        doc.signedPreKeypubKey = tobase64(signedPreKey.keyPair.pubKey)
        doc.signedPreKeyprivKey = tobase64(signedPreKey.keyPair.privKey)
        doc.signature = tobase64(signedPreKey.signature)
        log.error(signedPreKey)
        log.error(tobase64(signedPreKey.signature))
        log.error(toArrayBuffer(fromBase64(doc.signature)))
        log.error(doc.signature == toArrayBuffer(fromBase64(doc.signature)))
        window.vm.signalStore.storeSignedPreKey(
          signedPreKey.keyId,
          signedPreKey.keyPair
        )
        sendServerJson.preKeys['signedPreKey'] = {
          keyId: doc.signedPreKeyId,
          publicKey: doc.signedPreKeypubKey,
          signature: doc.signature,
        };
        const userPreKeys = await this.createPreKey()
        sendServerJson.preKeys['preKeys'] = userPreKeys
      } else {
        sendServerJson.preKeys['preKeys'] = []
        await this.restorePreKey()
      }
      let info = await _POST('/api/signal/api/keys/setKeys', {}, sendServerJson)
      info = info.data
      const devicesIndex = _.findIndex(info.devices, {
        registrationId: doc.registrationId,
      })
      log.info('devicesIndex', doc.registrationId, devicesIndex, info);
      doc.deviceId = info.devices[devicesIndex].id
      log.info('登录完成记录自己的信息', doc, this.id)
      userInfo = await sqliteUpsert('t_userInfo', { id: this.id }, doc)
      // 与自己其他设备建立回话
      const selfSession = new createSession(localStorage.userId);
      const selfAccount = await selfSession.getSessions();
      if (selfAccount.identityKey != doc.identityKey) {
        await sqliteDelete('t_signal_keys', { key: localStorage.userId });
        await selfSession.getSessions();
      }
      return userInfo
    } catch (err) {
      log.info(`保存 AuthToken 失败`, err)
      throw new Error(`保存 AuthToken 失败: ${err}`);
    }
  }
  getUDID() {
    let S4 = () => {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    }
    return S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4()
  }

  async restorePreKey() {
    try {
      const preKeyList = await sqliteFind('t_signal_preKey', {})
      for (let item of preKeyList) {
        let keyPair = {
          pubKey: toArrayBuffer(fromBase64(item.keyPairpubKey)),
          privKey: toArrayBuffer(fromBase64(item.keyPairprivKey)),
        }
        window.vm.signalStore.storePreKey(item.keyId, keyPair)
      }
      log.info('批量恢复prekey')
    } catch (err) {
      console.error('批量恢复prekey失败', err)
    }
  }

  async restoreSession() {
    try {
      const sessionList = await sqliteFind('t_signal_sessions', {})
      for (let item of sessionList) {
        let address = new window.libsignal.SignalProtocolAddress(
          Number(item.registrationId),
          Number(item.deviceId)
        )
        let { indexInfo } = (Object.values(JSON.parse(item.record).sessions))[0];
        const remoteIdentityKey = indexInfo.remoteIdentityKey
        window.vm.signalStore.saveIdentity(address.toString(), remoteIdentityKey)
        window.vm.signalStore.storeSession(address.toString(), item.record)
      }
      log.info('批量恢复 Session')
    } catch (err) {
      console.error('批量恢复Session失败', err)
    }
  }

  async createPreKey() {
    try {
      const libsignal = window.libsignal
      const KeyHelper = libsignal.KeyHelper
      let userPreKeys = []
      let listOfPreKeysPromise = []
      const preKeyCounts = await window.vm
        .$knex('t_signal_preKey')
        .count('keyId as id')
      for (let i = preKeyCounts[0].id + 1; i < preKeyCounts[0].id + 101; i++) {
        listOfPreKeysPromise.push(await KeyHelper.generatePreKey(i))
      }
      let saveOfPreKeysPromise = []
      const preKeys = await Promise.all(listOfPreKeysPromise)
      preKeys.forEach((preKey) => {
        // 发送到服务器
        userPreKeys.push({
          keyId: preKey.keyId,
          publicKey: tobase64(preKey.keyPair.pubKey),
        })
        window.vm.signalStore.storePreKey(preKey.keyId, preKey.keyPair)
        saveOfPreKeysPromise.push(
          window.vm.$knex('t_signal_preKey').insert({
            keyId: preKey.keyId,
            keyPairpubKey: tobase64(preKey.keyPair.pubKey),
            keyPairprivKey: tobase64(preKey.keyPair.privKey),
            createTime: new Date().getTime(),
          })
        )
      })
      await Promise.all(saveOfPreKeysPromise)
      return userPreKeys
    } catch (err) {
      console.error('批量创建prekey失败', err)
    }
  }

  async getIdentityByScan(identityKeyPairBase64, privKey) {
    try {
      const provisioningCipher = new window.libsignal.ProvisioningCipher()
      const identityKeyPairObj = JSON.parse(window.atob(identityKeyPairBase64))
      console.log('传过来的identityKeyPairObj', identityKeyPairObj)
      const publicKey = toArrayBuffer(fromBase64(identityKeyPairObj.pub_key))
      const body = toArrayBuffer(fromBase64(identityKeyPairObj.result))
      const identityKeyPairStr = await provisioningCipher.decrypt({
        publicKey,
        body,
        privKey,
      })
      const identityKeyPair = JSON.parse(
        window.atob(tobase64(Buffer.from(identityKeyPairStr).toString()))
      )
      log.info('扫码获取身份秘钥 : ', identityKeyPair)
      return {
        pubKey: toArrayBuffer(fromBase64(identityKeyPair.myPublicKey)),
        privKey: toArrayBuffer(fromBase64(identityKeyPair.myPrivateKey)),
      }
    } catch (err) {
      console.error(err)
    }
  }
}

export default userLogin
