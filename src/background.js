'use strict';

import fs from 'fs';
import os from 'os';
import path from 'path';
import { app, protocol, BrowserWindow, Menu, ipcMain, Tray,
  globalShortcut, nativeImage, dialog, Notification, session, nativeTheme, powerMonitor, screen } from 'electron';
import Knex from 'knex';
import { sum } from 'lodash';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { autoUpdater, ABORT_DOWNLOAD } from 'electron-autoupdate-didi';
import Screenshots from 'electron-screenshots';
import WebpackMigrationSource from '@/WebpackMigrationSource';
process.setMaxListeners(0);

const isDevelopment = process.env.NODE_ENV !== 'production';
const appVersion = require('../package.json').version;
const uploadUrl = process.env.VUE_APP_UPDATE;
const gotTheLock = app.requestSingleInstanceLock();
const log = require('electron-log');
const electronLocalshortcut = require('electron-localshortcut');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// tray闪烁
let timer = null;
let count = 0;
let win = null;
let tray = null;
let trayImage = null;
let updateProcessing = false; //加上状态，防止重复下载
let closeWin = false;
let isWinFull = false;
let trayMsgArr = [];
let leaveInter,isLeave = true,trayBrowserWindow=null;
let didFinishedLoad = false;
let mediaViewerWin = null;
let isMediaWinFull = false;
let lan = 'en-us';
let closeWinForUpdate = false;
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,
      standard: true
    }
  }
]);

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    height: 500,
    useContentSize: false,
    width: 380,
    autoHideMenuBar: true,
    minWidth: 0,
    minHeight: 0,
    maximizable: false,
    alwaysOnTop: false,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      enableRemoteModule: true,//"electron": "^10.0.0",
      spellcheck: false,//Electron 9 及以上，默认启用拼写检查器
    },
    resizable: false,
    frame: false,
    transparent: false,
    // darkTheme: false,
    titleBarStyle: 'hidden',
    show: false,
    icon: nativeImage.createFromPath(path.join(`${__static}`, 'logo.ico')) // eslint-disable-line
  });
  console.log(process.env.WEBPACK_DEV_SERVER_URL);
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (process.env.IS_DEV) {
      win.webContents.openDevTools({ mode: 'detach' })
    }
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html#/user/login/qrcode');
  }
  // 快捷键代码开始
  electronLocalshortcut.register(win, 'CmdOrCtrl+F', () => {
    win.webContents.send('onsearch')
    // dialog.showMessageBox({
    //   title: "帮助",//信息提示框标题
    //   message: "localshortcut",//信息提示框内容
    //   buttons: ["ok"],//下方显示的按钮
    //   noLink: true, //win下的样式
    //   type: "info",//图标类型
    // }, function (index) {
    //   console.log(index);
    // });
  });
  // 快捷键代码结束

  // 导航完成时触发
  win.webContents.on('did-finish-load', () => {
    win.show();
    win.focus();
    didFinishedLoad = true;
  });

  win.on('close', e => {
    if (!closeWinForUpdate) {
      // console.log('win ========= close', closeWin);
      isWinFull = true
      if (closeWin || !(win && win.isResizable())) {
        // removeParametersAndCloseApp();
        ipcMain.emit('quit-app')
      } else {
        if (win.isFullScreen() && process.platform == 'darwin') {
          win.setFullScreen(false)
        }
        win.hide();
        e.preventDefault();
      }
    }

  });

  // 退出全屏触发clear
  win.on('leave-full-screen', () => {
    console.log('isWinFull ===>', isWinFull)
    if (isWinFull) {
      win.hide();
    }
  });

  win.on('show', () => {
    //忽略全部 已经处理db 更新视图
    win.webContents.send('get-last-msg-list');
  });

  win.on('restore', () => {
    win.webContents.send('current-session-at');
    //忽略全部 已经处理db 更新视图
    win.webContents.send('get-last-msg-list');
  });
  //win.webContents.openDevTools()  //exe运行调试时放开
  win.on('closed', () => {
    console.log('win ========= closed');
    removeParametersAndCloseApp();
  });
  createMenu();

  updateHandle();
  if (process.platform == 'darwin') {
    initScreen();
  } else {
    windowsinitScreen();
  }

  closeWin = false;
  initMediaViewerWin();
  // initAudioWin();
}
if (os.release().startsWith('6.1') || os.release().includes('7')) {
  // win7下 ，关闭硬件加速
  app.disableHardwareAcceleration();
}
// https://github.com/electron/electron/blob/v11.4.7/docs/api/app.md
app.on('render-process-gone', (event, webContents, details) => {
  log.info(`crash WebContentId:${webContents.id}`)//win ,mediaViewerWin devTools
  log.error(details)
  // 渲染进程崩溃时退出应用
  win.webContents.send('closeSocket');
  handleQuitWin()
})
app.on('child-process-gone', (event, details) => {
  log.info(`child process was crashed`) //GPU...
  log.error(details)
  // 渲染进程崩溃时退出应用
  win.webContents.send('closeSocket');
  handleQuitWin()
})
app.on('before-quit', () => {
  closeWin = true;
});
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  console.log('window-all-closed');
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  app.releaseSingleInstanceLock();
  // if (process.platform !== 'darwin') {
  quitApp();
  // }
});

app.on('activate', () => {
  win.webContents.send('activate', true);
  console.log('app activate');
  isWinFull = false
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
  if (win && process.platform === 'darwin') {
    win.show();
    win.webContents.send('get-last-msg-list');
  }
});
app.on('browser-window-focus', () => {
  win.webContents.send('activate', true);
  // if (!win) return;
  // if (process.platform === 'darwin') {
  //   let contents = win.webContents;
  // globalShortcut.register('CommandOrControl+C', () => {
  //   contents.copy();//67
  // });
  // globalShortcut.register('CommandOrControl+V', () => {
  //   contents.paste();//86
  // });
  // globalShortcut.register('CommandOrControl+X', () => {
  //   contents.cut();//88
  // });
  // globalShortcut.register('CommandOrControl+A', () => {
  //   contents.selectAll();//65
  // });
  // }
});

