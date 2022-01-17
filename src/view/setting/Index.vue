<!-- 个人设置 -->
<template>
  <div class="setting-wrap">
    <div class="setting-title">个人设置</div>
    <ul class="setting-tab-wrap clearfix" id="setting-tab-wrap">
      <router-link to="/app/setting/general" tag="li">通用设置</router-link>
      <!-- <router-link to='/app/setting/identity' tag="li">身份认证</router-link> -->
      <router-link to="/app/setting/safe" tag="li">安全设置</router-link>
      <router-link to="/app/setting/secretKey" tag="li">密钥管理</router-link>
    </ul>
    <div class="setting-content-wrap" id="setting-content-wrap">
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
    return {
      i: "",
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {},
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.i = this.$route.query.num;
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {}, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {}, //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类

.clearfix::after {
  content: "";
  display: inline-block;
  overflow: hidden;
  clear: both;
}
.setting-wrap {
  padding: 30px;
  //height: 100%;
  text-align: left;
  background-color: #fff;
  .setting-title {
    font-size: 14px;
    color: #151f34;
    line-height: 20px;
  }
  .setting-tab-wrap {
    padding: 20px 0 50px;
    margin: 0;
  }
  .setting-tab-wrap li {
    float: left;
    font-size: 14px;
    color: #151f34;
    list-style: none;
    line-height: 20px;
    margin-right: 35px;
    user-select: none;
  }
  .setting-tab-wrap li:last-child {
    margin-right: 0;
  }
  .setting-tab-wrap li.router-link-active {
    color: #2f54eb;
    position: relative;
  }
  .setting-tab-wrap li.router-link-active::after {
    content: "";
    display: inline-block;
    position: absolute;
    bottom: -5px;
    width: 10px;
    height: 2px;
    background-color: #2f54eb;
    left: 50%;
    margin-left: -5px;
  }
  .setting-content-wrap {
    .setting-content-wrap-item-con {
      display: none;
    }
    .show {
      display: block;
    }
  }
}
</style>
