import { _POST } from '@/utils/axios';

export const createGroup = params => {
  return _POST('/api/contracts/api/group/createGroupAPP', params); //发起群聊
};
export const queryGroupByGroupId = params => {
  //群id搜索群信息
  return _POST('/api/contracts/api/group/queryGroupByGroupId', params);
};
