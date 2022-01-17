
<template>
  <div class="message" v-loading="uploadLoading" id="messageBox">
    <member-card-other
      :cardDialogVisible="cardDialogVisible"
      :userId="cardUserId"
      ref="cardOther"
      @handleclosecard="handleclosecard"
    ></member-card-other>
    <GroupCard :groupInfo="groupInfo" ref="groupCard"></GroupCard>
    <div class="message-box">
      <Title @goMessage="goMessage" @goSetting="goSetting">
        <div
          style="display: flex; align-items: center; cursor: pointer"
          @click="id == '1008455862495526912' || id == '1032384035881537536' ? null : showInfo()"
        >
          <label class="vlogo" v-if="id == '1008455862495526912' || id == '1032384035881537536'">
            <img src="../../../../assets/images/vlogo.png" />
          </label>
          <span class="group-name" :title="userInfo.userNickName">
            <i class="iconfont icon-user" v-if="id != '1008455862495526912' &&  id != '1032384035881537536'"></i>
            {{ userInfo.userNickName }}
          </span>
        </div>
      </Title>

      <div id="resizeBox">
        <div class="maskVisible" v-show="maskVisible"></div>
        <div class="mess-talk custom-scrollbar" ref="talk" id="talk" >

          <div class="loadmore" v-if="hasMore" v-loading="listLoading" element-loading-spinner="el-icon-loading" @click="loadmorelist()">
            {{ $t('Universal_0361') }}
          </div>
          <div class="loadmore2 nomore"
            v-if="!hasMore && notDiDiService(userInfo) && chatlistFlag" element-loading-spinner="el-icon-loading">
            <div class="chatInfo">
              <img 
                class="avater" 
                :src="findImage(userInfo.imgUrl)" 
                @click="openImgView" 
                @error="replaceImg" 
                style="-webkit-user-drag:none;" 
              />
              <p>{{ userInfo.userNickName || userInfo.friendNickName}}</p>
              <span>{{ $t('chat_0001',{saveTime}) }}</span>
            </div>
          </div>
          <!-- 图片查看 -->
          <viewer :images="imglsit" class="viewer" ref="viewer" @inited="inited">
            <img v-for="src in imglsit" :src="src.url" :key="src.reqId" alt style="display: none" />
          </viewer>
          <!-- ###### 实时消息 ###### -->
          <div class="mess-talk-self">
            <!-- 多选实时消息 -->
            <el-checkbox-group v-if="mutiChooseTag" v-model="checkList2" class="talkcheck">
              <el-checkbox
                v-for="(item, index) in chatList"
                v-if="item.msgType != '14'"
                :label="item.msgType == 24 ? '' : item"
                :key="`${item._id}${index}`"
                :disabled="item.disabled || item.sendStatus == 1 || item.sendStatus == -1"
                :ref="topMsgOrder == item.msgOrder ? 'activeRef' : ''"
                :class="
                  item.fromType == '408' ||
                  item.fromType == '409' ||
                  item.fromType == '201' ||
                  item.fromType == '215' ||
                  item.fromType == '212'
                    ? 'hidden'
                    : item.msgType != '24' && item.msgType != '13' && getShowTimestamp(item.timestamp,chatList[index-1]) && item.disabled
                    ? 'disabledWithTime'
                    : item.msgType != '24' && item.msgType != '13' && getShowTimestamp(item.timestamp,chatList[index-1])
                    ? 'higher'
                    : item.disabled
                    ? 'disabled'
                    : ''
                "
                :value="item.checked"
                @change="multiSelectValidation(item)"
                :checked="item.checked"
              >
                <div class="infotime" v-if="item.msgType != '24' && item.msgType != '13' 
                && getShowTimestamp(item.timestamp,chatList[index-1])">
                  {{ item.timestamp | diffTimeHand }}
                </div>
                <div
                  v-if="
                    item.msgType != '4' &&
                      item.msgType != '7' &&
                      item.msgType != '24' &&
                      item.msgType != '44' &&
                      item.msgType != '13' &&
                      item.msgType != '26' &&
                      item.msgType != '14' &&
                      item.msgType != '31' &&
                      item.msgType != '8'  &&
                      item.msgType != '61'
                  "
                >
                  <!-- 别人发送的消息 -->
                  <div class="mess-detail flex" v-if="item.fromId != userId">
                    <span class="mess-head" v-if="item.msgType != '26'" @click="showUserInfo(item.fromId)">
                      <ServiceIcon v-if="item.fromId == '1032384035881537536' || item.fromId == '1008455862495526912'" :image="imgUrl" />
                      <MemberIcon v-else :image="imgUrl" auth-status="3" :userRank="userInfo.userRank" :vipType="userInfo.vipType" />
                    </span>
                    <span class="mess-words others-msg">
                      <p class="group-member-name-class">
                        {{ userInfo.friend_friendNotes || userInfo.friendNickName }}
                        <LuckIdIcon
                          :inviteCode="userInfo.invite_code"
                          :userRank="userInfo.userRank"
                          iconType="medium"
                          :vipType="userInfo.vipType"
                          :inviteCodeType="userInfo.inviteCodeType"
                          v-if="userInfo.inviteCodeType == 1"
                        />
                        <LevelIcon
                          :inviteCode="userInfo.invite_code"
                          :userRank="userInfo.userRank"
                          iconType="medium"
                          :vipType="userInfo.vipType"
                          :inviteCodeType="userInfo.inviteCodeType"
                        />
                      </p>
                      <div v-if="isMessage(item)" id="talkbubble" :class="[getPopperClassName(item, 0),maxWidth(item),imgBubble(item)]">
                        <MessageFormatOnline
                          v-bind:item="item"
                          :userInfo="userInfo"
                          :isShowRight="false"
                          :imglsit="imglsit"
                          :friend-id="userInfo.id"
                          @toAppeal="toAppeal('single')"
                          @handSendImg="handSendImg"
                          @reHandSendVideo="reHandSendVideo"
                          @reHandSendFile="reHandSendFile"
                          :key="item.msgId"
                        />
                      </div>
                      <QuotFormate v-if="item.msgType == 25" :item="item" :emojiList="emojiList"></QuotFormate>
                    </span>
                  </div>
                  <!-- 自己发送的消息 -->
                  <div class="mess-detail-self flex justify-end" v-if="item.fromId == userId && isMessage(item)">
                    <span class="mess-words self-msg">
                      <p class="group-member-name-class">
                        {{ myInfo.nickName }}
                        <LuckIdIcon
                          :inviteCode="myInfo.inviteCode"
                          :userRank="myInfo.userRank"
                          iconType="medium"
                          :vipType="myInfo.vipType"
                          :inviteCodeType="myInfo.inviteCodeType"
                          v-if="myInfo.inviteCodeType == 1"
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
                          @reHandSendVideo="reHandSendVideo"
                          @reHandSendFile="reHandSendFile"
                        />
                        <div id="talkbubblee" :class="[getPopperClassName(item, 1),maxWidth(item),imgBubble(item)]">
                          <MessageFormatOnline
                            v-bind:item="item"
                            :userInfo="userInfo"
                            :isShowRight="false"
                            :imglsit="imglsit"
                            :friend-id="userInfo.id"
                            @toAppeal="toAppeal('single')"
                            :key="item.msgId"
                            @handSendImg="handSendImg"
                            @reHandSendVideo="reHandSendVideo"
                            @reHandSendFile="reHandSendFile"
                          />
                        </div>
                      </div>
                      <QuotFormate v-if="item.msgType == 25" :item="item" :emojiList="emojiList"></QuotFormate>
                    </span>
                    <span class="mess-head" style="margin:0 -10px 0 10px;" @click="showUserInfo(item.fromId)">
                      <MemberIcon :image="myInfo.headImg" auth-status="3" :userRank="myInfo.userRank" :vipType="myInfo.vipType" />
                    </span>
                  </div>
                </div>
                <Notice v-if="item.msgType != '24'" :item="item" :getFriendName="userInfo.userNickName" />
              </el-checkbox>
            </el-checkbox-group>
            <!--非多选实时-->
            <div v-if="!mutiChooseTag">
              <div
                v-for="(item, index) in chatList"
                :label="item"
                :key="`${item._id}${index}`"
                :ref="topMsgOrder == item.msgOrder ? 'activeRef' : ''"
                data-list="chatList"
              >
                <div class="infotime" v-if="item.msgType != '24' && item.msgType != '13' 
                && getShowTimestamp(item.timestamp,chatList[index-1])">
                  {{ item.timestamp | diffTimeHand }}
                </div>
                <div
                  v-if="
                    item.msgType != '4' &&
                      item.msgType != '7' &&
                      item.msgType != '44' &&
                      item.msgType != '24' &&
                      item.msgType != '13' &&
                      item.msgType != '26' &&
                      item.msgType != '14' &&
                      item.msgType != '31' &&
                      item.msgType != '8'  &&
                      item.msgType != '61'
                  "
                >
                  <!-- 别人发送的消息 -->
                  <div class="mess-detail flex" v-if="item.fromId != userId && isMessage(item)">
                    <span class="mess-head" @click="showUserInfo(item.fromId)">
                      <ServiceIcon v-if="item.fromId == '1032384035881537536' || item.fromId == '1008455862495526912'" :image="imgUrl" />
                      <MemberIcon v-else :image="imgUrl" auth-status="3" :userRank="userInfo.userRank" :vipType="userInfo.vipType" />
                    </span>
                    <span class="mess-words others-msg">
                      <p class="group-member-name-class">
                        {{ userInfo.userNickName || userInfo.friendNickName }}
                        <LuckIdIcon
                          :inviteCode="userInfo.invite_code"
                          :userRank="userInfo.userRank"
                          iconType="medium"
                          :vipType="userInfo.vipType"
                          :inviteCodeType="userInfo.inviteCodeType"
                          :listFlag="true"
                        />
                        <LevelIcon
                          :inviteCode="userInfo.invite_code"
                          :userRank="userInfo.userRank"
                          iconType="medium"
                          :vipType="userInfo.vipType"
                          :inviteCodeType="userInfo.inviteCodeType"
                        />
                      </p>
                      <div
                        v-if="isMessage(item)"
                        id="talkbubble"
                        @click="item.msgType == '15' ? lookcard(item) : null"
                        :class="[getPopperClassName(item, 0), maxWidth(item),imgBubble(item)]"
                        class="voice-accept"
                      >
                        <MessageFormatOnline
                          v-bind:item="item"
                          :imglsit="imglsit"
                          :soundUrlObj="soundUrlObj"
                          :friend-id="userInfo.id"
                          :userInfo="userInfo"
                          @delMsg="delMsg"
                          @handArm="handArm"
                          @acceptMessage="acceptMessage(item)"
                          @mutiChoose="mutiChoose"
                          @transferQuote="transferQuote"
                          @scrollBottom="scrollBottom"
                          @withdrawMessage="withdrawMessage(item)"
                          @toAppeal="toAppeal('single')"
                          @handSendImg="handSendImg"
                          @reHandSendVideo="reHandSendVideo"
                          @reHandSendFile="reHandSendFile"                         
                          :key="item.msgId"
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
                  <!-- 自己发送的消息 -->
                  <div class="mess-detail-self flex justify-end" v-if="item.fromId == userId && isMessage(item)">
                    <span class="mess-words self-msg">
                      <p class="group-member-name-class">
                        {{ myInfo.nickName }}
                        <LuckIdIcon
                          v-if="myInfo.inviteCodeType == 1"
                          :inviteCode="myInfo.inviteCode"
                          :userRank="myInfo.userRank"
                          iconType="medium"
                          :vipType="myInfo.vipType"
                          :inviteCodeType="myInfo.inviteCodeType"
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
                          @handSendImg="handSendImg"
                          v-bind:item="item"
                          :class="item.msgType == '25' ? 'specialStatus' : ''"
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
                            :soundUrlObj="soundUrlObj"
                            :friend-id="userInfo.id"
                            :userInfo="userInfo"
                            @delMsg="delMsg"
                            @handArm="handArm"
                            @mutiChoose="mutiChoose"
                            @transferQuote="transferQuote"
                            @withdrawMessage="withdrawMessage(item)"
                            @scrollBottom="scrollBottom"
                            @toAppeal="toAppeal('single')"
                            @handSendImg="handSendImg"
                            @reHandSendVideo="reHandSendVideo"
                            @reHandSendFile="reHandSendFile"                           
                            :key="item.msgId"
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
                    <span class="mess-head" style="margin:0 -10px 0 10px;" @click="showUserInfo(item.fromId)">
                      <MemberIcon :image="myInfo.headImg" auth-status="3" :userRank="myInfo.userRank" :vipType="myInfo.vipType" />
                    </span>
                  </div>
                </div>
                <Notice @reEditMsg="reEditMsg" v-if="item.msgType != '24'" :item="item" :getFriendName="userInfo.userNickName" />
              </div>
            </div>
          </div>
        </div>

        <!-- 工具栏 -->
        <div id="resize" @mousedown="resizeChange"></div>

        <div id="down" class="mess-footer align-center">
          <div class="chatother" id="chatother">
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
            <img draggable='false' src="../../../../assets/images/send_msg_screenshot.png" v-on:click="captureScreen" />
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
            <!-- <div
              class="audioClass"
              v-if="userInfo.id != '1032384035881537536' && userInfo.id != '1008455862495526912' && userInfo.id != $paymentId"
            >
              <img src="../../../../assets/images/media_phone.png" @click="callAudio" alt />
              <img src="../../../../assets/images/media_video.png" class="video-icon-class" @click="callVideo" v-if="false" alt />
            </div> -->
          </div>
          <div class="mess-square" @contextmenu.prevent="_quillRightClick($event)">
            <quill-editor
              class="ql-editor"
              v-model="texthtml"
              ref="myQuillEditor"
              :options="editorOption"
              @keydown.ctrl.enter.native="editorWrap()"
              @keydown.alt.enter.native="editorWrap()"
              @keydown.meta.enter.native="editorWrap()"
              @paste.native.prevent="pasteMe($event)"
              @ready="onEditorReady($event)"
              @change="onEditorChange($event, decimalNum)"
            ></quill-editor>
          </div>

          <div v-show="isShowMoreList && !isSomebodyAtYou" class="by-more-list" @click="scrollBottom">
            <el-button  v-if="newMsgLength > 0" class="by-more-list" icon="el-icon-arrow-down"> 
              {{ $t('chat_0128', {value: newMsgLength}) }}</el-button>
            <el-button v-else class="by-more-list" icon="el-icon-arrow-down"></el-button>
          </div>

          <div class="mess-send align-center justify-around">
            <!-- <span class="send" @click="send('1')">发送</span> -->
            <el-tag closable type="info" @close="closeQuote()" effect="dark" v-show="quoteVisible" class="quote"
              ><span ref="quoteMsgs">{{ quoteMsg }}</span></el-tag
            >
            <button class="send-btn" @click="sendQuillByThrottle" :disabled="sendBtnDisabled">
              {{ $t('Universal_0046') }}
            </button>
          </div>
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
    <!--个人设置弹框 friendSystemAble-->
    <el-drawer
      title="我是标题"
      :visible.sync="friendSystemAble"
      :direction="'rtl'"
      :with-header="false"
      :modal="false"
      size="230px"
      style="margin-top: 60px"
    >
     <template v-if="friendSystemAble">
      <div class="friendSystemBox">
        <div class="top">
          <span>{{ $t('Universal_0065') }}</span>
          <i class="el-icon-close" @click="friendSystemAble = false"></i>
        </div>
        <div class="content" style="margin-top: 50px">
          <div class="addDiscussin">
            <div class="userInfoClass" @click="showInfo()">
              <MemberIcon
                :image="imgUrl"
                iconType="small"
                :userRank="userInfo.userRank"
                :vipType="userInfo.vipType"
                style="margin-bottom: 10px"
              />
              <p>{{ userInfo.userNickName }}</p>
            </div>
            <div @click="selectDiscussionMembers" class="pointer">
              <!-- <img width="40" height="40" src="../images/tianjia.png" alt /> -->
              <img width="40" height="40" src="../../../../assets/images/start_discussion.png" alt />
              <p>{{ $t('book_friend_0024') }}</p>
            </div>
          </div>
          <ul>
            <li>
              <span>{{ $t('Universal_0362') }}</span>
              <el-switch
                v-model="friendSystemObj.msgTopValue"
                active-color="#2F54EB"
                inactive-color="#EDEDED"
                active-value="1"
                inactive-value="0"
                :disabled="friendSystemObj.msgTopClick"
                @change="stickyChange"
              ></el-switch>
            </li>
            <li>
              <span>{{ $t('chat_0057') }}</span>
              <el-switch
                v-model="friendSystemObj.msgOutlineValue"
                active-color="#2F54EB"
                inactive-color="#EDEDED"
                active-value="1"
                inactive-value="0"
                :disabled="friendSystemObj.msgOutlineClick"
                @change="NotifyChange"
              ></el-switch>
            </li>
            <li @click="historyVisible = true">
              <span>{{ $t('chat_0059') }}</span>
              <i class="el-icon-arrow-right"></i>
            </li>
            <li @click="messageSaveTime">
              <span>{{ $t('chat_0058') }}</span>
              <span class="many-select">
                {{ saveTime }}
                <i class="el-icon-arrow-right"></i>
              </span>
            </li>
            <li @click="tipOff()">
              <span>{{ $t('report_0001') }}</span>
              <i class="el-icon-arrow-right"></i>
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
          <span></span>
        </div>
      </div>
     </template>
    </el-drawer>
    <!--清除聊天记录-->
    <el-dialog :title="$t('chat_0059')" :visible.sync="historyVisible" width="270px" :center="true" class="popupmsg">
      <template v-if="historyVisible">
      <span>{{ $t('chat_0060') }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="historyVisible = false">{{ $t('Universal_0063') }}</el-button>
        <el-button size="mini" type="primary" @click="clearMessageHistory">{{ $t('Universal_0062') }}</el-button>
      </span>
      </template>
    </el-dialog>
    <!--消息保存时长-->
    <el-dialog :title="$t('chat_0058')" :visible.sync="saveTimeVisible" width="270px" :center="true" class="popupmsg">
      <template v-if="saveTimeVisible" >
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
        <el-button size="mini" @click="cancelsaveExpireTime()">{{ $t('Universal_0063') }}</el-button>
        <el-button size="mini" type="primary" @click="saveExpireTime(saveTimeActive)">{{ $t('Universal_0062') }}</el-button>
      </span>
      </template>
    </el-dialog>

    <!-- 好友申请 -->
    <DialogAddFriendVisible
      ref="myordernum"
      :dialogAddFriendsVisible="dialogAddFriendsVisible"
      @handCancelFriDialog="handCancelFriDialog"
      @handConfirmFriDialog="handConfirmFriDialog"
      :friendData="userInfo"
      @toAppeal="toAppeal('single')"
    />
    <GroupAndInviteChat
      ref="groupInvite"
      :title="Comtit"
      from="single"
      :discussionFriendId="userInfo.id"
      :GroupInviteVisible.sync="GroupInviteVisible"
      :mergeTransfer="merge"
      :mergeTransferName="mergeTransferName"
      @confirmDialogHand="confirmDialogHand"
      @cancelDialogHand="cancelDialogHand"
      @transferSuccess="transferSuccess"
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
        <img style="width: 38px; height: 38px; border-radius: 50%" :src="userInfo.friend_head_img" />
        <span>{{ this.userInfo.userNickName }}</span>
      </div>
      <el-input type="textarea" class="sendFileInput" :rows="3" resize="none" :disabled="true" v-model="fileName" size="small"></el-input>
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
import { findIndex} from "lodash";
import emojiList from "@/utils/emoji.js";
import Title from "../components/title.vue";
import MemberCardOther from "@/components/memberCard/MemberCardOther";
// import MemberIcon from "@/components/memberIcon/MemberIcon";
// import LevelIcon from "@/components/memberIcon/LevelIcon";
// import LuckIdIcon from "@/components/memberIcon/luckIdIcon";
import ServiceIcon from "@/components/memberIcon/ServiceIcon";
import Notice from "./notice";
// import DialogAddFriendVisible from "@/view/add-friends-group/dialog/add-friends";
// import GroupAndInviteChat from "@/components/chat/GroupAndInviteChat";
// import AppealsDialog from "@/view/chat/appeals";
// import ImpeachDialog from "@/view/chat/impeach";
// import { ipcRenderer } from "electron";
import {
  contFriSize,
} from "@/utils";
// import MessageSendStauts from "@/view/chat/components/common/MessageSendStatus";
import { parseUniqueCode } from "@/utils/const";
import { mapMutations, mapActions } from "vuex";
import SQLUtils from "@/components/db/sqlite.js";
import UserInfoUtils from "@/utils/UserInfoUtils.js";
import fileOperational from "@/services/fileOperational";
import GroupCard from "../../group/components/GroupCard";
import { usersession_update, createGroup } from "./server";
import { queryGroupByGroupId } from '../../server';
import { sqliteQueryBySQL } from '@/services/sqliteDao';
import { v4 as uuidv4 } from "uuid";
// import QuotFormate from "@/view/chat/components/common/QuotFormate";
// import MessageFormatOnline from "@/view/chat/components/common/MessageFormatOnline";
import { setTimeout } from "timers";
import Message from "@/services/message";
import {
  SET_CHAT,
  CLEAR_CHAT,
  CHAT_REST_SEND,
  UPDATE_CHAT_RECORD,
  GET_LAST_MSG_LIST,
  SET_CHAT_LIST,
  SEND_READ_MESSAGE,
  GO_MESSAGE_PAGE,
} from "@/store/types";
import { deleteSessionsWithoutDraft } from "@/services/rightClickByDB";
import {convertToPinyin} from "@/utils/pinyin";

import mixins from '../../mixin/mixin';
import  { imgView } from '@/utils/util.js'

export default {
  name: 'Single',
  mixins: [mixins],
  //import引入的组件需要注入到对象中才能使用
  components: {
    Title,
    Notice,
    MemberCardOther,
    GroupCard,
    ServiceIcon,
  },
  // directives: {
  //   clickDown: {
  //     inserted(el) {
  //       el.onmousedown = function() {
  //         this.resizeChange();
  //       };
  //     }
  //   }
  // },
  data() {
    //这里存放数据
    return {
      fromGroupType:'single',
      friendSystemObj: {
        msgTopValue: '0',
        msgTopClick: false,
        msgOutlineValue: '0',
        msgOutlineClick: false
      },
      friendSystemAble: false,
      userSettingData: {},
      saveTimeActive: '6',
      texthtml: '',
      emojiList: [],
      userId: localStorage.userId,
      text: '',
      mesType: '1',
      limit: 9,
      topMsgOrder: 0, //记录当前位置
      multiple: true,
      uploadLoading: false,
      msgBody: {},
      publickKey: '',
      publickKeyVersion: '',
      friendName: decodeURIComponent(this.$route.query.friendName),
      id: this.$route.query.id, //好友id
      viewers: '',
      dialogRelayVisible: false,
      editorOption: {
        placeholder: this.$t('chat_0002'),
        // placeholder: this.encrypted || this.$t('chat_0002'),
        // placeholder: '该消息已加密',
        theme: 'bubble', // or 'bubble'
        formats: ['image', 'alt', 'height', 'width'],
        modules: {
          toolbar:[],
          clipboard: {
            matchers: [
            ]
          }
        }
      },
      emojiVisible:false,
      initFlag: false
    };
  },
  //监听属性 类似于data概念
  computed: {
    notDiDiService() {
      return item => {
        return (
          item.id != '1008455862495526912' && item.id != '1032384035881537536' && item.id != this.$paymentId
        );
      };
    },
    winActive(){
      return this.$store.state.common.winActive;
    }
  },
  //监控data中的数据变化
  watch: {
    // $route: "changeRoute",
    async $route() {
      await this.init();
      this.stopVideo();
      this.getDraft();
    },
    async chatList(val) {
      if (localStorage.getItem('specailChat') == 'true') {
        localStorage.setItem('specailChat', false);
      } else {
        // this.scrollBottom();
      }      
      if (val && val.length > 0) {
        let msgType = val[val.length - 1].msgType;
        if (msgType == 14) {
          console.log('ssssssRRRRR', msgType);
        }
        if (msgType == '13') {
          this.getPublickey();
        }
        if (val[val.length - 1].fromIcon == undefined) {
          val[val.length - 1].fromIcon = this.userInfo.imgUrl;
        }
      }
      if(this.friendSystemAble){
        await this.getImg();
        this.getUserSessionList();
      }
    },
    '$i18n.locale': {
      deep: 'true',
      immediate: true,
      handler: function (v) {
        console.log('$i18n.locale-- ',v)
        /*this.$set(this.editorOption, 'placeholder',this.$t('chat_0002'))
        this.$forceUpdate();
        console.log('this.editorOption.placeholder-- ', this.editorOption.placeholder)*/
      }
    },
    winActive(current, prev){
      console.log(current, prev)
      if(current){
        this.getlist(true);
      }
    }
  },
  filters: {
    // formatFileSize(size) {
    //   let value = Number(size);
    //   if (size && !isNaN(value)) {
    //     const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'BB'];
    //     let index = 0;
    //     let k = value;
    //     if (value >= 1024) {
    //       while (k > 1024) {
    //         k = k / 1024;
    //         index++;
    //       }
    //     }
    //     return `${k.toFixed(2)}${units[index]}`;
    //   }
    //   return '';
    // },
    // diffTimeHand(val) {
    //   return diffTimeInChat(val);
    // }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    // await this.getDraft()
    this.initFlag = true;
    this.item = this.$route.query.item;
  },

  //方法集合
  methods: {

    ...mapActions([CHAT_REST_SEND, GET_LAST_MSG_LIST]),
    ...mapMutations([
      SET_CHAT,
      CLEAR_CHAT,
      UPDATE_CHAT_RECORD,
      GO_MESSAGE_PAGE,
    ]),
    // 打开图片查看器
    openImgView () {
      console.log('图片查看器=userInfo=', this.userInfo)
      imgView(this.userInfo.imgUrl, this.userInfo.id)
    },
    async queryGroupInfo(groupId) {
      //查询群名片信息
      let param = { groupId: groupId };
      let res = await queryGroupByGroupId(param);
      this.groupInfo = {};
      if (res.code == '200' && res.data) {
        this.groupInfo = res.data;
        if (this.groupInfo && this.groupInfo.country && this.groupInfo.city) {
          this.groupInfo.countryName = await SQLUtils.getTAreaCountryOrCityName(this.groupInfo.country);
          this.groupInfo.cityName = await SQLUtils.getTAreaCountryOrCityName(this.groupInfo.city);
          this.groupInfo.region = this.groupInfo.countryName + '-' + this.groupInfo.cityName;
        } else {
          this.groupInfo.region = '';
          this.groupInfo.country = '';
          this.groupInfo.city = '';
        }
      }
    },
    // 是否做为MESSAGE显示，包括是否显示的消息
    isMessage(item) {
      return (
        item.msgType != '61' &&  // 矿
        item.msgType != '4' && //	通知
        item.msgType != '13' && //红包
        item.msgType != '26' && //撤销消息（消息状态）
        item.msgType != '24' && //	撤销执行消息（发送）
        item.msgType != '7' && //密钥变更
        this.isShowMessage(item)
      ); //不显示的Message 必定不作为正文显示
    },
    //消息是否显示
    isShowMessage() {
      return true;
    },

    async confirmBatchDelMsgs(list) {
      let message = '';
      if (list[0].fromId == localStorage.userId) {
        //是自己发送的消息
        message = new Message(list[0].targetId);
      } else {
        message = new Message(list[0].fromId);
      }
      localStorage.setItem('specailChat', true);
      let j = this.chatList.length;
      if (j == 1) {
        //当即时消息只有一条时，清空此时这个回话最新一条消息
        await message.deleteMessageByMsgId(list[0].msgId); //从表里删除
        this.$store.commit('DEL_LAST_MSG_LIST', list[0]);
      } else {
        //删除多条
        let msgIds = '';
        list.map(item => {
          msgIds = msgIds.concat(item.msgId).concat(',');
        });
        msgIds = msgIds.substr(0, msgIds.length - 1);
        await message.deleteMessageByMsgIds(msgIds);
        await this.init();
        this.$store.dispatch('GET_LAST_MSG_LIST');
      }
      this.chatList = this.chatList.map(obj => {
        list.forEach(item => {
          if (obj.msgType == '25' && obj.quotemsgObj && item.msgId == obj.quotemsgObj.msgId) {
            obj.quotemsgObj = null;
          }
        });
        return obj;
      });
    },

    async delMsg(a, item) {
      //删除一条消息
      let message = '';
      if (item.fromId == localStorage.userId) {
        //是自己发送的消息
        message = new Message(item.targetId);
      } else {
        message = new Message(item.fromId);
      }
      await message.deleteMessageByReqId(item.reqId); //从表里删除
      let j = this.chatList.length;
      if (j == 1) {
        //当即时消息只有一条时，清空此时这个回话最新一条消息
        item.delFlag = true;
        this.$store.commit('DEL_LAST_MSG_LIST', item);
        console.log(this.$store.state.chat.lastMsgList);
      } else if (this.chatList[j - 1].reqId == item.reqId) {
        //删的是即时消息中最后一条
        this.$store.dispatch('ADD_LAST_MSG_LIST', {
          ...this.chatList[j - 2],
          id: this.$route.query.id,
          updateSource: 'SOURCE_DEL_MSG'
        });
      }
      await this.$nextTick();
      this.$store.dispatch('GET_LAST_MSG_LIST')
      this.chatList = this.chatList.filter(obj => {
        localStorage.setItem('specailChat', true); //为了删除消息是不让滚动条滚到底部。停留在当前删除的位置
        return item.reqId != obj.reqId;
      });
      this.chatList = this.chatList.map(obj => {
        if (obj.msgType == '25' && obj.quotemsgObj && item.msgId == obj.quotemsgObj.msgId) {
          obj.quotemsgObj = null;
        }
        return obj;
      });
    },

    async lookcard(item) {
      let msgBody;
      if (item.msgBody instanceof Object) {
        msgBody = item.msgBody;
      } else {
        msgBody = JSON.parse(item.msgBody);
      }
      if (msgBody.type == 1) {
        //个人名片
        if (msgBody.id != '1032384035881537536' && msgBody.id != '1008455862495526912') {
          this.cardDialogVisible = true;
          this.cardUserId = msgBody.id;
          this.$nextTick(() => {
            this.$refs.cardOther.onCardShow();
          });
        }
      } else {
        await this.queryGroupInfo(msgBody.id);
        if (this.groupInfo && this.groupInfo.id) {
          this.$refs.groupCard.onPop();
        } else {
          const msg = this.$t('chat_0076');
          this.openMessage(msg);
        }
      }
    },

    async lookQuoteCard(quotemsgObj) {
      let msgBody;
      if (quotemsgObj.msg_body instanceof Object) {
        msgBody = quotemsgObj.msg_body;
      } else {
        msgBody = JSON.parse(quotemsgObj.msg_body);
      }
      if (msgBody.type == 1) {
        //个人名片
        if (msgBody.id != '1032384035881537536' && msgBody.id != '1008455862495526912') {
          this.cardDialogVisible = true;
          this.cardUserId = msgBody.id;
          this.$nextTick(() => {
            this.$refs.cardOther.onCardShow();
          });
        }
      } else {
        //群名片
        await this.queryGroupInfo(msgBody.id);
        if (this.groupInfo && this.groupInfo.id) {
          this.$refs.groupCard.onPop();
        } else {
          const msg = this.$t('chat_0076');
          this.openMessage(msg);
        }
      }
    },

    showInfo() {
      if (this.userInfo.id != '1032384035881537536' && this.userInfo.id != '1008455862495526912') {
        this.cardDialogVisible = true;
        this.cardUserId = this.userInfo.id;
        this.$nextTick(() => {
          this.$refs.cardOther.onCardShow();
        });
      }
    },

    showUserInfo(id) {
      if (id != '1032384035881537536' && id != '1008455862495526912') {
        this.cardDialogVisible = true;
        this.cardUserId = id;
        this.$nextTick(() => {
          this.$refs.cardOther.onCardShow();
        });
      }
    },

    // 讨论组 选择联系人
    selectDiscussionMembers() {
      if(this.personalAppealInfo.endTime){
        let time = `${this.personalAppealInfo.createTime}--${this.personalAppealInfo.endTime}`;
        this.$confirm(this.$t('appeal_0003', {time}), this.$t('Universal_0059'),{
          confirmButtonText: this.$t('appeal_0017'),
          cancelButtonText: this.$t('book_group_0019'),
          center: true,
          showClose: false,
        }).then(() => {
          this.toAppeal('single');
        }).catch(() => {
        });
        return;
      }
      this.Comtit = this.$t('chat_select_chat_0002');
      this.GroupInviteVisible = true;
    },

    confirmDialogHand(list) {
      if (this.Comtit == this.$t('Universal_0202')) {
        // 转发
        this.GroupInviteVisible = false;
        this.mutiChooseTag = false; //隐藏多选按钮
        this.mutiPanel = false;
      } else if (this.Comtit == this.$t('chat_select_chat_0002')) {
        // 发起讨论组
        let nameArrayString = `${this.$store.state.common.userInfo.nickName}、${this.userInfo.friendNickName}`;
        let userIdArrayString = `${localStorage.getItem('userId')},${this.userInfo.id}`;
        list.forEach(item => {
          nameArrayString = `${nameArrayString}、${item.friendNickName}`;
          userIdArrayString = `${userIdArrayString},${item.friendId}`;
        });
        let params = {};
        params.groupName = nameArrayString.substring(0, 30);
        params.groupUserId = userIdArrayString;
        params.groupStatus = 2;
        params.groupType = 0;
        createGroup(params).then(async res => {
          if (res.code == 200) {
            this.$message.success(this.$t('Universal_0109'));
            let data = res.data;
            const groupInfo = data.groupBase[0];
            const groupMemberList = data.groupMember;
            const memberAuthList = data.memberAuth;
            this.createGroupInfo(groupInfo);
            this.createGroupMember(groupMemberList);
            this.createGroupAuth(memberAuthList);
            this.createGroupAppealInfo(groupInfo),
            this.createGroupExceedInfo(groupInfo),
            this.createGroupToUpdateVersion([
              {
                name: 'gtmcn',
                version: data.gtmcn
              },
              {
                name: 'gtmn',
                version: data.gtmn
              },
              {
                name: 'gtn',
                version: data.gtn
              }
            ]);
          } else {
            this.$message.error(res.data.msg);
          }
        });
        this.GroupInviteVisible = false;
        this.mutiChooseTag = false;
        this.mutiPanel = false;
      }
    },

    async createGroupInfo(item) {
      const obj = {
        group_id: item.id,
        group_name: item.groupName,
        group_status: item.groupStatus,
        group_profile: item.groupProfile,
        group_avatar: item.groupAvatar,
        group_avatar_local: '',
        add_check: item.addCheck,
        invite_auth: item.inviteAuth,
        country: item.country,
        city: item.city,
        screenshotsReminderStatus: item.screenshotsReminderStatus,
        forbiddenWordsStatus: item.forbiddenWordsStatus,
        memberSingleChatStatus: item.memberSingleChatStatus,
        sendPicturesStatus: item.sendPicturesStatus,
        sendConnectionStatus: item.sendConnectionStatus,
        copyMessagesStauts: item.copyMessagesStauts,
        sendRedpacketStatus: item.sendRedpacketStatus,
        create_time: item.createdOn,
        save_time: item.saveTime,
        people: item.people,
        member_level_status: item.memberLevelStatus,
        group_level: item.groupLevel,
        updatedOn: item.updatedOn,
        code: '',
        group_name_pinyin: convertToPinyin(item.groupName),
        is_show: 'true',
        group_code: item.groupCode,
        group_type: item.groupType,
        groupTab: item.groupTab
      };
      this._groupInfo = obj;
      return await window.vm.$knex('t_groups').insert(obj);
    },

    async createGroupMember(memberList) {
      const list = [];
      for (let item of memberList) {
        list.push({
          id: item.userId,
          group_id: item.groupId,
          auth_status: item.authStatus,
          nick_name: item.nickName,
          user_head_img: item.userHeadImg,
          user_head_img_local: '',
          member_notes: item.memberNotes,
          member_notes_pinyin: item.memberNotes == undefined ? '' : convertToPinyin(item.memberNotes),
          is_show: 'true',
          forbiddenWordsStatus: 0,
          muteNotifications: 0,
          additionalStatus: 0,
          mutedStatus: 0,
          stickyStatus: 0,
          vipType: item.vipType,
          inviteCodeType: item.inviteCodeType,
          userRank: item.userRank,
          inviteCode: item.inviteCode
        });
      }
      const cc = await window.vm.$knex.batchInsert('t_groups_member', list, 10);
      return cc;
    },

    async createGroupAuth(memberAuthList) {
      console.log('createGroupAuth');
      const list = [];
      for (let item of memberAuthList) {
        list.push({
          group_id: item.groupId,
          user_id: item.userId,
          member_leval: item.memberLeval,
          muted_status: item.mutedStatus,
          additional_status: item.additionalStatus,
          mute_notifications: item.muteNotifications,
          forbidden_words_status: item.forbiddenWordsStatus,
          sticky_status: item.stickyStatus,
          user_level: item.userLevel
        });
      }
      console.log('list', list);
      const cc = await window.vm.$knex.batchInsert('t_groups_member_auth', list, 10);
      console.log(cc);
      return cc;
    },
    async createGroupAppealInfo(item) {
      const obj = {
        group_id: item.id,
        closure_create_time: '',
        closure_end_time: '',
        closure_impeach_reason: '',
        closure_limit_day: 0,
        closure_limit_type:0,
        show_appeal_closure_notice: 0,
        warn_create_time: '',
        warn_end_time: '',
        warn_impeach_reason: '',
        warn_limit_day: 0,
        warn_limit_type:0,
        show_appeal_warn_notice: 0
      }
      return await window.vm.$knex('t_groups_appeal').insert(obj);
    },
    async createGroupExceedInfo(item) {
      const obj = {
        group_id: item.id,
        exceed_num: 0,
        show_exceed_notice: 0,
      }
      return await window.vm.$knex('t_groups_exceed').insert(obj);
    },
    async createGroupToUpdateVersion(versionlist) {
      const q = [];
      for (let item of versionlist) {
        q.push(
          window.vm
            .$knex('t_news_version')
            .where({ name: item.name })
            .update({ version: item.version })
        );
      }
      const cc = await Promise.all(q);
      return cc;
    },

    async getImg() {
      let id = this.$route.query?.fromId||this.$route.query.id; //friend id
      if(!id){
        console.warn('$route.query',id);
        return
      }
      let uinfo = await window.vm
        .$knex('t_contacts')
        .select()
        .where('friend_id', id);
      if (uinfo.length > 0) {
        let d = uinfo[0];
        this.imgUrl = d.friend_head_img;
        this.nick_name = d.friend_friendNotes || d.friend_nick_name;
        d.imgUrl = d.friend_head_img;
        d.userNickName = d.friend_friendNotes || d.friend_nick_name;
        d.id = d.friend_id;
        d.friendNickName = d.friend_nick_name;
        this.userInfo = d;
        console.log('this.userInfo ======== ', this.userInfo);
      } else {
        //TODO 从服务器更新
        console.error('无法获取好友信息', id);
      }
    },

    goSetting(val) {
      console.log(val);
      this.friendSystemAble = true;
      this.initSetting(); //初始化设置
    },

    async sendQuill() {
      this.sendBtnDisabled = false;
      const textList = [];
      let j = 0;
      if (!this.quill.editor.delta.ops.length) {
        return;
      }
      for (let _delta of this.quill.editor.delta.ops) {
        if (typeof _delta.insert != 'string') {
          if (_delta.insert.image && !_delta.attributes) {
            let reqId = uuidv4();
            const blob = this.dataURItoBlob(_delta.insert.image);
            const filePath = await fileOperational.saveImageToFile(_delta.insert.image, reqId + '.png');
            _delta.insert.path = filePath;
            _delta.insert.size = blob.size;
            _delta.insert.fromId = UserInfoUtils.getCurrentUserId();
            _delta.insert.friendId = this.userInfo.id;
            _delta.insert.fileType = '2';
            this.sendImageLocal(_delta.insert, reqId);
          }
        }
      }
      const textcontent = this.texthtml; //临时存消息体，防止字数超过时置空了
      this.texthtml = '';
      console.log(this.quill.editor.delta.ops, 'this.quill.editor.delta.ops');
      for (let _delta of this.quill.editor.delta.ops) {
        if (typeof _delta.insert == 'string') {
          let text1 = _delta.insert;
          // text1 = text1.replace(/(^\s*)|(\s*$)/g, "");
          if (text1) {
            textList.push({ text: text1, type: 'text', j: j++ });
          }
        } else {
          if (
            //表情图
            _delta.insert.image &&
            _delta.attributes &&
            _delta.attributes.alt
          ) {
            let ret = emojiList.find(x => x.tag == _delta.attributes.alt);
            if (ret) {
              textList.push({
                text: _delta.attributes.alt,
                type: 'text',
                j: j++
              });
              // this.text += _delta.attributes.alt;
            }
          } else if (this.isUrl(_delta.insert.image)) {
            textList.push({
              image: _delta.insert.image,
              type: 'image',
              j: j++
            });
          } else {
            this.quoteVisible = false;
            textList.push({
              content: _delta.insert,
              type: 'image',
              j: j++
            });
          }
        }
      }
      const sendList = [];
      for (let i = 0; i < textList.length; i++) {
        if (i === 0) {
          sendList.push(textList[i]);
        }
        if (i > 0) {
          if (textList[i].type === 'text') {
            if (sendList[sendList.length - 1].type === 'image') {
              sendList.push(textList[i]);
            } else {
              sendList[sendList.length - 1].text = sendList[sendList.length - 1].text += textList[i].text;
            }
          } else {
            sendList.push(textList[i]);
          }
        }
      }
      let friendId = this.$route.query.id;
      for (let ele of sendList) {
        let msgBody = {};
        let text = '';
        let sum = 0;
        if (ele.type === 'text') {
          text = ele.text;
          if (text.split('')[text.length - 1] == '\n') {
            let arr = text.split('');
            arr.pop();
            text = arr.join('');
            text = text.replace(/^\s+|\s+$/g, '');
          }
          sum = sum + text.length;
          if (this.quoteVisible) {
            msgBody = {
              quoteFromName: this.quoteFromName,
              msgs: [{ msgId: this.quoteMsgId, reqId: this.quoteReqId }],
              text: text
            };
          } else {
            msgBody = {
              text: text
            };
          }
          this.mesType = '1';
          if (sum > 1500) {
            this.$message.error(this.$t('Universal_0238', {value: 1500}));
            this.texthtml = textcontent;
            return;
          } else if (!text.trim()) {
            continue;
          } else {
            this.POST_chat_rest_send(msgBody, text, friendId);
          }
        }
        if (ele.type === 'image') {
          this.mesType = '2';
          this.fileReqId = ele.reqId;
          this.handSendImg(ele.content);
          // this.POST_chat_rest_send(ele.image, "", friendId);
        }
      }
      this.text = '';
      this.texthtml = '';
      return;
    },

    async POST_chat_rest_send(msgBody, textOrigin, friendId) {
      let pararms = {
        id: friendId,
        reqId: msgBody.reqId ? msgBody.reqId : uuidv4(),
        targetType: '1', // 单聊1 群聊2
        targetId: friendId,
        uniqueCode: contFriSize(friendId, this.userId),
        fromType: '999',
        fromId: msgBody.fromId ? msgBody.fromId : this.userId,
        msgType: this.quoteVisible ? '25' : this.mesType, // 1文本
        msgBody: msgBody,
        msgHeader: {
          pubKey: '', //this.publickKey,
          version: this.publickKeyVersion,
          msgSeqNo: 1,
          msgSeqTotal: 1,
          effectiveTime: -1,
          sourceSite: null,
          language: this.$i18n.locale,
          sign: null,
          signType: null,
          Authorization: localStorage.accessToken
        },
        refMsgBody: {
          fromName: JSON.parse(localStorage.userInfo).nickName,
          fromIcon: JSON.parse(localStorage.userInfo).headImg
        }
      };
      if (msgBody.reqId) {
        await SQLUtils.insertFileChatContent(pararms);
      }
      //
      const single = {
        msgBody: {
          originTypePsw: false,
          ...msgBody,
          text: textOrigin
        }
      };
      const option = {
        ...pararms,
        refMsgBody: {
          ...pararms.refMsgBody
        },
        single: JSON.stringify(single)
      };
      if (textOrigin) {
        option.textOrigin = textOrigin;
      }

      await this.CHAT_REST_SEND(option);

      this.quoteVisible = false;
      this.quoteMsgId = '';
      setTimeout(() => {
        this.$nextTick(() => {
          if (this.$refs.talk) {
            this.$refs.talk.scrollTop = this.$refs.talk.scrollHeight;
          }
        });
      }, 600);
    },

    async getPublickey() {
      let friendId = this.$route.query.id;
      if (friendId == undefined || friendId == '') {
        throw this.$t('chat_0094');
      }
      return;
      //如果不需要加密，那么不取公钥
      // if (!ChatListUtils.needCrypto(this.userId, friendId, 1)) {
      //   return;
      // }
      // //从数据库中取
      // let pubKeyData = await window.vm
      //   .$knex("t_contacts_pubkey")
      //   .select()
      //   .where("user_id", friendId);

      // if (pubKeyData.length == 0) {
      //   let res = await get_use_rsa({
      //     userIds: friendId,
      //   });
      //   pubKeyData = res.data;
      //   if (pubKeyData[0]) {
      //     this.publickKey = pubKeyData[0].rsaPub;
      //   } else {
      //     console.error("无法获取好友的公钥", friendId);
      //   }
      // } else {
      //   this.publickKey = pubKeyData[0].rsa_pub;
      //   this.publickKeyVersion = pubKeyData[0].rsa_pub_version;
      // }
    },

    goMessage() {
      // this.$router.push("/app/chat");
      this.$router.push({
        path: this.$route.path,
        query: {
          ...this.$route.query,
          timer: new Date().getTime()
        }
      });
    },

    async init() {
      this.noMoreShowFlg = false; //避免同一个path情况下，出现‘没有更多消息’
      this.friendName = decodeURIComponent(this.$route.query.friendName || '');
      this.texthtml = '';
      this.id = this.$route.query.id;
      this.text = '';
      this.mutiChooseTag = false;
      this.mutiPanel = false;
      await this.getlist();
      await this.getFriendInfo();
      let current = {
        id: this.id,
        sessionName: this.friendName,
        sessionIcon: this.imgUrl,
        targetType: 1, //单聊
        uniqueCode: contFriSize(this.id, UserInfoUtils.getCurrentUserId())
      };
      this.$store.commit('SET_CURRENT_CHAT', current);
      this.$nextTick(() => {
        this.chatlistFlag = true;//展示消息框顶部的头像信息，确保在chatlist拿到数据以后显示
      });
    },

    async getFriendInfo() {
      await this.getImg();
      // this.getPublickey();
      this.quoteVisible = false;
      this.item = this.$route.query.item || {};
      this.amr = '';
      this.getUserSessionList();
      this.$forceUpdate();
    },

    async getUserSessionList() {
      const msgExpireTimeIndex = findIndex(this.saveTimeArr, ele => {
        return ele.value == this.userInfo['msgExpireTime'];
      });
      this.saveTime = this.saveTimeArr[msgExpireTimeIndex]?.label;
      this.saveTimeActive = msgExpireTimeIndex;
    },

    async getlist(isForce) {
      this.hasMore = false;
      // console.log(this.$route.query.fromId);
      const list = await SQLUtils.selectSingleChatList(this.$route.query?.fromId||this.$route.query.id, '');
      const chats = await this.handlelist(list);
      const lastChat = chats.length > 1 ? chats[chats.length - 1] : null;
      if ((this.$route.query.unread && lastChat && 
      lastChat.fromId != UserInfoUtils.getCurrentUserId() && this.winActive) || (isForce && lastChat)) {
        this.$store.dispatch(SEND_READ_MESSAGE, {
          ...lastChat,
          id: parseUniqueCode(lastChat.uniqueCode, lastChat.targetType)
        });
      }
      this.$store.commit(SET_CHAT_LIST, chats);
      if (chats.length >= 30) {
        this.hasMore = true;
      }
      // this.scrollBottom();
    },

    //清除历史记录
    async clearMessageHistory() {
      await deleteSessionsWithoutDraft(this.userInfo.id);
      this.$message.success(this.$t('chat_0059'));
      this.GET_LAST_MSG_LIST();
      this.historyVisible = false;
      this.$router.replace('/app/chat'); //删除成功后返回聊天列表页面
    },

    async saveExpireTime(index) {
      this.saveTimeVisible = false;
      const params = {
        friendId: this.$route.query?.fromId||this.$route.query.id,
        userId: UserInfoUtils.getCurrentUserId(),
        msgExpireTime: this.saveTimeArr[index].value
      };
      await usersession_update(params);
      await window.vm
        .$knex('t_contacts')
        .where({ friend_id: this.$route.query?.fromId||this.$route.query.id })
        .update({
          msgExpireTime: this.saveTimeArr[index].value
        });
      this.saveTime = this.saveTimeArr[index].label;
    },
    async checkoutReadStatus() {
      // this.id
      const hasTable = await window.vm.$knex.schema.hasTable(`m_${this.id}`);
      if (hasTable) {
        const last410 = await sqliteQueryBySQL(`SELECT max(msg_order) as maxOrder from m_${this.id} where from_type=410 `);
        console.log('-=-=-=-=', last410, this.id);
        if (last410 && last410.length) {
          await sqliteQueryBySQL(`update m_${this.id} set status=3 where msg_order<${last410[0].maxOrder} and status=2 and from_type=410 `)
        }
      }
      await this.init()
      this.inited();
      this.getDraft(); //读取未发出去的消息
    }
  },

  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.checkoutReadStatus();
    // this.init()
    // this.inited();
    // this.getDraft(); //读取未发出去的消息
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
    this.CLEAR_CHAT();
  }, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>

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
.group-member-name-class {
  color: #999999;
  font-size: 12px;
  margin: 0px 10px 0px 10px;
  display: flex;
  align-items: center;
  white-space: pre;
  div {
    padding-right: 2px;
  }
}
.audioClass {
  float: right;
  padding: 0 10px;
  .video-icon-class {
    width: 18px;
    height: 12px;
    margin-bottom: 4px;
  }
}
.addDiscussin {
  padding: 10px 0 20px;
  display: flex;
  flex: 1;
  font-size: 12px;
  // justify-content: space-around;
  align-items: center;
  text-align: center;

  .userInfoClass {
    margin-right: 20px;
    text-align: -webkit-center;
    /*img {*/
    /*  width: 40px;*/
    /*  height: 40px;*/
    /*  border-radius: 20px;*/
    /*}*/

    p {
      width: 50px;
      text-overflow: ellipsis;
      white-space: pre;
      overflow: hidden;
    }
  }
}

.el-tag--dark.el-tag--info {
  background-color: #e7e7e7;
  border: none;
  color: #727272;
}

.el-tag--dark.el-tag--info .el-tag__close {
  color: #666;
}

.list {
  display: flex;
}

.el-checkbox {
  display: flex;
  margin-right: 0;
}

.emojList {
  // max-height: 400px;
  // overflow: auto;
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
  left: -18px;
}

.mess-words {
  position: relative;
  width: 100%;
}

.others-msg {
  left: 0;
}

.self-msg {
  left: 10px;
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

.friendSystemBox {
  font-size: 14px;
  box-sizing: border-box;
  width: 100%;
  height: 100vh;
  overflow-y: scroll;

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
    font-size: 14px;
    color: #333;
    padding: 0 10px;

    & > ul {
      li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        // height: 45px;
        height: 38px;
      }

      .many-select {
        font-size: 14px;

        font-weight: 400;
        color: #666;
      }

      .el-icon-arrow-right {
        color: #000;
        font-size: 14px;
      }
    }
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
  overflow: hidden;
  text-overflow: ellipsis;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  width: 70%;
  margin: 0 auto;

  /deep/ .dialog-footer {
    width: 80%;
  }

  /deep/ .el-button--mini,
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
  width: 85%;
  margin: 0 auto;

  li {
    margin: 10px 0;
    width: 100%;
    height: 25px;
    line-height: 25px;
    background-color: #f3f3f3;
    font-size: 13px;
    color: #696969;
    text-align: center;
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
      color: #409eff;
      top: 6px;
      position: absolute;
      right: 6px;
    }
  }
}