app.on('browser-window-blur', () => {
  win.webContents.send('activate', false);
  // globalShortcut.unregister('CommandOrControl+C');
  // globalShortcut.unregister('CommandOrControl+V');
  // globalShortcut.unregister('CommandOrControl+X');
  // globalShortcut.unregister('CommandOrControl+A');
  // electronLocalshortcut.unregisterAll(win); //避免
});

if (!gotTheLock) {
  quitApp();
} else {
  app.on('second-instance', () =>
  // event, commandLine, workingDirectory
  {
    // 当运行第二个实例时,将会聚焦到myWindow这个窗口
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  }
  );
  // const installExtensions = async () => {
  //   const { default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = require('electron-devtools-installer');

  //   const extensions = [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS];
  //   for (const extension of extensions) {
  //     try {
  //       const name = await installExtension(extension);
  //       console.log(`Added Extension:  ${name}`);
  //     } catch (err) {
  //       console.log('An error occurred: ', err);
  //     }
  //   }
  // };
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', async () => {
    createWindow();
    powerMonitor.on('resume', () => {
      win && win.webContents.send('sysResume');
    })
    powerMonitor.on('lock-screen', () => {
      win && win.webContents.send('sysResume');
    })
    const ses = win.webContents.session
    console.log(ses.getUserAgent())
    ses.setProxy({model: 'direct'})  // system   direct
    // if (!app.isPackaged || (isDevelopment && !process.env.IS_TEST)) {
    if (!app.isPackaged) {
      let vueDevToolsPath, absolutePath;
      if (process.platform === 'darwin') {
        vueDevToolsPath = `/Library/Application Support/Google/Chrome/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/5.3.4_0`
        // await installExtensions();
      } else {
        vueDevToolsPath = `AppData/Local/Google/Chrome/User Data/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/5.3.4_0`
      }
      absolutePath = path.join(os.homedir(), vueDevToolsPath)
      if (fs.existsSync(absolutePath)) {
        await session.defaultSession.loadExtension(absolutePath)
      }
    }
    // }
    if (isDevelopment) {
      globalShortcut.register('CmdOrCtrl+F11', () => {
        win.webContents.openDevTools();
      });
    } else {
      globalShortcut.register('CmdOrCtrl+Alt+Shift+F11', () => {
        win.webContents.openDevTools();
      });
    }
    // globalShortcut.register('CmdOrCtrl+Alt+Shift+F10', () => {
    //   win.webContents.reload();
    // });
    if (process.platform === 'darwin') {
      console.log('======', app.isPackaged);
      const wayPath = app.isPackaged ? 'mac-logo@2x.png' : `bundled/mac-logo-t@2x.png`;
      trayImage = nativeImage.createFromPath(path.join(app.getAppPath(), wayPath));
      tray = new Tray(trayImage);
      trayImage.setTemplateImage(true);
      tray.setPressedImage(trayImage);
      tray.on('mouse-down', () => {
        if (win) {
          win.show();
          win.focus();
        }
      });
    } else {
      handleWindowsTray()
    }
  });
}

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        quitApp();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      quitApp();
    });
  }
}

// ################# FUNCTION  ################
// ############################################

// 设置菜单栏
function createMenu () {
  // darwin表示macOS，针对macOS的设置
  if (process.platform === 'darwin') {
    const template = [
      {
        label: 'App Demo',
        submenu: [
          {
            role: 'about'
          },
          {
            role: 'quit'
          }
        ]
      }
    ];
    let menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  } else {
    // windows及linux系统
    Menu.setApplicationMenu(null);
  }
}

function updateHandle () {
  //= ==============================================================================================================
  //                            清除每次更新下载的文件，否则无法进行更新
  //= ==============================================================================================================
  // updaterCacheDirName的值与src/main/app-update.yml中的updaterCacheDirName值一致，在windows中会创建一个类似
  // C:\Users\Administrator\AppData\Local\electron-updater1\pending文件存储更新下载后的文件"*.exe"和"update-info.json"
  const path = require('path');
  let fs = require('fs-extra');
  let log = require('electron-log');
  log.info('updateHandle...');

  let restartDownload = false;
  let isStartUpdate = false;
  // log.transports.file.level = true; //关闭文件日志,默认是开启的
  // log.transports.console.level = true; //关闭控制台日志,默认是开启的
  // log.transports.file.file = "/Users/longchunyu/Desktop/log/myLog.log";
  let updaterCacheDirName = 'didi-updater';
  const updatePendingPath = path.join(autoUpdater.app.baseCachePath, updaterCacheDirName, 'pending');
  console.log('更新路径', updatePendingPath);
  fs.emptyDir(updatePendingPath);
  //= =================================================================================================================
  // 监测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写
  let message = {
    error: '检查更新出错',
    checking: '正在检查更新……',
    updateAva: '检测到新版本，正在下载……',
    updateNotAva: '现在使用的就是最新版本，不用更新'
  };
  /*let message = {
    error: 'Check for update error',
    checking: 'Checking for updates...',
    updateAva: 'New version detected, downloading...',
    updateNotAva: 'Now you are using the latest version, no need to update'
  };*/
  // const os = require("os");
  function sendUpdateMessage (obj) {
    win && win.webContents.send('updateMessage', obj);
  }
  autoUpdater.setFeedURL(uploadUrl);
  // 当更新出现错误时触发
  autoUpdater.on('error', function (error) {
    log.error(error);
    if (error.message == 'The command is disabled and cannot be executed' && closeWinForUpdate) {
      return;
    }
    sendUpdateMessage({
      action: 'error',
      message: message.error
    });
    win && win.webContents.send('downloadError');
    updateProcessing = false;
    isStartUpdate = false;
  });
  // 当开始检查更新的时候触发
  autoUpdater.on('checking-for-update', function (info) {
    log.info('checking-for-update');
    log.info(info);
    sendUpdateMessage({
      action: 'checkingForUpdate',
      message: message.checking
    });
  });

  // 当发现一个可用更新的时候触发，更新下载包会自动开始
  autoUpdater.autoDownload = false;
  autoUpdater.on('update-available', function (info) {
    console.log('发现一个可用更新的时候触发');
    log.info('发现一个可用更新的时候触发');
    sendUpdateMessage({
      action: 'updateAva',
      message: message.updateAva,
      info
    });
  });
  // 当没有可用更新的时候触发
  autoUpdater.on('update-not-available', function () {
    log.info('没有可以更新的');
    console.log('没有可以更新的');
    sendUpdateMessage({
      action: 'updateNotAva',
      message: message.updateNotAva
    });
  });

  // 更新下载进度事件
  autoUpdater.on('download-progress', function (progressObj) {
    // log.info(progressObj);
    console.log('更新进度: ', progressObj);
    if (progressObj.percent == 100) {
      isStartUpdate = true;
    }
    win && win.webContents.send('downloadProgress', progressObj);
  });
  /**
   * event Event
   * releaseNotes String - 新版本更新公告
   * releaseName String - 新的版本号
   * releaseDate Date - 新版本发布的日期
   * updateUrl String - 更新地址
   */
  autoUpdater.on('update-downloaded', function () {
    log.info('下载完成，开始退出升级');
    console.log('下载完成，开始退出升级', updatePendingPath);
    updateProcessing = false;
    setTimeout(() => {
      if (process.platform === 'darwin') {
        closeWinForUpdate = true;
      }

      autoUpdater.quitAndInstall(false, true);
    }, 500);
  });

  autoUpdater.on(ABORT_DOWNLOAD, function () {
    if (restartDownload) {
      autoUpdater.downloadUpdate();
      updateProcessing = true;
    }
    restartDownload = false;
  });

  ipcMain.on('checkForUpdate', () => {
    //执行自动更新检查
    autoUpdater.checkForUpdates();
  });
  ipcMain.on('downloadUpdate', () => {
    if (!updateProcessing) {
      autoUpdater.downloadUpdate();
      updateProcessing = true;
    }
  });
  // 取消下载
  ipcMain.on('cancelledUpdate', () => {
    autoUpdater.abortDownload();
    updateProcessing = false;
  });
  // 重新下载
  ipcMain.on('cancelUpdate', () => {
    // autoUpdater.on('update-cancelled');
    // autoUpdater.dispatchUpdateDownloaded('update-cancelled');
    if (isStartUpdate) {
      return;
    }

    if (updateProcessing) {
      autoUpdater.abortDownload();
      restartDownload = true;
    } else {
      autoUpdater.downloadUpdate();
      updateProcessing = true;
    }
  });
  ipcMain.on('app_version', () => {
    win &&
      win.webContents.send('app_version', {
        version: appVersion
      });
  });
  ipcMain.on('download-images', (event, args) => {
    win && win.webContents.send('download-images', args);
  });
}

