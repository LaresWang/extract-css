<!-- (群/讨论组，群分享，单聊发起讨论组-右侧成员-添加)-搜索结果列表 -->
<template>
  <div ref="searchContent" v-loading="loading" >
    <div
      v-show="
        friendsDataMin.length == 0 &&
          groupsData.length == 0 &&
          discussionsData.length == 0
      "
      class="no-data"
    >
      <img src="../../assets/images/web.png" class="img_search" />
      <p>{{ $t('Universal_0173') }}</p>
    </div>
    <div class="list contacts" v-show="friendsDataMin.length > 0">
      <p>
        {{ $t('chat_search_0003') }}
        <span @click="showAll" v-show="isShowAll">{{ $t('Universal_0271') }}</span>
      </p>
      <ul>
        <li
          v-for="(item, index) in friendsDataMin"
          :key="'friend' + index"
          :class="{active3:indexAt == item.indexAt}" 
          :id="item.inviteCode" 
          disName="1"
          @click.stop.prevent="addInviteHand(item)"
        >
          <MemberIcon
            :image="item.friendHeadImg"
            iconType="mini"
            :vipType="item.vipType"
            :userRank="item.userRank"
            class="search-member-icon"
          />
          <div class="flex flex-direction name-notes-id">
            <div class="nick-name">
              <span v-html="item.nickName"></span>

              <LevelIcon
                :inviteCode="item.inviteCode"
                :userRank="item.userRank"
                iconType="small"
                :vipType="item.vipType"
                :inviteCodeType="item.inviteCodeType"
              />
            </div>
            <LuckIdIcon
              :inviteCode="item.inviteCode"
              :userRank="item.userRank"
              iconType="medium"
              :vipType="item.vipType"
              :inviteCodeType="item.inviteCodeType"
              :listFlag="false"
            />
            <div class="friend-notes" v-show="item.showNotes">
              <span>{{ $t('book_friend_0002') }}</span><span v-html="item.friendNotes"></span>
            </div>
            <!-- <div class="invite-code" v-show="item.showCode && item.inviteCodeType == 0">
              <span> IDs：</span><span v-html="item.colorInviteCode"> </span>
            </div> -->
          </div>
          <el-checkbox
            class="search-select"
            v-model="item.checked"
            @change="addInviteHand(item, index)"
            :checked="item.checked"
            :disabled="item.disabled"
          >
          </el-checkbox>
        </li>
      </ul>
    </div>
    <div class="list groups" v-show="groupsData.length > 0 && !showFriendflag">
      <p>{{ $t('chat_search_0005') }}</p>
      <ul>
        <li
          v-for="(item, index) in groupsData"
          :key="'group' + index"
          :class="{active3:indexAt == item.indexAt}" 
          :id="item.groupId" 
          disName="2"
          @click="addInviteHand(item)"
          :style="{
            cursor: item.forbiddenWordsStatus2Boolean ? 'not-allowed' : '',
          }"
        >
          <img
            class="avatar"
            :src="findImage(item.groupAvatar)"
            v-if="item.groupAvatar"
            :alt="$t('Universal_0184')"
          />
          <img
            class="avatar"
            src="../../assets/images/group.png"
            v-else
            :alt="$t('Universal_0184')"
          />
          <div class="flex flex-direction justify-center name-notes-id">
            <div class="nick-name"><span v-html="item.groupName"></span></div>
            <div class="group-code" v-show="item.showCode">
              <span>{{ $t('book_community_0007') }}: </span><span v-html="item.groupCode"></span>
            </div>
          </div>
          <el-checkbox
            class="search-select"
            v-model="item.checked"
            @change="addInviteHand(item, index)"
            :checked="item.checked"
            :disabled="availableCheck(item)"
            :style="{
              cursor: item.forbiddenWordsStatus2Boolean ? 'not-allowed' : '',
            }"
          ></el-checkbox>
        </li>
      </ul>
    </div>
    <div class="list groups" v-show="discussionsData.length > 0 && !showFriendflag">
      <p>{{ $t('chat_search_0007') }}</p>
      <ul>
        <li
          v-for="(item, index) in discussionsData"
          :key="'discussion' + index"
          :class="{active3:indexAt == item.indexAt}" :id="item.groupId" disName="3"
          @click="addInviteHand(item)"
        >
          <div class="discussion-icon">
            <DiscussionIcon iconType="mini" :name="item.groupNameOrigin" />
          </div>
          <div class="flex flex-direction justify-center name-notes-id">
            <div class="nick-name"><span v-html="item.groupName"></span></div>
          </div>
          <el-checkbox
            class="search-select"
            v-model="item.checked"
            @change="addInviteHand(item, index)"
            :checked="item.checked"
            :disabled="item['disabled']"
          ></el-checkbox>
        </li>
      </ul>
    </div>
    <br />
  </div>
