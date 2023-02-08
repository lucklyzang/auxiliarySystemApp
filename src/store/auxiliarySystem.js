import { setStore, getStore } from '@/common/js/utils'
import { getDefaultAuxiliaryModuleState } from '@/common/js/resetStore'
export default {
    state: getDefaultAuxiliaryModuleState(),

    getters: {

        attendanceStatisticsSwitchMessage : (state) => {
            state.attendanceStatisticsSwitchMessage = getStore('attendanceStatisticsSwitchMessage') ? JSON.parse(getStore('attendanceStatisticsSwitchMessage')) : {};
            return state.attendanceStatisticsSwitchMessage
        },

        locationMessage : (state) => {
            state.locationMessage = getStore('locationMessage') ? JSON.parse(getStore('locationMessage')) : {};
            return state.locationMessage
        },

        personInfo : (state) => {
            state.personInfo = getStore('personInfo') ? JSON.parse(getStore('personInfo')) : {};
            return state.personInfo
        },

        scanPhotoAndroidMessage : (state) => {
            state.scanPhotoAndroidMessage = getStore('scanPhotoAndroidMessage') ? JSON.parse(getStore('scanPhotoAndroidMessage')) : {};
            return state.scanPhotoAndroidMessage
        },

        attendanceTypeDetailsMessage : (state) => {
            state.attendanceTypeDetailsMessage = getStore('attendanceTypeDetailsMessage') ? JSON.parse(getStore('attendanceTypeDetailsMessage')) : {};
            return state.attendanceTypeDetailsMessage
        },

        personnelStatisticsDetailsMessage : (state) => {
            state.personnelStatisticsDetailsMessage = getStore('personnelStatisticsDetailsMessage') ? JSON.parse(getStore('personnelStatisticsDetailsMessage')) : {};
            return state.personnelStatisticsDetailsMessage
        }
    },

    mutations: {

        // 保存辅助系统考勤统计类型详情
        storeAttendanceTypeDetailsMessage(state, playLoad) {
            if (playLoad && playLoad != 'null') {
                setStore('attendanceTypeDetailsMessage', playLoad);
                state.attendanceTypeDetailsMessage = playLoad
            }
        },

        // 保存安卓扫码和拍照后的信息数据
        storeScanPhotoAndroidMessage(state, playLoad) {
            if (playLoad && playLoad != 'null') {
                setStore('scanPhotoAndroidMessage', playLoad);
                state.scanPhotoAndroidMessage = playLoad
            }
        },

        // 保存辅助系统考勤人员统计详情
        storePersonnelStatisticsDetailsMessage(state, playLoad) {
            if (playLoad && playLoad != 'null') {
                setStore('personnelStatisticsDetailsMessage', playLoad);
                state.personnelStatisticsDetailsMessage = playLoad
            }
        },

        // 保存辅助系统考勤统计切换和日期信息
        storeAttendanceStatisticsSwitchMessage(state, playLoad) {
            if (playLoad && playLoad != 'null') {
                setStore('attendanceStatisticsSwitchMessage', playLoad);
                state.attendanceStatisticsSwitchMessage = playLoad
            }
        },

        // 保存辅助系统即时保洁任务添加的位置信息
        storeLocationMessage(state, playLoad) {
            if (playLoad && playLoad != 'null') {
                setStore('locationMessage', playLoad);
                state.locationMessage = playLoad
            }
        },

        // 保存人员信息
        storePersonInfo(state, playLoad) {
            if (playLoad && playLoad != 'null') {
                setStore('personInfo', playLoad);
                state.personInfo = playLoad
            }
        },

        //重置辅助系统状态
        resetAuxiliarySystemState(state) {
            Object.assign(state, getDefaultAuxiliaryModuleState())
        }
    },

    actions: {
        resetAuxiliarySystemStore({ commit }) {
            commit('resetAuxiliarySystemState')
        }
    }
}