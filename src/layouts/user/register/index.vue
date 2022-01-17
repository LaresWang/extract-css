<!-- layout_user -->
<template>
  <div class="register">
    <el-container>
      <Header />
      <el-main class="flex flex-direction align-center">
        <h3>DIDI平台申请团队账号</h3>
        <div class="step1-header">
          <el-steps :active="step" align-center class="flex justify-center">
            <el-step title="填写账号信息"></el-step>
            <el-step title="完善资料"></el-step>
            <el-step title="完成"></el-step>
          </el-steps>
        </div>
        <Step1 v-if="$route.query.step == 1 || !$route.query.step" />
        <Step2 v-if="$route.query.step == 2" />
        <Step3 v-if="$route.query.step == 3" />
      </el-main>

      <Footer />
    </el-container>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import Header from '../components/header';
import Footer from '../components/footer';
import Step1 from './step1';
import Step2 from './step2';
import Step3 from './step3';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    Header,
    Footer,
    Step1,
    Step2,
    Step3
  },
  data() {
    //这里存放数据
    return {
      step: 1
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {
    watch: {
      $route: {
        handle() {
          this.step = Number(this.$route.query.step);
        },
        deep: true
      }
    }
  },
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
    if (this.$route.query.step) {
      this.step = Number(this.$route.query.step);
    } else {
      this.step = 1;
    }
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
  .step1-header {
    width: 80%;
  }
  h3 {
    text-align: center;
    margin: 20px 0 40px 0;
    font-size: 19px;

    font-weight: bold;
    color: rgba(51, 51, 51, 1);
  }
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
  background: #fff;
  flex-direction: column;
  background-size: 100% 100%;
}
</style>
