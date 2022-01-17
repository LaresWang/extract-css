import { v4 as uuidv4 } from 'uuid';
import Message from '@/services/message';
import { queryGroupByGroupId, ser_group_personById, get_user_info, ser_group_member } from './server';
import { get_use_rsa } from '@/server';
import { convertToPinyin } from '@/utils/pinyin';
import { parseUniqueCode } from '@/utils/const';
import { t_sessions_builder, builder_t_friend_apply } from '@/utils/dbDataBuilder';
import { getSelfUserId } from '@/utils/const';
import UserInfoUtils from '@/utils/UserInfoUtils.js';
import GeneratorUserSig from '@/utils/GeneratorUserSig';
const { ipcRenderer } = require('electron');
import store from '@/store';
import _ from 'lodash';
import { sqliteQueryBySQL } from "@/services/sqliteDao";
import bus from '@/utils/eventbus';
import { ChatListUtils } from '@/utils';

export default {
  // 从t_sessions表中获取某个值
  async getKeyFromSession(id, key) {
    let ret = await window.vm.$knex('t_sessions').where({
      id
    }).select(key);
    return ret[0][key];
  },
  //发送消息的同时一并更新会话
  async updateSession (payload, whereclause, flag = true) {
    let d = new Date().getTime() + '';
    if (flag) {
      return await window.vm
        .$knex('t_sessions')
        .where(whereclause)
        .update(payload)
        .update({timestamp: d})
        .debug(false);
    } else {
      return await window.vm
        .$knex('t_sessions')
        .where(whereclause)
        .update(payload)
        .debug(false);
    }
  },
  //更新会话的属性但不更新时间，慎用
  async updateSessionWithoutTime (payload, whereclause) {
    return await window.vm
      .$knex('t_sessions')
      .where(whereclause)
      .update(payload)
      .debug(false);
  },
  //从联系人或者 收到消息时 新增会话记录
  async insertSession (item) {
    let searchRet = await window.vm
      .$knex('t_sessions')
      .where({
        id: item.id
      })
      .select('id');
    // console.log(searchRet);
    if (searchRet && searchRet.length > 0) {
      await window.vm
        .$knex('t_sessions')
        .where('id', item.id)
        .update({ 
          isDeleted: false, 
          topFlag: item.topFlag ? item.topFlag : '0',
          noNoticeFlag: item.noNoticeFlag ? item.noNoticeFlag : '0',
        })
      // return '';
    }
    let d = new Date().getTime() + '';
    const sessionObj = {
      id: item.id,
      uniqueCode: item.uniqueCode,
      msgType: item.msgType ? item.msgType : '1',
      targetType: item.targetType,
      fromId: item.fromId,
      topFlag: item.topFlag ? item.topFlag : '0',
      timestamp: item.timestamp ? item.timestamp : d,
      fromType: item.fromType ? item.fromType : '0',
      textOrigin: item.msgBody ? item.msgBody.text : '',
      text: item.text || item.textOrigin,
      voiceStatus: item.voiceStatus ? item.voiceStatus : '0',
      voiceMsgId: item.voiceMsgId ? item.voiceMsgId : '0',
      noNoticeFlag: item.noNoticeFlag ? item.noNoticeFlag : '0',
      lastMsgId: item.msgId,
      // unread: item.unread,
      draftHtml: item.draftHtml,
      draftText: item.draftText,
      draftTime: item.draftTime,
      updateTime: item.updateTime || item.timestamp
    };
    const insertData = t_sessions_builder(sessionObj, {
      type: 1,
      props: Object.keys(sessionObj)
    });
    let dbret = await window.vm.$knex('t_sessions').insert(insertData).onConflict('id').merge(
      t_sessions_builder(sessionObj, {
        type: 1,
        props: ['fromId', 'topFlag', 'timestamp', 'fromType', 'textOrigin', 
          'text', 'voiceStatus', 'voiceMsgId', 'noNoticeFlag', 'lastMsgId', 'draftText', 'draftTime', 'draftHtml', 'updateTime']
      })
    ).where('timestamp', '<', +insertData.timestamp);
    return dbret;
  },

  // ############# 用户相关 ##################
  async insertUserPrivateKey (item) {
    const exists = await window.vm.$knex.schema.hasTable('t_user_private_key');
    if (!exists) {
      //await this.createTUserPrivateKey();
    }
    await window.vm.$knex('t_user_private_key').insert(item).onConflict(['user_id', 'rsa_pub_version']).merge();
    // const SELECT_SQL =
    //   "select user_id from t_user_private_key where user_id='" + item.user_id + "' and rsa_pub_version='" + item.rsa_pub_version + "'";
    // let searchRet = await window.vm.$knex.raw(SELECT_SQL);
    // if (searchRet.length == 0) {
    // } else {
    //   await window.vm
    //     .$knex('t_user_private_key')
    //     .where('user_id', '=', item.user_id)
    //     .where('rsa_pub_version', '=', item.rsa_pub_version)
    //     .update(item);
    // }
  },

  async findLatestRsaInfo (userId) {
    const exists = await window.vm.$knex.schema.hasTable('t_user_private_key');
    if (exists) {
      const SELECT_SQL = `select user_id, rsa_pub, rsa_pub_version, rsa_pri from t_user_private_key
      where user_id${userId} order by rsa_pub_version desc limit 1`;
      let searchRet = await window.vm.$knex.raw(SELECT_SQL);
      return searchRet && searchRet.length > 0 ? searchRet : [];
    } else {
      //await this.createTUserPrivateKey();
      return [];
    }
  },

  async findPrivateKeyByVersion (userId, version) {
    const exists = await window.vm.$knex.schema.hasTable('t_user_private_key');
    if (exists) {
      const SELECT_SQL = `select rsa_pri
      from t_user_private_key where user_id=${userId} and rsa_pub_version=${version}`;
      let searchRet = await window.vm.$knex.raw(SELECT_SQL);
      return searchRet && searchRet.length > 0 ? searchRet[0].rsa_pri : '';
    } else {
      //await this.createTUserPrivateKey();
      return null;
    }
  },

  async createTUserPrivateKey () {
    await window.vm.$knex.schema.createTable('t_user_private_key', function (table) {
      table.string('user_id').notNullable();
      table.string('rsa_pub'); //公钥
      table.string('rsa_pub_version'); //公钥版本
      table.string('rsa_pri'); //私钥
    });
  },

  //查询给定人或群 对应的头像和呢称
  async findNameAndIIcon (id, targetType) {
    let res1 = {};
    if (targetType == 1) {
      res1 = await window.vm
        .$knex('t_contacts')
        .select('friend_nick_name as sessionName', 'friend_head_img as sessionIcon')
        .where('friend_id', id);
    } else if (targetType == 2) {
      res1 = await window.vm
        .$knex('t_groups')
        .select('group_name as sessionName', 'group_avatar as sessionIcon')
        .where('group_id', id);
    }
    if (res1.length > 0) {
      return res1[0];
    }
    return res1;
  },

  async findFriendNameById (friendId) {
    const SQL = `select ifnull(nullif(friend_friendNotes,''), friend_nick_name) as name
    from t_contacts where friend_id=${friendId}`;
    let res = await window.vm.$knex.raw(SQL);
    if (res && res.length > 0) {
      return res[0].name;
    }
    return '';
  },

  // #######################消息相关 ##########################
  /**更新会话的未读数量 */
  async updateUnreadMsgUnm (id, num) {
    await window.vm.$knex.raw(`update t_sessions set unread=unread + ${num} where id=${id}`);
  },

  /** 根据MSG ID 更新消息 */
  async updateMessageByMsgId (msgInfo) {
    if (!msgInfo.msg_id) {
      throw new Error('msg_id不存在');
    }

    let id;
    if (msgInfo.unique_code) {
      id = parseUniqueCode(msgInfo.unique_code, msgInfo.target_type);
    } else {
      throw new Error('uniqueCode不存在');
    }
    let tableName = `m_${id}`;
    await window.vm
      .$knex(tableName)
      .where({
        msg_id: msgInfo.msg_id
      })
      .update(msgInfo)
      .debug(false);
  },

  /** 查询最大的msgOrder */
  async findMaxMsgOrder (id) {
    try {
      if (!id) {
        throw new Error('id不存在');
      }
      let tableName = `m_${id}`;
      let maxOder = await window.vm.$knex(tableName).max('msg_order as msg_order');
      if (maxOder.length > 0) {
        return maxOder[0].msg_order;
      } else {
        return 0;
      }
    } catch (e) {
      //nothing
      return 0;
    }
  },

  /**消息: 根据msgID查找引用的消息 **/
  async findQuotMsg (formId, targetType, msgId, reqId) {
    if (formId == null || formId == '' || targetType == null || targetType == '') {
      throw new Error(' formId/targetType 均不能为空');
    }
    // let tabName = 'm_' + formId;
    if (!msgId && !reqId) {
      return null
    }
    let searchRet = [];
    let sql = '';
    if (msgId) {
      sql = `msg_id='${msgId}'`;
    }
    if (reqId) {
      let reqSql = `req_id='${reqId}'`;
      sql = sql ? `(${sql} or ${reqSql})` : reqSql;
    }

    if (targetType == 1) {
      searchRet = await this.selectSingleChatList(formId, sql);
    } else {
      searchRet = await this.selectGroupChatList(formId, sql);
    }
    return searchRet && searchRet.length > 0 ? searchRet[0] : null;
  },

  /**查询单聊的历史消息 */
  async selectSingleChatList (friendId, whereclause) {
    try {
      let tabName = 'm_' + friendId;
      const hasTable = await window.vm.$knex.schema.hasTable(tabName);
      if (!hasTable) {
        return [];
      }
      const maxItem = await window.vm.$knex.raw(
        `select from_id, msg_id, msg_order from ${tabName} as m where msg_order=(select max(b.msg_order)
        from ${tabName} as b)`
      );
      if (maxItem.length && maxItem[0].from_id && maxItem[0].from_id == friendId) {
        await window.vm
          .$knex(tabName)
          .where({
            from_type: '999',
            from_id: friendId,
            status: 2
          })
          .whereNotIn('status', [-1])
          .where(`msg_order`, `<`, `${maxItem[0].msg_order}`)
          .update({ status: 3 });
      }
      await window.vm
        .$knex(tabName)
        .update({ isDeleted: true, text: '' })
        .where('effectiveTimeDate', '<', `${new Date().getTime()}`);
      let sql = `
        SELECT
        t.friend_head_img AS fromIcon,
        t.friend_nick_name AS fromName,
        t.friend_friendNotes AS friendNotes,
        t.invite_code as inviteCode,
        t.vipType as vipType,
        t.inviteCodeType as inviteCodeType,
        t.userRank as userRank,
        m.req_id AS reqId,
        m.target_type AS targetType,
        m.target_id AS targetId,
        m.from_type AS fromType,
        m.timestamp,
        m.msg_order AS msgOrder,
        m.unique_code AS uniqueCode,
        m.msg_body AS msgBody,
        m.ref_body AS refMsgBody,
        m.msg_type AS msgType,
        m.status AS sendStatus,
        m.read_status AS readStatus,
        m.from_type AS fromType,
        m.text,
        m.from_id AS fromId,
        m.isDecrypt AS isDecrypt,
        ifnull(m.msg_id, '') msgId
      FROM ${tabName} AS m
      LEFT JOIN t_contacts as t ON m.from_id = t.friend_id
      WHERE m.effectiveTimeDate > ${new Date().getTime()}
        AND m.isDeleted = 0
        AND m.msg_type NOT IN (13, 24)
        AND m.from_type NOT IN (408, 409, 410, 215, 201, 212, 701, 702, 421, 422,423,424,425,437,438,439,95)`;//95看点资讯收到评论提醒

      if (whereclause) {
        sql += ` and ${whereclause}`;
      }
      sql += ` ORDER BY msg_order DESC, timestamp DESC LIMIT 30`; // DiDiPayment.vue -> showLength
      let list = await window.vm.$knex.raw(sql);
      list = list.reverse();
      list.forEach((item) => {
        if (item.refMsgBody) {
          item.refMsgBody = JSON.parse(item.refMsgBody);
        }
        if (item.msgBody) {
          item.msgBody = JSON.parse(item.msgBody);
        }
        item.checked = false;
        return item;
      });
      console.log(list, tabName, '表里拿的单聊list');
      return list;
    } catch (err) {
      console.error(err, 'selectSingleChatList');
    }
  },
  /**查询群成员名称 */
  async findGroupMemberName (item) {
    let sql = `select g.nick_name, g.member_notes, g.auth_status, g.forbiddenWordsStatus, g.vipType,
    g.inviteCodeType, g.userRank, g.inviteCode, c.friend_friendNotes
    from t_groups_member g left join t_contacts c on c.friend_id = g.id
    where g.group_id = ${item.targetId} and id = ${item.fromId}`;

    let memberName = await window.vm.$knex.raw(sql);
    if (memberName && memberName.length > 0) {
      item.friendFriendNotes = memberName[0].friend_friendNotes;
      item.memberNotes = memberName[0]?.member_notes;
      item.nickName = memberName[0].nick_name;
      item.authStatus = memberName[0].auth_status;
      item.forbiddenWordsStatus = memberName[0].forbiddenWordsStatus;
      item.vipType = memberName[0].vipType;
      item.inviteCodeType = memberName[0].inviteCodeType;
      item.userRank = memberName[0].userRank;
      item.inviteCode = memberName[0].inviteCode;
    }
    return item;
  },
  /**查询群聊的历史消息 */
  async selectGroupChatList (groupId, whereclause) {
    try {
      let tabName = 'm_' + groupId;
      if (!(await window.vm.$knex.schema.hasTable(tabName))) {
        return [];
      }
      await window.vm
        .$knex(tabName)
        .update({ isDeleted: true, text: '' })
        .where('effectiveTimeDate', '<', `${new Date().getTime()}`);
      let sql = `SELECT
        m.req_id AS reqId,
        m.from_type AS fromType,
        m.timestamp AS timestamp,
        m.msg_order AS msgOrder,
        m.msg_body AS msgBody,
        m.ref_body AS refMsgBody,
        m.msg_type AS msgType,
        m.text AS text,
        m.unique_code AS uniqueCode,
        m.target_type AS targetType,
        m.target_id AS targetId,
        m.from_id AS fromId,
        m.status as sendStatus,
        m.read_status as readStatus,
        ifnull(g.user_head_img,t.friend_head_img) fromIcon,
        t.friend_friendNotes as friendFriendNotes,
        g.member_notes as memberNotes,
        g.nick_name as nickName,
        g.auth_status as authStatus,
        g.is_show as isShow,
        g.forbiddenWordsStatus as forbiddenWordsStatus,
        g.inviteCode as inviteCode,
        g.vipType as vipType,
        g.inviteCodeType as inviteCodeType,
        g.userRank as userRank,
        ifnull(m.msg_id, '') msgId
        FROM ${tabName} AS m
        LEFT JOIN t_groups_member AS g ON m.from_id = g.id and g.group_id=${groupId}
        LEFT JOIN t_contacts AS t ON m.from_id = t.friend_id
        WHERE m.msg_type IS NOT (24) and  m.effectiveTimeDate > ${new Date().getTime()} and m.isDeleted = false
        and m.from_type NOT IN (408, 409, 201, 401, 353, 355,423,424,425,437,438,439,95)`;//386,387 批量,95看点资讯收到评论提醒
      // WHERE m.from_type NOT IN (0, 408, 409, 201),
      if (whereclause) {
        sql += ` and ${whereclause}`;
      }
      sql += ` ORDER BY msg_order DESC, timestamp DESC LIMIT 30`;
      let groupHistoryList = await window.vm.$knex.raw(sql);
      groupHistoryList = groupHistoryList.reverse();
      let array = []
      this.groupHistoryListDealWith(groupHistoryList, array)
      console.log(groupHistoryList, tabName, '表里拿的群聊list');
      // 去重之后的数组 遍历请求用户详情接口
      if(array.length > 0) {
        array = Array.from(new Set(array));
        array.forEach(async element => {
          // 
          let res = await get_user_info({ id: element });
          if (res.code == 200) {
            await window.vm
              .$knex('t_groups_member')
              .where({
                id: element,
                group_id: groupId
              })
              .update({
                nick_name: res.data.userNickName,
                user_head_img: res.data.userHeadImg
              });
          }
        });
        groupHistoryList = await window.vm.$knex.raw(sql);
        this.groupHistoryListDealWith(groupHistoryList, array)
        groupHistoryList = groupHistoryList.reverse();
      }
      return groupHistoryList;
    } catch (err) {
      console.error(err, 'selectGroupChatList');
    }
  },

  groupHistoryListDealWith(groupHistoryList, array) {
    groupHistoryList.forEach(async (item) => {
      if (item.refMsgBody) {
        item.refMsgBody = JSON.parse(item.refMsgBody);
      }
      if (item.msgBody) {
        item.msgBody = JSON.parse(item.msgBody);
      }
      if (!item.fromIcon) {
        item.fromIcon = item.refMsgBody?.fromIcon;
      }
      if (!item.fromName) {
        item.fromName = item.refMsgBody?.fromName;
      }
      item.nickName = item.nickName || item.refMsgBody?.fromName;
      if (!item.nickName) {
        // 用一个数组把fromId 都存起来
        console.log('nickName fromId===>', item.fromId);
        array.push(item.fromId)
      }
      item.checked = false;
    });
  },

  async updateDbByFromType (msgInfo) {
    const fromType = msgInfo.fromType;
    switch (fromType) {
    case 0:
      // 撤回
      this.updateFromTypeBy_0(msgInfo);
      break;
    case 210:
      // 你删除了好友 xxx
      await this.updateFromTypeBy_210(msgInfo);
      break;
    case 211:
      // 你已被好友 xxx 删除
      await this.updateFromTypeBy_211(msgInfo);
      break;
    case 222:
      // xxx 用户向你发起了好友申请
      this.updateFromTypeBy_222(msgInfo);
      break;
    case 301:
    case 380:
      // 你 创建了 公开/私密 的 xxx（群名称）
      await this.updateFromTypeBy_301(msgInfo);
      break;
    case 302:
    case 381:
    case 304:
    case 303:
    case 305:
      // 加入群
      await this.updateFromTypeBy_305(msgInfo);
      break;
    case 386://原 303 （批量给用户） xxx 邀请了 xxx 加入了群
    case 387://原 381 （批量给用户） 邀请加入了讨论组
      await this.updateFromTypeBy_305(msgInfo);
      break;
    case 308:
    case 309:
    case 382:
      // 退群
      await this.updateFromTypeBy_309(msgInfo);
      break;
    case 384:
    case 312:
      // 移出群
      await this.updateFromTypeBy_312(msgInfo);
      break;
    case 313:
    case 383:
      // xxx 解散了 xxx 群
      await this.updateFromTypeBy_313(msgInfo);
      break;
    case 330:
      // xxx 对 xxx 开启了禁言
      this.updateFromTypeBy_330(msgInfo);
      break;
    case 333:
      // xxx 对 xxx 关闭了禁言
      this.updateFromTypeBy_333(msgInfo);
      break;
    case 336:
    case 338:
      // 允许/禁止成员单聊
      this.updateFromTypeBy_336(msgInfo);
      break;
    case 345:
    case 347:
      // 禁止/允许发送文件
      this.updateFromTypeBy_345(msgInfo);
      break;
    case 349:
    case 351:
      // 禁止/允许发送链接
      this.updateFromTypeBy_349(msgInfo);
      break;
    case 405:
    case 406:
      // 允许/禁止成员发红包
      this.updateFromTypeBy_405(msgInfo);
      break;
    case 326:
      // 禁止全员发言
      this.updateFromTypeBy_326(msgInfo);
      break;
    case 328:
      // 允许全员发言
      this.updateFromTypeBy_328(msgInfo);
      break;
    case 361:
    case 363:
      // 设置/取消管理员
      this.updateFromTypeBy_361(msgInfo);
      break;
    case 369:
      // 免打扰状态变更
      this.updateFromTypeBy_369(msgInfo);
      break;
    case 370:
      // 置顶状态变更
      this.updateFromTypeBy_370(msgInfo);
      break;
    case 372:
      // 消息保存时长统一 ,适配372的消息
      await this.updateFromTypeBy_372(msgInfo);
      break;
    case 408:
      // 群成员备注/昵称修改
      this.updateFromTypeBy_408(msgInfo);
      break;
    case 409:
      // 群基本信息（全量）修改
      this.updateFromTypeBy_409(msgInfo);
      break;
    case 701:
      // 发起语音
      this.updateFromTypeBy_701(msgInfo);
      break;
    case 702:
      // 接听语音
      this.updateFromTypeBy_702(msgInfo);
      break;
    case 703:
      // 拒绝语音
      this.updateFromTypeBy_703(msgInfo);
      break;
    case 704:
      // 通话结束
      this.updateFromTypeBy_704(msgInfo);
      break;
    case 706:
      // 取消语音
      this.updateFromTypeBy_706(msgInfo);
      break;
    case 705:
      // 语音超时
      this.updateFromTypeBy_705(msgInfo);
      break;
    case 707:
      // 语音忙线
      this.updateFromTypeBy_707(msgInfo);
      break;
    case 712:
      // 语音中断
      this.updateFromTypeBy_712(msgInfo);
      break;
    default:
      break;
    }
  },
  async updateFromTypeBy_0 (msgInfo) {
    await this.withdrawMessage(msgInfo);
  },

  async updateFromTypeBy_210 (msgInfo) {
    let friendId = msgInfo.fromId == getSelfUserId() ? msgInfo.targetId : msgInfo.fromId;
    const message = new Message(friendId);
    await message.deleteTable();
    await this.deleteFriendById(friendId);
    await this.deleteSessionsById(friendId);
    await this.deleteContactsPubkey(friendId);
  },

  async updateFromTypeBy_211 (msgInfo) {
    let friendId = msgInfo.fromId == getSelfUserId() ? msgInfo.targetId : msgInfo.fromId;
    await this.deleteFriendById(friendId);
    await this.deleteContactsPubkey(friendId);
    await this.deleteSessionsById(friendId);
    const message = new Message(friendId);
    await message.deleteTable();
  },

  async updateFromTypeBy_222 (msgInfo) {
    if (msgInfo.targetId == localStorage.userId) return;
    await this.addFriendById(msgInfo.targetId);
  },

  async updateFromTypeBy_301 (msgInfo) {
    await this.addGroupsById(msgInfo.targetId);
    if (msgInfo.refMsgBody.users) {
      await this.addGroupsMemberByMsgInfo(msgInfo);
    }
  },

  async updateFromTypeBy_302 (msgInfo) {
    await this.addGroupsMemberById(msgInfo.targetId, msgInfo.fromId);
  },

  async updateFromTypeBy_303 (msgInfo) {
    let userId =
      msgInfo.refMsgBody && msgInfo.refMsgBody.users && msgInfo.refMsgBody.users[0].userId ? msgInfo.refMsgBody.users[0].userId : '';
    let groupId =
      msgInfo.refMsgBody && msgInfo.refMsgBody.users && msgInfo.refMsgBody.users[0].groupId ? msgInfo.refMsgBody.users[0].groupId : '';
    if (userId && groupId) {
      let userInfo = msgInfo.refMsgBody.users[0];
      await this.insertOrUpdateTGroupsMember(userInfo);
    }
  },

  async updateFromTypeBy_304 (msgInfo) {
    await this.addGroupsMemberById(msgInfo.targetId, msgInfo.fromId);
  },

  async updateFromTypeBy_305 (msgInfo) {
    await this.addGroupsById(msgInfo.targetId);
    // await this.addGroupsMemberByGroupId(msgInfo.targetId);
    if (msgInfo.refMsgBody.users) {
      await this.addGroupsMemberByMsgInfo(msgInfo);
    }
  },

  async updateFromTypeBy_309 (msgInfo) {
    if (msgInfo.refMsgBody.users && msgInfo.refMsgBody.users.length > 0) {
      let groupId = msgInfo.refMsgBody.users[0].groupId;
      let userId = msgInfo.refMsgBody.users[0].userId;
      if (userId != getSelfUserId()) {
        await this.deleteGroupsMemberById(groupId, userId);
        await this.deleteGroupsMemberAuthById(groupId, userId);
        await this.updatePeopleInGroups(groupId);
      } else {
        await this.deleteSessionsById(groupId);
        await this.deleteGroupsById(groupId);
        await this.deleteGroupsMember(groupId);
        await this.deleteGroupsMemberAuth(groupId);
        const message = new Message(groupId);
        await message.deleteTable();
      }
    }
  },

  async getMsgExpireTime (id, type) {
    let msgExpireTime;
    let someTime = 168 * 60 * 60 * 1000 + new Date().getTime();
    if (!id) {
      return someTime;
    }
    if (type == '1') {
      const friends = await window.vm
        .$knex('t_contacts')
        .where({ friend_id: id })
        .select('msgExpireTime');
      msgExpireTime = friends.length ? friends[0].msgExpireTime * 60 * 60 * 1000 + new Date().getTime() : someTime;
    }
    if (type == '2') {
      const groups = await window.vm
        .$knex('t_groups')
        .where({ group_id: id })
        .select('save_time');
      msgExpireTime = groups.length ? groups[0].save_time * 60 * 60 * 1000 + new Date().getTime() : someTime;
    }
    return msgExpireTime;
  },

  async updateFromTypeBy_312 (msgInfo) {
    let userId =
      msgInfo.refMsgBody && msgInfo.refMsgBody.users && msgInfo.refMsgBody.users[0].userId ? msgInfo.refMsgBody.users[0].userId : '';
    let groupId =
      msgInfo.refMsgBody && msgInfo.refMsgBody.users && msgInfo.refMsgBody.users[0].groupId ? msgInfo.refMsgBody.users[0].groupId : '';
    if (userId != getSelfUserId()) {
      await this.deleteGroupsMemberById(groupId, userId);
      await this.deleteGroupsMemberAuthById(groupId, userId);
      await this.updatePeopleInGroups(groupId);
    } else {
      await this.deleteSessionsById(groupId);
      await this.deleteGroupsById(groupId);
      await this.deleteGroupsMember(groupId);
      await this.deleteGroupsMemberAuth(groupId);
      const message = new Message(groupId);
      await message.deleteTable();
    }
  },

  async updateFromTypeBy_313 (msgInfo) {
    await this.deleteGroupsById(msgInfo.targetId);
    await this.deleteGroupsMember(msgInfo.targetId);
    await this.deleteGroupsMemberAuth(msgInfo.targetId);
    await this.deleteSessionsById(msgInfo.targetId);
    const message = new Message(msgInfo.targetId);
    await message.deleteTable();
  },

  async updateFromTypeBy_330 (msgInfo) {
    let item = {
      userId: msgInfo.refMsgBody.users[0].id,
      groupId: msgInfo.targetId,
      forbiddenWordsStatus: 1
    };
    await this.updateGroupsMemberForbiddenWordsStatus(item);
  },

  async updateFromTypeBy_333 (msgInfo) {
    let item = {
      userId: msgInfo.refMsgBody.users[0].id,
      groupId: msgInfo.targetId,
      forbiddenWordsStatus: 0
    };
    await this.updateGroupsMemberForbiddenWordsStatus(item);
  },

  async updateFromTypeBy_326 (msgInfo) {
    let item = {
      groupId: msgInfo.targetId,
      forbiddenWordsStatus: 0
    };
    await this.updateGroupsForbiddenWordsStatus(item);
  },

  async updateFromTypeBy_328 (msgInfo) {
    let item = {
      groupId: msgInfo.targetId,
      forbiddenWordsStatus: 1
    };
    await this.updateGroupsForbiddenWordsStatus(item);
  },

  async updateFromTypeBy_336 (msgInfo) {
    let item = {
      groupId: msgInfo.targetId,
      memberSingleChatStatus: msgInfo.refMsgBody.memberSingleChatStatus
    };
    await this.updateGroupsMemberSingleChatStatus(item);
  },

  async updateFromTypeBy_345 (msgInfo) {
    let item = {
      groupId: msgInfo.targetId,
      sendPicturesStatus: msgInfo.refMsgBody.sendPicturesStatus
    };
    await this.updateGroupsSendPicturesStatus(item);
  },

  async updateFromTypeBy_349 (msgInfo) {
    let item = {
      groupId: msgInfo.targetId,
      sendConnectionStatus: msgInfo.refMsgBody.sendConnectionStatus
    };
    await this.updateGroupsSendConnectionStatus(item);
  },

  async updateFromTypeBy_405 (msgInfo) {
    let item = {
      groupId: msgInfo.targetId,
      sendRedpacketStatus: msgInfo.refMsgBody.sendRedpacketStatus
    };
    await this.updateGroupsSendRedpacketStatus(item);
  },

  async updateFromTypeBy_361 (msgInfo) {
    let groupsMemberInfo = msgInfo.refMsgBody && msgInfo.refMsgBody.users;
    if (groupsMemberInfo) {
      await this.updateGroupsMemberAuthStatusById(msgInfo);
    }
  },

  async updateFromTypeBy_369 (msgInfo) {
    if (msgInfo.refMsgBody) {
      await this.updateTSessionsNoNoticeFlag(msgInfo);
    }
  },

  async updateFromTypeBy_370 (msgInfo) {
    if (msgInfo.refMsgBody) {
      await this.updateTSessionsTopFlag(msgInfo);
    }
  },

  // 372 消息入库
  async updateFromTypeBy_372 (msgInfo) {
    let unit = 60 * 60 * 1000;
    let saveTime = msgInfo?.refMsgBody?.time || msgInfo?.msgHeader?.effectiveTime || 7 * 24 * unit;//默认7天
    let hour = saveTime / unit, id;
    if (msgInfo?.targetType == 1) {
      let condition = {}
      if (UserInfoUtils.getCurrentUserId() != msgInfo.fromId) {
        condition = { friend_id: msgInfo.fromId };
        id = msgInfo.fromId;
      } else {
        condition = { friend_id: msgInfo.targetId };
        id = msgInfo.targetId;
      }
      await window.vm.$knex('t_contacts').where(condition).update({ msgExpireTime: String(hour) });
    }
    if (msgInfo?.targetType == 2) {
      await window.vm.$knex('t_groups').where({ group_id: msgInfo.targetId }).update({ save_time: String(hour) });
      id = msgInfo.targetId;
    }
    if (window.vm.$route.query?.id == id) {//当前窗口
      // 全局发布事件 不查询
      bus.$emit('_saveTime', hour);
    }
  },

  async updateFromTypeBy_408 (msgInfo) {
    let groupsMemberInfo = msgInfo.refMsgBody && msgInfo.refMsgBody.users;
    if (groupsMemberInfo) {
      await this.updateTGroupsMemberMemberNotes(msgInfo);
    }
  },

  async updateFromTypeBy_409 (msgInfo) {
    let groupsInfo = msgInfo.refMsgBody && msgInfo.refMsgBody.dt[0] ? msgInfo.refMsgBody.dt[0] : {};
    if (groupsInfo) {
      await this.updateGroupsInfo(groupsInfo);
    }
  },

  async extractedAudioParams (msgInfo) {
    const users = msgInfo.refMsgBody?.users || [];
    const userInfo = users.find(u => u.id != getSelfUserId());
    if (userInfo && userInfo.id) {
      let friend = await window.vm
        .$knex('t_contacts')
        .select()
        .where('friend_id', userInfo.id);
      if (friend.length > 0) {
        userInfo.name = friend[0].friend_friendNotes || friend[0].friend_nick_name;
        userInfo.url = friend[0].friend_head_img;
      }
    }
    const userSig = store.state.common.userSig;
    const roomId = msgInfo.msgBody?.roomId || '';
    return { userInfo, userSig, roomId };
  },

  async updateFromTypeBy_701 (msgInfo) {
    if (msgInfo.targetType == 1) {
      const generatorUserSig = new GeneratorUserSig();
      await generatorUserSig.requestUserSig();
      const { userInfo, userSig, roomId } = await this.extractedAudioParams(msgInfo);
      const currentUser = msgInfo.refMsgBody.users.find(u => u.id == getSelfUserId());
      let isOriginator = currentUser ? currentUser.status == 1 : false;
      userInfo.isOriginator = isOriginator;
      console.log('userInfo, userSig, roomId ====== ', userInfo, userSig, roomId);
      if (roomId != UserInfoUtils.getCurrentUserInfo().inviteCode) {
        store.commit('SET_AUDIO_WINDOW_DISPLAY', true);
        ipcRenderer.send('audio-window', { userInfo, userSig, roomId });
      }
    }
  },

  async updateFromTypeBy_702 (msgInfo) {
    if (msgInfo.targetType == 1) {
      const { userInfo, userSig, roomId } = await this.extractedAudioParams(msgInfo);
      ipcRenderer.send('audio-window-accept-call', {
        userInfo,
        userSig,
        roomId
      });
    }
  },

  async updateFromTypeBy_703 (msgInfo) {
    if (msgInfo.targetType == 1) {
      const { userInfo, userSig, roomId } = await this.extractedAudioParams(msgInfo);
      ipcRenderer.send('audio-window-refuse-call', {
        userInfo,
        userSig,
        roomId
      });
    }
  },

  async updateFromTypeBy_704 (msgInfo) {
    if (msgInfo.targetType == 1) {
      const { userInfo, userSig, roomId } = await this.extractedAudioParams(msgInfo);
      ipcRenderer.send('audio-window-leave-call', { userInfo, userSig, roomId });
    }
  },

  async updateFromTypeBy_706 (msgInfo) {
    if (msgInfo.targetType == 1) {
      const { userInfo, userSig, roomId } = await this.extractedAudioParams(msgInfo);
      ipcRenderer.send('audio-window-cancel-call', {
        userInfo,
        userSig,
        roomId
      });
    }
  },

  async updateFromTypeBy_705 (msgInfo) {
    if (msgInfo.targetType == 1) {
      const { userInfo, userSig, roomId } = await this.extractedAudioParams(msgInfo);
      ipcRenderer.send('audio-window-overtime-call', {
        userInfo,
        userSig,
        roomId
      });
    }
  },

  async updateFromTypeBy_707 (msgInfo) {
    if (msgInfo.targetType == 1) {
      const { userInfo, userSig, roomId } = await this.extractedAudioParams(msgInfo);
      ipcRenderer.send('audio-window-busy-call', { userInfo, userSig, roomId });
    }
  },

  async updateFromTypeBy_712 (msgInfo) {
    if (msgInfo.targetType == 1) {
      const { userInfo, userSig, roomId } = await this.extractedAudioParams(msgInfo);
      ipcRenderer.send('audio-window-suspend-call', {
        userInfo,
        userSig,
        roomId
      });
    }
  },

  // 撤回消息
  async withdrawMessage (msgInfo) {
    console.log('撤回消息', msgInfo);
    const tableName = `m_${parseUniqueCode(msgInfo.uniqueCode, msgInfo.targetType)}`;
    const withdrawId = msgInfo.msgBody.msgId;
    await window.vm
      .$knex(tableName)
      .where({
        msg_id: withdrawId
      })
      .update({
        from_id: msgInfo.fromId,
        from_type: 0,
        msg_type: 26,
        msg_body: '{}',
        text: '',
        ref_body: JSON.stringify(msgInfo.refMsgBody)
      });
  },

  async deleteFriendById (friendId) {
    const exists = await window.vm.$knex.schema.hasTable('t_contacts');
    if (exists) {
      await window.vm.$knex.raw("delete from t_contacts where friend_id='" + friendId + "'");
    }
  },

  async addFriendById (friendId) {
    const exists = await window.vm.$knex.schema.hasTable('t_contacts');
    if (exists) {
      let res = await get_user_info({ id: friendId });
      if (res.code == 200) {
        this.insertOrUpdateTContacts(res.data);
      }
    }
  },

  async addGroupsById (groupId) {
    const exists = await window.vm.$knex.schema.hasTable('t_groups');
    if (exists) {
      let res = await queryGroupByGroupId({ groupId });
      if (res.code == 200) {
        await this.insertOrUpdateTGroups(res.data);
      }
    } else {
      return Promise.resolve();
    }
  },

  async updateGroupsInfo (groupsInfo) {
    const exists = await window.vm.$knex.schema.hasTable('t_groups');
    if (exists) {
      await this.insertOrUpdateTGroups(groupsInfo);
    } else {
      return Promise.resolve();
    }
  },

  async deleteGroupsById (groupId) {
    const exists = await window.vm.$knex.schema.hasTable('t_groups');
    if (exists) {
      await window.vm.$knex.raw("delete from t_groups where group_id='" + groupId + "'");
    } else {
      return Promise.resolve();
    }
  },

  async deleteGroupsMessageById (groupId) {
    const exists = await window.vm.$knex.schema.hasTable(`m_${groupId}`);
    if (exists) {
      await window.vm.$knex.schema.dropTable(`m_${groupId}`);
    } else {
      return Promise.resolve();
    }
  },

  async addGroupsMemberById (gId, queryUserId) {
    const exists = await window.vm.$knex.schema.hasTable('t_groups_member');
    if (exists) {
      ser_group_personById({
        gId,
        queryUserId
      }).then(async res => {
        if (res.code == 200) {
          await this.insertOrUpdateTGroupsMember(res.data);
          if (queryUserId == getSelfUserId()) {
            await this.insertOrUpdateTGroupsMemberAuth(res.data);
          }
        }
      });
    } else {
      return Promise.resolve();
    }
  },

  async addGroupsMemberByGroupId (gId) {
    const exists = await window.vm.$knex.schema.hasTable('t_groups_member');
    if (exists) {
      await ser_group_member({
        gId
      }).then(async res => {
        if (res.code == 200) {
          for (let item of res.data) {
            await this.insertOrUpdateTGroupsMember(item);
          }
        }
      });
    } else {
      return Promise.resolve();
    }
  },

  async addGroupsMemberByMsgInfo (item) {
    const exists = await window.vm.$knex.schema.hasTable('t_groups_member');
    if (exists) {
      let users = item.refMsgBody.users;
      for (let user of users) {
        user.memberNotes = '';
        user.forbiddenWordsStatus = 0;
        user.muteNotifications = 0;
        user.additionalStatus = 0;
        user.mutedStatus = 0;
        user.stickyStatus = 0;
        await this.insertOrUpdateTGroupsMember(user);
      }
    } else {
      return Promise.resolve();
    }
  },

  async deleteGroupsMemberById (groupId, userId) {
    const exists = await window.vm.$knex.schema.hasTable('t_groups_member');
    if (exists) {
      await window.vm.$knex.raw(
        `update t_groups_member set is_show='false', isDeleted=1, auth_status=3, forbiddenWordsStatus=0,
        member_notes='', member_notes_pinyin='' where id=${userId} and group_id=${groupId}`
      );
    } else {
      return Promise.resolve();
    }
  },

  async deleteGroupsPeople (groupId) {
    await window.vm.$knex.raw("update t_groups set people=people-1 where group_id='" + groupId + "'");
  },

  async deleteGroupsMember (groupId) {
    const exists = await window.vm.$knex.schema.hasTable('t_groups_member');
    if (exists) {
      await window.vm.$knex.raw("delete from t_groups_member where group_id='" + groupId + "'");
    } else {
      return Promise.resolve();
    }
  },

  async deleteGroupsMemberAuth (groupId) {
    const exists = await window.vm.$knex.schema.hasTable('t_groups_member_auth');
    if (exists) {
      await window.vm.$knex.raw("delete from t_groups_member_auth where group_id='" + groupId + "'");
    } else {
      return Promise.resolve();
    }
  },

  async deleteGroupsMemberAuthById (groupId, userId) {
    const exists = await window.vm.$knex.schema.hasTable('t_groups_member_auth');
    if (exists) {
      await window.vm.$knex.raw(`delete from t_groups_member_auth where user_id=${userId} and group_id=${groupId}`);
    } else {
      return Promise.resolve();
    }
  },

  async updatePeopleInGroups (groupId) {
    let param = { groupId };
    let res = await queryGroupByGroupId(param);
    if (res.code == '200' && res.data) {
      const exists = await window.vm.$knex.schema.hasTable('t_groups');
      if (exists) {
        await window.vm
          .$knex('t_groups')
          .where('group_id', '=', groupId)
          .update({ people: res.data.people });
      }
    }
  },

  async deleteSessionsById (id) {
    const exists = await window.vm.$knex.schema.hasTable('t_sessions');
    if (exists) {
      await window.vm.$knex.raw("delete from t_sessions where id='" + id + "'");
    }
  },

  async insertOrUpdateTContacts (item) {
    const obj = this.getTContactsItem(item);
    await window.vm.$knex('t_contacts').insert(obj).onConflict('friend_id').merge();
  },

  async insertOrUpdateTGroups (item) {
    const obj = this.getTGroupsItem(item);
    await window.vm.$knex('t_groups').insert(obj).onConflict('group_id').merge();
  },

  async insertOrUpdateTGroupsMember (item) {
    const obj = this.getTGroupsMemberItem(item);
    try {
      // let data=await window.vm.$knex('t_groups_member').where({id:obj['id'],group_id:obj['group_id']}).select()
      // console.log(data)
      let upsert = await window.vm.$knex('t_groups_member').insert(obj).onConflict(["id", "group_id"]).merge();
      // await window.vm.$knex('t_groups_member').insert(obj).onConflict('id, group_id').merge();
      console.log(upsert)
    } catch (error) {
      console.error(error)
    }

  },

  async insertOrUpdateTGroupsMemberAuth (item) {
    const obj = this.getTGroupsMemberAuthItem(item);
    await window.vm.$knex('t_groups_member_auth').insert(obj).onConflict(["user_id", "group_id"]).merge();
  },

  async updateGroupsMemberAuthStatusById (item) {
    let userId = item.refMsgBody.users[0].id;
    let groupId = item.targetId;
    let searchRet = await window.vm
      .$knex('t_groups_member')
      .where({ id: userId })
      .where('group_id', '=', groupId)
      .select();
    if (searchRet && searchRet.length > 0) {
      await window.vm
        .$knex('t_groups_member')
        .where('id', '=', userId)
        .where('group_id', '=', groupId)
        .update({
          auth_status: item.refMsgBody.authStatus
        });
    }
  },

  async updateTGroupsMemberMemberNotes (item) {
    let userId = item.refMsgBody.users[0].id;
    let groupId = item.targetId;
    let searchRet = await window.vm
      .$knex('t_groups_member')
      .where({ id: userId })
      .where('group_id', '=', groupId)
      .select();
    if (searchRet && searchRet.length > 0) {
      await window.vm
        .$knex('t_groups_member')
        .where('id', '=', userId)
        .where('group_id', '=', groupId)
        .update({
          member_notes: item.refMsgBody.memberNotes,
          member_notes_pinyin: convertToPinyin(item.refMsgBody.memberNotes)
        });
    }
  },

  async insertOrUpdateTContactsPubkey (userId) {
    let res = await get_use_rsa({
      userIds: userId
    });
    if (res.data && res.data.length > 0) {
      const obj = {
        user_id: userId,
        rsa_pub: res.data[0].rsaPub,
        rsa_pub_version: res.data[0].rsaPubVersion,
        latest_version: res.data[0].latestVersion
      };
      await window.vm.$knex('t_contacts_pubkey').insert(obj).onConflict('user_id').merge();
    }
  },

  async deleteContactsPubkey (friendId) {
    if (friendId) {
      await window.vm
        .$knex('t_contacts_pubkey')
        .where({ user_id: friendId })
        .del();
    }
  },

  getTContactsItem (item) {
    const obj = {
      friend_id: item.id,
      friend_nick_name: item.userNickName,
      friend_nick_name_pinyin: convertToPinyin(item.userNickName),
      friend_head_img: item.userHeadImg,
      friend_head_img_local: '',
      friend_friendNotes_pinyin: convertToPinyin(item.friendNotes),
      invite_code: item.inviteCode,
      vipType: item.vipType,
      inviteCodeType: item.inviteCodeType,
      userRank: item.userRank
    };
    if (item.friendNotes) {
      obj.friend_friendNotes = item.friendNotes;
    }
    return obj;
  },

  getTGroupsItem (item) {
    return !item
      ? {}
      : {
        group_id: item.id,
        group_name: item.groupName,
        group_status: item.groupStatus,
        group_profile: item.groupProfile,
        group_avatar: item.groupAvatar,
        group_avatar_local: '',
        add_check: item.addCheck,
        invite_auth: item.inviteAuth,
        country: item.country,
        city: item.city,
        screenshotsReminderStatus: item.screenshotsReminderStatus,
        forbiddenWordsStatus: item.forbiddenWordsStatus,
        memberSingleChatStatus: item.memberSingleChatStatus,
        sendPicturesStatus: item.sendPicturesStatus,
        sendConnectionStatus: item.sendConnectionStatus,
        copyMessagesStauts: item.copyMessagesStauts,
        sendRedpacketStatus: item.sendRedpacketStatus,
        create_time: item.createdOn,
        save_time: item.saveTime,
        people: item.people,
        maxPeople: item.maxPeople,
        member_level_status: item.memberLevelStatus,
        group_level: item.groupLevel,
        updatedOn: item.createdOn,
        code: '',
        group_name_pinyin: convertToPinyin(item.groupName),
        is_show: 'true',
        group_code: item.groupCode,
        group_type: item.groupType != 1 ? 0 : 1,
        groupTab: item.groupTab
      };
  },

  getTGroupsMemberItem (item) {
    return {
      id: item.userId,
      group_id: item.groupId,
      auth_status: item.authStatus,
      nick_name: item.nickName,
      user_head_img: item.userHeadImg,
      user_head_img_local: '',
      member_notes: item.memberNotes,
      member_notes_pinyin: convertToPinyin(item.memberNotes),
      is_show: 'true',
      forbiddenWordsStatus: item.forbiddenWordsStatus,
      muteNotifications: item.muteNotifications,
      additionalStatus: item.additionalStatus,
      mutedStatus: item.mutedStatus,
      stickyStatus: item.stickyStatus,
      vipType: item.vipType,
      inviteCodeType: item.inviteCodeType,
      userRank: item.userRank,
      inviteCode: item.inviteCode,
      joinTime: Date.now(item.joinTime),
      isDeleted: 0
    };
  },

  getTGroupsMemberAuthItem (item) {
    return {
      group_id: item.groupId,
      user_id: item.userId,
      member_leval: item.memberLeval,
      muted_status: item.mutedStatus,
      additional_status: item.additionalStatus,
      mute_notifications: item.muteNotifications,
      forbidden_words_status: item.forbiddenWordsStatus,
      sticky_status: item.stickyStatus,
      user_level: item.userLevel
    };
  },
  /**
   * 真实删除数据库
   * @param {number} [type=0] 0: 检查过期消息并删除  1：删除所有
   * @memberof Message
   */
  async deleteMessageByRealtype (type = 0) {
    let messageList = await window.vm.$knex.raw(`SELECT name FROM sqlite_master WHERE type='table' and name like 'm_%' ORDER BY name;`);
    messageList = messageList.filter(item => {
      return item.name !== 'm_1008455862495526912' && item.name !== 'm_1032384035881537536';
    });
    console.log('messageList', messageList);
    for (let table of messageList) {
      const id = table.name.split('m_')[1];
      console.log('id======', table.name, id);
      const maxOrders = await window.vm.$knex(`${table.name}`).max(`msg_order as msgOrder`);
      // maxOrder = maxOrder[0]['maxOrder'];
      const maxOrder = maxOrders[0].msgOrder;
      let del;
      if (!type) {
        del = await window.vm
          .$knex(`${table.name}`)
          .where('effectiveTimeDate', '<', `${new Date().getTime()}`)
          .del();
      } else {
        del = await window.vm.$knex(`${table.name}`).del();
      }
      console.log('清除过期消息', del);
      const count = await window.vm.$knex(`${table.name}`).count({ count: 'target_id' });
      console.log('清除过期消息后', table.name, count);
      if (!count) {
        await window.vm.$knex(`${table.name}`).insert({
          id,
          req_id: uuidv4(),
          from_type: 998,
          msg_type: 0,
          msg_order: maxOrder,
          timestamp: new Date().getTime() + '',
        });
        // 同时清除会话列表消息内容
        await window.vm.$knex('t_sessions').where({ id }).update({
          text: null,
          msgBody: null,
        })
      }
    }
  },

  async getMaxMsgOrderInMessages (id) {
    const message = new Message(id);
    return await message.getMaxMsgOrder();
  },

  async insertFileChatContent (item) {
    const message = new Message(item.id);
    console.log('insertFileChatContent ===>');
    await message.insertMessage({
      req_id: item.reqId,
      target_type: item.targetType,
      target_id: item.targetId,
      from_type: item.fromType,
      from_id: item.fromId,
      msg_type: item.msgType,
      msg_id: item.msgId,
      msg_order: item.msgOrder,
      unique_code: item.uniqueCode,
      timestamp: item.timestamp,
      msg_header: JSON.stringify(item.msgHeader),
      msg_body: (item.msgBody ? JSON.stringify(item.msgBody) : null),
      ref_body: JSON.stringify(item.refMsgBody),
      status: item.sendStatus,
      read_status: item.readStatus,
      text: '',
      effectiveTimeDate: item.msgHeader.effectiveTime,
      isDecrypt: 1
    });
  },

  async updateApplyFriendNumber () {
    const exists = await window.vm.$knex.schema.hasTable('t_system_message');
    if (exists) {
      await window.vm.$knex.raw('update t_system_message set applyFriendNumber = applyFriendNumber + 1');
    }
  },

  async updateRequestFriendNumber () {
    const exists = await window.vm.$knex.schema.hasTable('t_system_message');
    if (exists) {
      await window.vm.$knex.raw('update t_system_message set requestFriendNumber = requestFriendNumber + 1');
    }
  },

  async updateRejectFriendNumber () {
    const exists = await window.vm.$knex.schema.hasTable('t_system_message');
    if (exists) {
      await window.vm.$knex.raw('update t_system_message set rejectFriendNumber = rejectFriendNumber + 1');
    }
  },

  async getTotalSystemNumber () {
    const exists = await window.vm.$knex.schema.hasTable('t_system_message');
    if (exists) {
      let record = await window.vm.$knex.raw('select applyFriendNumber, requestFriendNumber, rejectFriendNumber from t_system_message');
      return record[0].applyFriendNumber + record[0].requestFriendNumber + record[0].rejectFriendNumber;
    }
    return 0;
  },

  async clearSystemMessageNumber () {
    const exists = await window.vm.$knex.schema.hasTable('t_system_message');
    if (exists) {
      await window.vm.$knex.raw('update t_system_message set applyFriendNumber = 0, requestFriendNumber = 0, rejectFriendNumber = 0');
    }
  },

  async sendMessageFail (groupId, reqId) {
    const message = new Message(groupId);
    await message.setMessageSendFail(reqId);
  },

  async sendMessageStatusSending (groupId, reqId) {
    const message = new Message(groupId);
    await message.setMessageSending(reqId);
  },

  async updateGroupsMemberForbiddenWordsStatus (item) {
    await window.vm
      .$knex('t_groups_member')
      .where('id', '=', item.userId)
      .where('group_id', '=', item.groupId)
      .update({ forbiddenWordsStatus: item.forbiddenWordsStatus });
  },

  async updateGroupsForbiddenWordsStatus (item) {
    await window.vm
      .$knex('t_groups')
      .where('group_id', '=', item.groupId)
      .update({ forbiddenWordsStatus: item.forbiddenWordsStatus });
  },

  async updateGroupsSendPicturesStatus (item) {
    await window.vm
      .$knex('t_groups')
      .where('group_id', '=', item.groupId)
      .update({ sendPicturesStatus: item.sendPicturesStatus });
  },

  async updateGroupsSendConnectionStatus (item) {
    await window.vm
      .$knex('t_groups')
      .where('group_id', '=', item.groupId)
      .update({ sendConnectionStatus: item.sendConnectionStatus });
  },

  async updateGroupsSendRedpacketStatus (item) {
    await window.vm
      .$knex('t_groups')
      .where('group_id', '=', item.groupId)
      .update({ sendRedpacketStatus: item.sendRedpacketStatus });
  },

  async updateGroupsMemberSingleChatStatus (item) {
    await window.vm
      .$knex('t_groups')
      .where('group_id', '=', item.groupId)
      .update({ memberSingleChatStatus: item.memberSingleChatStatus });
  },

  async retrieveGroupsInfo (groupId) {
    let sql = `select g.* from t_groups g where g.group_id = ${groupId}`;
    let groupsInfo = await window.vm.$knex.raw(sql);
    if (groupsInfo && groupsInfo.length > 0) {
      return {
        id: groupsInfo[0].group_id,
        groupId: groupsInfo[0].group_id,
        groupName: groupsInfo[0].group_name,
        groupNamePinyin: groupsInfo[0].group_name_pinyin,
        groupStatus: groupsInfo[0].group_status,
        groupProfile: groupsInfo[0].group_profile,
        groupAvatar: groupsInfo[0].group_avatar,
        addCheck: groupsInfo[0].add_check,
        inviteAuth: groupsInfo[0].invite_auth,
        country: groupsInfo[0].country,
        city: groupsInfo[0].city,
        screenshotsReminderStatus: groupsInfo[0].screenshotsReminderStatus,
        forbiddenWordsStatus: groupsInfo[0].forbiddenWordsStatus,
        memberSingleChatStatus: groupsInfo[0].memberSingleChatStatus,
        sendPicturesStatus: groupsInfo[0].sendPicturesStatus,
        sendConnectionStatus: groupsInfo[0].sendConnectionStatus,
        copyMessagesStauts: groupsInfo[0].copyMessagesStauts,
        sendRedpacketStatus: groupsInfo[0].sendRedpacketStatus,
        is_show: groupsInfo[0].is_show,
        groupCode: groupsInfo[0].group_code,
        people: groupsInfo[0].people,
        maxPeople: groupsInfo[0].maxPeople,
        groupType: groupsInfo[0].group_type,
        saveTime: groupsInfo[0].save_time,
        groupTab: groupsInfo[0].groupTab
      };
    }
    return {};
  },

  async getTAreaCountryOrCityName (code) {
    let lan = window.vm.$i18n.locale;
    let sql = `select name from t_area where code='${code}' and language='${lan}'`;
    let name = await window.vm.$knex.raw(sql);
    if (name && name.length > 0) {
      return name[0].name;
    }
    return '';
  },

  async getTAreaCountryList (lang) {
    // let lan = window.vm.$i18n.locale;
    let lan = lang || window.vm.$i18n.locale;
    let sql = `select id, name, code, father_id, language from t_area where language='${lan}' and father_id=0`;
    return await window.vm.$knex.raw(sql);
  },

  async getTAreaCityList (fatherId) {
    let lan = window.vm.$i18n.locale;
    let sql = `select id, name, code, father_id, language from t_area where language='${lan}' and father_id=${fatherId}`;
    return await window.vm.$knex.raw(sql);
  },

  async updateTGroupsInfo (item) {
    const obj = {
      group_id: item.id,
      group_name: item.groupName,
      group_profile: item.groupProfile,
      group_avatar: item.groupAvatar,
      country: item.country,
      city: item.city,
      groupTab: item.groupTab
    };
    await window.vm
      .$knex('t_groups')
      .where('group_id', '=', item.id)
      .update(obj);
  },

  async updateNickNameInTGroupsMember (id, nickName) {
    await window.vm.$knex.raw("update t_groups_member set nick_name='" + nickName + "' where id='" + id + "'");
  },

  async updateDownloadFileMsgBody (item, friendId) {
    const message = new Message(friendId);
    await message.updateMsgBody(item);
  },
  arrayCompare (property) {
    return (obj1, obj2) => {
      let value1 = obj1[property];
      let value2 = obj2[property];
      return value2 - value1;
    };
  },

  async updateTSessionsNoNoticeFlag (item) {
    // await window.vm
    //   .$knex('t_sessions')
    //   .where('id', '=', item.targetId)
    //   .update({ noNoticeFlag: item.refMsgBody.noNoticeFlag });
    await this.updateTSessionsStatus(item.targetType, item.targetId, 'noNoticeFlag','muteNotifications', item.refMsgBody.noNoticeFlag)
    let noNoticeSession = store.state.common.noNoticeSessions;
    if (item.refMsgBody.noNoticeFlag == 1) {
      noNoticeSession.push(item.targetId);
    } else {
      _.pull(noNoticeSession, item.targetId);
    }
  },

  async updateTSessionsTopFlag (item) {
    // await window.vm
    //   .$knex('t_sessions')
    //   .where('id', '=', item.targetId)
    //   .update({ topFlag: item.refMsgBody.topFlag });
    await this.updateTSessionsStatus(item.targetType, item.targetId, 'topFlag','stickyStatus', item.refMsgBody.topFlag)
  },

  async updateTSessionsStatus(targetType, targetId, type, type1, value){
    await window.vm
      .$knex('t_sessions')
      .where('id', '=', targetId)
      .update({ [type]: value });
    if(targetType===1){
      await window.vm
        .$knex('t_contacts')
        .where('friend_id', '=', targetId)
        .update({ [type]: value });
    } else if(targetType===2){
      await window.vm
        .$knex('t_groups_member')
        .where({
          id: UserInfoUtils.getCurrentUserId(),
          group_id: targetId
        })
        .update({ [type1]: value });
    }
    
    // await window.vm
    //   .$knex('t_groups')
    //   .where('group_id', '=', targetId)
    //   .update({ [type]: value });
    
  },

  async getALLAtUserList (groupId, authStatus) {
    const sql = `SELECT
        m.*, c.friend_friendNotes as friendNotes,
        c.friend_friendNotes_pinyin As friendNotes_pinyin
      FROM t_groups_member AS m
      LEFT JOIN t_contacts AS c ON m.id = c.friend_id
      WHERE m.isDeleted = 0 and m.is_show = 'true' and m.group_id = '${groupId}'
      order by m.auth_status, m.joinTime`;
    let list = await sqliteQueryBySQL(sql);
    list = list.map(item => {
      return {
        id: item.id,
        image: item.user_head_img,
        nickName: item.friendNotes || item.nick_name,
        value: item.nick_name,//mention
        nick_name: item.nick_name,
        nick_name_pinyin: convertToPinyin(item.nick_name),
        auth_status: item.auth_status,
        member_notes: item?.member_notes,
        member_notes_pinyin: item.member_notes_pinyin,
        friendNotes: item.friendNotes,
        friendNotes_pinyin: item.friendNotes_pinyin,
        inviteCode: item.inviteCode,
        joinTime: item.joinTime // 群聊 没有这个字段？
      };
    });
    if (['2', '1'].includes(authStatus)) {
      list.push({
        image: '',
        nickName: '所有人',
        nick_name: '所有人',
        nick_name_pinyin: 'suoyouren',
        value: 'all',//mention
        id: "all",
      });
    }
    list = list.filter(item => item.id != UserInfoUtils.getCurrentUserId());
    return list;
  },
  //更新群警告封停状态
  async updateGroupsAppealInfo (item) {
    let sql = `select * from t_groups_appeal where group_id = "${item.targetId}"`;
    let groupsAppealInfo = await window.vm.$knex.raw(sql);
    if (groupsAppealInfo.length === 0) {
      const obj = {
        group_id: item.targetId,
        closure_create_time: '',
        closure_end_time: '',
        closure_impeach_reason: '',
        closure_limit_day: 0,
        closure_limit_type: 0,
        show_appeal_closure_notice: 0,
        warn_create_time: '',
        warn_end_time: '',
        warn_impeach_reason: '',
        warn_limit_day: 0,
        warn_limit_type: 0,
        show_appeal_warn_notice: 0,
      }
      await window.vm.$knex('t_groups_appeal').insert(obj);
    }
    if (item.fromType === 423) {
      //警告
      await window.vm
        .$knex('t_groups_appeal')
        .where('group_id', '=', item.targetId)
        .update({
          warn_create_time: item.msgBody.createTime,
          warn_end_time: item.msgBody.endTime,
          warn_impeach_reason: item.msgBody.impeachReason,
          warn_limit_day: item.msgBody.limitDay,
          warn_limit_type: item.msgBody.limitType,
          show_appeal_warn_notice: 1
        });
    } else if (item.fromType === 424) {
      //封停
      await window.vm
        .$knex('t_groups_appeal')
        .where('group_id', '=', item.targetId)
        .update({
          closure_create_time: item.msgBody.createTime,
          closure_end_time: item.msgBody.endTime,
          closure_impeach_reason: item.msgBody.impeachReason,
          closure_limit_day: item.msgBody.limitDay,
          closure_limit_type: item.msgBody.limitType,
          show_appeal_closure_notice: 1,
        });
    } else if (item.fromType === 437) {
      //解除群警告
      await window.vm
        .$knex('t_groups_appeal')
        .where('group_id', '=', item.targetId)
        .update({
          warn_create_time: '',
          warn_end_time: '',
          warn_impeach_reason: '',
          warn_limit_day: 0,
          warn_limit_type: 0,
          show_appeal_warn_notice: 0
        });
    } else if (item.fromType === 425) {
      //解除封停
      await window.vm
        .$knex('t_groups_appeal')
        .where('group_id', '=', item.targetId)
        .update({
          closure_create_time: '',
          closure_end_time: '',
          closure_impeach_reason: '',
          closure_limit_day: 0,
          closure_limit_type: 0,
          show_appeal_closure_notice: 0,
        });
    } else {
      //解除群所有限制
      await window.vm
        .$knex('t_groups_appeal')
        .where('group_id', '=', item.targetId)
        .update({
          closure_create_time: '',
          closure_end_time: '',
          closure_impeach_reason: '',
          closure_limit_day: 0,
          closure_limit_type: 0,
          show_appeal_closure_notice: 0,
          warn_create_time: '',
          warn_end_time: '',
          warn_impeach_reason: '',
          warn_limit_day: 0,
          warn_limit_type: 0,
          show_appeal_warn_notice: 0
        });
    }
    ipcRenderer.send('group-appeal');
  },

  //离线更新群警告封停状态
  async updateGroupsAppealInfoByLimitType (item) {
    const groupId = BigInt(item.groupId).toString();
    let sql = `select * from t_groups_appeal where group_id = "${groupId}"`;
    let groupsAppealInfo = await window.vm.$knex.raw(sql);
    if (groupsAppealInfo.length === 0) {
      const obj = {
        group_id: groupId,
        closure_create_time: '',
        closure_end_time: '',
        closure_impeach_reason: '',
        closure_limit_day: 0,
        closure_limit_type: 0,
        show_appeal_closure_notice: 0,
        warn_create_time: '',
        warn_end_time: '',
        warn_impeach_reason: '',
        warn_limit_day: 0,
        warn_limit_type: 0,
        show_appeal_warn_notice: 0,
      }
      await window.vm.$knex('t_groups_appeal').insert(obj);
    }
    if (item.limitType === 4) {
      //警告
      await window.vm
        .$knex('t_groups_appeal')
        .where('group_id', '=', groupId)
        .update({
          warn_create_time: item.createTime,
          warn_end_time: item.endTime,
          warn_impeach_reason: item.impeachReason,
          warn_limit_day: item.limitDay,
          warn_limit_type: item.limitType,
          show_appeal_warn_notice: 1
        });
    } else if (item.limitType === 5) {
      //封停
      await window.vm
        .$knex('t_groups_appeal')
        .where('group_id', '=', groupId)
        .update({
          closure_create_time: item.createTime,
          closure_end_time: item.endTime,
          closure_impeach_reason: item.impeachReason,
          closure_limit_day: item.limitDay,
          closure_limit_type: item.limitType,
          show_appeal_closure_notice: 1,
        });
    }
    ipcRenderer.send('group-appeal');
  },

  //查询群警告封停状态
  async retrieveGroupsAppealInfo (groupId) {
    let sql = `select * from t_groups_appeal where group_id = "${groupId}"`;
    let groupsAppealInfo = await window.vm.$knex.raw(sql);
    if (groupsAppealInfo.length > 0) {
      if (groupsAppealInfo[0].show_appeal_closure_notice === 1 && groupsAppealInfo[0].show_appeal_warn_notice === 1) {
        return {
          groupId: groupsAppealInfo[0].group_id,
          createTime: groupsAppealInfo[0].closure_create_time,
          endTime: groupsAppealInfo[0].closure_end_time,
          impeachReason: groupsAppealInfo[0].closure_impeach_reason,
          limitDay: groupsAppealInfo[0].closure_limit_day,
          limitType: groupsAppealInfo[0].closure_limit_type,
          showAppealClosureNotice: groupsAppealInfo[0].show_appeal_closure_notice,
          showAppealWarnNotice: groupsAppealInfo[0].show_appeal_warn_notice
        };
      } else {
        if (groupsAppealInfo[0].show_appeal_closure_notice === 1) {
          return {
            groupId: groupsAppealInfo[0].group_id,
            createTime: groupsAppealInfo[0].closure_create_time,
            endTime: groupsAppealInfo[0].closure_end_time,
            impeachReason: groupsAppealInfo[0].closure_impeach_reason,
            limitDay: groupsAppealInfo[0].closure_limit_day,
            limitType: groupsAppealInfo[0].closure_limit_type,
            showAppealClosureNotice: groupsAppealInfo[0].show_appeal_closure_notice,
            showAppealWarnNotice: groupsAppealInfo[0].show_appeal_warn_notice
          };
        } else if (groupsAppealInfo[0].show_appeal_warn_notice === 1) {
          return {
            groupId: groupsAppealInfo[0].group_id,
            createTime: groupsAppealInfo[0].warn_create_time,
            endTime: groupsAppealInfo[0].warn_end_time,
            impeachReason: groupsAppealInfo[0].warn_impeach_reason,
            limitDay: groupsAppealInfo[0].warn_limit_day,
            limitType: groupsAppealInfo[0].warn_limit_type,
            showAppealClosureNotice: groupsAppealInfo[0].show_appeal_closure_notice,
            showAppealWarnNotice: groupsAppealInfo[0].show_appeal_warn_notice
          };
        } else {
          return {
            groupId: groupsAppealInfo[0].group_id,
            createTime: '',
            endTime: '',
            impeachReason: '',
            limitDay: 0,
            limitType: 0,
            showAppealClosureNotice: 0,
            showAppealWarnNotice: 0
          };
        }
      }
    }
    return {};
  },

  //删除群警告封停信息
  async deleteGroupsAppealById (groupId) {
    const exists = await window.vm.$knex.schema.hasTable('t_groups_appeal');
    if (exists) {
      await window.vm.$knex.raw("delete from t_groups_appeal where group_id='" + groupId + "'");
    } else {
      return Promise.resolve();
    }
  },

  //更新群人数上限预警
  async updateGroupsExceedInfo (item) {
    let sql = `select * from t_groups_exceed where group_id = "${item.targetId}"`;
    let groupsExceedInfo = await window.vm.$knex.raw(sql);
    if (groupsExceedInfo.length === 0) {
      const obj = {
        group_id: item.targetId,
        exceed_num: 0,
        show_exceed_notice: 0,
      }
      await window.vm.$knex('t_groups_exceed').insert(obj);
    }
    if (item.fromType === 439) {
      //预警
      await window.vm
        .$knex('t_groups_exceed')
        .where('group_id', '=', item.targetId)
        .update({
          exceed_num: item.msgBody.msgNum,
          show_exceed_notice: 1,
        });
    } else {
      //解除
      await window.vm
        .$knex('t_groups_exceed')
        .where('group_id', '=', item.targetId)
        .update({
          exceed_num: 0,
          show_exceed_notice: 0,
        });
    }
    ipcRenderer.send('group-exceed');
  },

  //离线更新群人数上限预警
  async updateGroupsExceedInfoByLimitType (item) {
    const groupId = BigInt(item.groupId).toString();
    let sql = `select * from t_groups_exceed where group_id = "${groupId}"`;
    let groupsExceedInfo = await window.vm.$knex.raw(sql);
    if (groupsExceedInfo.length === 0) {
      const obj = {
        group_id: groupId,
        exceed_num: 0,
        show_exceed_notice: 0,
      }
      await window.vm.$knex('t_groups_exceed').insert(obj);
    }
    //预警
    await window.vm
      .$knex('t_groups_exceed')
      .where('group_id', '=', groupId)
      .update({
        exceed_num: item.msgNum,
        show_exceed_notice: 1,
      });
    ipcRenderer.send('group-exceed');
  },

  //查询群人数上限预警状态
  async retrieveGroupsExceedInfo (groupId) {
    let sql = `select * from t_groups_exceed where group_id = "${groupId}"`;
    let groupsExceedInfo = await window.vm.$knex.raw(sql);
    if (groupsExceedInfo.length > 0) {
      return {
        groupId: groupsExceedInfo[0].group_id,
        exceedNum: groupsExceedInfo[0].exceed_num,
        showExceedNotice: groupsExceedInfo[0].show_exceed_notice,
      };
    }
    return {};
  },

  //删除群人数上限预警信息
  async deleteGroupsExceedById (groupId) {
    const exists = await window.vm.$knex.schema.hasTable('t_groups_exceed');
    if (exists) {
      await window.vm.$knex.raw("delete from t_groups_exceed where group_id='" + groupId + "'");
    } else {
      return Promise.resolve();
    }
  },

  // 根据reqId或者msgId更新聊天消息
  async updateChatMsgByReqIdOrMsgId (tableName, msgId, reqId, updateContent) {
    if (!tableName || (!msgId && !reqId)) {
      return null;
    }
    await window.vm.$knex(tableName).where({ 'msg_id': msgId }).orWhere({ 'req_id': reqId }).update(updateContent)
  },
  // 根据reqId或者msgId查找聊天消息
  async findChatMsgByReqIdOrMsgId (tableName, msgId, reqId) {
    if (!tableName || (!msgId && !reqId)) {
      return null;
    }
    const results = await window.vm.$knex(tableName).where({ 'msg_id': msgId }).orWhere({ 'req_id': reqId }).select();
    if (results && results.length) {
      let temp = results[0];
      let obj = {}
      for (let key in temp) {
        let keyAlias = key.replace(/_([a-zA-Z])/g, (val, letter) => {
          return letter.toUpperCase();
        })
        obj[keyAlias] = temp[key];
      }
      if (obj.msgBody) {
        obj.msgBody = JSON.parse(obj.msgBody)
      }
      if (obj.refBody) {
        obj.refMsgBody = JSON.parse(obj.refBody)
      }
      return obj;
    }
    return null;
  },
  async queryLastMsgList (currentFlag = sessionStorage.showLastMsgList) {
    //从t_session表里查询会话列表
    let res = await window.vm.$knex.raw(`
      SELECT
      s.unread,
      s.topFlag,
      s.noNoticeFlag,
      s.timestamp,
      s.updateTime,
      s.id,
      s.fromId,
      s.targetType,
      s.uniqueCode,
      s.isAt,
      s.fromType,
      s.lastMsgId,
      s.msgType,
      s.text,
      s.refMsgBody,
      s.msgBody,
      s.draftText,
      s.draftHtml,
      s.draftTime,
      g.group_type as groupType,
      g.forbiddenWordsStatus as forbiddenWordsStatus,
      ifnull(nullif(c.friend_friendNotes, ''), ifnull(c.friend_nick_name, g.group_name)) sessionName,
      ifnull(c.friend_head_img, g.group_avatar) sessionIcon,
      ifnull(c.invite_code, g.group_code) code,
      ifnull(nullif(c.friend_nick_name_pinyin, ''), g.group_name_pinyin) pinyin,
      c.friend_friendNotes_pinyin notes_pinyin,
      ifnull(c.friend_nick_name, '') friendNickName,
      ifnull(c.friend_friendNotes, '') friendFriendNotes,
      ifnull(cc.friend_friendNotes, '') gfriendFriendNotes,
      g.people,
      gm.nick_name as fromName,
      tgm.auth_status as authStatus,
      tgm.forbiddenWordsStatus as memberForbiddenWordsStatus,
      c.vipType,
      c.inviteCodeType,
      c.userRank
    FROM t_sessions s
    LEFT JOIN t_contacts c ON c.friend_id = s.id
    LEFT JOIN t_contacts cc on cc.friend_id = s.fromId
    LEFT JOIN t_groups g ON s.id = g.group_id
    LEFT JOIN t_groups_member gm on s.id = gm.group_id and gm.is_show='true' and gm.id=s.fromId
    LEFT JOIN t_groups_member tgm on s.id = tgm.group_id and tgm.id = '${UserInfoUtils.getCurrentUserId()}'
    WHERE s.isDeleted = 0 GROUP BY s.id;`);
    let list = [];
    console.log('查询所有消息', res)
    for (let element of res) {
      //异常处理,没有找到对应的好友或者群
      if (element.sessionName == null || element.sessionName == '' || element.id == UserInfoUtils.getCurrentUserId()) {
        continue;
      }
      // let tableName = `m_${element.id}`;
      let groupType = element.groupType;
      if (element.targetType == '2' && groupType != 0 && groupType != 1) {
        continue;
      }
      if (element.refMsgBody) {
        element.refMsgBody = JSON.parse(element.refMsgBody);
      }
      if (element.msgBody) {
        element.msgBody = JSON.parse(element.msgBody);
      } 
      if (element.gfriendFriendNotes) {
        element.fromName = element.gfriendFriendNotes;
      }
      // if(!element.lastMsgId){

      //   const isExistsTable = await window.vm.$knex.schema.hasTable(tableName);
      //   if (!isExistsTable) {
      //       continue;
      //   }

      // if(isExistsTable){
      //   let lastmessages = await window.vm.$knex.raw(
      //     `
      //       select m.msg_id, m.msg_type, m.from_type, m.text, m.from_id, m.timestamp, m.ref_body, m.msg_body, 
      //       ifnull(nullif(c.friend_friendNotes,''), c.friend_nick_name) nick_name_c, 
      //       gm.nick_name nick_name_gm 
      //       from ${tableName} m 
      //       left join t_contacts c on c.friend_id = m.from_id 
      //       left join t_groups_member gm on gm.group_id = ${element.id} and gm.id=m.from_id 
      //       where m.msg_type in (${lastMessagesInView_msgType.toString()}) and
      //       m.from_type not in (${lastMessagesNotInView_fromType.toString()}) and m.status > 1 and
      //       m.isDeleted = 0 ORDER BY m.msg_order DESC, m.timestamp DESC LIMIT 1;
      //     `
      //   );//fromType = 95看点资讯收到评论提醒
      //   if (lastmessages && lastmessages.length == 1) {
      //     let lastmessage = lastmessages[0];
      //     element.lastMsgId = lastmessage.msg_id;
      //     element.msgType = lastmessage.msg_type;
      //     element.fromType = lastmessage.from_type;
      //     element.text = lastmessage.text;
      //     element.fromId = lastmessage.from_id;
      //     element.timestamp = lastmessage.timestamp;
      //     element.updateTime = lastmessage.timestamp;
      //     element.refMsgBody = JSON.parse(lastmessage.ref_body);
      //     if (lastmessage.msg_type == '6' || lastmessage.msg_type == '26') {
      //       element.msgBody = JSON.parse(lastmessage.msg_body);
      //     }
      //     if (element.targetType == '2' && element.fromId) {
      //       // 群内取昵称
      //       element.fromName = lastmessage.nick_name_gm;
      //     }
      //   }
      // }

      if (element.targetType == '2' && (element.msgType == '4' || element.msgType == '7')) {
        // 一 如果群聊，查询发消息的nickname
        // await this.dispatch('GET_MEM_LIST', element.id);
        // const membList = this.state.search.membList;
        // if (membList.length) {
        //   let receiverItem = membList.find(item => item.id == element.refMsgBody.users?.[0]?.userId);
        //   console.log(receiverItem)
        //   if (receiverItem) {
        //     element.targetName =
        //       (element.authStatus == 3 ? receiverItem.group_member_friend_name : receiverItem.group_member_name) ||
        //       element.refMsgBody.users[0].name ||
        //       element.refMsgBody.users[0].nickName ||
        //       'Douglas';
        //   } else {
        //     element.targetName = element.refMsgBody.users?.[0]?.name || element.refMsgBody.users?.[0]?.nickName || '';
        //   }
        // }
        // 二 如果群聊，查询发消息的nickname 精确查询（排除查询群组中所有成员的详细信息） 
        // eslint-disable-next-line max-len
        let SELECT_SQL = `select m.*, c.friend_id, c.friend_nick_name, c.friend_nick_name_pinyin, c.friend_head_img, c.friend_friendNotes, c.friend_friendNotes_pinyin from t_groups_member m left join t_contacts c on m.id = c.friend_id where m.group_id='${element.id}' and m.id='${element.refMsgBody?.users?.[0]?.userId || 0}'`
        let membList = await window.vm.$knex.raw(SELECT_SQL);
        // console.warn(membList)
        if (membList && membList.length) {
          let receiverItem = membList[0];
          /*
          * SET_GROUP_MEMBER 中处理 start
          */
          receiverItem['userId'] = receiverItem['id'];
          let memberNotes = receiverItem['member_notes'] ? '['.concat(receiverItem['member_notes']).concat(']') : '';
          let friendNotes = receiverItem['friend_friendNotes'] || '';
          let nickName = receiverItem['nick_name'] || '';
          if (friendNotes) {
            receiverItem['group_member_name'] = memberNotes.concat(friendNotes);
            receiverItem['group_member_friend_name'] = friendNotes;
          } else {
            receiverItem['group_member_name'] = memberNotes.concat(nickName);
            receiverItem['group_member_friend_name'] = nickName;
          }
          /*
          * SET_GROUP_MEMBER 中处理 end
          */
          element.targetName =
            (element.authStatus == 3 ? receiverItem['group_member_friend_name'] : receiverItem['group_member_name']) ||
            element.refMsgBody?.users[0].name ||
            element.refMsgBody?.users[0].nickName ||
            'Douglas';  
        } else {
          element.targetName = element.refMsgBody?.users?.[0]?.name || element.refMsgBody?.users?.[0]?.nickName || '';
        }
      } else if (element.targetType == '2' && element.msgType == '24' && !element.refMsgBody?.fromName) {
        const uid = element.msgBody?.userId;
        const userInfo = await window.vm.$knex('t_groups_member').select('nick_name', 'user_head_img').where({ id: uid });
        if (userInfo && userInfo.length) {
          element.refMsgBody.fromName = userInfo[0].nick_name;
          element.refMsgBody.fromIcon = userInfo[0].user_head_img;
        }
      }
      if (element.isAt === 1 && ChatListUtils.isCurrentChat(element.id)) {
        element.isAt = 0;
      }
      // if (element.targetType == '2' && element.msgType == '44') {
      //   console.log(element, 'elementelementelement')
      // }

      element.text = element.text || element.msgBody?.text
      list.push(element);
    }
    console.log('GET_LAST_MSG_LIST', currentFlag)// lastMsgList -> orShowDot
    // 先从库里查看是否有draft消息，有的话先写入本地store中
    let draftList = res.filter(item => item.draftTime).map(item => {
      return {
        draftFlag: true,
        msgHtml: item.draftText,
        msgType: 1,
        texthtml: item.draftHtml,
        id: item.id
      }
    });
    draftList.length && store.commit('SET_DRAFT_LIST_FROM_SQLITE', draftList);
    return Promise.resolve(list)
  },

  async getFriensApplyList (pageNo, pageSize) {
    const exists = await window.vm.$knex.schema.hasTable('t_friend_apply');
    let list = []
    if (exists) {
      const m = (pageNo-1)*pageSize
      const n = pageSize
      // 查询数据
      const sql = `select * from t_friend_apply order by create_on DESC limit ${m},${n}`;
      const array = await window.vm.$knex.raw(sql)
      list = array.map((row) => {
        return builder_t_friend_apply(row)
      })
    } else {
      // 创建表
      await this.createFriendsApply()
    }
    return list
  },
  // 好友申请表
  async createFriendsApply () {
    await window.vm.$knex.schema.createTable('t_friend_apply', function (table) {
      table.text('id').notNullable();
      table.bigInteger('apply_status'); //申请状态
      // table.dateTime('apply_time'); //申请时间
      table.datetime('apply_time', { precision: 6 });
      // table.dateTime('apply_time_stamp'); //申请时间 时间戳
      table.datetime('apply_time_stamp', { precision: 6 });
      table.bigInteger('apply_type'); //申请类型
      table.string('attrs'); //
      table.string('channel_code'); //
      table.string('content'); //备注
      table.text('create_by'); //
      // table.dateTime('create_on'); //
      table.datetime('create_on', { precision: 6 });
      table.bigInteger('enabled'); //
      table.string('friend_head_img_path'); //好友头像
      table.text('friend_id'); //好友Id
      table.string('friend_invite_code'); //
      table.string('friend_invite_code_type'); //
      table.string('friend_nick_name'); //好友昵称
      table.string('friend_notes'); //
      table.string('friend_pass'); //
      table.bigInteger('friend_user_rank'); //
      table.bigInteger('friend_vip_type'); //
      table.text('group_id'); //
      table.string('group_img'); //
      table.string('group_name'); //
      table.string('invite_code'); //
      table.bigInteger('invite_code_type'); //
      table.string('other_friend_notes'); //
      table.string('source'); //
      table.bigInteger('update_by'); //
      table.datetime('update_on', { precision: 6 });
      table.string('user_head_img_path'); //用户头像
      table.text('user_id'); //用户Id
      table.string('user_nick_name'); //用户昵称
      table.string('user_pass'); //用户昵称
      table.bigInteger('user_rank'); //用户昵称
      table.string('version'); //用户昵称
      table.bigInteger('vip_type'); //
    });
  },

  // 插入数据
  async insertFriendsApply (obj) {
    const exists = await window.vm.$knex.schema.hasTable('t_friend_apply');
    if (exists) {
      return await window.vm.$knex('t_friend_apply').insert(obj)
    }else {
      return Promise.resolve()
    }
  },

  // 查找某条数据
  async findFriendsApplyItem (id) {
    let item;
    const exists = await window.vm.$knex.schema.hasTable('t_friend_apply');
    if (exists) {
      const sql = `select * from t_friend_apply where id = '${id}'`;
      const items = await window.vm.$knex.raw(sql)
      if (Array.isArray(items) && items.length > 0) {
        item = builder_t_friend_apply(items[0])
      }else {
        item = builder_t_friend_apply(item)
      }
      return item
    }else {
      return Promise.resolve()
    }
  },

  // 好友申请更新某条数据
  async updateFriendsApply (obj) {
    const exists = await window.vm.$knex.schema.hasTable('t_friend_apply');
    if (exists) {
      const item = {
        apply_status: obj?.applyStatus,
        user_id: obj?.userId,
        friend_id: obj?.friendId,
        friend_notes: obj?.friendFriendNotes,
        group_id: obj?.groupId
      }
      return await window.vm
        .$knex('t_friend_apply')
        .where('id', obj.id)
        .update(item)
    }else {
      return Promise.resolve()
    }
  },

  // 好友申请更新某条数据 全属性更新
  async updateFriendsApplyByItem (item) {
    const exists = await window.vm.$knex.schema.hasTable('t_friend_apply');
    if (exists) {
      return await window.vm
        .$knex('t_friend_apply')
        .where('id',item.id)
        .update(item)
    }else {
      return Promise.resolve()
    }
  }
}