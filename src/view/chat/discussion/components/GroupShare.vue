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
      width="250px"
      center
    >
      <div class="content">
        <el-row :gutter="20" type="flex" justify="end">
          <el-col :span="10">
            <div class="didi-friend">
              <img src="../../../../assets/images/share_didifriend.png" @click="shareFriend" alt />
            </div>
            <div>
              <span>{{ $t('Universal_0268') }}</span>
            </div>
          </el-col>
          <el-col :span="11">
            <div class="copy-link" v-clipboard:copy="linkUrl" v-clipboard:success="onCopy">
              <img src="../../../../assets/images/share_copylink.png" alt />
            </div>
            <div>
              <span>{{ $t('opinions_0035') }}</span>
            </div>
          </el-col>
        </el-row>
        <el-divider class="group-el-divider" />
        <div class="qr-code">
          <div class="group-id">
            <span>{{ $t('book_community_0007') }}: {{ groupInfo.groupCode }}</span>
          </div>
          <div>
            <span class="add-group">{{ $t('chat_comm_set_0032') }}</span>
          </div>
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
      }
    }
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
      // this.linkUrl = `${baseUrl}/#/invite/groups?userId=${userInfo.id}&inviteCode=${userInfo.inviteCode}
      //   &groupCode=${this.groupInfo.groupCode}&groupId=${this.groupInfo.id}&language=${language}
      //   &nickName=${userInfo.userNickName}&category=fgg`;
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

<style scoped>
.content {
  color: #333333;
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
.group-id span {
  font-size: 14px;
  user-select: text;
  font-weight: 600;
}
.add-group {
  font-size: 12px;
  color: #666666;
}
.didi-friend,
.copy-link {
  cursor: pointer;
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
