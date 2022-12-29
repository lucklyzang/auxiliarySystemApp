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
                    <span>{{ getNowFormatDate(currentMonthDate,'day') }}</span>
                    <img :src="calendarPng" alt="" @click="calendarMonthShow = true" />
               </div>
            </div>
            <van-empty description="暂无数据" v-show="dayRecordsEmptyShow" /> 
            <div class="personnel-statistics-list-box" v-show="!dayRecordsEmptyShow">
                <div class="personnel-statistics-list" v-for="(item,index) in anecdotalRecordsList" :key="index">
                    <div class="personnel-statistics-title">
                        <div class="personnel-statistics-title-left">
                            {{ item.createTime }}
                        </div>
                        <div class="personnel-statistics-title-right">
                            <span :class="{'spanStyle': item.type == 2}">{{ recordTypeTransition(item.type) }}</span>
                        </div>
                    </div>
                    <div class="personnel-statistics-content">
                      <div class="department-name">
                        {{ item.depName }}
                      </div>
                      <div class="img-list-box">
                        <img :src="item" alt="" v-for="(item,index) in item.imgPath" :key="index">
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
            <van-empty description="暂无数据" v-show="questionRecordsEmptyShow" /> 
            <div class="personnel-statistics-list-box" v-show="!questionRecordsEmptyShow">
                <div class="personnel-statistics-list" v-for="(item,index) in problemsRecordsList" :key="index">
                    <div class="personnel-statistics-title">
                        <div class="personnel-statistics-title-left">
                            {{ item.createTime }}
                        </div>
                        <div class="personnel-statistics-title-right">
                            <span :class="{'spanStyle': item.type == 2}">{{ recordTypeTransition(item.type) }}</span>
                        </div>
                    </div>
                    <div class="personnel-statistics-content">
                      <div class="department-name">
                        {{ item.depName }}
                      </div>
                      <div class="img-list-box">
                        <img :src="item" alt="" v-for="(item,index) in item.imgPath" :key="index">
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
import { getPatrolRecordsList } from "@/api/auxiliarySystem.js";
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
      statisticsBoxShow: false,
      dayRecordsEmptyShow: false,
      questionRecordsEmptyShow: false,
      statisticalTypeIndex: 0,
      currentMonthDate: new Date(),
      currentPersonDate: new Date(),
      minDate: new Date(2010, 0, 1),
      maxDate: new Date(2050, 10, 1),
      calendarMonthShow: false,
      calendarPersonShow: false,
      calendarPng: require("@/common/images/home/calendar.png"),
      statisticalTypeList: ['日常记录','问题记录'],
      anecdotalRecordsList: [],
      problemsRecordsList: []
    }
  },

  mounted() {
    // 控制设备物理返回按键测试
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
        }
      })
    };
    this.queryPatrolRecordsList(1)
  },

  watch: {},

  computed: {
    ...mapGetters(["userInfo","scanPhotoAndroidMessage"])
  },

  methods: {
    ...mapMutations([]),

    // 巡查记录类型点击事件
    statisticalTypeEvent (item,index) {
        this.statisticalTypeIndex = index;
        if (index == 0) {
            this.queryPatrolRecordsList(1)
        } else if (index == 1) {
            this.queryPatrolRecordsList(2)
        }
    },

    // 记录类型转换
    recordTypeTransition (num) {
        switch(num) {
            case 1 :
                return '日常记录'
                break;
            case 2 :
                return '问题记录'
                break
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
        this.queryPatrolRecordsList(1)
    },

    onConPersonFirm() {
        this.calendarPersonShow = false;
        this.queryPatrolRecordsList(2)
    },

    // 获取巡查记录列表
    queryPatrolRecordsList (value) {
        console.log(value);
        this.loadingShow = true;
        this.overlayShow = true;
        this.statisticsBoxShow = false;
        if (value == 0) {
            this.dayRecordsEmptyShow = false
        } else {
            this.questionRecordsEmptyShow = false
        };
        let temporaryDate = value == 1 ? this.getNowFormatDate(this.currentMonthDate,'day') : this.getNowFormatDate(this.currentPersonDate,'day');
		getPatrolRecordsList({startDate: temporaryDate, endDate: '', type: value , system: 5})
        .then((res) => {
            this.loadingShow = false;
            this.overlayShow = false;
            this.statisticsBoxShow = true;
        if (res && res.data.code == 200) {
            if (value == 1) {
                this.anecdotalRecordsList = res.data.data.filter((item) => { return item.type == value });
                if (this.anecdotalRecordsList.length == 0) {
                    this.dayRecordsEmptyShow = true
                }
            } else if (value == 2) {
                this.problemsRecordsList = res.data.data.filter((item) => { return item.type == value});
                if (this.problemsRecordsList.length == 0) {
                    this.questionRecordsEmptyShow = true
                }
            }
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
                        };
                        .spanStyle {
                           color: #E86F50 !important; 
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