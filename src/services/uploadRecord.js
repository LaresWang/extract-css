import Logan from 'logan-web'
import moment from 'moment'

const testUrl =
  'http://logan-server.zhidianjh.com/logan-web-beta/logan/web/upload.json'
const proUrl =
  'https://logan-server.didimessage.com/logan-web-beta/logan/web/upload.json'
// eslint-disable-next-line
const publicKey = `MIICXAIBAAKBgG2m5VVtZ4mHml3FB9foDRpDW7PwFoa+1eYN777rNmIdnmezQqHWIRVcnTRVjrgGt2ndP2cYT7MgmWpvr8IjgN0PZ6ngMmKYGpapMqkxsnS/6Q8UZO4PQNlnsK2hSPoIDeJcHxDvo6Nelg+mRHEpD6K+1FIqzvdwVPCcgK7UbZElAgMBAAECgYAXQM9dgGf2iGU6AXCaXsF4klQ+ImoEhS/DK61t5V+RCwrunttAirJVX2CPGp27dOEseBjb+hHcwMsIAUtadkD7VqDoLg0C63pP6Yr91zoLSq7ru7FL4j8ZDGgHV2tE6TbtIRGbxuuF+EmztKqrMCvN4qcxqDvTtU6Xq9Us7xC+uQJBANoFtsuTqDaFFOJ0p0S3+w4lzUcfp+XboVb4+q7wcFumfDCLIuvOTEiCFj5Tj0o2eHtEo3ARHWIcNZqBOgYPPdMCQQCAwJzubpjr7oXxINLERcQ1PXvjD5HD9Q4A20p6pFkcEYTlDYW/nm60PMr7JWG54TH0e6w8IfJZVR2xonVasoInAkEAjdIfuUdgqa5iCnkFgb8IEYjngneGGRCIX/Hv57JB9GxU5qLrYWa92oC8hWiHkifisZTRmAmaCoL9H3cmTmDFvwJAJjwM3mmNlBLDR/YdYRfuyni1v5oyCWVOgUad+YmwxLsXIgY//8WGzpN3G9ngCZksgpPvc/QIyiqSpNu/ye1U5QJBAIgSfWXvx+varXagGojcCH8mVtT/E4/w3R+QTLAp6s0LQTQUDPnDGrxvT4sDoU6ib+nn0FAr/kTyJptdlvaXfeo=`
// 上传日志

//需要预先存储
export const saveReport = (msgObj = {}, type) => {
  //msg--日志信息 type -- 1运行日志 2 异常日志
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
  let logInfo = Object.assign({}, msgObj, {
    userId: userInfo ? userInfo['id'] : '',
  })
  Logan.log(JSON.stringify(logInfo), type)
}
//提交日志到服务器
export async function sendReport(time) {
  // 上报该天及之前的日志
  let toDay = time || moment().format('yyyy-MM-DD')
  // 上报该天及之后的日志 fromDay < toDay
  // let fromDay = moment(toDay).subtract(1, 'days').format('yyyy-MM-DD');
  // console.log(fromDay, "-", toDay)
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || ''
  const loginInfo = JSON.parse(localStorage.getItem('loginInfo')) || ''
  // 当前用户或业务附加信息。
  let customInfo = {
    userId: userInfo.id,
    udid: loginInfo.UDID,
    name: userInfo.userName,
    // content : JSON.parse(msg)
  }
  let reportObj = {
    reportUrl: process.env.NODE_ENV == 'development' ? testUrl : proUrl,
    publicKey:
      '-----BEGIN PUBLIC KEY-----\n' + publicKey + '-----END PUBLIC KEY-----',
    deviceId: customInfo.udid, //设备标识
    fromDayString: toDay,
    toDayString: toDay,
    webSource: customInfo.userId, //日志来源
    environment: navigator.userAgent,
    customInfo: JSON.stringify(customInfo),
  }
  try {
    console.log('reportObj', reportObj)
    const reportResult = await Logan.report(reportObj)
    console.log(reportResult)
  } catch (err) {
    let customInfo = `日志读取ERR: ${err.message}`
    reportObj.customInfo = JSON.stringify(customInfo)
    Logan.report(reportObj)
  }
}
