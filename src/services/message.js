import store from '@/store';
import { GET_LAST_MSG_LIST } from '../store/types';
import { parseUniqueCode,lastMessagesNotInView_fromType } from '@/utils/const';
import UserInfoUtils from '@/utils/UserInfoUtils.js';
import { t_sessions_builder } from '@/utils/dbDataBuilder';
// import { sqliteUpsert } from '@/services/sqliteDao';
export default class Message {
  constructor(fromId) {
    this.fromId = fromId;
    this.tableMaps = {};
  }
  async createTable() {
    try {
      const exists = await this.hasTable()
      if (exists) {
        return Promise.resolve()
      } else {
        const result = await window.vm.$knex.schema.createTable(
          `m_${this.fromId}`,
          (table) => {
            table.text('req_id')
            table.integer('target_type')
            table.text('target_id')
            table.integer('from_type')
            table.text('from_id')
            table.integer('msg_type')
            table.text('msg_id')
            table.integer('msg_order')
            table.text('unique_code')
            table.bigInteger('timestamp')
            table.text('msg_header')
            table.text('msg_body')
            table.text('text')
            table.integer('appoint', { default: 0 })
            table.text('ref_body', { default: '{}' })
            table.integer('status') //1：发送中 2：发送完成 -1 发送失败  3 已读
            table.integer('read_status')
            table.bigInteger('effectiveTimeDate')
            table.text('isDecrypt') //是否解密成功
            table.boolean('isDeleted').defaultTo(0)
          }
        )
        return Promise.resolve(result)
      }
    } catch (err) {
      return Promise.resolve()
    }
  }
  async hasTable() {
    return await window.vm.$knex.schema.hasTable(`m_${this.fromId}`)
  }
  async deleteTable() {
    const exists = await window.vm.$knex.schema.hasTable(`m_${this.fromId}`)
    if (exists) {
      return await window.vm.$knex.schema.dropTable(`m_${this.fromId}`)
    } else {
      return Promise.resolve()
    }
  }
  async insertMessage(data) {
    const fromId = parseUniqueCode(data.unique_code, data.target_type)
    if(!this.tableMaps[fromId]){
      const exists = await window.vm.$knex.schema.hasTable(`m_${fromId}`)
      if (!exists) {
        await this.createTable()
      }
      this.tableMaps[fromId] = true;
    }
    const req = data.req_id || data.reqId
    if (!req) {
      return 'N'
    }
    const sessionObj = {
      id: fromId,
      uniqueCode: data.unique_code,
      targetType: data.target_type,
      timestamp: data.timestamp,
      updateTime: data.timestamp || Date.now() + '',
      isDeleted: false,
      lastMsgId: data.msg_id, // 发送消息时不存在
      msgType: data.msg_type,
      text: data.text,
      refMsgBody: data.ref_body,
      msgBody: data.msg_body,
      fromId: data.from_id,
      fromType: data.from_type,
      reqId: req
    };
    if (data.msg_type != 23&&!lastMessagesNotInView_fromType.includes(+data['from_type'])) {
      
      const insertData = t_sessions_builder(sessionObj,{
        type: 1,
        props: Object.keys(sessionObj)
      });
      await window.vm.$knex('t_sessions').insert(insertData).onConflict('id').merge(
        t_sessions_builder(sessionObj,{
          type: 1,
          props: ['timestamp','lastMsgId','msgType','text','refMsgBody','msgBody','fromId','fromType', 'reqId', 'isDeleted','updateTime']
        })
      ).where('timestamp','<', +insertData.timestamp)
      if(data.fromResend && (store.state.common.netStatus==='offline' || store.state.common.socketStatus!=='online')){
        await store.dispatch(GET_LAST_MSG_LIST);
      }
    }
    delete data.fromResend;
    data.req_id = req;
    return window.vm.$knex
      .transaction(async function(trx) {
        try {
          const msg = await trx
            .where({ req_id: req })
            .from(`m_${fromId}`)
          if (msg.length) {
            //更新的话，不刷新当前窗口
            await trx
              .where({ req_id: req })
              .update(data)
              .into(`m_${fromId}`)
            return 'U'
          } else {
            await trx.insert(data).into(`m_${fromId}`)
            return 'I'
          }
        } catch (err) {
          throw new Error(err)
        }
      })
      .catch((err) => {
        console.error('insert message err', err, data)
        return
      })
  }
  async getMessage(msg_id) {
    const msg = await window.vm.$knex(`m_${this.fromId}`).where({ msg_id })
    if (msg.length) {
      return msg
    } else {
      return []
    }
  }

  async getMessageByReqId(req_id) {
    const msg = await window.vm.$knex(`m_${this.fromId}`).where({ req_id })
    if (msg.length) {
      return msg
    } else {
      return []
    }
  }

