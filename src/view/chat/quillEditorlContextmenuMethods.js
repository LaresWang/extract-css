import { remote, clipboard, nativeImage } from 'electron';
import Delta from 'quill-delta';
const fs = require('fs');
const path = require('path');
import emojiList from "@/utils/emoji.js";
const isNumber = n => typeof n === 'number';
export default {
  _formateDeltaToText(index, length) {
    const delta = this.quill.getContents(index, length);
    console.log(delta);
    let str = '';
    let isImage = false;
    for (let item of delta.ops) {
      if (typeof item.insert === 'string') {
        str += item.insert;
      }
      if (typeof item.insert === 'object' && item.attributes) {
        str += item.attributes.alt;
      }
      if (typeof item.insert === 'object' && !item.attributes) {
        str = item.insert.image;
        isImage = true;
      }
    }
    if (isImage) {
      clipboard.writeImage(nativeImage.createFromDataURL(str));
    }
    if (!isImage) {
      clipboard.writeText(str);
    }
    console.log(str);
  },
  _quillRightClick(e) {
    if (e) {
      e.preventDefault();
    }
    let data = this.quill.getSelection(true) || {};
    let paste = {
      name: this.$t('Universal_0385'),
      enabled: true,
      fun: () => {
        this._handleQuillcontextmenuPaste(data);
      }
    };
    let cut = {
      name: this.$t('Universal_0386'),
      enabled: false,
      fun: () => {
        this._handleQuillcontextmenuCut(data);
      }
    };
    let copy = {
      name: this.$t('chat_0026'),
      enabled: false,
      fun: () => {
        this._handleQuillcontextmenuCopy(data);
      }
    };
    let deleted = {
      name: this.$t('chat_0032'),
      enabled: false,
      fun: () => {
        this._handleQuillcontextmenuDeleted(data);
      }
    };
    if (data.length) {
      cut.enabled = true;
      paste.enabled = true;
      copy.enabled = true;
      deleted.enabled = true;
    }
    let rightClickOptions = [copy, paste, cut, deleted];
    return this.$RightClick(rightClickOptions).popup({
      window: remote.getCurrentWindow()
    });
  },
  // 剪切
  async _handleQuillcontextmenuCut({ index, length }) {
    this._formateDeltaToText(index, length);
    this.quill.deleteText(index, length);
    await this.$nextTick();
    this.quill.setSelection(index);
    console.log(this.quill.getLength());
  },
  // 删除
  async _handleQuillcontextmenuDeleted({ index, length }) {
    if (isNumber(index) && isNumber(length)) {
      this.quill.deleteText(index, length);
      await this.$nextTick();
      this.quill.setSelection(index);
      console.log(this.quill.getLength());
    }
  },
  // 复制
  _handleQuillcontextmenuCopy({ index, length }) {
    this._formateDeltaToText(index, length);
  },
  // 粘贴
  async _handleQuillcontextmenuPaste() {
    // 删除游标选中
    // this.quill.deleteText(index, length);
    // let oldLen = this.quill.getLength();
    // this.quill.updateContents(new Delta()
    //   .retain(index)
    //   .delete(length)
    // )
    // this.quill.setSelection(index);
    this.pasteMe();
    // await this.$nextTick();
    // let newLen = this.quill.getLength();
    // console.log(index, oldLen, newLen)
    // 移动游标
    // this.quill.setSelection(index + newLen - oldLen, 0);
  },
  pasteMe(e) {
    if (e) {
      e.preventDefault();
    }
    setTimeout(() => {
      let cutData = this.quill.getSelection(true) || {};
      console.log('选中删除', cutData);
      if (cutData.length) {
        this.quill.deleteText(cutData.index, cutData.length);
        this.quill.setSelection(cutData.index);
      }
      let filePath;
      if (process.platform !== 'darwin') {
        const rawFilePath = clipboard.readBuffer('FileNameW').toString('ucs2');
        filePath = decodeURI(rawFilePath.replace(new RegExp(String.fromCharCode(0), 'g'), ''));
      } else {
        filePath = decodeURI(clipboard.read('public.file-url').replace('file://', ''));
      }
      console.log('filePath', filePath);
      const rtf = clipboard.readRTF();
      const html = clipboard.readHTML();
      console.log('rtf', rtf, '||||||');
      console.log('html', html, '||||||');
      const image = clipboard.readImage();
      console.log('image', image, '||||||');
      let text = clipboard.readText();
      text = text?.trim();
      console.log('text', text, '||||||');
      const isAddImage = !image.isEmpty();
      console.log('isAddImage =============', isAddImage, image.getSize());
      if (filePath) {
        // this.fileName = `${this.$t('chat_0017')} ${path.basename(filePath)}`;
        this.fileName = `${path.basename(filePath)}`;
        this.sendFile = true;
        this.dropFile = [
          {
            path: filePath,
            type: path.extname(this.fileName),
            name: this.fileName,
            size: fs.statSync(filePath).size
          }
        ];
        console.log(this.dropFile);
        this.quill.deleteText(-1);
        this.texthtml = '';
      } else if (isAddImage) {
        let range = this.quill.getSelection(true) || {};
        console.log('不粘贴图片', range.index);
        // let delta = new Delta().retain(range.index);
        // delta = delta.concat(this.quill.delete(range.length));
        // this.quill.updateContents(delta, 'user');
        this.quill.updateContents(new Delta().retain(range.index).insert({ image: image.toDataURL() }), 'user');
        this.quill.setSelection(range.index + 1, 0);
        // this.quill.selection.update('user');
      } else if (!filePath && !isAddImage && text) {
        // 添加文本或者emoji表情
        console.log(text);
        const textBefore = text.split('');
        console.log(textBefore);
        let list = [];
        let tempText = '';
        for (let i = 0; i < textBefore.length; i++) {
          let ele = textBefore[i];
          if (ele != '[' || ele != ']') {
            tempText += ele;
          }
          if (ele === '[') {
            list.push({
              type: 'text',
              value: tempText.substring(0, tempText.length - 1)
            });
            tempText = '[';
          }
          if (ele === ']') {
            if (emojiList.find(i => i.tag === tempText)) {
              // 是表情
              list.push({ type: 'image', value: tempText });
            } else {
              // 不是表情
              list.push({ type: 'text', value: tempText });
            }
            tempText = '';
          }
          if (i === textBefore.length - 1) {
            list.push({ type: 'text', value: tempText });
            tempText = null;
          }
        }
        const copyList = list.filter(item => !!item.value).reverse(); //遍历结束操作光标
        let moveStep = 0;
        // console.log(copyList)
        let { index } = this.quill.getSelection(true) || {};
        for (let item of copyList) {
          if (item.type !== 'image') {
            // let { index } = this.quill.getSelection(true) || {};
            this.quill.updateContents(new Delta().retain(index).insert(item.value));
            // this.quill.setSelection(index + item.value.length);
            moveStep = moveStep + item.value.length;
          }
          if (item.type === 'image') {
            let ret = emojiList.find(x => x.tag == item.value);
            if (!ret) {
              continue;
            }
            let bitmap = '';
            if (process.platform == 'darwin') {
              // eslint-disable-next-line
              bitmap = fs.readFileSync(path.join(__static, `/resources/emoji/${ret.file}`));
            } else {
              bitmap = fs.readFileSync(path.join(process.cwd(), `/resources/emoji/${ret.file}`));
            }
            let base64str = Buffer.from(bitmap, 'binary').toString('base64');
            // let { index } = this.quill.getSelection(true) || {};
            this.quill.updateContents(
              new Delta().retain(index).insert(
                { image: `data:image;base64,${base64str}` }, { height: '22px', width: '22px', alt: ret.tag }),
              'user'
            );
            // this.quill.setSelection(index + 1);
            moveStep = moveStep + 1;
          }
        }
        this.quill.setSelection(index + moveStep);
      }
    }, 1);
  },
  pasteEmoji(originText, vm) {
    console.log(originText, 'originText');
    const textBefore = originText.split('');
    console.log(textBefore);
    let list = [];
    let tempText = '';
    for (let i = 0; i < textBefore.length; i++) {
      let ele = textBefore[i];
      if (ele != '[' || ele != ']') {
        tempText += ele;
      }
      if (ele === '[') {
        list.push({
          type: 'text',
          value: tempText.substring(0, tempText.length - 1)
        });
        tempText = '[';
      }
      if (ele === ']') {
        list.push({ type: 'image', value: tempText });
        tempText = '';
      }
      if (i === textBefore.length - 1) {
        list.push({ type: 'text', value: tempText });
        tempText = null;
      }
    }
    const copyList = list.filter(item => !!item.value);
    let moveStep = 0;
    // let { index } = vm.quill.getSelection(true) || {};
    for (let item of copyList) {
      if (item.type !== 'image') {
        let { index } = vm.quill.getSelection(true) || {};
        vm.quill.updateContents(new Delta().retain(index).insert(item.value));
        vm.quill.setSelection(index + item.value.length);
        moveStep = moveStep + item.value.length;
      }
      if (item.type === 'image') {
        let ret = emojiList.find(x => x.tag == item.value);
        if (!ret) {
          continue;
        }
        let bitmap = '';
        if (process.platform == 'darwin') {
          // eslint-disable-next-line
          bitmap = fs.readFileSync(path.join(__static, `/resources/emoji/${ret.file}`));
        } else {
          bitmap = fs.readFileSync(path.join(process.cwd(), `/resources/emoji/${ret.file}`));
        }
        let base64str = Buffer.from(bitmap, 'binary').toString('base64');
        let { index } = vm.quill.getSelection(true) || {};
        vm.quill.updateContents(
          new Delta().retain(index).insert({ image: `data:image;base64,${base64str}` }, { height: '22px', width: '22px', alt: ret.tag }),
          'user'
        );
        // this.quill.setSelection(index + 1);
        moveStep = moveStep + 1;
      }
    }
  }
};
