<!-- 邮箱验证 -->
<template>
  <div class="email-verificaty-wrap">
    <el-form :model="ruleEmailForm" :rules="rules" ref="ruleEmailForm" :label-width="labelWidth" class="demo-ruleEmailForm">
      <el-form-item label="邮箱地址" prop="email">
        <el-input v-model="ruleEmailForm.email" clearable></el-input>
      </el-form-item>
      <el-form-item label="邮箱验证码" prop="emailValidCode">
        <el-input v-model="ruleEmailForm.emailValidCode" maxlength="6">
          <span slot="suffix" v-if="this.timer_s" style="color: #2F54EB; margin-right: 10px; user-select: none">{{
            countdownNumber_s + 's'
          }}</span>
          <span
            slot="suffix"
            v-if="!this.timer_s"
            style="
              color: #2F54EB;
              margin-right: 10px;
              user-select: none;
              cursor: pointer;
            "
            @click="getCode('user_40')"
            >获取验证码</span
          >
        </el-input>
        <!-- <div style="color:#9297A3" class="text-left">更换后请重新登录</div> -->
      </el-form-item>
      <el-form-item>
        <el-button class="submit-btn" @click.prevent="submitForm('ruleEmailForm')">完成验证</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { mapGetters, mapActions } from 'vuex';
import { bind_first_email, rebind_email, emailvalidCode } from '../server';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      labelWidth: '150px',
      ruleEmailForm: {
        // mobileValidCode: "",
        email: '',
        emailValidCode: ''
      },
      rules: {
        // mobileValidCode: [
        //  { required: true, message: "请输入手机验证码", trigger: "blur" },
        //   {
        //     pattern: /^[0-9]{6,6}$/,
        //     message: "请输入6位数字"
        //   }
        // ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
          }
        ],
        emailValidCode: [
          { required: true, message: '请输入邮箱验证码', trigger: 'blur' },
          {
            pattern: /^[0-9]{6,6}$/,
            message: '请输入6位数字'
          }
        ]
      },
      user_data: {},
      timer: null,
      countdownNumber: 120,
      timer_s: null,
      countdownNumber_s: 120,
      select: '',
      contryList: [],
      orShow: false,
      flagBind: false
    };
  },
  inheritAttrs: false,
  //监听属性 类似于data概念
  computed: {
    ...mapGetters({
      userInfo: 'userInfo',
      bindUserInfo: 'bindUserInfo'
    })
  },
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    init() {
      this.getUserInfo();
      this.getBindUserInfor();
    },
    async bindEmail() {
      // 绑定
      let res = await bind_first_email(this.ruleEmailForm);
      this.warnFn(res);
    },
    async reBindEmail() {
      // 修改绑定
      let res = await rebind_email(this.ruleEmailForm);
      this.warnFn(res);
    },
    warnFn(res) {
      if (res.data && res.code == '200') {
        this.$message.success(res.msg || res.data.msg);
        this.$emit('closeDig', false);
        //TODO 修改邮箱后，生新生成了token，需要更新token
      } else {
        this.$message.error(res.msg || res.data.msg);
      }
    },
    checkBindHand(val) {
      this.orShow = true;
      // 是否绑定的标识
      this.flagBind = val;
    },
    getCode(templateCode) {
      // if (templateCode == "user_40") {
      //   this.countdownNumber_s = 120;
      //   this.timer_s = setInterval(() => {
      //     this.countdown(templateCode);
      //   }, 1000);
      // }
      // if (templateCode == "user_39") {
      //   this.countdownNumber = 120;
      //   this.timer = setInterval(() => {
      //     this.countdown(templateCode);
      //   }, 1000);
      // }

      this.sendCodeHand(templateCode); //不输入邮箱或者邮箱格式不正确时，点击获取验证码，弹出错误提示信息的时候，倒计时不应该开始进行计时，应该还是显示获取验证码按钮
    },
    countdown(templateCode) {
      // 倒计时
      if (templateCode == 'user_40') {
        // 邮箱验证码
        if (this.countdownNumber_s == 0) {
          clearInterval(this.timer_s);
          this.timer_s = null;
          return;
        }
        this.countdownNumber_s -= 1;
      }
      if (templateCode == 'user_39') {
        // 手机验证码
        if (this.countdownNumber_s == 0) {
          clearInterval(this.timer_s);
          this.timer_s = null;
          return;
        }
        this.countdownNumber_s -= 1;
      }
    },
    async sendCodeHand(templateCode) {
      let res = await emailvalidCode({
        email: this.ruleEmailForm.email,
        templateCode: templateCode
      });
      if (res.data == true && res.code == '200') {
        window.vm.$message.success(res.msg);
        if (templateCode == 'user_40') {
          this.countdownNumber_s = 120;
          this.timer_s = setInterval(() => {
            this.countdown(templateCode);
          }, 1000);
        }
        if (templateCode == 'user_39') {
          this.countdownNumber = 120;
          this.timer = setInterval(() => {
            this.countdown(templateCode);
          }, 1000);
        }
      } else {
        window.vm.$message.error(res.msg || res.data.msg);
      }
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.flagBind) {
            // 已经认证
            this.reBindEmail();
          } else {
            this.bindEmail();
          }
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    ...mapActions({
      getUserInfo: 'GET_USER_INFO',
      getBindUserInfor: 'GET_BIND_USER_INFO'
    })
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.init();
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
.email-verificaty-wrap {
  .submit-btn {
    height: 40px;
    background: #2f54eb;
    border-radius: 4px;
    color: #fff;
    font-size: 14px;
    border: none;
    user-select: none;
    width: 100%;
    outline: none;
    box-shadow: 0px 0px 1px 0px rgba(153, 153, 153, 0.3);
  }
  .bind-phone {
    text-align: left;
    color: #9297a3;
    i {
    }
  }
}
</style>
