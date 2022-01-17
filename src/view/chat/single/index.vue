<!--  -->
<template>
  <div class="">
    <!-- DiDiPayment -->
    <template v-if="query['id'] == $paymentId || query['id'] == actAssistantId">
      <Title>
        <div style="display: flex; align-items: center; cursor: pointer">
          <label class="vlogo">
            <img src="../../../assets/images/vlogo.png" />
          </label>
          <span class="group-name" :title="decodeURI(query['friendName'])">{{ decodeURI(query['friendName']) || '-' }}</span>
        </div>
      </Title>
      <DiDiPayment v-if="query['id'] == $paymentId" />
      <ActivityAssistant v-if="query['id'] == actAssistantId" />
    </template>
    <router-view v-else></router-view>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import DiDiPayment from '../components/DiDi-Payment/DiDiPayment';
import ActivityAssistant from '../components/DiDi-Payment/ActivityAssistant';
import Title from './components/title.vue';
import { ActAssistantId } from "@/utils/const"
export default {
  name: 'SingleRouterView',
  //import引入的组件需要注入到对象中才能使用
  components: {
    DiDiPayment,
    ActivityAssistant,
    Title
  },
  data() {
    //这里存放数据
    return {
      actAssistantId:ActAssistantId
    };
  },
  //监听属性 类似于data概念
  computed: {
    query() {
      return this.$route.query;
    }
  },
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {},
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  // async mounted() {
  // console.log(this.query);
  // let uinfo = await window.vm
  //   .$knex("t_contacts")
  //   .select()
  //   .where("friend_id", this.query.id);
  // console.log(uinfo);
  // },
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
</style>