  // 删除单挑消息
  async deleteMessageByMsgId(msg_id) {
    const exists = await window.vm.$knex.schema.hasTable(`m_${this.fromId}`)
    if (exists) {
      await window.vm
        .$knex(`m_${this.fromId}`)
        .where({ msg_id })
        .update({ isDeleted: true })
    }
    return Promise.resolve()
  }

  // 删除多挑消息
  async deleteMessageByMsgIds(msgIds) {
    const exists = await window.vm.$knex.schema.hasTable(`m_${this.fromId}`)
    if (exists) {
      let sql = `delete from m_${this.fromId} where msg_id in (${msgIds})`
      await window.vm.$knex.raw(sql)
    }
    return Promise.resolve()
  }

  // 删除单挑消息
  async deleteMessageByReqId(req_id) {
    const exists = await window.vm.$knex.schema.hasTable(`m_${this.fromId}`)
    if (exists) {
      await window.vm
        .$knex(`m_${this.fromId}`)
        .where({ req_id })
        .update({ isDeleted: true })
    }
    return Promise.resolve()
  }
  // 批量删除多挑消息根据reqid
  async deleteMessageByReqIds(reqIds) {
    const exists = await window.vm.$knex.schema.hasTable(`m_${this.fromId}`)
    if (exists) {
      let sql = `delete from m_${this.fromId} where req_id in (${reqIds})`
      await window.vm.$knex.raw(sql)
    }
    return Promise.resolve()
  }

  // 批量删除单表消息
  async deleteMessageByTable() {
    const exists = await window.vm.$knex.schema.hasTable(`m_${this.fromId}`)
    if (exists) {
      await window.vm.$knex(`m_${this.fromId}`).update({ isDeleted: true })
    }
    return Promise.resolve()
  }

  //批量更新消息的已读状态
  async updateReadStatus(data) {
    const exists = await window.vm.$knex.schema.hasTable(`m_${this.fromId}`)
    if (exists) {
      return await window.vm
        .$knex(`m_${this.fromId}`)
        .update({ status: 3 })
        .where('msg_order', '<=', data.msg_order)
        .where({ status: 2 });
    } else {
      return Promise.resolve()
    }
  }

  async getMaxMsgOrder() {
    const exists = await window.vm.$knex.schema.hasTable(`m_${this.fromId}`)
    if (exists) {
      const sql = `select max(msg_order) as maxOrder from m_${this.fromId}`
      let record = await window.vm.$knex.raw(sql)
      if (record.length > 0) {
        return record[0].maxOrder + 1
      } else {
        return 1
      }
    } else {
      return 1
    }
  }

  async setMessageSendFail(req_id) {
    await window.vm
      .$knex(`m_${this.fromId}`)
      .where({ req_id })
      .update({ status: -1 })
  }

  async setMessageSending(req_id) {
    await window.vm
      .$knex(`m_${this.fromId}`)
      .where({ req_id })
      .update({ status: 1 })
  }

  async updateMsgBody(item) {
    const msg = await window.vm
      .$knex(`m_${this.fromId}`)
      .where({ req_id: item.key })
    if (msg.length) {
      let msgBody = JSON.parse(msg[0].msg_body)
      msgBody.downloadPercent = '100%'
      msgBody.downloadPath = item.value.downloadPath
      msgBody.downloadFinished = true
      await window.vm
        .$knex(`m_${this.fromId}`)
        .where({ req_id: item.key })
        .update({ msg_body: JSON.stringify(msgBody) })
    }
  }

  async updateSuspendAudioMessage(item) {
    if (store.state.chat.currentAudio.length) {
      const msg = await window.vm
        .$knex(`m_${this.fromId}`)
        .where({ req_id: store.state.chat.currentAudio[0].reqId })
      console.log('msg.length ========== ', msg.length, msg, item)
      const ignoreMessages = [700, 712, 705, 706]
      if (msg.length) {
        if (ignoreMessages.includes(msg[0].from_type)) {
          return 'ignore'
        }
        if (
          item.fromType == 712 &&
          item.msgBody &&
          !item.msgBody.time &&
          msg[0].target_id == UserInfoUtils.getCurrentUserId()
        ) {
          item.fromType = 705
        }
        await window.vm
          .$knex(`m_${this.fromId}`)
          .update({
            from_type: item.fromType,
            msg_order: item.msgOrder,
            timestamp: item.timestamp,
            isDecrypt: 1,
            status: 2,
            msg_body: JSON.stringify(item.msgBody),
            ref_body: JSON.stringify(item.refMsgBody),
            effectiveTimeDate: item.effectiveTime,
          })
          .where({ req_id: store.state.chat.currentAudio[0].reqId })
        item.fromId = msg[0].from_id
        item.targetId = msg[0].target_id
      } else {
        item.msg_id = 1
        item.isDecrypt = 1
        item.status = 2
        await this.insertMessage(item)
      }
    }
    return ''
  }
}
