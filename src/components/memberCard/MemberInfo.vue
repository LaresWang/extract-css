<template>
  <div class="member-card noDrag" @click="memberInfoClick($event)">
    <el-row :gutter="20">
      <el-col :span="5">
        <span @click="openImgView">
            <MemberIcon    
              :image="userInfo.userHeadImg" 
              iconType="medium" 
              :userRank="userInfo.userRank" 
              :vipType="userInfo.vipType" 
            />
        </span>
      </el-col>
      <el-col :span="18" class="mar-t-5">
        <el-row :gutter="20" class="item-spacing">
          <el-col :span="24">
            <div class="user-nick-name" :title="userInfo.userNickName">
              <span v-show="!isCurrentUser" class="friend-nick-name">{{ userInfo.userNickName }}</span>
              <editable-input
                  v-show="isCurrentUser"
                  class="mar-b--4"
                  :target-value="userInfo.userNickName"
                  target-label="nickName"
                  @updateUserInfo="updateUserInfo"
                  maxsize="18"
              />
              <LevelIcon
                :inviteCode="userInfo.inviteCode"
                :userRank="userInfo.userRank"
                iconType="large"
                :vipType="userInfo.vipType"
                :inviteCodeType="userInfo.inviteCodeType"
              />
            </div>
            <!-- <div class="gender" v-show="!isCurrentUser">
              <img
                src="../../assets/images/sex_boy.png"
                v-if="userInfo.gender === 1"
                title="男"
              />
              <img
                src="../../assets/images/sex_girl.png"
                v-else-if="userInfo.gender === 2"
                title="女"
              />
            </div> -->
          </el-col>
        </el-row>
        <el-row :gutter="20" class="item-spacing">
          <el-col :span="24">
            <div class="invite-code">
              <!-- ID: {{userInfo.inviteCode}} -->
              <LuckIdIcon
                :listFlag="false"
                :vipType="userInfo.vipType"
                :inviteCodeType="userInfo.inviteCodeType"
                :inviteCode="userInfo.inviteCode"
                :userRank="userInfo.userRank"
                iconType="large"
              />
            </div>
          </el-col>
        </el-row>
        <!--        <el-row :gutter="5" type="flex" class="item-spacing item-card" justify="space-around">-->
        <!--          <el-col :span="8">-->
        <!--            <img src="../../assets/images/pminfo_badge.png" title="等级"> LV{{userInfo.level}}-->
        <!--          </el-col>-->
        <!--          <el-col :span="8">-->
        <!--            <img src="../../assets/images/pminfo_diamond.png" title="算力"> {{userInfo.computingPower}}-->
        <!--          </el-col>-->
        <!--          <el-col :span="8">-->
        <!--            <img src="../../assets/images/pminfo_look.png" title="看点"> {{userInfo.invitationCount}}篇-->
        <!--          </el-col>-->
        <!--        </el-row>-->
      </el-col>
    </el-row>
    <el-divider></el-divider>
    <el-row :gutter="20" class="info-area item-spacing" v-if="isMemberInGroup && isGroupHolder">
      <el-col :span="8">
        <!-- 社区成员备注 -->
        <span>{{ $t('book_friend_0003') }}</span>
      </el-col>
      <el-col :span="16" class="item-notes">
        <editable-input
          :target-value="memberNotes"
          target-label="memberNotes"
          :place-holder="$t('book_friend_0003')"
          @updateUserInfo="updateUserInfo"
          maxsize="6"
          lengthByString
          noMinimum
        />
      </el-col>
    </el-row>
    <el-row :gutter="20" class="info-area item-spacing" v-if="userInfo.isFriend">
      <el-col :span="8">
        <!-- 备注 -->
        <span>{{ $t('Universal_0185') }}</span>
      </el-col>
      <el-col :span="16" class="item-notes">
        <editable-input
          :target-value="userInfo.friendNotes"
          target-label="friendNotes"
          :place-holder="$t('Universal_0372')"
          @updateUserInfo="updateUserInfo"
          maxsize="18"
          :errMsg="$t('Universal_0226')"
        />
      </el-col>
    </el-row>
    <el-row :gutter="20" class="info-area item-spacing">
      <el-col :span="8">
        <!-- 性别 -->
        <span>{{ $t('my_information_0009') }}</span>
      </el-col>
      <el-col :span="16" v-if="isCurrentUser">
        <editable-radio
          :target-value="userInfo.gender === 1 ? $t('my_information_0010') : userInfo.gender === 2 ? $t('my_information_0011') : ''"
          id="editable-radio"
          target-label="gender"
          :radio-edit="false"
          :is-current-user="isCurrentUser"
          class="editable-radio"
          @updateUserInfo="updateUserInfo"
          ref="editablegender"
        />
      </el-col>
      <el-col :span="16" v-else>
        <p>{{ userInfo.gender === 1 ? $t('my_information_0010') : userInfo.gender === 2 ? $t('my_information_0011') : '' }}</p>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="info-area item-spacing">
      <el-col :span="8">
        <!-- 地区 -->
        <span>{{ $t('Universal_0212') }}</span>
      </el-col>
      <el-col :span="16" >
        <editable-select
          :target-value="region"
          target-label="region"
          @updateUserInfo="updateUserInfo"
          :is-current-user="isCurrentUser"
          :country="userInfo.areaCountryCode"
          :city="userInfo.areaCityCode"
          ref="editableregion"
        />
      </el-col>
    </el-row>
    <el-row :gutter="20" class="info-area item-spacing">
      <el-col :span="8">
        <!-- 个性签名 -->
        <span>{{ $t('my_information_0012') }}</span>
      </el-col>
      <el-col :span="16">
        <editable-text-area
          :target-value="userInfo.personalSign"
          target-label="personalSign"
          :is-current-user="isCurrentUser"
          @updateUserInfo="updateUserInfo"
          maxsize="15"
        />
      </el-col>
    </el-row>
    <el-row :gutter="20" type="flex" class="icons-area" justify="end">
      <el-col :span="6" :offset="6"> </el-col>
      <el-col :span="3">
        <img src="../../assets/images/info_transmit.png" @click="transferCard" alt="" :title="$t('Universal_0041')" />
      </el-col>
      <el-col :span="3" v-show="userInfo.isFriend">
        <img src="../../assets/images/info_message.png" @click="goToChat" alt="" :title="$t('Universal_0359')" />
      </el-col>
      <el-col :span="3" v-show="userInfo.isFriend" style="padding-left:8px;">
        <img src="../../assets/images/info_del_friend.png" @click="deleteFriend" alt="" :title="$t('book_friend_0018')" />
      </el-col>
      <el-col :span="3" v-show="!(userInfo.isFriend || isCurrentUser)">
        <img src="../../assets/images/info_add_friend.png" @click="addFriend" alt="" :title="$t('chat_addfriend_0001')" />
      </el-col>
    </el-row>
    <GroupAndInviteChat
      ref="groupInvite"
      :title="title"
      :postcard="postcard"
      :GroupInviteVisible.sync="GroupInviteVisible"
      @confirmDialogHand="confirmDialogHand"
      @cancelDialogHand="cancelDialogHand"
      @transferSuccess="transferSuccess"
    />
    <AddFriGrop
      v-if="addOrderVisible"
      :visible.sync="addOrderVisible"
      @handCloseFri="handCloseFri"
      :inviteCode="userInfo.inviteCode"
      :index="0"
    />
  </div>
