<!-- 表格组件 -->
<template>
  <div class="table">
    <el-table :data="data" style="width: 100%" :row-class-name="tableRowClassName" :show-header="showHeader">
      <el-table-column label="图片" align="center" width="120">
        <template slot-scope="scope">
          <div @click="goDetail(scope.row.accountId)">
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
            <p style="flex: 1; color: #999">{{ scope.row.currency }}</p>
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
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';

export default {
  //import引入的组件需要注入到对象中才能使用
  props: {
    data: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  components: {},
  data() {
    //这里存放数据
    return {
      showHeader: false,
      pageIndex: 1,
      loading: false
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
    // //   this.slotloading = false;

    // },

    // getMData() {
    //   this.pageIndex++;
    // //   self.loading = true;
    // //   this.getData();
    // },
    tableRowClassName({ rowIndex }) {
      if (rowIndex % 2 === 1) {
        return 'warning-row';
      } else if (rowIndex % 2 === 0) {
        return 'success-row';
      }
      return '';
    },
    goDetail(row) {
      //详情页
      this.$router.push({
        path: '/app/fundDetail',
        query: {
          id: row
        }
      });
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
<style>
.table .warning-row {
  background: #f7f7fa;
}

.table .success-row {
  background: #fff;
}
.el-table::before {
  height: 0;
}
</style>
<style lang="less" scoped>
//@import url(); 引入公共css类
@import 'http://test.mobile.didimessage.com:50001/api/base/commodity/icons/encry.css';
.table {
  width: 100%;
  height: 100vh;
  overflow: auto;
  .avatar {
    background-size: 40px 40px;
  }
}
</style>
