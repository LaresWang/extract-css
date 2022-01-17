import Message from '@/services/message';
import moment from 'moment';
import { ActAssistantId } from "../../utils/const"
export default {
  namespaced: false,
  state: {
    currentAssist: null
  },
  mutations: {
    SET_ASSIST(state, d) {
      state.currentAssist = d;
    }
  },
  actions: {
    async currentActAssistant({ commit,dispatch }, curPayment = {}) {
      const PAYID = curPayment['fromId'] || ActAssistantId;
      let sessionsRow = await window.vm.$knex('t_sessions').where({ id: PAYID });
      if (!sessionsRow.length) {
        await window.vm.$knex('t_sessions').insert({
          id: PAYID,
          uniqueCode: curPayment['uniqueCode'],
          msgType: curPayment['msgType'] || 54, //NoticeOfPayment 支付通知 +  "msgType" : 41 抵押借币相关
          fromType: curPayment['fromType'],
          targetType: curPayment['targetType'],
          topFlag: 0,
          unread: 0,
          textOrigin: '',
          text: '',
          timestamp: curPayment['timestamp'],
          noNoticeFlag: '0'
        });
      }

      let bol = await window.vm.$knex.schema.hasTable(`m_${PAYID}`);
      const message = new Message(PAYID);
      if (!bol) {
        await message.createTable();
      }
      await message.insertMessage({
        req_id: curPayment['reqId'],
        target_type: curPayment['targetType'],
        target_id: curPayment['targetId'],
        from_type: curPayment['fromType'],
        from_id: curPayment['fromId'],
        msg_type: curPayment['msgType'],
        msg_id: curPayment['msgId'],
        msg_order: curPayment['msgOrder'],
        unique_code: curPayment['uniqueCode'],
        timestamp: curPayment['timestamp'],
        msg_header: JSON.stringify(curPayment['msgHeader']),
        msg_body: curPayment['msgBody'] ? JSON.stringify(curPayment['msgBody']) : null,
        text: curPayment['text'],
        appoint: curPayment['appoint'],
        ref_body: JSON.stringify(curPayment['refMsgBody'] || '{}'),
        status: curPayment['status'] || 2, //1：发送中 2：发送完成 -1 发送失败  3 已读
        read_status: curPayment['readStatus'],
        effectiveTimeDate: curPayment['msgHeader'] ? curPayment['msgHeader']['effectiveTimeDate'] : curPayment['timestamp']
      });
      // 此消息有效期为1年 subtract(1, "days")
      let lastOneYear =
          moment()
            .subtract(1, 'years')
            .format('x') * 1,
        tableName = `m_${PAYID}`;
      let del = await window.vm
        .$knex(tableName)
        .where('effectiveTimeDate', '<', lastOneYear)
        .del();
      console.log('清除过期消息', del);
      commit('SET_ASSIST', curPayment);
      dispatch('GET_LAST_MSG_LIST')
    }
  },
  getters: {
    getActAssistant: state => state.currentAssist
  }
};
