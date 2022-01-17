import { _POST } from '@/utils/axios';

export const checkFreeGroupLimit = params => {
  //检测是否还有免费群权限
  return _POST('/api/contracts/api/groupExpand/checkFreeGroupLimit', '', params);
};
