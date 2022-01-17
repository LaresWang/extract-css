<!-- 通用设置--消息转发-搜索联系人/群ID或关键字 -->
<template>
  <el-dialog
    title
    append-to-body
    :modal-append-to-body="false"
    :modal="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="invite-mem-dialog-con"
    @close="closeDia"
    :visible="GroupInviteVisible"
    width="570px"
    :destroy-on-close="true"
  >
    <div slot="title" class="header-title">
      <span class="title-name">{{ title }}</span>
    </div>
    
    <el-row v-loading="loading" element-loading-spinner="el-icon-loading" :element-loading-text="$t('Universal_0025')">
      <el-col :span="12" class="invite-mem-dialog-border">
        <div class="invite-mem-dialog-left">
          <el-input
            size="small"
            :placeholder="$t('Universal_0360')"
            prefix-icon="el-icon-search"
            v-model="searchInput"
            @input="onFilter"
            clearable
            class="inputIcon"
            id="forwardMsg"
            :code="GroupInviteVisible"
          ></el-input>
          <ul class="menu widthDt" v-show="!searchInput">
            <li
              :class="item.active ? 'active' : ''"
              v-for="item in menuList"
              :key="item.path"
              @click="Tocomponent(item.path)"
            >
              {{ item.name }}
            </li>
          </ul>
          <div class="lists" v-show="!searchInput">
            <component
              v-show="GroupInviteVisible"
              ref="com"
              :is="comName"
              :limitGroupIdArr="limitGroupIdArr"
              @GetSelectObj="GetSelectObj"
              @refreshLoading="refreshLoading"
              :loading='loading'
            ></component>
          </div>

          <ul class="menu" v-show="searchInput">
            <li class="active" v-for="item in searchMenuList" :key="item.path">
              {{ item.name }}
            </li>
          </ul>
          <div class="lists searchInfoClass" v-show="searchInput">
            <SearchInfo
              @GetSelectObj="GetSelectObj"
              ref="searchinfo"
              :showFriendflag="showFriendflag"
              :limitGroupIdArr="limitGroupIdArr"
              :keyword="searchInput"
            >
            </SearchInfo>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <CheckSelect
          v-if="dataup"
          :SelectObj.sync="SelectObj"
          @confirmDialogHand="confirmDialogHand"
          @cancelDialogHand="cancelDialogHand"
          @removeSelect="removeSelect"
        />
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import store from "@/store";
import FriendList from "./friendList";
import GroupList from "./groupList";
import RelationList from "./relationList";
import CheckSelect from "./checkSelect";
import SearchInfo from "./SearchInfo";
import DiscussionInfo from "./DiscussionInfo";
import transfer from "../../view/chat/transfer";
import { getSelfUserId } from "@/utils/const";
import { viewLimitGroupByUserId } from "../chat/server";
import UserInfoUtils from "@/utils/UserInfoUtils.js";
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    FriendList,
    GroupList,
    RelationList,
    CheckSelect,
    SearchInfo,
    DiscussionInfo,
  },
  props: {
    GroupInviteVisible: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    title: {
      type: String,
    },
    postcard: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    shareGroup: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    mergeTransfer: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    showAppealClosureNotice: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    mergeTransferName: {
      type: String,
      default: () => {
        return "";
      },
    },
    from: {
      type: String,
      default: () => {
        return "";
      },
    },
    discussionFriendId: {
      type: String,
      default: () => {
        return "";
      },
    },
    authStatus: {
      type: String,
      default: () => {
        return "";
      },
    },
    groupId: {
      type: String,
      default: () => {
        return "";
      },
    },
    groupInfo: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    //这里存放数据
    return {
      showFriendflag: false, //是否只展示好友列表
      menuList: [],
      comName: "",
      searchInput: "",
      SelectObj: [],
      dataup: false,
      comvisible: false,
      selectedIds: [],
      members: [],
      searchMenuList: [
        {
          active: true,
          name: "",
          path: "SearchInfo",
        },
      ],
      loading: false,
      limitGroupIdArr: [],
    };
  },
  //监听属性 类似于data概念
  computed: {},

  //监控data中的数据变化
  watch: {
    async GroupInviteVisible(val) {
      this.loading = true;
      if (val) {
        try {
          viewLimitGroupByUserId({
            userId: UserInfoUtils.getCurrentUserId(),
          }).then((res) => {
            if (res.code === "200") {
              this.limitGroupIdArr = res.data?.limitGroupId || [];
            }
            // this.loading = false;
          });
        } catch (error) {
          // this.loading = false;
        }
        if (this.title) {
          if (this.title == this.$t("Universal_0202")) {
            this.showFriendflag = false;
            this.members = [];
            this.Tocomponent("FriendList");
            this.menuList = [
              {
                active: true,
                name: this.$t("chat_select_chat_0009"),
                path: "FriendList",
              },
              {
                name: this.$t("chat_search_0003"),
                path: "RelationList",
              },
              {
                name: this.$t("chat_search_0005"),
                path: "GroupList",
              },
              {
                name: this.$t("chat_search_0007"),
                path: "DiscussionInfo",
              },
            ];
          } else if (this.title == this.$t("chat_comm_invite_0001")) {
            await store.dispatch("GET_MEM_LIST", this.groupId);
            this.members = store.state.search.membList.filter(
              (item) => item.is_show == "true"
            );
            this.Tocomponent("RelationList");
            this.showFriendflag = true;
            this.menuList = [
              {
                name: this.$t("Universal_0317"),
                path: "RelationList",
              },
            ];
          } else if (this.title == this.$t("chat_select_chat_0002")) {
            if (this.from == "single") {
              this.members = [{ id: this.discussionFriendId, is_show: "true" }];
            } else {
              await store.dispatch("GET_MEM_LIST", this.groupId);
              this.members = store.state.search.membList.filter(
                (item) => item.is_show == "true"
              );
            }
            this.Tocomponent("RelationList");
            this.menuList = [
              {
                name: this.$t("Universal_0317"),
                path: "RelationList",
              },
            ];
          }
        }
      }
    },
  },
  //方法集合
  methods: {
    Tocomponent(name) {
      this.loading = true;
      this.comName = name;
      // setTimeout(() => {
      //   this.$nextTick(() => {
      //     this.$refs.com.init(
      //       this.selectedIds,
      //       this.searchInput,
      //       this.members,
      //       this.showAppealClosureNotice
      //     );
      //   });
      // }, 700);
      this.$nextTick(() => {
        this.$refs.com.init(
          this.selectedIds,
          this.searchInput,
          this.members,
          this.showAppealClosureNotice
        );
      });

      for (let i in this.menuList) {
        if (this.menuList[i].path == name) {
          this.menuList[i].active = true;
        } else {
          this.menuList[i].active = false;
        }
      }
    },

    refreshLoading() {
      this.loading = false
    },

    cancelDialogHand() {
      this.$emit("cancelDialogHand", false);
    },
    async confirmDialogHand(obj) {
      const netStatus = store.state.common.netStatus;
      // if (netStatus == 'offline') {
      //   this.$emit("transferSuccess");
      //   this.closeDia();
      //   return;
      // }
      if (this.title == this.$t("Universal_0202")) {
        if (obj) {
          this.loading = true;
          let transferResult = "";
          for (let item of obj) {
            if (item.targetType == 2) {
              if (await this.isForbiddenWordsInGroup(item)) {
                continue;
              }
            }
            if (this.postcard) {
              await transfer.sendPostcard(item.friendId, item.targetType);
            } else if (this.shareGroup) {
              await transfer.sendShareGroup(item.friendId, item.targetType);
            } else if (this.mergeTransfer) {
              transferResult = await transfer.mergeTransfer(
                item.friendId,
                item.targetType,
                this.mergeTransferName
              );
              if (transferResult != "") {
                this.loading = false;
                const msg = this.$t("chat_0047");
                this.$alert(msg, this.$t("Universal_0059"), {
                  confirmButtonText: this.$t("book_group_0019"),
                  center: true,
                  showClose: true,
                  customClass: "message-box-class",
                }).then(() => {
                  setTimeout(() => {
                    this.$emit("transferSuccess");
                    this.closeDia();
                  }, 1);
                });
                return;
              }
            } else {
              await transfer.sendTxt(item.friendId, item.targetType);
            }
          }
          this.loading = false;
          if (netStatus != "offline" && transferResult != "") {
            this.$message({
              type: "success",
              message: this.$t("chat_0109"),
            });
          }
          this.$emit("transferSuccess");
          this.closeDia();
        }
      } else if (
        this.title == this.$t("chat_comm_invite_0001") ||
        this.title == this.$t("chat_select_chat_0002")
      ) {
        this.$emit("confirmDialogHand", obj);
      }
    },
    currentUserId() {
      return getSelfUserId();
    },
    async isForbiddenWordsInGroup(item) {
      let groupMember = await window.vm
        .$knex("t_groups_member")
        .where({ id: this.currentUserId() })
        .where("group_id", "=", item.friendId)
        .select();
      if (
        groupMember &&
        groupMember.length > 0 &&
        groupMember[0].auth_status != 3
      ) {
        return false;
      }
      let group = await window.vm
        .$knex("t_groups")
        .where("group_id", "=", item.friendId)
        .select();
      // let groupAuth = await window.vm.$knex("t_groups_member_auth")
      //   .where({ 'user_id': this.currentUserId() })
      //   .where('group_id', '=', item.friendId).select();
      if (
        groupMember[0].auth_status == 3 &&
        (group[0].forbiddenWordsStatus == 0 ||
          groupMember[0].forbiddenWordsStatus == 1)
      ) {
        return true;
      }
      return false;
    },
    closeDia() {
      this.searchInput = "";
      this.dataup = false;
      this.SelectObj = [];
      this.selectedIds.map((id) => this.removeSelect(id));
      this.selectedIds = [];
      this.$emit("cancelDialogHand", false);
    },
    GetSelectObj(obj) {
      let message = this.selectValidate(obj);
      if (message) {
        if (
          this.title == this.$t("chat_select_chat_0002") &&
          this.from == "discussion" &&
          this.authStatus == "1"
        ) {
          this.removeSelect(obj.id);
          this.openConfirmMessage(message);
          return;
        } else {
          this.removeSelect(obj.id);
          this.openMessage(message);
          return;
        }
      }
      let inSelect = this.SelectObj.filter((item) => item.id == obj.id);
      if (inSelect.length == 0) {
        this.SelectObj.push(obj);
        this.selectedIds.push(obj.id);
      } else {
        if (!obj.checked) {
          this.SelectObj = this.SelectObj.filter((item) => item.id != obj.id);
          this.selectedIds = this.selectedIds.filter((item) => item != obj.id);
        }
      }
      this.dataup = false;
      // let selected = obj.filter(item => item.checked == true);
      // if (selected.length > 9) {
      //   this.$message.warning('联系人不能超过9个')
      // } else {
      //   this.SelectObj = selected;
      // }
      this.$nextTick(() => {
        this.dataup = true;
      });
      this.$refs.com.init(this.selectedIds, this.searchInput, this.members);
    },
    selectValidate(obj) {
      console.log(
        this.authStatus,
        "authsataus",
        this.selectedIds,
        this.members,
        this.groupInfo
      );
      if (!this.members.length) {
        return "";
      }
      if (this.selectedIds.length == 9) {
        if (
          this.selectedIds.indexOf(obj.id) == -1 &&
          this.title == this.$t("Universal_0202")
        ) {
          return this.$t("Universal_0232");
        }
      }
      if (
        this.title == this.$t("chat_select_chat_0002") &&
        this.from == "single"
      ) {
        if (
          this.selectedIds.indexOf(obj.id) == -1 &&
          this.selectedIds.length + this.members.length >= 19
        ) {
          return this.$t("book_group_0006");
        }
      }
      if (
        this.title == this.$t("chat_select_chat_0002") &&
        this.from == "discussion"
      ) {
        if (
          this.selectedIds.indexOf(obj.id) == -1 &&
          this.selectedIds.length +
            this.members.filter((m) => m.is_show == "true").length >=
            20
        ) {
          return this.$t("book_group_0006");
        }
      }

      if (
        this.from == "group" &&
        this.selectedIds.indexOf(obj.id) == -1 &&
        this.selectedIds.length + this.members.length >=
          this.groupInfo.maxPeople
      ) {
        if (this.authStatus == "3") {
          return this.$t("chat_comm_member_0007", {
            max: this.groupInfo.maxPeople,
          });
        } else {
          return this.$t("chat_comm_member_0007", {
            max: this.groupInfo.maxPeople,
          });
          // return this.$t('chat_comm_member_0006');
        }
      }
      return "";
    },
    onFilter() {
      if (this.searchInput) {
        //显示搜索面板内容
        this.Tocomponent("SearchInfo");
        this.$nextTick(() => {
          this.$refs.searchinfo.search(this.selectedIds, this.members);
        });
      } else {
        if (
          this.title == this.$t("chat_comm_invite_0001") ||
          this.title == this.$t("chat_select_chat_0002")
        ) {
          this.Tocomponent("RelationList");
          this.$nextTick(() => {
            this.$refs.com.init(
              this.selectedIds,
              this.searchInput,
              this.members
            );
          });
        } else {
          this.Tocomponent("FriendList");
          this.$nextTick(() => {
            this.$refs.com.init(
              this.selectedIds,
              this.searchInput,
              this.members
            );
          });
        }
      }
      this.loading = false;
    },
    removeSelect(id) {
      this.SelectObj = this.SelectObj.filter((item) => item.id != id);
      this.selectedIds = this.selectedIds.filter((item) => item != id);
      if (this.searchInput) {
        this.$refs?.searchinfo?.removeSelectedItem(id);
      } else {
        this.$refs?.com?.removeSelectedItem(id);
      }
    },
    openMessage(msg) {
      this.$alert(msg, "", {
        confirmButtonText: this.$t("book_group_0019"),
        center: true,
        showClose: true,
        customClass: "message-box-class",
      });
    },
    openConfirmMessage(msg) {
      this.$confirm(msg, "", {
        confirmButtonText: this.$t("Universal_0045"),
        cancelButtonText: this.$t("Universal_0063"),
        center: true,
        showClose: true,
      })
        .then(() => {
          this.$emit("upgradeGroup");
        })
        .catch(() => {});
    },
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
  activated() {}, //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style>
.general-setting-wrap .upload-avatar-wrap .el-upload-list {
  display: none;
}
</style>
<style lang="less" scoped>
.lists {
  height: 295px;
  overflow-y: scroll;
}
.invite-mem-dialog-left,
.invite-mem-dialog-right {
  // padding: 0 15px;

  .invite-mem-list-item {
    margin-top: 20px;
  }
}
.invite-mem-dialog-left {
  min-height: 340px;
  height: 370px;
  overflow: hidden;

  /deep/ .el-input__inner,
  .el-textarea__inner {
    font-size: 12px;
    color: #999;
    background: #e6e6e6;
    font-weight: 400;
  }

  /dee/ .el-input__prefix {
    font-size: 16px;
    color: #999;
  }

  /deep/ .el-input__prefix,
  .el-input__suffix {
    top: 1px;
  }

  .inputIcon {
    width: 90%;
    margin: 0 5%;

    /deep/ .el-input__inner {
      background: #f7f7fa;
    }
    /deep/ .el-input__prefix {
      color: #999;
    }
  }
  .widthDt {
    width: 88%;
    margin: 14px 6%;
    padding: 0;
  }
}
.invite-mem-dialog-right {
  min-height: 340px;
  height: 370px;
  overflow-y: auto;
  .check-number {
    color: #333333;
    font-size: 14px;
    font-weight: 600;
    line-height: 40px;
  }
  .remove-mem-icon {
    display: none;
    font-size: 18px;
    color: #333333;
    font-weight: 600;
    margin-top: 2px;
  }
  .hover-icon:hover {
    .remove-mem-icon {
      display: block;
    }
  }
}
// .header-title {
//   margin-top: -5px;
// }
</style>
<style lang="less">
.invite-mem-dialog-con {
  .el-dialog__header {
    font-weight: 500;
    text-align: center;
    padding: 10px 20px 20px;
  }
  .header-title {
    height: 20px;
    line-height: 20px;
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
  .el-dialog__headerbtn {
    top: 12px;
  }
  .el-dialog__body {
    height: 410px;
    overflow-y: scroll;
    padding: 0;
  }
  .el-dialog__footer {
    padding-bottom: 10px;
  }
}

.menu {
  display: flex;
  margin: 14px 0;
  justify-content: space-between;
  padding: 0 5px;
  li {
    font-size: 13px;
    font-weight: 500;
    color: #999;

    &.active {
      color: #333;
      font-weight: 600;
    }
  }
}
.message-box-class {
  width: 280px;
}
.invite-mem-dialog-border {
  border-right: 1px solid #d8d8d8;
  height: 100%;
}
// .active {
//   font-weight: 700;
// }
.searchInfoClass {
  position: absolute;
  top: 42px;
  // width: 270px;
  width: 50%;
  height: 340px !important;
}
</style>
