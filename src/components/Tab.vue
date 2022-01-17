<!-- tab 切换 -->
<template>
  <div>
    <ul class="commont-tab-wrap cf" @click="tabHand" ref="ul">
      <!-- <li :class="{active: index == 0}" v-for="(item, index) in data" :key="index" :data-index ='index'>
          {{item}}
      </li> -->
      <router-link :to="item.path" tag="li" v-for="(item, index) in data" :key="index" :data-index="index">
        {{ item.label }}
      </router-link>
      <!-- <li>邮箱验证</li>
      <li>谷歌验证</li> -->
    </ul>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  props: {
    data: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
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
    tabHand(e) {
      if (e.target.nodeName.toLowerCase() === 'li') {
        // let arrLi = [...this.$refs.ul.children];
        // let arrLi = document.querySelectorAll(`#common-tab-wrap${this.data.length} li`);
        // e.target.className = "active";
        let activeIndex = e.target.getAttribute('data-index');
        // arrLi.map((item, index) => {
        //   if (activeIndex != index) {
        //     item.classList.remove("active");
        //   }
        // });
        this.$emit('tabClickHand', this.data[activeIndex], activeIndex);
      }
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
</style>
