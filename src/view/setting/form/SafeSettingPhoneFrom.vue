<!--安全设置 手机验证 -->
<template>
  <div class="save-phone-verificaty-wrap">
    <el-form :model="ruleEmailForm" :rules="rules" ref="ruleEmailForm" :label-width="labelWidth" class="demo-ruleEmailForm">
      <el-form-item label="当前手机号" prop="userName">
        <el-input v-model="ruleEmailForm.userName" maxlength="12"></el-input>
      </el-form-item>
      <el-form-item label="请输入验证码" prop="validCode">
        <el-input v-model="ruleEmailForm.validCode" maxlength="6">
          <span slot="suffix" v-if="this.timer" style="color: #2F54EB; margin-right: 10px; user-select: none">{{
            countdownNumber + 's'
          }}</span>
          <span slot="suffix" v-if="!this.timer" style="color: #2F54EB; margin-right: 10px; user-select: none" @click="getCode('user_12')"
            >获取验证码</span
          >
        </el-input>
      </el-form-item>
      <el-form-item label="请输入密码" prop="password">
        <el-input v-model="ruleEmailForm.password" :type="orShow ? 'password' : 'text'" maxlength="16">
          <span slot="suffix" class style="color: #2F54EB; margin-right: 10px">
            <img src="../../../assets/images/close.png" v-show="orShow" @click="tabPsdHand" width="20px"
                 style="vertical-align: middle" alt/>
            <img src="../../../assets/images/open.png" v-show="!orShow" @click="tabPsdHand" width="20px"
                 style="vertical-align: middle" alt/>
          </span>
        </el-input>
      </el-form-item>
      <el-form-item label="请确认新密码" prop="newPwd">
        <el-input v-model="ruleEmailForm.newPwd" type="password" maxlength="16"></el-input>
      </el-form-item>
      <el-form-item>
        <button class="submit-btn" @click.prevent="submitForm('ruleEmailForm')">
          完成验证
        </button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { send_code_mobile, reset_user_pwd } from '../server';
import { md5 } from '@/utils';

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    let validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else {
        if (this.ruleEmailForm.newPwd !== '') {
          this.$refs.ruleEmailForm.validateField('newPwd');
        }
        callback();
      }
    };
    let validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入确认密码'));
      } else if (value !== this.ruleEmailForm.password) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      labelWidth: '150px',
      ruleEmailForm: {
        userName: '',
        validCode: '',
        password: '',
        newPwd: '',
        validCodeType: 'mobile'
      },
      rules: {
        userName: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            pattern: /^[0-9]{7,12}$/,
            message: '请输入7~12位数字'
          }
        ],
        validCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          {
            pattern: /^[0-9]{6,6}$/,
            message: '请输入6位数字'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { validator: validatePass, trigger: 'blur' }
        ],
        newPwd: [
          { required: true, message: '请输入确认新密码', trigger: 'blur' },
          { validator: validatePass2, trigger: 'blur' }
        ]
      },
      orShow: true,
      countdownNumber: 120,
      timer: null,
      saveBtn: false
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    async save_reset_user_pwd() {
      let pararms = {
        ...this.ruleEmailForm,
        password: md5(this.ruleEmailForm.password)
      };
      delete pararms.newPwd;
      let res = await reset_user_pwd(pararms);
      this.saveBtn = false;
      if (res.code == '200') {
        this.$message.success(res.msg);
      } else {
        this.$message.error(res.msg);
      }
    },
    getCode(templateCode) {
      this.countdownNumber = 120;
      this.timer = setInterval(() => {
        this.countdown();
      }, 1000);
      this.sendCodeHand(templateCode);
    },
    countdown() {
      // 倒计时
      // 邮箱验证码
      if (this.countdownNumber == 0) {
        clearInterval(this.timer);
        this.timer = null;
        return;
      }
      this.countdownNumber -= 1;
    },
    async sendCodeHand(templateCode) {
      let res = await send_code_mobile({ templateCode });
      if (res.data == true) {
        this.$message.success(res.msg);
      } else {
        this.$message.error(res.msg);
      }
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.saveBtn = true;
          this.save_reset_user_pwd();
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    tabPsdHand() {
      this.orShow = !this.orShow;
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
.save-phone-verificaty-wrap {
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
  }
}
</style>
