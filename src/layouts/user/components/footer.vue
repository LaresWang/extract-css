<!--  -->
<template>
  <el-footer class="flex justify-around">
    <!-- <div class="footer-left">
      <span>@2019 XXX公司版权所有</span>
      <span>关于我们</span>
      <span>隐私协议</span>
    </div>
    <div class="footer-right">
      <span>联系我们:</span>
      <span>Instagram</span>
      <span>Facebook</span>
      <span>WeChat</span>
      <span>Email</span>
      <span>Youtube</span>
      <span>Twitter</span>
    </div> -->
  </el-footer>
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
.el-footer {
  // background-color: #b3c0d1;
  color: #333;
  text-align: center;
  line-height: 60px;
  font-size: 15px;
  .footer-left {
    span:nth-child(2) {
      margin: 0 30px;
      cursor: pointer;
    }
    span:nth-child(3) {
      cursor: pointer;
    }
  }
  .footer-right {
    span {
      margin: 0 10px;
      cursor: pointer;
    }
    span:nth-child(1) {
      margin: 0;
      cursor: auto;
    }
  }
}
</style>
