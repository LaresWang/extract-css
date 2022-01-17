import log from 'electron-log'
import toArrayBuffer from 'to-arraybuffer'
import { sqliteUpsert, sqliteFindOne, sqliteDelete } from '@/services/sqliteDao'
import { fromBase64 } from '@/utils'
import { _POST } from '@/utils/axios'

class createSession {
  constructor(id) {
    this.id = id
  }
  async upsertUserAccount() {
    let accountObj = await sqliteFindOne('t_signal_keys', {
      key: this.id,
    });
    if(accountObj?.value&&JSON.parse(accountObj.value)?.identityKey){
      return Promise.resolve(JSON.parse(accountObj.value))
    }else{//实时查询账户prekey状态
      try {
        let account = await _POST('/api/signal/api/keys/getKeys', {
          userId: this.id,
          udid: '*',
        })
        if (account.code != 200 || !account.data) {
          log.info('该用户不存在加密信息', account)
          return Promise.resolve()
        } else {
          account = account.data
          await sqliteUpsert(
            't_signal_keys',
            {
              key: this.id,
            },
            {
              value: JSON.stringify(account),
            }
          )
          return Promise.resolve(account)
        }
      } catch (err) {
        console.error('获取/保存用户公钥失败', err)
        return Promise.resolve()
      }
    }
  }
  // 与好友创建会话 or 与自己其他设备创建会话
  async getSessions() {
    try {
      let account = await this.upsertUserAccount()
      log.info('account', account)
      if (!account) {
        log.info('该用户不存在加密信息')
        return Promise.resolve()
      } else {
        let list = account?.devices || [];
        if (this.id == localStorage.userId) {
          let userInfo = await sqliteFindOne('t_userInfo', { id: localStorage.userId });
          list = list.filter(item => item.deviceId != userInfo.deviceId && item.registrationId != userInfo.registrationId);
          console.log('自己的账户设备信息',account);
        }
        console.log(list);
        for (let item of list) {
          if (!item.preKey) {
            continue
          }
          item.registrationId = Number(item.registrationId)
          let address = new window.libsignal.SignalProtocolAddress(
            item.registrationId,
            Number(item.deviceId)
          )
          let isopen = window.vm.signalStore.hasSession(address.toString())
          if (!isopen) {
            const sessionBuilder = new window.libsignal.SessionBuilder(
              window.vm.signalStore,
              address
            )

            const options = {
              registrationId: Number(item.registrationId),
              identityKey: toArrayBuffer(fromBase64(account.identityKey)),
              signedPreKey: {
                keyId: Number(item.signedPreKey.keyId),
                publicKey: toArrayBuffer(fromBase64(item.signedPreKey.publicKey)),
                signature: toArrayBuffer(fromBase64(item.signedPreKey.signature)),
              },
              preKey: {
                keyId: Number(item.preKey.keyId),
                publicKey: toArrayBuffer(fromBase64(item.preKey.publicKey)),
              },
            }
            // log.info('当前store信息', window.vm.signalStore)
            const userInfo = await sqliteFindOne('t_userInfo', { id: localStorage.getItem('userId') });
            const test = await sessionBuilder.verifyOwnPreKey(toArrayBuffer(fromBase64(userInfo.identityKeyPub)),
              {
                publicKey: toArrayBuffer(fromBase64(userInfo.signedPreKeypubKey)),
                signature: toArrayBuffer(fromBase64(userInfo.signature)),
              });
            console.log('=========');
            console.log('====', test, '=====');
            console.log('=========');
            await sessionBuilder.processPreKey(options)
            log.info(`与用户:${this.id} 的设备编号: ${item.deviceId} 成功建立回话`)
            await sqliteUpsert(
              't_signal_sessions',
              {
                udid: item.udid,
                userId: this.id,
              },
              {
                sessionId: `session${address.toString()}`,
                registrationId: item.registrationId,
                deviceId: item.deviceId,
                record:
                  window.vm.signalStore.store[`session${address.toString()}`],
              }
            )

          }
        }
        if (this.id == localStorage.userId) {
          return Promise.resolve(Object.assign({}, account, { devices: list }))
        } else {
          return Promise.resolve(account)
        }
      }
    } catch (err) {
      console.error('创建回话失败', err)
      await sqliteDelete('t_signal_keys', {
        key: this.id,
      })
      this.getSessions();
    }
  }
}

export default createSession
