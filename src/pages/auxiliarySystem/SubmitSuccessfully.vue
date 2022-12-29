<template>
  <div class="page-box">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">加载中...</van-loading>
    <van-overlay :show="overlayShow" z-index="100000" />
    <div class="nav">
       <van-nav-bar
        title="提交成功"
        left-text="返回"
        right-text=""
        :left-arrow="true"
        :placeholder="true"
        :border="false"
        :fixed="true"
        z-index="1000"
        :safe-area-inset-top="true"
        @click-left="onClickLeft"
    />
    </div>
    <div class="content">
        <div class="text-info">
            <img :src="successPng" alt="">
            <span>提交成功</span>
            <span>你的记录已经提交成功,可到巡查记录查看详情!</span>
        </div>
        <div class="task-operation-box">
            <div class="task-no-complete" @click="backPhoto">{{ currentText }}</div>
            <div class="task-complete" @click="viewRecords">查看记录</div>
        </div>
    </div>
  </div>
</template>
<script>
import NavBar from "@/components/NavBar";
import {} from "@/api/auxiliarySystem.js";
import { mapGetters, mapMutations } from "vuex";
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction';
export default {
  name: "SubmitSuccessfully",
  components: {
    NavBar,
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      loadingShow: false,
      currentText: '',
      overlayShow: false,
      emptyShow: false,
      successPng: require("@/common/images/home/success.png")
    }
  },


  watch: {
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn("/submitRecords");
    if (this.scanPhotoAndroidMessage['isScanCode']) {
    // 跳到扫码界面
      this.currentText = '返回扫码';
      window.android.openScanPage()
    } else if (!this.scanPhotoAndroidMessage['isScanCode']) {
      // 跳到拍照界面
      this.currentText = '返回拍照'
    }
  },

  computed: {
    ...mapGetters(["userInfo","scanPhotoAndroidMessage"])
  },

  methods: {
    ...mapMutations([]),
    onClickLeft() {
      this.$router.push({path: "/submitRecords"})
    },

    // 返回拍照事件
    backPhoto () {
      if (this.scanPhotoAndroidMessage['isScanCode']) {
      // 跳到扫码界面
        window.android.openScanPage()
      } else if (!this.scanPhotoAndroidMessage['isScanCode']) {
        // 跳到拍照界面
        window.android.openPhotographPage()
      }
    },

    // 查看记录事件
    viewRecords () {
        this.$router.push({path: "/patrolRecords"})
    }
        
  }
};
</script>
<style lang='less' scoped>
@import "~@/common/stylus/variable.less";
@import "~@/common/stylus/mixin.less";
@import "~@/common/stylus/modifyUi.less";
.page-box {
  background: #F8F8F8;
  .content-wrapper();
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
  };
  /deep/ .van-popup {
    z-index: 30000 !important
  };
  /deep/ .van-loading {
    z-index: 1000000
  };      
  .content {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 0;
    .text-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex: 1;
        >img {
            width: 134px;
            height: 134px
        };
        >span {
            &:nth-child(2) {
                font-size: 20px;
                color: #289E8E;
                font-weight: bold;
                margin: 20px 0 30px 0
            };
            &:last-child {
                font-size: 14px;
                color: #101010
            }
        }
    };
    .task-operation-box {
        background: #F8F8F8;
        height: 160px;
        display: flex;
        width: 100%;
        margin: 0 auto;
        align-items: center;
        justify-content: center;
        >div {
            width: 40%;
            height: 48px;
            font-size: 18px;
            line-height: 48px;
            background: #fff;
            text-align: center;
            border-radius: 30px;
            &:first-child {
                color: #1684FC;
                border: 1px solid #1684FC
            };
            &:last-child {
                color: #fff;
                background: linear-gradient(to right, #6cd2f8, #2390fe);
                box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
            }
        }
    }
  }
}
</style>