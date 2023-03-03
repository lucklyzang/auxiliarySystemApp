<template>
  <div class="page-box" ref="wrapper">
    <van-overlay :show="overlayShow" />
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ loadText }}</van-loading>
    <div class="nav">
      <NavBar path="/scanQRCode" :title="currentTitle" />
    </div>
    <div class="content">
      <div class="location-box" v-if="isShowLocation">
        <van-icon name="location" color="#1864FF" size="25" />
        <span>{{ departmentName ? departmentName : '无' }}</span>
      </div>
      <div class="result-picture">
        <div>
          图片
        </div>
        <div class="image-list">
          <div v-for="(item, index) in resultImgList" :key="index">
            <img :src="item" />
            <div class="icon-box"  @click="issueDelete(index)">
                <van-icon
                name="delete"
                color="#d70000"
                />
            </div>    
          </div>
          <div @click="issueClickEvent">
            <van-icon name="plus" size="30" color="#101010" />
          </div>
        </div>
      </div>
      <div class="category-box">
        <div class="category-title">
          <span>*</span>
          <span>类别</span>
        </div>
        <div class="radio-box">
          <van-radio-group v-model="radioValue" direction="horizontal">
            <van-radio name="1">日常记录</van-radio>
            <van-radio name="2">问题记录</van-radio>
          </van-radio-group>
        </div>
      </div>
      <div class="enter-remark">
        <div>
          备注
        </div>
        <div class="remark-box">
          <van-field
            v-model="enterRemark"
            rows="3"
            autosize
            type="textarea"
            placeholder="请输入备注"
          />
        </div>
      </div>
    </div>
    <div class="task-start" @click="submitEvent">提交</div>
    <transition name="van-slide-up">
      <div class="choose-photo-box" v-show="photoBox">
        <div class="choose-photo">
          <van-icon name="photo" />
          <input
            name="uploadImg1"
            id="demo1"
            @change="previewFileOne"
            type="file"
            accept="image/album"
          />从图库中选择
        </div>
        <div class="photo-graph">
          <van-icon name="photograph" />
          <input
            name="uploadImg2"
            id="demo2"
            @change="previewFileTwo"
            type="file"
            accept="image/camera"
          />拍照
        </div>
        <div class="photo-cancel" @click="photoCancel">取消</div>
      </div>
    </transition>
    <van-dialog v-model="deleteInfoDialogShow" title="确定删除此图片?" 
      confirm-button-color="#218FFF" show-cancel-button
      @confirm="sureDeleteEvent"
      >
    </van-dialog>
  </div>
