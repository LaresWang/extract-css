/**   t-sessions
 *    table.text('id').notNullable();
      table.string('uniqueCode').notNullable().unique();
      table.primary(['id']);
      table.string('lastMsgId');
      table.string('msgType');
      table.string('fromType');
      table.string('targetType');
      table.integer('unread').defaultTo("0");//未读数量
      table.string('textOrigin');//原文
      table.string('text')//解密后
      table.string('topFlag');
      table.string('voiceStatus');
      table.string('voiceMsgId');
      table.string('noNoticeFlag');//免打扰
      table.string('timestamp');//更新时间
      table.string('fromId');
      table.boolean('isDeleted').defaultTo(0);


       table.dropUnique('uniqueCode');
      table.integer('isAt').defaultTo(0);
      table.string('updateTime') 
      table.text('msgBody');
    table.text('refMsgBody');
    table.string('reqId');

 */

/**
 * 
 * @param {*} params {
 *  待插入或待更新的数据
 * } 
 * @param {*} options {
 *  type: number,  1-指定插入或更新的属性 2-排除一些属性
 *  props: array， 属性列表
 * }
 * @returns 
 */
export const t_sessions_builder = function(params, options){
  const {
    id,
    uniqueCode, 
    lastMsgId, 
    msgType, 
    fromType, 
    targetType, 
    unread, 
    textOrigin, 
    text, 
    topFlag, 
    voiceStatus, 
    voiceMsgId, 
    noNoticeFlag,
    timestamp,
    fromId,
    isDeleted,
    isAt,
    updateTime,
    msgBody,
    refMsgBody,
    reqId,
    draftText,
    draftHtml,
    draftTime
  } = params;
  let obj = {
    id: id, // 肯定存在
    uniqueCode: uniqueCode||'0', 
    lastMsgId: lastMsgId||'', 
    msgType: (msgType||'1')+'', 
    fromType: (fromType||'0')+'', 
    targetType: targetType||'0', 
    unread: unread||0, 
    textOrigin: textOrigin||'', 
    text: text||textOrigin||'', 
    topFlag: topFlag||'0', 
    voiceStatus: voiceStatus||'0', 
    voiceMsgId: voiceMsgId||'0', 
    noNoticeFlag: noNoticeFlag||'0',
    timestamp: (timestamp||Date.now())+'',
    fromId: fromId||'',
    isDeleted: isDeleted||0,
    isAt: isAt||0,
    updateTime: (updateTime||Date.now())+'',
    msgBody: msgBody||'',
    refMsgBody: refMsgBody||'',
    reqId: reqId||'',
    draftText: draftText||'',
    draftHtml: draftHtml||'',
    draftTime: draftTime||null
  };
  let temp = null;
  if(options.props?.length){
    if(options.type ===1){
      // 指定需要哪些属性
      temp = {};
      options.props.forEach(prop=>{
        temp[prop] = obj[prop];
      });
    } else {
      // 排除一些属性
      options.props.forEach(prop=>{
        delete obj[prop]
      });
      temp = obj;
    }
  }

  return temp||obj;
}


// 好友申请 model转数据库字段
export const t_friend_apply_builder = function(row){
  return {
    // applyTimeStamp
    apply_status: row?.applyStatus || 0,
    apply_time: row?.applyTime || '',
    apply_time_stamp: row?.applyTimeStamp || '',
    apply_type: row?.applyType || 0,
    attrs: row?.attrs || '',
    channel_code: row?.channelCode || '',
    content: row?.content || '',
    create_by: row?.createdBy || '',
    create_on: row?.createdOn || '',
    enabled: row?.enabled || 0,
    friend_head_img_path: row?.friendHeadImgPath || '',
    friend_id: row?.friendId || '',
    friend_invite_code: row?.friendInviteCode || '',
    friend_invite_code_type: row?.friendInviteCodeType || '',
    friend_nick_name: row?.friendNickName || '',
    friend_notes: row?.friendNotes || '',
    friend_pass: row?.friendPass || '',
    friend_user_rank: row?.friendUserRank || 0,
    friend_vip_type: row?.friendVipType || 0,
    group_id: row?.groupId || '',
    group_img: row?.groupImg || '',
    group_name: row?.groupName || '',
    id: row?.id || '',
    invite_code: row?.inviteCode || '',
    invite_code_type: row?.inviteCodeType || 0,
    other_friend_notes: row?.otherFriendNotes || '',
    source: row?.source || '',
    update_by: row?.updateBy || '',
    update_on: row?.updateOn || '',
    user_head_img_path: row?.userHeadImgPath || '',
    user_id: row?.userId || '',
    user_nick_name: row?.userNickName || '',
    user_rank: row?.userRank || 0,
    user_pass: row?.userPass || '',
    version: row?.version || '',
    vip_type: row?.vipType || 0,
  }
}

// 好友申请 数据库字段转model
export const builder_t_friend_apply = function(row){
  return {
    applyStatus: row?.apply_status || 0,
    applyTime: row?.apply_time || '',
    applyTimeStamp: row?.apply_time_stamp || 0,
    applyType: row?.apply_type || 0,
    attrs: row?.attrs || '',
    channelCode: row?.channel_code || '',
    content: row?.content || '',
    createdBy: row?.create_by || '',
    createdOn: row?.create_on || '',
    enabled: row?.enabled || 0,
    friendHeadImgPath: row?.friend_head_img_path || '',
    friendId: row?.friend_id || '',
    friendInviteCode: row?.friend_invite_code || '',
    friendInviteCodeType: row?.friend_invite_code_type || '',
    friendNickName: row?.friend_nick_name || '',
    friendNotes: row?.friend_notes || '',
    friendPass: row?.friend_pass || '',
    friendUserRank: row?.friend_user_rank || 0,
    friendVipType: row?.friend_vip_type || 0,
    groupId: row?.group_id || '',
    groupImg: row?.group_img || '',
    groupName: row?.group_name || '',
    id: row?.id || '',
    inviteCode: row?.invite_code || '',
    inviteCodeType: row?.invite_code_type || 0,
    otherFriendNotes: row?.other_friend_notes || '',
    source: row?.source || '',
    updateBy: row?.update_by || '',
    updateOn: row?.update_on || '',
    userHeadImgPath: row?.user_head_img_path || '',
    userId: row?.user_id || '',
    userNickName: row?.user_nick_name || '',
    userRank: row?.user_rank || 0,
    userPass: row?.user_pass || '',
    version: row?.version || '',
    vipType: row?.vip_type || 0,
  }
}