<!-- 成员列表-加入群 -->
<template>
  <div class="group">
    <div class="flex top">
      <el-input
        size="small"
        :placeholder="$t('chat_search_0008')"
        prefix-icon="el-icon-search"
        style="flex: 1; margin-right: 10px"
        v-model="value"
        clearable
        @keydown.enter.native="searchEnter"
        id="addGroupSearch"
        :code="addGroupVisible"
      ></el-input>
      <el-button size="small" type="primary" @click="search">{{ $t('Universal_0058') }}</el-button>
    </div>
    <div class="list serlist" >
      <div v-if="hasData && addGroupVisible" id="linkG2" contenteditable="true"  @keydown="keyMove">
        <ul class="list-box" contenteditable="false">
          <li class="li-card" 
            v-for="(item, index) in dataList" 
            :key="index"
            :class="{activebg:indexAt == (item.indexAt?item.indexAt:'')}" 
            :id="item.id">
            <div class="card flex align-center">
              <div class="left">
                <img
                  width="40px"
                  height="40px"
                  style="margin-right: 10px; border-radius: 50%"
                  :src="item.groupAvatar"
                  v-if="item.groupAvatar"
                  alt
                />
                <img
                  width="40px"
                  height="40px"
                  style="margin-right: 10px; border-radius: 50%"
                  v-else
                  src="../../../assets/images/group.png"
                  alt
                />
                <p class="name">{{ item.groupName }}</p>
                <p class="pass" style="margin-top: 6px">
                  {{ $t('chat_comm_member_0003') }}：{{ item.people }}/{{ item.maxPeople }}
                </p>
                <p class="pass">{{ $t('book_community_0007') }}：{{ item.groupCode }}</p>
              </div>
              <div class="right">
                <button
                  class="btn"
                  v-if="item.inGroup == 1"
                  @click="goGroupchat(item)"
                >
                  {{ $t('book_community_0011') }}
                </button>
                <button class="btn" v-else @click="addGroups(item)">
                  {{ $t('chat_joincommunity_0001') }}
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    <!-- <div class="list serlist" >
      <div  v-if="hasData && addGroupVisible" id="linkG2" contenteditable="true"  @keydown="keyMove">
        <ul class="list-box"   contenteditable="false">
          <li class="li-card" 
          v-for="(item, index) in dataList" 
          :key="index"
          :class="{activebg:indexAt == (item.indexAt?item.indexAt:'')}" 
          :id="item.id">
            <div class="card flex align-center">
              <div class="left">
                <img
                  width="40px"
                  height="40px"
                  style="margin-right: 10px; border-radius: 50%"
                  :src="item.groupAvatar"
                  v-if="item.groupAvatar"
                  alt
                />
                <img
                  width="40px"
                  height="40px"
                  style="margin-right: 10px; border-radius: 50%"
                  v-else
                  src="../../../assets/images/group.png"
                  alt
                />
                <p class="name">{{ item.groupName }}</p>
                <p class="pass" style="margin-top: 6px">
                  社区成员：{{ item.people }}/{{ item.maxPeople }}
                </p>
                <p class="pass">社区ID：{{ item.groupCode }}</p>
              </div>
              <div class="right">
                <button
                  class="btn"
                  v-if="item.inGroup == 1"
                  @click="goGroupchat(item)"
                >
                  进入社区
                </button>
                <button class="btn" v-else @click="addGroups(item)">
                  加入社区
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div> -->
      <ul v-else class="ser-nocontent">
        <div class="no-box">
          <img src="../../../assets/images/web.png" alt="error" />
          <p>{{ $t("Universal_0174") }}</p>
        </div>
      </ul>
    </div>
    <DialogAddGroupVisible
      :dialogAddGroupsVisible="dialogAddGroupsVisible"
      @handCloseAddGroups="handCloseAddGroups"
      @handCancelGroupDialog="handCancelGroupDialog"
      @handConfirmGroupDialog="handConfirmGroupDialog"
      :groupData="groupData"
      @toAppeal="toAppeal('single')"
    />
    <AppealsDialog
      ref="appeal"
      :AppealsVisible.sync="AppealsVisible"
      :impeachFromtype="impeachFromtype"
      @cancelDialogHand="cancelAppealsDialogHand"
      @toImpeach="toImpeachDialog"
    />
    <ImpeachDialog
      ref="impeach"
      :ImpeachVisible.sync="ImpeachVisible"
      :impeachFromtype="impeachFromtype"
      @cancelDialogHand="cancelImpeachDialogHand"
    />
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import DialogAddGroupVisible from "../dialog/add-groups";
import { get_groupquery_code } from "../../../server";
import { add_the_group, add_group_by_qr } from "./server";
import { contGrpSize } from "@/utils";
import { CLEAR_CHAT } from "@/store/types";
import { mapState, mapMutations } from "vuex";
import UserInfoUtils from "@/utils/UserInfoUtils.js";
import SQLUtils from "@/components/db/sqlite.js";
import AppealsDialog from "@/view/chat/appeals";
import ImpeachDialog from "@/view/chat/impeach";
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    DialogAddGroupVisible,
    AppealsDialog,
    ImpeachDialog,
  },
  props: {
    addGroupVisible:{
      type:Boolean,
      default:false
    },
    inviteCode: {
      type: String,
      default: "",
    },
  },
  data() {
    //这里存放数据
    return {
      addFlag: true,
      value: "",
      dataList: [],
      hasData: true,
      groupData: {},
      dialogAddGroupsVisible: false,
      AppealsVisible: false,
      ImpeachVisible: false,
      impeachFromtype: "", //来源类型
      indexAt:0,
      currentItem:{},//上下键选中的item
      alldataNum:0
    };
  },
  //监听属性 类似于data概念
  computed: {
    ...mapState({
      personalAppealInfo: (state) => {
        return state.common.personalAppealInfo;
      },
    }),
  },
  //监控data中的数据变化
  watch: {
    // addGroupVisible(val){
    //   if(!val){
    //     document.removeEventListener('keydown', this.keyMove)
    //   }
    // }
  },
  //方法集合
  methods: {
    ...mapMutations([CLEAR_CHAT]),
    goGroupchat(a) {
      this.CLEAR_CHAT();
      let current = {
        targetId: a.id,
        id: a.id,
        uniqueCode: contGrpSize(a.id),
        sessionName: a.groupName,
        sessionIcon: a.groupAvatar,
        fromName: this.$store.state.common.userInfo.nickName,
        targetType: 2,
        msgType: 1,
      };
      this.$store.dispatch("ADD_LAST_MSG_LIST", { ...current, isJump: true });
      this.$store.dispatch("SET_CURRENT_CHAT", current);

      this.$router.push({
        path: "/app/chat/group/message",
        query: current,
      });
      this.$emit("handleClose", false);
    },
    searchEnter(){
      this.search()
      document.getElementById('addGroupSearch').blur();
    },
    async search() {
      if (!this.value.trim()) {
        this.$message.error(this.$t('Universal_0240'));
        return;
      }
      let params = {
        param: this.value,
      };
      await this.searchGroup(params);
      document.getElementById('addGroupSearch').blur();
      this.chooseSearch()
    },
    async searchGroup(param) {
      try {
        let res = await get_groupquery_code(param);
        this.dataList = res.data;
        if(this.dataList.length>0){
          this.dataList.forEach((item,index)=>{
            item['indexAt'] = index;
          })
        }
        if (this.dataList.length == 0) {
          this.hasData = false;
        } else {
          this.hasData = true;
          this.alldataNum = this.dataList.length
        }
        //
      } catch (error) {
        console.error(error);
      }
    },
    // groupInfo(param) {
    //   this.groupData = param
    //   this.dialogAddGroupsVisible = true
    // },
    async addGroups(groupInfo) {
      if (this.personalAppealInfo.createTime) {
        let time = `${this.personalAppealInfo.createTime}--${this.personalAppealInfo.endTime}`;
        this.$confirm(
          this.$t('appeal_0003', {time}),
          this.$t('Universal_0059'),
          {
            confirmButtonText: this.$t('appeal_0017'),
            cancelButtonText: this.$t('book_group_0019'),
            center: true,
            showClose: false,
          }
        )
          .then(() => {
            this.toAppeal("single");
          })
          .catch(() => {});
      } else {
        if (groupInfo.people == groupInfo.maxPeople) {
          return this.$message.error(this.$t('chat_comm_manage_0021'));
        }
        let userid = UserInfoUtils.getCurrentUserId();
        let param = {
          userId: userid,
          groupId: groupInfo.id,
        };
        switch (groupInfo.addCheck) {
        case 0:
          await add_group_by_qr(param).then((res) => {
            if (res.code == 200) {
              this.$message.success(this.$t('Universal_0119'));
              this.$emit("handleClose", false);
            } else {
              this.$message.error(res.data.msg || res.msg);
            }
          });
          break;
        case 1:
          this.groupData = groupInfo;
          this.dialogAddGroupsVisible = true;
          break;
        case 2:
          this.$message.warning(this.$t('chat_joincommunity_0011'));
          break;
        }
        // this.goGroup(param, a);
      }
    },
    async goGroup(param, a) {
      let res = await add_the_group(param);
      console.log(res);
      if (res.code == 200) {
        this.$message({
          message: res.msg,
          type: "success",
          customClass: "mzindex",
        });
        let targetId = a.id;
        await SQLUtils.addGroupsById(targetId);
        await SQLUtils.addGroupsMemberByGroupId(targetId);
        this.text = "";

        this.CLEAR_CHAT();
        let current = {
          targetId,
          id: a.id,
          uniqueCode: contGrpSize(a.id),
          sessionName: a.groupName,
          sessionIcon: a.groupAvatar,
          fromName: this.$store.state.common.userInfo.nickName,
          targetType: 2,
          msgType: 1,
        };
        this.$store.dispatch("ADD_LAST_MSG_LIST", { ...current, isJump: true });
        this.$store.dispatch("SET_CURRENT_CHAT", current);

        this.$router.push({
          path: "/app/chat/group/message",
          query: current,
        });
        this.$emit("handleColse", false);
      } else {
        this.$message({
          message: res.data.msg,
          type: "error",
          customClass: "mzindex",
        });
        return;
      }
    },
    handCloseAddGroups(param) {
      this.dialogAddGroupsVisible = param;
    },
    handCancelGroupDialog(param) {
      this.dialogAddGroupsVisible = param;
    },
    handConfirmGroupDialog(param) {
      this.dialogAddGroupsVisible = param;
      this.$emit("handleClose", false);
    },
    cancelAppealsDialogHand(param) {
      this.AppealsVisible = param;
    },
    cancelImpeachDialogHand(param) {
      this.ImpeachVisible = param;
    },
    //去申诉
    toAppeal(impeachFromtype) {
      this.impeachFromtype = impeachFromtype;
      this.AppealsVisible = true;
      this.$refs.appeal.init();
    },
    toImpeachDialog() {
      this.AppealsVisible = false;
      this.ImpeachVisible = true;
      this.$refs.impeach.init();
    },
    move(target){
      if( document.getElementsByClassName('serlist')[0]){
        if(target == 'up'){
          document.getElementsByClassName('serlist')[0].scrollTop = document.getElementsByClassName('activebg')[0].offsetTop-250
        }else{
          document.getElementsByClassName('serlist')[0].scrollTop = document.getElementsByClassName('activebg')[0].offsetTop-180
        }
      }
      console.log(document.getElementsByClassName('activebg')[0].offsetTop,'位移')
    },
    keyMove(e){
      if(e.keyCode == 38){ //上键
        console.log(this.indexAt,'up111')
        if(this.indexAt>0){
          this.indexAt--;
        }else{
          this.indexAt = 0;
        }
        this.move('up')
      }else if(e.keyCode == 40){ //下键
        if(this.indexAt < this.alldataNum-1){
          this.indexAt++;
        }else if(this.indexAt == this.alldataNum){
          this.indexAt = this.indexAt-1 ;
        }
        this.move('down')
      }
      else if(e.keyCode == 13 && this.addFlag){
        let currentId='';
        if(document.getElementsByClassName('activebg')[0]){
          currentId = document.getElementsByClassName('activebg')[0].getAttribute("id")
          console.log(currentId,'currentId')
        }
        if(this.dataList.length>0){
          this.currentItem = this.dataList.filter((item) => { 
            return item.id == currentId
          })
          console.log(this.currentItem,'!!!!')
          if(this.currentItem[0].inGroup == 1){
            this.goGroupchat(this.currentItem[0]) //进入社区
          }else{
            this.addGroups(this.currentItem[0]) //加入社区
          }
          this.addFlag = false;
        }
        
      }
      
    },
    chooseSearch(){
      if(this.hasData){
        this.indexAt = 0;
        document.getElementById('linkG2').focus()
      }
      // document.removeEventListener('keydown', this.keyMove)
      // if(this.hasData){ // && document.getElementById('searchAll') == document.activebgElement
      //   document.addEventListener('keydown',this.keyMove)
      // }
    },
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    if (this.inviteCode) {
      this.value = this.inviteCode;
      this.search();
    }
  },
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {
    // document.removeEventListener('keydown', this.keyMove)
  }, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {}, //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>

