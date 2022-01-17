const CryptoJS = require('crypto-js');
/*
加密解密的密钥规则：AuthTokenKey + userId转化成16位的字节数组
若是不足16位数，则是补0
*/

// var AuthTokenKey = ""; //AES密钥，
const AuthTokenIv = CryptoJS.enc.Utf8.parse('16-Bytes--String'); //AES向量 16位字符串

const stringTobytes = function(str) {
  // 把字符串生成字节数组
  let ch,
    st,
    re = [];
  for (let i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i);
    st = [];
    do {
      st.push(ch & 0xff);
      ch = ch >> 8;
    } while (ch);
    re = re.concat(st.reverse());
  }
  // 不足16补0
  if (re && re.length < 32) {
    let ren = 32 - re.length;
    for (let i = 0; i < ren; i++) {
      re.push(Number(0));
    }
  }
  return re;
};
// 加解密用到的密钥
const aesKeyBytes = function(userId) {
  // var arr = stringTobytes(`${AuthTokenKey}${userId}`)
  const arr = stringTobytes(`${userId}`);
  const key_Int = new Int8Array(arr);
  // var key_Int = new Int8Array([65, 144, 48, 53, 18, 52, 86, 120, 131, 116, 124, 139, 237, 203, 169, 135]);
  const keyBytes = int8parse(key_Int);
  return keyBytes;
};
// 构建WordArray对象
const int8parse = function(u8arr) {
  const len = u8arr.length;
  const words = [];
  for (let i = 0; i < len; i++) {
    words[i >>> 2] |= (u8arr[i] & 0xff) << (24 - (i % 4) * 8);
  }
  return CryptoJS.lib.WordArray.create(words, len);
};

/*AES加密*/
export function Encrypt(data, userId) {
  try {
    userId = userId ? userId : '';
    const encryptedData = CryptoJS.AES.encrypt(data, aesKeyBytes(userId), {
      iv: AuthTokenIv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return encryptedData.toString();
  } catch (err) {
    console.error('AES Encrypt ERROR ', userId, data);
    return data;
  }
}
/*AES解密*/
export function Decrypt(data, userId) {
  try {
    userId = userId ? userId : '';
    // let dataT=CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
    //eslint-disable-next-line
    data = data.replace(new RegExp('\n', 'gm'), '');
    let decrypted = CryptoJS.AES.decrypt(data, aesKeyBytes(userId), {
      iv: AuthTokenIv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error('AES Decrypt ERROR ', userId, data, err);
    return data;
  }
}
