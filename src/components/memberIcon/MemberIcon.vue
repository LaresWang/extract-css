<template>
  <div :class="iconType ? iconType + ' member-icon' : 'member-icon'">
    <img class="auth-status" v-if="authStatusImage" :src="authStatusImage" alt /><!--群主和管理员-->
    <img :class="userImageClass" :src="findImage(image)" alt @error="replaceImg" /><!--黄蓝边-->
    <!--eslint max-len: ["error", { "code": 140 }]-->
    <img v-if="vipType" :class="[userLevelClass, userRank < 31 ? 'lowerVipIcon' : '']" src="../../assets/images/vipCrown.png" alt />
  </div>
</template>

<script>
import fileOperational from '@/services/fileOperational';
import UserInfoUtils from '@/utils/UserInfoUtils';
export default {
  name: 'MemberIcon',
  data() {
    return {
      imageSrc: ''
    };
  },
  props: {
    vipType: {
      //vip类型：0:非会员，1：会员
      type: Number,
      default() {
        return 0;
      }
    },
    image: {
      type: String,
      default() {
        return '';
      }
    },
    authStatus: {
      type: String,
      default() {
        return '';
      }
    },
    showMenu: {
      type: Boolean,
      default() {
        return false;
      }
    },
    iconType: {
      type: String,
      default() {
        return 'mini';
      }
    },
    userRank: {
      type: Number,
      default() {
        return 1;
      }
    }
  },
  computed: {
    authStatusImage() {
      if (this.authStatus == '1') {
        return require('../../assets/images/group_auth_leader.png');
      } else if (this.authStatus == '2') {
        return require('../../assets/images/group_auth_admin.png');
      }
      return '';
    },
    userImageClass() {
      if (this.userRank > 30 && (this.iconType == 'mini' || this.iconType == 'small')) {
        return 'user-image user-high-level-border';
      } else if (this.userRank > 30 && (this.iconType == 'medium' || this.iconType == 'large')) {
        return 'user-image user-high-level-2border';
      } else if (this.userRank < 31 && (this.iconType == 'mini' || this.iconType == 'small')) {
        return 'user-image user-low-level-border';
      } else if (this.userRank < 31 && (this.iconType == 'medium' || this.iconType == 'large')) {
        return 'user-image user-low-level-2border';
      }
      return 'user-image';
    },
    userLevelClass() {
      if (this.iconType == 'mini') {
        return 'miniVip';
      } else if (this.iconType == 'medium') {
        return 'mediumVip';
      } else if (this.iconType == 'small') {
        return 'smallVip';
      } else {
        return 'largeVip';
      }
    }
  },
  methods: {
    findImage(image) {
      this.imageSrc = image;
      return fileOperational.getImage(this.imageSrc);
    },
    // 替换404图片
    replaceImg(e) {
      UserInfoUtils.replaceDefaultImg(e, 'user');
    }
  }
};
</script>

<style lang="less" scoped>
.member-icon {
  position: relative;
}
.auth-status {
  position: absolute;
  left: 18px;top: -11px;
  width: 35px;height: 35px;
}
.mini {
  width: 32px;
  // height: 32px;
  .user-image {
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }
  .user-level-low {
    position: absolute;
    width: 13px;
    height: 13px;
    top: 18px;
    left: -3px;
  }
  .user-level-high {
    position: absolute;
    width: 14px;
    height: 14px;
    top: 18px;
    left: -3px;
  }
}

.small {
  width: 38px;
  height: 38px;
  .user-image {
    width: 32px;
    height: 32px;
    border-radius: 50%;
  }
  .user-level-low {
    position: absolute;
    width: 16px;
    height: 16px;
    top: 20px;
    left: -5px;
  }
  .user-level-high {
    position: absolute;
    width: 18px;
    height: 18px;
    top: 20px;
    left: -4px;
  }
}
.medium {
  width: 48px;
  height: 48px;
  .user-image {
    width: 44px;
    height: 44px;
    border-radius: 50%;
  }
  .user-level-low {
    position: absolute;
    width: 20px;
    height: 20px;
    top: 27px;
    left: -4px;
  }
  .user-level-high {
    position: absolute;
    width: 20px;
    height: 20px;
    top: 27px;
    left: -4px;
  }
  .user-high-level-2border {
    background-image: url(../../assets/images/wjt_highbg_93.png);
    background-size: contain;
    display: block;
    padding: 7px !important;
  }
  .user-low-level-2border {
    background-image: url(../../assets/images/wjt_lowbg_93.png);
    background-size: contain;
    display: block;
    padding: 7px !important;
  }
}
.large {
  /*width: 72px;
    height: 72px;*/
  .user-image {
    width: 44px;
    height: 44px;
    border-radius: 50%;
  }
  .user-level-low {
    position: absolute;
    width: 30px;
    height: 30px;
    top: 42px;
    left: -6px;
  }
  .user-level-high {
    position: absolute;
    width: 30px;
    height: 30px;
    top: 41px;
    left: -7px;
  }
  .user-high-level-2border {
    background-image: url(../../assets/images/wjt_highbg_93.png);
    background-size: contain;
    display: block;
    padding: 8px !important;
  }
  .user-low-level-2border {
    background-image: url(../../assets/images/wjt_lowbg_93.png);
    background-size: contain;
    display: block;
    padding: 10px !important;
  }
}
.user-high-level-border {
  // border: 2px solid #ECC143;
  background-image: url(../../assets/images/wjt_highbg_93.png);
  background-size: contain;
  display: block;
  padding: 6px;
}
.user-low-level-border {
  // border: 2px solid #86B6FF;
  background-image: url(../../assets/images/wjt_lowbg_93.png);
  background-size: contain;
  display: block;
  padding: 6px;
}
.user-high-level-2border {
  background-image: url(../../assets/images/wjt_highbg_93.png);
  background-size: contain;
  display: block;
  padding: 6px;
}
.user-low-level-2border {
  background-image: url(../../assets/images/wjt_lowbg_93.png);
  background-size: contain;
  display: block;
  padding: 6px;
}
.largeVip {
  height: auto !important;
  position: absolute;
  bottom: 3px;
  left: 50%;
  width: 31px;
  margin-left: -15px;
}
.mediumVip {
  width: 63%;
  height: auto;
  position: absolute;
  bottom: -13%;
  left: 28%;
}
.smallVip {
  /*width: 65% !important;
    height: auto !important;*/
  position: absolute;
  /*bottom: -8%;*/
  left: 25%;
  width: 22px !important;
  height: 11px !important;
  bottom: -4px;
  &.lowerVipIcon {
    bottom: -3px;
  }
}
.miniVip {
  width: 80%;
  height: auto;
  position: absolute;
  bottom: 1px;
  left: 26%;
  &.lowerVipIcon {
    bottom: 2px;
  }
}
</style>
