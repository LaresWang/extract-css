import { _GET, _POST } from '@/utils/axios';
export const get_withdraw_address_list = params => {
  // 地址簿列表查询
  return _POST('/api/account/getWithdrawAddressBook', params);
};
export const add_withdraw_address_book = params => {
  // 添加地址簿
  return _POST('/api/account/addWithdrawAddressBook', params);
};
export const delete_withdraw_address_book = params => {
  // 删除提币地址
  return _GET('/api/account/deleteWithdrawAddressBook', params);
};
