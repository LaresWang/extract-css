<!-- 手机验证 -->
<template>
  <div class="trade-phone-wrap">
    <el-form :model="rulePhoneForm" :rules="rules" ref="rulePhoneForm" :label-width="labelWidth" class="demo-rulePhoneForm">
      <div v-if="comForm.mobile">
        <el-form-item label="当前手机号">
          <div style="color: #151F34">{{ comForm.mobile }}</div>
        </el-form-item>
        <el-form-item label="请输入验证码" prop="validCode">
          <el-input v-model="rulePhoneForm.validCode" maxlength="6">
            <span slot="suffix" v-if="this.timer" style="color: #2F54EB; margin-right: 10px; user-select: none">{{
              countdownNumber + 's'
            }}</span>
            <span
              slot="suffix"
              v-if="!this.timer"
              style="
                color: #2F54EB;
                margin-right: 10px;
                user-select: none;
                cursor: pointer;
              "
              @click="getCode"
              >获取验证码</span
            >
          </el-input>
        </el-form-item>
      </div>
      <el-form-item label="请输入交易密码" prop="password">
        <el-input v-model="rulePhoneForm.password" :type="typeInput" maxlength="6">
          <span slot="suffix" class style="color: #2F54EB; margin-right: 10px">
            <img
              src="../../../../assets/images/close.png"
              v-show="orShow"
              @click="tabPsdHand"
              width="20px"
              style="vertical-align: middle; cursor: pointer"
              alt
            />
            <img
              src="../../../../assets/images/open.png"
              v-show="!orShow"
              @click="tabPsdHand"
              width="20px"
              style="vertical-align: middle; cursor: pointer"
              alt
            />
          </span>
        </el-input>
      </el-form-item>
      <el-form-item label="请确认交易密码" prop="checkPassword">
        <el-input v-model="rulePhoneForm.checkPassword" :type="typeInputSure" maxlength="6">
          <span slot="suffix" class style="color: #2F54EB; margin-right: 10px">
            <img
              src="../../../../assets/images/close.png"
              v-show="orShowSure"
              @click="tabPsdHandSure"
              width="20px"
              style="vertical-align: middle; cursor: pointer"
              alt
            />
            <img
              src="../../../../assets/images/open.png"
              v-show="!orShowSure"
              @click="tabPsdHandSure"
              width="20px"
              style="vertical-align: middle; cursor: pointer"
              alt
            />
          </span>
        </el-input>
      </el-form-item>
      <el-form-item>
        <button class="submit-btn" @click.prevent="submitForm('rulePhoneForm')">
          确定
        </button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import myMixin from '../mixin';
import { send_code_mobile } from '../server';

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  props: {
    comForm: {
      type: Object,
      dafault() {
        return {};
      }
    }
  },
  mixins: [myMixin],
  data() {
    //这里存放数据
    let validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else {
        if (this.rulePhoneForm.checkPassword !== '') {
          this.$refs.rulePhoneForm.validateField('checkPassword');
        }
        callback();
      }
    };
    let validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入确认交易密码'));
      } else if (value !== this.rulePhoneForm.password) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      labelWidth: '120px',
      typeInput: 'password',
      typeInputSure: 'password',
      rulePhoneForm: {
        validCode: '',
        password: '',
        checkPassword: ''
      },
      rules: {
        validCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          {
            pattern: /^[0-9]{6,6}$/,
            message: '请输入6位数字'
          }
        ],
        password: [
          {
            required: true,
            pattern: /^[0-9]{6,6}$/,
            message: '请输入6位数字'
          },
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPassword: [
          {
            required: true,
            pattern: /^[0-9]{6,6}$/,
            message: '请输入6位数字'
          },
          { required: true, validator: validatePass2, trigger: 'blur' }
        ]
      },
      orShow: true,
      orShowSure: true,
      timer: null,
      countdownNumber: 120
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    getCode() {
      this.countdownNumber = 120;
      this.timer = setInterval(() => {
        this.countdown();
      }, 1000);
      this.sendCodeHand();
    },
    countdown() {
      // 倒计时
      if (this.countdownNumber == 0) {
        clearInterval(this.timer);
        this.timer = null;
        return;
      }
      this.countdownNumber -= 1;
    },
    async sendCodeHand() {
      let res = await send_code_mobile({ templateCode: 'user_14' });
      if (res.data == true) {
        this.$message.success(res.msg);
      } else {
        this.$message.error(res.msg);
      }
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          // this.$emit('submitForm', this.rulePhoneForm, 'mobile')
          this.submitTradeForms(this.rulePhoneForm, 'mobile');
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
      this.typeInput = this.orShow ? 'password' : 'text';
    },
    tabPsdHandSure() {
      this.orShowSure = !this.orShowSure;
      this.typeInputSure = this.orShowSure ? 'password' : 'text';
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.getUserInfo();
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
.trade-phone-wrap {
  .submit-btn {
    margin-top: 38px;
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
    cursor: pointer;
  }
}
</style>
