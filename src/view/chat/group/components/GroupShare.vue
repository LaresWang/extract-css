<template>
  <div>
    <el-dialog
      class="shareChat"
      :title="$t('chat_comm_manage_0032')"
      :visible.sync="shareDialogVisible"
      append-to-body
      :modal-append-to-body="false"
      :modal="false"
      @close="onClose"
      @open="onGroupShareOpen"
      width="270px"
      center
    >
      <div class="content">
        <div class="type-list">
          <div class="type-item">
            <div class="didi-friend">
              <img src="../../../../assets/images/share_didifriend.png" @click="shareFriend" alt />
            </div>
            <span>{{ $t('Universal_0268') }}</span>
          </div>
          <div class="type-item">
            <div class="copy-link" v-clipboard:copy="linkUrl" v-clipboard:success="onCopy">
              <img src="../../../../assets/images/share_copylink.png" alt />
            </div>
            <span>{{ $t('opinions_0035') }}</span>
          </div>
        </div>
        <el-divider class="group-el-divider" />
        <div class="qr-code">
          <div class="group-id">
            <span>{{ $t('book_community_0007') }}: </span>
            <div>{{ groupInfo.groupCode }}</div>
          </div>
          <div class="add-group">{{ $t('chat_comm_set_0032') }}</div>
        </div>
      </div>
    </el-dialog>
    <GroupAndInviteChat
      ref="groupInvite"
      :title="title"
      :postcard="true"
      :GroupInviteVisible.sync="GroupInviteVisible"
      @confirmDialogHand="confirmDialogHand"
      @cancelDialogHand="cancelDialogHand"
    />
  </div>
</template>

<script>
import GroupAndInviteChat from '@/components/chat/GroupAndInviteChat';
import { get_friend_user_info } from '@/server.js';
import { getSelfUserId } from '@/utils/const';
import bus from '@/utils/eventbus';

export default {
  name: 'GroupShare',
  components: {
    GroupAndInviteChat
  },
  props: {
    groupInfo: {
      type: Object,
      default() {
        return {};
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
      shareDialogVisible: false,
      GroupInviteVisible: false,
      title: this.$t('Universal_0202'),
      linkUrl: ''
    };
  },
  mounted() {
    bus.$on('groupShareClose', this._groupShareClose);
  },
  methods: {
    _groupShareClose(msg){
      this.shareDialogVisible = msg;
    },
    onPop() {
      //判断是否存在被限制社交及群封停状态
      if(this.$store.state.common.personalAppealInfo.endTime){
        let time = `${this.$store.state.common.personalAppealInfo.createTime}
        --${this.$store.state.common.personalAppealInfo.endTime}`;
        this.$confirm(this.$t('appeal_0003', {time}),
          this.$t('Universal_0059'),{
            confirmButtonText: this.$t('appeal_0017'),
            cancelButtonText: this.$t('book_group_0019'),
            center: true,
            showClose: false,
          }).then(() => {
          this.$emit('toAppeal');
        }).catch(() => {
        });
        return;
      }
      if(this.showAppealClosureNotice) return this.$message.error(this.$t('appeal_0013'));
      this.shareDialogVisible = true;
    },
    onClose() {
      this.shareDialogVisible = false;
      this.$emit('groupInfoClose');
    },
    async shareFriend() {
      this.GroupInviteVisible = true;
      await this.$store.commit('SET_TRANSFER_ITEM', [this.getCardItem()]);
    },
    currentUserId() {
      return getSelfUserId();
    },
    async onGroupShareOpen() {
      // let language = this.$i18n.locale;
      let res = await get_friend_user_info({ id: this.currentUserId() });
      let userInfo = res.data;
      let baseUrl = process.env.VUE_APP_SHARE;
      // this.linkUrl = `${baseUrl}/#/invite/groups?userId=${userInfo.id}
      //   &inviteCode=${userInfo.inviteCode}&groupCode=${this.groupInfo.groupCode}
      //   &groupId=${this.groupInfo.id}&language=${language}&nickName=${userInfo.userNickName}&category=fgg`;
      this.linkUrl = `${baseUrl}/#/invite/groups?i=${userInfo.inviteCode}&g=${this.groupInfo.groupCode}`;
      this.linkUrl = encodeURI(this.linkUrl);
    },
    onCopy() {
      this.$message.success(this.$t('chat_0026'));
    },
    async transferCard() {
      this.GroupInviteVisible = true;
      await this.$store.commit('SET_TRANSFER_ITEM', [this.getCardItem()]);
    },
    getCardItem() {
      return {
        code: this.groupInfo.groupCode,
        name: this.groupInfo.groupName,
        msgUrl: this.groupInfo.groupAvatar,
        id: this.groupInfo.id,
        type: '2',
        originTypePsw: true
      };
    },
    confirmDialogHand() {
      this.GroupInviteVisible = false;
    },
    cancelDialogHand() {
      this.GroupInviteVisible = false;
    }
  },
  beforeDestroy(){
    bus.$off('groupShareClose', this._groupShareClose);
  }
};
</script>

<style scoped lang="less">
.content {
  color: #333333;
  .type-list {
    display: flex;
    align-items: flex-start;
    .type-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      span {
        text-align: center;
      }
    }
  }
}
.content img {
  margin-bottom: 3px;
}
.content span {
  font-size: 12px;
  padding-left: 5px;
}
.group-el-divider {
  margin: 15px 0;
}
.qr-code {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #333333;
}
.qr-code img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}
.group-id {
  width: 190px;
  margin: 10px auto;
  padding: 15px 0;
  background: #F7F7F7;
  text-align: center;
  border-radius: 8px;
}
.group-id div {
  font-size: 18px;
  user-select: text;
  font-weight: 600;
  line-height: 36px;
}
.add-group {
  width: 190px;
  text-align: center;
  font-size: 12px;
  color: #666666;
}
</style>

<style lang="less" scoped>
.shareChat {
  /deep/ .el-dialog__header {
    padding: 10px 20px;
  }
  /deep/ .el-dialog__title {
    font-size: 14px;

    font-weight: 600;
    color: #333;
  }

  /deep/ .el-dialog__headerbtn {
    top: 13px;
  }

  /deep/ .el-dialog__headerbtn .el-dialog__close {
    color: #000;
  }

  /deep/ .el-dialog__body {
    padding: 20px 20px 30px;
  }

  /deep/ .el-divider {
    background: #d8d8d8;
  }
}
</style>
