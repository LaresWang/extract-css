//加密解密类
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * RSA最大加密明文大小
 */
const MAX_ENCRYPT_BLOCK = 117 - 31;

/**
 * RSA最大解密密文大小
 */
const MAX_DECRYPT_BLOCK = 128;

/**
 * 公钥加密
 * @param data
 * @returns {string}
 */
function publicEncrypt(data, pulicKey) {
  try {
    //得到公钥
    // var publicPem = fs.readFileSync(path.join(__dirname, "../../properties/rsa_public_key.pem"));//替换你自己的路径
    //var publicKey = publicPem.toString();
    let publicKey = '-----BEGIN PUBLIC KEY-----\r\n' + pulicKey + '\r\n-----END PUBLIC KEY-----';
    //加密信息用buf封装
    let buf = Buffer.from(data, 'utf-8');
    //buf转byte数组
    let inputLen = buf.byteLength;
    //密文
    let bufs = [];
    //开始长度
    let offSet = 0;
    //结束长度
    let endOffSet = MAX_ENCRYPT_BLOCK;
    //分段加密
    let bufTmp;
    while (inputLen - offSet > 0) {
      if (inputLen - offSet > MAX_ENCRYPT_BLOCK) {
        bufTmp = buf.slice(offSet, endOffSet);
        bufs.push(crypto.publicEncrypt({ key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING }, bufTmp));
      } else {
        bufTmp = buf.slice(offSet, inputLen);
        bufs.push(crypto.publicEncrypt({ key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING }, bufTmp));
      }
      offSet += MAX_ENCRYPT_BLOCK;
      endOffSet += MAX_ENCRYPT_BLOCK;
    }
    const result = Buffer.concat(bufs);
    //密文BASE64编码
    return result.toString('base64');
  } catch (err) {
    console.error('RSA decrypt ERROR ', err, data, pulicKey);
    return null;
  }
}

/**
 * 公钥解密
 * @param data
 * @returns {string}
 */
//eslint-disable-next-line
const publicDecrypt = function(data) {
  //得到私钥
  const publicPem = fs.readFileSync(path.join(__dirname, '../../properties/rsa_public_key.pem')); //替换你自己的路径
  const publicKey = publicPem.toString();
  //经过base64编码的密文转成buf
  const buf = Buffer.from(data, 'base64');

  //buf转byte数组
  //var inputLen = bytes(buf, "base64");
  const inputLen = buf.byteLength;
  //密文
  const bufs = [];
  //开始长度
  let offSet = 0;
  //结束长度
  let endOffSet = MAX_DECRYPT_BLOCK;
  let bufTmp;
  //分段加密
  while (inputLen - offSet > 0) {
    if (inputLen - offSet > MAX_DECRYPT_BLOCK) {
      bufTmp = buf.slice(offSet, endOffSet);
      bufs.push(crypto.publicDecrypt({ key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING }, bufTmp));
    } else {
      bufTmp = buf.slice(offSet, inputLen);
      bufs.push(crypto.publicDecrypt({ key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING }, bufTmp));
    }
    offSet += MAX_DECRYPT_BLOCK;
    endOffSet += MAX_DECRYPT_BLOCK;
  }
  const result = Buffer.concat(bufs).toString();
  console.log(result);
  return result;
};

/**
 * 私钥加密
 * @param data
 * @returns {string}
 */
//eslint-disable-next-line
function privateEncrypt(data) {
  //得到私钥
  const privatePem = fs.readFileSync(path.join(__dirname, '../../properties/rsa_private_key.pem'));
  const privateKey = privatePem.toString();
  //经过base64编码的密文转成buf
  const buf = Buffer.from(data, 'utf-8');
  //buf转byte数组
  const inputLen = buf.byteLength;
  //密文
  const bufs = [];
  //开始长度
  let offSet = 0;
  //结束长度
  let endOffSet = MAX_ENCRYPT_BLOCK;
  let bufTmp;
  //分段加密
  while (inputLen - offSet > 0) {
    if (inputLen - offSet > MAX_ENCRYPT_BLOCK) {
      bufTmp = buf.slice(offSet, endOffSet);
      bufs.push(crypto.privateEncrypt({ key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING }, bufTmp));
    } else {
      bufTmp = buf.slice(offSet, inputLen);
      bufs.push(crypto.privateEncrypt({ key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING }, bufTmp));
    }
    offSet += MAX_ENCRYPT_BLOCK;
    endOffSet += MAX_ENCRYPT_BLOCK;
  }
  const result = Buffer.concat(bufs);
  //密文BASE64编码
  const base64Str = result.toString('base64');
  console.log(base64Str);
  return base64Str;
}

