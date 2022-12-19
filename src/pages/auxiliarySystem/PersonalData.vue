<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">加载中...</van-loading>
    <van-overlay :show="overlayShow" z-index="100000" />
    <div class="nav">
      <NavBar :path="personInfo['pageSource']" title="个人资料" />
    </div>
    <div class="content">
       <div class="basic-message" v-if="loadingSuccess">
           <div class="top">基本信息</div>
           <div class="bottom">
                <div class="content-top-content">
                    <div class="user-photo">
                        <img :src="defaultPersonPng" />
                    </div>
                    <div class="user-message">
                        <div class="user-name">
                            <span>岗位:</span>
                            <span>{{ personMessage['postManage']['name'] }}</span>
                        </div>
                        <div class="user-name">
                            <span>姓名:</span>
                            <span></span>{{ personMessage['name'] }}
                        </div>
                        <div class="user-name">
                            <span>所属部门:</span>
                            <span></span>{{ personMessage['deps'] }}
                        </div>
                        <div class="user-name">
                            <span>办公电话:</span>
                            <span></span>{{ personMessage['workPhone'] }}
                        </div>
                    </div>
                </div>
           </div>
       </div>
       <div class="specific-message" v-if="loadingSuccess">
           <div class="top">岗位信息</div>
           <div class="time-box">
               <div class="work-time">
                   <span>上班时间:</span>
                   <span>{{ personMessage['postManage']['comeTime'] }}</span>
               </div>
               <div class="offer-work-time">
                   <span>下班时间:</span>
                   <span>{{ personMessage['postManage']['goTime'] }}</span>
               </div>
           </div>
           <div class="job-description">
               <span>岗位描述:</span>
               <span>{{ personMessage['postManage']['remark'] }}</span>
           </div>
           <div class="job-placement">
               <div>
                   日工作安排: 
               </div>
               <div v-for="(item,index) in personMessage['postManage']['dayPlanEntities']" :key="index">
                   {{ `${item.startTime} - ${item.finishTime}` }} {{ item.remark }}
               </div>
            </div>
            <div class="job-placement week-job-placement">
               <div>
                   周工作安排: 
               </div>
               <div v-for="(item,index) in personMessage['postManage']['weekPlanEntities']" :key="index">
                   {{ item.week }}: {{ item.remark }}
               </div>
            </div>    
       </div>
    </div>
  </div>
</template>
<script>
import NavBar from "@/components/NavBar";
import { getPersonInfo } from "@/api/auxiliarySystem.js";
import { mapGetters, mapMutations } from "vuex";
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction';
export default {
  name: "PatrolRecords",
  components: {
    NavBar
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      loadingShow: false,
      overlayShow: false,
      loadingSuccess: false,
      personMessage: {},
      defaultPersonPng: require("@/common/images/home/default-person.png")
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn(this.personInfo['pageSource']);
    this.queryPersonMessage()
  },

  watch: {},

  computed: {
    ...mapGetters(["userInfo","personInfo"])
  },

  methods: {
    ...mapMutations([]),

    queryPersonMessage () {
        getPersonInfo({workerId: this.personInfo['workerId'], postId: this.personInfo['postId'] }).then((res) => {
            this.loadingShow = false;
            this.overlayShow = false;
        if (res && res.data.code == 200) {
            this.loadingSuccess = true;
            this.personMessage = res.data.data
        } else {
          this.$toast({
            type: 'fail',
            message: res.data.msg
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
        background: #fff;
        z-index: 10000;
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
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
    .basic-message {
        width: 96%;
        padding-left: 10px;
        margin: 0 auto;
        margin-top: 10px;
        border-radius: 10px;
        padding-bottom: 20px;
        box-sizing: border-box;
        background: #fff;
        box-shadow: 0px 2px 8px -1px rgba(11, 64, 173, 0.31);
        .top {
            line-height: 40px;
            font-size: 16px;
            color: #101010;
            font-weight: bold
        };
        .bottom {
            .content-top-content {
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
                .user-photo {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 85px;
                    margin: 0 20px;
                    height: 85px;
                    border-radius: 50%;
                    img {
                        vertical-align: middle;
                        width: 85px;
                        height: 85px;
                    }
                };
                .user-message {
                    z-index: 100;
                    flex: 1;
                    .user-name {
                        width: 98%;
                        word-break: break-all;
                        font-size: 16px;
                        margin-bottom: 10px;
                        span {
                            color: #101010;
                            font-size: 14px;
                        }
                    }
                }
            }
        }    
    };
    .specific-message {
        width: 96%;
        margin: 0 auto;
        margin-top: 10px;
        border-radius: 10px;
        padding-bottom: 20px;
        padding-left: 10px;
        box-sizing: border-box;
        background: #fff;
        box-shadow: 0px 2px 8px -1px rgba(11, 64, 173, 0.31);
        .top {
            box-sizing: border-box;
            line-height: 40px;
            font-size: 16px;
            color: #101010;
            font-weight: bold
        };
        .time-box {
            display: flex;
            margin-top: 10px;
            >div {
                flex: 1;
                text-align: left;
                span {
                    font-size: 14px;
                    color: #101010
                }

            }
        };
        .job-description {
            margin: 20px 0;
            word-break: break-all;
            span {
                font-size: 14px;
                color: #101010;
                &:first-child {
                    font-weight: bold
                }
            }
        };
        .job-placement {
            margin-bottom: 20px;
            color: #101010;
            >div {
                margin-top: 10px;
                &:first-child {
                    font-weight: bold
                }
            } 
        }
    }          
  }
}
</style>