function windowsinitScreen () {
  globalShortcut.register('CmdOrCtrl+Alt+Q', () => {
    win && win.webContents.send('windows-captureShortcut', true)
  });
  ipcMain.on('screen-windows', (event, arg) => {
    //截图 更新富文本编辑器
    win.webContents.send('clipboardImage', {
      dataURL: 'data:image;base64,' + arg
    });
  });
}

function initScreen () {
  // 初始化截图
  const screenshots = new Screenshots();
  globalShortcut.register('CmdOrCtrl+Alt+Q', () => {
    screenshots.startCapture();
  });
  // globalShortcut.register('CmdOrCtrl+Alt+Q', () => screenshots.startCapture());
  // globalShortcut.register('Esc', () => screenshots.endCapture());
  // 点击确定按钮回调事件
  screenshots.on('ok', (e, { viewer, dataURL }) => {
    win.restore();
    win.webContents.send('clipboardImage', {
      viewer,
      dataURL
    });
  });
  // 点击取消按钮回调事件
  screenshots.on('cancel', () => {
    // 执行了preventDefault
    // 点击取消不会关闭截图窗口
    win.restore();
    console.log('capture', 'cancel2');
  });
  // 点击保存按钮回调事件
  screenshots.on('save', (e, { viewer, dataURL }) => {
    win.restore();
    screenshots.endCapture();
    console.log('capture', viewer);
    let date = new Date();
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().length > 1 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
    let day = date.getDate().toString().length > 1 ? date.getDate() : '0' + date.getDate();
    let hour = date.getHours().toString().length > 1 ? date.getHours() : '0' + date.getHours();
    let minute = date.getMinutes().toString().length > 1 ? date.getMinutes() : '0' + date.getMinutes();
    let second = date.getSeconds().toString().length > 1 ? date.getSeconds() : '0' + date.getSeconds();
    let milliseconds = date.getMilliseconds().toString().length > 1 ? date.getMilliseconds() : '0' + date.getMilliseconds();

    dialog
      .showSaveDialog({
        title: '保存图片',
        buttonLabel: '保存',
        filters: [
          {
            name: 'PNG',
            extensions: ['png']
          }
        ],
        defaultPath: '' + year + month + day + hour + minute + second + milliseconds + '.png'
      })
      .then(result => {
        console.log('-----result---', result);
        // if (result.filePath.indexOf('file:///') == -1) {
        //   return result.filePath;
        // } else {
        //   result.filePath = result.filePath.substring(8);
        // }
        fs.writeFile(result.filePath, Buffer.from(dataURL.replace(/^data:image\/\w+;base64,/, ''), 'base64'), function (err) {
          if (err) return;
        });
      })
      .catch(err => {
        console.log(err);
      });
  });
  ipcMain.on('capture-screen', () => {
    console.log('capture-screen');
    screenshots.startCapture();
  });
}

//#############################
//####  ipcMain register  #####
//#############################
// windows 托盘消息列表 && mac菜单栏消息计数
ipcMain.on('update-badge', (event, sessionArr = []) => {
  trayMsgArr = sessionArr;
  if (process.platform == 'darwin') {
    setMacOSBadge(sessionArr)
  } else {
    if (sum(sessionArr.map(o => o['unread'])) <= 0) {
      clearWinToggleTray();
    } else {
      if (timer) {
        return;
      }
      // win.flashFrame(true);
      timer = setInterval(function () {
        count++;
        if (count % 2 == 0) {
          if (tray) {
            tray.setImage(path.join(`${__static}/`, 'empty.png')); // eslint-disable-line
          }
        } else {
          try {
            if (tray) {
              tray.setImage(path.join(`${__static}/`, 'logo.png')); // eslint-disable-line
            }
          } catch (e) {
            log.warn(e);
          }
        }
      }, 500);
    }
  }
});
ipcMain.on('close', () => {
  console.log("ipcMain.on('close')");
  removeParametersAndCloseApp();
});

