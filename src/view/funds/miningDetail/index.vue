<!--  -->
<template>
  <div class="mindetail">
    <p class="des">矿区概况：<span>APP已为您开通权限，您可以至App进行开矿</span></p>
    <el-tabs v-model="activeItem">
      <ul class="status" id="taglist" @click="tabHand">
        <li
          :class="{ active: index == 0 }"
          :data-index="index"
          v-for="(item, index) in tabData"
          :key="index"
          @click="choosestaus(item.value)"
        >
          {{ item.name }} {{ item.label }}
        </li>
      </ul>
      <span slot="label"> 进行中<label class="numtip">563</label></span>
      <div class="withdraw-address-table">
        <el-table :data="tableData" style="width: 100%" :row-class-name="tableRowClassName" :border="false">
          <el-table-column prop="mineId" label="矿ID" width="180" align="center"></el-table-column>
          <el-table-column prop="name" label="矿名称" align="center"></el-table-column>
          <el-table-column prop="currency" label="币种" align="center"></el-table-column>
          <el-table-column prop="type" label="矿类型" align="center"></el-table-column>
          <el-table-column prop="quantity" label="矿大小" align="center"> </el-table-column>
          <el-table-column prop="count" label="参与挖矿人数" align="center" width="120"> </el-table-column>
          <el-table-column prop="startTime" label="开挖时间" align="center" width="120"> </el-table-column>
          <el-table-column prop="endTime" label="结束时间" align="center" width="120"> </el-table-column>
          <el-table-column prop="address" label="创建时间" align="center" width="120"> </el-table-column>
        </el-table>
      </div>
      <Pagation
        :layout="layout"
        :currentPage="currentPage"
        :total="total"
        :myPageSizes="pageSize"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
      />
      <div class="withdraw-address-table">
        <el-row style="margin: 10px 0; font-size: 14px">
          <el-col :span="15"> 用户挖矿明细 </el-col>
          <el-col :span="9" align="right">
            <el-input placeholder="输入用户通行证搜索" prefix-icon="el-icon-search" style="width: 260px" v-model="ltCode"> </el-input>
            <el-button type="primary" style="margin-left: 20px; cursor: pointer" @click="usermaring()">搜索</el-button>
          </el-col>
        </el-row>
        <el-table :data="tableData2" style="width: 100%" :row-class-name="tableRowClassName" :border="false">
          <el-table-column prop="ltCode" label="个人ID" align="center"></el-table-column>
          <el-table-column prop="nickName" label="个人昵称" align="center"></el-table-column>
          <el-table-column prop="currency" label="币种" align="center"></el-table-column>
          <el-table-column prop="amount" label="挖矿金额(数量)" align="center"></el-table-column>
        </el-table>
      </div>
      <Pagation
        :layout="layout"
        :currentPage="currentPage2"
        :total="total2"
        :myPageSizes="pageSize2"
        @handleSizeChange="handleSizeChange2"
        @handleCurrentChange="handleCurrentChange2"
      />
    </el-tabs>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { fund_mine_mymine } from '../server';
import { fund_mine_stat } from '../server';
import { fund_mine_usermaring } from '../server';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      layout: 'prev, pager, next',
      total: 0,
      currentPage: 1,
      pageNo: 1,
      pageSize: 10,
      tableData: [],
      total2: 0,
      currentPage2: 1,
      pageNo2: 1,
      pageSize2: 10,
      tableData2: [],
      blue: '',
      activeItem: 'first',
      tabData: [
        { name: '进行中', value: '1', label: '0' },
        { name: '未开始', value: '0', label: '0' },
        { name: '已结束', value: '2', label: '0' },
        { name: '失败', value: '3', label: '0' }
      ],
      dataSource: [], // 数据源
      columns: [
        {
          hasSort: false, //<Boolean> 是否排序
          isShow: true, //<Boolean> 是否展示
          prop: 'createTime', //<String>  对应属性名
          label: '矿ID', //<String>   表头标签
          align: 'center'
        }
      ],
      ltCode: '',
      status: 1
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    usermaring() {
      fund_mine_usermaring({
        ltCode: this.ltCode,
        pageNo: this.pageNo2,
        pageSize: this.pageSize2
      }).then(res => {
        this.tableData2 = res.data.rows;
        this.total2 = res.data.totalRow;
      });
    },
    choosestaus(a) {
      this.pageNo = 1;
      this.currentPage = 1;
      if (a) {
        this.status = a;
      }
      this.mymine();
    },
    tabHand(e) {
      if (e.target.nodeName.toLowerCase() === 'li') {
        let arrLi = document.querySelectorAll('#taglist li');
        e.target.className = 'active';
        let activeIndex = e.target.getAttribute('data-index');
        Array.from(arrLi).map((item, index) => {
          if (activeIndex != index) {
            item.classList.remove('active');
          }
        });
      }
    },
    async mymine() {
      let params = {
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        status: this.status
      };
      let res = await fund_mine_mymine(params);

      this.tableData = res.data.rows;
      this.total = res.data.totalRow;
    },
    stat() {
      fund_mine_stat({}).then(res => {
        this.tabData[0].label = res.data.mining;
        this.tabData[1].label = res.data.waitOpen;
        this.tabData[2].label = res.data.miningOver;
        this.tabData[3].label = res.data.openFail;
      });
    },
    getMymine() {
      this.mymine();
      this.stat();
      this.usermaring();
    },
    tableRowClassName({ rowIndex }) {
      if (rowIndex % 2 === 1) {
        return 'warning-row';
      } else if (rowIndex % 2 === 0) {
        return 'success-row';
      }
      return '';
    },
    handleSizeChange(val) {
      // 一页显示多少条
      this.currentPage = 1;
      this.pageNo = 1;
      this.pageSize = val;
      this.mymine();
    },
    handleCurrentChange(val) {
      // 页码改变时
      this.pageNo = val;
      this.currentPage = val;
      this.mymine();
    },
    handleSizeChange2(val) {
      // 一页显示多少条
      this.currentPage2 = 1;
      this.pageNo2 = 1;
      this.pageSize2 = val;
      this.usermaring();
    },
    handleCurrentChange2(val) {
      // 页码改变时
      this.pageNo2 = val;

      this.usermaring();
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.getMymine();
    //  this.stat()
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
.withdraw-address-table {
  margin-top: 20px;
}
.withdraw-address-table .warning-row {
  background: #f7f7fa;
}

.withdraw-address-table .success-row {
  background: #fff;
}
.withdraw-address-table .el-table td,
.withdraw-address-table .el-table th.is-leaf {
  border: none;
}
.withdraw-address-table .el-table th {
  background-color: #9297a3;
  color: #151f34;
}
.withdraw-address-table .el-table::before {
  height: 0;
}
</style>
<style lang="less" scoped>
//@import url(); 引入公共css类

.des {
  font-size: 14px;
  margin: 20px 0;
  span {
    color: #aaa;
  }
}
.status {
  padding-right: 50px;
  overflow: hidden;
  li {
    float: left;
    cursor: pointer;
    padding-right: 50px;
    font-size: 14px;
  }
  .active {
    color: #2f54eb;
  }
}

.numtip {
  padding-left: 5px;
}
.topdes {
  margin: 20px 0;
  color: #666;
  font-size: 14px;
  span {
    padding-right: 50px;
  }
}
.fund-general-wrap {
  .fund-content {
    width: 100%;
    margin-top: 30px;
    .fund-item {
      display: none;
    }
    .active {
      display: block;
    }
  }
}
</style>
