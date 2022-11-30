<template>
  <div class="page-box" ref="wrapper">
    <van-overlay :show="overlayShow" />
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ loadText }}</van-loading>
    <div class="nav">
      <NavBar path="/scanQRCode" title="拍照详情" />
    </div>
    <div class="content">
      <div class="location-box">
        <van-icon name="location" color="#1864FF" size="25" />
        <span>科室一</span>
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
import {addForthwithCleanTask} from "@/api/auxiliarySystem.js";
import { mapGetters, mapMutations } from "vuex";
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction';
import { compress } from "@/common/js/utils";
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
      imgIndex: '',
      radioValue: '1',
      deleteInfoDialogShow: false,
      overlayShow: false,
      loadingShow: false,
      loadText: '创建中',
      enterRemark: "",
      resultImgList: [],
      imgOnlinePathArr: [],
      temporaryFileArray: []
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn("/scanQRCode")
  },

  watch: {},

  computed: {
    ...mapGetters(["userInfo","timeMessage","ossMessage","chooseProject","locationMessage"]),
  },

  methods: {
    ...mapMutations(["changeIsLogin","changeTimeMessage","changeOssMessage","storeLocationMessage"]),

    // 任务提交事件
    async submitEvent() {
      // if (this.categoryOption.filter((item) => { return item.value == this.categoryValue })[0]['text'] == '请选择类别') {
      //   this.$toast('请选择类别');
      //   return
      // };
      if (this.sourceOption.filter((item) => { return item.value == this.sourceValue })[0]['text'] == '请选择来源') {
        this.$toast('请选择来源');
        return
      };
      if (this.locationMessage.length != 4) {
        this.$toast('请选择位置');
        return
      };
       if (this.workerOption.filter((item) => { return item.value == this.workerValue })[0]['text'] == '请选择保洁员') {
        this.$toast('请选择保洁员');
        return
      };
      if (!this.personNumberValue) {
        this.$toast('预计人数不能为空');
        return
      };
      if (!this.durationValue) {
        this.$toast('预计时长不能为空');
        return
      };
      if (this.violateStandardOption.filter((item) => { return item.value == this.violateStandardValue })[0]['text'] == '请选择违反标准') {
        this.$toast('请选择违反标准');
        return
      };
      let paramsData = {
        managerId: this.userInfo.id, // 保洁主管id，当前登陆人员id
        managerName: this.userInfo.name,// 保洁主管姓名，当前登陆人员姓名
        assignId: this.userInfo.id, // 任务分配人员id，当前登陆人员id
        assignName: this.userInfo.name,// 任务分配人员姓名，当前登陆人员姓名
        workerId: this.workerValue,//保洁员id
        priority: this.priorityValue, //优先级
        workerName: this.workerOption.filter((item) => { return item.value == this.workerValue})[0]['text'],//保洁员姓名
        path: [], // 上传的问题图片，集合,
        taskType: 0,// 任务类型，即时保洁为 0
        source: this.sourceOption.filter((item) => { return item.value == this.sourceValue })[0]['text'], // 任务来源
        structureId: this.locationMessage[0]['id'], // 建筑id
        structureName: this.locationMessage[0]['structName'], // 建筑名称
        depId: this.locationMessage[1]['id'], // 科室id
        depName: this.locationMessage[1]['departmentName'], // 科室名称
        areaImmediateId: this.locationMessage[2]['id'], // 目的区域id
        areaImmediateName: this.locationMessage[2]['itemName'], // 目的区域名称
        spaces: [],
        standards: [this.violateStandardOption.filter((item) => { return item.value == this.violateStandardValue })[0]['text']], // 检查标准，违反标准，数组
        planFinishTime: this.getNowFormatDate(this.currentDate), // 任务预计完成时间
        planPersons: this.personNumberValue, // 任务预计所需人数
        planUseTime: this.durationValue, // 任务预计用时，单位为分钟
        taskRemark: this.enterRemark, // 任务备注信息
        proId: this.userInfo.proIds[0], // 所属项目id
        proName: this.userInfo.hospitalList[0]['hospitalName'] // 所属项目名称
      };
      // 上传图片到阿里云服务器
      if (this.resultImgList.length > 0) {
        this.loadText ='创建中';
        this.overlayShow = true;
        this.loadingShow = true;
        for (let imgI of this.temporaryFileArray) {
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
        paramsData.path = this.imgOnlinePathArr
      };
      paramsData.spaces.push({
        id: this.locationMessage[3]['id'],
        name: this.locationMessage[3]['name']
      });
      this.addForthwithCleanTask(paramsData) 
    },

    // 添加任务
    addForthwithCleanTask (data) {
      this.loadingShow = true;
      this.overlayShow = true;
      addForthwithCleanTask(data).then((res) => {
          this.loadingShow = false;
          this.overlayShow = false;
					if (res && res.data.code == 200) {
            this.$toast({
							message: '任务创建成功',
							type: 'success'
						});
            this.resultImgList = [];
            this.imgOnlinePathArr = [];
            this.temporaryFileArray = [];
            this.storeLocationMessage([]);
            this.violateStandardOption = [{
              text: '请选择违反标准',
              value: 0
            }];
            this.enterRemark = '';
            this.categoryValue = 0;
            this.sourceValue = 0;
            this.workerValue = 0;
            this.priorityValue = 1;
            this.currentDate = new Date();
            this.violateStandardValue = 0;
            this.locationValue = '';
            this.personNumberValue = '';
            this.durationValue = '';
            this.$router.push({
              path: "/scanQRCode"
            })
					} else {
						this.$toast({
							message: `${res.data.msg}`,
							type: 'fail'
						})
					}
				}).
				catch((err) => {
					this.$toast({
						message: `${err}`,
						type: 'fail'
					});
					this.loadingShow = false;
          this.overlayShow = false
			})
    },


    // 图片上传预览
    previewFileOne() {
      let file = document.getElementById("demo1").files[0];
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
            _this.resultImgList.push(src);
            _this.temporaryFileArray.push(file);
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
            _this.temporaryFileArray.push(file);
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
							this.$toast({
								message: `${res.data.data.msg}`,
								type: 'fail'
							});
							reject()
						}
					})
					.catch((err) => {
            this.$toast({
              message: `${res.data.data.msg}`,
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
          const aliyunFileKey = this.ossMessage.dir + new Date().getTime() + Math.floor(Math.random() * 100) + filePath.name;
          // 临时AccessKeyID0
          const OSSAccessKeyId = this.ossMessage.accessId;
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
          formData.append('file',filePath);
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
      this.resultImgList.splice(this.imgIndex, 1);
      this.temporaryFileArray.splice(this.imgIndex, 1)
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
      margin-bottom: 10px;
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