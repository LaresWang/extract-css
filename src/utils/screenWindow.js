import path from 'path';
import { ipcRenderer, clipboard, nativeImage } from 'electron';
let call, addonPath;
if (process.platform !== "darwin") {
  call = require("../../resources/VC-Desktop-Capture/Deploy/addon.node")
  addonPath = path.join(process.cwd(), 'resources/VC-Desktop-Capture/Deploy');
  call?.CaptureInit?.(addonPath);
}

// process.platform !== "darwin
export const screenWindow = (isShowWindow) => {
  console.log(isShowWindow)
  // public下resources复制，替换项目根目录下resources
  let imgdata = call?.CaptureMain?.();
  if (imgdata) {
    let base64str = Buffer.from(imgdata, 'binary').toString('base64');
    ipcRenderer.send('screen-windows', base64str);
    clipboard.writeImage(nativeImage.createFromBuffer(Buffer.from(imgdata, 'binary')), 'clipboard');
  }
  // console.warn("返回的png数据:", imgdata, base64str);
  // 截图完成后窗口显示
  if (isShowWindow) {
    const browserWindow = window.vm.$remote.getCurrentWindow()
    browserWindow.restore();
    browserWindow.show();
  }
};
