<template>
  <div class="fund-wallet">
    <div class="wallet-top">
      <div class="inpt">
        <el-input placeholder="搜索币种简称或全称" v-model="currency" @keyup.enter.native="search" @blur="search" clearable>
          <i slot="prefix" class="el-input__icon el-icon-search" style="font-size: 16px" @click="search"></i>
        </el-input>
      </div>
      <el-checkbox v-model="checked" @change="search">隐藏无余额币种</el-checkbox>
    </div>
    <div class="wallet-tab">
      <el-table :data="tableData" style="width: 100%" :row-class-name="tableRowClassName" :show-header="showHeader">
        <el-table-column label="图片" align="center" width="120">
          <template slot-scope="scope">
            <div @click="goDetail(scope.row.currency, scope.row.balance, scope.row.accountId)">
              <el-avatar :class="`ICON_${scope.row.currency}`" class="avatar" :size="40"></el-avatar>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="currency" label="名称">
          <template slot-scope="scope">
            <div
              style="
                display: flex;
                flex-direction: column;
                justify-content: center;
              "
            >
              <p style="flex: 1; color: rgba(21, 31, 52, 1); font-size: 14px">
                {{ scope.row.currency }}
              </p>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额" width="200">
          <template slot-scope="scope">
            <div style="font-size: 18px; color: #151F34; font-weight: 500">
              {{ scope.row.balance }}
            </div>
          </template>
        </el-table-column>
        <p slot="append" style="text-align: center; line-height: 50px; border-bottom: none">
          <span href="javascript:;" style="color: #2F54EB">没有更多了</span>
        </p>
      </el-table>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { get_account_capitalList } from '../server';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      currency: '',
      checked: false,
      showHeader: false,
      tableData: [],
      pageIndex: 1,
      loading: false
    };
  },
  props: {
    type: {
      type: String,
      default: 'wallet'
    }
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    search() {
      let param = {};
      param.currency = this.currency;
      param.hidden = this.checked;
      this.getData(param);
    },
    async getData(parameter) {
      try {
        let res_data = await get_account_capitalList(parameter);
        this.tableData = res_data.data;
      } catch (error) {
        throw new Error(error);
      }
    },
    init() {
      this.search();
    },
    tableRowClassName({ rowIndex }) {
      if (rowIndex % 2 === 1) {
        return 'warning-row';
      } else if (rowIndex % 2 === 0) {
        return 'success-row';
      }
      return '';
    },
    goDetail(row, balance, accountId) {
      //详情页
      this.$router.push({
        path: '/app/fundDetail',
        query: {
          id: row,
          type: 1001,
          accountId: accountId
        }
      });
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.init();
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
<style>
.wallet-tab .warning-row {
  background: #f7f7fa;
}

.wallet-tab .success-row {
  background: #fff;
}
.el-table::before {
  height: 0;
}
</style>
<style lang="less" scoped>
//@import url(); 引入公共css类
@import 'http://test.mobile.didimessage.com:50001/api/base/commodity/icons/encry.css';
.fund-wallet {
  .wallet-top {
    display: flex;
    justify-content: space-between;

    .inpt {
      width: 314px;
    }
  }
  .wallet-tab {
    margin-top: 20px;
    width: 100%;
    height: 100vh;
    overflow: auto;
    .avatar {
      background-size: 40px 40px;
      cursor: pointer;
    }
  }
}
</style>
