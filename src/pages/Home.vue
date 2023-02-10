<template>
  <div class="page-box" ref="wrapper">
    <van-overlay :show="overlayShow" />
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ loadText }}</van-loading>
    <div class="nav">
        <NavBar title="特殊辅助系统" :leftArrow="false" leftText="" />
    </div>
    <div class="content">
        <div class="content-top-area">
			<img :src="statusBackgroundPng" />
			<div class="content-top-content" @click="userInfoEvent">
				<div class="user-photo">
					<img :src="defaultPersonPng" />
				</div>
				<div class="user-message">
					<div class="user-name">
						{{ userInfo.name }}
					</div>
					<div class="account-name">
						{{ hospitalMessage.hospitalName }} {{ `${hospitalMessage.name}` }}
					</div>
				</div>
			</div>
		</div>
        <div class="task-board">
            <h2>任务看板</h2>
            <div class="subproject-list-box">
                <div class="subproject-list" v-for="(item,index) in cleaningManagementList" 
                    :key="index"
                    @click="taskBoardEvent(item,index)"
                >
                    <img :src="item.imgUrl" alt="">
                    <span>{{ item.name }}</span>
                </div> 
            </div>
        </div>
    </div>
  </div>
</template>
<script>
    import { base64ImgtoFile,imageToBase64, createImg } from "@/common/js/utils";
    import NavBar from "@/components/NavBar";
    import {
    } from '@/api/auxiliarySystem.js'
    import {
        mapGetters,
        mapMutations
    } from 'vuex'
    export default {
        name: 'Home',
        components: {
            NavBar
        },
        data() {
            return {
                overlayShow: false,
                loadingShow: false,
                loadText: '加载中',
                transferShow: true,
                cleaningManagementList: [
                    {
                        name: '考勤管理',
                        imgUrl: require("@/common/images/home/task-list.png")
                    },
                    {
                        name: '扫码巡查',
                        imgUrl: require("@/common/images/home/task-list.png")
                    },
                    {
                        name: '反馈意见',
                        imgUrl: require("@/common/images/home/task-list.png")
                    }
                ],
                defaultPersonPng: require("@/common/images/home/default-person.png"),
                statusBackgroundPng: require("@/common/images/home/status-background.png")
            }
        },

        mounted() {
            // 提供给原生app调用的方法
			let me = this;
            // 返回上一页
			window['returnMethod'] = () => {
				me.returnMethod()
			};

            // 查看巡查记录
			window['patrolRecordMethod'] = () => {
				me.patrolRecordMethod()
			};

            // 扫码回调和点击扫码方法
            window['scanValueCallback'] = (stringValue) => {
				me.scanValueCallback(stringValue)
			};

            // 拍照回调方法(点击拍照按钮后)
            window['startTakePhotosValueCallback'] = () => {
				me.startTakePhotosValueCallback()
			};

            // 拍照回调方法(图片转为base64后)
            window['takePhotosValueCallback'] = (stringValue) => {
				me.takePhotosValueCallback(stringValue)
			}
        },

        watch: {},

        computed: {
            ...mapGetters([
                'userInfo',
                'isLogin',
                'hospitalMessage',
                'scanPhotoAndroidMessage'
            ])
        },

        methods: {
            ...mapMutations([
                "storeScanPhotoAndroidMessage"
            ]),

            dropDownClick(e) {
		        console.log(e)
            },

            sureEvent (val) {
                console.log('确认值',val)
            },

            // 返回上一页
            returnMethod () {
                this.$router.push({ path: "/home"});
            },

            // 查看巡查记录
            patrolRecordMethod () {
                this.$router.push({ path: "/patrolRecords"})
            },

            // 扫码回调和点击扫码方法
            scanValueCallback (stringValue) {
                if (stringValue) {
                    try {
                        let temporaryMessage = this.scanPhotoAndroidMessage;
                        // 取扫码后的科室id
                        temporaryMessage['value'] = stringValue.split('|')[0];
                        temporaryMessage['isScanCode'] = true;
                        this.storeScanPhotoAndroidMessage(temporaryMessage);
                        this.$router.push({ path: "/submitRecords"})
                    } catch (err) {
                        this.$dialog
                        .alert({
                            message: `${err}`,
                            closeOnPopstate: true,
                        })
                        .then(() => {})
                    }
                } else {
                    this.$dialog
                    .alert({
                        message: "没有扫描到任何信息!",
                        closeOnPopstate: true,
                    })
                    .then(() => {});
                }
            },

            // 拍照回调方法(点击拍照按钮后)
            startTakePhotosValueCallback() {
                let temporaryMessage = this.scanPhotoAndroidMessage;
                temporaryMessage['isScanCode'] = false;
                temporaryMessage['overlayShow'] = true;
                temporaryMessage['loadingShow'] = true;
                temporaryMessage['isDisposeAndroidImg'] = false;
                temporaryMessage['loadText'] = '图片加载中...';
                this.storeScanPhotoAndroidMessage(temporaryMessage);
                this.$router.push({ path: "/submitRecords"})
            },

            // 拍照回调方法(照片已经转为base64)
            takePhotosValueCallback (stringValue) {
                if (stringValue) {
                    let temporaryMessage = this.scanPhotoAndroidMessage;
                    temporaryMessage['isScanCode'] = false;
                    temporaryMessage['value'] = base64ImgtoFile(stringValue);  //base64转换为file对象
                    temporaryMessage['overlayShow'] = false;
                    temporaryMessage['loadingShow'] = false;
                    temporaryMessage['isDisposeAndroidImg'] = true;
                    temporaryMessage['loadText'] = '';
                    this.storeScanPhotoAndroidMessage(temporaryMessage)
                } else {
                    this.$dialog
                    .alert({
                        message: "拍照无效!",
                        closeOnPopstate: true,
                    })
                    .then(() => {})
                }
            },


            // 头像点击事件
            userInfoEvent () {
                this.$router.push({path: '/myInfo'})
            },

            // 巡查任务点击事件
            taskBoardEvent (item, index) {
                if (item.name == '考勤管理') {
                    this.$router.push({path: '/attendanceStatistics'})
                } else if (item.name == '扫码巡查') {
                    // 跳到安卓扫码页面
                    window.android.openScanPage()
                }
            }
        }
    }