ipcMain.on('hide', () => {
  win.hide();
});
//登陆后可以最大化
ipcMain.on('changeMax', (event, arg) => {
  win&&win.setMaximizable(arg);
});

//返回登录页
ipcMain.on('restoreFirstSize', () => {
  log.info('restoreFirstSize');
  if (process.platform === 'darwin') {
    win.isFullScreen() && win.setFullScreen(false)
  } else {
    win.isMaximized() && win.unmaximize();
    win.isMinimized() && win.show();
  }
  win.setMinimumSize(380, 500);
  setTimeout(() => {
    win.setSize(380, 500, true);
    win.setResizable(false);
    win.center(); //窗口居中
  }, 200);
});
ipcMain.on('logined', async (event, arg) => {
  win.setSkipTaskbar(true);
  // win.setAlwaysOnTop(true,'torn-off-menu')//高于 floating 的下一级 torn-off-menu
  try {
    const userId = arg;
    let configDir = path.join(app.getPath('appData'), `${process.env.VUE_APP_ID}`);
    require('fs-extra').ensureDirSync(configDir);
    let configList = fs.readdirSync(configDir);
    let reg = /.db$/;
    configList = configList.filter(t => {
      if (t.length === 22 && reg.test(t)) {
        return t;
      }
    });
    console.log('数据库更新内容', configList);
    if (configList.indexOf(`${userId}.db`) === -1) {
      configList.push(`${userId}.db`);
    }
    for (const dbName of configList) {
      const options = {
        client: 'sqlite3',
        connection: {
          filename: `${configDir}/${dbName}`
        },
        pool: {
          afterCreate: (conn, cb) => {
            conn.run('PRAGMA foreign_keys = ON', cb);
          }
        },
        useNullAsDefault: true
      };
      const knex = Knex(options);
      await knex.migrate.latest({
        ...options,
        migrationSource: new WebpackMigrationSource(require.context('../migrations/', true, /.js$/))
      });
      let fs = require('fs');
      fs.readFile(
        `${__static}/resources/constant/area.json`, // eslint-disable-line
        async (err, data) => {
          if (err) {
            return console.error('area', err);
          }
          let area = JSON.parse(data.toString());
          const SQL = 'select count(0) as count from t_area';
          let res = await knex.raw(SQL);
          if (res[0].count == 0) {
            knex.batchInsert('t_area', area.RECORDS, 50);
          }
        }
      );

      console.log(`${dbName}更新完成`);
    }
  } catch (err) {
    log.warn(err);
  } finally {
    event.reply('loginedToAddKnex', arg);
  }
});

ipcMain.on('databaseIsFinished', async (event, arg) => {
  event.reply('databaseIsFinishedToIPC', arg);
});
ipcMain.on('syncDataMain', async (event, arg) => {
  event.reply('syncData', arg);
});

ipcMain.on('new-message', (event, item) => {
  if (process.platform !== 'darwin') {
    // if (timer) {
    //   return;
    // }
    // // win.flashFrame(true);
    // timer = setInterval(function () {
    //   count++;
    //   if (count % 2 == 0) {
    //     if (tray) {
    //       tray.setImage(path.join(`${__static}/`, 'empty.png')); // eslint-disable-line
    //     }
    //   } else {
    //     try {
    //       if (tray) {
    //         tray.setImage(path.join(`${__static}/`, 'logo.png')); // eslint-disable-line
    //       }
    //     } catch (e) {
    //       log.warn(e);
    //     }
    //   }
    // }, 500);
  } else {
    showNotification(item);
  }
});

function showNotification (item) {
  const notification = {
    title: item.title,
    body: item.body,
    silent: item.silent,
    tag: item.msgId
  };
  let newMessage = new Notification(notification);
  newMessage.show();
}

ipcMain.on('no-message', () => {
  if (process.platform !== 'darwin') {
    showWinByMessage();
  }
});

ipcMain.on('quit-win', handleQuitWin);

ipcMain.on('saveAsFile', async (event, arg) => {
  console.log('测试文件 =111111==》')
  const dialog = require('electron').dialog;
  // await dialog.showSaveDialog(
  //   {
  //     defaultPath: path.join(os.homedir(), `Downloads/${arg.fname}`)
  //   },
  //   file => {
  //     if (!file) {
  //       console.log('测试文件 ===》')
  //       return;
  //     } else {
  //       let content = fs.readFileSync(arg.downloadPath);
  //       console.log('测试文件 =222222==》')
  //       fs.writeFileSync(file, content);
  //     }
  //   }
  // );
  const option = {
    defaultPath: path.join(os.homedir(), `Downloads/${arg.fname}`)
  }
  const obj = dialog.showSaveDialog(option)
  obj.then(
    onResolved => {
      let file = onResolved.filePath;
      let content = fs.readFileSync(arg.downloadPath);
      fs.writeFileSync(file, content);
    }
  ).catch(err => {
    console.log('No file saved', err);
  });
});
ipcMain.on('saveAsImages', async (event, arg) => {
  const dialog = require('electron').dialog;
  // await dialog.showSaveDialog(
  //   {
  //     defaultPath: path.join(os.homedir(), `Downloads/${arg.fname}`)
  //   },
  //   file => {
  //     if (!file) {
  //       console.log('测试图片 ===》')
  //       return;
  //     } else {
  //       let content = fs.readFileSync(arg.filePath);
  //       console.log('测试图片 =222222==》')
  //       fs.writeFileSync(file, content);
  //     }
  //   }
  // );
  console.log('测试图片 =111111==》')
  const option = {
    defaultPath: path.join(os.homedir(), `Downloads/${arg.fname}`)
  }
  const obj = dialog.showSaveDialog(option)
  obj.then(
    onResolved => {
      console.log('测试图片 =222222==》')
      let file = onResolved.filePath;
      let content = fs.readFileSync(arg.downloadPath);
      fs.writeFileSync(file, content);
    }
  ).catch(err => {
    console.log('No image saved', err);
  });
});
ipcMain.on('media-share', (event, arg) => {
  win.show();
  win.focus();
  win.webContents.send('media-share', arg);
});


