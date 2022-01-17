// 同步单个群的群成员

import log from 'electron-log';
import { v4 as uuidv4 } from 'uuid';
import UserInfoUtils from '@/utils/UserInfoUtils.js';
import { sendMessageQueue } from './messageQueue';
import { convertToPinyin } from '@/utils/pinyin';
import { sqliteFindOne, sqliteUpdate, sqliteQueryBySQL, sqliteReplace } from './sqliteDao';

const getGroupMember = async (groupId) => {
  try {
    // get group gtmn
    const groupItem = await sqliteFindOne('t_groups', { group_id: groupId });
    const groupMemberInt = await sqliteQueryBySQL(`select count(*) as number from t_groups_member where group_id='${groupId}'`);
    
    if(!groupItem || groupMemberInt.number == groupItem.people) {
      return Promise.resolve();
    }
    console.log(`群：${groupItem.group_name} , 总成员： ${groupItem.people}, 本地当前数量： ${JSON.stringify(groupMemberInt)}`)
    sendMessageQueue.push({
      type: 'ws',
      event:"g.c.ldgm",
      reqId: uuidv4(),
      v: groupItem.gtmn || 0,
      groupId: groupItem.group_id,
      userId: UserInfoUtils.getCurrentUserId(),
      "time": new Date().getTime()
    })
  } catch (err) {
    log.error(err);
  }
}

const processGroupMember = async (data) => {
  console.log(data.data);
  const dataList = data.data.memberList;
  const columns = ['id', 'group_id', 'joinTime', 'nick_name', 'auth_status','forbiddenWordsStatus', 'vipType', 'inviteCodeType',
    'userRank', 'muteNotifications', 'user_head_img','additionalStatus', 'mutedStatus','inviteCode', 'stickyStatus',
    'user_head_img_local', 'is_show', 'member_notes', 'member_notes_pinyin'];
  let q = [];
  for(let item of dataList) {
    if (item.t != 1 || item.userId == UserInfoUtils.getCurrentUserId()) {
      continue;
    }
    const obj = {
      id: item.userId,
      group_id: item.groupId,
      joinTime: Date.now(item.joinTime),
      nick_name: item.nickName,
      auth_status: item.authStatus,
      forbiddenWordsStatus: item.forbiddenWordsStatus,
      vipType: item.vipType,
      inviteCodeType: item.inviteCodeType,
      userRank: item.userRank,
      muteNotifications: item.muteNotifications,
      user_head_img: item.userHeadImg,
      additionalStatus: item.additionalStatus,
      mutedStatus: item.mutedStatus,
      inviteCode: item.inviteCode,
      stickyStatus: item.stickyStatus,
      user_head_img_local: '',
      is_show: 'true',
      member_notes: item.memberNotes || null,
      member_notes_pinyin: item.memberNotes ? convertToPinyin(item.memberNotes) : null,
    };
    q.push(obj);
  }
  await sqliteReplace('t_groups_member', columns, q).then(async () => {
    return sqliteUpdate('t_groups', { group_id: data.groupId }, { gtmn: data.data.gtmn }).then(() => {
      if (!data.data.last) {
        getGroupMember(data.groupId);
        return Promise.resolve();
      }
    })
  }).catch((err) => {
    log.error('同步群成员写入DB ERROR', err);
    return Promise.reject(err);
  })
}

export { getGroupMember, processGroupMember };