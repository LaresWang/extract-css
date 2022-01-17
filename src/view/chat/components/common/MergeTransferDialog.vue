<template>
  <div>
    <el-dialog
      v-dialogDrag
      :title="title ? $t('chat_0042',{user:title}) : $t('chat_0043')"
      @open="onOpen"
      :visible.sync="mergeTransferMessageVisible"
      append-to-body
      :modal-append-to-body="false"
      :modal="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="640px"
      custom-class="merge-transfer-el-dialog"
      center
    >
      <div class="share">
        <img src="../../../../assets/images/chat_record_share.png" @click="shareToFriend" />
      </div>

      <div class="flex flex-direction">
        <span class="content">
          <ul>
            <li v-for="item in msgItem.msgBody.msgs" :key="item.timestamp">
              <div class="itemClass">
                <DiDiServiceIcon v-if="isDiDiService(item.fromId)" :id="item.fromId" />
                <MemberIcon
                  v-else
                  :image="item.fromIcon || require('../../../../assets/images/default.png')"
                  :userRank="+item.userRank"
                  :vipType="+item.vipType"
                  type="medium"
                />
                <div class="itemDetail">
                  <div class="name-time">
                    <span class="name">
                      <span class="fromName blank">{{ item.fromName || '' }}</span>

                      <LuckIdIcon
                        v-if="item.inviteCodeType == 1 && +item.userRank > 0"
                        :inviteCode="item.inviteCode"
                        :userRank="+item.userRank"
                        iconType="large"
                        :vipType="+item.vipType"
                        :inviteCodeType="+item.inviteCodeType"
                        :listFlag="false"
                        class="blank"
                      />
                      <LevelIcon
                        v-if="!isDiDiService(item.fromId) && +item.userRank > 0"
                        :inviteCode="item.inviteCode"
                        :userRank="+item.userRank"
                        iconType="large"
                        :vipType="+item.vipType"
                        :inviteCodeType="+item.inviteCodeType"
                      />
                    </span>
                    <span class="time">{{ massageTime(item.timestamp) }}</span>
                  </div>
                  <div @click="clickItem(item)">
                    <MessageFormat v-bind:item="item" :parentMsgId="parentMsgId" />
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </span>
      </div>
    </el-dialog>
    <GroupAndInviteChat
      ref="groupInvite"
      :title="$t('Universal_0202')"
      :GroupInviteVisible.sync="GroupInviteVisible"
      @confirmDialogHand="confirmDialogHand"
      @cancelDialogHand="cancelDialogHand"
      @transferSuccess="transferSuccess"
    />
  </div>
</template>

