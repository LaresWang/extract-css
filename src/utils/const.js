export const coin_type = ['USDT', 'EOS', 'BTC'];
export const link_type = [
  'OMNI'
  // "ERC20",
  // "TCR20"
];
export const view_type = [
  {
    value: '0',
    label: '看点'
  },
  {
    value: '1',
    label: '文章'
  }
];
export const power_type = [
  {
    value: '6009-001',
    label: '公开（所有人可见）'
  },
  {
    value: '6009-002',
    label: '订阅（仅关注者可见）'
  }
  // {
  //     value: '6009-003',
  //     label: '私密（仅自己可见）'
  // }
];
export const msg_type = {
  TEXT_TYPE: '1', // 文本
  PICTURE_TYPE: '2', // 图片
  POSITION_TYPE: '3', // 地址位置
  NOTICE_TYPE: '4', // 通知
  TIPS_TYPE: '5', // 提示
  FILE_TYPE: '6', // 文件
  MONEY_TYPE: '7', // 红包
  TRANSFER_TYPE: '8', // 转账
  RECORDING_TYPE: '9', // 录音
  VF_TYPE: '10', // 视频文件
  VOICE_TYPE: '11', // 实时语音
  VIDEO_TYPE: '12', // 实时视频
  OTHER_TYPE: '99' // 自定义
};
export const groupCahtUrl = ['/app/chat/group/message', '/app/chat/group/member', '/app/chat/group/manage', '/app/chat/group/setting'];
export const infoCahtUrl = ['/app/chat/single/message', '/app/chat/single/setting'];

let SELF_USERID = '';
export const setSelfUserId = function(userId) {
  SELF_USERID = userId;
};
export const getSelfUserId = function() {
  return SELF_USERID;
};

export const getTargetID = function(fromId, targetId) {
  if (SELF_USERID === fromId) {
    return targetId;
  }
  return fromId;
};

export const parseUniqueCode = function(uniqueCode, targetType = 1) {
  let arr = uniqueCode.split('@');
  let fromId;
  if (targetType == '1') {
    fromId = getTargetID(arr[0], arr[1]);
  } else {
    fromId = arr[1] == 'GROUP' ? arr[0] : arr[1];
  }
  return fromId;
};
export const null2str = function(str, defaultStr) {
  if (!str || str == 'undefined' || str == 'null') {
    if (defaultStr || defaultStr == '0') {
      return defaultStr;
    }
    return '';
  }
  return str;
};

export const t_sessionsObj = {
  msg_type: '',
  from_type: '',
  target_type: '',
  from_id: '',
  msg_order: '',
  top_flag: '',
  noNotice_flag: '',
  voice_status: '',
  content: '',
  source_content: '',
  timestamp: '',
  effectiveTime: '',
  unread_num: '',
  reqId: '',
  targetId: '',
  fromType: '',
  msgType: null,
  befor: '',
  after: '',
  filter: '',
  pubKey: '',
  version: '',
  msgSeqNo: '',
  msgSeqTotal: '',
  sourceSite: '',
  language: '',
  sign: '',
  signType: '',
  effectiveTimeDate: '',
  text: '',
  fromName: '',
  fromIcon: '',
  topFlag: '',
  name: '',
  name_id: '',
  voiceStatus: '',
  voiceMsgId: '',
  noNoticeFlag: '',
  mdn: ''
};

export const messageEnum = {
  0: 'ack',
  1: 'text',
  2: 'picture',
  3: 'position',
  4: 'notice',
  5: 'tips',
  6: 'file',
  7: 'money',
  8: 'transfer',
  9: 'recording',
  10: 'VF',
  11: 'voice',
  12: 'video',
  13: 'key',
  14: 'article',
  15: 'postcard',
  16: 'mine',
  17: 'umt',
  18: 'gmt',
  19: 'gmmt',
  20: 'cmt',
  21: 'kmt',
  22: 'gmmct ',
  23: 'read ',
  24: 'executeRevoke',
  25: 'quote',
  26: 'revoke',
  99: 'other'
};

export const saveTimeArr = [
  { value: '1', label: '1小时' },
  { value: '3', label: '3小时' },
  { value: '12', label: '12小时' },
  { value: '24', label: '24小时' },
  { value: '72', label: '3天' },
  { value: '120', label: '5天' },
  { value: '168', label: '7天' }
];

export const paymentId = '1109675932474322944';//DiDi Payment ID
export const ActAssistantId = '1188285824566878208';//DiDi 消息助手 ID

// 图片格式
export const pictureTypeArr = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tif', 'webp', 'tiff'];

// 视频格式
export const videoTypeArr = ['3gp', 'mpg', 'mp4', 'avi', 'mpeg'];

// 其他的本项目中不支持的视频格式
// eslint-disable-next-line max-len
export const otherVideoTypeArr = ["flv","mpe","m1v","m2v","mpv2","mp2v","dat","ts","tp","tpr","pva","pss","m4v", "m4p","m4b","3gpp","3g2","3gp2","ogg","mov","qt","amr","rm","ram","rmvb","rpm"];

// 音频格式
export const audioTypeArr = ['mp3'];

// video标签支持 视频编码格式
export const videoCode = ['H264', 'h264', 'VP8', 'vp8', 'Theora', 'theora']

// GET_LAST_MSG_LIST
export const lastMessagesInView_msgType=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 44, 15, 16, 25, 26, 31, 40, 41, 54, 56, 61]
// eslint-disable-next-line max-len
export const lastMessagesNotInView_fromType=[201, 202, 408, 409, 353, 355, 369, 370, 401, 410, 421, 422, 701, 702, 423, 424, 425, 437, 438, 95]
