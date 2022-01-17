<template>
  <div class="">
    <div v-if="item.quotemsgObj">
      <!-- {{item.quotemsgObj.text}}{{quote_originText}} -->
      <div v-if="item.quotemsgObj.msgType == '26'" class="quoteBubble">
        {{ $t('chat_0065') }}
      </div>
      <div v-else class="quoteBubble" :class="item.quotemsgObj.msgType == '15' ? 'cardBubble' : ''">
        <label class="quotName">{{
          this.item.msgBody instanceof Object ? item.msgBody.quoteFromName : JSON.parse(item.msgBody).quoteFromName
        }}</label
        ><span v-if="item.msgBody.quoteFromName">:</span>
        <span v-if="item.quotemsgObj && (item.quotemsgObj.msgType == 1 || item.quotemsgObj.msgType == 25)" class="text">
          <el-popover placement="left-end" title="" width="200" height="200" trigger="click" popper-class="quote-popover">
            <div v-if="!emojiFlag">{{item.quotemsgObj.text}}</div> <!--纯文本的引用-->
            <div v-else v-html="item.quotemsgObj.text">引用的内容</div><!--带表情的引用-->
            <span
              v-if="emojiFlag"
              slot="reference"
              ref="quoText"
              v-html="item.quotemsgObj.text"
              class="quotext"
              style="white-space: initial; width: 290px"
              >{{ item.quotemsgObj.text }}</span>
            <span v-else slot="reference" ref="quoText"  class="quotext">
              {{ item.quotemsgObj.text }}
            </span>
          </el-popover>
        </span>
        <span v-else-if="item.quotemsgObj.msgType == 2">
          <!-- <viewer class="quotImg" :image="imglsit"> -->
          <!-- <img v-show="item.quotemsgObj.msgBody.format === 'tiff'"
               :src="item.quotemsgObj.msgBody.tiffPath"
               alt
               @click="viewerShowChild(item.quotemsgObj)"

          />
          <img
              v-show="item.quotemsgObj.msgBody.format !== 'tiff'"
              :src="findImage(item.quotemsgObj.msgBody.mediaId)" @click="viewerShowChild(item.quotemsgObj)" /> -->

          <img
             :src="findImage(item.quotemsgObj.msgBody.mediaId)" @click="viewerShowChild(item.quotemsgObj)" />   
          <!-- </viewer> -->
        </span>
        <!--视频文件-->
        <span  v-else-if="item.quotemsgObj.msgType == '10'" class="video-wrap">
          <span @click="handleQuoteVideoShow" v-if="!itemData.quotemsgObj.showfile">
            {{ $t('chat_0015') }}
          </span>
          <span v-if="itemData.quotemsgObj.showfile" @click="viewerShowChild(item.quotemsgObj)">
            <video
                :style="{
          background: item.quotemsgObj.msgBody.noFirstFrame || item.quotemsgObj.msgBody.isH265 ? '#cfe1ff': ''}"
                v-if="item.quotemsgObj.showfile"
                :src="item.quotemsgObj.msgBody.fileId"
                class="show-video"
                :height="item.quotemsgObj.msgBody.firstFrame.height"
                :width="item.quotemsgObj.msgBody.firstFrame.width"
            >
            {{ $t('Universal_0373') }}
          </video>
            <i class="el-icon-video-play videoStart"
               @click="viewerShowChild(item.quotemsgObj)"
               v-show="(item.quotemsgObj.msgBody.downloadFinished||
               videoDownloadPercent[item.quotemsgObj.msgId]==100)&&
               !fileBeCleared[item.quotemsgObj.msgId]" />
            <span class="progress-mask"
                  v-show="item.quotemsgObj.msgBody.downloadLoading&&
                  videoDownloadPercent[item.quotemsgObj.msgId]!==100&&
                  !fileBeCleared[item.quotemsgObj.msgId]"></span>
            <el-progress type="circle"
                         :percentage="videoDownloadPercent[item.quotemsgObj.msgId]||0"
                         class="videoStart downloadProcess"
                         :show-text="false"
                         :width="40"
                         v-show="videoDownloadPercent[item.quotemsgObj.msgId]<100&&!fileBeCleared[item.quotemsgObj.msgId]"
                         color="#2f54eb"
                         :stroke-width="3"
            ></el-progress>
