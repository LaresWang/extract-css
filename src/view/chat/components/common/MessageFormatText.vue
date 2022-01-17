<template>
  <span
    id="text"
    ref="text"
    v-html="replaceEmoji(text)"
    v-if="!draftFlag"
    :class="wordBreakClass"
    @dblclick.stop.prevent="rangesSelect"
    :style="isCanSelect?{'-webkit-user-select':'text',display: 'inline-block'}:{'-webkit-user-select':'none'}"
  >
  </span>
  <span ref="text" :style="isCanSelect?{'-webkit-user-select':'text',display: 'inline-block'}:{'-webkit-user-select':'none'}" v-else v-html="replaceEmoji(text)"></span>
</template>
<script>
import emojiList from "@/utils/emoji.js";
import { html2Escape } from "@/utils/domainSuffix.js";
import { mapGetters } from "vuex"
export default {
  name: "message-text-format",
  data() {
    return {
      emojiList: emojiList,
      patt: /\[([^\\[])+?\]/g,
      isDecryptText: "1",
    };
  },
  props: {
    draftFlag: {
      require: true,
      default: false,
    },
    text: { require: true },
    isDecrypt: { require: false, default: "" },
    item: {
      require: false,
      default() {
        return {};
      },
    },
    linkFlag: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    ...mapGetters(['gettersCurrentMsgId']),
    wordBreakClass() {
      let reg = /[a-z]/gi;
      return reg.test(this.text) ? "break-word" : "break-all";
    },
    isCanSelect(){
      return this.item?.msgId==this.gettersCurrentMsgId
    }
  },
  mounted() {
    this.replaceEmoji(this.text);
  },
  methods: {
    rangesSelect(){
      setTimeout(()=>{
        let selection = window.getSelection();
        selection.removeAllRanges();
        let range = document.createRange();
        range.selectNode(this.$refs.text)
        selection.addRange(range)
        // let c=document.execCommand('copy')
        // console.log(window.getSelection().toString(),c)
      },100)
    },
    replaceEmoji(newVal) {
      if(!newVal){
        return ;
      }

      let originText;
      let arr;
      newVal = html2Escape(newVal, this.draftFlag);
      /*eslint max-len: ["error", { "code": 260 }]*/
      let urlReg = /((((https?|http?):(\/\/)?(?:[-;:&=+$]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?(?:[-?+=&;:%!/@.\w_]*)#?(?:[-+=&;%!?/@.\w_]*))?)|(((https?|http?):(\/\/))?([\da-z.-]+)\.(?:[\da-z.]{2,6})(?:\/\w\.-]*)*\/?))/gi;

      if (newVal) {
        originText = newVal;
        if (!this.linkFlag) {
          originText = originText.replace(urlReg, (r) => {
            // let s = !r.startsWith("http") ? "http://" + r : r;
            // return `<a href="${s}">${r}</a>`;
            if (!r.startsWith("http")) {
              return r;
            } else {
              let httpn = r.indexOf("//");
              if (httpn == -1) {
                return r;
              } else {
                return `<a href="${r}">${r}</a>`;
              }
            }
          });
        }
        arr = originText.match(this.patt);
      }

      if (arr && arr.length && originText) {
        const arrSet = new Set([...arr]);
        const arrL = Array.from(arrSet);
        arrL.forEach((item) => {
          let ret = this.emojiList.find((x) => x.tag == item);
          if (ret && ret.tag) {
            let img = `<img src="/resources/emoji/${ret.file}" width=22px style="vertical-align: middle;" alt="${ret.tag}"/>`;
            let ite = item.slice(0, -1);
            let str = `\\${ite}\\]`;
            originText = originText.replace(new RegExp(str, "g"), img);
          }
          let reg = /(\[图片]|\[Picture])/g;
          originText = originText.replace(reg, this.$t('chat_0013'));
        });
      }
      return originText;
    },
  },
};
</script>
<style lang="less" scoped>
#text {
  word-wrap: break-word; // 只对英文起作用，以单词作为换行依据。
  white-space: pre-wrap; // 只对中文起作用，强制换行。
  /deep/ a {
    color: #447df0;
    word-break: break-all;
    &:hover {
      color: #2F54EB;
      text-decoration: none;
    }
  }
  /deep/ img {
    margin: -5px 2px 0 2px;
  }
  &.break-word {
    // word-break: break-word;
  }
  &.break-all {
    word-break: break-all;
  }
}
</style>
