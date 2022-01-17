function changeStr(str) {
  //
  return str.charAt(0).toUpperCase() + str.slice(1);
}
//第一个参数，所对应的组件的路径，第二个参数是是否查找子路径，第三个参数是用正则匹配.vue结尾的文件
const requireComponent = require.context('./', false, /\.vue$/);
const install = Vue => {
  requireComponent.keys().forEach(file => {
    //获得第i个
    let config = requireComponent(file);
    let componentName = changeStr(file.replace(/^\.\//, '').replace(/\.\w+$/, ''));
    Vue.component(componentName, config.default || config);
  });
};
export default {
  install
};
