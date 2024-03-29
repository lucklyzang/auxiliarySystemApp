// 登录信息store的初始值
export function getDefaultLoginState() {
    return {
        userInfo: null, //用户信息
        permissionInfo: [], //权限列表
        roleNameList: [], //角色列表
        isLogin: false, //是否登录
        token: null, //请求token
        overDueWay: false, // 过期方式
        timeMessage: {}, //阿里云签名过期时间信息
        ossMessage: {}, //阿里云签名信息
        chooseProject: null, //选择的医院 
        hospitalMessage: {}, //医院信息
        departmentsMessage: [] //科室信息
    }
};
// 特殊辅助信息store的初始值
export function getDefaultAuxiliaryModuleState() {
    return {
       attendanceTypeDetailsMessage: {},
       personInfo: {},
       personnelStatisticsDetailsMessage: {},
       locationMessage: [],
       scanPhotoAndroidMessage: {
            value: '',
            isScanCode: true
       },
       attendanceStatisticsSwitchMessage: {}
    }
};