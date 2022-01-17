<!-- step1 -->
<template>
  <div class="step1 flex flex-direction align-center">
    <div class="step1-login">
      <el-form ref="ruleForm" :rules="rules" label-position="right" label-width="80px" :model="form">
        <el-form-item label="邮箱" prop="email">
          <el-input placeholder="请输入邮箱地址" v-model="form.email"></el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="validCode" class="fix">
          <el-input placeholder="请输入验证码" v-model="form.validCode"></el-input>
          <span class="toget" @click="post_user_send_email" v-if="countDown == 0">点击获取</span>
          <span class="toget" v-else>{{ countDown }}</span>
        </el-form-item>
        <div class="step1-privacy">
          点击“下一步”即代表同意
          <span><a href="http://m.didimessage.com/#/staticpage/privacy" target="_blank">《隐私政策与注册协议》</a></span>
        </div>
        <el-form-item>
          <el-button style="width: 100%; font-size: 16px" type="primary" @click="submitForm('ruleForm')">下一步</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { user_send_email } from '@/server';
import { md5 } from '@/utils';
import { mapActions } from 'vuex';
import { WEB_CODE_LOGIN } from '@/store/types';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      countDown: 0,
      form: {
        email: '',
        validCode: ''
      },
      rules: {
        email: [{ type: 'email', required: true, message: '请输入邮箱' }],
        validCode: [{ required: true, min: 6, max: 6, message: '请输入6位验证码' }]
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
      let now = Date.now();
      let sign = md5(
        `timestamp=${now}&userName=${this.form.email}
        &validCode=${this.form.validCode}&validCodeType=email&key=4yUbWtGLevMv9GVH`
      );

      this.WEB_CODE_LOGIN({
        timestamp: now,
        loginName: this.form.email,
        userName: this.form.email,
        email: this.form.email,
        validCode: this.form.validCode,
        validCodeType: 'email',
        templateCode: 'user_7',
        sign,
        isRegister: true
      });
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
.step1 {
  width: 1000px;
  .step1-login {
    width: 40%;
    margin: 40px 20px 0 0;
  }
  .toget {
    font-size: 14px;

    font-weight: 500;
    color: rgba(47, 84, 235, 1);
    cursor: pointer;
    position: absolute;
    right: 10px;
  }
  .fix {
    position: relative;
  }
  .step1-privacy {
    margin: 320px 0px 20px 0;
    text-align: right;
    width: 100%;
    font-size: 13px;
    span {
      font-size: 13px;

      font-weight: 400;
      color: #2f54eb;
      cursor: pointer;
      margin-right: 10px;
    }
  }
}
</style>
