<!-- 看点详情 -->
<template>
  <div class="viewpoint">
    <div style="text-align: right; color: #2f54eb; cursor: pointer" @click="goback()">
      返回
    </div>
    <div class="ql-snow">
      <div class="content ql-editor" v-html="articleContent"></div>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { getContent } from '../server';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      articleContent: ''
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    goback() {
      //  this.$router.go(-1)
      this.$router.back();
    },
    async POST_content() {
      const res = await getContent({
        invitationId: this.$route.query.id
      });
      this.articleContent = res.data;
      //   console.log(this.articleContent,88888)
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.POST_content();
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
<style scoped>
.viewpoint >>> div {
  max-width: 100%;
}</style
>>

<style lang="less" scoped>
//@import url(); 引入公共css类
.viewpoint {
  width: 100%;
  max-height: 100vh;
  box-sizing: border-box;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  padding: 20px;
  word-break: break-all;
  word-wrap: break-word;
}
</style>
