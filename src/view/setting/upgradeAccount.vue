<template>
  <div>
    <div class="title">
      <span>升级账户</span>
      <el-button type="text" @click="$router.back()">返回<i class="el-icon-arrow-right el-icon--right"></i></el-button>
    </div>
    <step2 :callback="success" />
  </div>
</template>

<script>
import step2 from '@/layouts/user/register/step2';
export default {
  data() {
    return {};
  },
  components: {
    step2
  },
  methods: {
    success() {
      // 提交成功
      this.$message.success('审核资料提交成功，审核通过后我们将在APP通知您！');
      this.$router.back();
    }
  }
};
</script>

<style lang="less" scoped>
.title {
  display: flex;
  justify-content: space-between;
}
</style>
