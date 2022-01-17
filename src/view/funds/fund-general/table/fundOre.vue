<!--资金-挖矿  -->
<template>
  <div class="fund-ore">
    <p class="tip">开矿专用账户，资金不可转出</p>
    <div class="ore-top">
      <div class="inpt">
        <el-input placeholder="搜索币种简称或全称" v-model="currency" @blur="search" @keyup.enter.native="search" clearable>
          <i slot="prefix" class="el-input__icon el-icon-search" style="font-size: 16px" @click="search"></i>
        </el-input>
      </div>
      <el-checkbox v-model="checked">隐藏无余额币种</el-checkbox>
    </div>
    <div class="ore-tab">
      <el-table
        :data="checked ? dataNoBalance : tableData"
        style="width: 100%"
        :row-class-name="tableRowClassName"
        :show-header="showHeader"
      >
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
        <el-table-column prop="balance" label="余额" width="200" align="center">
          <template slot-scope="scope">
            <div style="font-size: 18px; color: #151F34; font-weight: 500">
              {{ scope.row.balance }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="挖矿状态" width="140" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.enabled" active-color="#009900" inactive-color="#999999" @change="changeOre($event)"></el-switch>
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
import { get_ore_capitalList, get_ore_allList, get_confirm_enable } from '../server';

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      showHeader: false,
      pageIndex: 1,
      loading: false,
      currency: '',
      checked: false,
      tableData: [],
      dataNoBalance: []
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    // getData() {
    //   //获取数据，在获取数据成功后，则关闭loading效果
    //   //   this.slotloading = false;
    // },
    // getMData() {
    //   this.pageIndex++;
    //   //   self.loading = true;
    //   //   this.getData();
    // },
    async changeOre(a) {
      let param = 1;
      if (a) {
        param = 1;
      } else {
        param = 0;
      }
      let res = await get_confirm_enable({
        enabled: param
      });
      if (res.code == 200) {
        this.$message.success(res.msg);
      } else {
        this.$message.error(111);
      }
    },
    search() {
      let param = {};
      param.currency = this.currency;
      this.getOreData(param);
    },
    async getOreData(param) {
      try {
        let res_data = await get_ore_capitalList(param);
        this.tableData = res_data.data;
        let newArr = [];
        for (let i = 0; i < res_data.data.length; i++) {
          if (res_data.data[i].balance > 0) {
            newArr.push(res_data.data[i]);
          }
        }
        this.dataNoBalance = newArr;
      } catch (error) {
        console.error(error);
      }
    },
    async getAllList() {
      let res = await get_ore_allList();
      this.tableData = res.data;
    },
    init() {
      this.getAllList();
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
      this.$router.push({
        path: '/app/fundDetail',
        query: {
          id: row,
          type: 1201,
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
.ore-tab .warning-row {
  background: #f7f7fa;
}

.ore-tab .success-row {
  background: #fff;
}

.el-table::before {
  height: 0;
}
</style>
<style lang="less" scoped>
//@import url(); 引入公共css类
@import 'http://test.mobile.didimessage.com:50001/api/base/commodity/icons/encry.css';

.fund-ore {
  .tip {
    font-size: 12px;
    font-weight: 400;
    color: rgba(245, 36, 45, 1);
    line-height: 17px;
    height: 17px;
    text-align: center;
    margin-bottom: 10px;
  }

  .ore-top {
    display: flex;
    justify-content: space-between;

    .inpt {
      width: 314px;
    }
  }

  .ore-tab {
    margin-top: 20px;

    .avatar {
      background-size: 40px 40px;
      cursor: pointer;
    }
  }
}
</style>