//@import url(); 引入公共css类
.chatother {
  user-select: none;

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

.message {
  width: 100%;
  background: #f6f6f6;
  position: relative;

  .mess-header {
    height: 38px;
    background: rgba(243, 243, 243, 1);
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
    padding: 10px 20px 0 20px;
    box-sizing: border-box;
  }

  .mess-detail-self {
    width: 100%;
    // padding: 20px 20px 0 20px;
    padding: 10px 20px 0 20px;
    box-sizing: border-box;
  }

  .notify {
    text-align: center;
    font-size: 12px;
    color: #999;
  }

  .mess-name {
    font-size: 18px;

    font-weight: bold;
    color: rgba(51, 51, 51, 1);
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

  #resize {
    height: 5px;
    width: 100%;
    cursor: n-resize;
    border-bottom: #e4e4e4 solid 1px;
  }

  #resizeBox {
    position: relative;
    height: calc(100vh - 61px);
    z-index: 1000;
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

    /deep/ .ql-container .ql-editor span {
      background: none !important;
      color: black !important;
    }
  }

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

  .tip-msg {
    height: 100%;
    align-items: center;
    justify-content: center;
  }

  .audio-wrap {
    vertical-align: middle;
    padding-right: 10px;

    img {
      width: 30px;
      vertical-align: middle;
      padding-right: 4px;
    }
  }
}

