// import { _POST } from '@/utils/axios'
import { _GET } from '@/utils/axios';
export const fund_mine_mymine = params => {
  return _GET('/api/comm/mine/project/side/detail', params);
};
export const fund_mine_stat = params => {
  return _GET('/api/comm/mine/project/side/count', params);
};
export const fund_mine_usermaring = params => {
  return _GET('/api/comm/mine/project/side/list', params);
};
