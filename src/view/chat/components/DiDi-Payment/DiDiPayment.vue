<template>
  <div class="payment" ref="scrollElement">
    <div
      class="loadmore"
      v-if="hasMoreS"
      style="cursor: pointer"
      v-loading="listLoading"
      element-loading-spinner="el-icon-loading"
      @click="loadmorelist"
    >
      {{ $t('Universal_0361') }}
    </div>
    <!-- 支付助手上去掉 -->
    <!-- <div
      class="loadmore nomore"
      v-if="!hasMoreS && noMoreShowFlg"
      element-loading-spinner="el-icon-loading"
    >
      没有更多消息
    </div> -->
    <div class="box" v-for="(obj, i) in paymentList" :key="i" 
     @contextmenu.prevent="_rightClick($event, obj, i)"
     v-show="obj.msgType">
      <p class="center" style="margin-bottom: 10px">
        {{ formatTime(obj['msgBody'] || {}, i > 0 ? paymentList[i - 1]['msgBody'] || {} : {}) }}
      </p>
      <ul>
        <li class="tilte" style="margin-bottom: 5px">
          {{ formatTip(obj, true) }}
        </li>
        <li class="des center">{{ formatTip(obj, false) }} ({{ obj['msgBody']['sbl'] }})</li>
        <li class="num center">{{ obj['msgBody']['amt'] }}</li>
        <li class="des flex">
          <span>{{ $t('Universal_0186') }}</span>
          <span>{{ formatRemarkValue(obj) }}</span>
        </li>
        <li class="des flex">
          <span>{{ $t('Universal_0001') }}</span>
          <span>{{ formatMsgTime(obj['msgBody'] || {}) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import moment from 'moment';
import { isEqual } from 'lodash';
import SQLUtils from '@/components/db/sqlite.js';
import { remote } from 'electron';
import Message from '@/services/message';
import { paymentId } from "@/utils/const"
export default {
  name: 'PaymentDetail',
  props: {},
  data() {
    return {
      tableName: `m_${paymentId}`,
      showLength: 30, //30条/页
      paymentList: [],
      topMsgOrder: '', //记录当前位置
      hasMoreS: false,
      listLoading: false, //加载中
      noMoreShowFlg: false //只在加载更多后显示
    };
  },
  computed: {
    ...mapGetters(['gettersCurrentPayment']),
    // chatList(){
    //   return this.$store.state.chat?.chatList;
    // },
    // currentChat: {
    //   get() {
    //     return this.$store.state.chat?.currentChat;
    //   },
    // },
    formatMsgTime() {
      return function({ ct }) {
        return ct ? moment(ct).format('YYYY-MM-DD HH:mm:ss') : '-';
      };
    },
    formatTime() {
      // 消息有效期为1年
      return function({ ct }, msgBody = {}) {
        if (!ct) return '';
        let today = moment().format('YYYY-MM-DD'),
          yes = moment()
            .subtract(1, 'days')
            .format('YYYY-MM-DD'),
          payTime = moment(ct).format('YYYY-MM-DD');
        // 5分钟内的消息，只需要显示1次时间
        if (msgBody['ct'] && moment(ct).format('X') - moment(msgBody['ct']).format('X') < 5 * 60) {
          return '';
        } else {
          if (today == payTime) {
            return moment(ct).format('HH:mm');
          } else if (yes == payTime) {
            return `${this.$t('Universal_0022')} ${moment(ct).format('HH:mm')}`;
          } else {
            return moment(ct).format('MM-DD HH:mm');
          }
        }
      };
    },
    formatTip() {
      return function({ fromType }, isTitle) {
        switch (fromType * 1) {
        case 224: //群和单聊红包退款到账,
        case 1001: //退款到账通知(平仓)
          return isTitle ? this.$t('wallet_notice_0002') : this.$t('wallet_notice_0024');
        case 225: //付款(内部转账),
        case 226: //付款(内部转账),
          return isTitle ? this.$t('wallet_notice_0017') : this.$t('Universal_0420');
        case 227: //外部钱包充值到账
        case 228: //场外交易到账,
        case 1003: //收款到账通知-理财收益到账
          return isTitle ? this.$t('wallet_notice_0006') : this.$t('wallet_list_0009');
        case 1002: //还款凭证-抵押借币还款
          return isTitle ? this.$t('wallet_notice_0011') : this.$t('wallet_notice_0025');
        case 1004: //资金借出通知-理财借出
          return this.$t('wallet_notice_0014');
        default:
          return isTitle ? this.$t('chat_0018') : '';
        }
      };
    },
    queryInfo() {
      return this.$route.query;
    },
    // 备注
    formatRemarkValue() {
      return function(item = {}) {
        let { rv } = item['msgBody'] || {},
          fromType = item['fromType'];
        switch (fromType * 1) {
        case 224:
          return this.$t('wallet_notice_0004');
        case 225:
          return this.$t('wallet_notice_0019', {value: rv});
        case 226:
          return this.$t('wallet_notice_0018', {value: rv});
        case 227:
          return this.$t('wallet_notice_0008');
        case 228:
          return this.$t('wallet_notice_0026');
        case 1001:
          // 产品确认 只展示变量
          return `${rv}`;
        case 1002:
          return `${rv}`;
          // return this.$t('wallet_notice_0013');
        case 1003:
          return `${rv}`;
          // return this.$t('wallet_notice_0010');
        case 1004:
          return `${rv}`;
          // return this.$t('wallet_notice_0016');
        default:
          return '-';
        }
      };
    },
    scrollElement() {
      return this.$refs['scrollElement'];
    }
  },
  created(){
    let current = {
      id: this.$paymentId,
      sessionName: this.queryInfo?.item?.sessionName,
      sessionIcon: this.queryInfo?.item?.sessionIcon,
      targetType: 1, //单聊
      uniqueCode: this.queryInfo?.item?.uniqueCode
    };

    this.$store.commit('SET_CURRENT_CHAT', current);
  },
  mounted() {
    // console.log(this.queryInfo);
    this.getFirstPage();
  },
  watch: {
    gettersCurrentPayment: {
      deep: true,
      handler: async function(curPayment, oldCurPayment) {
        if (curPayment && !isEqual(curPayment, oldCurPayment)) {
          this.getFirstPage(curPayment);
        }
        // console.log(curPayment, oldCurPayment, this.paymentList);
      }
    }
  },
  methods: {
    ...mapActions(['actionCurrentPayment']),
    scrollIntoView(scrollHeight) {
      if (this.scrollElement) {
        this.scrollElement.scrollTop = scrollHeight;
      }
    },
    async setCurrentPaymentListData(list) {
      this.hasMoreS = true;
      let beforeHeight = this.scrollElement?.scrollHeight || 0;
      if (list.length < this.showLength) {
        this.hasMoreS = false;
        this.noMoreShowFlg = true;
      }
      this.paymentList.unshift(...list);
      this.listLoading = false;
      if (list.length == this.showLength) {
        this.setMoreStatus();
      }
      await this.$nextTick();
      // console.log(beforeHeight, this.scrollElement.scrollHeight);
      this.scrollIntoView(this.scrollElement?.scrollHeight || 0 - beforeHeight);
    },
    // 之前单聊的方法
    async loadmorelist() {
      this.noMoreShowFlg = false;
      try {
        this.listLoading = true;
        if (this.paymentList.length > 0) {
          this.topMsgOrder = this.paymentList[0].msgOrder;
        }
        let whereClause = `msg_order < ${this.topMsgOrder}`;
        let list = await SQLUtils.selectSingleChatList(this.queryInfo['fromId'], whereClause);
        this.setCurrentPaymentListData(list);
      } catch (err) {
        console.error(err, 'loadmorelist');
      }
      this.listLoading = false;
    },
    async getFirstPage(curPayment) {
      // 不查库
      if (curPayment) {
        this.paymentList.push(curPayment);
        await this.$nextTick();
        this.scrollIntoView(this.scrollElement?.scrollHeight || 0);
      } else {
        this.listLoading = true;
        const list = await SQLUtils.selectSingleChatList(this.queryInfo['fromId'], this.topMsgOrder);
        if (list.length > 0) {
          this.topMsgOrder = list[0].msgOrder;
        }
        this.setCurrentPaymentListData(list);
      }
    },
    //单独显示 再查询下一页数据 控制noMoreShowFlg 显示
    async setMoreStatus() {
      if (this.paymentList.length > 0) {
        let t = this.paymentList[0].msgOrder;
        let arr = await SQLUtils.selectSingleChatList(this.queryInfo['fromId'], `msg_order < ${t}`);
        if (arr.length == 0) {
          this.hasMoreS = false;
          this.noMoreShowFlg = true;
        }
      }
    },
    async delMsg(item, index) {
      const message = new Message(item.fromId);
      await message.deleteMessageByMsgId(item.msgId);
      this.paymentList.splice(index, 1);
      this.$store.dispatch('GET_LAST_MSG_LIST');
    },
    _rightClick(e, item, index) {
      let that = this;
      if (e) {
        e.preventDefault();
      }
      let rightClickOptions = [
        {
          name: this.$t('chat_0032'),
          enabled: true,
          fun: () => {
            that.delMsg(item, index);
          }
        }
      ];
      return that.$RightClick(rightClickOptions).popup({
        window: remote.getCurrentWindow()
      });
    }
  },
  beforeDestroy() {
    sessionStorage.removeItem('paymentId');
  }
};
</script>
<style lang="less" scoped>
.payment {
  overflow: auto;
  height: calc(100vh - 60px);
  padding: 0 20px;
  .loadmore {
    font-size: 12px;
    text-align: center;
    color: #2f54eb;
  }

  .nomore {
    color: #666;
  }
  .box {
    min-width: 300px;
    width: 100%;
    margin: 20px auto;
    // height: 125px;
    color: #333333;
    .center {
      text-align: center;
    }
    > p {
      color: #999999;
      font-size: 12px;
      line-height: 18px;
    }
    ul {
      padding: 15px 15px 10px 15px;
      background: #ffffff;
      color: #999999;
      border-radius: 8px;
      list-style: none;
      font-size: 12px;
      overflow: hidden;
      // > * {
      //   overflow: hidden;
      //   text-overflow: ellipsis;
      //   white-space: nowrap;
      // }
      .tilte {
        height: 20px;
        line-height: 20px;
        font-size: 14px;
        color: #333;
        font-weight: 400;
      }
      .num {
        font-size: 24px;
        margin-bottom: 10px;
        height: 21px;
        font-weight: 700;
        line-height: 21px;
        font-weight: 700;
        color: #333333;
      }
      .des {
        line-height: 18px;
        font-size: 12px;
        margin-bottom: 5px;
        > span {
          &:first-child {
            word-break: keep-all;
          }
          &:last-child {
            color: #333;
            word-break: break-all;
            margin-left: 5px;
          }
        }
      }
    }
  }
}
</style>
