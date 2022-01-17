import { group_session_update, user_session_update } from '@/server'
import UserInfoUtils from '@/utils/UserInfoUtils.js'
import store from '@/store'
import { paymentId } from '../utils/const';
/**
 * 置顶 && 免打扰
 * @param {*} session
 * @param {*} operational
 * @param {*} value
 */

export const overheadAndNoticeFlagById = async (
  session,
  operational,
  value
) => {
  let result = {}
  // 单聊
  if (session.targetType == '1') {
    const params = {
      friendId: session.id,
      userId: UserInfoUtils.getCurrentUserId(),
    }
    const updateDoc = {}
    if (operational === 'topFlag') {
      params['topFlag'] = value
      updateDoc['topFlag'] = value
    }
    if (operational === 'noNoticeFlag') {
      params['noNoticeFlag'] = value
      updateDoc['noNoticeFlag'] = value
    }
    if (session.id !== paymentId) {
      result = await user_session_update(params)
    }
    // result = await window.vm
    //   .$knex('t_sessions')
    //   .whereRaw(`id = ${session.id}`)
    //   .update(updateDoc)
  }
  // 群聊
  if (session.targetType == '2') {
    const params = {
      userId: UserInfoUtils.getCurrentUserId(),
      groupId: session.id,
    }
    const updateDoc = {}
    if (operational === 'topFlag') {
      params['stickyStatus'] = value
      updateDoc['topFlag'] = value
    }
    if (operational === 'noNoticeFlag') {
      params['muteNotifications'] = value
      updateDoc['noNoticeFlag'] = value
    }
    result = await group_session_update(params)
    // result = await window.vm
    //   .$knex('t_sessions')
    //   .whereRaw(`id = ${session.id}`)
    //   .update(updateDoc)
  }
  if (operational === 'noNoticeFlag') {
    if (value == 1) {
      store.state.common.noNoticeSessions.push(session.id)
    } else {
      store.state.common.noNoticeSessions = store.state.common.noNoticeSessions.filter(
        (id) => id != session.id
      )
    }
  }
  return result
}
/**
 * 根据回话列表ID 删除某条
 * @param {*} sessionId
 */
export const deleteTSessionsById = async (sessionId) => {
  await window.vm
    .$knex('t_sessions')
    .whereRaw(`id = ${sessionId}`)
    .update({ isDeleted: true,unread: 0, draftText: '', draftHtml: '', draftTime: null });
  const tableName = `m_${sessionId}`;
  const isExists = await window.vm.$knex.schema.hasTable(tableName);
  if (isExists) {
    await window.vm.$knex(tableName).update({ isDeleted: true })
  }
  store.commit('UPDATE_DRAF_LIST', {id: sessionId});
}
// 清除聊天记录不包括草稿内容
export const deleteSessionsWithoutDraft = async (sessionId) => {
  await window.vm
    .$knex('t_sessions')
    .whereRaw(`id = ${sessionId}`)
    .update({ unread: 0, text: '', msgBody: null });
  const tableName = `m_${sessionId}`;
  const isExists = await window.vm.$knex.schema.hasTable(tableName);
  if (isExists) {
    await window.vm.$knex(tableName).update({ isDeleted: true })
  }
}
