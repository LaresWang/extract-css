<template>
  <div ref="domToIcon">
    <div :class="iconType ? iconType + ' discussion-icon' : 'discussion-icon'">
      <span>{{ showIconName }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DiscussionIcon',
  props: {
    name: {
      type: String,
      default() {
        return '';
      }
    },
    iconType: {
      type: String,
      default() {
        return '';
      }
    }
  },
  computed: {
    showIconName() {
      let nameArray = this.name.split('、');
      if (nameArray.length > 1) {
        return (Array.from(nameArray[0]).length > 0 ? Array.from(nameArray[0])[0] : '').concat(
          Array.from(nameArray[1]).length > 0 ? Array.from(nameArray[1])[0] : ''
        );
      } else {
        if (Array.from(nameArray[0]).length > 1) {
          return Array.from(nameArray[0])[0].concat(Array.from(nameArray[0])[1]);
        } else {
          return Array.from(nameArray[0])[0];
        }
      }
    }
  },
  mounted() {
    // if (process.platform !== 'darwin') {
    //   const fs = require('fs'), path = require('path');
    //   let that=this;
    //   let filePath=path.join(that.$remote.app.getPath('userData'),'images', `${that.showIconName||'default'}.png`)
    //   if (!fs.existsSync(filePath)) {
    //     let domtoimage = require('dom-to-image');
    //     domtoimage
    //       .toPng(that.$refs.domToIcon, { width: 40, height: 40, bgcolor: "#6d7998" })
    //       .then(function (dataUrl) {
    //         fs.writeFile(
    //           filePath,
    //           Buffer.from(
    //             dataUrl.replace(/^data:image\/\w+;base64,/, ""),
    //             "base64"
    //           ),
    //           function (err) {
    //             if (err) {
    //               console.log('特殊字符:',err);
    //             // } else {
    //             //   console.log("讨论组字体图片保存成功！");
    //             }
    //           }
    //         );
    //       })
    //       .catch(function (error) {
    //         console.error("oops, something went wrong!", error);
    //       });
    //   // }else{
    //   //   console.log('存在:',filePath)
    //   }
    // }
  }
};
</script>

<style scoped>
.discussion-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #6d7998;
}
.discussion-icon span {
  font-size: 13px;
  color: #ffffff;
}
.huge {
  width: 72px;
  height: 72px;
}
.huge span {
  font-size: 20px;
}
.large2 {
  width: 60px;
  height: 60px;
}
.large2 span {
  font-size: 18px;
}
.large {
  width: 50px;
  height: 50px;
}
.large span {
  font-size: 16px;
}
.medium {
  width: 40px;
  height: 40px;
}
.medium span {
  font-size: 14px;
}
.mini {
  width: 38px;
  /* height: 38px; */
}
.mini span {
  font-size: 12px;
}
.super-mini {
  width: 32px;
  height: 32px;
}
</style>
