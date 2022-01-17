<!-- 添加申诉 -->
<template>
  <el-dialog
    :title="$t('appeal_0045')"
    append-to-body
    :modal-append-to-body="false"
    :modal="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="closeDia"
    :visible="ImpeachVisible"
    width="570px"
    class="impeach-dialog"
    center
  >
    <div v-if="this.impeachFromtype === 'single'" class="personal-info">
      <MemberIcon
          class="personal-info-avatar"
          :image="userInfo.userHeadImg"
          iconType="medium"
          :userRank="userInfo.userRank"
          :vipType="userInfo.vipType"
      />
      <div class="flex flex-direction personal-info-detail">
        <div class="flex personal-info-name">
          <div class="name-wrap" :title="userInfo.nickName">
            <span>{{ userInfo.nickName }}</span>
          </div>
          <LevelIcon
            :inviteCode="userInfo.inviteCode"
            :userRank="userInfo.userRank"
            iconType="medium"
            :vipType="userInfo.vipType"
            :inviteCodeType="userInfo.inviteCodeType"
          />
        </div>
        <div>
          <LuckIdIcon
            :inviteCode="userInfo.inviteCode"
            :userRank="userInfo.userRank"
            iconType="medium"
            :vipType="userInfo.vipType"
            :inviteCodeType="userInfo.inviteCodeType"
            :listFlag="false"
          />
        </div>
      </div>
    </div>
    <div v-else class="group-info" >
      <!-- eslint-disable-next-line -->
      <img v-if="groupInfo.groupType === 1" :src="groupInfo.groupAvatar" class="group-avatar" alt="" @error="replaceImg" />
      <!-- eslint-disable-next-line -->
      <DiscussionIcon v-if="groupInfo.groupType === 0" :name="groupInfo.groupName" class="group-avatar" iconType="large" />
      <div class="group-detail">
        <span class="group-name" :title="groupInfo.groupName">{{
          groupInfo.groupName
        }}</span>
        <span class="group-code">ID: {{ groupInfo.groupCode }}</span>
      </div>
    </div>
    <div class="tip-details">
      <el-form
        class="tipoffs-con"
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
      >
        <div class="col">
          <div class="text"><span>*</span> {{ $t('appeal_0038') }}</div>
          <el-form-item prop="content">
            <el-input
              type="textarea"
              v-model.trim="ruleForm.content"
              :placeholder="$t('appeal_0040')"
              :autosize="{ minRows: 6, maxRows: 20 }"
              maxlength="200"
              :rules="[
                { required: true, message: $t('appeal_0041') },
                {
                  min: 5,
                  max: 200,
                  message: $t('appeal_0041'),
                  trigger: 'blur',
                },
              ]"
              show-word-limit
            ></el-input>
          </el-form-item>
          <UpoadImg
            class="image"
            ref="UpoadImg"
            :limit="limit"
            :multiple="multiple"
            :imgList="imgList"
          />
        </div>
      </el-form>
      <div class="btn flex justify-around">
        <el-button
          type="primary"
          @click="onSubmit('ruleForm')"
          v-loading.fullscreen.lock="fullscreenLoading"
        >
          {{ this.$t('Universal_0049') }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
// import store from '@/store';
// import { addImpeachApeal } from "./server";
import { getSelfUserId } from '@/utils/const';
import fileOperational from "@/services/fileOperational";
import { addImpeachApeal } from "./server";
import { mapState } from "vuex";
import UserInfoUtils from "@/utils/UserInfoUtils";
import UpoadImg from "../tipoffs/UpoadImg";
// import FileUpload from "@/utils/fileUpload";
import DiscussionIcon from "@/components/memberIcon/DiscussionIcon";
import MemberIcon from "@/components/memberIcon/MemberIcon";
import LevelIcon from "@/components/memberIcon/LevelIcon";
import LuckIdIcon from "@/components/memberIcon/luckIdIcon";
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    UpoadImg,
    DiscussionIcon,
    MemberIcon,
    LevelIcon,
    LuckIdIcon,
  },
  props: {
    ImpeachVisible: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    authStatus: {
      type: String,
      default: () => {
        return '';
      },
    },
    groupId: {
      type: String,
      default: () => {
        return '';
      },
    },
    impeachFromtype: {
      type: String,
      default: () => {
        return '';
      },
    },
    groupInfo: {
      type: Object,
      default: () => {
        return {};
      },
    },
    appealInfo: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    //这里存放数据
    return {
      menuList: [],
      rules: {
        content: [
          {
            required: true,
            message: this.$t('appeal_0041'),
            trigger: "blur",
          },
          {
            min: 5,
            max: 200,
            message: this.$t('appeal_0041'),
            trigger: "blur",
          },
        ],
      },
      ruleForm: {
        content: ""
      },
      limit: 5,
      multiple: true,
      imgList: [],
      fullscreenLoading: false,
    };
  },
  //监听属性 类似于data概念
  computed: {
    ...mapState({
      personalAppealInfo: (state) => {
        return state.common.personalAppealInfo;
      },
      userInfo: (state) => {
        return state.common.userInfo;
      },
    }),
  },

  //监控data中的数据变化
  watch: {
    
  },
  //方法集合
  methods: {
    init() {
      
    },
    onSubmit(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.fullscreenLoading = true;
          this.ruleForm.files = [...this.$refs.UpoadImg.imgList];
          const imgUrls = await this.uploadImageToSdk(this.ruleForm.files)
          this.totipoffs(imgUrls);
        } else {
          return false;
        }
      });
    },
    async uploadImageToSdk(pararm){
      let imgUrls = []
      for(let imgData of pararm){
        // eslint-disable-next-line
        const filePath = await fileOperational.saveImageToFile( imgData.file.src, UserInfoUtils.getCurrentUserId() + '.png');
        const { FileUpload } = require('@/utils/fileUpload');
        const fileUpload = new FileUpload(filePath, UserInfoUtils.getCurrentUserId(),-1); 
        const upload = await fileUpload.headImageUpload();//通过sdk上传
        imgUrls.push(upload[0].url)
      }
      return imgUrls;
    },
    async totipoffs(imgUrls) {
      const params = {
        content:this.ruleForm.content,
        appealType:this.impeachFromtype === 'single'?this.personalAppealInfo.limitType:this.appealInfo.limitType,
        othersId:this.impeachFromtype === 'single'?this.userInfo.id:this.groupInfo.groupId,
        imgArray:imgUrls,
        userId:UserInfoUtils.getCurrentUserId()
      }
      let res = await addImpeachApeal({}, params);
      if (res.code == 200) {
        this.fullscreenLoading = false;
        this.$message.success(this.$t('report_0012'));
        this.closeDia();
      } else {
        this.fullscreenLoading = false;
        this.$message.error(res.msg);
        // console.log(res.msg);
      }
    },
    cancelDialogHand() {
      this.$emit("cancelDialogHand", false);
    },
    confirmDialogHand() {
      
    },
    currentUserId() {
      return getSelfUserId();
    },
    closeDia() {
      this.imgList = [];
      this.$refs.ruleForm.resetFields();
      this.$emit("cancelDialogHand", false);
    },
    replaceImg(e) {
      UserInfoUtils.replaceDefaultImg(e, 'group')
    },
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
  activated() {}, //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang="less" scoped>
