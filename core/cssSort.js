const utils = require('./utils');
const { SORTED_PROPERTY } = require('./const');
const LEN = SORTED_PROPERTY.length;

const sort = function(css){
  if(!utils.isObject(css)){
    return css;
  }
  let sorted = [];
  let keys = Object.keys(css);
  for(let i=0; i<LEN; i++){
    const prop = SORTED_PROPERTY[i];
    const index = keys.indexOf(prop);
    if(index>-1){
      sorted.push(prop);
      keys.splice(index,1);
    }
    if(!keys.length){
      break;
    }
  }
  if(keys.length){
    sorted = sorted.concat(keys);
  }
  return sorted;
}

module.exports = sort;