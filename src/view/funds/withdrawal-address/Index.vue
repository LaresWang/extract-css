<!-- 提币地址 -->
<template>
  <div class="withdraw-address-wrap">
    <div class="withdraw-address-title">
      <div>提币地址</div>
      <div class="btn" @click="dialogHand('add')">新增地址</div>
    </div>
    <div class="withdraw-address-table">
      <el-table :data="tableData" style="width: 100%" :row-class-name="tableRowClassName" :border="false">
        <el-table-column prop="currency" label="币种" width="180" align="center"></el-table-column>
        <el-table-column prop="labelAddress" label="地址标签" width="180" align="center"></el-table-column>
        <el-table-column prop="linkType" label="链类型" align="center"></el-table-column>
        <el-table-column prop="address" label="地址" align="center"></el-table-column>
        <!-- <el-table-column prop="address" label="修改" align="center" width="100">
          <template slot-scope="scope">
            <img
              src="../../../assets/images/drawal_editor.png"
              width="20px"
              alt
              @click="dialogHand('modify', scope.row)"
            />
          </template>
        </el-table-column>-->
        <el-table-column prop="address" label="删除" align="center" width="100">
          <template slot-scope="scope">
            <img src="../../../assets/images/drawal_del.png" width="20px" alt @click="delHand(scope.$index, scope.row)" />
          </template>
        </el-table-column>
      </el-table>
      <Pagation
        :layout="layout"
        :currentPage="pagePararms.currentPage"
        :total="pagePararms.totalPage"
        :myPageSizes="pagePararms.pageSize"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
      />
      <el-dialog title="新增地址" :visible.sync="dialogVisible" :close-on-click-modal="false" :show-close="false" width="500px">
        <div class>
          <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
            <el-form-item label="币种" prop="currency">
              <el-select v-model="ruleForm.currency" placeholder="请选择币种" style="width: 100%" clearable @change="coinChangeHand">
                <el-option :label="item" :value="item" v-for="item in coin_type" :key="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="链名称" v-if="ruleForm.currency == coin_type[0]">
              <div class="check-btn-groups flex">
                <div
                  class="btn-item"
                  :class="{ active: activeIndex == index }"
                  v-for="(item, index) in link_type"
                  :key="index"
                  @click="tabBtns(item, index)"
                >
                  {{ item }}
                </div>
              </div>
            </el-form-item>
            <div v-if="ruleForm.currency == coin_type[1]">
              <el-form-item label="地址标签" prop="labelAddress">
                <el-input v-model="ruleForm.labelAddress"></el-input>
              </el-form-item>
            </div>
            <el-form-item label="钱包地址" prop="address">
              <el-input v-model="ruleForm.address"></el-input>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input type="textarea" v-model="ruleForm.remark"></el-input>
            </el-form-item>
          </el-form>
        </div>

        <span slot="footer" class="dialog-footer">
          <el-button @click="resetForm('ruleForm')">取 消</el-button>
          <el-button type="primary" @click="submitForm('ruleForm')">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';

