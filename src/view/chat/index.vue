<!--  -->
<template>
  <div class="chat common-height">
    <div class="chatList">
      <Search/>
      <chatList />
    </div>
    <div class="chatMessage flex-sub">
      <div class="netmask red" v-if="isNetOff"
           :style="{'line-height': lineHeight, 'padding': padding}"
      ><i class="el-icon-warning-outline"></i>{{ $t('Universal_0156') }}</div>
      <div class="netmask yellow" v-else-if="isReconn"><i class="el-icon-loading"></i>{{ $t('Universal_0163') }}</div>
      <ChatBg v-if="'/app/chat' == $route.path" />
      <router-view v-if="'/app/chat' != $route.path && isRouterAlive" />
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import Search from '@/components/search';
import chatList from './list';
import { mapState, mapMutations } from 'vuex';
import ChatBg from '@/components/ChatBg';
import { LOGIN_OUT, SYNC_DATA_PROGRESS } from '@/store/types';
import { shell } from 'electron';
import bus from '@/utils/eventbus';
import i18n from '../../i18n'
const saveTimeArr372 = () => {
  return [
    { value: "1", label: i18n.t("Universal_0004", { value: 1 }) },
    { value: "3", label: i18n.t("Universal_0004", { value: 3 }) },
    { value: "12", label: i18n.t("Universal_0004", { value: 12 }) },
    { value: "24", label: i18n.t("Universal_0004", { value: 24 }) },
    { value: "72", label: i18n.t("Universal_0008", { value: 3 }) },
    { value: "120", label: i18n.t("Universal_0008", { value: 5 }) },
    { value: "168", label: i18n.t("Universal_0008", { value: 7 }) },
  ];
};
export default {
  name: 'Chat',
  //import引入的组件需要注入到对象中才能使用
  components: {
    Search,
    chatList,
    ChatBg
  },
  provide: {
    saveTimeArr372
  },
  data() {
    //这里存放数据
    return {
      isMaxed: false,
      isReconn: false,
      isNetOff: false,
      isRouterAlive: true
    };
  },
  //监听属性 类似于data概念
  computed: {
    ...mapState({
      getNetStatus() {
        return this.$store.state.common.netStatus;
      },
      getSocketStatus() {
        return this.$store.state.common.socketStatus;
      }
    }),
    lineHeight() {
      if (this.$i18n.locale.includes('zh')) {
        return '32px';
      } else {
        return '24px';
      }
    },
    padding() {
      if (this.$i18n.locale.includes('zh')) {
        return '0';
      } else {
        return '10px 0';
      }
    }
  },
  //监控data中的数据变化
  watch: {
    getNetStatus(val) {
      this.isNetOff = val == 'offline' ? true : false;
    },
    getSocketStatus(val) {
      console.log('socket 状态', val);
      // this.isReconn = !this.isNetOff && val == "reconn" ? true : false;
      this.isReconn = val == 'online' ? false : true;
    },
  },
  //方法集合
  methods: {
    reload() {
      this.isRouterAlive =  false;
      this.$nextTick(() => {
        this.isRouterAlive = true;
      });
    },
    ...mapMutations([LOGIN_OUT]),
    _maximize(){
      this.isMaxed = true;
      console.log('maximize', this.isMaxed);
    },
    _unmaximize(){
      this.isMaxed = false;
      console.log('unmaximize', this.isMaxed);
    },
    //chat路由 主要用于聊天消息识别链接跳转
    _handleElement_A(e){
      // data- *  
      if (e.target.tagName.toLowerCase() === 'a' && e.target.href) {
        e.preventDefault();
        shell.openExternal(e.target.href);
      }
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    bus.$on('refresh', this.reload);
    this.$remote.getCurrentWindow().addListener('maximize',this._maximize);
    this.$remote.getCurrentWindow().addListener('unmaximize',this._unmaximize)

    this.$store.commit(SYNC_DATA_PROGRESS, 0);
    this.isNetOff = this.getNetStatus == 'offline' ? true : false;
    this.isReconn = this.getSocketStatus == 'online' ? false : true;
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    document.addEventListener('click',this._handleElement_A,false)
  },
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {
    bus.$off('refresh', this.reload);
    document.removeEventListener('click',this._handleElement_A)
    this.$off();
    this.$remote.getCurrentWindow().removeListener('maximize',this._maximize);
    this.$remote.getCurrentWindow().removeListener('unmaximize',this._unmaximize)
  }, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类
.netmask {
  position: absolute;
  top: 63px;
  left: calc(50%);
  width: 280px;
  text-align: center;
  line-height: 32px;
  z-index: 1001;
  .el-icon-warning-outline {
    color: #ff6263;
    font-size: 16px;
    padding-right: 5px;
  }
  &.red {
    background: #ffe8e8;
    border: #ffc6c6 solid 1px;
    color: #ff6263;
  }
  &.yellow {
    background: #fdf6ec;
    border: #ffdeb0 solid 1px;
    color: #eda368;
  }
}
.topwork {
  height: 21px;
  padding: 0;
  -webkit-app-region: drag;
  background: #fff;
  .i1 {
    &:hover {
      background: #e7e7e7;
    }
  }
  .i2 {
    &:hover {
      background: #fa5151;
    }
  }
  img,
  i {
    cursor: pointer;
    padding: 2px 5px 0;
    display: inline-block;
    -webkit-app-region: no-drag;
  }
}
.chat {
  display: flex;
  // border: #ddd solid 1px;
  border-left: none;
  .chatList {
    width: 270px;
    overflow-y: hidden;
  }
  .chatMessage {
    padding-top: 23px;
    background: #f6f6f6;
    // min-height: 90vh;
    // border-left:1px solid rgba(221,221,221,1);
    border-left: 1px solid #e4e4e4;
    box-sizing: border-box;
    height: 100vh;
    overflow-y: hidden;
  }
}
</style>
<style lang="less">
@import './common-popper/MsgBgPopper.less';
</style>
<style lang="less">
.atBoxActive,.atInput.selected{
  background-color: #D6DEFF;
}
.atBoxHover {
  background: #f7f7f7;
}
.atBox {
  // position: absolute;
  overflow: scroll;
  width: 170px;
  max-height: 184px;
  // bottom: 25px;
  background: #fff;
  border: 1px solid #dddddd;
  border-radius: 4px;
  box-shadow: 0px 2px 8px 0px #888888;
  ul {
    overflow: hidden;
    li {
      display: flex;
      align-items: center;
      padding: 0 5px;
      cursor: pointer;
      img {
        margin: 5px 2px;
      }
      span {
        -ms-text-overflow: ellipsis;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        max-width: 110px;
        display: inline-block;
      }
    }
  }
}
//quill element remove  BUG
.atBox-bottom{
  display: none;
  z-index: -1;
}
.atInput {
  max-width: 170px;
  max-height: 183px;
  overflow: scroll;
  ul {
    li {
      text-overflow: ellipsis;
      &:first-child {
        padding-left: 19px;
      }
    }
  }
  img {
    display: inline-block;
    width: 25px;
    height: 25px;
    border-radius: 15px;
    &:not([src]) {
      opacity: 0;
    }
  }
  span,
  img {
    vertical-align: middle;
    margin: 0 5px;
  }
}

</style>