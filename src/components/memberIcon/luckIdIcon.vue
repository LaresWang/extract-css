<template>
  <div :class="iconType ? iconType + ' level-icon' : 'level-icon'" v-if="inviteCode !== '' && (inviteCodeType || !listFlag)">
    <div class="levelbox goldenBg" v-if="inviteCodeType && inviteCode">
      <img class="highlight" src="../../assets/images/highlight.png" alt />
      <span class="invitecode">ID:{{ inviteCode }}</span>
    </div>
    <div v-if="!inviteCodeType && !listFlag && inviteCode" class="levelbox">
      <span>ID:{{ inviteCode }}</span>
    </div>
  </div>
</template>

<script>
import fileOperational from '@/services/fileOperational';
export default {
  name: 'MemberIcon',
  data() {
    return {
      imageSrc: '',
      levelStart: '',
      levelEnd: ''
    };
  },
  props: {
    listFlag: {
      type: Boolean,
      default() {
        return false;
      }
    },
    inviteCode: {
      //邀请码
      type: String,
      default() {
        return '';
      }
    },
    inviteCodeType: {
      //邀请码类型[0-原始邀请码，1-靓号]")
      type: Number,
      default() {
        return 1;
      }
    },
    vipType: {
      //vip类型：0:非会员，1：会员
      type: Number,
      default() {
        return 1;
      }
    },
    iconType: {
      type: String,
      default() {
        return 'small';
      }
    },
    userRank: {
      type: Number,
      default() {
        return 0;
      }
    }
  },
  watch: {
    // userRank(val) {
    //   debugger
    //   if(val>30){
    //     this.levelStart = val.slice(0,1)
    //     this.levelEnd =  val.substr(0, val.length - 1)
    //   }
    // }
  },
  computed: {
    getStart() {
      if (this.userRank > 30) {
        return (this.userRank + '').substr(0, 1);
      }
      return '';
    },
    getEnd() {
      if (this.userRank > 30) {
        return (this.userRank + '').substr(1, 1);
      }
      return '';
    }
  },
  methods: {
    findImage(image) {
      this.imageSrc = image;
      return fileOperational.getImage(this.imageSrc);
    }
  }
};
</script>

<style lang="less" scoped>
.level-icon {
  display: flex;
  align-items: center;
}
@keyframes movesmall {
  0% {
    left: 0px;
    opacity: 1;
  }
  80% {
    opacity: 0;
  }
  100% {
    opacity: 0;
    left: 49px;
  }
}
@keyframes movemedium {
  0% {
    left: 0px;
    opacity: 1;
  }
  80% {
    opacity: 0;
  }
  100% {
    opacity: 0;
    left: 50px;
  }
}
@keyframes movelarge {
  0% {
    left: 0px;
    opacity: 1;
  }
  80% {
    opacity: 0;
  }
  100% {
    opacity: 0;
    left: 70px;
  }
}

.highlight {
  position: absolute;
  top: 0;
  left: -1px;
}

.levelbox {
  // display: flex;
  // align-items: center;
  padding: 0 5px 0 4px;
  color: #999;
  position: relative;

  &.goldenBg {
    background: linear-gradient(to right, #f6d995, #dfa35d);
    color: #333;
    border-radius: 2px;
    img,
    span {
      display: inline-block;
      vertical-align: middle;
    }
  }
}

.levelRight {
  display: inline-block;
}

.levelRight2 {
  display: inline-block;
  color: #fff;
}

.levelpos {
  position: absolute;
}

.crown {
  padding-right: 2px;
}

.large {
  height: 18px;
  font-size: 12px;
  line-height: 18px;
  .levelbox {
    overflow: hidden;
    &.goldenBg {
      padding: 0 4px;
    }
  }
  .highlight {
    height: 19px;
    width: 21px;
    animation: movelarge 2s infinite;
  }

  .invitecode {
    color: #543e24;
    font-size: 10px;
  }

  .crown {
    width: 12px;
    height: 12px;
  }

  .levelIcon {
    width: 14px;
    height: 14px;
    padding: 0 3px;
    display: inline-block;
  }

  .levelRight {
    width: 39px;
    height: 15px;
  }

  .levelRight2 {
    width: 25px;
    height: 24px;
    text-align: center;
    line-height: 24px;
    font-size: 11px;
    //  transform:scale(0.8)
  }

  .levelAll {
    width: 4px;
    height: 5px;
  }

  .levelpos {
    top: -5px;
    left: 14px;
  }
}

.medium {
  height: 14px;
  font-size: 10px;
  line-height: 14px;
  .levelbox{
    height: 14px;
  }
  .highlight {
    height: 14px;
    width: 18px;
    animation: movemedium 2s infinite;
  }

  .invitecode {
    color: #543e24;
    font-size: 8px;
  }

  .crown {
    width: 10px;
    height: 10px;
    margin: 0;
  }

  .levelIcon {
    width: 11px;
    height: 11px;
    padding: 0 2px;
    display: inline-block;
  }

  .levelRight {
    width: 30px;
    height: 12px;
  }

  .levelRight2 {
    width: 19px;
    height: 19px;
    text-align: center;
    line-height: 18px;
    font-size: 9px;
  }

  .levelAll {
    width: 4px;
    height: 5px;
  }

  .levelpos {
    top: -3px;
    left: 11px;
  }
}

.small {
  height: 10px;
  line-height: 10px;
  font-size: 10px;
  .highlight {
    height: 10px;
    width: 18px;
    animation: movesmall 2s infinite;
  }

  .invitecode {
    color: #543e24;
    font-size: 6px;
  }

  .crown {
    width: 8px;
    height: 8px;
    margin: 0;
  }

  .levelIcon {
    width: 10px;
    height: 10px;
    padding: 0 2px;
  }

  .levelRight {
    width: 28px;
    height: 10px;
  }

  .levelRight2 {
    width: 16px;
    height: 16px;
    text-align: center;
    line-height: 16px;
    font-size: 8px;
  }

  .levelAll {
    width: 3px;
    height: 4px;
  }

  .levelpos {
    top: -2px;
    left: 10px;
  }
}
</style>
