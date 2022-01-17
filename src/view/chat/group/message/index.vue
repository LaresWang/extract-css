
<template>
  <div class="message" v-loading="uploadLoading" id="messageBox" @click="AtonBlur">
    <member-card-other
      :cardDialogVisible="cardDialogVisible"
      :userId="cardUserId"
      :groupId="groupId"
      :authStatus="authStatus"
      ref="cardOther"
      @handleclosecard="handleclosecard"
      @toAppeal="toAppeal('single')"
    ></member-card-other>
    <div class="message-box">
      <Title :authStatus="authStatus" @goSetting="goSetting" ref="menuTit">
        <div style="display: flex; align-items: center; cursor: pointer" class="noDrag">
          <span class="group-name" :title="groupName" @click="showGroup()">
            <i class="iconfont icon-user-group-Fill"></i>
            {{ groupName }}
          </span>
          <span class="group-people" v-if="groupInfo.people">({{ groupInfo.people }})</span>
          <img
            src="../../../../assets/images/edit.png"
            v-show="authStatus == '1' || authStatus == '2'"
            @click="onEditGroupInfo"
            class="group-edit-icon img_17"
            alt
          />
        </div>
      </Title>
      <div>
        <div id="resizeBox">
          <!-- 注释掉：社区容量达到上限后，前端的聊天窗口页面不应该显示：社区容量已占100%，点击升级社区容量 这条消息bug39284 -->
          <!-- <div class="noticeContainer" v-show="!isNetOff && !isReconn && showUpGroupNotice && authStatus !== '3'">
            <div class="upGroupNotice">
              {{ $t('chat_comm_set_0027', {exceedNum: this.groupExceedInfo.exceedNum}) }}
            </div>
            <i class="el-icon-close" @click="closeUpGroupNotice"></i>
          </div> -->
          <div class="appealContainer"
            v-if="!isNetOff && !isReconn && (showAppealWarnNotice||showAppealClosureNotice)"
            @click="toAppeal('group')">
            <div class="appealNotice" v-show="showAppealWarnNotice">
              {{ $t('appeal_0011') }}
            </div>
            <div class="appealNotice" v-show="showAppealClosureNotice">
              {{ $t('appeal_0009') }}
            </div>
            <i class="el-icon-arrow-right"></i>
          </div>
          <div class="maskVisible" v-show="maskVisible"></div>
          <div class="mess-talk custom-scrollbar" ref="talkGroup" id="talk">

            <div class="loadmore" v-if="hasMore" v-loading="listLoading" element-loading-spinner="el-icon-loading" @click="loadmorelist()">
              {{ $t('Universal_0361') }}
            </div>
            <div class="loadmore2 nomore"
              v-if="!hasMore && chatlistFlag"
              element-loading-spinner="el-icon-loading"> <!-- && noMoreShowFlg-->
              <div class="chatInfo">
                  <img 
                    class="avater" 
                    :src="findImage(groupInfo.groupAvatar)"
                    @click="openImgView"
                    @error="replaceImg" 
                    style="-webkit-user-drag:none;" 
                  />

                  <p class="pre">{{groupInfo.groupName}}</p><!--groupInfo.groupName-->
                  <span>{{ $t('chat_0001', {saveTime}) }}</span>
                  <div
                    @click="ShowGroupInvite"
                    class="invitebtn"
                    v-if="groupInfo.people < groupInfo.maxPeople && groupValidationActive != 2">
                    {{ $t('chat_0036')}}
                  </div>
              </div>
            </div>
            <!-- 图片查看 -->
            <viewer :images="imglsit" class="viewer" ref="viewer" @inited="inited">
              <img v-for="src in imglsit" :src="src.url" :key="src.msgId" alt style="display: none" />
            </viewer>
            <div class="mess-talk-self">
              <!-- ########## 在线消息  别人发送的############# -->
              <!-- 多选实时消息 -->
              <el-checkbox-group v-if="mutiChooseTag" v-model="checkList2" class="talkcheck">
                <el-checkbox
                  v-for="(item, index) in chatList"
                  v-if="item.msgType != '14'"
                  :label="item"
                  :key="`${item._id}${index}`"
                  :disabled="item.disabled || item.sendStatus == 1 || item.sendStatus == -1"
                  data-list="chatList"
                  :id="item['msgId']"
                  :ref="topMsgOrder == item.msgOrder ? 'activeRef' : ''"
                  :class="
                    item.fromType == '408' ||
                    item.fromType == '409' ||
                    item.fromType == '410' ||
                    item.fromType == '201' ||
                    item.fromType == '215' ||
                    item.fromType == '212'
                      ? 'hidden'
                      : item.msgType != '24' && getShowTimestamp(item.timestamp,chatList[index-1]) && item.disabled
                      ? 'disabledWithTime'
                      : item.msgType != '24' && getShowTimestamp(item.timestamp,chatList[index-1])
                      ? 'higher'
                      : item.disabled
                      ? 'disabled'
                      : ''
                  "
                  :value="item.checked"
                  @change="multiSelectValidation(item)"
                  :checked="item.checked"
                >
                  <div class="infotime" v-if="item.msgType != '24' && getShowTimestamp(item.timestamp,chatList[index-1])">
                    {{ item.timestamp | diffTimeHand }}
                  </div>
                  <div
                    v-if="
                      item.msgType != '4' &&
                        item.msgType != '7' &&
                        item.msgType != '44' &&
                        item.msgType != '26' &&
                        item.msgType != '13' &&
                        item.msgType != '24' &&
                        item.msgType != '14' &&
                        item.msgType != '8' &&
                        item.msgType != '31' &&
                        item.msgType != '61'
                    "
                  >
                    <div class="mess-detail flex" v-if="item.fromId != userId">
                      <span @click="lookMemberCard(item.fromId)" @contextmenu.prevent="rightClick($event, item)" class="member-icon-class">
                        <MemberIcon
                          :image="showGroupMemberIcon(item)"
                          :auth-status="getAuthStatusInGroup(item.fromId)"
                          :userRank="showGroupMemberLevel(item).userRank"
                          :vipType="showGroupMemberLevel(item).vipType"
                        />
                      </span>
                      <span class="mess-words other-msg">
                        <p class="group-member-name-class">
                          {{ showGroupMemberName(item) }}
                          <LuckIdIcon
                            v-if="showGroupMemberLevel(item).inviteCodeType == 1"
                            :inviteCode="showGroupMemberLevel(item).inviteCode"
                            :userRank="showGroupMemberLevel(item).userRank"
                            iconType="medium"
                            :vipType="showGroupMemberLevel(item).vipType"
                            :inviteCodeType="showGroupMemberLevel(item).inviteCodeType"
                            :listFlag="true"
                          />
                          <LevelIcon
                            :inviteCode="showGroupMemberLevel(item).inviteCode"
                            :userRank="showGroupMemberLevel(item).userRank"
                            iconType="medium"
                            :vipType="showGroupMemberLevel(item).vipType"
                            :inviteCodeType="showGroupMemberLevel(item).inviteCodeType"
                          />
                        </p>
                        <div id="talkbubble" :class="[getPopperClassName(item, 0),maxWidth(item),imgBubble(item)]">
                          <MessageFormatOnline
                            v-bind:item="item"
                            :imglsit="imglsit"
                            :isShowRight="false"
                            :showAppealClosureNotice="showAppealClosureNotice"
                            :fromGroupType="fromGroupType"
                            :groupAuthByUser="groupAuthByUser"
                            :friendId="groupInfo.id"
                            @delMsg="delMsg"
                            @mutiChoose="mutiChoose"
                            @withdrawMessage="withdrawMessage(item)"
                            @transferQuote="transferQuote"
                            @toAppeal="toAppeal('single')"
                            @handSendImg="handSendImg"
                            @reHandSendVideo="reHandSendVideo"
                            @reHandSendFile="reHandSendFile"
                          />
                        </div>
                        <QuotFormate v-if="item.msgType == 25" :item="item" :emojiList="emojiList"></QuotFormate>
                      </span>
                    </div>

                    <!--在线消息 自己发送的 -->
                    <div
                      class="mess-detail-self flex justify-end"
                      v-if="
                        item.fromId == userId &&
                          item.msgType != '4' &&
                          item.msgType != '7' &&
                          item.msgType != '44' &&
                          item.msgType != '26' &&
                          item.msgType != '24' &&
                          item.msgType != '8' &&
                          item.msgType != '31' &&
                          item.msgType != '61'
                      "
                    >
                      <span class="mess-words self-msg">
                        <p class="group-member-name-class">
                          {{ item.nickName }}
                          <LuckIdIcon
                            v-if="item.inviteCodeType == 1"
                            :inviteCode="item.inviteCode"
                            :userRank="item.userRank"
                            iconType="medium"
                            :vipType="item.vipType"
                            :inviteCodeType="item.inviteCodeType"
                            :listFlag="true"
                          />
                          <LevelIcon
                            :inviteCode="myInfo.inviteCode"
                            :userRank="myInfo.userRank"
                            iconType="medium"
                            :vipType="myInfo.vipType"
                            :inviteCodeType="myInfo.inviteCodeType"
                          />
                        </p>
                        <div class="flex" style="justify-content: flex-end;align-items:flex-end; width:100%">
                          <MessageSendStauts
                            v-bind:item="item"
                            :class="item.msgType == '25' ? 'specialStatus' : ''"
                            @handSendImg="handSendImg"
                            @resendMsgs="sendQuill(item)"
                            @reHandSendVideo="reHandSendVideo"
                            @reHandSendFile="reHandSendFile"
                          />
                          <div id="talkbubblee" :class="[getPopperClassName(item, 1),maxWidth(item),imgBubble(item)]">
                            <MessageFormatOnline
                              v-bind:item="item"
                              :imglsit="imglsit"
                              :isShowRight="false"
                              :showAppealClosureNotice="showAppealClosureNotice"
                              :fromGroupType="fromGroupType"
                              :groupAuthByUser="groupAuthByUser"
                              :friendId="groupInfo.id"
                              @delMsg="delMsg"
                              @mutiChoose="mutiChoose"
                              @withdrawMessage="withdrawMessage(item)"
                              @transferQuote="transferQuote"
                              @toAppeal="toAppeal('single')"
                              @handSendImg="handSendImg"
                              @reHandSendVideo="reHandSendVideo"
                              @reHandSendFile="reHandSendFile"
                            />
                          </div>
                        </div>
                        <QuotFormate v-if="item.msgType == 25" :item="item" :emojiList="emojiList"></QuotFormate>
                      </span>
                      <span @click="lookMemberCard(item.fromId)" style="width:42px;height:42px;margin-right:-10px;">
                        <MemberIcon
                          :image="showGroupMemberIcon(item)"
                          :auth-status="getAuthStatusInGroup(item.fromId)"
                          :userRank="showGroupMemberLevel(item).userRank"
                          :vipType="showGroupMemberLevel(item).vipType"
                        />
                      </span>
                    </div>
                    <!-- 当前 的 通知类消息 -->
                  </div>
                  <div
                    v-if="
                      item.msgType == '4' ||
                        item.msgType == '7' ||
                        item.msgType == '44' ||
                        item.msgType == '26' ||
                        item.msgType == '14' ||
                        item.msgType == '8' ||
                        item.msgType == '31' ||
                        item.msgType == '61'
                    "
                    class="notice-wrap"
                  >
                    <MessageNotice v-bind:item="item" :sender="showSenderName(item)" :receiver="showReceiverName(item)" />
                  </div>
                </el-checkbox>
              </el-checkbox-group>
              <!--实时无多选-->
              <div v-if="!mutiChooseTag">
                <div
                  v-for="(item, index) in chatList"
                  :label="item"
                  :key="`${item._id}${index}`"
                  :disabled="item.disabled || item.sendStatus == 1 || item.sendStatus == -1"
                  data-list="chatList"
                  :id="item['msgId']"
                  :ref="topMsgOrder == item.msgOrder ? 'activeRef' : ''"
                  :class="
                    item.fromType == '408' ||
                    item.fromType == '409' ||
                    item.fromType == '410' ||
                    item.fromType == '201' ||
                    item.fromType == '215' ||
                    item.fromType == '212'
                      ? 'hidden'
                      : ''
                  "
                >
                  <div class="infotime" v-if="item.msgType != '24' && getShowTimestamp(item.timestamp,chatList[index-1])">
                    {{ item.timestamp | diffTimeHand }}
                  </div>
                  <div
                    v-if="
                      item.msgType != '4' &&
                        item.msgType != '7' &&
                        item.msgType != '44' &&
                        item.msgType != '26' &&
                        item.msgType != '13' &&
                        item.msgType != '24' &&
                        item.msgType != '14' &&
                        item.msgType != '8' &&
                        item.msgType != '31' &&
                        item.msgType != '61'
                    "
                  >
                    <div class="mess-detail flex" v-if="item.fromId != userId">
                      <span @click="lookMemberCard(item.fromId)" @contextmenu.prevent="rightClick($event, item)" class="member-icon-class">
                        <MemberIcon
                          :image="showGroupMemberIcon(item)"
                          :auth-status="getAuthStatusInGroup(item.fromId)"
                          :userRank="showGroupMemberLevel(item).userRank"
                          :vipType="showGroupMemberLevel(item).vipType"
                        />
                      </span>
                      <span class="mess-words other-msg">
                        <p class="group-member-name-class">
                          {{ showGroupMemberName(item) }}
                          <LuckIdIcon
                            v-if="showGroupMemberLevel(item).inviteCodeType == 1"
                            :inviteCode="showGroupMemberLevel(item).inviteCode"
                            :userRank="showGroupMemberLevel(item).userRank"
                            iconType="medium"
                            :vipType="showGroupMemberLevel(item).vipType"
                            :inviteCodeType="showGroupMemberLevel(item).inviteCodeType"
                            :listFlag="true"
                          />
                          <LevelIcon
                            :inviteCode="showGroupMemberLevel(item).inviteCode"
                            :userRank="showGroupMemberLevel(item).userRank"
                            iconType="medium"
                            :vipType="showGroupMemberLevel(item).vipType"
                            :inviteCodeType="showGroupMemberLevel(item).inviteCodeType"
                          />
                        </p>
                        <div
                          id="talkbubble"
                          @click="item.msgType == '15' ? lookcard(item) : null"
                          :class="[getPopperClassName(item, 0), maxWidth(item),imgBubble(item)]"
                          class="voice-accept"
                        >
                          <MessageFormatOnline
                            v-bind:item="item"
                            :imglsit="imglsit"
                            :groupAuthByUser="groupAuthByUser"
                            :soundUrlObj="soundUrlObj"
                            :friendId="groupInfo.id"
                            :showAppealClosureNotice="showAppealClosureNotice"
                            :fromGroupType="fromGroupType"
                            @handArm="handArm"
                            @acceptMessage="acceptMessage(item)"
                            @delMsg="delMsg"
                            @scrollBottom="scrollBottom"
                            @mutiChoose="mutiChoose"
                            @withdrawMessage="withdrawMessage(item)"
                            @transferQuote="transferQuote"
                            @toAppeal="toAppeal('single')"
                            @handSendImg="handSendImg"
                            @reHandSendVideo="reHandSendVideo"
                            @reHandSendFile="reHandSendFile"
                          />
                          <i class="iconfont icon-dian voice-icon" v-if="item.msgType == '9' && item.msgBody.unreadMessage == true"></i>
                        </div>
                        <QuotFormate
                          v-if="item.msgType == 25"
                          :item="item"
                          :emojiList="emojiList"
                          @lookQuoteCard="lookQuoteCard"
                        ></QuotFormate>
                      </span>
                    </div>

                    <!--在线消息 自己发送的 -->
                    <div class="mess-detail-self flex justify-end" v-if="item.fromId == userId">
                      <span class="mess-words self-msg">
                        <p class="group-member-name-class">
                          {{ item.nickName }}
                          <LuckIdIcon
                            v-if="item.inviteCodeType == 1"
                            :inviteCode="item.inviteCode"
                            :userRank="item.userRank"
                            iconType="medium"
                            :vipType="item.vipType"
                            :inviteCodeType="item.inviteCodeType"
                            :listFlag="true"
                          />
                          <LevelIcon
                            :inviteCode="myInfo.inviteCode"
                            :userRank="myInfo.userRank"
                            iconType="medium"
                            :vipType="myInfo.vipType"
                            :inviteCodeType="myInfo.inviteCodeType"
                          />
                        </p>
                        <div class="flex" style="justify-content: flex-end;align-items:flex-end; width:100%">
                          <MessageSendStauts
                            v-bind:item="item"
                            :class="item.msgType == '25' ? 'specialStatus' : ''"
                            @handSendImg="handSendImg"
                            @resendMsgs="sendQuill(item)"
                            @reHandSendVideo="reHandSendVideo"
                            @reHandSendFile="reHandSendFile"
                          />
                          <div id="talkbubblee"
                               @click="item.msgType == '15' ? lookcard(item) : null"
                               :class="[getPopperClassName(item, 1), maxWidth(item),imgBubble(item)]"
                          >
                            <MessageFormatOnline
                              v-bind:item="item"
                              :imglsit="imglsit"
                              :groupAuthByUser="groupAuthByUser"
                              :soundUrlObj="soundUrlObj"
                              :friendId="groupInfo.id"
                              :showAppealClosureNotice="showAppealClosureNotice"
                              :fromGroupType="fromGroupType"
                              @handArm="handArm"
                              @scrollBottom="scrollBottom"
                              @delMsg="delMsg"
                              @mutiChoose="mutiChoose"
                              @withdrawMessage="withdrawMessage(item)"
                              @transferQuote="transferQuote"
                              @toAppeal="toAppeal('single')"
                              @handSendImg="handSendImg"
                              @reHandSendVideo="reHandSendVideo"
                              @reHandSendFile="reHandSendFile"
                            />
                          </div>
                        </div>
                        <QuotFormate
                          v-if="item.msgType == 25"
                          :item="item"
                          :emojiList="emojiList"
                          @lookQuoteCard="lookQuoteCard"
                        ></QuotFormate>
                      </span>
                      <span @click="lookMemberCard(item.fromId)" style="width:42px;height:42px;margin-right:-10px;">
                        <MemberIcon
                          :image="showGroupMemberIcon(item)"
                          :auth-status="getAuthStatusInGroup(item.fromId)"
                          :userRank="showGroupMemberLevel(item).userRank"
                          :vipType="showGroupMemberLevel(item).vipType"
                        />
                      </span>
                    </div>
                    <!-- 当前 的 通知类消息 -->
                  </div>
                  <div
                    v-if="
                      item.msgType == '4' ||
                        item.msgType == '7' ||
                        item.msgType == '44' ||
                        item.msgType == '26' ||
                        item.msgType == '14' ||
                        item.msgType == '8' ||
                        item.msgType == '31' ||
                        item.msgType == '61'
                    "
                    class="notice-wrap"
                  >
                    <MessageNotice :item="item" :sender="showSenderName(item)" :receiver="showReceiverName(item)" @reEditMsg="reEditMsg" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 工具栏-->
          <div id="resize" v-if="!silentMaskShow" @mousedown="resizeChange"></div>
          <div v-else style="height: 6px"></div>
          <div id="down" class="mess-footer align-center" ref="down">
            <div class="chatother">
              <el-popover placement="top-start" width="424" trigger="click" v-model="emojiVisible">
                <div class="emojList">
                  <span v-for="item in emojiList" :key="item.id">
                    <img style :title="item.tag" :src="`/resources/emoji/${item.file}`" @click="insertImg(item.file, item.tag)" />
                  </span>
                </div>
                <span slot="reference" class="emojIcon">
                  <img draggable='false' src="../../../../assets/images/send_msg_emoj.png" />
                </span>
              </el-popover>
              <span class="add" @click="handUpload()">
                <img draggable='false' src="../../../../assets/images/send_msg_folder.png" />
                <input type="file" :multiple="multiple" @change="changeHand($event)" ref="files" style="display: none" />
              </span>
              <img draggable='false' src="../../../../assets/images/send_msg_screenshot.png" @click="captureScreen" />
              <el-popover
                ref="screenShot"
                trigger="click"
                placement="bottom"
                visible-arrow="false"
                v-model="screenShotVisible"
                popper-class="screen-select-class"
              >
                <div>
                  <el-checkbox v-model="screenSelect" class="screenSelectClass" @change="screenSelectChange">
                    {{ $t('chat_comm_set_0022') }}
                  </el-checkbox>
                </div>
                <i slot="reference" v-popover:screenShot class="el-icon-caret-bottom captureScreenClass"></i>
              </el-popover>
            </div>
            <!-- <span class="wordNumber">{{TiLength}}/1500</span> -->
            <div class="mess-square" id="mess-squareId" @contextmenu.prevent="_quillRightClick($event)">
              <quill-editor
                class="ql-editor"
                v-model="texthtml"
                ref="myQuillEditor"
                :options="editorOption"
                @keydown.ctrl.enter.native="editorWrap()"
                @keydown.alt.enter.native="editorWrap()"
                @keydown.meta.enter.native="editorWrap()"
                @paste.native="pasteMe($event)"
                @ready="onEditorReady($event)"
                @blur="onEditorBlur($event)"
                @change="onEditorChange($event, decimalNum)"
              ></quill-editor>
              <!-- @keyup.shift.50.native="getAtUserList()"
                @keypress.shift.50.native="getAtUserList()"
                @keydown.shift.50.native="getAtUserList()" -->
            </div>
            <div class="mess-send">
              <el-tag closable type="info" @close="closeQuote()" effect="dark" v-show="quoteVisible" class="quote"
                ><span ref="quoteMsgs">{{ quoteMsg }}</span></el-tag
              >
              <button class="send-btn" @click="sendQuillByThrottle" :disabled="sendBtnDisabled">
                {{ $t('Universal_0046') }}
              </button>
            </div>

            <SilentMask
              v-show="silentMaskShow"
              :fromType="fromType"
              class="popContainer"
              ref="silentMask"
              :style="{ height: silentMaskHeight }"
            ></SilentMask>
          </div>
        </div>
        <div v-show="isSomebodyAtYou" class="by-at" @click.stop="_at_handleScrollToCurrentAt"
          :style="{width: atWidth}">
          {{ $t('chat_0041') }}
          <i class="el-icon-close" @click.stop="_at_handleCloseAtTips"></i>
        </div>
        <!-- 消息提示按钮 -->
        <div v-show="isShowMoreList && !isSomebodyAtYou" class="by-more-list" @click="scrollBottom">
          <el-button  v-if="newMsgLength > 0" class="by-more-list" icon="el-icon-arrow-down"> 
            {{ $t('chat_0128', {value: newMsgLength}) }}</el-button>
          <el-button v-else class="by-more-list" icon="el-icon-arrow-down"></el-button>
        </div>
        <div v-if="!rightStatus" id="checklist" class="mess-checklist">
          <ul>
            <li class="liMenu" :class="idx == index ? 'hover' : ''" @click="son(item, idx)" v-for="(item, idx) in menu" :key="idx">
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    <!--多选操作面板-->
    <el-drawer
      title
      :visible.sync="mutiPanel"
      :direction="'btt'"
      :with-header="true"
      :modal="false"
      :wrapperClosable="false"
      :show-close="true"
      class="mutiPanel"
      style="height: 180px"
      id="mutiPanel"
      @close="closeMutiPnel()"
    >
      <span @click="multiRelay(false)">
        <img class="img_42" src="../../../../assets/images/trans_relay.png" />
        <p style="color: #666; font-size: 12px">{{ $t('chat_0033') }}</p>
      </span>
      <span @click="multiRelay(true)">
        <img class="img_42" src="../../../../assets/images/trans_merge.png" />
        <p style="color: #666; font-size: 12px">{{ $t('chat_0034') }}</p>
      </span>
      <span @click="batchDelMsg()">
        <img class="img_42" src="../../../../assets/images/trans_delete.png" /><br />
        <p style="color: #666; font-size: 12px">{{ $t('chat_0032') }}</p>
      </span>
    </el-drawer>
    <!--群设置弹框 groupSystemAble-->
    <el-drawer
      title="我是标题"
      :visible.sync="groupSystemAble"
      :wrapperClosable="true"
      :direction="'rtl'"
      :close-on-click-modal="false"
      :with-header="false"
      :modal="false"
     
      @close="closeDialog"
      size="310px"
      style="margin-top: -53px"
    >
    <template v-if="groupSystemAble">
      <GroupInfo
        :groupInfo="groupInfo"
        :authStatus="authStatus"
        :showAppealClosureNotice="showAppealClosureNotice"
        @closeDialog="closeDialog"
        v-if="groupSystemAbleInfo"
        @refreshGroupInfo="refreshGroupInfo"
        @toAppeal="toAppeal('single')"
        ref="groupDetailsInfo"
      ></GroupInfo>

      <div class="groupSystemBox" v-if="groupSystemAbleSet">
        <div class="top">
          <span>{{ $t('Universal_0065') }}</span>
          <i class="el-icon-close" @click="groupSystemAble = false;groupSystemAbleSet=false"></i>
        </div>
        <div class="content" style="margin-top: 50px">
          <ul>
            <li>
              <span>{{ $t('Universal_0362') }}</span>
              <el-switch
                v-model="groupSystemObj.msgTopValue"
                active-color="#2F54EB"
                inactive-color="#EDEDED"
                active-value="1"
                inactive-value="0"
                :disabled="groupSystemObj.msgTopClick"
                @change="stickyChange"
              ></el-switch>
            </li>
            <li>
              <span>{{ $t('chat_0057') }}</span>
              <el-switch
                v-model="groupSystemObj.msgOutlineValue"
                active-color="#2F54EB"
                inactive-color="#EDEDED"
                active-value="1"
                inactive-value="0"
                :disabled="groupSystemObj.msgOutlineClick"
                @change="NotifyChange"
              ></el-switch>
            </li>
            <li @click="historyVisible = true">
              <span>{{ $t('chat_0059') }}</span>
              <i class="el-icon-arrow-right"></i>
            </li>
            <li @click="tipOff()">
              <span>{{ $t('report_0001') }}</span>
              <i class="el-icon-arrow-right"></i>
            </li>
          </ul>
        </div>
        <div class="top" v-show="authStatus != 3">
          <span>{{ $t('chat_comm_manage_0001') }}</span>
        </div>
        <div class="content" v-show="authStatus != 3">
          <ul>
            <li @click="groupTypeVisible = true">
              <span>{{ $t('chat_createcommunity_0006') }}</span>
              <span class="many-select">
                {{ groupType }}
                <i class="el-icon-arrow-right"></i>
              </span>
            </li>
            <li @click="groupValidationVisible = true">
              <span>{{ $t('chat_comm_manage_0002') }}</span>
              <span class="many-select" style="text-align: right">
                {{ groupValidation }}
                <i class="el-icon-arrow-right"></i>
              </span>
            </li>
            <li @click="authorityOpen = !authorityOpen">
              <span>{{ $t('chat_comm_manage_0022') }}</span>
              <span>
                <i :class="!authorityOpen ? 'el-icon-arrow-right' : 'el-icon-arrow-down'"></i>
              </span>
            </li>
            <ul class="authorityOpen" v-if="authorityOpen">
              <!--              <li>-->
              <!--                <span>截屏提醒</span>-->
              <!--                <el-switch-->
              <!--                  v-model="groupSystemObj.screenNotice"-->
              <!--                  active-color="#2F54EB"-->
              <!--                  inactive-color="#EDEDED"-->
              <!--                  active-value="1"-->
              <!--                  inactive-value="0"-->
              <!--                  :disabled="groupSystemObj.screenNoticeClick"-->
              <!--                  @change="screenshotsReminder"-->
              <!--                ></el-switch>-->
              <!--              </li>-->
              <li>
                <span>{{ $t('chat_comm_manage_0024') }}</span>
                <el-switch
                  v-model="groupSystemObj.forbiddenWordsStatus"
                  active-color="#2F54EB"
                  inactive-color="#EDEDED"
                  active-value="1"
                  inactive-value="0"
                  :disabled="groupSystemObj.forbiddenWordsStatusClick"
                  @change="forbiddenWords"
                ></el-switch>
              </li>
              <li>
                <span>{{ $t('chat_comm_manage_0025') }}</span>
                <el-switch
                  v-model="groupSystemObj.chatSingle"
                  active-color="#2F54EB"
                  inactive-color="#EDEDED"
                  active-value="1"
                  inactive-value="0"
                  :disabled="groupSystemObj.chatSingleClick"
                  @change="memberSingleChat"
                ></el-switch>
              </li>
              <li>
                <span>{{ $t('chat_comm_manage_0026') }}</span>
                <el-switch
                  v-model="groupSystemObj.sendFile"
                  active-color="#2F54EB"
                  inactive-color="#EDEDED"
                  active-value="1"
                  inactive-value="0"
                  :disabled="groupSystemObj.sendFileClick"
                  @change="sendPictures"
                ></el-switch>
              </li>
              <li>
                <span>{{ $t('chat_comm_manage_0027') }}</span>
                <el-switch
                  v-model="groupSystemObj.sendUrl"
                  active-color="#2F54EB"
                  inactive-color="#EDEDED"
                  active-value="1"
                  inactive-value="0"
                  :disabled="groupSystemObj.sendUrlClick"
                  @change="sendConnection"
                ></el-switch>
              </li>
              <li>
                <span>{{ $t('chat_comm_manage_0029') }}</span>
                <el-switch
                  v-model="groupSystemObj.sendRedpacketStatus"
                  active-color="#2F54EB"
                  inactive-color="#EDEDED"
                  active-value="1"
                  inactive-value="0"
                  :disabled="groupSystemObj.sendRedpacketStatusClick"
                  @change="sendRedpacket"
                ></el-switch>
              </li>
            </ul>
            <li @click="messageSaveTime">
              <span>{{ $t('chat_0058') }}</span>
              <span class="many-select">
                {{ saveTime }}
                <i class="el-icon-arrow-right"></i>
              </span>
            </li>
          </ul>
        </div>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <div slot="footer" class="drawer-footer outGroup">
          <span v-if="authStatus == 1" @click="releaseGroup()">
            {{ $t('chat_comm_set_0004') }}
          </span>
          <span v-else @click="quitGroup()">
            {{ $t('chat_comm_set_0006') }}
          </span>
        </div>
      </div>
      <GroupMember
        v-bind:dialogMember="dialogMember"
        groupMemberFrom="group"
        :groupId="groupInfo.id"
        :people="groupInfo.people"
        :maxPeople="groupInfo.maxPeople"
        :groupSystemAbleMem="groupSystemAbleMem"
        :authStatus="this.authStatus"
        :memberSingleChatStatus="groupSystemObj.chatSingle"
        :showAppealClosureNotice="showAppealClosureNotice"
        
        @closeDialog="closeDialog"
        @ShowGroupInvite="ShowGroupInvite"
        @ShowRemark="ShowRemark"
        @updatePeopleInGroup="updatePeopleInGroup"
        v-if="groupSystemAbleMem"
        ref="groupmember"
      />
    </template>
    </el-drawer>
    <!--清除聊天记录-->
    <el-dialog :title="$t('chat_0059')" :visible.sync="historyVisible" width="270px" :center="true" class="popupmsg">
      <span>{{ $t('chat_0060') }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="historyVisible = false">
          {{ $t('Universal_0063') }}
        </el-button>
        <el-button size="mini" type="primary" @click="clearLocal">
          {{ $t('Universal_0062') }}
        </el-button>
      </span>
    </el-dialog>
    <!--消息保存时长-->
    <el-dialog :title="$t('chat_0058')" :visible.sync="saveTimeVisible" width="270px" :center="true" class="popupmsg">
      <ul class="selectItem">
        <li
          v-for="(item, index) in saveTimeArr"
          :key="index"
          :class="saveTimeActive == index ? 'active' : ''"
          @click="saveTimeSelected(item, index)"
        >
          {{ item.label }}
          <i class="el-icon-check"></i>
        </li>
      </ul>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancelsaveExpireTime()">
          {{ $t('Universal_0063') }}
        </el-button>
        <el-button size="mini" type="primary" @click="saveExpireTime(saveTimeActive)">
          {{ $t('Universal_0062') }}
        </el-button>
      </span>
    </el-dialog>
    <!--设置群类型-->
    <el-dialog :title="$t('chat_createcommunity_0006')" :visible.sync="groupTypeVisible" width="270px" :center="true" class="popupmsg">
      <ul class="selectItem">
        <li
          v-for="(item, index) in groupTypeArr"
          :key="index"
          :class="groupTypeActive == item.value ? 'active' : ''"
          @click="groupTypeSelected(item, index)"
        >
          {{ item.label }}
          <i class="el-icon-check"></i>
        </li>
      </ul>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancelSaveGroupType()">
          {{ $t('Universal_0063') }}
        </el-button>
        <el-button size="mini" type="primary" @click="saveGroupType(groupTypeSelect)">
          {{ $t('Universal_0062') }}
        </el-button>
      </span>
    </el-dialog>
    <!--设置群成员备注-->
    <el-dialog
      :title="$t('book_friend_0014')"
      :visible.sync="remarkVisible"
      width="270px"
      :center="true"
      class="popupmsg note-member"
      :modal-append-to-body="false"
      :modal="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="remarkStatus">
        <div class="tit">
          <img :src="changeValueV.userHeadImg" alt />
          {{ changeValueV.userNameAndId }}
        </div>
        <div class="member-notes">
          <el-input show-word-limit type="textarea" :maxlength="6" :rows="2" v-model="memberNotes" size="small"></el-input>
        </div>
        <div class="dialog-footer">
          <el-button size="mini" class="cancelBtn" @click="remarkVisible = false">
            {{ $t('Universal_0063') }}
          </el-button>
          <el-button size="mini" class="sureBtn" type="primary" @click="saveRemark">
            {{ $t('Universal_0062') }}
          </el-button>
        </div>
      </div>
    </el-dialog>
    <!--加群验证-->
    <el-dialog
        :title="$t('chat_comm_manage_0002')"
        :visible.sync="groupValidationVisible"
        width="340px"
        :center="true"
        class="popupmsg">
      <ul class="selectItem">
        <li
          v-for="(item, index) in groupValidationArr"
          :key="index"
          :class="groupValidationActive == item.value ? 'active' : ''"
          @click="groupValidationSelected(item, index)"
        >
          <span>{{ item.label }}</span>
          <i class="el-icon-check"></i>
        </li>
      </ul>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancelSaveGroupValidationgroup(groupValidationActive)">
          {{ $t('Universal_0063') }}
        </el-button>
        <el-button size="mini" type="primary" @click="saveGroupValidation(groupValidationActive)">
          {{ $t('Universal_0062') }}
        </el-button>
      </span>
    </el-dialog>
    <GroupAndInviteChat
      ref="groupInvite"
      :title="Comtit"
      from="group"
      :groupId="groupInfo.id"
      :groupInfo="groupInfo"
      :authStatus="authStatus"
      :GroupInviteVisible.sync="GroupInviteVisible"
      :mergeTransfer="merge"
      :mergeTransferName="mergeTransferName"
      :showAppealClosureNotice="showAppealClosureNotice"
      @confirmDialogHand="confirmDialogHand"
      @cancelDialogHand="cancelDialogHand"
      @transferSuccess="transferSuccess"
    />
    <AppealsDialog
      ref="appeal"
      :groupId="groupInfo.id"
      :groupInfo="groupInfo"
      :appealInfo="appealInfo"
      :AppealsVisible.sync="AppealsVisible"
      :impeachFromtype="impeachFromtype"
      @cancelDialogHand="cancelAppealsDialogHand"
      @toImpeach="toImpeachDialog"
    />
    <ImpeachDialog
      ref="impeach"
      :impeachFromtype="impeachFromtype"
      :groupId="groupInfo.id"
      :groupInfo="groupInfo"
      :appealInfo="appealInfo"
      :ImpeachVisible.sync="ImpeachVisible"
      @cancelDialogHand="cancelImpeachDialogHand"
    />
    <DialogAddFriendVisible
      ref="myordernum"
      :dialogAddFriendsVisible="dialogAddFriendsVisible"
      @handCancelFriDialog="handCancelFriDialog"
      @handConfirmFriDialog="handConfirmFriDialog"
      :friendData="friendData"
      @toAppeal="toAppeal('single')"
    />
    <DialogAddGroupVisible
      :dialogAddGroupsVisible="dialogAddGroupsVisible"
      @handConfirmGroupDialog="handConfirmGroupDialog"
      @handCloseAddGroups="handCancelGroupDialog"
      :groupData="groupData"
      @toAppeal="toAppeal('single')"
    />
    <GroupCard :groupInfo="groupCardInfo" ref="groupCard" @toAppeal="toAppeal('single')"></GroupCard>
    <GroupInfoEdit :info="groupInfo" ref="groupInfoEdit" />
    <el-dialog
      :title="$t('chat_select_chat_0007')"
      :visible.sync="sendFile"
      width="320px"
      class="popupmsg"
      append-to-body
      :modal-append-to-body="false"
      :modal="false"
      @close="cancelSendFile"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="sendFile">
        <img style="width: 38px; height: 38px; border-radius: 50%" :src="groupInfo.groupAvatar" />
        <span>{{ this.groupInfo.groupName }}</span>
      </div>
      <el-input type="textarea" class="sendFileInput" :rows="2" resize="none" :disabled="true" v-model="fileName" size="small"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="(sendFile = false), cancelSendFile()">
          {{ $t('Universal_0063') }}
        </el-button>
        <el-button size="mini" type="primary" @click="(sendFile = false), sendFileConfirm($event)">
          {{ $t('Universal_0062') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
// import { ipcRenderer } from "electron";
import Title from "../components/title.vue";
// import DialogAddGroupVisible from "@/view/add-friends-group/dialog/add-groups";
// import DialogAddFriendVisible from "@/view/add-friends-group/dialog/add-friends";

// import MemberCardOther from "@/components/memberCard/MemberCardOther";
// import MemberIcon from "@/components/memberIcon/MemberIcon";
// import { diffTimeInChat} from "@/utils";
import { mapState } from "vuex";
import bus from "@/utils/eventbus";
// import { uploadPicture} from "./server";
import { setGroupBase } from '../../server';
// import QuotFormate from '@/view/chat/components/common/QuotFormate';
// import emojiList from '@/utils/emoji.js';
// import GroupAndInviteChat from "@/components/chat/GroupAndInviteChat";
// import AppealsDialog from "@/view/chat/appeals";
// import ImpeachDialog from "@/view/chat/impeach";
// import MessageSendStauts from "@/view/chat/components/common/MessageSendStatus";
import GroupMember from "@/view/chat/group/member";
import GroupInfo from "../components/GroupInfo";
import GroupInfoEdit from "../components/GroupInfoEdit";
import SilentMask from "../components/SilentMask";
import GroupCard from "../components/GroupCard";
// import MessageFormatOnline from "@/view/chat/components/common/MessageFormatOnline";
// import MessageNotice from "./MessageNotice";
import { update_person_info } from "../member/server";
import { convertToPinyin } from "@/utils/pinyin";
// import LevelIcon from "@/components/memberIcon/LevelIcon";
// import LuckIdIcon from "@/components/memberIcon/luckIdIcon";

// import defaultImg from '@/view/chat/images/default.png';
import defaultImg from '@/assets/images/default.png';

import mixins from '../../mixin/mixin';
import groupMixin from '../../mixin/groupMixin';
import SQLUtils from '@/components/db/sqlite.js';
import  { imgView } from '@/utils/util.js'

export default {
  name: 'Group',
  mixins: [mixins, groupMixin],
  //import引入的组件需要注入到对象中才能使用
  components: {
    Title,
    GroupMember, //群成员
    GroupInfo,
    SilentMask,
    GroupCard,
    GroupInfoEdit,
  },
  data() {
    let thisVueInstance=this;
    //这里存放数据
    return {
      fromGroupType:'group',
      memberPopverVisible: true,
      isAt: false,
      // membList: [],
      editorOption: {
        placeholder: this.$t('chat_0002'),
        theme: "bubble", // or 'bubble'
        formats: ["image", "alt", "height", "width", "background", "color","mention"],
        modules: {
          toolbar:[],
          clipboard: {
            matchers: [
            ]
          },
          mention: {
            mentionDenotationChars: ["@"],
            positioningStrategy: "fixed",
            allowedChars:/^[a-zA-Z0-9_\s\u4e00-\u9fa5]*$/,
            defaultMenuOrientation:"top",
            spaceAfterInsert:true,
            mentionContainerClass:"atBox",
            listItemClass:"atInput",
            dataAttributes:['id',"value",'denotationChar', 'link',
              'target','disabled',"image", "nickName","nick_name","nick_name_pinyin",
              "member_notes", "member_notes_pinyin","friendNotes","friendNotes_pinyin"],
            renderItem: (data) => {
              return `
                  <div style='width:100%;overflow:hidden;'>
                    <img src="${data['image']||require('../../../../assets/images/defalut@.png')}"
                    onerror="javascript:this.src='${defaultImg}';" />
                    <span>${data['nickName']}</span>
                  </div>
                `
            },
            onSelect:(item, insertItem)=>{
              insertItem(item,true)
              // console.log(item)
            },
            source: async function(searchTerm, renderList, mentionChar) {
              let values;
              if (mentionChar == "@") {
                values = await SQLUtils.getALLAtUserList(thisVueInstance.groupId,thisVueInstance.authStatus);
              }
              // console.log(values,searchTerm)
              if (searchTerm.length === 0) {
                renderList(values, searchTerm);
              } else {
                const matches = [],str=searchTerm.toLowerCase();
                for (let i = 0,item; i < values.length; i++){
                  item=values[i];
                  if (
                    //  输入框 输入@搜索用户 过滤条件
                    item.nick_name && item.nick_name.toLowerCase().indexOf(str) > -1 ||
                    item.nick_name_pinyin && item.nick_name_pinyin.toLowerCase().indexOf(str) > -1 ||
                    item.friendNotes && item.friendNotes.toLowerCase().indexOf(str) > -1 ||
                    item.friendNotes_pinyin && item.friendNotes_pinyin.toLowerCase().indexOf(str) > -1 ||
                    item.member_notes && item.member_notes.toLowerCase().indexOf(str) > -1 ||
                    item.member_notes_pinyin && item.member_notes_pinyin.toLowerCase().indexOf(str) > -1 ||
                    item.inviteCode && item.inviteCode.toLowerCase().indexOf(str) > -1
                  ){
                    matches.push(values[i]);
                  }
                }
                renderList(matches, searchTerm);
              }
            }
          }
        }
      },
      memberNickName:{},
      msgboddy: '',
      // at 相关
      atUserList2: false
    };
  },

  //监听属性 类似于data概念
  computed: {
    ...mapState({
      membList: state => {
        return state.search.membList;
      },
    }),
    atWidth() {
      if (this.$i18n.locale.includes('zh')) {
        return '100px';
      } else {
        return '150px';
      }
    }
  },
  //监控data中的数据变化
  watch: {
    async $route() {
      await this.init();
      await this.inCurrentGroup();
      this.stopVideo();
    },
    chatList(val) {
      if (localStorage.getItem('specailChat') == 'true') {
        localStorage.setItem('specailChat', false);
      } else {
        // this.scrollBottom();
      }
      console.log('val ====>',val);
      if (val && val.length > 0) {
        let msgType = val[val.length - 1].msgType;
        if (msgType == '4' || msgType == '7') {
          this.searchGroupMembersAndInfo();
        } else if (
          msgType == '1' ||
          msgType == '2' ||
          msgType == '6' ||
          msgType == '9' ||
          msgType == '10' ||
          msgType == '15' ||
          msgType == '25' ||
          msgType == '40' ||
          msgType == '61'
        ) {
          if (val[val.length - 1].fromIcon == undefined) {
            val[val.length - 1].fromIcon = this.memberImg[val[val.length - 1].fromId];
          }
        }
      }
    },
    getNetStatus(val) {
      this.isNetOff = val == 'offline' ? true : false;
    },
    getSocketStatus(val) {
      this.isReconn = val == 'online' ? false : true;
    },
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.initFlag = true;
    if (this.$route.query.item && this.$route.query.item['groupAuthByUser']) {
      this.groupAuthByUser = this.$route.query.item['groupAuthByUser'];
    }
    this.item = this.$route.query.item;
    bus.$on('closeMemberinfo',this.closeMember);
  },
  //方法集合
  methods: {
    // 打开图片查看器
    openImgView () {
      console.log('图片查看器=groupInfo=', this.groupInfo)
      imgView(this.groupInfo.groupAvatar, this.groupInfo.id)
    },
    closeMember(){
      this.groupSystemAble = false
    },
    //设置发送链接
    async sendConnection() {
      setGroupBase({
        id: this.groupId,
        sendConnectionStatus: this.groupSystemObj.sendUrl
      }).then(async res => {
        this.showResponseMessages(res);
        if (res.code == '200') {
          await this.updateGroupInfo({
            sendConnectionStatus: this.groupSystemObj.sendUrl
          });
        }
      });
    },

    //群成员备注
    async saveRemark() {
      let params = {
        groupId: this.groupId,
        userId: this.changeValueV.userId,
        memberNotes: this.memberNotes.trim()
      };
      let res = await update_person_info(params);
      if (res.code == '200') {
        this.remarkVisible = false;
        this.$message.success(res.msg);
        await window.vm
          .$knex('t_groups_member')
          .where('group_id', '=', params.groupId)
          .where('id', '=', params.userId)
          .update({
            member_notes: params.memberNotes,
            member_notes_pinyin: convertToPinyin(params.memberNotes)
          });
        await this.queryMember();
        if (this.$refs.groupmember) {
          this.$nextTick(async () => {
            if (this.groupSystemAble == true) {
              await this.$refs.groupmember.onMemberOpen();
            }
          });
        }
      } else {
        this.$message.error(res.msg);
      }
    },

    //设置发送文件
    sendPictures() {
      setGroupBase({
        id: this.groupId,
        sendPicturesStatus: this.groupSystemObj.sendFile
      }).then(async res => {
        this.showResponseMessages(res);
        if (res.code == '200') {
          await this.updateGroupInfo({
            sendPicturesStatus: this.groupSystemObj.sendFile
          });
        }
      });
    },

    async updateGroupInfo(item) {
      await window.vm
        .$knex('t_groups')
        .where({ group_id: this.groupId })
        .update(item);
    },

    //群成员单聊
    memberSingleChat() {
      setGroupBase({
        id: this.groupId,
        memberSingleChatStatus: this.groupSystemObj.chatSingle
      }).then(async res => {
        this.showResponseMessages(res);
        if (res.code == '200') {
          await this.updateGroupInfo({
            memberSingleChatStatus: this.groupSystemObj.chatSingle
          });
        }
      });
    },

    //群成员禁言
    forbiddenWords() {
      setGroupBase({
        id: this.groupId,
        forbiddenWordsStatus: this.groupSystemObj.forbiddenWordsStatus
      }).then(async res => {
        if (res.code == '200') {
          this.showResponseMessages(res);
          await this.updateGroupInfo({
            forbiddenWordsStatus: this.groupSystemObj.forbiddenWordsStatus
          });
        }
      });
    },

    //群成员发送红包
    sendRedpacket() {
      setGroupBase({
        id: this.groupId,
        sendRedpacketStatus: this.groupSystemObj.sendRedpacketStatus
      }).then(async res => {
        this.showResponseMessages(res);
        if (res.code == '200') {
          await this.updateGroupInfo({
            sendRedpacketStatus: this.groupSystemObj.sendRedpacketStatus
          });
        }
      });
    },

    cancelSaveGroupType() {
      //
      const originIndex = this.groupTypeArr.findIndex(item => {
        return item.label == this.groupType;
      });
      this.groupTypeActive = this.groupTypeArr[originIndex].value;
      this.groupTypeVisible = false;
    },

    //设置群类型
    saveGroupType(index) {
      this.groupTypeVisible = false;
      const item = this.groupTypeArr[index];
      return setGroupBase({
        id: this.groupId,
        groupStatus: item.value
      }).then(async res => {
        if (res.code == '200') {
          this.$message({
            type: 'success',
            message: res.msg
          });
          this.groupType = item.label;
          this.groupTypeVisible = false; //成功
          await SQLUtils.updateGroupsInfo(this.groupInfo);
          // this.init();
        }
      });
    },

    //设置群类型
    async groupTypeSelected(item, index) {
      this.groupTypeActive = item.value;
      this.groupTypeSelect = index;
      // this.groupType = item.label;
    },

    showSenderName(item) {
      let unknownName = item.refMsgBody.users ? item.refMsgBody.users[0].nickName : '';
      let auth_status = this.getAuthStatusInGroup(item.fromId)
      if (item.fromId == this.userId && item.msgType == '26') {
        console.log(item.msgBody,'item.msgBody666')
        if(item.msgBody.userId != this.userId){
          item.fromName2 = this.memberNickName[item.msgBody.userId]
        }
        return this.$t('Universal_0036');
      }else if ( (item.authStatus == 2 || item.authStatus == 1 ||  auth_status == 1 || auth_status == 2) &&
          item.msgType == '26' && item.fromId != this.userId && item.fromId != item.msgBody.userId) {
        if(item.fromId != item.msgBody.userId){
          item.widthDrawFlag =true
        }else{
          item.widthDrawFlag =false
        }
        item.nickName = this.memberNickName[item.msgBody.userId]
        return this.$t('chat_comm_member_0005');
      }else if (this.authStatus == 3 && item.msgType == '26') {
        return this.memberNickName[item.fromId] || item.nickName || unknownName || '';
      }else if (this.authStatus == 3 && item.msgType != '26') {
        // return this.memberFriendName[item.fromId] || item.friendFriendNotes || item.nickName || unknownName || '';
        return item.nickName || unknownName || '';
      }else {
        return this.memberNickName[item.fromId] || this.memberAdminName[item.fromId] || unknownName || '';
      }
    },



    cancelSaveGroupValidationgroup() {
      const originIndex = this.groupValidationArr.findIndex(item => {
        return item.name == this.groupValidation;
      });
      this.groupValidationActive = originIndex;
      this.groupValidationVisible = false;
    },

    //加群验证
    async saveGroupValidation(index) {
      const item = this.groupValidationArr[index];
      return setGroupBase({
        id: this.groupId,
        addCheck: item.value
      }).then(async res => {
        this.groupValidationActive = item.value;
        this.groupValidation = item.name;
        await window.vm
          .$knex('t_groups')
          .update('add_check', item.value)
          .where('group_id', this.groupId);
        this.showResponseMessages(res);
        this.groupValidationVisible = false;
        await this.init();
      });
    },

    groupValidationSelected(item, index) {
      this.groupValidationActive = index;
    },


    async onEditGroupInfo() {
      this.$nextTick(async () => {
        await this.$refs.groupInfoEdit.onPop();
      });
    },

  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.init()
  },
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {
    // this.scrollBottom();
  }, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeRouteUpdate(to, from, next) {
    this.initDraft(from);
    this.chatlistFlag=false;
    next();
  },

  beforeRouteLeave(to, from, next) {
    if (to.path !== "/app/chat") {
      this.initDraft(from);
      this.chatlistFlag = false;
    }
    next();
  },
  destroyed() {
    bus.$off('closeMemberinfo',this.closeMember);
  }, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>

<style lang="less" scoped>
.box-card {
  width: 150px;
  position: absolute;
  top: 10px;
}
.group-member-name-class {
  color: #999999;
  font-size: 12px;
  margin: 0px 10px 0px 10px;
  display: flex;
  align-items: center;
  width: 100%;
  white-space: pre;
  div {
    padding-right: 2px;
  }
}
.member-icon-class {
  display: flex;
  align-items: flex-start;
  width: 42px;
  height: 42px;
  // border: 1px solid red;
}
.list {
  display: flex;
}
.el-checkbox {
  display: flex;
  margin-right: 0;
}
.emojList {
  span img {
    width: 22px;
    height: 22px;
    padding: 3px;
    &:hover {
      box-shadow: 2px 2px 3px #888888;
    }
  }
}
.msgStatus {
  position: absolute;
  top: 35%;
  left: 22px;
}
.mess-words {
  position: relative;
  width: 100%;

  // p {
  // font-size: 12px !important;
  // margin-bottom: 3px !important;
  // }
}
.other-msg {
  top: -2px;
}
.self-msg {
  left: 0;
}

.loadmore {
  font-size: 12px;
  text-align: center;
  color: #2f54eb;
  cursor: pointer;
}
.loadmore2 {
  font-size: 12px;
  text-align: center;
  color: #2f54eb;
}
.nomore {
  color: #666;
}
.el-loading-spinner {
  margin-top: -7px;
}
.groupSystemBox {
  box-sizing: border-box;
  font-size: 14px;
  width: 100%;
  height: 100vh;
  overflow-y: scroll;
  .outGroup {
    box-sizing: border-box;
    text-align: center;
    color: #eb552f;
    height: 50px;
    line-height: 50px;
    width: 100%;
    background-color: #fbfbfb;
    position: absolute;
    bottom: 0;
    border-top: 1px solid #e1e1e1;
    span {
      cursor: pointer;
    }
  }
  .top:first-child {
    position: absolute;
    z-index: 1;
  }
  .top {
    width: 100%;
    height: 50px;
    background-color: #fbfbfb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    padding: 0 10px;
    span {
      // font-weight: 500;
      font-weight: 600;
      font-size: 15px;
      color: #333;
    }
    .el-icon-close {
      font-size: 14px;
    }
    .el-icon-right {
      font-size: 20px;
    }
  }

  .content {
    box-sizing: border-box;
    width: 100%;
    background-color: #fff;
    font-size: 12px;
    color: #333;
    padding: 0 10px;
    & > ul {
      li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin: 12px 0;
        cursor: pointer;
        span {
          &:first-child {
            margin-right: 10px;
          }
          &:last-child {
            display: flex;
            align-items: center;
            max-width: 90px;
          }
        }
      }
      & > .authorityOpen {
        li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 0 20px;
          box-sizing: border-box;
        }
      }

      .many-select {
        font-size: 12px;
        font-weight: 400;
        color: #666;
      }

      .el-icon-arrow-right {
        color: #000;
        font-size: 12px;
      }
    }
  }
}
.dialog-footer {
  display: flex;
  justify-content: space-between;
  width: 80%;
  margin: 0 auto;

  /deep/ .dialog-footer {
    width: 80%;
  }
  /deep/.el-button--mini,
  .el-button--small {
    width: 84px;
    height: 28px;
    font-size: 13px;
  }
  /deep/ .el-button--default .el-button--mini {
    color: #333;
    font-size: 13px;
  }
}
.selectItem {
  width: 100%;
  margin: 0 auto;
  li {
    margin: 10px 0;
    width: 100%;
    line-height: 25px;
    background-color: #f3f3f3;
    color: #696969;
    font-size: 13px;
    text-align: center;
    position: relative;
    box-sizing: border-box;
    position: relative;

    .el-icon-check {
      display: none;
    }
  }
  li:hover {
    background-color: #d6deff;
  }
  .active {
    .el-icon-check {
      display: inline-block;
      font-size: 14px;
      color: #2f54eb;
      top: 6px;
      position: absolute;
      right: 6px;
    }
  }
}
//@import url(); 引入公共css类
.chatother {
  img {
    // padding: 5px 10px;
    width: 18px;
    padding: 10px 10px 5px;
    cursor: pointer;
    height: 18px;
  }

  .emojIcon {
    margin-left: 10px;
  }
}
.el-drawer__wrapper {
  top: 114px;
}

#resize {
  height: 5px;
  width: 100%;
  cursor: n-resize;
  border-bottom: #e4e4e4 solid 1px;
}
.message {
  width: 100%;
  background: #f6f6f6;
  .mess-header {
    height: 38px;
    background: #fff;
    padding: 0 20px;
    box-sizing: border-box;
    border-bottom: 1px solid #dddddd;
    -webkit-app-region: drag;
    span {
      height: 20px;
      line-height: 20px;
      &:nth-child(2) {
        margin: 0 12px;
      }
      &:nth-child(4) {
        margin: 0 12px;
      }
    }
    .mess-nav span {
      cursor: pointer;
    }
    .mess-nav img {
      width: 20px;
      height: 20px;
    }
  }
  .mess-detail {
    width: 100%;
    // padding: 20px 20px 0 20px;
    padding: 10px 20px;
    box-sizing: border-box;
  }
  .mess-detail-self {
    width: 100%;
    // padding: 20px 20px 0 20px;
    padding: 10px 20px;
    box-sizing: border-box;
  }
  .infotime {
    text-align: center;
    color: rgb(153, 153, 153);
    margin-top: 10px;
    font-size: 12px;
  }
  .mess-head {
    width: 44px;
    height: 44px;
    background: #ccc;
    display: inline-block;
    border-radius: 50%;
    margin-top: 8px;
    img {
      width: 100%;
      height: 100%;
      display: block;
      border-radius: 50%;
    }
  }
  .mess-name {
    font-size: 18px;

    font-weight: bold;
    color: rgba(51, 51, 51, 1);
  }
  .mess-owner {
    width: 36px;
    height: 16px;
    background: rgba(221, 51, 51, 1);
    border-radius: 3px;
    display: inline-block;
    font-size: 10px;
    color: #fff;
    text-align: center;
    line-height: 16px;
    margin: 0 0 2px 5px;
  }
  .words {
    display: flex;
    min-height: 23px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    word-break: break-all;
    font-size: 14px;

    font-weight: 400;
    color: rgba(0, 0, 0, 1);
  }
  #resizeBox {
    position: relative;
    height: calc(100vh - 61px);
  }
  .message-box {
    height: calc(100vh - 23px);
    overflow: hidden;
  }
  .mess-talk {
    // height: 80vh;
    overflow: auto;
    height: calc(100vh - 228px);
    &:nth-last-child(2) {
      padding-bottom: 20px;
    }
  }
  .by-at {
    position: fixed;
    bottom: 170px;
    right: 20px;
    height: 37px;
    line-height: 37px;
    opacity: 0.98;
    background: #e6e6e6;
    border-radius: 4px;
    box-shadow: 0px 0px 6px 0px #b0b0b0;
    color: #333;
    font-size: 13px;
    padding: 0 10px;
    .el-icon-close {
      cursor: pointer;
      float: right;
      line-height: 37px;
    }
  }
 .by-more-list {
    position: fixed;
    bottom: 170px;
    right: 20px;
    height: 37px;
    line-height: 37px;
    opacity: 0.98;
    background: #e6e6e6;
    border-radius: 4px;
    box-shadow: 0px 0px 6px 0px #b0b0b0;
    color: #333;
    font-size: 13px;
    padding: 0 10px;
    /deep/.el-icon-arrow-down {
      font-weight: 600; 
      color: #000;
    }
  }

  .mess-footer {
    position: relative;
    height: 161px;
    background: #f6f6f6;
    box-sizing: border-box;
  }
  .mess-square {
    width: 100%;
    // height: 55%;
    height: calc( 100% - 80px );
    input {
      width: 100%;
      height: 42px;
      border: none;
      background: rgba(243, 243, 243, 1);
      border-radius: 8px;
    }

    // /deep/ .ql-container .ql-editor span {
    //   background: none !important;
    //   color: black !important;
    // }
  }
  // .mess-send {
  //   width: 160px;
  //   flex: 1;
  //   box-sizing: border-box;
  //   height: 34px;
  //   span {
  //     cursor: pointer;
  //   }
  // }
  .mess-send {
    width: 100%;
    position: absolute;
    bottom: 0;
    right: 10px;
    box-sizing: border-box;
    height: 34px;
    span {
      cursor: pointer;
    }

    /deep/ .el-button--mini,
    .el-button--small {
      width: 66px;
      height: 28px;
      margin: 0 10px 3px 0;

      span {
        font-size: 14px;

        font-weight: 400;
        letter-spacing: 2px;
      }
    }
  }
  .send {
    color: #fff;
    position: absolute;
    right: 0px;
    bottom: 0px;
  }
  .quote {
    max-width: 80%;
    position: absolute;
    left: 20px;
    bottom: 6px;

    span {
      display: inline-block;
      width: 100%;
      overflow: hidden;
      white-space: pre;
      text-overflow: ellipsis;
    }
  }
  .bq {
    display: contents;
  }
  .add {
    display: contents;
  }

  .mess-member {
    width: 100%;
    background: rgba(255, 255, 255, 1);
    padding: 8px;
  }
  .mumber-header {
    .add-blue {
      background: blue;
      width: 50px;
      height: 24px;
      border-radius: 5px;
      display: inline-block;
      text-align: center;
    }
    .mumber-number {
      height: 24px;
      font-size: 15px;

      font-weight: 400;
      color: rgba(51, 51, 51, 1);
    }
  }
  .member-member {
    overflow: scroll;
    max-height: calc(100vh - 220px);
    margin: 20px 0 0 0;
    ul li {
      margin: 6px 0 0 0;
    }
  }
  .member-head {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #ccc;
    display: inline-block;
    img {
      width: 32px;
      height: 32px;
      display: block;
      border-radius: 50%;
    }
  }
  .member-name {
    font-size: 15px;
    width: 125px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    margin: 0 5px;
  }
  .remarkStatus {
    .tit {
      display: flex;
      align-items: center;
      img {
        // width: 44px;
        // height: 44px;
        width: 32px;
        height: 32px;
        margin-right: 10px;
        border-radius: 50%;
      }
    }
    textarea {
      height: 60px;
      margin: 15px 0;
    }
    .member-notes {
      margin: 10px 0;

      /deep/ .el-input--small {
        height: 55px;
      }

      /deep/ .el-textarea__inner {
        height: 54px;
        background: transparent;
        border: 1px solid #d7d7d7;
      }

      /deep/ .el-input__count {
        font-size: 12px;
        color: #666;
      }
    }
  }
  .mess-checklist {
    width: 200px;
    background: rgba(255, 255, 255, 1);
    border: 1px solid rgba(221, 221, 221, 1);
  }
  .liMenu {
    cursor: pointer;
    text-align: center;
    height: 35px;
    line-height: 35px;
    font-size: 15px;
  }
  .liMenu.hover {
    color: #fff;
    background: #2f54eb;
  }
  .tip-msg {
    height: 100%;
    align-items: center;
    justify-content: center;
  }
}
.audio-wrap img {
  width: 30px;
  vertical-align: middle;
  padding-right: 4px;
}
.group-name {
  color: #333333;
  font-size: 14px;
  font-weight: 500;
  max-width: 190px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre;
  .iconfont {
    font-size: 12px;
  }
}
.group-people {
  color: #333333;
  font-size: 14px;

  font-weight: 500;
}
.noticeContainer {
  width: 100%;
  padding: 5px 11px 7px 11px;
  box-sizing: border-box;
  background: #fdf6ec;
  display: flex;
  justify-content: space-between;
  position: absolute;
  z-index: 1;
  .upGroupNotice {
    width: 100%;
    font-size: 12px;
    font-weight: 400;
    text-align: left;
    color: #eda368;
    line-height: 17px;
  }
  .el-icon-close {
    width: 9px;
    height: 9px;
    font-size: 9px;
    color: #eda368;
  }
}
.appealContainer{
  width: 100%;
  padding: 7px 20px 8px 14px;
  box-sizing: border-box;
  background: #fef4e5;
  display: flex;
  justify-content: space-between;
  position: absolute;
  z-index: 1;
  .appealNotice{
    width: 100%;
    font-size: 12px;
    font-weight: 400;
    text-align: left;
    color: #f7931a;
    line-height: 17px;
  }
  .el-icon-arrow-right {
    font-size: 14px;
    color: #f7931a;
  }
}
</style>

