
<template>
  <div class="group-info">
    <div class="title">
      <span>{{ $t('book_community_0008') }}</span>
      <i class="el-icon-close close-i" @click="handleClose"></i>
    </div>
    <div class="content">
      <div class="group-header">
        <img
          :src="groupInfo.groupAvatar"
          class="group-avatar"
          alt=""
          @error="replaceImg"
        />
        <span class="group-name" :title="groupInfo.groupName">{{
          groupInfo.groupName
        }}</span>
        <div>
          <span class="group-code">ID: {{ groupInfo.groupCode }}</span>
          <img
            class="img_12"
            src="../../../../assets/images/group_share.png"
            @click="onShareGroup"
            alt
          />
        </div>
      </div>
      <img
        src="../../../../assets/images/edit.png"
        v-show="authStatus == '1' || authStatus == '2'"
        @click="onEditGroupInfo"
        class="group-edit img_15"
        alt
      />
      <el-divider class="group-el-divider" />
      <div class="group-detail">
        <el-row>
          <el-col :span="labelWidth">
            <span>{{ $t('Universal_0205') }}：</span>
          </el-col>
          <el-col :span="valueWidth">
            <div class="group-detail-info">{{ groupInfo.region }}</div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="labelWidth">
            <span>{{ $t('chat_comm_manage_0013') }}：</span>
          </el-col>
          <el-col :span="valueWidth">
            <div class="group-detail-info">{{ $t('Universal_0303', {value: groupInfo.maxPeople}) }}</div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="labelWidth">
            <span>{{ $t('chat_createcommunity_0010') }}：</span>
          </el-col>
          <el-col :span="valueWidth">
            <div class="group-detail-info">
              {{ groupInfo.groupTab | tabFilter(statusMap) }}
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="labelWidth">
            <span>{{ $t('chat_comm_set_0002') }}：</span>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <div class="group-profile">
              <span>{{ decodeURI(groupInfo.groupProfile || "") }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <GroupShare
      :group-info="groupInfo"
      :showAppealClosureNotice="showAppealClosureNotice"
      ref="groupShare"
      @groupInfoClose="handleClose"
      @toAppeal="toAppeal"
    />
    <GroupInfoEdit
      :info="groupInfo"
      @refreshGroupInfo="refreshGroupInfo"
      ref="groupEdit"
    />
  </div>
</template>

<script>
import GroupShare from "./GroupShare";
import GroupInfoEdit from "./GroupInfoEdit";
import UserInfoUtils from "@/utils/UserInfoUtils";
export default {
  name: "GroupInfo",
  components: {
    GroupShare,
    GroupInfoEdit,
  },
  props: {
    groupInfo: {
      type: Object,
      default() {
        return {};
      },
    },
    authStatus: {
      type: String,
      default() {
        return "1";
      },
    },
    showAppealClosureNotice: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
  },
  data() {
    return {
      statusMap:  {
        // "": "-",
        // 0: "-",
        1: this.$t('chat_createcommunity_0012'),
        2: "BTC",
        3: this.$t('chat_createcommunity_0014'),
        4: this.$t('chat_createcommunity_0015'),
        5: this.$t('chat_createcommunity_0016'),
        6: this.$t('chat_createcommunity_0017'),
        7: "Defi",
        8: this.$t('chat_createcommunity_0019'),
        9: this.$t('chat_createcommunity_0020'),
        10: this.$t('chat_createcommunity_0021')
      }
    }
  },
  filters: {
    tabFilter(status, statusMap) {
      return statusMap[status]||"";
    },
  },
  computed: {
    labelWidth() {
      if (this.$i18n.locale.includes('zh')) {
        return 11;
      } else {
        return 16;
      }
    },
    valueWidth() {
      if (this.$i18n.locale.includes('zh')) {
        return 13;
      } else {
        return 8;
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit("closeDialog");
    },
    onEditGroupInfo() {
      this.$refs.groupEdit.onPop();
    },
    onShareGroup() {
      this.$refs.groupShare.onPop();
    },
    refreshGroupInfo() {
      this.$emit("refreshGroupInfo");
    },
    toAppeal() {
      console.log("3333333333333333333333");
      this.$emit("toAppeal");
    },
    reloadGroupInfo() {
      this.$forceUpdate();
    },
    replaceImg(e) {
      UserInfoUtils.replaceDefaultImg(e, "group");
    },
  },
  created() {},
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
      font-size: 12px;
      color: #333333;
      font-weight: bold;
      max-width: 190px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: pre;
      text-align: center;
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
