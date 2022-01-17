<!-- step3 -->
<template>
  <div class="step3">
    <div class="step3-success flex flex-direction align-center">
      <div class="step3-one">
        <img src="../../../assets/images/right.png" alt />
      </div>
      <div class="step3-two">操作成功</div>
      <div class="step3-three">
        预计X个工作日内审核完成，审核通过后我们将在APP通知您！
      </div>
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
.step3-one {
  margin-top: 100px;
}
.step3-two {
  margin: 20px 0 30px 0;

  font-weight: 500;
  color: rgba(51, 51, 51, 1);
  font-size: 16px;
}
.step3-three {
  font-size: 14px;

  font-weight: 400;
  color: rgba(51, 51, 51, 1);
}
</style>