<style lang="less" scoped>
.mutiPanel {
  /deep/ .el-drawer__body {
    display: flex;
    justify-content: center;
    span {
      width: 90px;
      margin: 0 10px;
    }
    img {
      margin-top: 0;
    }
  }
}
.popupmsg {
  /deep/ .el-dialog__header {
    padding-top: 10px;
  }
  /deep/ .el-dialog__title {
    font-size: 14px;

    // font-weight:500;
    font-weight: 600;
    color: #333;
    line-height: 20px;
  }
  /deep/ .el-dialog__headerbtn {
    top: 10px;
  }

  /deep/ .el-dialog__body span {
    font-size: 13px;

    font-weight: 400;
    color: #666;
    line-height: 17px;
  }
}

.note-member {
  /deep/ .el-dialog__body {
    padding: 0 25px;
    color: #333;
    height: 170px;

    span {
      line-height: 15px;
    }
  }

  /deep/ .dialog-footer {
    width: 90%;
    margin: 30px auto 20px;
  }

  /deep/ .el-button--primary {
    color: #fff !important;
  }

  .cancelBtn {
    border: none;
    background: #d8d8d8;
    color: #333;
    font-size: 13px;
  }
  .sureBtn {
    background: #2f54eb;
    color: #fff !important;
    font-size: 13px;

    /deep/ span {
      color: #fff;
      line-height: 10px;
    }
  }
}

