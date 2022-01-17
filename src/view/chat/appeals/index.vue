<!-- 添加申诉 -->
<template>
  <el-dialog
    :title="$t('appeal_0042')"
    append-to-body
    :modal-append-to-body="false"
    :modal="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="closeDia"
    :visible="AppealsVisible"
    width="505px"
    class="appeals-dialog"
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
    <div class="impeach-info">
      <!-- eslint-disable-next-line -->
      <div v-if="this.impeachFromtype === 'single'" class="impeach-info-detail">{{ $t('appeal_0020') }}{{ $t('appeal_0028') }}</div>
      <div v-else class="impeach-info-detail">
        <!-- eslint-disable-next-line -->
        {{ $t('appeal_0020') }} {{`${groupInfo.groupType === 0? $t('chat_search_0007'):$t('chat_search_0005')}${appealInfo.limitType === 5?$t('appeal_0043'):$t('appeal_0044')}`}}</div>
      <div class="impeach-info-detail">{{ $t('appeal_0030') }} {{ $t('appeal_0031') }}</div>
      <!-- eslint-disable-next-line -->
      <div v-if="this.impeachFromtype === 'single'" class="impeach-info-detail">{{ $t('appeal_0029') }} {{`${this.personalAppealInfo.createTime} -- ${this.personalAppealInfo.endTime}`}}</div>
      <div v-else class="impeach-info-detail">{{ $t('appeal_0029') }} {{`${appealInfo.createTime} -- ${appealInfo.endTime}`}}</div>
      <div class="advice-info">{{ $t('appeal_0033') }}
        <span class="advice-info-detail" @click="PrivacyAgreement()">
          {{ $t('appeal_0034') }}
        </span>
        {{ $t('appeal_0035') }}
      </div>
    </div>
    <div class="btn flex justify-center">
      <el-button
        type="primary"
        @click="toImpeach()"
      >
        {{ $t('appeal_0036') }}
      </el-button>
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
import { mapState } from "vuex";
import UserInfoUtils from "@/utils/UserInfoUtils";
import { remote } from "electron";
import DiscussionIcon from "@/components/memberIcon/DiscussionIcon";
import MemberIcon from "@/components/memberIcon/MemberIcon";
import LevelIcon from "@/components/memberIcon/LevelIcon";
import LuckIdIcon from "@/components/memberIcon/luckIdIcon";
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    DiscussionIcon,
    MemberIcon,
    LevelIcon,
    LuckIdIcon,
  },
  props: {
    AppealsVisible: {
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
      // this.getUserInfo();
      console.log(this.userInfo,'userInfo');
      console.log(this.groupInfo,'groupinfo');
    },
    PrivacyAgreement() {
      console.log(remote.BrowserWindow, "BrowserWindow");
      let win = new remote.BrowserWindow({
        icon: `${__static}/logo.png`, // eslint-disable-line
      });
      // en-us zh-cn
      win.loadURL(`https://m.didimessage.com/#/staticpage/userpact?colorMode=day&language=${this.$i18n.locale}`);
    },
    findImage(image) {
      return fileOperational.getImage(image);
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
      this.$emit("cancelDialogHand", false);
    },
    replaceImg(e) {
      UserInfoUtils.replaceDefaultImg(e, 'group')
    },
    toImpeach(){
      this.$emit("toImpeach");
    }
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
.appeals-dialog {
  .personal-info {
    display: flex;
    align-items: center;
    height: 66px;
    margin-left: 14px;
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
  .impeach-info {
    width: 370px;
    margin: 10px auto;
    .impeach-info-detail {
      height: 37px;
      opacity: 1;
      font-size: 12px;
      font-weight: 800;
      text-align: left;
      color: #333333;
      line-height: 37px;
      border-bottom: 1px solid rgba(0,0,0,0.10);
    }
    .advice-info {
      height: 14px;
      font-size: 10px;
      text-align: left;
      color: #333333;
      line-height: 14px;
      margin-top: 10px;
      .advice-info-detail {
        color: blue;
        cursor: pointer;
      }
    }
  }
  .btn {
    height: 28px;
    margin-top: 72px;
  }
}


</style>
<style lang="less">
.appeals-dialog {
  /deep/.el-button--primary {
    padding: 5px 49px;
    span {
      font-size: 13px ;
      height: 18px;
      line-height: 18px;
    }
  }
}
</style>