ipcMain.on('changeMediaLan', (e, r) => {
  lan = r;
});
ipcMain.on('media-viewer', (event, arg) => {
  if (!mediaViewerWin) {
    initMediaViewerWin();
  }
  isMediaWinFull = false

  if (arg.msgType == 2) { // 图片处理
    // 处理图片查看器高度
    // windows 单独设置
    if (process.platform !== 'darwin') {
      mediaViewerWin.isMaximized() && mediaViewerWin.unmaximize()
    }
    setMediaBounds(arg)
  } else { // 视频处理
    mediaViewerWin.setSize(800, 600)
    mediaViewerWin.center()
  }
  const theme = setMediaViewBgTheme() // 获取系统 模式
  mediaViewerWin.webContents.send('loadTheme', { theme } );
  mediaViewerWin.webContents.send('loadMedia', arg);
  mediaViewerWin.webContents.send('lanChanged', { lan });
  mediaViewerWin.show();
  // mediaViewerWin.webContents.openDevTools();
});

function systemTheme() {
  if (nativeTheme.shouldUseDarkColors) {
    console.log("i am dark.")
    return 'dark'
  } else {
    console.log("i am light.")
    return 'light'
  }
}

function setMediaViewBgTheme() {
  let theme = 'system'
  if (process.platform === "darwin") {
    theme = systemTheme()
    //当桌面主题更新时
    nativeTheme.on('updated', () => {
      theme = systemTheme()
      mediaViewerWin.webContents.send('loadTheme', { theme } );
    })
  } else {
    theme = 'system'
  }
  return theme
}

