<!-- 资金详情 -->
<template>
  <div class="fund-detail">
    <div class="back" @click="goBack()"><i class="el-icon-arrow-left"></i>返回</div>
    <div class="currency-type">
      <el-row>
        <el-col :span="2" class="card-avatar">
          <el-avatar :class="`ICON_${this.$route.query.id}`" class="avatar" :size="40"></el-avatar>
        </el-col>
        <el-col :span="18" class="card-con">
          <p>{{ formData.currency }}</p>
        </el-col>
        <el-col :span="4" class="card-money">
          <p>{{ balance }}</p>
        </el-col>
      </el-row>
    </div>
    <el-form
      :model="formData"
      ref="formData"
      :inline="true"
      class="ser-box"
      v-if="this.$route.query.type == '1001' || this.$route.query.type == '1201'"
    >
      <el-select
        v-model="formData.cause"
        placeholder="交易类型"
        clearable
        class="select"
        @blur="search"
        @change="search"
        v-if="!(this.$route.query.isMini == 1)"
      >
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <div class="fund-btn" v-if="this.$route.query.type == '1001'">
        <el-button type="info" @click="goDetail('transfer')">划转</el-button>
        <el-button type="success" @click="goDetail('withdraw')">提币</el-button>
        <el-button type="primary" @click="goDetail('charging')">充币</el-button>
      </div>
    </el-form>
    <div class="fundore-btn" v-if="this.$route.query.type == '1002'">
      <el-button type="info" @click="goDetail('transfer')">划转</el-button>
    </div>
    <div class="fund-table">
      <el-table :data="tableData" style="width: 100%" :row-class-name="tableRowClassName" :border="false">
        <el-table-column prop="createdOn" label="交易时间" align="center"></el-table-column>
        <el-table-column prop="cause" label="交易类型" align="center" v-if="type == 1001"></el-table-column>
        <el-table-column prop="tabName" label="交易类型" align="center" v-if="type == 1201 || type == 1002"></el-table-column>
        <el-table-column prop="amount" label="交易数量" align="center" v-if="type == 1001 || type == 1002"></el-table-column>
        <el-table-column prop="currency" label="币种" align="center" v-if="type == 1201 || type == 1002"></el-table-column>
        <el-table-column prop="fee" label="手续费" align="center" v-if="type == 1001"></el-table-column>
        <el-table-column prop="amount" label="交易数量" align="center" v-if="type == 1201"></el-table-column>
      </el-table>
      <Pagation
        :layout="layout"
        :currentPage="currentPage"
        :total="total"
        :myPageSizes="formData.pageSize"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { get_account_wallet, get_account_ore, get_mining_wallet, get_funds_balance } from '../server';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  // beforeRouteEnter:(to,from,next)=>{
  //     // next(vm=>{
  //     //     // alert(vm.num)
  //     //
  //     //     if(from.path == '/app/funds/general/wallet'){
  //     //       this.path = 'wallet'
  //     //     } else if(from.path == '/app/funds/general/ore') {
  //     //       this.path = 'ore'
  //     //     }
  //     // })
  //     next(vm => {
  //       this.pa
  //     })
  // },
  data() {
    //这里存放数据
    return {
      formData: {
        accountType: 0,
        currency: this.$route.query.id,
        pageSize: 10,
        pageNo: 1
      },
      options: [
        {
          value: '10004',
          label: '转出'
        },
        {
          value: '10005',
          label: '转入'
        },
        {
          value: '10009',
          label: '充币'
        },
        {
          value: '10010',
          label: '提币'
        }
      ],
      value: '',
      beginTime: '',
      endTime: '',
      serAdvert: '',
      layout: 'prev, pager, next',
      total: 100,
      currentPage: 1,
      tableData: [],
      type: this.$route.query.type,
      balance: ''
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    search() {
      this.formData.accountType = Number(this.$route.query.type);
      this.formData.pageNo = 1;
      this.currentPage = 1;
      if (this.$route.query.type == '1001') {
        this.getWallet();
      } else if (this.$route.query.type == '1201') {
        this.getOre();
      } else if (this.$route.query.type == '1002') {
        this.getMining();
      }
    },
    async getWallet() {
      try {
        let res = await get_account_wallet(this.formData);
        this.tableData = res.data.rows;
        this.total = res.data.totalRow;
      } catch (error) {
        console.error(error);
      }
    },
    async getOre() {
      try {
        let res = await get_account_ore(this.formData);
        this.tableData = res.data.rows;
        this.total = res.data.totalRow;
      } catch (error) {
        console.error(error);
      }
    },
    async getMining() {
      try {
        let res = await get_mining_wallet(this.formData);
        this.tableData = res.data.rows;
        this.total = res.data.totalRow;
      } catch (error) {
        console.error(error);
      }
    },
    init() {
      this.search();
    },
    goDetail(con) {
      this.$router.push({
        path: `/app/${con}`,
        query: {
          id: this.$route.query.id,
          balance: this.$route.query.balance,
          type: this.$route.query.type
        }
      });
    },
    goBack() {
      this.$router.go(-1);
      // this.$router.push({
      //   path: ''
      // })
    },
    handleSizeChange(val) {
      // 一页显示多少条
      this.currentPage = 1;
      this.formData.pageNo = 1;
      this.formData.pageSize = val;
      if (this.$route.query.type == '1001') {
        this.getWallet();
      } else if (this.$route.query.type == '1201') {
        this.getOre();
      } else if (this.$route.query.type == '1002') {
        this.getMining();
      }
    },
    handleCurrentChange(val) {
      // 页码改变时
      this.formData.pageNo = val;
      this.currentPage = val;
      if (this.$route.query.type == '1001') {
        this.getWallet();
      } else if (this.$route.query.type == '1201') {
        this.getOre();
      } else if (this.$route.query.type == '1002') {
        this.getMining();
      }
    },
    tableRowClassName({ rowIndex }) {
      if (rowIndex % 2 === 1) {
        return 'warning-row';
      } else if (rowIndex % 2 === 0) {
        return 'success-row';
      }
      return '';
    },
    async getBalance() {
      let res = await get_funds_balance({
        currency: this.$route.query.id,
        accountType: this.$route.query.type
      });
      if (res.code == 200) {
        this.balance = res.data.balance;
      } else {
        console.log(res.msg);
      }
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.init();
    this.getBalance();
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  beffundCreate() {}, //生命周期 - 创建之前
  beffundMount() {}, //生命周期 - 挂载之前
  beffundUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beffundDestroy() {}, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style>
.fund-detail .fund-table .warning-row {
  background: #f7f7fa;
}
.fund-detail .fund-table .success-row {
  background: #fff;
}
.fund-detail .fund-table .el-table td,
.fund-detail .fund-table .el-table th.is-leaf {
  border: none;
}
.fund-detail .fund-table .el-table th {
  background-color: #9297a3;
  color: #151f34;
}
/*.fund-detail .fund-table .el-table::beffund {*/
/*  height: 0;*/
/*}*/
</style>
<style lang="less" scoped>
//@import url(); 引入公共css类
@import 'http://test.mobile.didimessage.com:50001/api/base/commodity/icons/encry.css';
.fund-detail {
  box-sizing: border-box;
  padding: 30px 20px;
  .fundore-btn {
    margin-bottom: 20px;
    text-align: right;
  }
  .back {
    width: 100px;
    cursor: pointer;
    color: #151f34;
    font-size: 16px;
    .el-icon-arrow-left {
      color: #9497a3;
      margin-right: 10px;
      font-weight: 500;
    }
  }
  .currency-type {
    margin: 30px 0;
    .card-avatar {
      text-align: center;
      .avatar {
        background-size: 40px 40px;
        cursor: pointer;
      }
    }
    .card-con {
      p {
        height: 20px;
        font-size: 14px;
        font-weight: 400;
        color: rgba(21, 31, 52, 1);
        line-height: 40px;
        // &:nth-child(2) {
        //   height: 17px;
        //   font-size: 12px;
        //   font-weight: 400;
        //   color: rgba(153, 153, 153, 1);
        //   line-height: 17px;
        // }
      }
    }
  }
  .ser-box {
    margin: 35px 0 30px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    .input {
      width: 314px;
    }
    .time {
      .middle {
        display: inline-block;
        margin: 0 10px;
        font-size: 20px;
        font-weight: 500;
      }
    }
  }
}
</style>
