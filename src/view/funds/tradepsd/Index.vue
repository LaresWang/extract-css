<!-- 交易密码 -->
<template>
  <div class="trade-psd-wrap">
    <Tab :data="tabData" />
    <div class="trade-psd-content" id="trade-psd-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';

import Tab from '@/components/Tab';

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    Tab
  },
  data() {
    //这里存放数据 "", "手机验证", "谷歌验证"
    return {
      tabData: [
        {
          label: '邮箱验证',
          path: '/app/funds/tradepwd/email'
        },
        {
          label: '手机验证',
          path: '/app/funds/tradepwd/phone'
        },
        {
          label: '谷歌验证',
          path: '/app/funds/tradepwd/google'
        }
      ]
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
    // this.$router.push({path: '/app/funds/tradepwd/email'})
  },
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

.trade-psd-wrap {
  .trade-psd-content {
    width: 500px;
    margin-top: 40px;
  }
}
</style>
