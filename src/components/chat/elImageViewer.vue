<template>
  <transition name="viewer-fade">
    <div
      tabindex="-1"
      ref="el-image-viewer__wrapper"
      class="el-image-viewer__wrapper image-box"
      :style="{ 'z-index': zIndex }"
    >
      <template v-if="!errorImg">
        <div
          class="el-image-viewer__mask"
          :class="
            theme === 'system'
              ? 'el-image-mask-system'
              : theme === 'light'
              ? 'el-image-mask-light'
              : 'el-image-mask-drak'
          "
        ></div>
      </template>
      <template v-else>
        <div class="el-image-viewer__mask"></div>
      </template>
      <!-- CLOSE -->
      <!--      <span class="el-image-viewer__btn el-image-viewer__close" @click="hide">-->
      <!--        <i class="el-icon-circle-close"></i>-->
      <!--      </span>-->
      <!-- ARROW -->
      <template v-if="!isSingle">
        <div
          class="el-image-viewer__btn el-image-viewer-left"
          @click="prev"
          v-show="index !== 0"
        >
          <span class="el-image-viewer__btn el-image-viewer__prev left">
            <i class="el-icon-arrow-left" />
          </span>
        </div>
        <div
          class="el-image-viewer__btn el-image-viewer-left"
          v-show="index === 0"
        >
          <span
            class="
              el-image-viewer__btn el-image-viewer__prev
              disabled-arrow
              left
            "
            v-show="index === 0"
            :title="$t('Universal_0440')"
          >
            <i class="el-icon-arrow-left" />
          </span>
        </div>

        <div
          class="el-image-viewer__btn el-image-viewer-right"
          @click="next"
          v-show="index !== urlList.length - 1"
        >
          <span class="el-image-viewer__btn el-image-viewer__next right">
            <i class="el-icon-arrow-right" />
          </span>
        </div>
        <div
          class="el-image-viewer__btn el-image-viewer-right"
          v-show="index === urlList.length - 1"
        >
          <span
            class="
              el-image-viewer__btn el-image-viewer__next
              disabled-arrow
              right
            "
            v-show="index === urlList.length - 1"
            :title="$t('Universal_0441')"
          >
            <i class="el-icon-arrow-right" />
          </span>
        </div>
      </template>
      <!-- ACTIONS -->
      <div
        v-if="!errorImg"
        class="el-image-viewer__btn el-image-viewer__actions"
      >
        <div class="el-image-viewer__actions__inner">
          <i class="el-icon-zoom-out" @click="handleActions('zoomOut')"></i>
          <i class="el-icon-zoom-in" @click="handleActions('zoomIn')"></i>
          <i class="el-image-viewer__actions__divider"></i>
          <i :class="mode.icon" @click="toggleMode"></i>
          <i class="el-image-viewer__actions__divider"></i>
          <i
            class="el-icon-refresh-left"
            @click="handleActions('anticlocelise')"
          ></i>
          <i
            class="el-icon-refresh-right"
            @click="handleActions('clocelise')"
          ></i>
          <i
            class="el-icon-download"
            @click="saveImages(index)"
            style="cursor: pointer"
          ></i>
        </div>
      </div>
      <!-- CANVAS -->
      <div v-if="!errorImg" class="el-image-viewer__canvas image">
        <img
          v-for="(url, i) in urlList"
          v-if="i === index"
          ref="img"
          class="el-image-viewer__img"
          :key="url"
          :src="currentImg"
          :style="imgStyle"
          @load="handleImgLoad"
          @error="handleImgError"
          @mousedown="handleMouseDown"
        />
      </div>
      <div v-else class="image__error">
        <i class="el-icon-picture-outline i__error"></i>
        <span>
          {{ $t("Universal_0089") }}
        </span>
      </div>
    </div>
  </transition>
</template>

