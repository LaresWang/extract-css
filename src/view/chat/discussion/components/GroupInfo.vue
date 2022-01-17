
<template>
  <div class="group-info">
    <div class="title">
      <span>{{ $t('book_group_0026') }}</span>
      <i class="el-icon-close close-i" @click="handleClose"></i>
    </div>
    <div class="content">
      <div class="group-header">
        <div class="discussion-image">
          <DiscussionIcon :name="groupInfo.groupName" iconType="large" />
        </div>
        <div class="group-name">
          <span :title="groupInfo.groupName">{{ groupInfo.groupName }}</span>
          <img class="img_15" src="../../../../assets/images/edit.png" @click="onEditDiscussionName" alt />
        </div>
      </div>
      <el-divider class="group-el-divider" />
      <div class="group-detail">
        <el-row>
          <el-col :span="12">
            <span>{{ $t('book_group_0028') }}</span>
          </el-col>
          <el-col :span="12">
            <div class="group-detail-info">{{ $t('Universal_0303', {value: groupInfo.maxPeople}) }}</div>
          </el-col>
        </el-row>
      </div>
    </div>
    <DiscussionNameEdit
      :name="groupInfo.groupName"
      :group-id="groupInfo.id"
      @refreshGroupInfo="refreshGroupInfo"
      ref="discussionNameEdit"
    />
  </div>
</template>

<script>
import DiscussionNameEdit from './DiscussionNameEdit';
import DiscussionIcon from '@/components/memberIcon/DiscussionIcon';

export default {
  name: 'GroupInfo',
  components: {
    DiscussionNameEdit,
    DiscussionIcon
  },
  props: {
    groupInfo: {
      type: Object,
      default() {
        return {};
      }
    },
    authStatus: {
      type: String,
      default() {
        return '1';
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('closeDialog');
    },
    onEditDiscussionName() {
      this.$refs.discussionNameEdit.onPop();
    },
    onShareGroup() {
      this.$refs.groupShare.onPop();
    },
    refreshGroupInfo() {
      this.$emit('refreshGroupInfo');
    },
    reloadGroupInfo() {
      this.$forceUpdate();
    }
  }
};
</script>

<style lang="less" scoped>
.group-info {
  box-sizing: border-box;

  font-size: 14px;
  font-weight: 500;
  color: #333;
  width: 100%;
  height: 100vh;
  overflow-y: scroll;
  user-select: text;
  .outGroup {
    box-sizing: border-box;
    text-align: center;
    color: red;
    height: 50px;
    line-height: 50px;
    width: 100%;
    background-color: #fbfbfb;
    position: absolute;
    bottom: 0;
    span {
      cursor: pointer;
    }
  }
  .title:first-child {
    position: absolute;
    z-index: 1;
  }
  .title {
    width: 100%;
    height: 50px;
    background-color: #fbfbfb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    padding: 0 20px;
    span {
      font-weight: 600;
    }
    .el-icon-close {
      font-size: 14px;
      color: #000;
    }
    .el-icon-right {
      font-size: 20px;
    }
  }

  .content {
    box-sizing: border-box;
    width: 100%;
    background-color: #fff;
    margin-top: 60px;
    position: relative;
    .group-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
    }
    .group-name {
      width: 100%;
      font-size: 12px;
      color: #333333;
      font-weight: bold;
      text-align: center;
    }
    .group-name span {
      max-width: 80%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: pre;
      display: inline-block;
      padding-right: 5px;
    }
    .group-code {
      font-size: 10px;
      color: #999999;
      margin-right: 5px;
    }
    .group-header {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      height: 90px;
    }
    .group-edit {
      position: absolute;
      top: 0px;
      right: 10px;
    }
    .group-el-divider {
      margin: 10px 0;
      background-color: #ececec;
    }
    .group-detail {
      padding: 0 10px;
      span {
        color: #999999;
        font-size: 13px;
      }
      .el-row {
        margin-bottom: 10px;
      }
      .group-detail-info {
        font-size: 13px;
        word-break: break-word;
        font-weight: 400;
        color: #333;
      }
      .group-profile {
        font-size: 13px;
        color: #999999;
        height: 40vh;
      }
      .group-profile span {
        display: block;
        height: 100%;
        line-height: 2;
        color: #333333;
        overflow-y: auto;
        word-wrap: break-word;
      }
    }
  }
}
</style>
