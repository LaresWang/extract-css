<template>
  <div>
    <el-dialog
        :visible.sync="groupCardVisible"
      append-to-body
      :modal-append-to-body="false"
      :modal="false"
      @close="groupCardVisible = false"
      @open="onCardOpen"
      width="330px"
      custom-class="group-card-dialog"
      center
    >
      <div class="member-card">
        <el-row :gutter="20">
          <el-col :span="5">
            <img :src="findImage(groupInfo.groupAvatar)" class="group-avatar" alt="" />
          </el-col>
          <el-col :span="18">
            <el-row :gutter="20" class="item-spacing">
              <el-col :span="24">
                <div class="user-nick-name">
                  <span>{{ groupInfo.groupName }}</span>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20" class="item-spacing">
              <el-col :span="24">
                <div class="invite-code">ID: {{ groupInfo.groupCode }}</div>
              </el-col>
            </el-row>
            <el-row :gutter="20" type="flex" class="item-spacing" justify="space-butween">
              <el-col :span="9">
                <img src="../../../../assets/images/group_card_members.png" alt :title="$t('chat_comm_member_0003')" />
                {{ groupInfo.people }}
              </el-col>
              <el-col :span="14">
                <div v-if="groupInfo.groupStatus == 1">
                  <img src="../../../../assets/images/group_card_public.png" alt
                       :title="$t('chat_createcommunity_0008')" />
                  {{ $t('chat_createcommunity_0008') }}
                </div>
                <div v-else><img src="../../../../assets/images/group_card_private.png" alt
                                 :title="$t('chat_createcommunity_0009')" />
                 {{ $t('chat_createcommunity_0009') }}
                </div>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
        <el-divider></el-divider>

        <el-row :gutter="20" class="info-area item-spacing">
          <el-col :span="labelWidth">
            <span>{{ $t('Universal_0212') }}</span>
          </el-col>
          <el-col :span="valueWidth">
            <div>{{ groupInfo.region }}</div>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="info-area item-spacing">
          <el-col :span="labelWidth">
            <span>{{ $t('chat_comm_set_0002') }}</span>
          </el-col>
          <el-col :span="valueWidth">
            <div class="group-profile" :title="groupInfo.groupProfile">
              {{ groupInfo.groupProfile }}
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20" type="flex" class="icons-area" justify="end">
          <el-col :span="6" :offset="6"> </el-col>
          <el-col :span="4">
            <img src="../../../../assets/images/info_transmit.png" @click="transferCard" alt
                 :title="$t('Universal_0041')" />
          </el-col>
          <el-col :span="4" v-show="isGroupMember">
            <img src="../../../../assets/images/group_card_leave.png" alt
                 :title="$t('book_community_0011')" @click="toGroupChat" />
          </el-col>
          <el-col :span="4" v-show="!isGroupMember">
            <img src="../../../../assets/images/info_add_friend.png" alt
                 :title="$t('chat_joincommunity_0001')" @click="addToGroup" />
          </el-col>
        </el-row>
      </div>
    </el-dialog>
    <GroupAndInviteChat
      ref="groupInvite"
      :title="title"
      :postcard="postcard"
      :GroupInviteVisible.sync="GroupInviteVisible"
      @confirmDialogHand="confirmDialogHand"
      @cancelDialogHand="cancelDialogHand"
      @transferSuccess="transferSuccess"
    />
    <AddFriGrop v-if="addOrderVisible" :visible.sync="addOrderVisible" :inviteCode="groupInfo.groupCode" index="1" />
  </div>
</template>

<script>
import fileOperational from '@/services/fileOperational';
import GroupAndInviteChat from '@/components/chat/GroupAndInviteChat';
import { ser_group_member } from '../member/server';
import { getSelfUserId } from '@/utils/const';
import { mapMutations } from 'vuex';
import { contGrpSize } from '@/utils';
import AddFriGrop from '@/view//add-friends-group/add';
import { CLEAR_CHAT } from '@/store/types';