</template>

<script>
import {
  get_country_area,
  get_friend_user_info,
  set_member_notes,
  set_user_nickname,
  delete_friend,
  set_user_personal_sign,
  set_user_gender,
  set_user_area
} from '@/server.js';
import EditableInput from './EditableInput';
import EditableTextArea from './EditableTextArea';
import EditableRadio from './EditableRadio';
import MemberIcon from '@/components/memberIcon/MemberIcon';
import LevelIcon from '@/components/memberIcon/LevelIcon';
import LuckIdIcon from '@/components/memberIcon/luckIdIcon';
import { ser_group_infoById } from '@/view/chat/group/information/server';
import fileOperational from '@/services/fileOperational';
import { getSelfUserId } from '@/utils/const';
import GroupAndInviteChat from '@/components/chat/GroupAndInviteChat';
import SQLUtils from '@/components/db/sqlite.js';
import { convertToPinyin } from '@/utils/pinyin';
import store from '@/store';
import { mapActions, mapMutations, mapState } from 'vuex';
import { update_person_info } from '../../view/chat/group/member/server';
import EditableSelect from './EditableSelect';
import AddFriGrop from '@/view//add-friends-group/add';
import { CLEAR_CHAT } from '@/store/types';
import { contFriSize } from '@/utils';
import { GET_USER_INFO } from '../../store/types';

import  { imgView } from '@/utils/util.js'

