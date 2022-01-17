import { _POST } from '@/utils/axios';
import { _GET } from '@/utils/axios';
export const get_ore_capitalList = params => {
  return _GET('/api/comm/getAccountCapitalList', params); //搜索
};
export const get_funds_balance = params => {
  return _GET('/api/account/getBalance', params); //搜余额
};
export const get_ore_allList = params => {
  return _GET('/api/comm/capital/project/side', params); //矿区资产概况
};
export const get_account_capitalList = params => {
  return _GET('/api/account/getMyAssets', params); //钱包资产概况
};
export const get_account_wallet = params => {
  return _POST('/api/account/getAccountCapitalWater', params); //钱包明细
};
export const get_mining_wallet = params => {
  return _GET('/api/comm/capital/water', params); //矿区币种明细
};
export const get_account_ore = params => {
  return _GET('/api/comm/capital/project/side', params); //矿区明细
};
export const get_account_mining = params => {
  return _GET('/api/comm/getAccountCapitalWater', params); //矿区明细新
};
// 根据账户类型获取当前账户可转账户类型
export const support_account_types = params => {
  return _GET('/api/account/supportedAccountTypes', params);
};
// 转账获取流水号
export const account_transfer_num = params => {
  return _GET('/api/account/accountTransferUUID', params);
};
// 资金划转
export const get_account_transfer = params => {
  return _POST('/api/account/accountTransfer', params);
};
// 提币页面用户金额
export const get_user_capitaldetail = params => {
  return _GET('/api/account/getUserCurrencyCapitalDetail', params);
};
// 获取币种配置
export const get_currency = params => {
  return _GET('/api/account/getCurrency', params);
};
// 地址簿列表查询(提币地址下拉框使用)
export const get_withdraw_addressList = params => {
  return _GET('/api/account/getWithdrawAddressList', params);
};
// 确认提币接口-提币
export const get_confirm_withdraw = params => {
  return _POST('/api/account/withdrawal', params);
};
// 充币地址获取接口
export const get_recharge_address = params => {
  return _POST('/api/account/getRechargeAddress', params);
};
// 启用禁用
export const get_confirm_enable = params => {
  return _POST('/api/user/enable/team', params);
};