.voice-accept {
  position: relative;
}
.voice-icon {
  display: flex;
  justify-content: flex-start;
  color: #ff0000;
  font-size: 18px;
  position: absolute;
  top: 8px;
  right: -18px;
}
#talkbubblee {
  &.fullOfEmoji {
    max-width: 61%;
  }
  &.samllFullOfEmoji {
    max-width: 60%;
  }
}
#talkbubble {
  &.fullOfEmoji {
    max-width: 62%;
  }
  &.samllFullOfEmoji {
    max-width: 61%;
  }
  &.fileBox {
    max-width: none ;
  }
}
#talkbubble,#talkbubblee{
  &.imgTopSpace{
    padding: 0 10px;
  }
  &.fileBox {
    max-width: none;
    width: 250px !important;
  }
}
</style>

<style lang="less">
.el-tag--dark.el-tag--info {
  background-color: #e7e7e7;
  border: none;
  color: #727272;
}
.el-tag--dark.el-tag--info .el-tag__close {
  color: #666;
}
.ql-container {
  height: 100%;
  overflow-y: scroll;
  width: 100%;
  background: #f6f6f6;
}
.ql-toolbar.ql-snow + .ql-container.ql-snow {
  border: none;
  // padding-top: 5px;
}
.ql-toolbar.ql-snow {
  border: none;
  padding-top: 0;
}
.ql-toolbar {
  display: none;
}
.ql-tooltip {
  display: none;
}
.ql-editor {
  padding: 0;
  line-height: 0px;
  .mention{
    background: transparent ;
    > span {
      margin: 0;
    }
  }
}
.ql-editor .ql-editor {
  padding: 0 10px 10px;
  line-height: 20px;
}
.ql-editor img {
  max-width: 150px !important;
  vertical-align: text-bottom;
  margin: 0 1px;
}
.quoteBubble {
  min-width: 60px;
  // max-width: 110px;

  background: #e7e7e7;
  padding: 8px 10px;
  border-radius: 5px;
  color: #727272;
  margin-top: 13px;
  font-size: 12px;
  width: fit-content;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  .quotImg {
    display: inline-block;
    cursor: pointer;
    img {
      height: 30px;
    }
  }
}
#talkbubble {
  // line-height: 30px;
  line-height: 23px;
  font-size: 14px;
  min-width: 30px;
  // max-width: 300px;
  // max-width: 65%;
  max-width: 62%;
  // min-height: 30px;
  min-height: 23px;
  // background: #fff;
  position: relative;
  // border-radius: 10px;
  margin-left: 10px;
  padding: 7px 10px;
}
// #talkbubble:before {
//   content: "";
//   position: absolute;
//   right: 100%;
//   // top: 18px;
//   top: 13px;
//   border-top: 6px solid transparent;
//   border-right: 10px solid #fff;
//   border-bottom: 6px solid transparent;
// }