export default {
  name: 'GroupShare',
  components: {
    GroupAndInviteChat,
    AddFriGrop
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
      groupCardVisible: false,
      title: this.$t('Universal_0202'),
      GroupInviteVisible: false,
      postcard: true,
      isGroupMember: false,
      addOrderVisible: false
    };
  },
  computed: {
    labelWidth() {
      if (this.$i18n.locale.includes('zh')) {
        return 6;
      } else {
        return 14;
      }
    },
    valueWidth() {
      if (this.$i18n.locale.includes('zh')) {
        return 18;
      } else {
        return 10;
      }
    }
  },
  methods: {
    ...mapMutations([CLEAR_CHAT]),
    onPop() {
      this.groupCardVisible = true;
    },
    onClose() {
      this.groupCardVisible = false;
    },
    findImage(image) {
      return fileOperational.getImage(image, true);
    },
    confirmDialogHand() {
      this.GroupInviteVisible = false;
    },
    cancelDialogHand() {
      this.GroupInviteVisible = false;
    },
    async transferCard() {
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
    async onCardOpen() {
      let res = await ser_group_member({
        gId: this.groupInfo.id
      });
      if (res.code == '200') {
        let result = res.data.filter(item => item.userId == getSelfUserId());
        this.isGroupMember = result.length > 0;
      }
    },
    toGroupChat() {
      this.groupCardVisible = false;
      this.CLEAR_CHAT();
      let current = {
        targetId: this.groupInfo.id,
        id: this.groupInfo.id,
        uniqueCode: contGrpSize(this.groupInfo.id),
        sessionName: this.groupInfo.groupName,
        sessionIcon: this.groupInfo.groupAvatar,
        fromName: this.$store.state.common.userInfo.nickName,
        targetType: 2, //单聊
        msgType: 1, //默认文本
        fromType: '999',
        groupType: 1
      };
      this.$store.dispatch('ADD_LAST_MSG_LIST', { ...current, isJump: true });
      this.$store.dispatch('SET_CURRENT_CHAT', current);

      this.$router.push({
        path: '/app/chat/group/message',
        query: {
          id: this.groupInfo.id,
          targetId: this.groupInfo.id,
          timer: new Date().getTime(),
          friendName: encodeURI(this.groupInfo.groupName),
          uniqueCode: contGrpSize(this.groupInfo.id),
          groupType: 1
        }
      });
    },
    addToGroup() {
      this.groupCardVisible = false;
      this.addOrderVisible = true;
    },
    transferSuccess() {
      this.$parent.transferSuccess();
    }
  }
};
</script>

<style>
.group-card-dialog {
  border-radius: 5px;
}

.group-card-dialog .el-dialog__header {
  padding: 5px;
}

.group-card-dialog .el-dialog__header button {
  margin-top: -8px;
  margin-right: -8px;
}

.group-card-dialog .el-dialog__body {
  padding: 10px;
}

.group-card-dialog .el-divider {
  margin-bottom: 30px;
}
</style>

<style scoped>
.member-card {
  padding: 10px 15px;
  color: #333333;
  font-size: 12px;

  font-weight: 400;
  user-select: text;
}

.item-spacing {
  margin-bottom: 10px;
}

.item-spacing img {
  margin-bottom: -3px;
}

.info-area span {
  width: 100%;
  display: inline-block;
  text-align: right;
  color: #999999;
}

.user-nick-name {
  font-size: 16px;
  font-weight: bold;
  width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-nick-name span {
  user-select: text;
}

.gender {
  float: right;
  margin-top: -20px;
}

.invite-code {
  font-size: 12px;
  color: #999999;
  user-select: text;
}

.icons-area {
  margin-top: 30px;
}

.member-card img {
  width: 18px;
  height: 18px;
}
.icons-area img {
  width: 22px;
  height: 22px;
}
.gender img {
  width: 24px;
  height: 24px;
}

.member-card .group-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
.group-profile {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
