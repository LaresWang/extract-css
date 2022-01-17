import { _POST } from '@/utils/axios';
export const pwd_reset = params => {
  return _POST('/api/user/pwd/reset', params);
};
export const check_validcode = params => {
  return _POST('/api/user/check/validcode', params);
};