</template>

<script>
import fileOperational from "@/services/fileOperational";
import DiscussionIcon from "@/components/memberIcon/DiscussionIcon";
import MemberIcon from "@/components/memberIcon/MemberIcon";
import LevelIcon from "@/components/memberIcon/LevelIcon";
import LuckIdIcon from "@/components/memberIcon/luckIdIcon";
import UserInfoUtils from "@/utils/UserInfoUtils.js";
export default {
  name: "SearchInfo",
  components: {
    DiscussionIcon,
    MemberIcon,
    LevelIcon,
    LuckIdIcon,
  },
  data() {
    return {
      loading:false,
      groupVisible: false,
      addOrderVisible: false,
      friendsData: [],
      groupsData: [],
      discussionsData: [],
      isShowAll: false,
      friendsDataMin: [],
      groupMembersInfo: [],
      selectedIds: [],
      indexAt:0,//被选中item的下标
      alldataNum:0,//搜索到的所有列表之和
      currentItem:{},//上下键选中的item
    };
  },
  props: {
    showFriendflag:{
      type: Boolean,
      default: () => {
        return false;
      },
    },
    keyword: {
      type: String,
      default: () => {
        return "";
      },
    },
    limitGroupIdArr:{
      type:Array,
      default: () => {
        return [];
      },
    }
  },
  watch: {},
  computed:{
    availableCheck(){
      return (item)=>{
        let isForbiddenWordsStatus =
          item.authStatus != 3
            ? false
            : item.forbiddenWordsStatus == 0 ||
              item.memberForbiddenWordsStatus == 1;
        return Boolean(isForbiddenWordsStatus)||this.limitGroupIdArr.includes(item['id']);
      }
    }
  },
  methods: {
    chooseSearch(){
      this.indexAt = 0;
      document.removeEventListener('keydown', this.keyMove)
      if(this.keyword){ // && document.getElementById('searchAll') == document.activeElement
        document.addEventListener('keydown',this.keyMove)
      }
    },
    move(){
      if( document.getElementsByClassName('searchInfoClass')[0]){
        document.getElementsByClassName('searchInfoClass')[0].scrollTop = document.getElementsByClassName('active3')[0].offsetTop-70
      }
    },
    keyMove(e){
      if(e.keyCode == 38){ //上键
        console.log(this.indexAt,this.alldataNum,'up111')
        if(this.indexAt>0){
          this.indexAt--;
          console.log(this.indexAt,'--')
        }else{
          this.indexAt = 0;
        }
        this.move()
      }else if(e.keyCode == 40){ //下键
        console.log(this.indexAt,this.alldataNum,'down2222')
        if(this.indexAt < this.alldataNum-1){
          this.indexAt++;
          console.log(this.indexAt,'++')
        }else if(this.indexAt == this.alldataNum){
          this.indexAt = this.indexAt-1 ;
          console.log(this.indexAt,'-1后')
        }
        this.move()
      }
      else if(e.keyCode == 13){
        console.log(document.getElementsByClassName('active3')[0],'wswwwww')
        let currentId='',disName=''
        if(document.getElementsByClassName('active3')[0]){
          currentId = document.getElementsByClassName('active3')[0].getAttribute("id")
          disName = document.getElementsByClassName('active3')[0].getAttribute("disName")
          console.log(currentId,'currentId')
        }
        console.log(disName,this.friendsDataMin)
        if(disName == 1){ //好友
          this.currentItem = this.friendsDataMin.filter((item) => {
            return item.inviteCode == currentId
          })
        }else if(disName == 2){ //社区
          this.currentItem = this.groupsData.filter((item) => {
            return item.groupId == currentId
          })
        }else if(disName == 3){ //讨论组
          this.currentItem = this.discussionsData.filter((item) => {
            return item.groupId == currentId
          })
        }
        console.log(this.currentItem)
        this.addInviteHand(this.currentItem[0])
      }
      
    },
    addInviteHand(item) {
      console.log("搜索--item", item);
      if(item.forbiddenWordsStatus2Boolean||this.limitGroupIdArr.includes(item['id'])){
        return;
      }
      if(item.disabled && item.checked){
        item.checked=true;
        return;
      }
      this.$forceUpdate();
      item.checked = item.checked ? false : true;
      this.$emit("GetSelectObj", item);

    },
    //将 friendList 中字段下划线转换成驼峰
    changeFriendName(arr) {
      return arr.map((a) => {
        a = {
          friendFriendNotes: a.friend_friendNotes,
          friendNotes: a.friend_friendNotes,
          friendHeadImg: a.friend_head_img,
          friendId: a.friend_id,
          friendNickName: a.friend_nick_name,
          nickName: a.friend_nick_name,
          inviteCode: a.invite_code,
          code: a.invite_code,
          colorInviteCode: a.invite_code,
          level: a.level,
          id: a.friend_id,
          targetType: 1,
          vipType: a.vipType,
          inviteCodeType: a.inviteCodeType,
          userRank: a.userRank,
          groupType: null,
        };
        return a;
      });
    },
    //将 groupList 中字段下划线转换成驼峰
    changeGroupName(arr) {
      return arr.map((a) => {
        a = {
          groupId: a.group_id,
          id: a.group_id,
          groupName: a.group_name,
          groupNameOrigin: a.group_name,
          groupNamePinyin: a.group_name_pinyin,
          groupStatus: a.group_status,
          groupAvatar: a.group_avatar,
          code: a.group_code,
          groupCode: a.group_code,
          friendNickName: a.group_name,
          friendHeadImg: a.group_avatar,
          targetType: 2,
          groupType: a.group_type,
          forbiddenWordsStatus: a.forbiddenWordsStatus,
          memberForbiddenWordsStatus: a.memberForbiddenWordsStatus,
          forbiddenWordsStatus2Boolean: a.forbiddenWordsStatus2Boolean,
          authStatus: a.authStatus,
          memberId: a.memberId,
        };
        return a;
      });
    },
    //讨论组
    async getSearchDiscussion(key) {
      let res = await window.vm
        .$knex("t_groups")
        .where(function() {
          this.where("group_name", "like", "%" + key + "%").orWhere(
            "group_name_pinyin",
            "like",
            "%" + key + "%"
          );
          // .orWhere("group_code", "like", "%" + key + "%");
        })
        .where("group_type", "=", 0)
        .orderBy("group_name_pinyin")
        .select();
      let data= this.changeGroupName(res)||[];
      data.forEach((item)=>{
        item['disabled']=this.limitGroupIdArr.includes(item['id'])?true:false;
      });
      this.discussionsData =data;
    },
    //群
    async getSearchGroup(key) {
      let res = await window.vm.$knex.raw(`
        select g.*,
        tgm.forbiddenWordsStatus as memberForbiddenWordsStatus,
        tgm.auth_status as authStatus,
        tgm.id as memberId
        from t_groups g
        left join t_groups_member gm on gm.group_id = g.group_id
        left join t_groups_member tgm on tgm.group_id = g.group_id and tgm.id = '${UserInfoUtils.getCurrentUserId()}' and tgm.is_show='true'
        where  (g.group_name like '%${key}%' and g.is_show='true' or 
          g.group_name_pinyin like '%${key}%' or g.group_code like '%${key}%') and g.group_type='1'
        group by g.group_id
        order by g.group_name_pinyin
      `);
      console.log("res", res);
      this.groupsData = this.changeGroupName(res);
    },
    //个人
    async getSearchFriends(key) {
      let res = await window.vm
        .$knex("t_contacts")
        .where(function() {
          this.where("is_show", "=", "true")
            .orWhere("friend_nick_name", "like", "%" + key + "%")
            .orWhere("friend_nick_name_pinyin", "like", "%" + key + "%")
            .orWhere("invite_code", "like", "%" + key + "%")
            .orWhere("friend_friendNotes_pinyin", "like", "%" + key + "%")
            .orWhere("friend_friendNotes", "like", "%" + key + "%");
        })
        .where(function() {
          this.whereNull("is_show").orWhere("is_show", "!=", "false");
        })
        .where("friend_id", "!=", UserInfoUtils.getCurrentUserId())
        .orderBy("friend_nick_name_pinyin")
        .select();
      this.friendsData = this.changeFriendName(res);
    },
    init(ids) {
      this.search(ids);
    },
    async search(ids, members) {
      if (!this.keyword) {
        // this.$message.error("请输入搜索内容");
        document.removeEventListener('keydown', this.keyMove)
        this.indexAt = 0
        return;
      }
      if (this.keyword.trim() == "") {
        document.removeEventListener('keydown', this.keyMove)
        this.indexAt = 0
        return;
      }
      // this.resetData();
      this.loading = true
      this.selectedIds = ids;
      await this.getSearchFriends(this.keyword);
      this.loading = false
      if (members && members.length > 0) {
        this.groupMembersInfo = members;
        this.groupsData = [];
      } else {
        this.groupMembersInfo = [];
        await this.getSearchGroup(this.keyword);
        await this.getSearchDiscussion(this.keyword);
      }
      this.isShowAll = this.friendsData.length > 5;
      if (this.isShowAll) {
        this.friendsDataMin = this.friendsData.slice(0, 5);
        if (this.friendsDataMin.length >= 5) {
          this.isShowGroup = false;
        }
      } else {
        this.friendsDataMin = this.friendsData;
      }
      this.changeColor();
      this.initCheckedItems();
      this.initDisabledItems();
      this.$refs.searchContent.scrollIntoView();
      this.chooseSearch()
    },
    initDisabledItems() {
      if (this.groupMembersInfo && this.groupMembersInfo.length > 0) {
        this.friendsDataMin.map((item) => {
          if (
            this.groupMembersInfo.filter(
              (m) => m.id == item.id && m.is_show == "true"
            ).length > 0
          ) {
            
            item.forbiddenWordsStatus = 0;
            item.checked = true;
            item.disabled = item.checked;
          }
        });
        this.$forceUpdate();
      }
    },
    initCheckedItems() {
      this.friendsDataMin.map((item) => {
        if (this.selectedIds.indexOf(item.id) > -1) {
          item.checked = true;
        } else {
          item.checked = false;
        }
      });
      this.groupsData.map((item) => {
        /* forbiddenWordsStatus:0禁言，1不禁言； memberForbiddenWordsStatus：0不禁言，1禁言。authStatus=3普通成员 */
        let isForbiddenWordsStatus =
          item.authStatus != 3
            ? false
            : item.forbiddenWordsStatus == 0 ||
              item.memberForbiddenWordsStatus == 1;
        item.forbiddenWordsStatus2Boolean = Boolean(isForbiddenWordsStatus);
        if (this.selectedIds.indexOf(item.id) > -1) {
          item.checked = true;
        } else {
          item.checked = false;
        }
      });
      this.discussionsData.map((item) => {
        if (this.selectedIds.indexOf(item.id) > -1) {
          item.checked = true;
        } else {
          item.checked = false;
        }
      });
    },
    removeSelectedItem(id) {
      this.friendsDataMin.map((item) => {
        if (item.id == id) {
          item.checked = false;
        }
      });
      this.groupsData.map((item) => {
        if (item.id == id) {
          item.checked = false;
        }
      });
      this.discussionsData.map((item) => {
        if (item.id == id) {
          item.checked = false;
        }
      });
      this.$forceUpdate();
    },
    changeColor() {
      if (this.keyword) {
        let key = this.keyword.toLowerCase();
        let replaceReg = new RegExp(key, "g");
        let replaceString = '<span class="high-light">' + key + "</span>";
        let keyUp = this.keyword.toUpperCase();
        let replaceRegUp = new RegExp(keyUp, "g");
        let replaceStringUp = '<span class="high-light">' + keyUp + "</span>";
        this.friendsDataMin.map((item,index) => {
          item.indexAt = index;
          if (item.nickName.toLowerCase().indexOf(key) != -1) {
            item.nickName = item.nickName
              .replace(replaceReg, replaceString)
              .replace(replaceRegUp, replaceStringUp);
          }
          if (
            item.friendNotes &&
            item.friendNotes.toLowerCase().indexOf(key) != -1
          ) {
            item.friendNotes = item.friendNotes
              .replace(replaceReg, replaceString)
              .replace(replaceRegUp, replaceStringUp);
            item.showNotes = true;
          }
          if (item.colorInviteCode.toLowerCase().indexOf(key) != -1) {
            item.colorInviteCode = item.colorInviteCode
              .replace(replaceReg, replaceString)
              .replace(replaceRegUp, replaceStringUp);
            item.showCode = true;
          }
        });
        this.groupsData.map((item,index) => {
          item.indexAt = Number(this.friendsDataMin.length) + index;
          if (item.groupName.toLowerCase().indexOf(key) != -1) {
            item.groupName = item.groupName
              .replace(replaceReg, replaceString)
              .replace(replaceRegUp, replaceStringUp);
          }
          if (item.groupCode.toLowerCase().indexOf(key) != -1) {
            item.groupCode = item.groupCode
              .replace(replaceReg, replaceString)
              .replace(replaceRegUp, replaceStringUp);
            item.showCode = true;
          }
        });
        this.discussionsData.map((item,index) => {
          item.indexAt = Number(this.friendsDataMin.length)+ Number(this.groupsData.length) +index;
          if (item.groupName.toLowerCase().indexOf(key) != -1) {
            item.groupName = item.groupName
              .replace(replaceReg, replaceString)
              .replace(replaceRegUp, replaceStringUp);
          }
        });
      }
      this.alldataNum = Number(this.friendsDataMin.length)+Number(this.groupsData.length)+Number(this.discussionsData.length)
      this.$forceUpdate();
    },
    async showAll() {
      this.resetData();
      await this.getSearchFriends(this.keyword);
      if (this.groupMembersInfo && this.groupMembersInfo.length > 0) {
        this.groupsData = [];
      } else {
        await this.getSearchGroup(this.keyword);
        await this.getSearchDiscussion(this.keyword);
      }
      this.friendsDataMin = this.friendsData;
      this.changeColor();
      this.initCheckedItems();
      this.initDisabledItems();
    },
    resetData() {
      this.friendsData = [];
      this.groupsData = [];
      this.isShowAll = false;
    },
    findImage(image) {
      return fileOperational.getImage(image, true);
    },
  },
  mounted() {
    console.log("mounted");
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.keyMove)
  }, 
};
</script>

