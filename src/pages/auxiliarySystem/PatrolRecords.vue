<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">加载中...</van-loading>
    <van-overlay :show="overlayShow" z-index="100000" />
    <van-popup v-model="calendarMonthShow" position="bottom">
        <van-datetime-picker
            v-model="currentMonthDate"
            @confirm="onConMonthFirm"
            @cancel="calendarMonthShow = false"
            type="date"
            title="选择日期"
            :min-date="minDate"
            :max-date="maxDate"
        />
    </van-popup>
    <van-popup v-model="calendarPersonShow" position="bottom">
        <van-datetime-picker
            v-model="currentPersonDate"
            @confirm="onConPersonFirm"
            @cancel="calendarPersonShow = false"
            type="date"
            title="选择日期"
            :min-date="minDate"
            :max-date="maxDate"
        />
    </van-popup>
    <div class="nav">
      <NavBar path="/scanQRCode" title="巡查记录" />
    </div>
    <div class="content">
        <div class="content-top">
            <div class="statistical-type-list-box">
                <div class="statistical-type-list" :class="{'statisticalTypeListStyle': statisticalTypeIndex == index}" v-for="(item,index) in statisticalTypeList" :key="index" @click="statisticalTypeEvent(item,index)">
                    {{ item }}
                </div>
            </div>    
        </div>
        <div class="personnel-statistics-box" v-if="statisticalTypeIndex == 0 && statisticsBoxShow">
            <div class="date-box">
               <div class="date-content">
                    <span>{{ getNowFormatDate(currentPersonDate,'day') }}</span>
                    <img :src="calendarPng" alt="" @click="calendarMonthShow = true" />
               </div>
            </div>
            <van-empty description="暂无数据" v-show="personStatisticalEmptyShow" /> 
            <div class="personnel-statistics-list-box" v-show="!personStatisticalEmptyShow">
                <div class="personnel-statistics-list" v-for="(item,index) in anecdotalRecordsList" :key="index">
                    <div class="personnel-statistics-title">
                        <div class="personnel-statistics-title-left">
                            {{ item.date }}
                        </div>
                        <div class="personnel-statistics-title-right">
                            <span>{{ item.recordType }}</span>
                        </div>
                    </div>
                    <div class="personnel-statistics-content">
                      <div class="department-name">
                        {{ item.departmentName }}
                      </div>
                      <div class="img-list-box">
                        <img :src="item" alt="" v-for="(item,index) in item.imgList" :key="index">
                      </div>
                      <div class="remark-box">
                        <span>备注</span>
                        <span>{{ item.remark }}</span>
                      </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="personnel-statistics-box" v-if="statisticalTypeIndex == 1 && statisticsBoxShow">
            <div class="date-box">
               <div class="date-content">
                    <span>{{ getNowFormatDate(currentPersonDate,'day') }}</span>
                    <img :src="calendarPng" alt="" @click="calendarPersonShow = true" />
               </div>
            </div>
            <van-empty description="暂无数据" v-show="personStatisticalEmptyShow" /> 
            <div class="personnel-statistics-list-box" v-show="!personStatisticalEmptyShow">
                <div class="personnel-statistics-list" v-for="(item,index) in problemsRecordsList" :key="index">
                    <div class="personnel-statistics-title">
                        <div class="personnel-statistics-title-left">
                            {{ item.date }}
                        </div>
                        <div class="personnel-statistics-title-right">
                            <span>{{ item.recordType }}</span>
                        </div>
                    </div>
                    <div class="personnel-statistics-content">
                      <div class="department-name">
                        {{ item.departmentName }}
                      </div>
                      <div class="img-list-box">
                        <img :src="item" alt="" v-for="(item,index) in item.imgList" :key="index">
                      </div>
                      <div class="remark-box">
                        <span>备注</span>
                        <span>{{ item.remark }}</span>
                      </div>
                    </div>
                </div>
            </div>
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
  name: "PatrolRecords",
  components: {
    NavBar
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      loadingShow: false,
      attendanceEmptyShow: false,
      expatriateEmptyShow: false,
      overlayShow: false,
      statisticsBoxShow: true,
      personStatisticalEmptyShow: false,
      statisticalTypeIndex: 0,
      currentMonthDate: new Date(),
      currentPersonDate: new Date(),
      minDate: new Date(2010, 0, 1),
      maxDate: new Date(2050, 10, 1),
      calendarMonthShow: false,
      calendarPersonShow: false,
      calendarPng: require("@/common/images/home/calendar.png"),
      statisticalTypeList: ['日常记录','问题记录'],
      anecdotalRecordsList: [
        {
            date: '2022-11-02 16:08',
            recordType: '日常记录',
            departmentName: '科室一',
            remark: '飒飒飒飒飒飒飒飒飒飒飒飒',
            imgList: [
                require("@/common/images/home/calendar.png"), require("@/common/images/home/calendar.png")
            ]
        }
      ],
      problemsRecordsList: [
           {
            date: '2022-11-02 16:08',
            recordType: '日常记录',
            remark: '飒飒飒飒飒飒飒飒飒飒飒飒',
            imgList: [
                require("@/common/images/home/calendar.png"), require("@/common/images/home/calendar.png")
            ]
        }
      ]
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn("/scanQRCode")
  },

  watch: {},

  computed: {
    ...mapGetters(["userInfo"])
  },

  methods: {
    ...mapMutations([]),

    // vant tab切换事件
    vanTabsChangeEvent () {
        if (this.attendanceSituationList.length == 0) {
            this.attendanceEmptyShow = true
        } else {
            this.attendanceEmptyShow = false
        };
        if (this.expatriateList.length == 0) {
            this.expatriateEmptyShow = true
        }  else {
            this.expatriateEmptyShow = false
        }
    },

    // 统计类型点击事件
    statisticalTypeEvent (item,index) {
        this.statisticalTypeIndex = index;
        if (index == 0) {
            this.getDailyRecordData()
        } else if (index == 1) {
            this.getProblemRecordData()
        }
    },

    // 考勤类型转换
    attendanceTypeTransition (num) {
        switch(num) {
            case 0 :
                return '未出勤'
                break;
            case 1 :
                return '出勤'
                break;
            case 2 :
                return '外派'
                break;
            case 3 :
                return '工伤'
                break;
            case 4 :
                return '病假'
                break;
            case 5 :
                return '调班'
                break;
            case 6 :
                return '休假'
                break;
            case 7 :
                return '加班'
                break;
            case 8 :
                return '迟到早退'
                break;
            case 9 :
                return '旷工'
                break;
            case 10 :
                return '事假'
                break;
        }
    },

    // 格式化时间
    getNowFormatDate(currentDate,type) {
        let currentdate;
        let strDate;
        let seperator1 = "-";
        let month = currentDate.getMonth() + 1;
        if (type == 'day') {
            strDate = currentDate.getDate();
        };
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        };
        if (type == 'day') {
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
        };
        if (type == 'day') {
            currentdate = currentDate.getFullYear() + seperator1 + month + seperator1 + strDate
        } else {
            currentdate = currentDate.getFullYear() + seperator1 + month
        }
        return currentdate
    },

    onConMonthFirm() {
        this.calendarMonthShow = false;
        this.getDailyRecordData();
    },

    onConPersonFirm() {
        this.calendarPersonShow = false;
        this.getProblemRecordData()
    },

    // 获取日常记录数据
    getDailyRecordData () {
    },

    // 获取问题记录数据
    getProblemRecordData () {
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
    background: #fff;
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
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 0;
    .content-top {
        width: 100%;
        margin: 0 auto;
        .statistical-type-list-box {
            height: 40px;
            width: 96%;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .statistical-type-list {
                flex: 1;
                height: 30px;
                text-align: center;
                line-height: 30px;
                font-size: 12px;
                color: #9E9E9A
            };
            .statisticalTypeListStyle {
                background: #fff !important;
                border-radius: 8px !important;
                color: #1864FF !important
            }
        }
    };
    .personnel-statistics-box {
        display: flex;
        flex-direction: column;
        flex: 1;
        height: 0;
        overflow: auto;
        position: relative;
        /deep/ .van-empty {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%)
        };
        .date-box {
            width: 100%;
            padding: 5px 0;
            box-sizing: border-box;
            background: #fff;
            display: flex;
            align-items: center;
            .date-content {
                width: 96%;
                margin: 0 auto;
                display: flex;
                justify-content: space-between;
                align-items: center;
                height: 30px;
                background: #F4F5F7;
                padding: 0 10px;
                box-sizing: border-box;
                border-radius: 8px;
                > span {
                    font-size: 14px;
                    color: #101010
                };
                img {
                    width: 19px;
                    height: 19px
                }
            }
        };
        .personnel-statistics-list-box {
            height: 100%;
            overflow: auto;
            margin-top: 10px;
            .personnel-statistics-list {
                width: 98%;
                margin: 0 auto;
                background: #fff;
                border-radius: 4px;
                box-shadow: 0px 1px 3px 0 rgba(0, 0, 0, 0.23);
                padding: 0 0 4px 0;
                box-sizing: border-box;
                margin-bottom: 10px;
                .personnel-statistics-title {
                    .bottom-border-1px(rgba(0, 0, 0, 0.23));
                    width: 98%;
                    box-sizing: border-box;
                    margin: 0 auto;
                    height: 44px;
                    align-items: center;
                    display: flex;
                    padding: 0 10px;
                    justify-content: space-between;
                    .personnel-statistics-title-left {
                        font-size: 14px;
                        color: #101010;
                        font-weight: bold
                    };
                    .personnel-statistics-title-right {
                        >span {
                            vertical-align: middle;
                            font-size: 14px;
                            color: #289E8E;
                        };
                        img {
                            width: 21px;
                            height: 21px;
                            vertical-align: middle
                        }
                    }
                };
                .personnel-statistics-content {
                    width: 98%;
                    box-sizing: border-box;
                    margin: 0 auto;
                    padding: 10px;
                    >div {
                        margin-bottom: 10px
                    };
                    .department-name {
                        font-size: 16px;
                        color: #101010;
                        font-weight: bold
                    };
                    .img-list-box {
                        word-break: break-all;
                        img {
                            width: 80px;
                            margin-right: 5%;
                            margin-bottom: 6px;
                            &:nth-child(3n+3) {
                                margin-right: 0
                            }
                        }
                    };
                    .remark-box {
                        font-size: 14px;
                        color: #9E9E9A;
                        line-height: 20px;
                        word-break: breal-all;
                    }
                }
            } 
        }
    }    
  }
}
</style>