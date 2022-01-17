<!-- 添加好友，发起群聊 -->
<template>
  <div class>
    <el-popover placement="left" width="130" trigger="click">
      <ul class="text-center">
        <li style="line-height: 30px; border-bottom: 1px solid #eee" @click="addHand">
          加好友/加社区
        </li>
        <li style="line-height: 30px" @click="handOpenGroup">发起群聊</li>
      </ul>
    </el-popover>
    <DialogGroupVisible :dialogGroupVisible="groupVisible" @handCloseGroup="handCloseGroup" />
    <AddFriGrop v-if="addOrderVisible" :visible.sync="addOrderVisible" @handCloseFri="handCloseFri" />
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';

import DialogGroupVisible from './dialog/sceate-groups';
import AddFriGrop from './add';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    DialogGroupVisible,
    // DialogAddFriendVisible,
    AddFriGrop
  },
  data() {
    //这里存放数据
    return {
      groupVisible: false,
      dialogAddFriendsVisible: false,
      addOrderVisible: false
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    addHand() {
      this.addOrderVisible = true;
    },
    handOpenGroup() {
      // 打开发起群聊弹框
      this.groupVisible = true;
      this.dialogAddFriendsVisible = true;
    },
    handCloseGroup() {
      // 关闭发起群聊弹框
      this.groupVisible = false;
    },
    handCloseFri() {
      this.addOrderVisible = false;
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
#contact-add-btn {
  position: fixed;
  left: 250px;
  top: 90%;
  transform: translateY(-80%);
}
</style>
