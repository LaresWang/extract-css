import { _POST } from '@/utils/axios';

export const addImpeachApeal = (data, params) => {
  //举报申诉
  return _POST('/api/contracts/api/impeach/addImpeachApeal', data, params);
};
