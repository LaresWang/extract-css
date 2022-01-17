import { mapGetters } from 'vuex';
export default {
  data: function() {
    return {
      isSomebodyAtYou: false
    };
  },
  watch: {
    getCurLastAtById: {
      deep: true,
      handler(v) {
        // Vue.set/delete
        this.isSomebodyAtYou = v && v?.msgId ? true : false;
      }
    }
  },
  computed: {
    ...mapGetters(['gettersCurrentAtBySessionID', 'gettersAllSessionWithAt']),
    getCurLastAtById() {
      return this.gettersCurrentAtBySessionID(this.currentSession.id);
    },
    getSoundPng() {
      let that = this;
      return function(item = {}) {
        // eslint-disable-next-line no-unused-vars
        let { vipType, userRank, fromId } = item,
          imgSrc;
        // console.log('%c～before、 png～','font-size:30px',vipType)
        if (that.getMyInfo['id'] == fromId) {
          //单聊->自己的语音
          vipType = that.getMyInfo['vipType'] || vipType;
          // userRank = that.getMyInfo['userRank'] || userRank;
        } else {
          vipType = vipType || that.userInfo?.vipType || 0;
          // userRank = userRank || that.userInfo?.userRank;
        }
        // console.log('%c～after、 png～','font-size:30px',vipType)
        // imgSrc = userRank >= 31 ?
        //   require("../../../assets/images/audio_master.png")
        //   :
        imgSrc = vipType == 1 ? require('../../../assets/images/audio_vip.png') : require('../../../assets/images/audio.png');
        return imgSrc;
      };
    },
    getSoundGif() {
      let that = this;
      return function(item = {}) {
        // eslint-disable-next-line no-unused-vars
        let { vipType, userRank, fromId } = item,
          imgSrc;
        if (that.getMyInfo['id'] == fromId) {
          //单聊->自己的语音
          vipType = that.getMyInfo['vipType'] || vipType;
          // userRank = that.getMyInfo['userRank'] || userRank;
        } else {
          vipType = vipType || that.userInfo?.vipType || 0;
          // userRank = userRank || that.userInfo?.userRank;
        }
        // imgSrc = userRank >= 31 ?
        //   require("../../../assets/images/audio_play_vip.gif")
        //   :
        imgSrc = vipType == 1 ? require('../../../assets/images/audio_play_vip.gif') : require('../../../assets/images/audio_play.gif');
        return imgSrc;
      };
    },
    getMyInfo() {
      return this.$store.state.common?.userInfo || {}; //自己的信息
    },
    getPopClassName() {
      return function(whichSide, lc, rc) {
        return whichSide == 0 ? lc : rc; //0左1自己发送的消息
      };
    },
    // 1.用户为VIP时，单聊&群聊页面，显示会员专属聊天气泡；
    // 2,用户为咖1及以上等级 （>=31级）时，单聊&群聊页面，显示大咖专属聊天气泡;
    // 3，如果用户同时为高等级（大咖）和vip 则显示大咖等级的效果；
    // 气泡涉及到的消息类型：
    // 文本 1
    // 表情
    // 语音
    // ['1', '2', '6', '10', '15', '25']
    // https://www.showdoc.com.cn/714361741714787?page_id=4049226844261722
    getPopperClassName() {
      let that = this;
      return function(msgObj, whichSide) {
        // console.log(msgObj);
        //  "vipType":"vip类型0:非会员，1：会员",
        //  "userRank":"用户等级"
        // eslint-disable-next-line no-unused-vars
        let { msgType, vipType, userRank } = msgObj;
        // 处理消息列表 chatList 消息消息无 vipType, userRank
        if (whichSide == 0) {
          // console.log(msgType, vipType, userRank, that.userInfo)
          vipType = vipType || that.userInfo['vipType'] || 0;
          // userRank = userRank || that.userInfo['userRank'];
        }
        if (whichSide == 1) {
          vipType = that.getMyInfo['vipType'] || vipType;
          // userRank = that.getMyInfo['userRank'] || userRank;
        }
        // let className = userRank >= 31 ?
        //   `${that.getPopClassName(whichSide, 'pop-master-l', "pop-master-r")}`
        //   :
        let className =
          vipType == 1
            ? `${that.getPopClassName(whichSide, 'pop-vip-l', 'pop-vip-r')}`
            : `${that.getPopClassName(whichSide, 'pop-default-l', 'pop-default-r')}`; //默认样式
        // 限制消息气泡类型，msgType = 1, 25, 是文字 语音是9
        if (![1, 25, 9].includes(msgType * 1)) {
          className = `${that.getPopClassName(whichSide, 'pop-default-l', 'pop-default-r')}`; //默认样式
        }
        // 名片，文件
        if ([6, 15].includes(msgType * 1)) {
          className = `${that.getPopClassName(whichSide,'pop-default-l','pop-default-r-d')}`; 
        }
        // 图片
        if ([2].includes(msgType * 1)) {
          className = `${that.getPopClassName(whichSide,'pop-default-l-m','pop-default-r-m')}`;
        }
        // 视频去掉留白 增加 class pop-video
        return [10].includes(msgType * 1) ? `imgBubble ${className}` : className;
      };
    },
    currentSession() {
      return this.$store.state.chat.currentChat || {};
    }
  },
  methods: {
    _at_handleCloseAtTips() {
      this.isSomebodyAtYou = false;
      this.clearCurrentSessionAt();
    },
    async _at_handleScrollToCurrentAt() {
      let message = this.getCurLastAtById;
      this.isShowMoreList = false
      this.newMsgLength = 0
      // console.log('~~~~当前最新at~~~~~', message?.msgId)
      await this.$nextTick();
      let ele = document.getElementById(message?.msgId);
      // console.log(ele)
      this.clearCurrentSessionAt();
      if (ele) {
        ele.scrollIntoView();
      } else {
        // console.log('%c查找更多',"font-size:30px;")
        this.$refs.talkGroup.scrollTop = 0;
      }
    },
    clearCurrentSessionAt() {
      this.$store.dispatch('actionSessionAtDeleteBySessionId', this.currentSession.id);
      this.$store.dispatch('UPDATE_ISAT_SESSION', { id: this.currentSession.id });
    }
  },
  beforeDestroy() {
    const dropwrapper = document.getElementById('messageBox');
    if(dropwrapper){
      dropwrapper.removeEventListener('drop', this.dropwrapperListenerDrop);
      dropwrapper.removeEventListener('dragenter', this.dropwrapperListenerDragenter);
      dropwrapper.removeEventListener('dragover', this.dragoverListenerDragenter);
      dropwrapper.removeEventListener('dragleave', this.dragleaveListenerDragenter);
    }
  }
};
