<!-- 忘记密码 邮箱找回 -->
<template>
  <div class="email">
    <img src="../../../assets/images/di.png" alt style="width: 100px; display: block; margin: 0 auto; margin-top: -20px" />
    <div class="main-login">
      <!-- <h3>忘记密码</h3> -->
      <div class="flex align-start">
        <span class="email-phone-choosing">邮箱验证</span>
      </div>
      <el-form ref="ruleForm" :rules="rules" label-position="top" label-width="80px" :model="form">
        <el-form-item label="" prop="loginName">
          <el-input placeholder="请输入邮箱地址" v-model="form.loginName"></el-input>
        </el-form-item>
        <el-form-item label="" prop="validCode" class="relative">
          <el-input placeholder="请输入邮箱验证码" show-password v-model="form.validCode"></el-input>
          <span class="clickGet" @click="post_user_send_email" v-show="countDown == 0">点击获取</span>
          <span class="clickGet" v-show="countDown != 0">{{ countDown }}s</span>
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
import { check_validcode } from './server';
import { user_send_email } from '@/server';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      form: {
        loginName: '',
        validCode: ''
      },
      rules: {
        loginName: [{ type: 'email', required: true, message: '请输入邮箱' }],
        validCode: [{ required: true, message: '请输入邮箱验证码' }]
      },
      countDown: 0
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
    goPhone() {
      this.$router.push('/user/forget/phone');
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.post_check_validcode({
            templateCode: 'user_9',
            validCodeType: 'email',
            ...this.form
          });
          // this.post_pwd_reset();
        }
      });
    },
    async post_user_send_email() {
      const res = await user_send_email({
        email: this.form.loginName,
        templateCode: 'user_9'
      });
      if (res.code == '200') {
        this.$message({
          type: 'success',
          message: '发送成功'
        });
        this.showTime();
      } else {
        this.$message.error(res.data.msg);
      }
    },
    showTime() {
      this.countDown = 120;
      let countDown = setInterval(() => {
        this.countDown--;
        if (this.countDown == 0) {
          clearInterval(countDown);
        }
      }, 1000);
    },
    async post_check_validcode(params) {
      const res = await check_validcode(params);
      if (res.data) {
        this.$router.push({
          path: '/user/forget/newpass',
          query: {
            userName: this.form.loginName,
            validCode: this.form.validCode,
            validCodeType: 'email'
          }
        });
      } else {
        this.$message({
          type: 'error',
          message: '验证码不正确'
        });
      }
    }
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
.email {
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
  .relative {
    position: relative;
  }
  .clickGet {
    position: absolute;
    right: 8px;
    font-size: 14px;
    cursor: pointer;

    font-weight: 500;
    color: rgba(47, 84, 235, 1);
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
    /*border-bottom: 1px solid rgba(47, 84, 235, 1);*/
    cursor: pointer;
  }
}
</style>
