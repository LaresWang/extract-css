<!-- 忘记密码 手机找回 -->
<template>
  <div class="pass">
    <img src="../../../assets/images/di.png" alt style="width: 100px; display: block; margin: 0 auto; margin-top: -20px" />
    <div class="main-login">
      <!-- <h3>忘记密码</h3> -->
      <div class="flex align-center justify-around">
        <span class="email-phone" @click="goEmail">邮箱验证</span>
        <span class="email-phone-choosing">手机验证</span>
      </div>
      <el-form ref="ruleForm" :rules="rules" label-position="top" label-width="80px" :model="form">
        <el-form-item label="" prop="phone">
          <el-input placeholder="请输入手机号码" v-model="form.phone"></el-input>
        </el-form-item>
        <el-form-item label="" prop="password">
          <el-input placeholder="输入手机验证码"></el-input>
          <span class="clickGet" @click="getCode">点击获取</span>
        </el-form-item>
        <div class="login-code flex align-center justify-end">
          <span @click="tologin">密码登录</span>
        </div>
        <el-form-item>
          <el-button style="width: 100%" type="primary" @click="submitForm('ruleForm')">下一步</el-button>
        </el-form-item>
      </el-form>
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
      form: {
        phone: '',
        password: ''
      },
      rules: {
        phone: [{ required: true, message: '请输入手机号' }],
        password: [{ required: true, message: '请输入密码' }]
      },
      options: [
        {
          value: '选项1',
          label: '+86'
        },
        {
          value: '选项2',
          label: '+88'
        },
        {
          value: '选项3',
          label: '+96'
        },
        {
          value: '选项4',
          label: '+98'
        },
        {
          value: '选项5',
          label: '+100'
        }
      ],
      value: ''
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    tologin() {
      this.$router.push('/user/login/pass');
    },
    getCode() {
      this.post_user_send_mobile({
        mobile: this.form.phone,
        templateCode: ''
      });
    },
    goEmail() {
      this.$router.push('/user/forget/email');
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          alert('submit!');
        } else {
          return false;
        }
      });
    },
    async post_user_send_mobile() {}
  },
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
.pass {
  position: absolute;
  top: 80px;
}
.main-login {
  width: 400px;
  height: 530px;
  padding: 60px;
  box-sizing: border-box;
  // background: rgba(255, 255, 255, 1);
  box-shadow: 0px 4px 8px 0px rgba(5, 36, 163, 0.1);
  border-radius: 4px;
  h3 {
    text-align: center;
    margin: 0 0 30px 0;
    font-size: 18px;

    font-weight: bold;
    color: rgba(51, 51, 51, 1);
  }
  .login-code {
    font-size: 14px;
    padding: 10px 10px 20px 10px;
    span {
      cursor: pointer;
      font-size: 14px;

      font-weight: 500;
      color: rgba(51, 51, 51, 1);
    }
  }
  .email-phone {
    margin: 0 0 10px 0;
    font-size: 16px;

    font-weight: 400;
    padding: 10px;
    cursor: pointer;
  }
  .email-phone-choosing {
    margin: 0 0 10px 0;
    font-size: 16px;

    font-weight: 400;
    color: rgba(47, 84, 235, 1);
    padding: 10px;
    border-bottom: 1px solid rgba(47, 84, 235, 1);
    cursor: pointer;
  }
  .clickGet {
    position: absolute;
    right: 8px;
    font-size: 14px;
    cursor: pointer;

    font-weight: 500;
    color: rgba(47, 84, 235, 1);
  }
  .el-select {
    width: 75px;
    position: absolute;
    right: 0px;
    top: 0px;
    z-index: 999;
  }
  .el-form-item {
    position: relative;
  }
}
</style>