<script>
import { on, off } from "element-ui/src/utils/dom";
import { rafThrottle, isFirefox } from "element-ui/src/utils/util";
import fs from "fs";
import path from "path";
const dialog = window.vm.$remote.dialog;
import request from "request";
import bus from "@/utils/eventbus";
import { checkkArrProps } from "@/utils";
const Mode = {
  CONTAIN: {
    name: "contain",
    icon: "el-icon-full-screen",
  },
  ORIGINAL: {
    name: "original",
    icon: "el-icon-c-scale-to-original",
  },
};

const mousewheelEventName = isFirefox() ? "DOMMouseScroll" : "mousewheel";

export default {
  name: "elImageViewer",
  props: {
    urlList: {
      type: Array,
      default: () => [],
    },
    zIndex: {
      type: Number,
      default: 2000,
    },
    onSwitch: {
      type: Function,
      default: () => {},
    },
    onClose: {
      type: Function,
      default: () => {},
    },
    initialIndex: {
      type: Number,
      default: 0,
    },
    urlData: {
      type: Array,
      default: () => [],
    },
    agrs: {
      type: Object,
      default: () => {},
    },
    theme: {
      type: String,
      default: "system",
    },
  },

  data() {
    return {
      index: this.initialIndex,
      isShow: false,
      infinite: true,
      loading: false,
      // mode: Mode.CONTAIN,
      mode: {
        name: Mode.ORIGINAL.name,
        icon: Mode.ORIGINAL.icon,
      },
      transform: {
        scale: 1,
        deg: 0,
        offsetX: 0,
        offsetY: 0,
        enableTransition: false,
        clickNum: 0, // 点击次数  放大16 缩小16
        clickMax: 16,
        clickMin: -16,
      },
      contain: {}, // transform 对象
      width: 0,
      height: 0,
      errorImg: false, // 错误提示
    };
  },
  computed: {
    isSingle() {
      return this.urlList.length <= 1;
    },
    isFirst() {
      return this.index === 0;
    },
    isLast() {
      return this.index === this.urlList.length - 1;
    },
    currentImg() {
      return this.urlList[this.index];
    },
    imgStyle() {
      const { scale, deg, offsetX, offsetY, enableTransition } = this.transform;
      const style = {
        transform: `scale(${scale}) rotate(${deg}deg)`,
        transition: enableTransition ? "transform .3s" : "",
        "margin-left": `${offsetX}px`,
        "margin-top": `${offsetY}px`,
        width: `${this.width || this.agrs.imgList[this.index].msgBody.width}px`,
        height: `${
          this.height || this.agrs.imgList[this.index].msgBody.height
        }px`,
      };
      if (this.mode == Mode.CONTAIN) {
        style.maxWidth = style.maxHeight = "100%";
      }
      return style;
    },

    currentItem() {
      return this.urlData[this.index];
    },
  },
  watch: {
    initialIndex(val) {
      this.index = val;
    },
    index: {
      handler: function (val) {
        // 这里需要把 transform 重置
        this.contain = this.transform;
        this.onSwitch(val);
        this.reset();
        console.log("imageTap ===== 222222", this.theme);
        bus.$emit("imageTap", val);
      },
    },
    currentImg() {
      console.log('urlList===', this.urlList)
      console.log("index ====>", this.index);
      console.log("currentImg ====>", this.currentImg);
      this.reset();
      // this.contain = this.transform
      this.$nextTick(() => {
        const $img = this.$refs.img[0];
        if (!$img) {
          this.index = 0;
        }
      });
    },
  },
  methods: {
    changeImg(index) {
      this.currentImg = this.urlList[index];
    },
    saveImages(id) {
      console.log(id, this.urlList[id]);

      let msgBody = this.urlData[id].msgBody;
      // let urlAdr = this.urlList[id];
      let urlAdr = msgBody["mediaId"] || this.urlList[id];
      let reg = /(http|https):\/\/([\w.]+\/?)\S*/;
      if (urlAdr.match(reg)) {
        console.log("网络地址");
        this.downloadImageAs(msgBody);
      } else {
        console.log("本地地址");
        this.saveImageAs(msgBody);
      }
    },
    saveImageAs(fileItem) {
      if (!fileItem.localId) return;
      let filePath = fileItem.localId.replace("\\", "/");
      filePath = path.join("", filePath);
      filePath = filePath.substring(6);
      fileItem.filePath = filePath;
      // fileItem.fname = `${fileItem.fileNo}${filePath.substr(
      //   filePath.length - 4
      // )}`;
      // fileItem.fname = `${this.timestamp()}${filePath.format}`;
      fileItem.fname = `${this.timestamp()}${filePath.substr(
        filePath.length - 4
      )}`;
      try {
        const stats = fs.statSync(filePath);
        console.log("stats", stats, stats.size);
        if (stats.size === 0) {
          // this.$message.error("文件不存在");
          return false;
        } else {
          const { ipcRenderer } = require("electron");
          this.ipcRenderer = ipcRenderer;
          this.ipcRenderer.send("saveAsImages", fileItem);
        }
      } catch (err) {
        console.error("err", err);
      }
    },
    downloadImageAs(fileItem) {
      let filePath = fileItem.mediaId;
      let suffix = filePath.split(".").reverse()[0]; //文件后缀
      // let fname=`${this.timestamp()}${filePath.substr(filePath.length - 4)}`;
      let fname = this.timestamp();
      try {
        dialog
          .showSaveDialog({
            title: this.$t("Universal_0077"),
            buttonLabel: this.$t("Universal_0052"),
            defaultPath: fname,
          })
          .then((result) => {
            const req = request({
              method: "GET",
              uri: filePath,
              strictSSL: false,
            });
            if (!result.filePath) {
              return;
            }
            // console.log(suffix,result,result.filePath,`${result.filePath}.${suffix}`);
            // let writeStream = fs.createWriteStream(result.filePath);
            let writeStream = fs.createWriteStream(
              `${result.filePath}.${suffix}`
            );
            req.pipe(writeStream);
            req.on("end", function (response) {
              //文件写入成功
              console.log("response", response);
            });
            writeStream.on("finish", function () {
              writeStream.end();
            });
          });
      } catch (err) {
        console.error("err", err);
      }
    },
    timestamp() {
      // 时间戳：年月日时分秒毫秒（202012161508230098）
      let date, currentTime;
      date = new Date();
      this.year = date.getFullYear();
      this.month = date.getMonth() + 1;
      this.date = date.getDate();
      this.hour =
        date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
      this.minute =
        date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
      this.second =
        date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
      this.milliSeconds = date.getMilliseconds();
      currentTime = `${this.year}${this.month}${this.date}${this.hour}${this.minute}${this.second}${this.milliSeconds}`;
      return currentTime;
    },
    hide() {
      this.deviceSupportUninstall();
      this.onClose();
    },
    deviceSupportInstall() {
      this._keyDownHandler = rafThrottle((e) => {
        const keyCode = e.keyCode;
        switch (keyCode) {
        // ESC
        case 27:
          this.hide();
          break;
          // SPACE
        case 32:
          this.toggleMode();
          break;
          // LEFT_ARROW
        case 37:
          this.prev();
          break;
          // UP_ARROW
        case 38:
          console.log("缩小 ====>");
          this.handleActions("zoomIn");
          break;
          // RIGHT_ARROW
        case 39:
          this.next();
          break;
          // DOWN_ARROW
        case 40:
          console.log("放大 ====>");
          this.handleActions("zoomOut");
          break;
        }
      });
      this._mouseWheelHandler = rafThrottle((e) => {
        const delta = e.wheelDelta ? e.wheelDelta : -e.detail;
        console.log("鼠标滚轮 放大 或 缩小");
        if (delta > 0) {
          this.handleMouseWheelHandler("zoomIn", {
            zoomRate: 0.9,
            enableTransition: false,
          });
          // this.handleActions('zoomIn', {
          //   zoomRate: 0.9,
          //   enableTransition: false
          // });
        } else {
          this.handleMouseWheelHandler("zoomOut", {
            zoomRate: 0.9,
            enableTransition: false,
          });
          // this.handleActions('zoomOut', {
          //   zoomRate: 0.9,
          //   enableTransition: false
          // });
        }
      });
      on(document, "keydown", this._keyDownHandler);
      on(document, mousewheelEventName, this._mouseWheelHandler);
    },
    deviceSupportUninstall() {
      off(document, "keydown", this._keyDownHandler);
      off(document, mousewheelEventName, this._mouseWheelHandler);
      this._keyDownHandler = null;
      this._mouseWheelHandler = null;
    },
    handleImgLoad() {
      console.log('图片加载成功了')
      this.loading = false;
      this.errorImg = false;
    },
    handleImgError(e) {
      console.log('图片加载失败了-----------')
      this.loading = false;
      e.target.alt = this.$t("Universal_0089");
      this.errorImg = true;
    },
    handleMouseDown(e) {
      if (this.loading || e.button !== 0) return;

      const { offsetX, offsetY } = this.transform;
      const startX = e.pageX;
      const startY = e.pageY;
      this._dragHandler = rafThrottle((ev) => {
        this.transform.offsetX = offsetX + ev.pageX - startX;
        this.transform.offsetY = offsetY + ev.pageY - startY;
      });
      on(document, "mousemove", this._dragHandler);
      on(document, "mouseup", () => {
        off(document, "mousemove", this._dragHandler);
      });

      e.preventDefault();
    },

    reset() {
      this.transform = {
        scale: 1,
        deg: 0,
        offsetX: 0,
        offsetY: 0,
        enableTransition: false,
        clickNum: 0, // 点击次数  放大16 缩小16
        clickMax: 16,
        clickMin: -16,
      };
      this.width = 0;
      this.height = 0;
      this.mode = {
        name: Mode.ORIGINAL.name,
        icon: Mode.ORIGINAL.icon,
      };
      // 要将设置图片加载失败变量重置，不然一直无法显示下一张正常图片
      this.errorImg = false
      // this.contain = this.transform
      // console.log('contain ===>', this.contain);
    },
    toggleMode() {
      if (this.loading) return;

      // const modeNames = Object.keys(Mode);
      // const modeValues = Object.values(Mode);
      // const index = modeValues.indexOf(this.mode);
      // const nextIndex = (index + 1) % modeNames.length;
      // this.mode = Mode[modeNames[nextIndex]];
      // if (this.transform.scale !== 1 || (this.mode.name !== 'contain' && isNaN(this.contain.scale))) {
      //   this.reset();
      //   this.mode = {
      //     name: Mode.ORIGINAL.name,
      //     icon: Mode.ORIGINAL.icon
      //   }
      // }else {
      //   this.transform = this.contain
      //   this.mode = {
      //     name: Mode.CONTAIN.name,
      //     icon: Mode.CONTAIN.icon
      //   }
      // }
      if (this.mode.name === "original") {
        this.width = this.agrs.imgList[this.index].msgBody.orgWidth;
        this.height = this.agrs.imgList[this.index].msgBody.orgHeight;
        this.mode = {
          name: Mode.CONTAIN.name,
          icon: Mode.CONTAIN.icon,
        };
        this.transform.scale = 1;
      } else {
        this.width = this.agrs.imgList[this.index].msgBody.width;
        this.height = this.agrs.imgList[this.index].msgBody.height;
        this.mode = {
          name: Mode.ORIGINAL.name,
          icon: Mode.ORIGINAL.icon,
        };
      }

      console.log("this.transform ===> ", this.transform);

      console.log("width 11111 ====> height 11111 ", this.width, this.height);
    },
    prev() {
      if (this.isFirst && !this.infinite) return;
      const len = this.urlList.length;
      this.index = (this.index - 1 + len) % len;
      const browserWindow = window.vm.$remote.getCurrentWindow();
      // 图片大小需要跟查看器大小比较  由大变小 图片查看器不变 由小变大 图片查看器变大
      if (
        this.agrs.imgList[this.index].msgBody.width >
          browserWindow.getSize()[0] - 20 ||
        this.agrs.imgList[this.index].msgBody.height >
          browserWindow.getSize()[1] - 86
      ) {
        this.changeImageWindow();
      }
    },
    next() {
      if (this.isLast && !this.infinite) return;
      const len = this.urlList.length;
      this.index = (this.index + 1) % len;

      // 图片大小需要跟查看器大小比较  由大变小 图片查看器不变 由小变大 图片查看器变大
      // 获取当前窗口大小
      const browserWindow = window.vm.$remote.getCurrentWindow();
      console.log(
        "this.agrs.imgList[this.index].width ===>",
        this.agrs.imgList[this.index].msgBody.width
      );
      console.log(
        "this.agrs.imgList[this.index].height ===>",
        this.agrs.imgList[this.index].msgBody.height
      );
      console.log("image window ==>", browserWindow.getSize());
      if (
        this.agrs.imgList[this.index].msgBody.width >
          browserWindow.getSize()[0] - 20 ||
        this.agrs.imgList[this.index].msgBody.height >
          browserWindow.getSize()[1] - 86
      ) {
        this.changeImageWindow();
      }
    },

    // change image window
    changeImageWindow() {
      const { ipcRenderer } = require("electron");
      console.log("next ====>", this.agrs);
      const msgType = this.agrs.msgType;
      const imgList = this.agrs.imgList;
      const index = this.index;
      const flag = checkkArrProps(imgList, "msgBody");
      console.log("flag ====> imgList 存在undefind ", flag);
      if (flag) {
        ipcRenderer.send("media-viewer-change", { msgType, imgList, index });
      }
    },

    // 鼠标滚轮事件放大 缩小
    handleMouseWheelHandler(action, options = {}) {
      if (this.loading) return;
      const { zoomRate } = {
        zoomRate: 0.83, // 比例 0.83
        rotateDeg: 90,
        enableTransition: true,
        ...options,
      };
      const { transform } = this;
      switch (action) {
      case "zoomOut":
        transform.scale = parseFloat((transform.scale * zoomRate).toFixed(6));
        if (transform.scale <= 0.051) {
          transform.scale = 0.051;
          console.log("zoomIn Min scale 1111111====>", transform.scale);
          return;
        }
        break;
      case "zoomIn":
        // transform.scale = parseFloat((transform.scale + zoomRate).toFixed(3));
        transform.scale = parseFloat((transform.scale / zoomRate).toFixed(6));
        if (transform.scale >= 19.718) {
          transform.scale = 19.718;
          console.log("zoomIn Max scale 22222====>", transform.scale);
          return;
        }
        break;
      }
      if (this.transform.scale !== 1) {
        this.mode = {
          name: Mode.ORIGINAL.name,
          icon: Mode.ORIGINAL.icon,
        };
      } else {
        this.mode = {
          name: Mode.CONTAIN.name,
          icon: Mode.CONTAIN.icon,
        };
      }
      this.contain = transform;
    },

    handleActions(action, options = {}) {
      console.log("action ====>", action);
      //
      if (this.loading) return;
      const { zoomRate, rotateDeg, enableTransition } = {
        zoomRate: 0.83, // 比例 0.83
        rotateDeg: 90,
        enableTransition: true,
        ...options,
      };
      const { transform } = this;
      // this.contain = transform
      switch (action) {
      case "zoomOut":
        if (transform.scale <= 0.051) {
          transform.clickNum = transform.clickMin;
          transform.scale = 0.051;
          console.log("zoomIn Min ====>", transform.clickNum);
          return;
        } else {
          transform.clickNum--;
        }
        // if (transform.scale > 0.2) {
        //   transform.scale = parseFloat((transform.scale - zoomRate).toFixed(3));
        // }
        transform.scale = parseFloat((transform.scale * zoomRate).toFixed(3));
        console.log("zoomIn Min scale ====>", transform.scale);
        break;
      case "zoomIn":
        if (transform.scale >= 19.718) {
          transform.clickNum = transform.clickMax;
          transform.scale = 19.718;
          console.log("zoomIn Max ====>", transform.clickNum);
          return;
        } else {
          transform.clickNum++;
        }
        // transform.scale = parseFloat((transform.scale + zoomRate).toFixed(3));
        transform.scale = parseFloat((transform.scale / zoomRate).toFixed(3));
        console.log("zoomIn Max scale ====>", transform.scale);
        break;
      case "clocelise":
        console.log(
          "this.agrs.imgList[this.index].width ===>",
          this.agrs.imgList[this.index].msgBody.width
        );
        this.anticlocelise(transform);
        transform.deg += rotateDeg;
        break;
      case "anticlocelise":
        this.anticlocelise(transform);
        transform.deg -= rotateDeg;
        break;
      }
      if (this.transform.scale !== 1) {
        this.mode = {
          name: Mode.ORIGINAL.name,
          icon: Mode.ORIGINAL.icon,
        };
      } else {
        this.mode = {
          name: Mode.CONTAIN.name,
          icon: Mode.CONTAIN.icon,
        };
      }
      this.contain = transform;
      transform.enableTransition = enableTransition;
    },
    anticlocelise(transform) {
      // eslint-disable-next-line no-case-declarations
      const browserWindow = window.vm.$remote.getCurrentWindow();
      if (transform.deg % 180 === 0) {
        if (
          this.agrs.imgList[this.index].msgBody.width >
          browserWindow.getSize()[1]
        ) {
          transform.scale = 0.65;
          console.log("1111111");
        } else if (
          this.agrs.imgList[this.index].msgBody.height >
          browserWindow.getSize()[0]
        ) {
          transform.scale = 0.65;
          console.log("3333333");
        }
      } else if (transform.deg % 180 === 90 || transform.deg % 180 === -90) {
        if (
          this.agrs.imgList[this.index].msgBody.width <=
          browserWindow.getSize()[0]
        ) {
          transform.scale = 1;
          console.log("222222222");
        } else if (
          this.agrs.imgList[this.index].msgBody.height <=
          browserWindow.getSize()[1]
        ) {
          transform.scale = 1;
          console.log("444444");
        }
      }
    },
  },
  mounted() {
    this.deviceSupportInstall();
    // add tabindex then wrapper can be focusable via Javascript
    // focus wrapper so arrow key can't cause inner scroll behavior underneath
    this.$refs["el-image-viewer__wrapper"].focus();
  }
};
</script>

