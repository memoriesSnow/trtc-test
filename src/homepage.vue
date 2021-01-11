<template>
    <div class="homepage">
        <p class="title">TRTC-electron-sdk测试</p>
        <div class="container">
            <div class="toolbar">
                <button @click ="startPlay()">开始播放</button>
                <div class="cameraList">
                    设备选择:
                    <div class="checkout" v-for="(item,index) in cameraList" :key="index" @click="setCamera(item.deviceId)">
                        {{ item.deviceName }}
                    </div>
                </div>
                <button @click ="enterRoom()">进入房间</button>
                <button @click ="getScreenCaptureSources()">获取屏幕分享列表</button>
                <button @click ="shareLocalScreen()">屏幕分享</button>
            </div>
            <div id="video_con">

            </div>
            <div id="share_con">

            </div>
            <div class="title">测试用红字</div>
        </div>
    </div>
</template>
<script>
import TRTCCloud from 'trtc-electron-sdk'
import { Rect,TRTCParams,TRTCAppScene } from 'trtc-electron-sdk/liteav/trtc_define'
import './common/test.css'
// import rand from './common/rand'
console.log(TRTCCloud)

const { remote } = window.require('electron')
// console.info(window.require('electron').getCurrentWindow())
// const BrowserWindow = remote.BrowserWindow
const { ipcRenderer } = window.require('electron');
console.log(remote);

export default {
    data(){
        return{
            trtcCloud:'',
            login_info:{
                sdkAppId:0,
                userId:'',
                userSig:'',
                roomId:0,
                role:'TRTCRoleAnchor',
                userDefineRecordId:'aaaaa'
            },
            videoContainer:'',
            cameraList:[],
            shareScreen:[],
        }
    },
    methods:{
        initLoginInfo(){
            this.login_info = new TRTCParams()
            this.login_info.sdkAppId = 1400208971;
            this.login_info.roomId = 786;
            this.login_info.userId = "xwltest";
            this.login_info.userSig = "eJw1js0KgkAYRd9lthNyZzD-oFVpVrao1NaBk3ykMejQCNG7J1rLey4Hzpvl2cVRg6ZOsUguQwlgMcGX6ljEpAM277563LSmikXCBSSC0BfzQ5V6GrrTJAy2Mao3f4nqkSV7N9Zr5IeUXwuboObttuGnY1fuWrtBduaF9tPCK*N49RMNtWOQ8BC6AvCDzxdc8DDb";
        },
        enterRoom(){
            console.log(this.login_info)
            this.trtcCloud.enterRoom(this.login_info,TRTCAppScene.TRTCAppSceneLIVE)
            console.log('enterroom')
        },
        startPlay(){
            let id = 'video_container';
            let view = document.getElementById(id)
            if(!view){
                view = document.createElement('div');
                view.id = id;
                view.className = 'local-video-container';
                this.videoContainer.appendChild(view);
            }
            this.trtcCloud.startLocalPreview(view);
            this.trtcCloud.startLocalAudio();
        },
        getCameraList(){
            this.cameraList = this.trtcCloud.getCameraDevicesList()
        },
        setCamera(cameraId){
            this.trtcCloud.setCurrentCameraDevice(cameraId)
            console.log(cameraId);
            console.log(1);
        },
        getScreenCaptureSources(){
            this.shareScreen = this.trtcCloud.getScreenCaptureSources(320,180,160,90)
            console.log(this.shareScreen);
        },
        shareLocalScreen(){
            let id = 'share_container';
            let view = document.getElementById(id)
            if(!view){
                view = document.createElement('div');
                view.id = id;
                view.className = 'local-video-container';
                this.shareContainer.appendChild(view);
            }
            let childWin = this.shareScreen.filter(item=>{
                return item.sourceName =='子窗口'
            })
            if(childWin.length > 0){
                var childWin_id = childWin[0].sourceId;
                var childWin_name = childWin[0].sourceName;
                var childWin_type = childWin[0].type;
            }

            let bigWin = this.shareScreen.filter(item=>{
                return item.sourceName =='12.30app'
            })
            let bigWin_id = bigWin[0].sourceId;
            let bigWin_name = bigWin[0].sourceName;
            let bigWin_type = bigWin[0].type;
            console.log(childWin)
            console.log(bigWin) 

            let rect = new Rect()
            rect.top = 0
            rect.left = 0
            rect.right = 0
            rect.bottom = 0 
            let rect1 = new Rect()
            rect1.top = 100
            rect1.left = 100
            rect1.right = 300
            rect1.bottom = 300
            if(childWin.length > 0){
                this.trtcCloud.selectScreenCaptureTarget(childWin_type,childWin_id,childWin_name,rect,false,false)
                this.trtcCloud.startScreenCapture(view,0,null); 
            } else {
                this.trtcCloud.selectScreenCaptureTarget(bigWin_type,bigWin_id,bigWin_name,rect1,false,false)
                this.trtcCloud.startScreenCapture(view,0,null);
            }
        },
        createChildWin(){
            console.info(ipcRenderer, "》》》》》》》》》》")
            ipcRenderer.on("main_replay", (event, argv)=>{
                console.info(argv);
                // alert(argv);
            });
            ipcRenderer.send('rendererMsg', "ping");
        },
        onEnterRoom(result){
            if ( result > 0 ) {
                console.log(`onEnterRoom，进房成功，使用了 ${result} 毫秒`);
            } else {
                console.warn(`onEnterRoom: 进房失败 ${result}`);
            }
            console.log('onenterRoom触发了')
        },
        handleEvents(){
            
        }
    },
    mounted(){
        this.trtcCloud = new TRTCCloud()
        this.videoContainer = document.querySelector('#video_con')
        this.shareContainer = document.querySelector('#share_con')

        this.initLoginInfo()
        this.getCameraList()
        this.createChildWin()
        this.handleEvents()
        this.trtcCloud.on('onEnterRoom',this.onEnterRoom)
        this.trtcCloud.on('onError',(errcode, errmsg) => {
            console.info('trtc_demo: onError :' + errcode + " msg" + errmsg);
        })
        this.trtcCloud.on('onWarning',()=>{console.warn('warn')})
    }
}
</script>
<style lang="less">
*{
    margin:0;
    padding:0;
}
.homepage{
    background:#fac;
    width:100%;
    height:100vh;
    display:flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .title{
        width:100%;
        height:100px;
        line-height:100px;
        background:#aa2233;
        text-align:center;
    }
    .container{
        height:calc( 100% - 100px );
        width:100%;
        background:#339;
        .toolbar{
            padding:30px;
            background:yellow;
            display:flex;
            justify-content: flex-start;
            button{
                padding:5px 10px;
                background:red;
                color:white;
                font-size:14px;
                letter-spacing: 2px;
                outline:none;
                border:solid 1px;
                border-radius:10px;
                height:100%;
            }
            .cameraList{
                padding:5px 10px;
                .checkout{
                    color:#fff;
                    padding:3px;
                    background:#339;
                    margin-top:5px;
                }
            }
        }
        .video_con{
            height:50%;
            width:80%;
        }
    }
}
</style>