/**
 * 私钥解密
 * @param data
 * @returns {string}
 */
function privateDecrypt(data, deKey) {
  try {
    //得到私钥
    //var privatePem = fs.readFileSync("c:\\1.pem");
    //var privateKey = privatePem.toString();
    const privateKey = '-----BEGIN RSA PRIVATE KEY-----\r\n' + deKey + '\r\n-----END RSA PRIVATE KEY-----';
    //经过base64编码的密文转成buf
    const buf = Buffer.from(data, 'base64');

    //buf转byte数组
    //var inputLen = bytes(buf, "base64");
    const inputLen = buf.byteLength;
    //密文
    const bufs = [];
    //开始长度
    let offSet = 0;
    //结束长度
    let endOffSet = MAX_DECRYPT_BLOCK;
    let bufTmp;
    //分段加密
    while (inputLen - offSet > 0) {
      if (inputLen - offSet > MAX_DECRYPT_BLOCK) {
        bufTmp = buf.slice(offSet, endOffSet);
        bufs.push(
          crypto.privateDecrypt(
            {
              key: privateKey,
              oaepHash: 'sha256',
              padding: crypto.constants.RSA_PKCS1_PADDING
            },
            bufTmp
          )
        );
      } else {
        bufTmp = buf.slice(offSet, inputLen);
        bufs.push(
          crypto.privateDecrypt(
            {
              key: privateKey,
              oaepHash: 'sha256',
              padding: crypto.constants.RSA_PKCS1_PADDING
            },
            bufTmp
          )
        );
      }
      offSet += MAX_DECRYPT_BLOCK;
      endOffSet += MAX_DECRYPT_BLOCK;
    }
    const result = Buffer.concat(bufs).toString();
    console.log(result);
    //解密
    return result;
  } catch (err) {
    console.error('RSA decrypt ERROR ', err, data, deKey);
    return null;
  }
}

function getRsaKeys(func) {
  window.crypto.subtle
    .generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 1024, //can be 1024, 2048, or 4096
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: {
          name: 'SHA-256'
        } //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
      },
      true, //whether the key is extractable (i.e. can be used in exportKey)
      ['encrypt', 'decrypt'] //must be ["encrypt", "decrypt"] or ["wrapKey", "unwrapKey"]
    )
    .then(function(key) {
      window.crypto.subtle
        .exportKey('pkcs8', key.privateKey)
        .then(function(keydata1) {
          window.crypto.subtle
            .exportKey('spki', key.publicKey)
            .then(function(keydata2) {
              let privateKey = RSA2text(keydata1, 1);
              let publicKey = RSA2text(keydata2);
              func(privateKey, publicKey);
            })
            .catch(function(err) {
              console.error(err);
            });
        })
        .catch(function(err) {
          console.error(err);
        });
    })
    .catch(function(err) {
      console.error(err);
    });
}
function RSA2text(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = window.btoa(binary);
  //   var text = "-----BEGIN " + (isPrivate ? "PRIVATE" : "PUBLIC") + " KEY-----\n";
  //   text += base64.replace(/[^\x00-\xff]/g, "$&\x01").replace(/.{64}\x01?/g, "$&\n");
  //   text += "\n-----END " + (isPrivate ? "PRIVATE" : "PUBLIC") + " KEY-----";
  let text = base64
    .replace(/[^\x00-\xff]/g, '$&\x01') // eslint-disable-line
    .replace(/.{64}\x01?/g, '$&\n'); // eslint-disable-line
  return text;
}
module.exports.encrypt = publicEncrypt;
// module.exports.publicDecrypt = publicDecrypt;
// module.exports.privateEncrypt = privateEncrypt;
module.exports.decrypt = privateDecrypt;
module.exports.getRsaKeys = getRsaKeys;
