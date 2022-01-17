<template>
  <div>
    <el-dialog
      :visible="cardDialogVisible"
      :width="dialogWidth"
      append-to-body
      :modal-append-to-body="false"
      :modal="false"
      @close="closeHandle"
      custom-class="member-card-dialog"
      >
   <member-info :user-id="userId"
                :groupId="groupId"
                :memberSingleChatStatus="memberSingleChatStatus"
                :authStatus="authStatus"
                @transferSuccess="transferSuccess"
                @toAppeal="toAppeal"
                ref="cardmemberinfo" @closeHandle="closeHandle" />
     </el-dialog>
  </div>
</template>

<script>
import { getSelfUserId } from '@/utils/const';
import MemberInfo from './MemberInfo';
export default {
  name: 'MemberCard',
  components: {
    MemberInfo
  },
  computed: {
    dialogWidth() {
      if (this.$i18n.locale.includes('zh')) {
        return '330px';
      } else {
        return '400px';
      }
    }
  },
  data() {
    return {
      region: '',
      userInfo: {},
      groupInfo: {},
      isCurrentUser: false,
      isEdit: false,
      isGroupMember: false,
      isGroupHolder: false,
      title: this.$t('Universal_0202'),
      GroupInviteVisible: false,
      postcard: true
    };
  },
  props: {
    cardDialogVisible: {
      type: Boolean,
      default() {
        return false;
      }
    },
    image: {
      type: String,
      default() {
        return '';
      }
    },
    userId: {
      type: String,
      default() {
        return '';
      }
    },
    groupId: {
      type: String,
      default() {
        return '';
      }
    },
    memberSingleChatStatus: {
      type: String,
      default() {
        return '1';
      }
    },
    authStatus: {
      type: String,
      default() {
        return '3';
      }
    }
  },
  methods: {
    closeHandle() {
      console.log('closeHandle');
      this.$nextTick(() => {
        this.$emit('handleclosecard');
      });
    },
    currentUserId() {
      return getSelfUserId();
    },
    async onCardShow() {
      this.$nextTick(() => {
        this.$refs.cardmemberinfo.onCardShow();
      });
    },
    onCardHide() {
      this.$refs.cardmemberinfo.onMemberInfoHide();
    },
    transferSuccess() {
      this.$parent.transferSuccess();
    },
    toAppeal() {
      this.$parent.toAppeal('single');
    },
  },

  created() {},
  updated() {}
};
</script>
<style>
.member-card-dialog {
  border-radius: 5px;
}

.member-card-dialog .el-dialog__header {
  padding: 5px;
}

.member-card-dialog .el-dialog__header button {
  margin-top: -8px;
  margin-right: -8px;
}

.member-card-dialog .el-dialog__body {
  padding: 5px;
}
</style>
<style scoped></style>
