import Vue from 'vue';
export default {
  namespaced: false,
  state: {
    sessionWithLastAtMsg: {}, //sessionId:msgObj 
    currentMsgId: "",//操作当前可选中复制的消息文本
  },
  mutations: {
    SET_SESSION_AT(state, { sessionId, atMsgObj }) {
      Vue.set(state.sessionWithLastAtMsg, sessionId, atMsgObj);
    },
    CLEAR_SESSION_AT_BY_ID(state, sessionId) {
      Vue.delete(state.sessionWithLastAtMsg, sessionId);
    },
    CLEAR_ALL_SESSION_AT(state) {
      state.sessionWithLastAtMsg = {};
    },
    SET_MSG_ID(state, msgId = '') {
      state.currentMsgId = msgId
    }
  },
  actions: {
    actionSessionAt({ commit }, d) {
      commit('SET_SESSION_AT', d);
    },
    actionSessionAtDeleteBySessionId({ commit }, sessionId) {
      if (sessionId) {
        commit('CLEAR_SESSION_AT_BY_ID', sessionId);
      }
    },
    actionCurrentMsgId({ commit }, msgId = '') {
      commit('SET_MSG_ID', msgId);
    }
  },
  getters: {
    gettersAllSessionWithAt: state => state.sessionWithLastAtMsg,
    gettersCurrentAtBySessionID: state => id => {
      return state.sessionWithLastAtMsg[id];
    },
    gettersCurrentMsgId: state => state.currentMsgId
  }
};
