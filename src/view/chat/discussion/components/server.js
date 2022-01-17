import { _POST } from '@/utils/axios';
// import { _GET } from '@/utils/axios'
export const createGroup = params => {
  return _POST('/api/contracts/api/group/createGroupAPP', params); //发起群聊
};
export const queryGroupByGroupId = params => {
  //群id搜索群信息
  return _POST('/api/contracts/api/group/queryGroupByGroupId', params);
};
export const setGroupBase = params => {
  // 群设置 - 修改群基础属性
  return _POST('/api/contracts/api/group/setGroupBase', {}, params, {
    'Content-Type': 'application/x-www-form-urlencoded'
  });
};
export const discussionUpgradeGroup = params => {
  return _POST('/api/contracts/api/group/discussionUpgradeGroup', params); //升级群聊
};
