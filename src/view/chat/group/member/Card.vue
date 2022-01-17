<template>
  <div>
    <div class="member-card">
      <el-row :gutter="20">
        <el-col :span="5">
          <img :src="userInfo.userHeadImg" style="width: 48px; height: 48px; border-radius: 50%" alt="" />
        </el-col>
        <el-col :span="18">
          <el-row :gutter="20" class="item-spacing">
            <el-col :span="24">
              <div class="user-nick-name" :title="userInfo.userNickName"></div>
              <div class="gender" v-show="!isCurrentUser">
                <img src="@/assets/images/sex_boy.png" v-if="userInfo.gender === 1" />
                <img src="@/assets/images/sex_girl.png" v-else-if="userInfo.gender === 2" />
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="item-spacing">
            <el-col :span="24">
              <div class="invite-code">ID: {{ userInfo.inviteCode }}</div>
            </el-col>
          </el-row>
          <el-row :gutter="20" type="flex" class="item-spacing" justify="space-butween">
            <el-col :span="7"> <img src="@/assets/images/pminfo_badge.png" /> LV{{ userInfo.level }} </el-col>
            <el-col :span="7">
              <img src="@/assets/images/pminfo_diamond.png" />
              {{ userInfo.computingPower }}
            </el-col>
            <el-col :span="7">
              <img src="@/assets/images/pminfo_look.png" />
              {{ userInfo.invitationCount }}篇
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <el-divider></el-divider>
      <el-row :gutter="20" class="info-area item-spacing" v-if="isGroupMember">
        <el-col :span="6">
          <span>社区成员备注</span>
        </el-col>
        <el-col :span="18">
          <div>{{ groupInfo.groupNotes }}</div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="info-area item-spacing" v-if="userInfo.isFriend">
        <el-col :span="6">
          <span>备注</span>
        </el-col>
        <el-col :span="18">
          <div>{{ userInfo.memberNotes }}</div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="info-area item-spacing" v-if="isCurrentUser">
        <el-col :span="6">
          <span>性别</span>
        </el-col>
        <el-col :span="18">
          <div>
            {{ userInfo.gender === 1 ? '男' : userInfo.gender === 2 ? '女' : '' }}
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="info-area item-spacing">
        <el-col :span="6">
          <span>地区</span>
        </el-col>
        <el-col :span="18">
          <div>{{ region }}</div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="info-area item-spacing">
        <el-col :span="6">
          <span>个性签名</span>
        </el-col>
        <el-col :span="18">
          <div>{{ userInfo.personalSign }}</div>
        </el-col>
      </el-row>
      <el-row :gutter="20" type="flex" class="icons-area" justify="end">
        <el-col :span="6" :offset="6"> </el-col>
        <el-col :span="3" v-show="isCurrentUser">
          <img src="../../../../assets/images/upgrade.png" alt="" />
        </el-col>
        <el-col :span="3">
          <img src="../../../../assets/images/info_transmit.png" alt="" />
        </el-col>
        <el-col :span="3" v-show="userInfo.isFriend">
          <img src="../../../../assets/images/info_message.png" alt="" />
        </el-col>
        <el-col :span="3" v-show="userInfo.isFriend">
          <img src="../../../../assets/images/info_del_friend.png" alt="" />
        </el-col>
        <el-col :span="3" v-show="!userInfo.isFriend">
          <!-- <img src="@/components/memberCard/image/add_friend.png" alt="" /> -->
          <img src="../../../../assets/images/info_add_friend.png" alt="" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { get_country_area, get_friend_user_info } from '@/server.js';
import { ser_group_infoById } from '@/view/chat/group/information/server';

export default {
  name: 'MemberCard',
  components: {},
  computed: {},
  data() {
    return {
      region: '',
      userInfo: {},
      groupInfo: {},
      isCurrentUser: false,
      isEdit: false,
      isGroupMember: false,
      isGroupHolder: false
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
    }
  },
  methods: {
    async onCardShow() {
      console.log('onCardShow');
      console.log('this.userId', this.userId);
      let res = await get_friend_user_info({ id: this.userId });
      this.userInfo = res.data;
      console.log('userInfo~~~~~~', this.userInfo);
      let userid = localStorage.getItem('userId');
      this.isCurrentUser = userid === this.userId;
      this.getRegion();
      if (this.groupId) {
        this.isGroupMember = true;
        this.getGroupInfo(this.groupId);
      }
    },
    async getRegion() {
      if (this.userInfo && this.userInfo.areaCityCode && this.userInfo.areaCountryCode) {
        let res = await get_country_area({
          codes: this.userInfo.areaCountryCode + ',' + this.userInfo.areaCityCode
        });
        // this.region = res.data?.[this.userInfo.areaCountryCode]?.name + '-' + res.data?.[this.userInfo.areaCityCode]?.name;
        this.region = `${res.data?.[this.userInfo.areaCountryCode]?.name||''}-${res.data?.[this.userInfo.areaCityCode]?.name||''}`
      }
    },
    async getGroupInfo(groupId) {
      let res = await ser_group_infoById({
        groupId
      });
      this.groupInfo = res.data;
    }
  },
  created() {
    //console.log('this.userInfo = ',this.userInfo)
    //this.getRegion();
  },
  updated() {}
};
</script>
<style></style>
<style scoped>
.member-card {
  padding: 10px 15px;
  color: #333333;
  font-size: 12px;
}

.item-spacing {
  margin-bottom: 5px;
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

.gender {
  float: right;
  margin-top: -20px;
}

.invite-code {
  font-size: 12px;
  color: #999999;
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
</style>
