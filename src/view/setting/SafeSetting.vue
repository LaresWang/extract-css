<!-- 安全设置 -->
<template>
  <div class="safe-setting-wrap">
    <div class="text-center">
      <!-- <Tab :data="tabData"/> -->
      <div style="margin: 10px auto; width: 500px; text-align: left">
        <el-form :model="comForm" :label-width="labelWidth" class="demo-ruleEmailForm">
          <el-form-item label="当前邮箱">
            <div class="bind-phone">
              <span class="greybg">{{ comForm.email ? comForm.email : '未绑定' }}</span>
              <img v-if="!comForm.email" width="20px" src="../../assets/images/drawal_editor.png" alt @click="BindEmail(comForm)" />
            </div>
          </el-form-item>
          <el-form-item label="谷歌身份验证器">
            <div class="bind-phone">
              <span class="greybg">{{ comForm.googleAuthStatus ? '已绑定' : '未绑定' }}</span>
              <img v-if="!comForm.googleAuthStatus" width="20px" src="../../assets/images/drawal_editor.png" alt @click="bindGoogle()" />
            </div>
          </el-form-item>
          <el-form-item label="登录密码">
            <div class="bind-phone">
              <span class="greybg">********</span>
              <img width="20px" src="../../assets/images/drawal_editor.png" alt @click="modifyPword()" />
            </div>
          </el-form-item>
          <el-form-item label="资金密码">
            <div class="bind-phone">
              <span class="greybg">{{ comForm.existFundPassWord ? '******' : '未设置' }}</span>
              <img width="20px" src="../../assets/images/drawal_editor.png" alt @click="modify_jyPword()" />
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <el-dialog
      title="绑定手机"
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      customClass="customWidth"
      @close="dialogVisible = false"
    >
      <IdentitySettingPhoneFrom @closeDig="closeDig"></IdentitySettingPhoneFrom>
    </el-dialog>
    <el-dialog
      title="绑定邮箱"
      :close-on-click-modal="false"
      :visible.sync="dialogVisible_email"
      :modal="false"
      customClass="customWidth"
      @close="closeIdentitySettingEmailFrom"
    >
      <IdentitySettingEmailFrom ref="IdentitySettingEmailFrom" @closeDig="closeDigEamil"></IdentitySettingEmailFrom>
    </el-dialog>
    <el-dialog
      title="谷歌身份验证器"
      :visible.sync="dialogVisible_google"
      :close-on-click-modal="false"
      customClass="customWidth"
      :modal="false"
      @close="dialogVisible_google = false"
    >
      <IdentitySettingGoogleFrom @closeDig="closeDigGoogle"></IdentitySettingGoogleFrom>
    </el-dialog>

    <el-dialog
      title="登录密码修改"
      :close-on-click-modal="false"
      :visible.sync="dialogVisible_passw"
      :modal="false"
      customClass="customWidth"
      @close="dialogVisible_passw = false"
    >
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="邮箱验证" name="first" v-if="comForm.email">
          <EmailFormPass ref="mychild" :comForm="comForm" @closeDigpass="closeDigpass"></EmailFormPass>
        </el-tab-pane>
        <!-- <el-tab-pane label="手机验证" name="second" v-if="comForm.mobile" >
              <PhoneFormPass  :comForm='comForm' @closeDig="closeDigGoogle" ></PhoneFormPass>
        </el-tab-pane>-->
      </el-tabs>
    </el-dialog>
    <el-dialog
      :title="fundsTitle"
      :close-on-click-modal="false"
      :visible.sync="dialogVisible_passjy"
      customClass="customWidth"
      :modal="false"
      @close="dialogVisible_passjy = false"
    >
      <el-tabs class="fundDialog" v-model="activeName2" @tab-click="handleClick">
        <!-- <el-tab-pane label="邮箱验证" name="email" v-if="comForm.email"> -->
        <el-tab-pane :label="verifiEmail" name="email" v-if="comForm.email">
          <EmailForm ref="jyEmailForm" :comForm="comForm" @closeDigjy="closeDigjy" :jyFlag="jyFlag"></EmailForm>
        </el-tab-pane>
        <!-- <el-tab-pane label="手机验证" name="mobile" v-if="comForm.mobile" >
              <PhoneForm  :comForm='comForm' @closeDig="closeDigGoogle" ></PhoneForm>
        </el-tab-pane>-->
        <el-tab-pane label="谷歌验证" name="google" v-if="comForm.googleAuthStatus">
          <GoogleForm ref="jyGoogleForm" :comForm="comForm" @closeDigjy="closeDigjy" :jyFlag="jyFlag"></GoogleForm>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <!-- <div class="safe-setting-content" id="safe-setting-content">
      <router-view></router-view>
    </div>-->
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { mapActions } from 'vuex';
import IdentitySettingPhoneFrom from './form/IdentitySettingPhoneFrom';
import IdentitySettingEmailFrom from './form/IdentitySettingEmailFrom';
import IdentitySettingGoogleFrom from './form/IdentitySettingGoogleFrom';
import EmailFormPass from '../funds/tradepsd/from/EmailFormPass';
import EmailForm from '../funds/tradepsd/from/EmailForm';
import GoogleForm from '../funds/tradepsd/from/GoogleForm';
import UserInfoUtils from '@/utils/UserInfoUtils.js';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    IdentitySettingPhoneFrom,
    IdentitySettingEmailFrom,
    IdentitySettingGoogleFrom,
    EmailFormPass,
    EmailForm,
    GoogleForm
  },
  data() {
    //这里存放数据
    return {
      jyFlag: false, //没有设置过交易密码
      activeName2: 'email',
      activeName: 'first',
      dialogVisible: false,
      dialogVisible_email: false,
      dialogVisible_google: false,
      dialogVisible_passw: false,
      dialogVisible_passjy: false,
      comForm: {
        userName: '',
        secureLevel: 2
      },
      labelWidth: '150px',
      tabData: [
        {
          label: '邮箱验证',
          path: '/app/setting/safe/email'
        },
        {
          label: '手机验证',
          path: '/app/setting/safe/phone'
        }
      ],
      fundsTitle: '资金密码修改',
      verifiEmail: '邮箱验证'
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    ...mapActions({
      getUserInfo: 'GET_USER_INFO'
    }),
    closeIdentitySettingEmailFrom() {
      this.$refs.IdentitySettingEmailFrom.ruleEmailForm.email = '';
      this.$refs.IdentitySettingEmailFrom.ruleEmailForm.emailValidCode = '';
      this.dialogVisible_email = false;
    },

    handleClick() {},
    modifyPword() {
      if (this.comForm.mobile || this.comForm.email) {
        this.dialogVisible_passw = true;
        if (this.$refs.mychild != undefined) {
          this.$refs.mychild.parentHandleclick();
        }
        if (this.comForm.email) {
          this.activeName = 'first';
        } else {
          this.activeName = 'second';
        }
      } else {
        this.$message.warning('请先绑定邮箱');
      }
    },
    modify_jyPword() {
      //修改资金密码
      if (this.comForm.email || this.comForm.googleAuthStatus) {
        this.dialogVisible_passjy = true;
        if (this.$refs.jyEmailForm != undefined) {
          this.$refs.jyEmailForm.parentHandleclick();
        }
        if (this.$refs.jyGoogleForm != undefined) {
          this.$refs.jyGoogleForm.parentHandleclick();
        }
        if (this.comForm.email) {
          this.activeName2 = 'email';
        } else {
          this.activeName2 = 'google';
        }
        if (this.comForm.existFundPassWord) {
          this.jyFlag = true; //已经设置过交易密码，此时属于修改，需要加上邮箱或者谷歌验证。首次设置的话，不需要加上其他验证，直接设置
        } else {
          this.fundsTitle = '设置资金密码';
          (this.verifiEmail = ''), (this.jyFlag = false);
        }
      } else {
        this.$message.warning('请先绑定邮箱或谷歌验证码');
      }
    },
    closeDig() {
      this.dialogVisible = false;
      this.init();
    },
    closeDigEamil() {
      this.dialogVisible_email = false;
      this.init();
    },
    closeDigGoogle() {
      this.dialogVisible_google = false;
      this.init();
    },
    closeDigpass() {
      this.dialogVisible_passw = false;
      this.init();
    },
    closeDigjy() {
      this.dialogVisible_passjy = false;
      this.init();
    },
    async init() {
      await this.getUserInfo();
      this.comForm = UserInfoUtils.getCurrentUserInfo();
    },
    handleClose() {},
    bindMobile() {
      this.dialogVisible = true;
    },
    BindEmail() {
      this.dialogVisible_email = true;
    },
    bindGoogle() {
      this.dialogVisible_google = true;
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.comForm = JSON.parse(localStorage.userInfo);
    console.log(this.comForm, localStorage.userInfo, 'localStorage.userInfolocalStorage.userInfo');
  },
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
.customWidth {
  width: 500px;
}
.greybg {
  background: #f7f7fa;
  height: 30px;
  line-height: 30px;
  // width: 300px;
  // padding: 8px 10px;
  width: 260px;
  padding: 5px;
  display: inline-block;
  border-radius: 5px;
  margin-right: 5px;
}
.safe-setting-wrap {
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
    img {
      cursor: pointer;
    }
  }
  .safe-setting-content {
    width: 500px;
    margin: 30px auto 0;
    .safe-setting-item-con {
      display: none;
    }
    .show {
      display: block;
    }
  }
}
.demo-ruleEmailForm {
  /deep/ .el-form-item {
    margin-bottom: 15px;
  }
}

.fundDialog /deep/ .el-tabs__nav-wrap::after {
  background-color: transparent;
}
</style>