ipcMain.on('media-viewer-change', (event, arg) => {
  setMediaBounds(arg)
  mediaViewerWin.webContents.send('loadMedia', arg);

});
function setMediaBounds (arg) {
  // 获取当前点解的图片
  console.log('current width ===>', arg.imgList[arg.index].msgBody.width);
  console.log('current height ===>', arg.imgList[arg.index].msgBody.height);

  // 新增msgBody 两个属性  orgWidth orgHeight 原始框高
  for (const obj of arg.imgList) {
    obj.msgBody.orgWidth = obj.msgBody.orgWidth || obj.msgBody.width
    obj.msgBody.orgHeight = obj.msgBody.orgHeight || obj.msgBody.height
  }
  // 正常大小图片 w = w + 20 h = h + 86
  // 图片宽度超出最大限制 w = 最大限制  h不变
  const imageWidthMax = 1298
  const imageHightMax = 604
  const imageWidthMin = 330
  const imageHightMin = 330
  let radio = 1

  // 图片宽高 都超出最大值  w = 最大值 h = 最大值
  if (arg.imgList[arg.index].msgBody.orgWidth >= imageWidthMax && arg.imgList[arg.index].msgBody.orgHeight >= imageHightMax) {
    console.log('w h 都 比 最大值还大  ===>');
    // 判断宽高 谁先到最大值
    radio = arg.imgList[arg.index].msgBody.orgWidth / arg.imgList[arg.index].msgBody.orgHeight
    console.log('radio  ===>', radio);
    if (radio > (imageWidthMax / imageHightMax)) { //图片属于横板且比较细长
      // eslint-disable-next-line max-len
      arg.imgList[arg.index].msgBody.height = parseInt((imageWidthMax / arg.imgList[arg.index].msgBody.orgWidth) * arg.imgList[arg.index].msgBody.orgHeight)
      console.log('arg.imgList[arg.index].msgBody.width  111 ===>', arg.imgList[arg.index].msgBody.width);

      arg.imgList[arg.index].msgBody.width = imageWidthMax
      console.log('arg.imgList[arg.index].msgBody.width  222 ===>', arg.imgList[arg.index].msgBody.width);

    } else { //图片属于高度较高
      // eslint-disable-next-line max-len
      console.log('arg.imgList[arg.index].msgBody.width  3333 ===>', arg.imgList[arg.index].msgBody.width);

      // eslint-disable-next-line max-len
      arg.imgList[arg.index].msgBody.width = parseInt((imageHightMax / arg.imgList[arg.index].msgBody.orgHeight) * arg.imgList[arg.index].msgBody.orgWidth)
      arg.imgList[arg.index].msgBody.height = imageHightMax
      // eslint-disable-next-line max-len
      console.log('arg.imgList[arg.index].msgBody.width  44444 ===>', arg.imgList[arg.index].msgBody.orgWidth, arg.imgList[arg.index].msgBody.orgHeight);

    }
    // arg.imgList[arg.index].msgBody.width = imageWidthMax
    // arg.imgList[arg.index].msgBody.height = imageHightMax
    console.log('w h 都 比 最大值还大  ===>', arg.imgList[arg.index].msgBody.orgWidth, arg.imgList[arg.index].msgBody.orgHeight);

    mediaViewerWin.setSize(imageWidthMax + 20, imageHightMax + 86)
  } else
  // 图片宽高 都小于最小值  w = 最小值 h = 最小值
  if (arg.imgList[arg.index].msgBody.orgWidth <= imageWidthMin && arg.imgList[arg.index].msgBody.orgHeight <= imageHightMin) {
    console.log('w 比 最小值还小 h 比最小值还小  图片保持原来尺寸===>');
    mediaViewerWin.setSize(imageWidthMin + 20, imageHightMin + 86)
  }
  else
  // 图片宽度 超出最大限制 w  最大限制  h 根据比例变大
  if (arg.imgList[arg.index].msgBody.orgWidth > imageWidthMax) {
    console.log('w 比 最大值还大 h 根据比例变大 ');
    const R = (arg.imgList[arg.index].msgBody.orgWidth / arg.imgList[arg.index].msgBody.orgHeight) / (imageWidthMax / imageHightMax)
    if (R > 1) { //图片属于横板且比较细长
      // eslint-disable-next-line max-len
      arg.imgList[arg.index].msgBody.height = parseInt((imageWidthMax / arg.imgList[arg.index].msgBody.orgWidth) * arg.imgList[arg.index].msgBody.orgHeight)
      arg.imgList[arg.index].msgBody.width = imageWidthMax
      console.log('w 比 最大值还大 h 根据比例变大  2222', arg.imgList[arg.index].msgBody.orgHeight);

      if (arg.imgList[arg.index].msgBody.orgHeight >= imageHightMin) {
        mediaViewerWin.setSize(arg.imgList[arg.index].msgBody.width + 20, arg.imgList[arg.index].msgBody.height + 86)
      } else {
        console.log('w 比 最大值还大 h 根据比例变大  2222');
        mediaViewerWin.setSize(imageWidthMax + 20, imageHightMin + 86)
      }
    } else {
      // eslint-disable-next-line max-len
      arg.imgList[arg.index].msgBody.width = parseInt((imageHightMax / arg.imgList[arg.index].msgBody.orgHeight) * arg.imgList[arg.index].msgBody.orgWidth)
      arg.imgList[arg.index].msgBody.height = imageHightMax
      if (arg.imgList[arg.index].msgBody.orgWidth >= imageWidthMin) {
        console.log('w 比 最大值还大 h 根据比例变大  33333');
        mediaViewerWin.setSize(arg.imgList[arg.index].msgBody.width + 20, arg.imgList[arg.index].msgBody.height + 86)
      } else {
        console.log('w 比 最大值还大 h 根据比例变大  44444');
        mediaViewerWin.setSize(imageWidthMin + 20, arg.imgList[arg.index].msgBody.height + 86)
      }
    }
  }
  else
  // 图片宽度 小于最小限制  w= 最小值 h 不不变
  if (arg.imgList[arg.index].msgBody.orgWidth <= imageWidthMin) {
    console.log('w 比 最小值还小 w=最小值 h 不变 ');
    if (arg.imgList[arg.index].msgBody.orgHeight > imageHightMax) {
      arg.imgList[arg.index].msgBody.height = imageHightMax
      mediaViewerWin.setSize(imageWidthMin + 20, imageHightMax + 86)
    } else if (arg.imgList[arg.index].msgBody.orgHeight >= imageHightMin && arg.imgList[arg.index].msgBody.orgHeight < imageHightMax) {
      mediaViewerWin.setSize(imageWidthMin + 20, arg.imgList[arg.index].msgBody.height + 86)
    } else {
      mediaViewerWin.setSize(imageWidthMin + 20, imageHightMin + 86)
    }
  }
  else
  // 图片的宽 在正常范围之内 还要比较高
  {
    if (arg.imgList[arg.index].msgBody.orgHeight >= imageHightMax) {
      console.log('w 正常 h 太大了 h/imageHightMax 宽需要缩放  ===>');
      radio = arg.imgList[arg.index].msgBody.orgHeight / imageHightMax
      const width = arg.imgList[arg.index].msgBody.orgWidth / radio
      // console.log('radio  w ===>', radio, width);
      arg.imgList[arg.index].msgBody.width = parseInt(width)
      console.log('arg.imgList[arg.index].msgBody.width  w ===>', arg.imgList[arg.index].msgBody.width);
      // arg.imgList[arg.index].msgBody.width = width
      arg.imgList[arg.index].msgBody.height = imageHightMax
      if (arg.imgList[arg.index].msgBody.orgWidth > imageWidthMin) {
        mediaViewerWin.setSize(arg.imgList[arg.index].msgBody.width + 20, imageHightMax + 86)
      } else {
        mediaViewerWin.setSize(imageWidthMin + 20, imageHightMax + 86)
      }

    } else if (arg.imgList[arg.index].msgBody.orgHeight <= imageHightMin) {
      console.log('w 正常 h 太小了 h不变  ===>');
      // arg.imgList[arg.index].msgBody.height = imageHightMin
      mediaViewerWin.setSize(arg.imgList[arg.index].msgBody.width + 20, arg.imgList[arg.index].msgBody.height + 86)
    } else {
      console.log('正常图片 ===>');
      mediaViewerWin.setSize(arg.imgList[arg.index].msgBody.width + 20, arg.imgList[arg.index].msgBody.height + 86)
    }
  }

  console.log('getSize ====>', mediaViewerWin.getSize());
  console.log('after orgwidth ===>', arg.imgList[arg.index].msgBody.orgWidth);
  console.log('after orgHeight ===>', arg.imgList[arg.index].msgBody.orgHeight);
  console.log('after width ===>', arg.imgList[arg.index].msgBody.width);
  console.log('after height ===>', arg.imgList[arg.index].msgBody.height);
  // 设置窗口的最小值
  mediaViewerWin.setMinimumSize(350, 416)
  // 设置窗口的最大值
  // mediaViewerWin.setMaximumSize(1318,690)
  // 设置窗口居中
  mediaViewerWin.center()

}


function initMediaViewerWin () {
  mediaViewerWin = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(`${__static}`, 'logo.png'), // eslint-disable-line
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      enableRemoteModule: true,//"electron": "^10.0.0",
      spellcheck: false,//Electron 9 及以上，默认启用拼写检查器
    },
    frame: true,
    show: false,
    backgroundColor: '#757575',
    titleBarStyle: 'hidden-inset',
    center: true
  });
  let winURL = `file://${__dirname}/index.html`;
  if (!app.isPackaged) {
    winURL = 'http://localhost:8083';
  }

  mediaViewerWin.loadURL(winURL + '/#/user/media');
  mediaViewerWin.on('close', e => {
    if (win && mediaViewerWin) {
      if (mediaViewerWin.isFullScreen()) {
        mediaViewerWin.setFullScreen(false)
      } else {
        mediaViewerWin.webContents.send('clearMedia');
      }
      isMediaWinFull = true
      e.preventDefault();
    }
  });

  // 退出全屏触发clear
  mediaViewerWin.on('leave-full-screen', () => {
    // 窗口是否处于正常状态
    if (isMediaWinFull) {
      let tiemrId = setTimeout(() => {
        mediaViewerWin.webContents.send('clearMedia');
        clearTimeout(tiemrId);
        tiemrId = null;
      }, 150)
    }
  });

  mediaViewerWin.on('closed', () => {
    mediaViewerWin = null;
    // console.log('mediaViewerWin closed');
    if (!closeWin) {
      // initMediaViewerWin();
    }
  });
  globalShortcut.register('CmdOrCtrl+Alt+Shift+I', () => {
    mediaViewerWin.webContents.openDevTools();
  });

  // 按esc退出全屏模式
  // globalShortcut.register('ESC', () => {
  //   isMediaWinFull = false
  //   mediaViewerWin.setFullScreen(false)
  // })
}
// 语音模块
// let audioWin;
// ipcMain.on('audio-window', (event, arg) => {
//   if (!audioWin) {
//     initAudioWin();

