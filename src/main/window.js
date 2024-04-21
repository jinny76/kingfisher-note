import { app, BrowserWindow, ipcMain, Menu, Tray } from "electron";
import path, { join } from "path";
import icon from "../../resources/icon.png";

// 新建窗口时可以传入的一些options配置项
export const windowsCfg = {
  id: null, //唯一 id
  title: "", //窗口标题
  width: null, //宽度
  height: null, //高度
  minWidth: null, //最小宽度
  minHeight: null, //最小高度
  route: "", // 页面路由 URL '/manage?id=123'
  resizable: true, //是否支持调整窗口大小
  maximize: false, //是否最大化
  backgroundColor: "#eee", //窗口背景色
  data: null, //数据
  isMultiWindow: false, //是否支持多开窗口 (如果为 false，当窗体存在，再次创建不会新建一个窗体 只 focus 显示即可，，如果为 true，即使窗体存在，也可以新建一个)
  isMainWin: false, //是否主窗口(当为 true 时会替代当前主窗口)
  parentId: null, //父窗口 id  创建父子窗口 -- 子窗口永远显示在父窗口顶部 【父窗口可以操作】
  modal: false, //模态窗口 -- 模态窗口是禁用父窗口的子窗口，创建模态窗口必须设置 parent 和 modal 选项 【父窗口不能操作】
};

/**
 * 窗口配置
 */
export class Window {
  main = null;
  group = {};
  tray = null;

  constructor() {
    this.main = null; //当前页
    this.group = {}; //窗口组
    this.tray = null; //托盘
  }

  // 窗口配置
  winOpts(options) {
    console.log("窗口配置", options);
    return {
      width: options.width || 800,
      height: options.height || 600,
      alwaysOnTop: options.alwaysOnTop,
      fullscreenable:true,
      simpleFullscreen:true,
      autoHideMenuBar: true,
      show: false,
      ...(process.platform === 'linux' ? { icon } : {icon}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'), //预加载脚本
        sandbox: false
      },
      focusable:true
    };
  }

  // 获取窗口
  getWindow(id){
    return BrowserWindow.fromId(id);
  }

  findWindowByRoute(route) {
    for (let i in this.group) {
      if (
        this.getWindow(Number(i)) &&
        this.group[i].route.startsWith(route) &&
        !this.group[i].isMultiWindow
      ) {
        return this.getWindow(Number(i));
      }
    }

    return null;
  }

  // 创建窗口
  createWindows(options) {
    let args = Object.assign({}, windowsCfg, options);
    // 判断窗口是否存在
    for (let i in this.group) {
      if (
        this.getWindow(Number(i)) &&
        this.group[i].route === args.route &&
        !this.group[i].isMultiWindow
      ) {
        console.log("窗口已经存在了");
        let window = this.getWindow(Number(i));
        window.restore();
        window.focus();
        return;
      }
    }
    // 创建 electron 窗口的配置参数
    let opt = this.winOpts(args);
    // 判断是否有父窗口
    if (args.parentId) {
      console.log("parentId：" + args.parentId);
      opt.parent = this.getWindow(args.parentId); // 获取主窗口
    } else if (this.main) {
      console.log('当前为主窗口');
    } // 还可以继续做其它判断

    // 根据传入配置项，修改窗口的相关参数
    opt.modal = args.modal;
    opt.resizable = args.resizable; // 窗口是否可缩放
    if (args.backgroundColor) opt.backgroundColor = args.backgroundColor; // 窗口背景色
    if (args.minWidth) opt.minWidth = args.minWidth;
    if (args.minHeight) opt.minHeight = args.minHeight;


    let win = new BrowserWindow(opt);
    if (args.alwaysOnTop) {
      win.setAlwaysOnTop(true, "screen-saver");
    }
    console.log("窗口 id：" + win.id);
    this.group[win.id] = {
      route: args.route,
      isMultiWindow: args.isMultiWindow,
    };
    // 是否最大化
    if (args.maximize && args.resizable) {
      win.maximize();
    }
    // 是否主窗口
    if (args.isMainWin) {
      if (this.main) {
        console.log("主窗口存在");
        delete this.group[this.main.id];
        this.main.close();
      }
      this.main = win;
    }
    args.id = win.id;
    win.on("close", () => win.setOpacity(0));


    // 打开网址（加载页面）
    let winURL;
    if (app.isPackaged) {
      winURL = args.route
        ? `${path.join(__dirname, '../renderer/index.html#')}${args.route}`
        : path.join(__dirname, '../renderer/index.html');
    } else {
      winURL = args.route
        ? `${process.env['ELECTRON_RENDERER_URL']}/#${args.route}?winId=${args.id}`
        : `${process.env['ELECTRON_RENDERER_URL']}/#?winId=${args.id}`;
    }
    console.log("新窗口地址:", winURL);
    win.loadURL(winURL);

    win.once("ready-to-show", () => {
      win.maximize();
      win.show();
    });
  }


  // 创建托盘
  createTray() {
    console.log("创建托盘");
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "显示",
        click: () => {
          this.main.restore()
          this.main.focus()
        },
      },
      {
        type: "separator", // 分割线
      },
      // 菜单项
      {
        label: "退出",
        role: "quit"
      },
    ]);
    this.tray = new Tray(path.join(__dirname, "../../resources/icon.ico")); // 图标
    // 点击托盘显示窗口
    this.tray.on("click", () => {
      this.main.restore()
      this.main.focus()
    });
    // 处理右键
    this.tray.on("right-click", () => {
      this.tray?.popUpContextMenu(contextMenu);
    });
    this.tray.setToolTip("翠鸟笔记");
  }


  // 开启监听
  listen() {
    // 固定
    ipcMain.on('pinUp', (event, winId) => {
      event.preventDefault();
      if (winId && (this.main).id == winId) {
        let win = this.getWindow(this.main.id);
        if (win.isAlwaysOnTop()) {
          win.setAlwaysOnTop(false); // 取消置顶
        } else {
          win.setAlwaysOnTop(true); // 置顶
        }
      }
    })


    // 隐藏
    ipcMain.on("window-hide", (event, winId) => {
      if (winId) {
        this.getWindow(Number(winId)).hide();
      } else {
        for (let i in this.group) {
          if (this.group[i]) this.getWindow(Number(i)).hide();
        }
      }
    });


    // 显示
    ipcMain.on("window-show", (event, winId) => {
      if (winId) {
        this.getWindow(Number(winId)).show();
      } else {
        for (let i in this.group) {
          if (this.group[i]) this.getWindow(Number(i)).show();
        }
      }
    });


    // 最小化
    ipcMain.on("mini", (event, winId) => {
      console.log("最小化窗口 id", winId);
      if (winId) {
        this.getWindow(Number(winId)).minimize();
      } else {
        for (let i in this.group) {
          if (this.group[i]) {
            this.getWindow(Number(i)).minimize();
          }
        }
      }
    });


    // 最大化
    ipcMain.on("window-max", (event, winId) => {
      if (winId) {
        this.getWindow(Number(winId)).maximize();
      } else {
        for (let i in this.group)
          if (this.group[i]) this.getWindow(Number(i)).maximize();
      }
    });


    // 创建窗口
    ipcMain.on("window-new", (event, args) => this.createWindows(args));
  }
}