</template>
<script>
import NavBar from "@/components/NavBar";
import {addPatrolRecords} from "@/api/auxiliarySystem.js";
import { mapGetters, mapMutations } from "vuex";
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction';
import { compress,base64ImgtoFile,IsPC } from "@/common/js/utils";
import {getAliyunSign} from '@/api/login.js'
import axios from 'axios'
export default {
  name: "SubmitRecords",
  components: {
    NavBar,
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      photoBox: false,
      isShowLocation: false,
      imgIndex: '',
      currentTitle: '',
      radioValue: '1',
      deleteInfoDialogShow: false,
      overlayShow: false,
      loadingShow: false,
      loadText: '创建中',
      isExpire: false,
      departmentName: '',
      enterRemark: "",
      resultImgList: [],
      imgOnlinePathArr: []
    }
  },

  mounted() {
    // 控制设备物理返回按键
    if (!IsPC()) {
      let that = this;
      pushHistory();
      that.gotoURL(() => {
        pushHistory();
        if (that.scanPhotoAndroidMessage['isScanCode']) {
          // 跳到扫码界面
          window.android.openScanPage()
        } else if (!that.scanPhotoAndroidMessage['isScanCode']) {
          // 跳到拍照界面
          window.android.openPhotographPage()
        }
      })
    };

    let me = this;
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
    };

    this.commonDisposeMethod()
  },

  watch: {},

  computed: {
    ...mapGetters(["userInfo","timeMessage","ossMessage","scanPhotoAndroidMessage","departmentsMessage"]),
  },

  methods: {
    ...mapMutations(["changeTimeMessage","changeOssMessage","storeScanPhotoAndroidMessage"]),

    // 公共处理方法
    commonDisposeMethod () {
      try {
        if (this.scanPhotoAndroidMessage['isScanCode']) {
          this.currentTitle = '扫码详情';
          this.isShowLocation = true;
          this.resultImgList = [];
          this.departmentName = this.departmentsMessage.filter((item) => { return item.id == this.scanPhotoAndroidMessage['value']})[0]['name'];
        } else if (!this.scanPhotoAndroidMessage['isScanCode']) {
          this.currentTitle = '拍照详情';
          this.isShowLocation = false;
          this.overlayShow = this.scanPhotoAndroidMessage['overlayShow'];
          this.loadingShow = this.scanPhotoAndroidMessage['loadingShow'];
          this.loadText = this.scanPhotoAndroidMessage['loadText'];
          // 接受并处理安卓传过来的图片文件流
          if (this.scanPhotoAndroidMessage['isDisposeAndroidImg']) {
            this.resultImgList = [];
            this.disposeAndroidFile(this.scanPhotoAndroidMessage['value'])
          }
        }
      } catch(err) {
        // this.$dialog
        // .alert({
        //   message: `${err}`,
        //   closeOnPopstate: true,
        // })
        // .then(() => {})
      }  
    },


    // 扫码回调和点击扫码方法
    scanValueCallback (stringValue) {
        if (stringValue) {
          let temporaryMessage = this.scanPhotoAndroidMessage;
          // 取扫码后的科室id
          temporaryMessage['value'] = stringValue.split('|')[0];
          temporaryMessage['isScanCode'] = true;
          this.storeScanPhotoAndroidMessage(temporaryMessage);
          this.$router.push({ path: "/submitRecords"});
          this.commonDisposeMethod()
        } else {
          this.$dialog
          .alert({
              message: '没有扫描到任何信息!',
              closeOnPopstate: true,
          })
          .then(() => {})
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
      this.$router.push({ path: "/submitRecords"});
      this.commonDisposeMethod()
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
        this.storeScanPhotoAndroidMessage(temporaryMessage);
        this.commonDisposeMethod()
      } else {
        this.$dialog
        .alert({
            message: "拍照无效!",
            closeOnPopstate: true,
        })
        .then(() => {})
      }
    },

    // 任务提交事件
    async submitEvent() {
      this.loadText ='提交中';
      this.overlayShow = true;
      this.loadingShow = true;
      // 上传图片到阿里云服务器
      if (this.resultImgList.length > 0) {
        for (let imgI of this.resultImgList) {
          if (Object.keys(this.timeMessage).length > 0) {
            // 判断签名信息是否过期
            if (new Date().getTime()/1000 - this.timeMessage['expire']  >= -30) {
              await this.getSign();
              await this.uploadImageToOss(imgI)
            } else {
              await this.uploadImageToOss(imgI)
            }
          } else {
            await this.getSign();
            await this.uploadImageToOss(imgI)
          }
        };
        // 添加巡查记录
        addPatrolRecords({
          workerId: this.userInfo.id, //当前登陆员工id
          workerName: this.userInfo.name, //当前登陆员工姓名
          depId: this.scanPhotoAndroidMessage['isScanCode'] ? this.scanPhotoAndroidMessage['value'] ? this.scanPhotoAndroidMessage['value'] : '' : '', // 当前科室id
          type: this.radioValue,   // 类别 1-日常记录，2-问题记录'
          remark: this.enterRemark,  // 备注
          system: 5,   // 系统类型  固定传 5
          depName: this.scanPhotoAndroidMessage['isScanCode'] ? this.departmentName ? this.departmentName : '' : '', // 当前科室名称
          createName: this.userInfo.name, //当前登陆员工姓名
          imgPath: this.imgOnlinePathArr, //已上传到阿里云的图片地址
          modifyName: this.userInfo.name // 修改者 非必输
        })
        .then((res) => {
          this.overlayShow = false;
          this.loadingShow = false;
          this.loadText ='';
          if (res && res.data.code == 200) {
            this.$router.push({path: '/submitSuccessfully'})
          } else {
            this.$toast({
              message: `${res.data.msg}`,
              type: 'fail'
            })
          }
        })
        .catch((err) => {
          this.overlayShow = false;
          this.loadingShow = false;
          this.loadText ='';
          this.$toast({
            message: `${err}`,
            type: 'fail'
          })
        })
      } else {
        addPatrolRecords({
          workerId: this.userInfo.id, //当前登陆员工id
          workerName: this.userInfo.name, //当前登陆员工姓名
          depId: this.scanPhotoAndroidMessage['isScanCode'] ? this.scanPhotoAndroidMessage['value'] ? this.scanPhotoAndroidMessage['value'] : '' : '', // 当前科室id
          type: this.radioValue,   // 类别 1-日常记录，2-问题记录'
          remark: this.enterRemark,  // 备注
          system: 5,   // 系统类型  固定传 5
          depName: this.scanPhotoAndroidMessage['isScanCode'] ? this.departmentName ? this.departmentName : '' : '', // 当前科室名称
          createName: this.userInfo.name, //当前登陆员工姓名
          imgPath: [], //已上传到阿里云的图片地址
          modifyName: this.userInfo.name // 修改者 非必输
        })
        .then((res) => {
          this.overlayShow = false;
          this.loadingShow = false;
          this.loadText ='';
          if (res && res.data.code == 200) {
            this.$router.push({path: '/submitSuccessfully'})
          } else {
            this.$toast({
              message: `${res.data.msg}`,
              type: 'fail'
            })
          }
        })
        .catch((err) => {
          this.overlayShow = false;
          this.loadingShow = false;
          this.loadText ='';
          this.$toast({
            message: `${err}`,
            type: 'fail'
          })
        })
      }
       
    },


    // 图片上传预览
    previewFileOne() {
      let file = document.getElementById("demo1").files[0];
      console.log('图片文件流',file);
      let _this = this;
      let reader = new FileReader();
      let isLt2M = file.size / 1024 / 1024 < 16;
      if (!isLt2M) {
        this.$dialog
          .alert({
            message: "上传图片大小不能超过16MB!",
            closeOnPopstate: true,
          })
          .then(() => {});
        return;
      }
      reader.addEventListener(
        "load",
        function () {
          // 压缩图片
          let result = reader.result;
          let img = new Image();
          img.src = result;
          img.onload = function () {
            let src = compress(img);
             console.log('压缩后的路劲',src);
            _this.resultImgList.push(src);
            _this.photoBox = false;
            _this.overlayShow = false
          };
        },
        false
      );
      if (file) {
        reader.readAsDataURL(file);
      }
    },

    // 处理安卓传过来的图片流对象
    disposeAndroidFile(file) {
      let _this = this;
      let reader = new FileReader();
      let isLt2M = file.size / 1024 / 1024 < 16;
      if (!isLt2M) {
        this.$dialog
          .alert({
            message: "上传图片大小不能超过16MB!",
            closeOnPopstate: true,
          })
          .then(() => {});
        return;
      };
      reader.addEventListener(
        "load",
        function () {
          // 压缩图片
          let result = reader.result;
          let img = new Image();
          img.src = result;
          img.onload = function () {
            let src = compress(img);
            _this.resultImgList.push(src)
          }
        },
        false
      );
      if (file) {
        reader.readAsDataURL(file);
      }
    },

    //拍照预览
    previewFileTwo() {
      let file = document.getElementById("demo2").files[0];
      let _this = this;
      let reader = new FileReader();
      let isLt2M = file.size / 1024 / 1024 < 16;
      if (!isLt2M) {
        _this.$dialog
          .alert({
            message: "上传图片大小不能超过16MB!",
            closeOnPopstate: true,
          })
          .then(() => {});
        return;
      }
      reader.addEventListener(
        "load",
        function () {
          // 压缩图片
          let result = reader.result;
          let img = new Image();
          img.src = result;
          img.onload = function () {
            let src = compress(img);
            _this.resultImgList.push(src);
            _this.photoBox = false;
            _this.overlayShow = false
          };
        },
        false
      );
      if (file) {
        reader.readAsDataURL(file);
      }
    },

    // 获取阿里云签名接口
			getSign (filePath = '') {
				return new Promise((resolve, reject) => {
					getAliyunSign().then((res) => {
						if (res && res.data.code == 200) {
							// 存储签名信息
							this.changeOssMessage(res.data.data);
							let temporaryTimeInfo = {};
							temporaryTimeInfo['expire'] = Number(res.data.data.expire);
							// 存储过期时间信息
							this.changeTimeMessage(temporaryTimeInfo);
							if (this.isExpire) {
								this.uploadImageToOss(filePath)
							};
							this.isExpire = false;
							resolve()
						} else {
              this.overlayShow = false;
              this.loadingShow = false;
							this.$toast({
								message: `${res.data.msg}`,
								type: 'fail'
							});
							reject()
						}
					})
					.catch((err) => {
            this.overlayShow = false;
            this.loadingShow = false;
            this.$toast({
              message: `${err}`,
              type: 'fail'
            });
						reject()
					})
				})	
			},
			
			// 上传图片到阿里云服务器
			uploadImageToOss (filePath) {
				return new Promise((resolve, reject) => {
          // OSS地址
          const aliyunServerURL = this.ossMessage.host;
          // 存储路径(后台固定位置+随即数+文件格式)
          const aliyunFileKey = this.ossMessage.dir + new Date().getTime() + Math.floor(Math.random() * 100) + base64ImgtoFile(filePath).name;
          // 临时AccessKeyID0
          const OSSAccessKeyId = this.ossMessage.accessid;
          // 加密策略
          const policy = this.ossMessage.policy;
          // 签名
          const signature = this.ossMessage.signature;
          let formData = new FormData();
          formData.append('key',aliyunFileKey);
          formData.append('policy',policy);
          formData.append('OSSAccessKeyId',OSSAccessKeyId);
          formData.append('success_action_status','200');
          formData.append('Signature',signature);
          formData.append('file',base64ImgtoFile(filePath));
          axios({
            url: aliyunServerURL,
            method: 'post',
            data: formData,
            headers: {'Content-Type': 'multipart/form-data'}
          }).then((res) => {
            this.imgOnlinePathArr.push(`${aliyunServerURL}/${aliyunFileKey}`);
            resolve();
            console.log('阿里云图片',this.imgOnlinePathArr);
          })
          .catch((err) => {
            this.overlayShow = false;
            this.loadingShow = false;
            this.$toast({
              message: `${err}`,
              type: 'fail'
            });
            reject()
          })
        })
			},


    // 拍照点击
    issueClickEvent() {
      this.photoBox = true;
      this.overlayShow = true;
    },

    // 结果照片删除
    issueDelete(index) {
      this.deleteInfoDialogShow = true;
      this.imgIndex = index
    },


    // 确定删除提示框确定事件
    sureDeleteEvent () {
      this.resultImgList.splice(this.imgIndex, 1)
    },

    // 拍照取消
    photoCancel() {
      this.photoBox = false;
      this.overlayShow = false;
    },
  },
};
</script>
<style lang='less' scoped>
@import "~@/common/stylus/variable.less";
@import "~@/common/stylus/mixin.less";
@import "~@/common/stylus/modifyUi.less";
.page-box {
  height: 0;
  .content-wrapper();
  .choose-photo-box {
    position: fixed;
    margin: auto;
    left: 0;
    bottom: 0;
    width: 100%;
    z-index: 1000;
    font-size: 0;
    > div {
      width: 100%;
      text-align: center;
      font-size: 16px;
      background: #f6f6f6;
    }
    .choose-photo {
      padding: 8px 10px;
      height: 30px;
      .bottom-border-1px(#cbcbcb);
      line-height: 30px;
      position: relative;
      cursor: pointer;
      color: @color-theme;
      overflow: hidden;
      display: inline-block;
      *display: inline;
      *zoom: 1;
      /deep/ .van-icon {
        vertical-align: top;
        font-size: 20px;
        display: inline-block;
        line-height: 30px;
      }
      input {
        position: absolute;
        font-size: 100px;
        right: 0;
        top: 0;
        height: 100%;
        opacity: 0;
        filter: alpha(opacity=0);
        cursor: pointer;
      }
    }
    .photo-graph {
      position: relative;
      display: inline-block;
      height: 50px;
      overflow: hidden;
      .bottom-border-1px(#cbcbcb);
      color: @color-theme;
      text-decoration: none;
      text-indent: 0;
      line-height: 50px;
      /deep/ .van-icon {
        vertical-align: top;
        font-size: 20px;
        display: inline-block;
        line-height: 50px;
      }
      input {
        position: absolute;
        font-size: 100px;
        right: 0;
        height: 100%;
        top: 0;
        opacity: 0;
      }
    }
    .photo-cancel {
      position: relative;
      display: inline-block;
      padding: 8px 12px;
      overflow: hidden;
      color: @color-theme;
      text-decoration: none;
      text-indent: 0;
      line-height: 30px;
      font-weight: bold;
    }
  }
  .nav {
    /deep/ .van-nav-bar {
      .van-nav-bar__left {
        .van-nav-bar__text {
          color: black !important;
          margin-left: 8px !important;
        }
      }
      .van-icon {
        color: black !important;
        font-size: 22px !important;
      }
      .van-nav-bar__title {
        color: black !important;
        font-size: 16px !important;
      }
    }
  }
  .content {
    flex: 1;
    display: flex;
    background: #F8F8F8;
    flex-direction: column;
    padding-bottom: 6px;
    overflow: auto;
    .location-box {
      width: 96%;
      box-shadow: 0px 1px 3px 0px rgba(187, 187, 187, 1);
      border-radius: 6px;
      padding: 10px 8px;
      margin: 0 auto;
      margin-top: 10px;
      box-sizing: border-box;
      display: flex;
      background: #fff;
      align-items: center;
      /deep/ .van-icon {
        margin-right: 10px
      };
      >span {
        font-size: 16px;
        color: #1864FF;
        flex: 1;
        word-break: break-all
      }
    };
    .category-box {
      padding: 0 8px;
      margin: 10px 0;
      height: 40px;
      box-sizing: border-box;
      display: flex;
      background: #fff;
      justify-content: space-between;
      align-items: center;
      .category-title {
        font-size: 14px;
        color: #101010;
        >span {
            &:first-child {
                color: red
            }
        }

      };
      .radio-box {
        flex: 1;
        width: 0;
        display: flex;
        justify-content: flex-end
      }
    };
    .result-picture {
      padding: 14px 8px;
      margin-top: 10px;
      box-sizing: border-box;
      display: flex;
      background: #fff;
      justify-content: space-between;
      > div {
        font-size: 14px;
        color: #a1a0a0;
        &:first-child {
        }
        &:nth-child(2) {
          margin-left: 8px;
          display: flex;
          flex-wrap: wrap;
          flex: 1;
          > div {
            width: 31%;
            height: 100px;
            vertical-align: top;
            margin-right: 2%;
            margin-top: 2%;
            position: relative;
            &:nth-child(1) {
              margin-top: 0;
            }
            &:nth-child(2) {
              margin-top: 0;
            }
            &:nth-child(3) {
              margin-top: 0;
            }
            &:nth-child(3n + 3) {
              margin-right: 0;
            }
            .icon-box {
                position: absolute;
                bottom: 0;
                right: 0;
                display: flex;
                width: 100%;
                padding: 2px 0;
                box-sizing: border-box;
                justify-content: center;
                align-items: center;
                background: #616161;
                /deep/ .van-icon {
                }  
            };
            img {
              width: 100%;
              height: 100%;
            }
            &:last-child {
             display: flex;
             justify-content: center;
             align-items: center;
              background: #f2f2f2;
              /deep/ .van-icon {
                position: relative;
                top: 0;
                right: 0;
              }
            }
          }
        }
      }
    }
    .enter-remark {
      padding: 14px 8px;
      margin-bottom: 6px;
      box-sizing: border-box;
      display: flex;
      background: #fff;
      justify-content: space-between;
      > div {
        font-size: 14px;
        color: #a1a0a0;
        &:first-child {
        }
        &:nth-child(2) {
          margin-left: 8px;
          flex: 1;
          /deep/ .van-cell {
            padding: 4px !important;
            border: 1px solid #cacaca;
          }
        }
      }
    }
  }
  .task-start {
    height: 48px;
    width: 266px;
    font-size: 18px;
    margin: 0 auto;
    line-height: 48px;
    background: linear-gradient(to right, #6cd2f8, #2390fe);
    box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
    color: #fff;
    border-radius: 30px;
    font-weight: bold;
    margin-top: 20px;
    margin-bottom: 20px;
    text-align: center;
  }
}
</style>