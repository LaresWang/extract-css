const timeCulmulate = date => {
  let nowTimes = new Date().getTime();
  let parTimes = new Date(date).getTime();

  if (nowTimes - parTimes >= 86400000) {
    return date;
  } else {
    let time = Number(((nowTimes - parTimes) / (1000 * 60 * 60)).toFixed(1)) + '';
    time = time.substring(0, time.indexOf('.'));
    if (time == 0) {
      let time2 = Number(((nowTimes - parTimes) / (1000 * 60)).toFixed(1)) + '';
      time2 = time2.substring(0, time2.indexOf('.'));
      if (time2 == 0) {
        return '刚刚';
      } else {
        return time2 + '分钟前';
      }
    } else {
      return time + '小时前';
    }
  }
  // 得出带有两位数字的小数
  //return Number(((nowTimes - parTimes)/(1000*60*60*24)).toFixed(2))
};
const hand_group_avatar = val => {
  // 设置默认群头像
  if (!val) {
    return require('../assets/images/group_avtar.png');
  }
  return val;
};

const formatFileSize = size => {
  let value = Number(size);
  if (size && !isNaN(value)) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'BB'];
    let index = 0;
    let k = value;
    if (value >= 1024) {
      while (k > 1024) {
        k = k / 1024;
        index++;
      }
    }
    return `${k.toFixed(2)}${units[index]}`;
  }
  return '';
};

export { timeCulmulate, hand_group_avatar, formatFileSize };