<style lang="less" scoped>
//@import url(); 引入公共css类
.activebg .card{
  background:#eaeaea !important;
}
.group {
  .top {
    width: 90%;
    margin: 10px auto 0px;

    /deep/ .el-button--small {
      // height: 18px;
      // line-height: 18px;
      font-size: 12px;
      font-weight: 400;
      color: rgba(255, 255, 255, 1);
      padding: 9px 10px;
    }
  }
  .list {
    max-height: 390px;
    overflow: scroll;
    .list-box {
      .li-card {
        display: inline-block;
        margin-left: 24px;
        margin-top: 20px;
        .card {
          padding: 10px 20px;
          width: 310px;
          height: 110px;
          background: rgba(255, 255, 255, 1);
          box-shadow: 0px 0px 4px 0px rgba(47, 83, 234, 0.2);
          border-radius: 10px;
          margin-bottom: 1px;
          .left {
            flex: 1;
            .name {
              margin-top: 5px;
              font-size: 14px;
              font-weight: 500;
              color: rgba(51, 51, 51, 1);
              line-height: 20px;
              width: 200px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: pre;
            }
            .pass {
              font-size: 12px;
              font-weight: 500;
              color: rgba(153, 153, 153, 1);
              line-height: 17px;
            }
          }
          .right {
            .btn {
              cursor: pointer;
              border: none;
              min-width: 90px;
              max-width: 110px;
              padding: 7px 10px;
              background: rgba(47, 84, 235, 1);
              border-radius: 6px;
              font-size: 14px;
              font-weight: 500;
              color: rgba(255, 255, 255, 1);
              word-break: break-word;
            }
          }
        }
      }
    }
    .ser-nocontent {
      text-align: center;
      .no-box {
        margin-top: 20px;
      }
    }
  }
}
</style>