#talkbubblee {
  line-height: 23px;
  font-size: 14px;
  // min-width: 30px;
  min-width: 30px;
  // max-width: 300px;
  // max-width: 65%;
  max-width: 63%;
  // min-height: 30px;
  min-height: 23px;
  // background: #cfe1ff;
  position: relative;
  // border-radius: 10px;
  margin-right: 10px;
  padding: 7px 10px;
}
#talkbubblee .flex-sub p,
#talkbubble .flex-sub p {
  font-size: 14px;
  color: #000;
  margin-right: 10px;
}
#talkbubblee .flex-sub p:last-child,
#talkbubble {
  color: #000;
}
#talkbubblee .load-border,
#talkbubble .load-border {
  border-top: 1px solid #ddd;
  margin-top: 5px;
  padding: 5px 0 0;
  font-size: 12px;
  color: #000;
}

#talkbubblee .load-border span,
#talkbubble .load-border span {
  display: inline-block;
  margin-left: 14px;
}
// #talkbubblee:before {
//   content: "";
//   position: absolute;
//   left: 100%;
//   // top: 18px;
//   top: 13px;
//   border-top: 6px solid transparent;
//   border-left: 10px solid #cfe1ff;
//   border-bottom: 6px solid transparent;
// }
#talkbubble .flex-direction p {
  width: 88%;
}
.drawerbox {
  width: 250px !important;
}
.message-box-class {
  width: 280px;
  .el-message-box__headerbtn {
    display: none;
  }
}
.popContainer {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 999;
  width: 100%;
  background: #ddd;
  opacity: 0.5;
}
.group-edit-icon {
  margin-left: 10px;
}
.send-btn {
  height: 28px;
  width: 68px;
  background: #2f54eb;
  box-shadow: 0px 0px 1px 0px rgba(153, 153, 153, 0.3);
  border-radius: 4px;
  color: #fff;
  font-size: 13px;
  border: none;
  user-select: none;
  outline: none;
  cursor: pointer;
  position: absolute;
  right: 0;
  bottom: 6px;
}
.captureScreenClass {
  font-size: 9px;
  position: absolute;
  top: 10px;
  margin-left: -8px;
  padding: 4px;
  cursor: pointer;
}
.screenSelectDivClass {
  background: #ffffff;
  width: 160px;
  height: 20px;
  line-height: 20px;
}
.screenSelectClass {
  margin-top: 3px;
  margin-left: 4px;
  margin-right: -2px;
}
.sendFile {
  img,
  span {
    vertical-align: middle;
    margin-right: 10px;
  }
  padding-bottom: 10px;
}
.sendFileInput {
  border: #d7d7d7 solid 1px;
}
.sendFileInput textarea {
  cursor: default;
}
// .atBoxActive,.atInput.selected{
//   background-color: #D6DEFF;
// }
// .atBoxHover {
//   background: #f7f7f7;
// }
// .atBox {
//   position: absolute;
//   overflow: scroll;
//   width: 170px;
//   max-height: 180px;
//   // bottom: 25px;
//   background: #fff;
//   border: 1px solid #dddddd;
//   border-radius: 4px;
//   box-shadow: 0px 2px 8px 0px #888888;
//   ul {
//     overflow: hidden;
//     li {
//       display: flex;
//       align-items: center;
//       padding: 0 5px;
//       /*text-overflow: ellipsis;
//       overflow: hidden;
//       text-overflow: ellipsis;
//       display: -webkit-box;
//       -webkit-line-clamp: 1;
//       -webkit-box-orient: vertical;*/
//       cursor: pointer;
//       img {
//         margin: 5px 2px;
//       }
//       span {
//         -ms-text-overflow: ellipsis;
//         text-overflow: ellipsis;
//         overflow: hidden;
//         white-space: nowrap;
//         max-width: 110px;
//         display: inline-block;
//       }
//     }
//   }
// }
// .atInput {
//   max-width: 170px;
//   max-height: 183px;
//   overflow: scroll;
//   ul {
//     li {
//       text-overflow: ellipsis;
//       &:first-child {
//         padding-left: 19px;
//       }
//     }
//   }
//   img {
//     display: inline-block;
//     width: 25px;
//     height: 25px;
//     border-radius: 15px;
//     &:not([src]) {
//       opacity: 0;
//     }
//   }
//   span,
//   img {
//     vertical-align: middle;
//     margin: 0 5px;
//   }
// }
</style>
<style>
.screen-select-class {
  /*top: 61px !important;*/
  padding: 0 4px 4px 0;
}
.screen-select-class .popper__arrow {
  display: none;
}
.screen-select-class .el-checkbox__input {
  margin-top: 3px;
  margin-left: 4px;
  margin-right: -2px;
}
.actives {
  background-color: #f00;
}
.pre {
  white-space: pre;
}
.notice-wrap {
  max-width: 60%;
  margin: 5px auto;
  text-align: center;
  font-size: 12px;
  color: #999;
  padding: 10px 0;
  word-break: break-all;
}
</style>
