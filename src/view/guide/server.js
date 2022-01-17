import { _POST } from '@/utils/axios';
export const delete_friends = params => {
  //删除好友
  return _POST('/api/contracts/api/friends/delete', params);
};
export const add_the_group = params => {
  //加群申请
  return _POST('/api/contracts/api/group/addGroupBycode', params);
};
