<!-- google验证 -->
<template>
  <div class="trade-google-wrap">
    <el-form :model="ruleGoogleForm" :rules="rules" ref="ruleGoogleForm" :label-width="labelWidth" class="demo-ruleGoogleForm">
      <div v-if="comForm.googleAuthStatus && jyFlag">
        <el-form-item label="当前谷歌帐号">
          <div style="color: #151F34">{{ comForm.email }}</div>
        </el-form-item>
        <el-form-item label="请输入谷歌验证码" prop="validCode">
          <div class="input-groups-wrap">
            <el-input v-model="ruleGoogleForm.validCode" autocomplete="off" maxlength="6"></el-input>
          </div>
        </el-form-item>
      </div>
      <el-form-item label="请输入资金密码" prop="password">
        <el-input v-model="ruleGoogleForm.password" :type="typeInput" maxlength="6">
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
      <el-form-item label="请确认资金密码" prop="checkPassword">
        <el-input v-model="ruleGoogleForm.checkPassword" :type="typeInputSure" maxlength="6">
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
        <button class="submit-btn" @click.prevent="submitForm('ruleGoogleForm')">
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
import { fundpwd_first_pwd, fundpwd_set_pwd } from '../server';
import { md5 } from '@/utils';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  props: {
    comForm: {
      type: Object,
      dafault() {
        return {};
      }
    },
    jyFlag: {
      type: Boolean,
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
        if (this.ruleGoogleForm.checkPassword !== '') {
          this.$refs.ruleGoogleForm.validateField('checkPassword');
        }
        callback();
      }
    };
    let validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入确认交易密码'));
      } else if (value !== this.ruleGoogleForm.password) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      labelWidth: '140px',
      typeInput: 'password',
      typeInputSure: 'password',
      validCode: {},
      ruleGoogleForm: {
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
      orShowSure: true
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    parentHandleclick() {
      if (this.$refs['ruleGoogleForm'] != undefined) {
        this.$refs['ruleGoogleForm'].resetFields();
      }
    },
    checkNumber(eve) {
      this.$nextTick(() => {
        let val = eve.target.value;
        let index = eve.target.getAttribute('data-index');
        this.validCode[`key${index}`] = val.replace(/[^0-9$]{0,11}/g, '');
        if (Number(index) < 5) {
          this.$refs[`input${Number(index) + 1}`][0].focus();
        }
      });
    },
    submitForm(formName) {
      // let flag = false;
      // if (!this.checkData.google) {
      //   for (let i = 0; i <= 5; i++) {
      //     if (!this.validCode[`key${i}`]) {
      //       this.$message.warning("请输入验证码");
      //       flag = true;
      //       break;
      //     }
      //   }
      // }
      // if (flag) return;
      this.$refs[formName].validate(valid => {
        if (valid) {
          // this.ruleGoogleForm.validCode = "";
          // for (let i = 0; i <= 5; i++) {
          //   this.ruleGoogleForm.validCode += this.validCode[`key${i}`];
          // }
          // this.submitTradeForms(this.ruleGoogleForm, "google");
          if (this.jyFlag) {
            //设置过交易密码,此处为修改
            fundpwd_set_pwd({
              password: md5(this.ruleGoogleForm.password),
              validCode: this.ruleGoogleForm.validCode,
              validCodeType: 'google',
              type: 2
            }).then(res => {
              if (res.code == '200') {
                this.$message.success(res.msg);
                this.$emit('closeDigjy');
              }
            });
          } else {
            //首次设置
            fundpwd_first_pwd({
              password: md5(this.ruleGoogleForm.password)
            }).then(res => {
              if (res.code == '200') {
                this.$message.success(res.msg);
                this.$emit('closeDigjy');
              }
            });
          }
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
.trade-google-wrap {
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
  .input-groups-wrap {
    display: flex;
    justify-content: space-around;
    margin-top: 5px;
    input {
      display: inline-block;
      width: 30px;
      height: 30px;
      background: rgba(247, 247, 250, 1);
      box-shadow: 0px 0px 1px 0px rgba(153, 153, 153, 0.3);
      border-radius: 4px;
      border-radius: 4px;
      text-align: center;
      outline: none;
      border: none;
    }
  }
}
</style>
