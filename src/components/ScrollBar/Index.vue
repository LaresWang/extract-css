
<script>
import {
  addResizeListener,
  removeResizeListener,
} from "element-ui/src/utils/resize-event";
import scrollbarWidth from "element-ui/src/utils/scrollbar-width";
import { toObject } from "element-ui/src/utils/util";
import { on, off } from "element-ui/src/utils/dom";
import {
  renderThumbStyle,
  BAR_MAP,
} from "element-ui/packages/scrollbar/src/util";
const Bar = {
  name: "Bar",
  props: {
    vertical: Boolean,
    size: String,
    move: Number,
  },
  computed: {
    bar() {
      return BAR_MAP[this.vertical ? "vertical" : "horizontal"];
    },
    wrap() {
      return this.$parent.wrap;
    },
  },
  render() {
    const { size, move, bar } = this;
    return (
      <div
        class={["el-scrollbar__bar", "is-" + bar.key]}
        onMousedown={this.clickTrackHandler}
      >
        <div
          ref="thumb"
          class="el-scrollbar__thumb"
          onMousedown={this.clickThumbHandler}
          style={renderThumbStyle({ size, move, bar })}
        ></div>
      </div>
    );
  },

  methods: {
    clickThumbHandler(e) {
      // prevent click event of right button
      if (e.ctrlKey || e.button === 2) {
        return;
      }
      this.startDrag(e);
      this[this.bar.axis] =
        e.currentTarget[this.bar.offset] -
        (e[this.bar.client] -
          e.currentTarget.getBoundingClientRect()[this.bar.direction]);
    },
    clickTrackHandler(e) {
      const offset = Math.abs(
        e.target.getBoundingClientRect()[this.bar.direction] -
          e[this.bar.client]
      );
      const thumbHalf = this.$refs.thumb[this.bar.offset] / 2;
      const thumbPositionPercentage =
        ((offset - thumbHalf) * 100) / this.$el[this.bar.offset];

      this.wrap[this.bar.scroll] =
        (thumbPositionPercentage * this.wrap[this.bar.scrollSize]) / 100;
    },
    startDrag(e) {
      e.stopImmediatePropagation();
      this.cursorDown = true;

      on(document, "mousemove", this.mouseMoveDocumentHandler);
      on(document, "mouseup", this.mouseUpDocumentHandler);
      document.onselectstart = () => false;
    },
    mouseMoveDocumentHandler(e) {
      if (this.cursorDown === false) return;
      const prevPage = this[this.bar.axis];

      if (!prevPage) return;

      const offset =
        (this.$el.getBoundingClientRect()[this.bar.direction] -
          e[this.bar.client]) *
        -1;
      const thumbClickPosition = this.$refs.thumb[this.bar.offset] - prevPage;
      const thumbPositionPercentage =
        ((offset - thumbClickPosition) * 100) / this.$el[this.bar.offset];

      this.wrap[this.bar.scroll] =
        (thumbPositionPercentage * this.wrap[this.bar.scrollSize]) / 100;
    },
    // eslint-disable-next-line
    mouseUpDocumentHandler(e) {
      this.cursorDown = false;
      this[this.bar.axis] = 0;
      off(document, "mousemove", this.mouseMoveDocumentHandler);
      document.onselectstart = null;
    },
  },

  destroyed() {
    off(document, "mouseup", this.mouseUpDocumentHandler);
  },
};
export default {
  name: "VCFixedHeightScrollBar",
  components: { Bar },
  props: {
    availableScrollHeight: Number,
    native: Boolean,
    wrapStyle: {},
    wrapClass: {},
    viewClass: {},
    viewStyle: {},
    noresize: Boolean, // 如果 container 尺寸不会发生变化，最好设置它可以优化性能
    tag: {
      type: String,
      default: "div",
    },
  },

  data() {
    return {
      sizeWidth: "0",
      sizeHeight: "0",
      moveX: 0,
      moveY: 0,
    };
  },
  computed: {
    wrap() {
      return this.$refs.wrap;
    },
  },
  render(h) {
    let gutter = scrollbarWidth();
    let style = this.wrapStyle;

    if (gutter) {
      const gutterWith = `-${gutter}px`;
      const gutterStyle = `margin-bottom: ${gutterWith}; margin-right: ${gutterWith};`;

      if (Array.isArray(this.wrapStyle)) {
        style = toObject(this.wrapStyle);
        style.marginRight = style.marginBottom = gutterWith;
      } else if (typeof this.wrapStyle === "string") {
        style += gutterStyle;
      } else {
        style = gutterStyle;
      }
    }
    const view = h(
      this.tag,
      {
        class: ["el-scrollbar__view", this.viewClass],
        style: this.viewStyle,
        ref: "resize",
      },
      this.$slots.default
    );
    const wrap = (
      <div
        ref="wrap"
        style={style}
        onScroll={this.handleScroll}
        class={[
          this.wrapClass,
          "el-scrollbar__wrap",
          gutter ? "" : "el-scrollbar__wrap--hidden-default",
        ]}
      >
        {[view]}
      </div>
    );
    let nodes;

    if (!this.native) {
      nodes = [
        wrap,
        <Bar move={this.moveX} size={this.sizeWidth}></Bar>,
        <Bar vertical move={this.moveY} size={this.sizeHeight}></Bar>,
      ];
    } else {
      nodes = [
        <div
          ref="wrap"
          class={[this.wrapClass, "el-scrollbar__wrap"]}
          style={style}
        >
          {[view]}
        </div>,
      ];
    }
    return h("div", { class: "el-scrollbar" }, nodes);
  },
  methods: {
    handleScroll() {
      const wrap = this.wrap;
      this.moveY = (wrap.scrollTop * 100) / wrap.clientHeight;
      this.moveX = (wrap.scrollLeft * 100) / wrap.clientWidth;
    },

    update() {
      let heightPercentage, widthPercentage;
      const wrap = this.wrap;
      if (!wrap) return;
      // heightPercentage = (wrap.clientHeight * 100 / wrap.scrollHeight);
      heightPercentage = (wrap.clientHeight * 100) / this.availableScrollHeight;
      widthPercentage = (wrap.clientWidth * 100) / wrap.scrollWidth;
      this.sizeHeight = heightPercentage < 100 ? heightPercentage + "%" : "";
      this.sizeWidth = widthPercentage < 100 ? widthPercentage + "%" : "";
    },
  },
  watch:{
    availableScrollHeight(){
      this.update();
      this.handleScroll();
    }
  },
  mounted() {
    if (this.native) return;
    this.$nextTick(this.update);
    !this.noresize && addResizeListener(this.$refs.resize, this.update);
  },
  beforeDestroy() {
    if (this.native) return;
    !this.noresize && removeResizeListener(this.$refs.resize, this.update);
  },
};
</script>