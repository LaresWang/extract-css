import { contGrpSize } from '@/utils';
import { quitGroup, releaseGroup } from "../../chat/server";
import SQLUtils from "@/components/db/sqlite.js";
export default {
  data() {
    return {
      myAuthStatus: 3,//社区、讨论组中我的角色
      currentDiscussionInfo: {},//右键菜单 讨论组升级
    }
  },
  computed: {
    groupLabel() {
      return this.groupType == 1 ? this.$t('chat_search_0005') : this.$t('chat_search_0007')
    },
    contextMenulabel() {
      let msg = '';
      if (this.groupType == 1) {
        // 社区
        msg = this.myAuthStatus == 1 ? this.$t('chat_comm_set_0004') : this.$t('chat_comm_set_0006');
      } else {
        // 讨论组
        msg = this.myAuthStatus == 1 ? this.$t('book_group_0010') : this.$t('book_group_0008');
      }
      return msg;
    },
    alertTips() {
      let msg = '';
      if (this.groupType == 1 ) {
        // 社区
        msg = this.myAuthStatus == 1 ? this.$t('chat_comm_set_0005') : this.$t('chat_comm_set_0007');
      } else {
        // 讨论组
        msg = this.myAuthStatus == 1 ? this.$t('book_group_0011') : this.$t('book_group_0009');
      }
      return msg;
    },
  },
  methods: {
    async rightClick(item) {
      let userId = localStorage.getItem('userId');
      if (!item['groupId'] || !userId) return;
      //讨论组升级 GroupUpgrade 组件需要id
      this.currentDiscussionInfo = Object.assign({}, item, { id: item.groupId });
      // 获取当前库中最新的角色状态
      let SELECT_SQL = `select auth_status from t_groups_member where group_id='${item.groupId}' and id='${userId}'`
      let arr = await window.vm.$knex.raw(SELECT_SQL);
      this.myAuthStatus = arr?.[0]?.auth_status || item['status'] || 3;
      // console.warn(arr?.[0]?.auth_status, item)
      // 讨论组升级
      let gradeArr = [];
      if (this.groupType == "0" && this.myAuthStatus == 1) {
        gradeArr.push(
          {
            name: this.$t('book_group_0012'),
            fun: () => {
              this.$refs?.groupUpgrade?.onPop();
            }
          }
        )
      }
      const menu = [
        {
          name: this.$t('Universal_0359'),
          fun: () => {
            this.sendMsg(item);
          }
        },
        ...gradeArr,
        {
          name: this.contextMenulabel,
          fun: () => {
            this.handleGroupOperation(item.groupId);
          }
        }
      ];
      return this.$RightClick(menu).popup({
        window: this.$remote.getCurrentWindow()
      });
    },
    sendMsg(item) {
      let current = {
        targetId: item.groupId,
        id: item.groupId,
        uniqueCode: contGrpSize(item.groupId),
        sessionName: item.groupName,
        sessionIcon: item.groupAvatar,
        fromName: this.$store.state.common.userInfo.nickName,
        targetType: 2,
        msgType: 1,
        fromType: '999',
        groupType: this.groupType
      };
      this.$store.dispatch('ADD_LAST_MSG_LIST', { ...current, isJump: true });
      this.$store.dispatch('SET_CURRENT_CHAT', current);
      this.$router.push({
        name: this.groupType == 1 ? 'group-message' : 'discussion-message',
        query: current
      });
    },
    // 解散、退出社区或讨论组
    async handleGroupOperation(gId) {
      this.$confirm(this.alertTips, this.$t('Universal_0059'), {
        confirmButtonText: this.$t('Universal_0062'),
        cancelButtonText: this.$t('Universal_0063'),
        type: 'warning'
      })
        .then(async () => {
          let res;
          if (this.myAuthStatus == 1) {
            // 解散
            res = await releaseGroup({ gId })
          } else {
            // 主动退出社区、讨论组
            res = await quitGroup({ gId })
          }
          let { code, msg, data } = res;
          // console.warn(res);
          if (code == '200') {
            this.$message.success(msg);
            this.deleteTableById(gId);
          } else {
            this.$message.error(msg || data?.msg || data?.data);
            this.$store.dispatch("GET_GROUP_LIST");
          }
        })
        .catch(() => {
          // this.$message({
          //   type: 'info',
          //   message: '已取消操作'
          // });
        });
    },
    async deleteTableById(gId) {
      await SQLUtils.deleteGroupsById(gId);
      await SQLUtils.deleteGroupsMember(gId);
      await SQLUtils.deleteSessionsById(gId);
      await SQLUtils.deleteGroupsAppealById(gId);
      if (this.groupType == 1) {
        await SQLUtils.deleteGroupsExceedById(gId);
      }
      this._updateContactListAndRouter(gId);
    },
    //退出、解散社区、讨论组，讨论组升级社区 成功路由处理
    _updateContactListAndRouter(id) {
      // this.currentDiscussionInfo['groupId']  
      if (id == this.$route.query?.id) {
        this.$router.push({ name: 'contact' });
      }
      this.$store.dispatch("GET_GROUP_LIST");//查询群聊列表、 讨论组列表
    }
  },
}
