<script>
import { mapGetters } from "vuex";
// const group_avatar = require("@/view/chat/images/group_avtar.png");
// const user_avatar = require("@/view/chat/images/default.png");
const group_avatar = require("@/assets/images/group_avtar.png");
const user_avatar = require("@/assets/images/default.png");
export default {
  name: "SessionIconErr",
  props: {
    sessionIconSrc: String,
    sessionId: {
      type: String,
      required: true,
      default: group_avatar,
    },
  },

  data() {
    return {
      isImageExist: true, //默认当作有效图片路径去处理
    };
  },
  watch: {
    sessionId(n, o) {
      if (n !== o) {
        this.isImageExist = true;
      }
    },
  },
  computed: {
    ...mapGetters(["lastMsgList"]),
  },
  methods: {
    handleImgLoadError() {
      this.isImageExist = false;
    },
    replaceImg() {
      const { groupType = "" } =
        this.lastMsgList.find((i) => i.id === this.sessionId) || {};
      return groupType ? group_avatar : user_avatar;
    },
  },
  render() {
    const { sessionId, sessionIconSrc, isImageExist, handleImgLoadError } =
      this;
    if (isImageExist && sessionIconSrc) {
      return (
        <img
          src={sessionIconSrc}
          onError={handleImgLoadError}
          data-key={sessionId}
        />
      );
    }
    return <img src={this.replaceImg()} data-key={sessionId} />;
  },
};
</script>
