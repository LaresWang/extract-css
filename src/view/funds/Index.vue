<!--资金 模块 -->
<template>
  <div class="funds-wrap">
    <ul class="funds-tab-wrap cf" id="funds-tab-wrap">
      <router-link to="/app/funds/general" tag="li">资产概况</router-link>
      <router-link to="/app/funds/detail" tag="li">矿区明细</router-link>
      <router-link to="/app/funds/tradepwd" tag="li">交易密码</router-link>
      <router-link to="/app/funds/address" tag="li">提币地址</router-link>
    </ul>
    <div class="funds-content-wrap" id="funds-content-wrap">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {};
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {},
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {}, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类

.funds-wrap {
  // padding: 30px;
  height: 100%;
  text-align: left;
  background-color: #fff;
  .funds-title {
    font-size: 14px;
    color: #151f34;
    line-height: 20px;
  }
  .funds-tab-wrap li {
    float: left;
    font-size: 14px;
    color: #151f34;
    list-style: none;
    line-height: 20px;
    margin-right: 35px;
    user-select: none;
    &:hover {
      color: #2f54eb;
    }
  }
  .funds-tab-wrap li:last-child {
    margin-right: 0;
  }
  .funds-tab-wrap li.router-link-active {
    color: #2f54eb;
    position: relative;
    transition: all 0.5s linear;
  }
  .funds-tab-wrap li.router-link-active::after {
    content: '';
    display: inline-block;
    position: absolute;
    bottom: -5px;
    width: 10px;
    height: 2px;
    background-color: #2f54eb;
    left: 50%;
    margin-left: -5px;
  }
  .funds-content-wrap {
    margin-top: 35px;
    .funds-content-wrap-item-con {
      display: none;
    }
    .show {
      display: block;
    }
  }
}
</style>