//     setTimeout(() => {
//       audioWin.webContents.send('loadAudio', arg);
//       audioWin.show();
//     }, 4000);
//   } else {
//     audioWin.webContents.send('loadAudio', arg);
//     setTimeout(() => {
//       audioWin.show();
//     }, 500);
//   }
// });
// function initAudioWin() {
//   audioWin = new BrowserWindow({
//     width: 300,
//     height: 450,
//     icon: `${__static}/logo.png`, // eslint-disable-line
//     webPreferences: {
//       nodeIntegration: true,
//       webSecurity: false,
//       enableRemoteModule: true,//"electron": "^10.0.0",
//       spellcheck: false,//Electron 9 及以上，默认启用拼写检查器
//     },
//     frame: false,
//     show: false,
//     titleBarStyle: 'hidden-inset',
//     resizable: false
//   });
//   let winURL = `file://${__dirname}/index.html`;
//   if (!app.isPackaged) {
//     winURL = 'http://localhost:8083';
//   }

//   audioWin.loadURL(winURL + '/#/user/audio');
//   audioWin.on('close', e => {
//     if (win && audioWin) {
//       audioWin.webContents.send('cancelAudioForceCloseWin');
//       e.preventDefault();
//     }
//   });
//   audioWin.on('closed', () => {
//     audioWin = null;
//   });
//   globalShortcut.register('CmdOrCtrl+Alt+Shift+O', () => {
//     audioWin.webContents.openDevTools();
//   });
// }

// ipcMain.on('audio-window-close', (event, arg) => {
//   win.webContents.send('audio-window-close', arg);
// });
// ipcMain.on('sendCall', (event, arg) => {
//   win.webContents.send('sendCall', arg);
// });
// ipcMain.on('acceptCall', (event, arg) => {
//   win.webContents.send('acceptCall', arg);
// });
// ipcMain.on('cancelCall', (event, arg) => {
//   win.webContents.send('cancelCall', arg);
// });
// ipcMain.on('leaveCall', (event, arg) => {
//   win.webContents.send('leaveCall', arg);
// });
// ipcMain.on('refuseCall', (event, arg) => {
//   win.webContents.send('refuseCall', arg);
// });
// ipcMain.on('overtimeCall', (event, arg) => {
//   win.webContents.send('overtimeCall', arg);
// });
// ipcMain.on('busyCall', (event, arg) => {
//   win.webContents.send('busyCall', arg);
// });
// ipcMain.on('suspendCall', (event, arg) => {
//   win.webContents.send('suspendCall', arg);
// });
// ipcMain.on('noNetworkCall', (event, arg) => {
//   win.webContents.send('noNetworkCall', arg);
// });
// ipcMain.on('audio-window-cancel-call', (event, arg) => {
//   if (audioWin) {
//     audioWin.webContents.send('cancelAudio', arg);
//   }
// });
// ipcMain.on('audio-window-accept-call', (event, arg) => {
//   if (audioWin) {
//     audioWin.webContents.send('acceptAudio', arg);
//   }
// });
// ipcMain.on('audio-window-refuse-call', (event, arg) => {
//   if (audioWin) {
//     audioWin.webContents.send('refuseAudio', arg);
//   }
// });
// ipcMain.on('audio-window-leave-call', (event, arg) => {
//   if (audioWin) {
//     audioWin.webContents.send('leaveAudio', arg);
//   }
// });
// ipcMain.on('audio-window-overtime-call', (event, arg) => {
//   if (audioWin) {
//     audioWin.webContents.send('overtimeAudio', arg);
//   }
// });
// ipcMain.on('audio-window-busy-call', (event, arg) => {
//   if (audioWin) {
//     audioWin.webContents.send('busyAudio', arg);
//   }
// });
// ipcMain.on('audio-window-suspend-call', (event, arg) => {
//   if (audioWin) {
//     audioWin.webContents.send('suspendAudio', arg);
//   }
// });
// ipcMain.on('audio-window-online', (event, arg) => {
//   audioWin && audioWin.webContents.send('onlineAudio', arg);
// });
// ipcMain.on('audio-window-offline', (event, arg) => {
//   audioWin && audioWin.webContents.send('offlineAudio', arg);
// });
// ipcMain.on('audio-window-socket-close', (event, arg) => {
//   audioWin && audioWin.webContents.send('socketCloseAudio', arg);
// });
// ipcMain.on('audio-window-connecting-call', (event, arg) => {
//   audioWin && audioWin.webContents.send('connectingAudio', arg);
// });
// ipcMain.on('audio-window-others-processing-call', (event, arg) => {
//   audioWin && audioWin.webContents.send('othersProcessingAudio', arg);
// });
ipcMain.on('group-appeal', () => {
  win.webContents.send('group-appeal');
});
ipcMain.on('group-exceed', () => {
  win.webContents.send('group-exceed');
});

function showWinByMessage () {
  if (timer) {
    clearInterval(timer);
    timer = null;
    count = 0;
    try {
      tray.setImage(path.join(`${__static}/`, 'logo.png')); // eslint-disable-line
    } catch (e) {
      log.warn(e);
    }
  }
  if (win) {
    // if (win.isMinimized()) win.restore();
    // if (!win.isVisible()) win.show();
    win.show();
    win.focus();
  }
}

function removeParametersAndCloseApp () {
  tray && tray.destroy();
  tray = null;
  win.destroy();
  win = null;
  closeWin = true;
  mediaViewerWin = null;
  // audioWin = null;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  quitApp();
}