<!--            {{'a: '+videoNotInCurrentPC[item.quotemsgObj.msgId]}}
            {{'b: '+fileBeCleared[item.quotemsgObj.msgId]}}-->
            <i class="el-icon-warning videoStart"
               v-show="
               videoNotInCurrentPC[item.quotemsgObj.msgId]||
               fileBeCleared[item.quotemsgObj.msgId]"></i>
          </span>
        </span>
        <!--文件-->
        <span v-else-if="item.quotemsgObj.msgType == '6'">
          {{ $t('chat_0017') }}{{ item.quotemsgObj.msgBody&&(item.quotemsgObj.msgBody.fileName || item.quotemsgObj.msgBody.fname) }}
        </span>
        <!--明信片-->
        <span v-else-if="item.quotemsgObj.msgType == '15'" class="carte" @click="lookQuoteCard(item.quotemsgObj)">
          <div class="cardinfo" v-if="item.quotemsgObj.msgBody.type == '2'">
            <img :src="item.quotemsgObj.msgBody.msgUrl" />
            <span style="margin-left:5px">
              <label class="cardName">{{ item.quotemsgObj.msgBody.name }}</label>
              <br />ID:
              {{ item.quotemsgObj.msgBody.code }}
            </span>
          </div>

          <div class="cardinfo" v-else>
            <MemberIcon
              :vipType="item.quotemsgObj.msgBody.vipType"
              :image="item.quotemsgObj.msgBody.msgUrl"
              iconType="mini"
              :userRank="item.quotemsgObj.userRank"
            />
            <div class="topitem">
              <span class="cardName" style="display:flex;align-items:center;margin-bottom:5px;">
                <label class="name">{{ item.quotemsgObj.msgBody.name }}</label>
                <LevelIcon
                  :inviteCode="item.quotemsgObj.msgBody.code"
                  :userRank="item.quotemsgObj.msgBody.userRank"
                  iconType="small"
                  :vipType="item.msgBody.vipType"
                  :inviteCodeType="item.quotemsgObj.msgBody.inviteCodeType"
                  :listFlag="true"
                  style="padding-left: 2px;"
                />
              </span>
              <!-- {{ item.msgBody.code }} -->
              <LuckIdIcon
                :inviteCode="item.quotemsgObj.msgBody.code"
                :userRank="item.quotemsgObj.msgBody.userRank"
                iconType="medium"
                :vipType="item.quotemsgObj.msgBody.vipType"
                :inviteCodeType="item.quotemsgObj.msgBody.inviteCodeType"
                :listFlag="false"
              />
            </div>
          </div>
          <p v-if="item.quotemsgObj.msgBody.type == 1">{{ $t('chat_0021') }}</p>
          <p v-else>{{ $t('chat_0023') }}</p>
        </span>
        <span v-else-if="item.quotemsgObj.msgType == '14'">{{ $t('chat_0087') }}</span>
        <span v-else-if="item.quotemsgObj.msgType == '44'">{{ $t('chat_0088') }}</span>
        <div v-else-if="item.quotemsgObj.msgType == '56'" class="acitivity" @click="goActivityPage(item.quotemsgObj)">
          <img :src="item.quotemsgObj.msgBody.imgUrl" alt="">
          <p class="title">{{item.quotemsgObj.msgBody.title}}</p>
          <!-- <p class="content">{{messageItem.msgBody.text}}</p> -->
          <div class="bottom">
            <img src="../../../../assets/images/didi_activity_icon.png" alt=""><p>{{$t('chat_0125')}}</p>
          </div>
        </div>
        <span v-else>{{ $t('chat_0089') }}</span>
      </div>
    </div>
    <div
      class="quoteBubble"
      v-else-if="!item['quotemsgObj'] && item.msgType == 25"
    >
      {{ $t("chat_0126") }}
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import fileOperational from '@/services/fileOperational';
import MemberIcon from '@/components/memberIcon/MemberIcon';
import LevelIcon from '@/components/memberIcon/LevelIcon';
import LuckIdIcon from '@/components/memberIcon/luckIdIcon';
import { checkVideoIsExists } from '@/utils/file';
import {goOfficialPage} from '../../../../utils'
import { mapGetters } from 'vuex';
import emojiList from "@/utils/emoji.js";
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    MemberIcon,
    LevelIcon,
    LuckIdIcon
  },
  inject: ["scrollToBottom"],
  data() {
    //这里存放数据
    return {
      imglsit: [],
      quote_originText: '',
      emojiFlag: false,
      itemData: this.item
    };
  },
  props: {
    item: { required: true },
    // emojiList: { required: true }
  },
  //监听属性 类似于data概念
  computed: {
    ...mapGetters(['videoDownloadPercent', 'fileBeCleared', 'videoNotInCurrentPC','chatList']),

  },
  //监控data中的数据变化
  watch: {
    item:{
      deep:true,
      immediate: true,
      handler(val){
        this.itemData = val;
        this._handleEmojiShow();
      }
    }
  },
  //方法集合
  methods: {
    async handleQuoteVideoShow(){
      this.itemData.quotemsgObj.showfile = true;
      await this.$nextTick()
      if(this.chatList?.[this.chatList?.length-1]?.msgId==this.itemData?.msgId){
        // 最后一条引用视频消息显示 视频滚动
        console.log('最后一条引用视频消息显示，滚动到底部')
        this?.scrollToBottom?.()
      }
    },
    async viewerShowChild(item) {
      console.log('viewerShowChild-- ',item)
      if (item.msgType == '10' && !this.itemData.quotemsgObj.showfile) {
        this.itemData.quotemsgObj.showfile = true;
        return;
      }
      if (item.msgType == '10' && this.videoDownloadPercent[item.msgId]<100) {
        return;
      }
      if (item.msgType != '10') {
        //TODO 组件通用化 禁止直接使用$parent
        this.$parent.viewerShow(item);
        return;
      }
      try {
        let flag = await checkVideoIsExists(item.msgBody.downloadPath);
        if (flag) {
          console.log('存在')
          //TODO 组件通用化 禁止直接使用$parent
          this.$parent.viewerShow(item);
        } else {
          console.log('不存在')
          this.$message.error(this.$t('chat_0124'));
          this.$store.commit('CLEAR_FILE_DOWNLOAD', {msId: item.msgId, beCleared: true});
        }
      } catch (e) {
        console.error('catch',e)
      }
    },
    lookQuoteCard(item) {
      this.$emit('lookQuoteCard', item);
    },
    findImage(image) {
      return fileOperational.getImage(image);
    },
    _handleEmojiShow(){
      if (this.item.msgType == 25) {
        console.log(this.item, '引用的item');
        if (this.item.quotemsgObj && this.item.quotemsgObj.text) {
          let patt = /\[([^\\[])+?\]/g;
          let originText;
          let arr;
          // let new_text = this.item.quotemsgObj.text;
          let new_text = this.item.quotemsgObj.msgBody.text;
          if (new_text) {
            originText = new_text;
            arr = originText.match(patt);
          }
          if (arr && originText) {
            if (arr.length > 0) {
              this.emojiFlag = true;
              for (let index = 0; index < arr.length; index++) {
                let item = arr[index];
                let ret = emojiList.find(x => x.tag == item);
                if (ret) {
                  let img = `<img src="/resources/emoji/${ret.file}" width=22px  class="quoteEmoji"/>`;
                  originText = originText.replace(item, img);
                }
              }
            }
            console.log(this.$refs.quoText);
          // this.$refs.quoText.innerHTML = originText;
          }
          //console.log(originText,'引用的originText')

        this.item.quotemsgObj.text = originText; // eslint-disable-line
        }
      }
    },
    goActivityPage(msgInfo){
      console.log(msgInfo)
      goOfficialPage();
      // msgInfo.msgBody?.url && eShell.openExternal(msgInfo.msgBody.url);
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this._handleEmojiShow();
  },
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {}, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类
.quoteEmoji {
  width: 15px !important;
}

.quotName {
  display: inline-block;
  max-width: 72px;
  overflow: hidden;
  white-space: pre;
  text-overflow: ellipsis;
  word-break: keep-all;
}

.quoteBubble {
  cursor: pointer;
  max-width: 350px;
  word-break: break-all;
  word-wrap: break-word;
}

.cardBubble {
  max-width: 210px !important;
}

.carte {
  display: block;
  background: #fff;
  border-radius: 5px;
  padding: 5px;

  .cardName {
    color: #333;
    display: inline-block;
    width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    .name {
      color: #333;
      max-width: 75%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  p {
    border-top: #eee solid 1px;
    margin-top: 5px;
    line-height: 20px;
    padding-top: 5px;
  }
  .topitem {
    padding-left: 20px;
  }
  .cardinfo {
    display: flex;
    width: 200px;

    img,
    span {
      vertical-align: top;
    }

    img {
      border: #ddd solid 1px;
      width: 40px;
      height: 40px;
      border-radius: 20px;
      display: inline-block;
    }

    span {
      // padding-left: 20px;
      line-height: 20px;
    }
  }
}
.video-wrap {
  display: inline-block;
  position: relative;
  .videoStart {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    -webkit-transform: translate(-50%, -50%);
    font-size: 40px;
    color: whitesmoke;
  }
  .progress-mask {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, .5);
  }
}

.show-video {
  max-height: 240px;
  &:focus{
    outline: none;
  }
}
.acitivity{
  max-width: 200px;
  padding: 7px 10px;
  background:#fff;
  border-radius: 10px;
  font-family: PingFangSC, PingFangSC-Regular;
  font-weight: 400;
  img{
    max-width: 100%;
    display: block;
  }
  .title{
    margin-top: 5px;
    font-size: 14px; 
    color: #333333;
    line-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .content{
    font-size: 12px;
    text-align: left;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #999999;
    line-height: 17px;
  }
  .bottom{
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-top: 5px;
    img{
      width: 16px;
    }
    p{
      margin-left: 5px;
      font-size: 11px;
      text-align: left;
      color: #999999;
      line-height: 16px;
    }
  }
}
  .quotext {
    white-space: pre-wrap;
  }
</style>