<style scoped>
.active3 {
  background-color: #f7f7fa;
}
.no-data {
  text-align: center;
}

.nick-name {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  width: 170px;
  display: flex;
  align-items: center;
}
.nick-name span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 60%;
}

.friend-notes,
.invite-code,
.group-code {
  font-size: 10px;
  color: #999999;
  width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  height: 13px;
  display: flex;
  align-items: center;
}

.name-notes-id {
  height: 50px;
  justify-content: space-around;
}

.search-select {
  padding: 6px 8px;
}
.search-select /deep/ .el-checkbox__inner {
  border: 1px solid #aeaeae;
}

.search-member-icon {
  display: inline-block;
  margin-right: 12px;
  margin-top: 10px;
}
</style>
<style lang="less" scoped>
.discussion-icon {
  margin-right: 10px;
  margin-top: 10px;
}
.searchInfoClass {
  width: 260px !important;
  height: 70% !important;
  overflow-y: scroll !important;
  padding: 0;
  .list {
    width: 100%;
    & > p {
      padding: 3px 0px 3px 6%;
      font-size: 13px;
      font-weight: 600;
      color: #333;
      display: flex;
      justify-content: space-between;
      span {
        margin-right: 6%;
        cursor: pointer;
        color: #02a7f0;
      }
    }
    & > ul li {
      display: flex;
      justify-content: flex-start;
      padding: 6px 0 0 5%;
      img {
        border-radius: 50%;
        width: 32px;
        height: 32px;
        margin-right: 10px;
        margin-top: 10px;
      }
    }
    & > ul li:hover {
      background: #f4f4f4;
    }
  }
}
</style>
