<!-- pass -->
<template>
  <div class="email">
    <div class="main-login">
      <h3>忘记密码</h3>
      <div class="flex align-center justify-around">
        <span class="reset">请输入新密码，密码为6~16位的数字或字母</span>
      </div>
      <el-form ref="ruleForm" :rules="rules" label-position="top" label-width="80px" :model="form">
        <el-form-item label="新密码" prop="password">
          <el-input placeholder="请输入新的密码" :type="showPassword ? 'text' : 'password'" v-model="form.password">
            <img
              src="../../../assets/images/open.png"
              slot="suffix"
              v-if="showPassword"
              class="password-image"
              @click="showPassword = !showPassword"
              alt
            />
            <img src="../../../assets/images/close.png" slot="suffix" v-else class="password-image"
                 @click="showPassword = !showPassword" alt/>
          </el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="newPassword" class="relative">
          <el-input placeholder="请再次输入新的密码" :type="showNewPassword ? 'text' : 'password'" v-model="form.newPassword">
            <img
              src="../../../assets/images/open.png"
              slot="suffix"
              v-if="showNewPassword"
              class="password-image"
              @click="showNewPassword = !showNewPassword"
              alt
            />
            <img src="../../../assets/images/close.png" slot="suffix" v-else class="password-image"
                 @click="showNewPassword = !showNewPassword" alt/>
          </el-input>
        </el-form-item>
        <div class="login-code flex align-center justify-between">
          <!-- <span>密码登录</span> -->
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
import { pwd_reset } from './server';
import { md5 } from '@/utils';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else if (value.length < 6 || value.length > 16) {
        callback(new Error('请输6-16位密码'));
      } else {
        if (this.form.newPassword !== '') {
          // 对第二个密码框单独验证
          this.$refs['ruleForm'].validateField('newPassword');
        }
        callback();
      }
    };
    const validatePassCheck = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入新密码'));
      } else if (value.length < 6 || value.length > 16) {
        callback(new Error('请输6-16位新密码'));
      } else if (value !== this.form.password) {
        callback(new Error('密码不一样'));
      } else {
        callback();
      }
    };
    //这里存放数据
    return {
      form: {
        newPassword: '',
        password: ''
      },
      rules: {
        password: [{ validator: validatePass, trigger: 'blur' }],
        newPassword: [{ validator: validatePassCheck, trigger: 'blur' }]
      },
      showPassword: false,
      showNewPassword: false
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.post_pwd_reset({
            userName: this.$route.query.userName,
            password: md5(this.form.password),
            validCode: this.$route.query.validCode,
            validCodeType: this.$route.query.validCodeType
          });
        }
      });
    },
    async post_pwd_reset(params) {
      let res = await pwd_reset(params);
      if (res.code == '200') {
        this.$message.success('修改成功');
        this.$router.push('/user/login/pass');
      }
    },
    showPass() {
      this.showPassword = !this.showPassword;
    },
    showNewPass() {
      this.showNewPassword = !this.showNewPassword;
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
  padding: 20px;
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
    padding: 10px 10px 40px 10px;
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
  .reset {
    font-size: 14px;

    font-weight: 400;
    color: rgba(47, 84, 235, 1);
    margin-bottom: 10px;
  }
  .password-image {
    margin-top: 10px;
    margin-right: 3px;
    opacity: 0.5;
  }
}
</style>
