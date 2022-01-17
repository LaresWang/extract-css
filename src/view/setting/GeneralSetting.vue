<!-- 通用设置 -->
<template>
  <div class="general-setting-wrap">
    <!-- <div class="general-setting-title">
      <div>通用设置</div>
      <p>个人ID：456098553</p>
    </div>-->
    <div class="general-setting-content">
      <el-alert v-if="userStatus == 2" :title="`驳回${userInfo.remark}`" type="error" show-icon effect="dark"> </el-alert>
      <el-form @submit.native.prevent :model="userInfo" :rules="rules" ref="userInfo" :label-width="labelWidth" class="demo-userInfo">
        <el-form-item label="账户类型">
          <div class="box-bg account-wrapper">
            <span>
              {{ userInfo.userType !== 5 ? '普通用户' : '专业用户' }}
            </span>
            <template v-if="userInfo.userType !== 5">
              <!-- 账号状态(null: 表示未提交审核 0:待审核1:审核完成2:驳回） -->
              <el-button type="text" v-if="userStatus === null || userStatus == 2" @click="$router.push('/app/upgradeAccount')"
                >升级账户</el-button
              >
              <span v-else-if="userStatus === 0" style="color: rgba(146, 146, 146, 1)">待审核</span>
            </template>
          </div>
        </el-form-item>
        <el-form-item label="个人ID">
          <div class="box-bg">{{ userInfo.inviteCode }}</div>
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="userInfo.nickName" maxlength="15"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="userInfo.gender">
            <el-radio label="1" value="1">男</el-radio>
            <el-radio label="2" value="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="个性签名">
          <el-input type="textarea" v-model="userInfo.personalSign" maxlength="50" show-word-limit :rows="5"></el-input>
        </el-form-item>
        <el-form-item label="通知设置" prop="delivery">
          <el-switch v-model="userInfo.delivery" active-color="#999999" inactive-color="#009900"></el-switch>
        </el-form-item>
        <el-form-item>
          <div class="flex btn-wrap">
            <div class="flex-sub">
              <button class="submit-btn" type="info" @click="goBack">
                返回
              </button>
            </div>
            <div class="flex-sub">
              <button class="submit-btn" @click="submitForm('userInfo')">
                保存
              </button>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <div class="upload-avatar-wrap">
      <!-- :on-preview="handlePreview"
        :on-remove="handleRemove"
        :before-remove="beforeRemove"
        :on-exceed="handleExceed"
        :limit="1" -->
      <el-upload
        class="upload-demo"
        :action="uploadUrl"
        :data="uploadData"
        :headers="headers"
        :show-file-list="false"
        :before-upload="beforeAvatarUpload"
        :on-success="handleAvatarSuccess"
      >
        <el-avatar :size="48" fit="contain" :src="userInfo.headImg"></el-avatar>
        <div class="upload-text">上传</div>
      </el-upload>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { upload_images_avatar, set_user_info } from './server';
import { user_get_team_info } from '@/layouts/user/register/server';
import { mapGetters, mapActions } from 'vuex';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    let validateGender = (rule, value, callback) => {
      if (value === '0') {
        callback(new Error('请选择性别'));
      } else {
        callback();
      }
    };
    return {
      labelWidth: '130px',
      rules: {
        nickName: [
          { required: true, message: '昵称不能为空', trigger: 'blur' }
          // { min: 1, max: 50, message: "长度在 3 到 5 个字符", trigger: "blur" }
        ],
        gender: [
          { required: true, message: '请选择性别', trigger: 'blur' },
          { validator: validateGender, trigger: 'blur' }
        ]
      },
      uploadData: {},
      uploadUrl: upload_images_avatar(),
      headers: {
        Authorization: localStorage.accessToken
      },
      userStatus: '', //用户审核状态
      userRemark: '' // 驳回原因
    };
  },
  //监听属性 类似于data概念
  computed: {
    ...mapGetters({
      userInfo: 'userInfo'
    })
  },

  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    init() {
      this.getUserInfo();
    },
    async saveUserInfo() {
      // 保存个人信息
      let pararms = {
        icon: this.userInfo.headImg,
        gender: this.userInfo.gender,
        personalSign: this.userInfo.personalSign,
        nickName: this.userInfo.nickName
        // ...this.userInfo
      };
      let res = await set_user_info(pararms);
      if (res.code == '200') {
        this.$message.success(res.msg);
      } else {
        this.$message.error(res.msg);
      }
    },
    goBack() {
      this.$router.go(-1);
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          //
          this.saveUserInfo();
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    beforeAvatarUpload(files) {
      const isLt2M = files.size / 1024 < 300;
      const textArr = files.name.split('.');
      const isPng = textArr[textArr.length - 1].toLowerCase();
      if (isPng == 'jpg' || isPng == 'png' || isPng == 'jpeg') {
        if (!isLt2M) {
          this.$message.error('单个文件不可超过300 kB!');
          return false;
        }
      } else {
        this.$message('仅支持上传png、jpg、jpeg格式的文件');
        return false;
      }
      this.uploadData.file = files.name;
    },
    handleAvatarSuccess(data) {
      if (data.code == '200') {
        this.userInfo.headImg = data.data.path;
        this.$message.success(data.msg);
      } else {
        this.$message.error(data.msg);
      }
    },
    // 获取用户的审核状态，如果非专业用户时才进行查询
    async getAccountInfo() {
      if (this.userInfo.userType === 5) return false;
      try {
        let { data } = await user_get_team_info();
        if (data === null) {
          this.userStatus = null;
        } else {
          this.userStatus = data.status;
          this.userRemark = data.remark || '';
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    ...mapActions({
      getUserInfo: 'GET_USER_INFO'
    })
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.init();
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    setTimeout(this.getAccountInfo, 1500);
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
<style>
.general-setting-wrap .upload-avatar-wrap .el-upload-list {
  display: none;
}
</style>
<style lang="less" scoped>
//@import url(); 引入公共css类

.general-setting-wrap {
  position: relative;
  .box-bg {
    width: 420px;
    height: 40px;
    background: rgba(247, 247, 250, 1);
    box-shadow: 0px 0px 1px 0px rgba(153, 153, 153, 0.3);
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 15px;
  }
  .account-wrapper {
    display: flex;
    justify-content: space-between;
    button {
      font-weight: normal;
    }
  }
  .upload-avatar-wrap {
    position: absolute;
    right: calc((100% - 550px - 48px) / 2 / 2);
    top: 0;
    .upload-text {
      color: #2f53eb;
      font-size: 14px;
      margin-top: 10px;
    }
  }
  .general-setting-title {
    text-align: center;
    line-height: 22px;
    font-size: 16px;
    color: #151f34;
  }
  .general-setting-title p {
    color: #9297a3;
    margin: 10px 0 30px;
    line-height: 20px;
    font-size: 14px;
  }
  .general-setting-content {
    width: 550px;
    margin: 0 auto;
  }
  .text {
    color: #151f34;
    font-size: 10px;
    line-height: 14px;
    margin: 60px 0 10px;
  }
  .submit-btn {
    height: 40px;
    background: #2f54eb;
    box-shadow: 0px 0px 1px 0px rgba(153, 153, 153, 0.3);
    border-radius: 4px;
    color: #fff;
    font-size: 14px;
    border: none;
    user-select: none;
    width: 100%;
    outline: none;
  }
  .btn-wrap {
    .flex-sub:nth-child(1) {
      margin-right: 20px;
      .submit-btn {
        background: #9297a3;
      }
    }
  }
}
</style>
