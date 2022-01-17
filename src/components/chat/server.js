import { _POST,_GET } from '@/utils/axios'

export const batchInviteAddGroup = (params) => {//批量邀请入群
  return _POST('/api/contracts/api/group/batchInviteAddGroup', '',params)
}
export const groupfriendlist = (data, params) => {//邀请好友入群，并判断好友是否在群里的 好友列表
  return _POST('/api/contracts/api/friends/list',data,params)
}
export const viewLimitGroupByUserId = (params) => {//根据用户id获取所有被封冻的群
  return _GET('api/contracts/api/impeach/viewLimitGroupByUserId',params)
}
