<!-- 添加好友 -->
<template>
  <el-dialog
    :visible.sync="visible"
    class="add-friends"
    width="400px"
    append-to-body
    :modal-append-to-body="false"
    :modal="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="beforeClose"
    custom-class="dialog-position"
  >
    <div class="contact-list-wraps">
      <ul ref="ul" @click="tabHand">
        <li :class="activeIndex == 0 ? 'active' : ''" data-index="0">
          {{ $t('chat_addfriend_0001') }}
        </li>
        <li :class="activeIndex == 1 ? 'active' : ''" data-index="1">
          {{ $t('chat_joincommunity_0001') }}
        </li>
      </ul>
      <div class="tab-list-item">
        <Friend v-show="activeIndex == 0" 
        :isCon="activeIndex == 1 ? 1 : 0" 
        @handleColseFri="handleClosed" 
        :inviteCode="inviteCode" :addFriVisible="activeIndex == 0"/>
        <Group v-show="activeIndex == 1" 
        :isCon="activeIndex == 0 ? 1 : 0" 
        @handleClose="handleClosed" 
        :inviteCode="inviteCode" :addGroupVisible="activeIndex == 1"/>
      </div>
    </div>
  </el-dialog>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import Friend from './friends';
import Group from './group';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    Friend,
    Group
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    inviteCode: {
      type: String,
      default() {
        return '';
      }
    },
    index: {
      type: Number,
      default() {
        return 0;
      }
    }
  },
  data() {
    //这里存放数据
    return {
      activeName: 'first',
      activeIndex: 0
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    handleClosed() {
      this.$emit('handCloseFri', false);
      this.$emit('update:visible', false);
    },
    beforeClose() {
      this.$emit('update:visible', false);
    },
    tabHand(e) {
      if (e.target.nodeName.toLowerCase() === 'li') {
        let arrLi = [...this.$refs.ul.children];
        // let arrLi = document.querySelectorAll(`#common-tab-wrap${this.data.length} li`);
        e.target.className = 'active';
        this.activeIndex = e.target.getAttribute('data-index');
        arrLi.map((item, index) => {
          if (this.activeIndex != index) {
            item.classList.remove('active');
          }
        });
        // this.$emit('tabClickHand',this.data[activeIndex], activeIndex)
      }
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    if (this.index) {
      this.activeIndex = this.index;
    }
  },
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
.add-friends {
  /deep/ .dialog-position {
    margin-top: 12vh !important;
    margin-left: 45vw !important;
  }

  /deep/ .el-dialog__header {
    padding: 20px 20px 0;
  }

  /deep/ .el-dialog__headerbtn {
    top: 10px;
  }

  /deep/ .el-dialog__body {
    padding: 0 10px 20px 0px;
    min-height: 220px;
  }
}

.contact-list-wraps {
  width: 100%;
  position: relative;

  ul {
    width: 100%;
    // height: 48px;  //sandy
    // background:rgba(243,243,243,1);//sandy
    line-height: 48px;
    display: flex;
    justify-content: space-around;
    li {
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      height: 20px;
      color: #999999;
      line-height: 20px;
      margin-bottom: 10px;

      &.active {
        color: #333333;
      }
    }
  }
  // .tab-list-item {
  //   background-color: #fcfbfb;
  //   height: calc(100vh-100px);
  //   overflow-y: scroll;
  // }
}
</style>
