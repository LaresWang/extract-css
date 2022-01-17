import { _POST } from '@/utils/axios';

export const getAllGroupList = params => {
  // 查询所有群列表
  return _POST('/api/contracts/api/group/queryGroupList', params);
};
export const getFriendsApplyList = params => {
  // 好友申请列表
  return _POST('/api/contracts/api/friendsapply/list', params);
};
export const updateSimple = params => {
  // 更新好友申请只更新部分
  return _POST('/api/contracts/api/friendsapply/updateSimple', params);
};
export const getUserInfo = params => {
  //获取好友信息
  return _POST('/api/contracts/api/user/info', params);
};
export const group_apply_member_deal = params => {
  // 管理员审核入群申请操作
  return _POST('/api/contracts/api/group/groupApplyMemberDeal', params);
};
