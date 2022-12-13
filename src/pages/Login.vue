<template>
  <div class="container">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">登录中...</van-loading>
    <van-overlay :show="overlayShow" />
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
    <!-- 完成任务弹框 -->
    <div class="hospital-select-box">
      <van-dialog v-model="dialogShow"
        title="选择医院"
        @confirm="dialongSure"
      >
        <div class="task-content">
          <div class="select-reason-box">
            <div class="select-content">
              <van-dropdown-menu 
                active-color="#1864FF"
              >
                <van-dropdown-item v-model="hospitalValue" :options="hospitalOption" />
              </van-dropdown-menu>
            </div>
          </div>
        </div>
      </van-dialog>
    </div>   
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import {logIn} from '@/api/login.js'
import { IsPC, setStore,  getStore, removeStore} from "@/common/js/utils";
import qs from 'qs'
export default {
  name: "Login",
  data() {
    return {
      username: "",
      password: "",
      dialogShow: false,
      loadingShow: false,
      overlayShow: false,
      checked: false,
      hospitalList: [],
      hospitalValue: 0,
      hospitalOption: [
        { text: '请选择医院', value: 0 },
        { text: '全部商品', value: 1 },
        { text: '新款商品', value: 2 },
        { text: '活动商品', value: 3 }
      ],
			selectHospitalList: [],
      loginBackgroundPng: require("@/common/images/login/login-background.png"),
      projectLogoPng: require("@/common/images/login/project-logo.png"),
    };
  },

  computed: {
    ...mapGetters(['userInfo']),
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
    ...mapMutations(["storeUserInfo","changeIsLogin","changePermissionInfo","changeRoleNameList","changeOverDueWay"]),

    // 医院选择弹框事件
    dialongSure () {

    },

    // 登录事件
    loginEvent () {
      let loginMessage = {
        username: this.username,
        password: this.password
      };
      this.loadingShow = true;
      this.overlayShow = true;
			logIn(qs.stringify(loginMessage)).then((res) => {
        this.loadingShow = false;
        this.overlayShow = false;
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
          if (this.userInfo.hospitalList.length > 1) {
            this.hospitalList = [];
            this.selectHospitalList = [];
            for (let item of this.userInfo.hospitalList) {
              this.hospitalList.push({
                value: item.hospitalName,
                id: item.id
              })
            }
          };
          this.$router.push({ path: "/home" })
        } else {
          this.$toast({
            type: 'fail',
            message: res.msg
          })
        }
      })
      .catch((err) => {
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
  .hospital-select-box {
       /deep/ .van-dialog {
        border-radius: 0;
        width: 98%;
        .van-dialog__header {
          text-align: left;
          padding: 5px 0;
          padding-left: 10px;
          background: #f5f5f5;
        };
        .van-dialog__content {
          min-height: 200px;
          overflow: auto;
          .task-content {
            padding: 0 6px 6px 6px;
            box-sizing: border-box;
            font-size: 14px;
            display: flex;
            flex-direction: column;
            .select-reason-box {
              .select-content {
                /deep/ .van-dropdown-menu {
                  .van-dropdown-menu__bar {
                    box-shadow: none;
                    background: none;
                    height: 35px;
                    .van-dropdown-menu__item {
                      justify-content: flex-start;
                      .van-dropdown-menu__title {
                        position: relative;
                        padding: 0 6px;
                        font-size: 14px;
                        box-sizing: border-box;
                        width: 100%;
                        display: inline-block
                      };
                      .van-dropdown-menu__title::after {
                        right: 10px
                      }
                    }
                  };
                  .van-dropdown-item {
                    top: 20vw !important
                  }
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
            background: #1864FF;
            color: #fff;
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