<script>
import fileOperational from '@/services/fileOperational';
import GroupAndInviteChat from '@/components/chat/GroupAndInviteChat';
// import MessageFormat from "@/view/chat/components/common/MessageFormat";
import MemberIcon from '@/components/memberIcon/MemberIcon';
import LevelIcon from '@/components/memberIcon/LevelIcon';
import LuckIdIcon from '@/components/memberIcon/luckIdIcon';
import DiDiServiceIcon from '@/view/chat/components/common/DiDiServiceIcon';
import moment from 'moment';
import { checkkArrProps } from "@/utils";
export default {
  name: 'MergeTransferDialog',
  components: {
    GroupAndInviteChat,
    MessageFormat: () => import('./MessageFormat'),
    MemberIcon,
    LevelIcon,
    LuckIdIcon,
    DiDiServiceIcon
  },
  props: {
    parentMsgId:{type:String},
    title: {
      type: String,
      default() {
        return '';
      }
    },
    msgItem: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      mergeTransferMessageVisible: false,
      GroupInviteVisible: false
    };
  },
  computed: {
    massageTime() {
      return timestamp => {
        return moment(timestamp).format('MM-DD HH:mm');
      };
    },
    isDiDiService() {
      return id => {
        return id == '1032384035881537536' || id == '1008455862495526912' || id == this.$paymentId;
      };
    }
  },
  methods: {
    findImage(image) {
      return fileOperational.getImage(image);
    },
    getFileType(format) {
      this.$parent.getFileType(format);
    },
    onMergeTransferDisplay() {
      this.mergeTransferMessageVisible = true;
    },
    onClose() {
      this.mergeTransferMessageVisible = false;
    },
    onCancel() {
      this.mergeTransferMessageVisible = false;
    },
    onSubmit() {
      this.mergeTransferMessageVisible = false;
    },
    onOpen() {},
    async shareToFriend() {
      this.GroupInviteVisible = true;
      console.log('shareToFriend ======= ', this.msgItem);
      await this.$store.commit('SET_TRANSFER_ITEM', [this.msgItem]);
    },
    getCardItem() {
      return {};
    },
    confirmDialogHand() {
      this.GroupInviteVisible = false;
    },
    cancelDialogHand() {
      this.GroupInviteVisible = false;
    },
    transferSuccess() {
      this.GroupInviteVisible = false;
      this.cardDialogVisible = false;
    },
    clickItem(item) {
      if (item.msgType == '2' || item.msgType == '10') {
        this.viewerShow(item);
      }
    },
    viewerShow(item) {
      if (item.msgType == '2') {
        let imglsitTmp;
        imglsitTmp = this.msgItem.msgBody.msgs.filter(item => {
          if (item.msgType == '2') {
            return true;
          }
        });
        imglsitTmp = imglsitTmp.map(item => {
          let img = {};
          img.url = item.msgBody.localId || item.msgBody.mediaId;
          img.reqId = item.reqId;
          img.msgBody = item.msgBody;
          img.msgId = item.msgId;
          img.fromId = item.fromId;
          img.targetId = item.targetId;
          return img;
        });
        let index = imglsitTmp.findIndex(img => {
          return item.reqId == img.reqId;
        });
        this.$nextTick(() => {
          this.openMediaViewer(item.msgType, imglsitTmp, index);
        });
      } else if (item.msgType == '10') {
        this.$nextTick(() => {
          const { ipcRenderer } = require('electron');
          ipcRenderer.send('media-viewer', {
            msgType: item.msgType,
            item
          });
        });
      }
    },
    openMediaViewer(msgType, imgList, index) {
      const { ipcRenderer } = require('electron');
      const flag = checkkArrProps(imgList, 'msgBody')
      console.log('flag ====> imgList 存在undefind ', flag);
      if (flag) {
        ipcRenderer.send('media-viewer', { msgType, imgList, index });
      }
    }
  }
};
</script>
<style>
.merge-transfer-el-dialog .el-dialog__header {
  padding: 15px 0;
}
.merge-transfer-el-dialog {
  border-radius: 10px;
  background: #f8f8f8;
  -webkit-app-region: no-drag;
}
.merge-transfer-el-dialog .el-dialog__header span {
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  /*max-width: 450px;*/
  /*display: inline-block;*/
  /*overflow: hidden;*/
  /*text-overflow: ellipsis;*/
  /*white-space: nowrap;*/
}
.merge-transfer-el-dialog .el-dialog__body {
  padding: 5px 20px;
}
</style>
<style lang="less" scoped>
.merge-transfer-el-dialog {
  position: relative;
  .share {
    position: absolute;
    top: 20px;
    left: 575px;
    img {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
  }
  .content {
    max-height: 400px;
    overflow-y: scroll;
    .fromIcon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }
    .itemClass {
      display: flex;
      flex-direction: row;
      padding: 10px 0;
      .itemDetail {
        display: flex;
        flex-direction: column;
        margin-left: 20px;
        // width: 100%;
        width: calc( 100% - 62px );
        justify-content: space-evenly;
        justify-content: space-evenly;
        padding-bottom: 25px;
        border-bottom: 1px solid #d8d8d8;
        /deep/ .imgMsg>img{
          max-width: 100%;
        }
        .name-time {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          padding-bottom: 5px;
          // margin-right: 7px;
          .name {
            display: flex;
            flex-direction: row;
            align-items: center;
            .fromName {
              font-size: 14px;
              color: #999999;
            }
            .blank {
              padding-right: 5px;
            }
          }
          .time {
            font-size: 12px;
            color: #999999;
          }
        }
        .message-text {
          color: #333333;
        }
      }

      /deep/ .miniVip{
        bottom: 0;
        top: 26px;
      }
    }
  }
}
</style>