</script>
<style lang='less' scoped>
    @import "~@/common/stylus/variable.less";
    @import "~@/common/stylus/mixin.less";
    @import "~@/common/stylus/modifyUi.less";
    .page-box {
        background: #F8F8F8;
        .content-wrapper();
        .nav {
            position: fixed;
            width: 100%;
            top: 0;
            z-index: 10;
            left: 0;
            /deep/ .van-nav-bar {
                .van-nav-bar__left {
                    .van-nav-bar__text {
                        color: #fff !important;
                        margin-left: 8px !important;
                    }
                }
                .van-nav-bar__title {
                    color: #fff !important;
                    font-size: 18px !important;
                    font-weight: bold
                }
            }
        };
        .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            .content-top-area {
                position: relative;
                width: 100%;
                margin: 0 auto;
                height: 189px;
                > img {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                }
                .content-top-content {
                    width: 95%;
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    height: 125px;
                    margin: 0 auto;
                    top: 80px;
                    border-radius: 10px;
                    display: flex;
                    flex-flow: row nowrap;
                    align-items: center;
                    background: #fff;
                    box-shadow: 0px 2px 8px -1px rgba(11, 64, 173, 0.31);
                    .user-photo {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 85px;
                        margin: 0 20px;
                        height: 85px;
                        border-radius: 50%;
                        z-index: 1000;
                        img {
                            vertical-align: middle;
                            width: 85px;
                            height: 85px;
                        }
                    };
                    .user-message {
                        z-index: 100;
                        color: #101010;
                        flex: 1;
                        .user-name {
                            width: 98%;
                            word-break: break-all;
                            font-size: 16px;
                        }
                        .account-name {
                            width: 98%;
                            word-break: break-all;
                            font-size: 14px;
                            margin-top: 20px;
                            color: #BEC7D1
                        }
                    }
                }
            };
           .task-board {
                width: 95%;
                height: 184px;
                background: #fff;
                border-radius: 8px;
                margin: 0 auto;
                margin-top: 40px;
                padding: 10px 12px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                justify-content: center;
                h2 {
                    width: 100%;
                    height: 24px;
                    font-size: 16px;
                    color: #242424;
                    font-weight: bold;
                };
                .subproject-list-box {
                    width: 100%;
                    display: flex;
                    height: 100px;
                    .subproject-list {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: flex-start;
                        >img {
                            width: 50px;
                            height: 50px;
                            margin-left: 6px;
                        };
                        >span {
                            margin-top: 10px;
                            font-size: 16px;
                            color: #101010
                        }
                    }
                }
            }
        }
    }
</style>