<!-- pass -->
<template>
  <div class="pass">
    <img src="../../../assets/images/di.png" alt style="width: 100px; display: block; margin: 0 auto; margin-top: -20px" /><br />
    <div class="main-login">
      <h5>Digital Economy · Lifestyle</h5>
      <el-form ref="ruleForm" :rules="rules" label-position="top" label-width="80px" :model="formValues">
        <el-form-item label="" prop="loginName">
          <el-input placeholder="请输入用户名/邮箱" v-model.trim="formValues.loginName" clearable></el-input>
          <!-- <el-input placeholder="请输入邮箱地址" v-model.trim="formValues.loginName"></el-input> -->
        </el-form-item>
        <el-form-item label="" prop="password">
          <el-input
            placeholder="请输入登录密码"
            :type="showPassword ? 'text' : 'password'"
            v-model="formValues.password"
            @keyup.enter.native="submitForm('ruleForm')"
          >
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
          <el-input v-show="false" v-model="formValues.uuid" />
        </el-form-item>
        <div class="login-code flex align-center justify-between">
          <!-- <span @click="quick">快捷登录</span> -->
          <span @click="qrcode">扫码登录</span>
          <span @click="forget">忘记密码</span>
        </div>
        <el-form-item>
          <el-button style="width: 100%" type="primary" :loading="loading" @click="submitForm('ruleForm')">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <el-dialog title="弹出表单" :visible.sync="dialogFormVisible">
        <el-form :model="form">
          <el-form-item label="表单内容一" :label-width="formLabelWidth">
            <el-input v-model="form.name" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="表单内容二" :label-width="formLabelWidth">
            <el-select v-model="form.region" placeholder="请选择">
              <el-option label="区域一" value="shanghai"></el-option>
              <el-option label="区域二" value="beijing"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { mapState, mapActions } from 'vuex';
import { getMachineId } from '@/utils'
import { WEB_LOGIN } from '@/store/types';
import { md5 } from '@/utils';

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    let checkData = (rule, value, callback) => {
      if (value) {
        if (value.indexOf(' ') > -1) {
          callback(new Error('只能输入数字、字母及符号!'));
        } else {
          callback();
        }
      }
      callback();
    };
    //这里存放数据
    return {
      loading: false,
      formValues: {
        // loginName: "zw004@qq.com",
        // password: "1qaz2wsx",
        loginName: '',
        password: 'abc123',

        UDID: ''
      },
      rules: {
        loginName: [
          { required: true, message: '请输入邮箱地址或用户名' },
          {
            validator: checkData,
            message: '只能输入数字、字母及符号',
            trigger: 'blur'
          },
          { min: 5, max: 50, message: '请输入5-50位' }
        ],
        password: [
          { required: true, message: '请输入密码' },
          {
            validator: checkData,
            message: '只能输入数字、字母及符号',
            trigger: 'blur'
          },
          { min: 6, max: 16, message: '请输入6-16位' }
        ]
      },
      // 测试右键相关代码
      testRightClick: [
        { name: 'aaaa', age: '20' },
        { name: 'bbbb', age: '30' }
      ],
      changeValueV: {
        name: '',
        age: ''
      },
      dialogFormVisible: false,
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      formLabelWidth: '120px',
      showPassword: false
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
    ...mapActions([WEB_LOGIN]),
    rightClick(e, item) {
      this.changeValueV = item;
      e.preventDefault();
      this.addClick();
    },
    async login(field) {
      try {
        this.loading = true;
        let res = await this.WEB_LOGIN({
          isScan: false,
          type: 'pass',
          deviceName: process.platform == 'darwin' ? 'MAC' : 'Windows',
          ...field
        });
        console.log(res, 'pass');
        if (res.data.code == '010606' || res.data.code == '010604') {
          this.loading = false;
        } else if (res.code == '200') {
          this.loading = false;
        } else {
          this.loading = false;
          //this.$message.error(res.data.msg);
        }
      } catch (err) {
        this.loading = false;
        //用户被限制登录提示信息重复
        // this.$message.error("登录失败，请重试！");
        throw new Error(err);
      }
    },
    quick() {
      this.$router.push('/user/login/email');
    },
    forget() {
      this.$router.push('/user/forget/email');
    },
    qrcode() {
      this.$router.push('/user/login/qrcode');
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        const machineId = getMachineId();
        if (valid) {
          this.formValues.UDID = 'didi.pc-' + machineId;
          this.login({
            ...this.formValues,
            password: md5(this.formValues.password)
          });
        } else {
          return false;
        }
      });
    },
    S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    },
    guid() {
      return this.S4() + '-' + this.S4() + '-' + this.S4() + '-' + this.S4() + '-' + this.S4();
    },
    // 以下为单页面添加鼠标右键事件
    addClick() {
      return this.$RightClick([
        {
          name: '复制',
          fun: () => {
            console.log(this.changeValueV);
            this.$message.success(`已复制${this.changeValueV.name}`);
          }
        },
        {
          name: '粘贴',
          fun: () => {
            console.log(this.changeValueV);
            this.$message.success(`已粘贴${this.changeValueV.name}`);
          }
        },
        {
          name: '设置社区成员备注',
          fun: () => {
            console.log(this.changeValueV);
            this.dialogFormVisible = true;
          }
        }
      ]).popup({ window: window.vm.$remote.getCurrentWindow() });
    },
    showPass() {
      this.showPassword = !this.showPassword;
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    document.body.style.border = '#ddd solid 1px';
  },
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  // beforeRouteLeave(to, from, next) {
  //   next();
  // },
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {}, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang="less">
.main-login {
  .el-input__inner,
  .el-textarea__inner {
    background: #fff;
    border-bottom: 1px solid #e5e5e5;
    border-radius: 0;
  }
}
</style>
<style lang="less" scoped>
//@import url(); 引入公共css类
.pass {
  position: absolute;
  top: 80px;
}
.main-login {
  width: 400px;
  height: 530px;
  padding: 0 60px 60px 60px;
  box-sizing: border-box;
  // background: rgba(255, 255, 255, 1);
  box-shadow: 0px 4px 8px 0px rgba(5, 36, 163, 0.1);
  border-radius: 4px;
  & > h5 {
    text-align: center;

    color: #1f52f4;
    margin: 0 0 40px 0;
  }
  /* h3 {
    text-align: center;
    margin: 0 0 30px 0;
    font-size: 18px;
    
    font-weight: bold;
    color: rgba(51, 51, 51, 1);
  } */

  .login-code {
    font-size: 14px;
    padding: 0 0 20px;
    span {
      cursor: pointer;
      font-size: 14px;

      color: #2f54eb;
    }
  }
  .password-image {
    margin-top: 10px;
    margin-right: 3px;
    opacity: 0.5;
  }
}
</style>
