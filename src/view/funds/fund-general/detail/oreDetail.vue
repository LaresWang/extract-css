<!-- 矿区明细 -->
<template>
  <div class="ore-detail">
    <div class="back" @click="goBack()"><i class="el-icon-arrow-left"></i>返回</div>
    <el-form :model="formData" ref="formData" :inline="true" class="ser-box">
      <el-input
        placeholder="搜索币种简称或全称"
        v-model="formData.currency"
        class="input"
        clearable
        @keyup.enter.native="search"
        @blur="search"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" style="font-size: 16px" @click="search"></i>
      </el-input>
    </el-form>
    <div class="ore-table">
      <el-table :data="tableData" style="width: 100%" :row-class-name="tableRowClassName" :border="false">
        <el-table-column prop="time" label="交易时间" align="center"></el-table-column>
        <el-table-column prop="tabType" label="交易类型" align="center"></el-table-column>
        <el-table-column prop="currency" label="币种" align="center"></el-table-column>
        <el-table-column prop="amount" label="交易数量" align="center"></el-table-column>
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
import { get_account_ore } from './../server';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
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
      formData: {
        currency: '',
        accountType: 1201,
        pageSize: 10,
        pageNo: 1
      }
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    search() {
      this.formData.pageNo = 1;
      this.currentPage = 1;
      this.getTableData();
    },
    async getTableData() {
      try {
        let res = await get_account_ore(this.formData);
        this.tableData = res.data.rows;
        this.total = res.data.totalRow;
      } catch (error) {
        console.error(error);
      }
    },
    init() {
      this.getTableData();
    },
    goBack() {
      this.$router.go(-1);
    },
    handleSizeChange(val) {
      // 一页显示多少条
      this.currentPage = 1;
      this.formData.pageNo = 1;
      this.formData.pageSize = val;
      this.getTableData();
    },
    handleCurrentChange(val) {
      // 页码改变时
      this.formData.pageNo = val;
      this.currentPage = val;
      this.getTableData();
    },
    tableRowClassName({ rowIndex }) {
      if (rowIndex % 2 === 1) {
        return 'warning-row';
      } else if (rowIndex % 2 === 0) {
        return 'success-row';
      }
      return '';
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
.ore-detail .ore-table .warning-row {
  background: #f7f7fa;
}
.ore-detail .ore-table .success-row {
  background: #fff;
}
.ore-detail .ore-table .el-table td,
.ore-detail .ore-table .el-table th.is-leaf {
  border: none;
}
.ore-detail .ore-table .el-table th {
  background-color: #9297a3;
  color: #151f34;
}
.ore-detail .ore-table .el-table::before {
  height: 0;
}
</style>
<style lang="less" scoped>
//@import url(); 引入公共css类
.ore-detail {
  box-sizing: border-box;
  padding: 30px 20px;
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
