<template>
  <div class="noDrag member-card-main-class">
    <img
      :src="findImage(this.image)"
      alt
      v-if="
        (memberSingleChatStatus === '0' && authStatus === '3' && userId !== currentUserId()) ||
          userId == '1032384035881537536' ||
          userId == '1008455862495526912'
      "
      @error="replaceImg"
    />
    <el-popover
      ref="member-card"
      :width="dialogWidth"
      @show="onCardShow"
      @hide="onCardHide"
      trigger="click"
      placement="right-end"
      visible-arrow="false"
      popper-class="popper-member-card"
      v-else
    >
      <member-info
        :user-id="userId"
        :groupId="groupId"
        :memberSingleChatStatus="memberSingleChatStatus"
        :authStatus="authStatus"
        ref="memberinfo"
      />
      <img slot="reference" v-popover:member-card :src="findImage(this.image)" :class="userImageClass" alt @error="replaceImg" />
    </el-popover>
    <img v-if="vipType" class="userLevelClass" src="../../assets/images/vipCrown.png" alt :class="userRank < 31 ? 'lower' : 'higher'" />
  </div>
</template>

<script>
import fileOperational from '@/services/fileOperational';
import { getSelfUserId } from '@/utils/const';
import MemberInfo from './MemberInfo';
import { GET_USER_INFO } from '../../store/types';
import store from '@/store';
import UserInfoUtils from '@/utils/UserInfoUtils';
export default {
  name: 'MemberCard',
  components: {
    MemberInfo
  },
  computed: {
    userImageClass() {
      if (this.userRank > 30) {
        return 'user-high-level-border';
      } else {
        return 'user-low-level-border';
      }
    },
    dialogWidth() {
      if (this.$i18n.locale.includes('zh')) {
        return 310;
      } else {
        return 340;
      }
    },
  },
  data() {
    return {
      region: '',
      userInfo: {},
      groupInfo: {},
      isCurrentUser: false,
      isEdit: false,
      isGroupMember: false,
      isGroupHolder: false,
      title: this.$t('Universal_0202'),
      GroupInviteVisible: false,
      postcard: true,
      userRank: store.state.common.userInfo.userRank,
      vipType: store.state.common.userInfo.vipType
    };
  },
  props: {
    image: {
      type: String,
      default() {
        return '';
      }
    },
    userId: {
      type: String,
      default() {
        return '';
      }
    },
    groupId: {
      type: String,
      default() {
        return '';
      }
    },
    memberSingleChatStatus: {
      type: String,
      default() {
        return '1';
      }
    },
    authStatus: {
      type: String,
      default() {
        return '1';
      }
    }
  },
  methods: {
    findImage(image) {
      return fileOperational.getImage(image, true);
    },
    currentUserId() {
      return getSelfUserId();
    },
    async onCardShow() {
      this.$nextTick(() => {
        this.$refs.memberinfo.onCardShow();
      });
    },
    onCardHide() {
      this.$refs.memberinfo.onMemberInfoHide();
      this.$emit('handleclosecard');
      if (this.userId == this.currentUserId()) {
        store.dispatch(GET_USER_INFO);
      }
    },
    closeHandle() {},
    // 替换404图片
    replaceImg(e) {
      UserInfoUtils.replaceDefaultImg(e, 'user');
    }
  },

  created() {},
  updated() {}
};
</script>
<style>
.popper-member-card {
  top: 61px !important;
}
.popper-member-card .popper__arrow {
  display: none;
}
</style>
<style scoped lang="less">
.member-card-main-class {
  position: relative;
}
.user-high-level-border {
  /* border: 2px solid #ECC143; */
  background-image: url(../../assets/images/wjt_highbg_62.png);
  background-size: contain;
  display: block;
  padding: 8px;
}
.user-low-level-border {
  /* border: 2px solid #86B6FF; */
  background-image: url(../../assets/images/wjt_lowbg_62.png);
  background-size: contain;
  display: block;
  padding: 6px;
}
.userLevelClass {
  position: absolute;
  top: -11px;
  height: 14px;
  width: 28px;
  left: 50%;
  margin-left: -16px;
  &.lower {
    top: -16px;
  }
  &.higher {
    margin-left: -14px;
  }
}
</style>