export default {
  name: 'MemberInfo',
  components: {
    EditableSelect,
    EditableInput,
    GroupAndInviteChat,
    EditableTextArea,
    EditableRadio,
    AddFriGrop,
    MemberIcon,
    LevelIcon,
    LuckIdIcon
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
      isMemberInGroup: false,
      memberNotes: '',
      title: this.$t('Universal_0202'),
      GroupInviteVisible: false,
      postcard: true,
      addOrderVisible: false
    };
  },
  props: {
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
  computed: {
    ...mapState({
      membList: state => {
        return state.search.membList;
      }
    })
  },
  methods: {
    ...mapActions(['GET_MEM_LIST']),
    ...mapMutations([CLEAR_CHAT]),
    // 打开图片查看器
    openImgView () {
      console.log('图片查看器=userInfo=', this.userInfo)
      imgView(this.userInfo.userHeadImg, this.userInfo.id)
    },

    findImage(image) {
      return fileOperational.getImage(image);
    },
    currentUserId() {
      return getSelfUserId();
    },
    async onCardShow() {
      let res = await get_friend_user_info({ id: this.userId });
      this.userInfo = res.data;
      console.log('userInfo~~~~~~', this.userInfo);
      this.isCurrentUser = this.currentUserId() === this.userId;
      this.getRegion();
      if (this.groupId) {
        this.isGroupMember = true;
        this.getGroupInfo(this.groupId);
      }
      this.updateUserNameAndImg();
      this.updateUserInGroupMember();
    },
    async getRegion() {
      if (this.userInfo && this.userInfo.areaCityCode && this.userInfo.areaCountryCode) {
        let res = await get_country_area({
          codes: this.userInfo.areaCountryCode + ',' + this.userInfo.areaCityCode
        });
        // this.region = res.data?.[this.userInfo.areaCountryCode]?.name + '-' + res.data?.[this.userInfo.areaCityCode]?.name;
        this.region = `${res.data?.[this.userInfo.areaCountryCode]?.name||''}-${res.data?.[this.userInfo.areaCityCode]?.name||''}`
      } else {
        this.userInfo.areaCityCode = '';
        this.userInfo.areaCountryCode = '';
        this.region = '';
      }
    },
    async getGroupInfo(groupId) {
      let res = await ser_group_infoById({
        groupId
      });
      this.groupInfo = res.data;
      //this.userId; // 名片id
      //this.currentUserId(); // 当前loginId
      await this.GET_MEM_LIST(this.groupId);
      let groupMember = await this.membList.filter(item => item.id == this.userId && item.is_show == 'true');
      if (groupMember.length > 0) {
        this.isMemberInGroup = true;
        this.memberNotes = groupMember[0]?.member_notes;
      } else {
        this.isMemberInGroup = false;
        this.memberNotes = '';
      }
      console.log('groupMember ==== ', groupMember);
      //let groupMember = await this.membList.filter((item) => item.id == this.userId);
      this.isGroupHolder = false;
      if (groupMember.length > 0 && groupMember[0].auth_status > +this.authStatus) {
        this.isGroupHolder = true;
      }
      this.updateGroupMemberInfo();
    },
    async updateUserInGroupMember() {
      let item = {
        id: this.userId,
        nick_name: this.userInfo.userNickName,
        user_head_img: this.userInfo.userHeadImg,
        inviteCode: this.userInfo.inviteCode,
        vipType: this.userInfo.vipType,
        inviteCodeType: this.userInfo.inviteCodeType,
        userRank: this.userInfo.userRank
      };
      await window.vm
        .$knex('t_groups_member')
        .where('id', '=', this.userId)
        .update(item);
    },
    async updateGroupMemberInfo() {
      let item = {
        id: this.userId,
        group_id: this.groupId,
        nick_name: this.userInfo.userNickName,
        user_head_img: this.userInfo.userHeadImg,
        inviteCode: this.userInfo.inviteCode,
        vipType: this.userInfo.vipType,
        inviteCodeType: this.userInfo.inviteCodeType,
        userRank: this.userInfo.userRank
      };
      let searchRet = await window.vm
        .$knex('t_groups_member')
        .where({ id: this.userId })
        .where('group_id', '=', this.groupId)
        .select();
      if (searchRet && searchRet.length > 0) {
        //更新
        await window.vm
          .$knex('t_groups_member')
          .where('id', '=', this.userId)
          .where('group_id', '=', this.groupId)
          .update(item);
      } else {
        //新增
        item['auth_status'] = 3;
        item['is_show'] = 'false';
        await window.vm.$knex('t_groups_member').insert(item);
      }
    },
    async updateUserNameAndImg() {
      let item = {
        friend_id: this.userInfo.id,
        friend_nick_name: this.userInfo.userNickName,
        friend_nick_name_pinyin: convertToPinyin(this.userInfo.userNickName),
        friend_head_img: this.userInfo.userHeadImg,
        friend_friendNotes: this.userInfo.friendNotes,
        friend_friendNotes_pinyin: convertToPinyin(this.userInfo.friendNotes),
        invite_code: this.userInfo.inviteCode,
        vipType: this.userInfo.vipType,
        inviteCodeType: this.userInfo.inviteCodeType,
        userRank: this.userInfo.userRank
      };
      let searchRet = await window.vm
        .$knex('t_contacts')
        .where({ friend_id: this.userInfo.id })
        .select();
      if (searchRet && searchRet.length > 0) {
        //更新
        await window.vm
          .$knex('t_contacts')
          .where('friend_id', '=', this.userInfo.id)
          .update(item);
      }
    },
    onCardHide() {
      this.isEdit = false;
    },
    async updateUserInfo(label, ...values) {
      console.log('updateUserInfo')
      let value = null;
      if (values.length == 1) {
        value = values[0];
        value = value.trim() == '' ? null : value.trim();
      }
      if (label == 'friendNotes') {
        this.userInfo.friendNotes = value;
        let params = {
          friendId: this.userInfo.id,
          friendNotes: value == '' ? null : value
        };
        let res = await set_member_notes(params);
        if (res.code == '200') {
          //更新数据库
          await window.vm
            .$knex('t_contacts')
            .update('friend_friendNotes', this.userInfo.friendNotes)
            .update('friend_friendNotes_pinyin', this.userInfo.friendNotes == undefined ? '' : convertToPinyin(this.userInfo.friendNotes))
            .where('friend_id', this.userInfo.id);
          this.$message.success(res.msg);
          store.dispatch('GET_LAST_MSG_LIST');
        }
      } else if (label == 'nickName') {
        this.userInfo.userNickName = value;
        let params = {
          nickName: value
        };
        let res = await set_user_nickname(params);
        if (res.code == '200') {
          this.$message.success(res.msg);
          await SQLUtils.updateNickNameInTGroupsMember(this.userInfo.id, value);
          if (this.userId == this.currentUserId()) {
            store.dispatch(GET_USER_INFO);
          }
        } else {
          this.$message.error(res.data.msg);
        }
      } else if (label == 'memberNotes') {
        this.memberNotes = value;
        let res = await update_person_info({
          groupId: this.groupId,
          userId: this.userId,
          memberNotes: value || ''
        });
        if (res.code == 200) {
          this.$message.success(res.msg);
          await window.vm
            .$knex('t_groups_member')
            .where('group_id', '=', this.groupId)
            .where('id', '=', this.userId)
            .update({
              member_notes: value,
              member_notes_pinyin: convertToPinyin(value)
            });
        } else {
          this.$message.error(res.msg);
        }
      } else if (label == 'personalSign') {
        this.userInfo.personalSign = value;
        let params = {
          personalSign: value
        };
        let res = await set_user_personal_sign(params);
        if (res.code == '200') {
          this.$message.success(res.msg);
        } else {
          if (res.data.code == '010105') {
            this.$message.error(this.$t('my_information_0015'));
          } else {
            this.$message.error(res.data.msg);
          }
        }
      } else if (label == 'gender') {
        // this.userInfo.gender = value == '男' ? 1 : 2;
        this.userInfo.gender = value == this.$t('my_information_0010') ? 1 : value == this.$t('my_information_0011') ? 2 : 0;
        let params = {
          gender: value == this.$t('my_information_0010') ? 1 : value == this.$t('my_information_0011') ? 2 : 0
        };
        let res = await set_user_gender(params);
        if (res.code == '200') {
          this.$message.success(res.msg);
        } else {
          this.$message.error(res.data.msg);
        }
      } else if (label == 'region') {
        let params = {
          areaCountryCode: values[0],
          areaCityCode: values[1]
        };
        console.log('params ======== ', params);
        let res = await set_user_area(params);
        if (res.code == '200') {
          this.$message.success(res.msg);
        } else {
          this.$message.error(res.data.msg);
        }
      }
      this.onCardShow();
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
      console.log('this.userInfo', this.userInfo);
      return {
        code: this.userInfo.inviteCode,
        name: this.userInfo.userNickName,
        msgUrl: this.userInfo.userHeadImg,
        id: this.userInfo.id,
        type: '1',
        originTypePsw: true,
        vipType: this.userInfo.vipType,
        userRank: this.userInfo.userRank,
        inviteCodeType: this.userInfo.inviteCodeType
      };
    },
    deleteFriend() {
      let friend = this.userInfo.friendNotes || this.userInfo.userNickName;
      let message = this.$t('book_friend_0019', {friend});
      this.$confirm(message, this.$t('Universal_0059'), {
        confirmButtonText: this.$t('Universal_0062'),
        cancelButtonText: this.$t('Universal_0063'),
        type: 'warning'
      })
        .then(() => {
          console.log('deleteFriend', this.currentUserId(), this.userInfo.id);
          this.deleteFriendConfirm();
        })
        .catch(() => {});
    },
    addFriend() {
      this.addOrderVisible = true;
      this.$emit('closeCard');
    },
    handCloseFri() {
      this.addOrderVisible = false;
    },
    async deleteFriendConfirm() {
      let res = await delete_friend({
        userId: this.currentUserId(),
        friendId: this.userInfo.id
      });
      if (res.code == 200) {
        this.$router.push({
          path: '/app/chat'
        });
        this.$message({
          type: 'success',
          message: this.$t('Universal_0107')
        });
        await SQLUtils.updateFromTypeBy_210({ targetId: this.userInfo.id,fromId:localStorage.userId });
        this.$store.dispatch("GET_LAST_MSG_LIST")
      }
    },
    onMemberInfoHide() {
      if ((this.$refs.editablegender || this.$refs.editableregion) && this.isCurrentUser) {
        this.$refs.editablegender.initEditableRadio();
        this.$refs.editableregion.initEditableSelect();
      }
    },
    memberInfoClick(e) {
      if (
        e.target.className != 'radio-target-name' &&
        e.target.className != 'radio-group' &&
        e.target.className != 'select-target-name' &&
        e.target.className != 'editable-select'
      ) {
        this.onMemberInfoHide();
      }
    },
    async goToChat() {
      this.$emit('closeHandle');
      this.CLEAR_CHAT();
      let current = {
        id: this.userInfo.id,
        sessionName: this.userInfo.userNickName,
        sessionIcon: this.userInfo.userHeadImg,
        targetType: 1, //单聊
        msgType: 1, //默认文本
        uniqueCode: contFriSize(this.userInfo.id, this.currentUserId()),
        fromType: '999'
      };
      await this.$store.dispatch('ADD_LAST_MSG_LIST', {
        ...current,
        isJump: true
      });
      await this.$store.dispatch('SET_CURRENT_CHAT', current);
      this.$router.push({
        path: '/app/chat/single/message',
        query: {
          id: this.userInfo.id,
          fromId: this.userInfo.id,
          targetId: this.currentUserId(),
          timer: new Date().getTime(),
          uniqueCode: contFriSize(this.userInfo.id, this.currentUserId()),
          friendName: encodeURI(this.userInfo.userNickName)
        }
      });
      await this.$store.dispatch('GET_LAST_MSG_LIST');
    },
    transferSuccess() {
      this.$emit('transferSuccess');
    }
  }
};
</script>
<style>
@import '../../assets/css/base.css';
.member-card .el-divider {
  margin-bottom: 20px;
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

.item-card {
  margin-bottom: 5px;
}
.card-info {
  margin-left: -30px !important;
}

.info-area span {
  width: 100%;
  display: inline-block;
  text-align: right;
  color: #999999;
}

.user-nick-name {
  align-items: center;
  display: flex;
  font-size: 16px;
  font-weight: bold;
  /*width: 180px;*/
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-left: -4px;
  margin-bottom: -6px;
}
.friend-nick-name {
  margin-left: 4px;
  /*margin-bottom: 5px;*/
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre;
}
.item-notes {
  margin-top: -3px;
  margin-left: -4px;
}

.gender {
  float: right;
  margin-top: -13px;
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
  /* width: 18px;
    height: 18px; */
  width: 16px;
  height: 16px;
}
.icons-area img {
  width: 22px;
  height: 22px;
}
.gender img {
  width: 18px;
  height: 18px;
}
.mar-t-5 {
  margin-top: 5px;
}
.mar-b--4 {
  margin-bottom: -4px;
}
</style>
