<!-- 发起群聊 -->
<template>
  <div class="chat-create">
    <el-dialog
      :show-close="false"
      :title="boxTitle"
      @close="handCloseGroup"
      append-to-body
      :modal-append-to-body="false"
      :modal="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :width="dialogWidth"
      :visible="dialogGroupVisible"
      :center="true"
      class="chatCreate"
    >
      <ChatSetting ref="chatSet" @boxTitleFn="boxTitleFn" @CloseDialog="getMsgFormSon" />
    </el-dialog>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import ChatSetting from '@/view/chatSetting';
export default {
  //import引入的组件需要注入到对象中才能使用
  props: {
    dialogGroupVisible: {
      type: Boolean,
      default() {
        return false;
      }
    }
  },
  components: {
    ChatSetting
  },
  data() {
    //这里存放数据
    return {
    };
  },
  //监听属性 类似于data概念
  computed: {
    // boxTitle() {
    //   return this.$t('chat_createcommunity_0001');
    // },
    boxTitle:{
      get(){
        return this.$t('chat_createcommunity_0001');
      },
      set(){} 
    },
    dialogWidth() {
      if (this.$i18n.locale.includes('zh')) {
        return '420px';
      } else {
        return '500px';
      }
    }
  },
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    boxTitleFn(val) {
      console.log(val);
      this.boxTitle = val;
    },
    resetFroms() {
      this.$nextTick(() => {
        this.$refs.chatSet.resetForm();
      });
    },
    getMsgFormSon() {
      this.$emit('handCloseGroup', false);
      this.$refs.chatSet.resetForm();
    },
    handCloseGroup() {
      this.$emit('handCloseGroup', false);
      this.$refs.chatSet.resetForm();
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.boxTitle = this.$t('chat_createcommunity_0001');
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {}, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>

<style lang="less" scoped>
//@import url(); 引入公共css类

.chatCreate {
  top: -50px !important;
}

.chatCreate {
  /deep/ .el-dialog__header {
    padding-top: 10px;
  }
  /deep/ .el-dialog__title {
    color: #333;
    font-size: 14px;

    font-weight: 500;
  }

  /deep/ .el-dialog__headerbtn {
    top: 15px;
  }
  /deep/ .el-dialog--center .el-dialog__body {
    padding-top: 10px;
  }

  /deep/ .el-dialog__body {
    height: 460px;
    padding-bottom: 10px;
  }
}
</style>
