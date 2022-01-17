<template>
  <div class="pass">
    <div class="main-login">
      <h3>注册</h3>
      <el-form ref="ruleForm" :rules="rules" label-position="top" label-width="80px" :model="form">
        <el-form-item label="邮箱" prop="email">
          <el-input placeholder="请输入邮箱地址" v-model="form.email"></el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="validCode" class="relative">
          <el-input placeholder="请输入邮箱验证码" v-model="form.validCode"></el-input>
          <span class="clickGet" @click="post_user_send_email" v-if="countDown == 0">点击获取</span>
          <span class="clickGet" v-else>{{ countDown }}</span>
        </el-form-item>
        <div class="login-code flex align-center justify-between">
          <span @click="quick">快捷登录</span>
          <span @click="forget">忘记密码</span>
        </div>
        <el-form-item>
          <div class="step1-privacy">
            <span>注册即代表同意</span>
            <a href="http://m.didimessage.com/#/staticpage/privacy" target="_blank">《隐私政策与注册协议》</a>
          </div>
          <el-button style="width: 100%" type="primary" :loading="loading" @click="submitForm('ruleForm')">立即注册</el-button>
          <div class="regsiter-btn">
            <router-link to="/user/register">注册专业版</router-link>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { mapState } from 'vuex';
import { user_web_register } from './server';
import { user_send_email } from '@/server';
import { md5 } from '@/utils';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      countDown: 0,
      loading: false,
      form: {
        email: '',
        validCode: ''
      },
      rules: {
        email: [{ type: 'email', required: true, message: '请输入邮箱' }],
        validCode: [{ required: true, message: '请输入邮箱验证码', trigger: 'blur' }]
      }
    };
  },
  //监听属性 类似于data概念
  computed: {
    ...mapState({
      loginInfo: obj => {
        return obj.state.loginInfo;
      }
    })
  },
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    post_user_send_email() {
      //判断是否填写了邮箱
      this.$refs.ruleForm.validateField('email', async message => {
        if (!message) {
          this.countDown = 120;
          let countDown = setInterval(() => {
            this.countDown--;
            if (this.countDown == 0) {
              clearInterval(countDown);
            }
          }, 1000);
          const res = await user_send_email({
            email: this.form.email,
            templateCode: 'user_3'
          });
          if (res.code == '200') {
            this.$message({
              type: 'success',
              message: '发送成功'
            });
          }
        }
      });
    },
    quick() {
      this.$router.push('/user/login/email');
    },
    forget() {
      this.$router.push('/user/forget/email');
    },
    submitForm(formName) {
      let _this = this;
      this.$refs[formName].validate(async valid => {
        if (valid) {
          try {
            _this.loading = true;
            let now = Date.now();
            let sign = md5(
              `timestamp=${now}&userName=${this.form.email}&validCode=${this.form.validCode}
              &validCodeType=email&key=4yUbWtGLevMv9GVH`
            );
            await user_web_register({
              ..._this.form,
              timestamp: now,
              validCodeType: 'email',
              userName: _this.form.email,
              sign
            });
            _this.loading = false;
            _this.$message.success('注册成功，可以进行登录了！');
            _this.$router.push('/user/login/pass');
          } catch (err) {
            _this.loading = false;
            _this.$message.error('注册失败，请重试或联系系统管理员！');
            throw new Error(err);
          }
        } else {
          return false;
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类
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
  .step1-privacy {
    text-align: center;
    color: #999;
    a {
      color: #2f54eb;
    }
  }
  .regsiter-btn {
    text-align: center;
    a {
      color: #999;
      &:hover {
        text-decoration: underline;
      }
    }
  }
  .relative {
    position: relative;
    .clickGet {
      position: absolute;
      right: 8px;
      font-size: 14px;
      cursor: pointer;

      font-weight: 500;
      color: rgba(47, 84, 235, 1);
    }
  }
  .login-code {
    font-size: 14px;
    padding: 0 0 40px;

    span {
      cursor: pointer;
      font-size: 14px;

      color: #2f54eb;
      //   color: rgba(51, 51, 51, 1);
    }
  }
}
</style>
