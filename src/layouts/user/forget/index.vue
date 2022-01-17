<!-- layout_user -->
<template>
  <div class="layout layout_user">
    <el-container>
      <Header />
      <el-main>
        <div class="flex flex-direction align-center justify-center">
          <router-view />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import Header from '../components/header';

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    Header
  },
  data() {
    //这里存放数据
    return {
      langMap: {
        'en-us': 'English',
        'zh-cn': '简体中文'
      }
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    handleCommand(command) {
      this.$i18n.locale = command;
      localStorage.lang = command;
      this.$message({
        type: 'success',
        message: '切换语言成功：' + this.langMap[command]
      });
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    window.vm.$remote.getCurrentWindow().setSize(380, 500); //登陆页面初始化大小
    window.vm.$remote.getCurrentWindow().center(); //窗口居中
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

.el-main {
  // background-color: #e9eef3;
  color: #000;
  // text-align: center;
  font-size: 15px;
  .main-left {
    width: 60%;
    img {
      margin-bottom: 20px;
      width: 100%;
    }
    span {
      font-size: 18px;

      font-weight: 500;
      line-height: 28px;
      color: rgba(47, 84, 235, 1);
    }
    :nth-child(3) {
      margin-bottom: 150px;
    }
  }
  .main-right {
    width: 40%;
  }
}

body .el-container {
  // background: url(http://didiimg.oss-ap-southeast-1.aliyuncs.com/pc/user/bg%402x.png) no-repeat;
  flex-direction: column;
  background-size: 100% 100%;
  min-height: 100vh;
}
</style>
