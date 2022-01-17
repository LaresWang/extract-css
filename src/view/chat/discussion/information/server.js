import { _POST } from '@/utils/axios';

export const ser_group_infoById = params => {
  //根据群id搜索群信息
  return _POST('/api/contracts/api/group/queryGroupByGroupId', params);
};
export const set_group_avatar = (data, params) => {
  //设置群信息
  return _POST('/api/contracts/api/group/setGroupBase', data, params);
};