.btn {
  cursor: pointer;
  border: none;
  padding: 10px 0;
  width: 80%;
  /* height: 30px; */
  background: #2f54eb;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
}

.infotime {
  text-align: center;
  color: rgb(153, 153, 153);
  margin-top: 10px;
  font-size: 12px;
  font-size: 12px;
}
</style>

<style lang="less">
.ql-container {
  height: 100%;
  overflow-y: scroll;
  width: 100%;
  background: #f6f6f6;
}

.ql-toolbar.ql-snow + .ql-container.ql-snow {
  border: none;
  padding-top: 5px;
}

.ql-toolbar {
  display: none;
}

.ql-tooltip {
  display: none;
}

.ql-editor {
  height: 100%;
  padding: 0;
  line-height: 0px;
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
  line-height: 23px;
  font-size: 14px;
  min-width: 30px;
  // max-width: 300px;
  // max-width: 65%;
  max-width: 62%;
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
//   top:13px;
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
  max-width: 62%;
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
//   top:13px;
//   border-top: 6px solid transparent;
//   border-left: 10px solid #cfe1ff;
//   border-bottom: 6px solid transparent;
// }

#talkbubble .flex-direction p {
  width: 88%;
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

.message-box-class {
  width: 280px;
  .el-message-box__headerbtn {
    display: none;
  }
}
</style>

<style lang="less" scoped>
.popupmsg {
  /deep/ .el-dialog__header {
    padding-top: 10px;
  }

  /deep/ .el-dialog__title {
    font-size: 14px;
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
#talkbubble {
  &.fileBox {
    max-width: none;
    width: 250px !important;
  }
}
#talkbubblee {
  &.fullOfEmoji {
    max-width: 62%;
  }
  &.imgTopSpace{
    padding: 0 10px;
  }
  &.fileBox {
    max-width: none;
    width: 250px !important;
  }
}
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
</style>
