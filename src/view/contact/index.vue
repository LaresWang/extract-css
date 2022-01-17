<!-- 联系人 -->
<template>
  <div class="contact-wrap">
    <List />
    <div class="contact-con-wrap flex-sub">
      <div class="contact-con-scroll">
        <ChatBg v-if="'/app/contact' == $route.path" />
        <router-view v-if="'/app/contact' != $route.path && isRouterAlive" />
      </div>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import List from './list';
import { LOGIN_OUT } from '@/store/types';
import { mapMutations } from 'vuex';
import bus from '@/utils/eventbus';
export default {
  name: 'Contact',
  //import引入的组件需要注入到对象中才能使用
  components: {
    List
  },
  data() {
    //这里存放数据
    return {
      isMaxed: false,
      isRouterAlive: true
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
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
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    bus.$on('refresh', this.reload);
    this.$remote.getCurrentWindow().addListener('maximize',this._maximize);
    this.$remote.getCurrentWindow().addListener('unmaximize',this._unmaximize)
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {
    bus.$off('refresh', this.reload);
    this.$remote.getCurrentWindow().removeListener('maximize',this._maximize);
    this.$remote.getCurrentWindow().removeListener('unmaximize',this._unmaximize)
  }, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类
.contact-wrap {
  display: flex;
  margin: 0;
  height: 100vh;
  overflow: hidden;
  .contact-con-wrap {
    background: #fcfbfb;
    min-height: 90vh;
    height: 100vh;
    overflow: hidden;
    // border-left: 1px solid rgba(221, 221, 221, 1);
    border-left: 1px solid #e4e4e4;
    box-sizing: border-box;
    .contact-con-scroll {
      height: 100%;
      overflow-y: scroll;
    }
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
  border: #ddd solid 1px;
  border-left: none;
  .chatList {
    width: 270px;
    overflow-y: scroll;
  }
  .chatMessage {
    padding-top: 23px;
    background: #f6f6f6;
    // min-height: 90vh;
    border-left: 1px solid rgba(221, 221, 221, 1);
    box-sizing: border-box;
    height: 100vh;
    overflow-y: hidden;
  }
}
</style>