.impeach-dialog {
  overflow-y: scroll;
  .personal-info {
    display: flex;
    align-items: center;
    height: 66px;
    .personal-info-avatar {
      margin-right: 6px;
    }
    .personal-info-detail {
      margin-left: 6px;
      .personal-info-name {
        align-items: center;
        font-size: 14px;
        color: #333333;
        font-weight: bold;
        max-width: 190px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-bottom: 10px;
      }
    }
  }
  .group-info {
    display: flex;
    align-items: center;
    height: 66px;
    margin-left: 14px;
    .group-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin-right: 6px;
    }
    .group-detail{
      display: flex;
      flex-direction: column;
      .group-name {
        font-size: 14px;
        color: #333333;
        font-weight: bold;
        max-width: 190px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-bottom: 5px;
      }
      .group-code {
        font-size: 12px;
        color: #999999;
      }
    }
  }
  .tip-details {
    overflow: scroll;
    // height: calc(100vh - 100px);
  }
  .tipoffs-con {
    width: 100%;
    background: #fff;
    padding: 10px 0;
    box-sizing: border-box;
    .col {
      font-size: 14px;
      .text {
        height: 17px;
        line-height: 17px;
        margin-bottom: 5px;
        span {
          // content: "*";
          color: #f56c6c;
          margin-right: 4px;
        }
      }
      .image {
        margin-top: 20px;
      }
    }
    .colone {
      border-bottom: 1px solid #dddddd;
      min-height: 60px;
    }
  }
  .btn {
    height: 28px;
    margin-top: 20px;
  }
}


</style>
<style lang="less">
.impeach-dialog {
  /deep/.el-button--primary {
    width: 202px;
    padding: 5px 49px;
    span {
      font-size: 13px ;
      height: 18px;
      line-height: 18px;
    }
  }
}
</style>