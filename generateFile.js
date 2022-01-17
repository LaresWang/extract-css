const fsp = require('fs/promises')
const fse = require('fs-extra');
const path = require('path')
const constants = require('fs').constants;

const write = function(path, data, cb){
  fsp.writeFile(path, data).then(()=>cb()).catch(e=>console.log(e))
}
const writeJson = function(path, data, cb){
  fse.writeJSON(path, data, {spaces:2}).then(()=>cb()).catch(e=>console.log(e))
}
const append = function(path, data, cb){
  fsp.appendFile(path, data).then(()=>cb()).catch(e=>console.log(e));
}

const getAbsolutePath = async function(filePath){
  try {
    await fsp.access(filePath, constants.F_OK);
    return filePath;
  } catch {
    const afp = path.join(process.cwd(),filePath);
    console.log(afp)
    try{
      await fsp.access(afp, constants.F_OK);
      return afp;
    } catch (e) {
      console.log(e)
      throw new Error(`文件不存在：${filePath}`)
    }
  }

}

module.exports = {
  write,
  append,
  writeJson,
  getAbsolutePath
}