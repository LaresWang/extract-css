import { _POST } from '@/utils/axios';

export const get_type_lists = params => {
  //获取下拉列表数据
  return _POST('/api/contracts/api/imimpeachtype/list', params);
};
export const get_tipoffs_add = (data, params) => {
  //获取下拉列表数据
  return _POST('/api/contracts/api/impeach/addImpeach', data, params);
};
