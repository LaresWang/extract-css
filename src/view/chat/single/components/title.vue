<!-- member title -->
<template>
  <div style="background: #fff; -webkit-app-region: drag; height:38px">
    <div class="mess-header flex align-center justify-between drag">
      <div class="mess-name" style="-webkit-app-region: no-drag">
        <slot></slot>
      </div>
      <div class="mess-nav flex align-center">
        <!-- <span @click="goMessage">消息</span> -->
        <!-- <span>搜寻</span> -->
        <span
          @click="goSetting"
          class="noDrag"
          v-if="
            this.$route.query.id != '1008455862495526912' &&
              this.$route.query.id != '1032384035881537536' &&
              this.$route.query.id != '1188285824566878208' &&
              this.$route.query.id != $paymentId
          "
        >
          <img draggable='false' src="../../../../assets/images/right_top_config.png" alt />
        </span>
      </div>
    </div>
    <!-- <div v-if="!rightStatus" id="checklist" class="mess-checklist"> -->

    <!-- </div> -->
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {};
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    goMessage() {
      this.$emit('goMessage');
    },
    goSetting() {
      this.$emit('goSetting', 1);
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
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
.mess-header {
  height: 38px;
  background: #fff;
  padding: 0 20px;
  box-sizing: border-box;
  border-bottom: 1px solid #e4e4e4;
  span {
    height: 20px;
    line-height: 20px;
    &:nth-child(2) {
      margin: 0 12px;
    }
    &:nth-child(4) {
      margin: 0 12px;
    }
  }

  .mess-nav span {
    cursor: pointer;
  }
  .mess-nav img {
    width: 23px;
    height: 23px;
  }
  .mess-name {
    font-weight: 600;
  }
}
.mess-checklist {
  position: absolute;
  right: 0;
  width: 200px;
  background: rgba(255, 255, 255, 1);
  border: 1px solid rgba(221, 221, 221, 1);
  z-index: 10000;
}
.liMenu {
  cursor: pointer;
  text-align: center;
  height: 40px;
  line-height: 40px;
  font-size: 15px;
}
.liMenu:hover {
  color: #fff;
  background: #2f54eb;
}
</style>
