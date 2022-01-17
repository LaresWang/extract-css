<template>
  <div :class="iconType ? iconType + ' level-icon' : 'level-icon'" v-if="inviteCode !== ''">
    <div :class="userRank > 30?'levelRight superBG':'levelRight2 starBG'" >
      <img src="../../assets/images/diamond.png" />
      <span>{{ userRank }}</span>
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
  color: red;
  display: flex;
  align-items: center;
  // margin-left: 5px;
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
  display: flex;
  align-items: center;
  padding: 0 5px 0 4px;
  color: #999;
  position: relative;
  img,
  span {
    display: inline-block;
    vertical-align: middle;
  }

  &.goldenBg {
    background: linear-gradient(to right, #f6d995, #dfa35d);
    color: #333;
    border-radius: 2px;
  }
}

.levelRight {
  // display: inline-block;
  display: flex;
  align-items: center;
  color: #fff;
  padding-right: 5px;
  span {
    font-weight: normal;
  }
}

.levelRight2 {
  display: flex;
  align-items: center;
  color: #fff;
  padding-right: 5px;
  span {
    font-weight: normal;
  }
}

.levelpos {
  position: absolute;
}

.superBG {
  position: relative;
  background: linear-gradient(to right, #fdc008, #ff9800);
  border-radius: 2px;
}

.starBG {
  position: relative;
  background: linear-gradient(to right, #2faef8, #0071b3);
  border-radius: 2px;
}

.crown {
  padding-right: 2px;
}

.large {
  height: 18px;
  font-size: 12px;
  line-height: 18px;
  .levelbox {
    padding: 0 4px;
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
    // width: 39px;
    height: 18px;
    line-height: 18px;
    margin-left: 5px;
    img {
      height: 16px;
      // padding-top: 1px;
    }
    span {
      font-size: 10px;
      font-style: italic;
    }
  }

  .levelRight2 {
    height: 18px;
    text-align: center;
    line-height: 18px;
    font-size: 11px;
    margin-left: 5px;
    //  transform:scale(0.8)
    img {
      height: 16px;
      // padding-top: 1px;
      // height: auto !important;
    }
    span {
      font-size: 10px;
      font-style: italic;
    }
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

  .highlight {
    height: 13px;
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
    height: 14px;
    line-height: 14px;
    img {
      height: 12px;
      // padding-top: 1px;
      // height: auto !important;
    }
    span {
      font-size: 10px;
      font-style: italic;
    }
  }

  .levelRight2 {
    height: 14px;
    text-align: center;
    line-height: 14px;
    font-size: 9px;
    img {
      height: 12px;
      // padding-top: 1px;
      // height: auto !important;
    }
    span {
      font-size: 10px;
      font-style: italic;
    }
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
    height: 13px;
    line-height: 13px;
    img {
      width: 16px;
      padding-top: 2px;
    }
    span {
      font-size: 10px;
      font-style: italic;
    }
  }

  .levelRight2 {
    height: 12px;
    text-align: center;
    line-height: 12px;
    font-size: 8px;
    img {
      width: 13px;
      padding-top: 1px;
    }
    span {
      font-size: 10px;
      font-style: italic;
    }
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
