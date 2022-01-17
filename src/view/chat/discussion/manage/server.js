import { _POST } from '@/utils/axios';
// import { _GET } from '@/utils/axios'
export const queryLinkGroup = params => {
  //关联群
  return _POST('/api/contracts/api/group/queryLinkGroup', params);
};
export const setGroupBase = params => {
  //群管理
  return _POST('/api/contracts/api/group/setGroupBase', {}, params, {
    'Content-Type': 'application/x-www-form-urlencoded'
  });
};
export const releaseGroup = params => {
  //解散群
  return _POST('/api/contracts/api/group/releaseGroup', params);
};
export const queryGroupByGroupId = params => {
  //查询群
  return _POST('/api/contracts/api/group/queryGroupByGroupId', params);
};