import * as api from './server';
import { coin_type, link_type } from '@/utils/const';

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      link_type: link_type,
      coin_type: coin_type,
      layout: 'prev, pager, next',
      pagePararms: {
        totalPage: 0,
        currentPage: 1,
        pageNo: 1,
        pageSize: 10
      },
      tableData: [],
      dialogVisible: false,
      ruleForm: {
        currency: '',
        linkType: 'OMNI',
        labelAddress: '',
        address: '',
        remark: ''
      },
      rules: {
        currency: [{ required: true, message: '请选择币种', trigger: 'change' }],
        labelAddress: [{ required: true, message: '请输入地址标签', trigger: 'blur' }],
        address: [{ required: true, message: '请输入钱包地址 ', trigger: 'blur' }],
        remark: [{ required: true, message: '请输入备注', trigger: 'blur' }]
      },
      activeIndex: 0,
      type: '',
      saveBtn: false
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    coinChangeHand(val) {
      switch (val) {
      case coin_type[0]:
        this.ruleForm.labelAddress = '';
        break;
      case coin_type[1]:
        this.ruleForm.linkType = '';
        this.activeIndex = 0;
        break;
      case coin_type[2]:
        this.ruleForm.labelAddress = '';
        this.ruleForm.linkType = '';
        this.activeIndex = 0;
        break;
      }
    },
    async get_withdraw_address_list() {
      let pararms = {
        currency: '',
        ...this.pagePararms
      };
      let res = await api.get_withdraw_address_list(pararms);
      if (res.data && res.data != null) {
        this.tableData = res.data.rows;
        this.pagePararms.totalPage = res.data.totalPage;
      }
    },
    delHand(index, row) {
      this.$confirm('此操作是删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.saveDelHand(row.addressId);
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
    },
    async saveDelHand(id) {
      // 删除操作
      let res = await api.delete_withdraw_address_book({
        paymentAccountId: id
      });

      if (res.data) {
        this.$message.success(res.msg);
        this.get_withdraw_address_list();
      } else {
        this.$message.error(res.msg);
      }
    },
    tabBtns(item, index) {
      this.activeIndex = index;
      this.ruleForm.linkType = this.link_type[index];
    },
    dialogHand(type) {
      this.dialogVisible = true;
      this.type = type == 'add' ? 'add' : 'modify';
    },
    async saveAddressHand() {
      // 新增地址---保存
      let res = await api.add_withdraw_address_book(this.ruleForm);
      this.saveBtn = false;
      if (res.data) {
        this.$message.success(res.msg);
      } else {
        this.$message.error(res.msg);
      }
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.type === 'add') {
            // 新增地址---保存
            this.saveBtn = true;
            this.saveAddressHand();
          }
          if (this.type === 'modify') {
            // 修改地址
          }
        } else {
          return false;
        }
      });
    },
    resetForm() {
      this.dialogVisible = false;
      this.$refs['ruleForm'].resetFields();
    },
    handleSizeChange(val) {
      // 一页显示多少条
      this.pagePararms.currentPage = 1;
      this.pagePararms.pageNo = 1;
      this.pagePararms.pageSize = val;
      this.get_withdraw_address_list();
    },
    handleCurrentChange(val) {
      // 页码改变时
      this.pagePararms.pageNo = val;
      this.pagePararms.currentPage = val;
      this.get_withdraw_address_list();
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
    this.get_withdraw_address_list();
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
.withdraw-address-wrap .withdraw-address-table .warning-row {
  background: #f7f7fa;
}

.withdraw-address-wrap .withdraw-address-table .success-row {
  background: #fff;
}
.withdraw-address-wrap .withdraw-address-table .el-table td,
.withdraw-address-wrap .withdraw-address-table .el-table th.is-leaf {
  border: none;
}
.withdraw-address-wrap .withdraw-address-table .el-table th {
  background-color: #9297a3;
  color: #151f34;
}
.withdraw-address-wrap .withdraw-address-table .el-table::before {
  height: 0;
}
</style>
<style lang="less" scoped>
//@import url(); 引入公共css类

.withdraw-address-wrap {
  .withdraw-address-title {
    position: relative;
    padding-bottom: 10px;
    color: #151f34;
    font-size: 14px;
    border-bottom: 1px solid #f7f7fa;
    .btn {
      position: absolute;
      bottom: 0;
      right: 0;
      color: #fff;
      padding: 10px 35px;
      line-height: 20px;
      background: #2f54eb;
      box-shadow: 0px 0px 1px 0px rgba(153, 153, 153, 0.3);
      border-radius: 4px;
      cursor: pointer;
    }
  }
  .withdraw-address-table {
    margin-top: 30px;
  }
  .check-btn-groups {
    //   justify-content: sp;
    div {
      flex: 1;
      text-align: center;
      line-height: 20px;
      padding: 10px 22px;
      color: #999999;
      border-radius: 8px;
      margin-right: 20px;
      user-select: none;
      border: 1px solid rgba(153, 153, 153, 1);
      max-width: 33.33%;
      &:last-child {
        margin-right: 0;
      }
      &.active {
        color: #fff;
        background-color: #2f54eb;
        border-color: #2f54eb;
      }
    }
  }
}
</style>
