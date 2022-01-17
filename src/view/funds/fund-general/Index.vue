<!-- 资产概况 -->
<template>
  <div class="fund-general-wrap">
    <div class="fund-setting-tab">
      <Tab :data="userInfoType.userType == 5 ? tabData : tabDataInfo" />
      <div class="detail">
        <router-link v-if="this.$route.path == '/app/funds/general/wallet'" tag="div" to="/app/walletDetail"
          >钱包明细 <i class="el-icon-arrow-right"></i
        ></router-link>
        <router-link v-if="this.$route.path == '/app/funds/general/mining'" tag="div" to="/app/miningDetail"
          >明细 <i class="el-icon-arrow-right"></i
        ></router-link>
        <router-link v-if="this.$route.path == '/app/funds/general/ore'" tag="div" to="/app/oreDetail"
          >挖矿明细<i class="el-icon-arrow-right"></i
        ></router-link>
      </div>
    </div>
    <div class="fund-content" id="fund-content">
      <router-view v-bind="$route.props || {}"></router-view>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import Tab from '@/components/Tab';
// import FundWallet from './table/fundWallet'
// import FundOre from './table/fundOre'

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    Tab
    // FundWallet,
    // // FundAdvert,
    // FundOre
  },
  data() {
    //这里存放数据
    return {
      tabPosition: 'left',
      userInfoType: JSON.parse(localStorage.userInfo),
      tabDataInfo: [
        {
          label: '资产账户',
          path: '/app/funds/general/wallet'
        },
        {
          label: '挖矿账户',
          path: '/app/funds/general/mining'
        }
      ],
      tabData: [
        {
          label: '资产账户',
          path: '/app/funds/general/wallet'
        },
        {
          label: '挖矿账户',
          path: '/app/funds/general/mining'
        },
        {
          label: '挖矿资金池',
          path: '/app/funds/general/ore'
        }
      ],
      thisIndex: 0
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {},
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    // this.$router.push({path: '/app/funds/general/wallet'})
    //
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

.fund-setting-tab {
  display: flex;
  justify-content: space-between;
  .detail {
    color: #2d53eb;
    font-size: 14px;
    div {
      cursor: pointer;
    }
  }
}
.fund-general-wrap {
  .fund-content {
    width: 100%;
    margin-top: 20px;
    .fund-item {
      display: none;
    }
    .active {
      display: block;
    }
  }
}
</style>
