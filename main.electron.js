const { app, BrowserWindow,ipcMain } = require('electron')
function getParam() {
  let param = {
    'BIN_PATH': '',
    'APP_PATH': '',
    'TRTC_ENV': 'production',
  };
  let tmp = Array.from(process.argv);
  param.BIN_PATH = tmp[0];
  param.APP_PATH = tmp[1];
  tmp.forEach((value, index)=>{
    if (index <=1) return;
    let splitValue = value.split('=');
    let key = splitValue[0].replace(/--/g, '').replace(/\s/g, '').toUpperCase();
    let val = splitValue[1].replace(/\s/g, '');
    if ( typeof param[key] !== 'undefined') {
      param[key] = val;
    }
  });
  return param;
}
let param = getParam();
console.log('electron param:', param);
let portStart = 8080;
function gerServer() {
  return `http://localhost:${portStart}`;
}
let win,child;
function createWindow () {
  // 创建浏览器窗口
  win = new BrowserWindow({
    width: 1366,
    height: 1024,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        nodeIntegrationInSubFrames: true,
        allowRunningInsecureContent: true,
        defaultEncoding: 'UTF-8'
        // ,preload: path.join(__dirname, 'preload.js')
    }
  });
  app.allowRendererProcessReuse = true;
  win.webContents.openDevTools();

  win.on("move", ()=>{
    let parentPostion = win.getPosition();
    if(child) {
      child.setPosition(parseInt(parentPostion[0])+100, parseInt(parentPostion[1]) + 100);
    }
  });

  // 在执行 npm run start 后，经常会窗口已经显示出来了，但代码还未构建好，此时捕获到 did-fail-load 事件，在之后延迟重载 
  win.webContents.on('did-fail-load', function(){
     console.log(`createWindow: did-fail-load, reload ${param.TRTC_ENV} soon...`);
     setTimeout(()=>{
      win.reload();
     },1000);
  });
  if (param.TRTC_ENV === 'production') {
    win.loadFile('dist/index.html');
  } else {
    win.loadURL(gerServer());
  }
  
}
function createChildWin(){
    child = new BrowserWindow({
        width: 800,
        height: 800,
        show: true,
        parent: win,
        title: '子窗口',
        useContentSize :true,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            nodeIntegrationInSubFrames: true,
            allowRunningInsecureContent: true,
            defaultEncoding: 'UTF-8'
        }
    })
    child.webContents.openDevTools();

    child.loadFile("./public/zrender.html");
    child.on("show", ()=>{
      alert(1);
    });
    child.setPosition(win.getPosition()[0] + 100, win.getPosition()[1] + 100);
}

ipcMain.on('rendererMsg', (event, argv)=>{
  event.reply('main_replay', 'pong');
  createChildWin();
});

app.whenReady().then(createWindow);
