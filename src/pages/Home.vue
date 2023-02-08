<template>
  <div class="page-box" ref="wrapper">
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

            // 点击拍照方法
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
                        this.$toast({
                            message: `${err}`,
                            type: 'fail'
                        })
                    }
                } else {
                    this.$toast({
                        message: '没有扫描到任何信息!',
                        type: 'fail'
                    })
                }
            },

            // 点击拍照方法
            takePhotosValueCallback (stringValue) {
                if (stringValue) {
                    let temporaryMessage = this.scanPhotoAndroidMessage;
                    temporaryMessage['value'] = base64ImgtoFile(createImg(stringValue)); //安卓传的base64图片转换为file对象
                    this.$dialog
          .alert({
            message: `${base64ImgtoFile(createImg(stringValue))}`,
            closeOnPopstate: true,
          })
          .then(() => {});
                    temporaryMessage['isScanCode'] = false;
                    this.storeScanPhotoAndroidMessage(temporaryMessage);
                    this.$router.push({ path: "/submitRecords"})
                } else {
                    this.$toast({
                        message: '拍照无效!',
                        type: 'fail'
                    })
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