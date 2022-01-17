<!-- pass -->
<template>
  <div class="email">
    <div class="main-login">
      <h3>团队登录</h3>
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
          <span @click="goForget">密码登录</span>
        </div>
        <el-form-item>
          <el-button style="width: 100%" :loading="loading" type="primary" @click="submitForm('ruleForm')">立即登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { mapActions } from 'vuex';
import { WEB_CODE_LOGIN } from '@/store/types';
import { user_send_email } from '@/server';
import { md5 } from '@/utils';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      loading: false,
      countDown: 0,
      form: {
        email: '',
        validCode: ''
      },
      rules: {
        email: [{ type: 'email', required: true, message: '请输入邮箱' }],
        validCode: [{ required: true, message: '请输入邮箱验证码' }]
      }
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    ...mapActions([WEB_CODE_LOGIN]),
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.post_user_web_code_login();
        }
      });
    },
    async post_user_send_email() {
      this.countDown = 120;
      let countDown = setInterval(() => {
        this.countDown--;
        if (this.countDown == 0) {
          clearInterval(countDown);
        }
      }, 1000);
      const res = await user_send_email({
        email: this.form.email,
        templateCode: 'user_7'
      });
      if (res.code == '200') {
        this.$message({
          type: 'success',
          message: '发送成功'
        });
      }
    },
    async post_user_web_code_login() {
      try {
        this.loading = true;
        let now = Date.now();
        let sign = md5(
          `timestamp=${now}&userName=${this.form.email}
          &validCode=${this.form.validCode}&validCodeType=email&key=4yUbWtGLevMv9GVH`
        );
        await this.WEB_CODE_LOGIN({
          timestamp: now,
          userName: this.form.email,
          email: this.form.email,
          validCode: this.form.validCode,
          validCodeType: 'email',
          templateCode: 'user_7',
          sign
        });
        this.loading = false;
      } catch (err) {
        this.loading = false;
        this.$message.error('登录失败，请重试！');
        throw new Error(err);
      }
    },
    goForget() {
      this.$router.push('/user/login/pass');
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
    padding: 0 0 40px;
    span {
      cursor: pointer;
      font-size: 14px;

      color: rgba(47, 84, 235, 1);
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
}
</style>
