<!-- 通用设置 -->
<template>
  <div class="general-setting-wrap" v-loading="loading">
    <div class="general-setting-content">
      <div class="upload-avatar-wrap large">
        <div :class="userImageClass">
          <Copper ref="copperBox" @uploadCropper="uploadCropper" :avater="avater"></Copper>
          <img v-if="userInfo.vipType" class="userLevelClass" src="../../../assets/images/vipCrown.png" alt />
        </div>
        <div>
          <div class="name flex">
            <span class="nickname">{{ userInfo.nickName }}</span>
            <LevelIcon
              v-if="userInfo.inviteCode"
              :inviteCode="userInfo.inviteCode"
              :userRank="userInfo.userRank"
              iconType="large"
              :vipType="userInfo.vipType"
              :inviteCodeType="userInfo.inviteCodeType"
            />
          </div>
          <LuckIdIcon
            :inviteCode="userInfo.inviteCode"
            :userRank="userInfo.userRank"
            iconType="large"
            :vipType="userInfo.vipType"
            :inviteCodeType="userInfo.inviteCodeType"
            :listFlag="false"
          />
        </div>
      </div>

      <div class="upload-avatar-wrap"></div>
      <button class="submit-btn" @click="LOGIN_OUT(undefined)">{{ this.$t('personal_0018') }}</button>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import Copper from '@/components/chat/copper';
import LevelIcon from '@/components/memberIcon/LevelIcon';
import { upload_images_avatar, set_user_icon } from '../server';
import { user_get_team_info } from '@/layouts/user/register/server';
import { LOGIN_OUT } from '@/store/types';
import { mapGetters, mapActions, mapMutations } from 'vuex';
import fileOperational from '@/services/fileOperational';
import LuckIdIcon from '@/components/memberIcon/luckIdIcon';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    Copper,
    LevelIcon,
    LuckIdIcon
  },
  data() {
    //这里存放数据
    let validateGender = (rule, value, callback) => {
      if (value === '0') {
        callback(new Error(this.$t('my_information_0016')));
      } else {
        callback();
      }
    };
    return {
      avater: '',
      dialogVisible: false,
      loading: false,
      labelWidth: '130px',
      rules: {
        nickName: [
          { required: true, message: this.$t('my_information_0017'), trigger: 'blur' }
          // { min: 1, max: 50, message: "长度在 3 到 5 个字符", trigger: "blur" }
        ],
        gender: [
          { required: true, message: this.$t('my_information_0016'), trigger: 'blur' },
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
    }),
    userImageClass() {
      if (this.userInfo.userRank > 30) {
        return 'user-high-level-border userImageClass';
      } else {
        return 'user-low-level-border userImageClass';
      }
    }
  },

  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    ...mapMutations([LOGIN_OUT]),
    init() {
      this.getUserInfo();
      console.log(this.userInfo);
    },
    findImage(image) {
      return fileOperational.getImage(image);
    },
    async uploadCropper(url, bigUrl) {
      //调接口上传裁剪的头像
      let params = {
        icon: url,
        iconBig: bigUrl
      };
      console.log('chen-账号设置-头像-uploadCropper-params=', params)
      this.loading = true;
      let res = await set_user_icon(params);
      this.loading = false;
      if (res.code == '200') {
        this.$message.success(res.msg);
        this.userInfo.headImg = fileOperational.getImage(url);
        this.avater = url;
        //  this.$refs.copperBox.close();
      } else {
        this.$message.error(res.msg);
      }
    },
    async saveUserInfo() {
      // 保存个人信息
      let params = {
        icon: this.userInfo.headImg
      };
      let res = await set_user_icon(params);
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
    uploadAvater() {
      this.imgUrl = null;
      this.$refs.upload.click();
    },
    closeDialog(val) {
      this.dialogVisible = val;
    },
    handleAvatarSuccess(data) {
      if (data.code == '200') {
        this.userInfo.headImg = data.data.path;
        this.saveUserInfo();
      }
      this.loading = false;
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
    this.avater = this.findImage(this.userInfo.headImg);
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
.nickname {
  max-width: 150px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre;
  text-align: left;
  margin-right: 5px;
}
.user-high-level-border {
  // border: 2px solid #ECC143;
  background-image: url(../../../assets/images/wjt_highbg_62.png);
  background-size: contain;
  display: block;
  padding: 8px;
}

.user-low-level-border {
  // border: 2px solid #86B6FF;
  background-image: url(../../../assets/images/wjt_lowbg_62.png);
  background-size: contain;
  display: block;
  padding: 8px;
}

.userImageClass {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  position: relative;
  margin-right: 10px;
}
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
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    .upload-text {
      color: #2f53eb;
      font-size: 14px;
      margin-top: 10px;
    }

    .head-image {
      width: 72px;
      height: 72px;
      border-radius: 50%;
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
    width: 100%;
    margin: 0 auto;
    text-align: center;
    margin-top: 50px;
    .name {
      margin: 5px 0;
    }
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
    width: 190px;
    outline: none;
    margin-top: 60px;
    cursor: pointer;
  }

  .btn-wrap {
    .flex-sub:nth-child(1) {
      margin-right: 20px;

      .submit-btn {
        background: #9297a3;
      }
    }
  }
  .userLevelClass {
    width: 32px;
    height: 16px;
    top: -15px;
    position: relative;
  }
}
</style>
