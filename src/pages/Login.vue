<template>
  <div class="container">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ loadingText }}</van-loading>
    <div class="overlay-box">
      <van-overlay :show="overlayShow" />
    </div>
    <div class="container-content">
      <img :src="loginBackgroundPng" />
      <div class="title">
        <div>
          <img :src="projectLogoPng" />
        </div>
        <div>
          <span>一 站 式 智 慧 后 勤</span>
        </div>
      </div>
      <div class="form-box">
        <van-field
          v-model="username"
          placeholder="请输入账号"
          left-icon="contact"
        />
        <van-field
          v-model="password"
          placeholder="请输入密码"
          type="password"
          left-icon="bag-o"
          clearable
        />
      </div>
      <div class="remember-password">
        <div class="remember-password-content">
          <van-checkbox v-model="checked" checked-color="#289E8E"
            >记住账号密码</van-checkbox
          >
        </div>
      </div>
      <div class="form-btn" @click="loginEvent">登 录</div>
    </div>
    <!-- 选择医院弹框 -->
    <div class="hospital-select-box">
      <van-dialog v-model="dialogShow"
        title="请选择医院"
        width="98%"
        :before-close="beforeCloseEvent"
        close-on-click-overlay
        confirm-button-text="确定"
        @confirm="dialongSure"
      >
        <div class="task-content">
          <SelectSearch :isNeedSearch="false" :itemData="hospitalOption" @change="hospitalOptionChange" />  
        </div>
      </van-dialog>
    </div>   
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import {logIn,getHospitalMessage,getDepartmentsMessage} from '@/api/login.js'
import { IsPC, setStore,  getStore, removeStore} from "@/common/js/utils";
import SelectSearch from "@/components/SelectSearch";
import qs from 'qs'
export default {
  components:{
    SelectSearch
  },
  name: "Login",
  data() {
    return {
      username: "",
      password: "",
      loadingText: '登录中...',
      dialogShow: false,
      loadingShow: false,
      overlayShow: false,
      checked: false,
      selectValue: '',
      hospitalOption: [],
      loginBackgroundPng: require("@/common/images/login/login-background.png"),
      projectLogoPng: require("@/common/images/login/project-logo.png"),
    };
  },

  computed: {
    ...mapGetters(['userInfo','chooseProject','departmentsMessage']),
  },

  mounted() {
    // 控制设备物理返回按键
    if (!IsPC()) {
      let that = this;
      pushHistory();
      that.gotoURL(() => {
        pushHistory();
        this.$router.push({ path: "/" })
      })
    };
    this.username = getStore('username') ? getStore('username') : '';
		this.password = getStore('password') ? getStore('password') : '';
    // 监控键盘弹起
    let originalHeight =
      document.documentElement.clientHeight || document.body.clientHeight;
    window.onresize = () => {};
  },

  methods: {
    ...mapMutations(["storeUserInfo","changeIsLogin","changePermissionInfo","changeRoleNameList","changeChooseProject","changeOverDueWay","changeHospitalMessage","changeDepartmentsMessage"]),

    // 返回一个特定的 DOM 节点，作为挂载的父节点
    getContainer() {
      return document.querySelector('.hospital-select-box');
    },

    // 医院选择弹框事件
    dialongSure () {
      if (!this.selectValue) {
        return
      };
      this.changeChooseProject({
        hospitalName: this.userInfo.hospitalList.filter((item) => { return item.id == this.selectValue })[0]['hospitalName'],
        name: this.userInfo.hospitalList.filter((item) => { return item.id == this.selectValue })[0]['name'],
        proId: this.selectValue
      });
      this.queryHospitalMessage(this.selectValue)
    },

    // 弹框关闭前的事件
    beforeCloseEvent (action, done) {
      if (action == 'confirm') {
        if (!this.selectValue) {
          this.$toast('请选择医院');
          done(false);
          return
        }
      } else {
        done()
      }
    },

    // 医院列表选值值变化事件
    hospitalOptionChange (value) {
      this.selectValue = value['value']
    },

    // 登录事件
    loginEvent () {
      let loginMessage = {
        username: this.username,
        password: this.password
      };
      this.loadingText = '登录中...';
      this.loadingShow = true;
      this.overlayShow = true;
			logIn(qs.stringify(loginMessage)).then((res) => {
        this.loadingShow = false;
        this.overlayShow = false;
        this.hospitalOption = [{ text: '请选择医院', value: null}];
        if (res && res.data.code == 200) {
          // 登录用户名密码及用户信息存入Locastorage
          // 判断是否勾选记住用户名密码
          if (this.checked) {
            setStore('username',this.username);
            setStore('password',this.password)
          } else {
            removeStore('username');
            removeStore('password')
          };
          this.changeOverDueWay(false);
          this.changeIsLogin(true);
          this.storeUserInfo(res.data.data.worker);
          this.changePermissionInfo(res.data.data.authorities);
          this.changeRoleNameList(res.data.data.roleNameList);
          for (let item of this.userInfo.hospitalList) {
            this.hospitalOption.push({
              text: item.name,
              hospitalName: item.hospitalName,
              value: item.id
            })
          };
          this.dialogShow = true;
        } else {
          this.loadingText = '';
          this.$toast({
            type: 'fail',
            message: res.msg
          })
        }
      })
      .catch((err) => {
        this.loadingText = '';
        this.loadingShow = false;
        this.overlayShow = false;
        this.$toast({
          type: 'fail',
          message: err
        })
      })
    },
    
    // 查询医院信息
    queryHospitalMessage (proId) {
      this.loadingText = '加载中...';
      this.loadingShow = true;
      this.overlayShow = true;
      getHospitalMessage(proId).then((res) => {
        this.loadingShow = false;
        this.overlayShow = false;
        if (res && res.data.code == 200) {
          this.changeHospitalMessage(res.data.data);
          this.queryDepartmentsMessage(proId)
        } else {
          this.loadingText = '';
          this.$toast({
            type: 'fail',
            message: res.msg
          })
        }
      })
      .catch((err) => {
        this.loadingText = '';
        this.loadingShow = false;
        this.overlayShow = false;
         this.$toast({
          type: 'fail',
          message: err
        })
      })
    },

    // 查询科室信息
    queryDepartmentsMessage (proId) {
      this.loadingText = '加载中...';
      this.loadingShow = true;
      this.overlayShow = true;
      getDepartmentsMessage({
        proId,
        permissions: 'adjunct'
      }).then((res) => {
        this.loadingShow = false;
        this.overlayShow = false;
        if (res && res.data.code == 200) {
          this.changeDepartmentsMessage(res.data.data);
          console.log('科室信息',this.departmentsMessage);
          this.$router.push({ path: "/home" })
        } else {
          this.loadingText = '';
          this.$toast({
            type: 'fail',
            message: res.msg
          })
        }
      })
      .catch((err) => {
        this.loadingText = '';
        this.loadingShow = false;
        this.overlayShow = false;
         this.$toast({
          type: 'fail',
          message: err
        })
      })
    }
  }
}
</script>
<style lang="less" scoped>
@import "~@/common/stylus/variable.less";
@import "~@/common/stylus/mixin.less";
@import "~@/common/stylus/modifyUi.less";
.container {
  .overlay-box {
    /deep/ .van-overlay {
      z-index: 20002 !important
    }
  };  
  /deep/ .van-loading {
    z-index: 30000 !important
  };
  /deep/ .van-popup {
    z-index: 300000 !important
  };
  .hospital-select-box {
       /deep/ .van-dialog {
        left: 1% !important;
        top: 50% !important;
        border-radius: 0 !important;
        transform: translate3d(0,-50%,0) !important;
        .van-dialog__header {
          text-align: left;
          padding: 8px 0;
          padding-left: 10px;
          font-size: 15px;
          background: #f5f5f5;
        };
        .van-dialog__content {
          min-height: 300px;
          overflow: auto;
          padding: 10px 20px 0 20px !important;
          box-sizing: border-box;
          .task-content {
            .vue-dropdown {
              border: 1px solid #e7e7e7 !important;
              .cur-name {
                >span {
                  text-align: center
                };
                .van-icon {
                  color: #e7e7e7 !important
                }
              };
              .list-and-search {
                border: 1px solid #e7e7e7 !important;
                .list-module {
                  color: #656565 !important
                }
              }
            }
          }
        };
        .van-dialog__footer {
          justify-content: center;
          height: 40px;
          align-items: center;
          .van-dialog__confirm {
            width: 70px;
            height: 30px;
            background: #3b9df9;
            color: #fff;
            font-size: 14px;
            flex: none;
            border-radius: 20px
          }
        }
      }  
    };
  .container-content {
    flex: 1;
    background: #fff;
    position: relative;
    > img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 80vh;
    }
    .title {
      width: 100%;
      height: 58vh;
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
      color: black;
      font-size: 26px;
      color: #fff;
      font-weight: bold;
      > div {
        z-index: 1000;
        &:first-child {
          margin-top: -80px;
          margin-bottom: 8px;
          width: 135px;
          height: 30px;
          img {
            width: 100%;
            height: 100%;
          }
        }
        &:last-child {
          margin-left: -6px;
          font-size: 16px;
        }
      }
    }
    .form-box {
      width: 70%;
      margin: 0 auto;
      padding: 10px;
      /deep/ .van-cell {
        position: relative;
        border: none;
        &:before {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height:1px;
          background-color: #cccaca;
          transform: scaleY(0.5)
        }
        .van-field__left-icon {
          .van-icon {
            font-size: 18px !important
          }
        }
        &:last-child {
          margin: 20px 0 10px 0
        }
      }
    }
    .remember-password {
      width: 70%;
      margin: 0 auto;
      height: 40px;
      position: relative;
      .remember-password-content {
        position: absolute;
        top: 0;
        right: 0;
        /deep/ .van-checkbox {
          .van-checkbox__label {
            color: #565656 !important;
            font-weight: 14px !important;
          }
        }
      }
    }
    .form-btn {
      width: 70%;
      margin: 0 auto;
      font-size: 18px;
      color: #fff;
      text-align: center;
      margin-top: 30px;
      background-image: linear-gradient(to right, #6ed3f7, #218fff);
      box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
      line-height: 48px;
      border-radius: 30px;
    }
    .weixin-login {
      width: 100%;
      margin: 0 auto;
      margin-top: 40px;
      .image-wrapper {
        width: 60px;
        height: 50px;
        margin: 0 auto;
        img {
          width: 100%;
          height: 100%;
        }
      }
    }
    .bottom-character {
      width: 100%;
      text-align: center;
      position: absolute;
      left: 0;
      bottom: 10px;
      color: #333;
      span {
        font-size: 12px;
        border-left: 1px solid #333;
        border-right: 1px solid #333;
        padding: 0 6px;
      }
    }
  }
}
</style>
