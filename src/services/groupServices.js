const convertToPinyin = require('@/utils/pinyin')

const create = async (item) => {
  const obj = {
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
    sendRedpacketStatus: item.sendRedpacketStatus,
    copyMessagesStauts: item.copyMessagesStauts,
    create_time: item.createdOn,
    save_time: item.saveTime,
    people: item.people,
    member_level_status: item.memberLevelStatus,
    group_level: item.groupLevel,
    updatedOn: item.updatedOn,
    code: item.code,
    group_name_pinyin: convertToPinyin(item.groupName),
    is_show: 'true',
  }
  console.log(obj)
}

export default {
  create,
}