<style scoped lang="less">
.image {
  padding: 0px !important;
  padding-left: 10px !important;
  padding-right: 10px !important;
  width: auto;
  height: 100% !important;
}

.image-box {
  -webkit-app-region: drag;
}

.el-image-viewer-left {
  border-radius: 0px;
  height: 100%;
  width: 70px;
  &:hover .left {
    display: flex; // 设置父元素hover时子元素的样式 【实现要点！！！！！】
  }
}

.el-image-viewer-right {
  border-radius: 0px;
  height: 100%;
  width: 70px;
  right: 0px;
  &:hover .right {
    display: flex; // 设置父元素hover时子元素的样式 【实现要点！！！！！】
  }
}

.el-image-viewer__prev {
  left: 10px;
}

.el-image-viewer__next {
  right: 10px;
}

.left {
  border-radius: 50%;
  display: none;
}

// .el-icon-arrow-left {
//   display: none;
// }

.right {
  border-radius: 50%;
  display: none;
}

.el-image-viewer__canvas {
  /* padding: 20px; */
  /* padding-left: 18px;
  width: 93%;
  height: 93%; */
}
.el-image-viewer__wrapper:focus {
  outline: none;
}
.disabled-arrow {
  opacity: 0.3;
}
.el-image-viewer_top {
  top: 0px !important;
}
.el-image-viewer__canvas img {
  -webkit-user-drag: no-drag;
}

.el-image-mask-drak {
  background-color: #3a373a !important;
  opacity: 1;
}

.el-image-mask-light {
  background-color: #faeff2 !important;
  opacity: 1;
}

.el-image-mask-system {
  background-color: #f5f5f5 !important;
  opacity: 1;
}

.image__error {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #cdcfd1;
  flex-direction: column;
}

.i__error {
  font-size: 50px;
}
</style>
