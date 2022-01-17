<!-- 手机验证 -->
<template>
  <div class="phone-verificaty-wrap">
    <el-form :model="rulePhoneForm" :rules="rules" ref="rulePhoneForm" :label-width="labelWidth" class="demo-rulePhoneForm">
      <div>
        <el-form-item label="请输入手机号码" prop="mobile">
          <el-input v-model="rulePhoneForm.mobile" class="input-with-select" maxlength="12">
            <el-select v-model="rulePhoneForm.countryObj" value-key="areaCode" filterable slot="prepend" placeholder="请选择">
              <el-option :label="item.areaCode" :value="item" v-for="(item, index) in contryList" :key="index"></el-option>
            </el-select>
            <!-- <span slot="prefix" class="check-phone-icon"></span> -->
          </el-input>
        </el-form-item>
        <el-form-item label="请输入手机验证码" prop="mobileValidCode">
          <el-input v-model="rulePhoneForm.mobileValidCode" maxlength="6">
            <!-- <span slot="suffix" class style="color:#2F54EB;margin-right: 10px;">获取验证码</span> -->
            <span slot="suffix" v-if="this.timer_s" style="color: #2F54EB; margin-right: 10px; user-select: none">{{
              countdownNumber_s + 's'
            }}</span>
            <span
              slot="suffix"
              v-if="!this.timer_s"
              style="color: #2F54EB; margin-right: 10px; user-select: none"
              @click="getCode('user_34')"
              >获取验证码</span
            >
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button class="submit-btn" @click.prevent="submitForm('rulePhoneForm')">完成验证</el-button>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { mapGetters, mapActions } from 'vuex';
import { send_newcode_mobile, get_country_list, bind_first_mobile, rebind_mobile } from '../server';

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      labelWidth: '150px',
      rulePhoneForm: {
        // emailValidCode: "",
        mobile: '',
        mobileValidCode: '',
        countryObj: ''
      },
      rules: {
        // emailValidCode: [
        //   { required: true, message: "请输入邮箱验证码", trigger: "blur" },
        //   {
        //     pattern: /^[0-9]{6,6}$/,
        //     message: "请输入6位数字"
        //   }
        // ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          {
            pattern: /^[0-9]{7,12}$/,
            message: '请输入7~12位数字'
          }
        ],
        mobileValidCode: [
          { required: true, message: '请输入手机验证码', trigger: 'blur' },
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
      this.geCountryList();
      this.getBindUserInfor();
    },
    async bindMobile() {
      // 绑定
      let res = await bind_first_mobile({
        mobile: this.rulePhoneForm.mobile,
        countryCode: this.rulePhoneForm.countryObj.code,
        mobileValidCode: this.rulePhoneForm.mobileValidCode
      });

      this.warnFn(res);
    },
    async reBindMobile() {
      // 修改绑定
      let res = await rebind_mobile(this.rulePhoneForm);
      this.warnFn(res);
    },
    warnFn(res) {
      if (res.code == '200') {
        this.$message.success(res.msg);
        this.$emit('closeDig', false);
      } else {
        this.$message.error(res.msg);
      }
    },
    async geCountryList() {
      // 获取区号列表
      try {
        let res = await get_country_list();
        if (res.code == '200') {
          this.contryList = res.data;
        }
      } catch (error) {
        console.error(error);
      }
    },
    getCode(templateCode) {
      if (templateCode == 'user_33') {
        this.countdownNumber = 120;
        this.timer = setInterval(() => {
          this.countdown(templateCode);
        }, 1000);
      }
      if (templateCode == 'user_34') {
        this.countdownNumber_s = 120;
        this.timer_s = setInterval(() => {
          this.countdown(templateCode);
        }, 1000);
      }

      this.sendCodeHand(templateCode);
    },
    countdown(templateCode) {
      // 倒计时
      if (templateCode == 'user_33') {
        // 邮箱验证码
        if (this.countdownNumber == 0) {
          clearInterval(this.timer);
          this.timer = null;
          return;
        }
        this.countdownNumber -= 1;
      }
      if (templateCode == 'user_34') {
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
      let res = await send_newcode_mobile({
        templateCode: templateCode,
        mobile: this.rulePhoneForm.mobile,
        areaCode: this.rulePhoneForm.countryObj.areaCode,
        countryCode: this.rulePhoneForm.countryObj.code
      });
      if (res.data == true) {
        this.$message.success(res.msg);
      } else {
        this.$message.error(res.msg);
      }
    },
    checkBindHand(val) {
      this.orShow = true;
      // 是否绑定的标识
      this.flagBind = val;
    },

    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          //绑定的手机不能修改
          // if(this.flagBind) {
          //   // 已经认证
          //   this.reBindMobile()
          // } else {
          //   this.bindMobile()
          // }
          this.bindMobile();
        } else {
          return false;
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
  destroyed() {
    clearInterval(this.timer);
    clearInterval(this.timer_s);
  }, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style>
.phone-verificaty-wrap .input-with-select .el-input-group__prepend {
  background-color: #fff;
}

.phone-verificaty-wrap .input-with-select .el-select .el-input {
  width: 100px;
}
</style>
<style lang="less" scoped>
//@import url(); 引入公共css类
.phone-verificaty-wrap {
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
