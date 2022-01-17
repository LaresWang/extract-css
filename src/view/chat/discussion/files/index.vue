<!--  -->
<template>
  <div class="files">
    <Title>社区文件</Title>
    <div class="files-main">
      <h3>共35个文件</h3>
      <div class="files-info">
        <ul>
          <li class="files-detail-title flex justify-between">
            <span>文件</span>
            <span>更新时间</span>
            <span>大小</span>
            <span>发布者</span>
            <span>操作</span>
          </li>
        </ul>
        <ul class="files-list">
          <li class="files-detail-info flex justify-between">
            <span class="flex align-center">
              <img width="22" src="../../../../assets/images/file_ppt.png" alt />
              <span style="margin: 0 0 0 5px">Type something</span>
            </span>
            <span>1977-10-17 07:00:00</span>
            <span>12.3kb</span>
            <span>John Gomez</span>
            <span class="flex align-center">
              <img width="26" src="../../../../assets/images/file_xiazai.png" alt />
            </span>
          </li>
          <li class="files-detail-info flex justify-between">
            <span class="flex align-center">
              <img width="22" src="../../../../assets/images/file_ppt.png" alt />
              <span style="margin: 0 0 0 5px">Type something</span>
            </span>
            <span>1977-10-17 07:00:00</span>
            <span>12.3kb</span>
            <span>John Gomez</span>
            <span class="flex align-center">
              <img width="26" src="../../../../assets/images/file_xiazai.png" alt />
            </span>
          </li>
          <li class="files-detail-info flex justify-between">
            <span class="flex align-center">
              <img width="22" src="../../../../assets/images/file_ppt.png" alt />
              <span style="margin: 0 0 0 5px">Type something</span>
            </span>
            <span>1977-10-17 07:00:00</span>
            <span>12.3kb</span>
            <span>John Gomez</span>
            <span class="flex align-center">
              <img width="26" src="../../../../assets/images/file_xiazai.png" alt />
            </span>
          </li>
          <li class="files-detail-info flex justify-between">
            <span class="flex align-center">
              <img width="22" src="../../../../assets/images/file_ppt.png" alt />
              <span style="margin: 0 0 0 5px">Type something</span>
            </span>
            <span>1977-10-17 07:00:00</span>
            <span>12.3kb</span>
            <span>John Gomez</span>
            <span class="flex align-center">
              <img width="26" src="../../../../assets/images/file_xiazai.png" alt />
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import Title from '../components/title.vue';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: { Title },
  data() {
    //这里存放数据
    return {};
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {},
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
.files-main {
  width: 100%;
  background: #fff;
  height: 850px;
  h3 {
    font-size: 15px;

    font-weight: 400;
    color: rgba(51, 51, 51, 1);
    line-height: 20px;
    padding: 20px;
  }
  .files-detail-title {
    background: #9297a3;
    font-size: 15px;

    font-weight: 400;
    color: rgba(255, 255, 255, 1);
    line-height: 30px;
    padding: 0 20px;
    span {
      width: 150px;
      height: 30px;
      &:nth-child(1) {
        width: 200px;
      }
      &:nth-child(2) {
        width: 200px;
      }
    }
  }
  .files-detail-info {
    background: #fff;
    font-size: 15px;

    font-weight: 400;
    color: #333;
    line-height: 60px;
    padding: 0 20px;
    span {
      width: 150px;
      height: 60px;
      &:nth-child(1) {
        width: 200px;
      }
      &:nth-child(2) {
        width: 200px;
      }
    }
  }
  .files-list {
    li {
      span:nth-child(1) {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    }
    li:nth-child(even) {
      background: #f7f7fa;
    }
  }
}
</style>