function quitApp () {
  closeWin = true;
  app.quit();
}
// window 托盘退出
function handleQuitWin () {
  console.log('quit-win');
  // tray && tray.destroy();
  // tray = null;
  win.destroy();
  win = null;
  closeWin = true;
  mediaViewerWin = null;
  // audioWin = null;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  quitApp();
}
// 清除window托盘闪烁
function clearWinToggleTray () {
  if (timer) {
    clearInterval(timer);
    timer = null;
    count = 0;
    tray && tray.setImage(path.join(`${__static}/`, 'logo.png'))// eslint-disable-line
  }
}
function setMacOSBadge (sessionArr) {
  let unread = sum(sessionArr.map(o => o['unread']));
  let str = String(unread > 99 ? "99+" : unread <= 0 ? '' : unread);
  tray && tray.setTitle(str ? ` ${str}` : str, { fontType: "monospacedDigit" })
  app.dock.setBadge(str)
}

let exit = '退出应用',
  newMsg = '新消息',
  ignoreAll = '忽略全部';
ipcMain.on('trayLang', (event, arg) => {
  exit = arg.exit;
  newMsg = arg.newMsg;
  ignoreAll = arg.ignoreAll;
})

function checkTrayLeave(trayBrowserWindow) {
  clearInterval(leaveInter)
  leaveInter = setInterval(() => {
    let point = screen.getCursorScreenPoint();
    let { x, y, width, height } = tray.getBounds();
    if (!(x < point.x && y < point.y && point.x < (x + width) && point.y < (y + height))) {
      let menuBounds = trayBrowserWindow.getBounds()
      if (menuBounds.x < point.x &&
          menuBounds.y < point.y &&
          point.x < (menuBounds.x + menuBounds.width) &&
          point.y < (menuBounds.y + menuBounds.height)) {
        console.log('托盘窗口上');
        return;
      }
      clearInterval(leaveInter);
      isLeave = true;
      if (trayBrowserWindow.isVisible()) {
        trayBrowserWindow.hide();
      }
    } else {
      console.log('托盘上');
      // isLeave = true;
    }
  }, 300)
}
function handleWindowsTray() {
  const trayWindow = require("./window-tray");
  const wayPath = app.isPackaged ? 'logo.png' : `bundled/logo.png`;
  trayImage = nativeImage.createFromPath(path.join(app.getAppPath(), wayPath));
  trayImage.setTemplateImage(true);
  tray = new Tray(trayImage);
  let winURL = `file://${__dirname}/index.html`;
  if (!app.isPackaged) {
    winURL = 'http://localhost:8083';
  }
  trayBrowserWindow = new BrowserWindow({
    trayIconPath: wayPath,
    width: 100,
    height: 30,
    show: false,
    modal:true,
    autoHideMenuBar: true,
    frame: false,
    fullscreenable: false,
    resizable: false,
    useContentSize: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      backgroundThrottling: false,
      nodeIntegration: true,
      enableRemoteModule: true,
      spellcheck: false,
    }

  })
  trayBrowserWindow.loadURL(winURL + '/#/user/tray',)
  trayBrowserWindow.setMenu(null);
  trayWindow.setOptions({tray,window:trayBrowserWindow});

  const mouseMove = () => {
    if (trayMsgArr.length > 0) {
      tray && tray.setToolTip('');
    } else {
      tray && tray.setToolTip('DiDimessage');
    }
    if (isLeave) {
      isLeave = false;
      checkTrayLeave(trayBrowserWindow);
      if (!trayBrowserWindow.isVisible()&&trayMsgArr.length) {
        trayBrowserWindow.webContents.send("window-tray-data",{
          noNoticeFlagArr: trayMsgArr.slice(0, 5), newMsg, ignoreAll, exit});
        let width = trayMsgArr.length > 0 ? 222 : 100;
        let len = trayMsgArr.length > 5 ? 5 : trayMsgArr.length;
        let height = len > 0 ? (len + 2) * 42 : 30;
        trayWindow.setWindowSize({width, height,margin_x:0,margin_y:tray.getBounds().width});
        trayWindow.showWindow();
      }
    }
  }
  tray.setToolTip('DiDi');
  tray.on('mouse-move', mouseMove)
  trayBrowserWindow.on('hide', () => {
    tray&&tray.removeListener('mouse-move',mouseMove);
    tray&tray.on('mouse-move', mouseMove)
  });
  tray.on('right-click', () => {
    if (!didFinishedLoad) return;
    tray&&tray.removeListener('mouse-move',mouseMove);
    trayWindow.setWindowSize({width:100, height:30,margin_x:-100,margin_y:tray.getBounds().width});
    trayBrowserWindow.webContents.send("window-tray-data",{noNoticeFlagArr: [], newMsg, ignoreAll, exit});
    trayWindow.showWindow();
  });
  tray.on("click", () => {
    // 点击托盘图标时,如果有未读消息,则跳到第1条消息的对话框中
    /*if (trayMsgArr.length > 0) {
      await win && win.webContents.send('jump-to-chat-by-id', trayMsgArr[0].id);
      trayBrowserWindow.webContents.send("window-tray-data",trayMsgArr.slice(0, 5));
    }*/
    if (win) {
      showWinByMessage();
      win.webContents.send('jump-to-chat');
    }
  });
  // 跳转到会话页面
  ipcMain.on('to-chat-by-id', (e, id) => {
    if (win) {
      win.webContents.send('jump-to-chat-by-id', id);
      win.show();
    }
    trayBrowserWindow.hide();
  });
  // 忽略全部
  ipcMain.on('ignore-tray-data', (e) => {
    e.preventDefault();
    win && win.webContents.send('reset-all-session-unread', win.isMinimized() || !win.isVisible());
    trayBrowserWindow.hide();
    if (win.isMinimized()) {
      win.flashFrame(false);
    }
  });
  // 退出
  ipcMain.on('quit-app', () => {
    tray&&tray.removeListener('mouse-move',mouseMove);
    leaveInter&&clearInterval(leaveInter);
    if (trayBrowserWindow) {
      trayBrowserWindow && trayBrowserWindow.destroy();
      trayBrowserWindow = null;
    }
    if (win) {
      win.webContents.send('closeSocket');
      handleQuitWin();
    }
  });
}
