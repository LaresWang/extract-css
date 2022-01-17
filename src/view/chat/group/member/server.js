import { _POST } from '@/utils/axios';

export const ser_group_member = params => {
  //查询群成员
  return _POST('/api/contracts/api/group/queryGroupMembers', params);
};
export const update_person_info = params => {
  //禁言
  return _POST('/api/contracts/api/group/updateGroupPersonalInfo', params);
};
export const removeGroupMember = params => {
  // 管理员移除群成员
  return _POST('/api/contracts/api/group/removeGroupMember', params);
};