import Vue from 'vue'
import Router from 'vue-router'
import { getStore } from '@/common/js/utils.js'
import store from '@/store'
const Home = () =>
    import ('@/pages/Home')
const SubmitRecords = () =>
    import ('@/pages/auxiliarySystem/SubmitRecords')
const ScanQRCode = () =>
    import ('@/pages/auxiliarySystem/ScanQRCode')
const PatrolRecords = () =>
    import ('@/pages/auxiliarySystem/PatrolRecords')
const AttendanceManagement = () =>
    import ('@/pages/auxiliarySystem/AttendanceManagement')
const AttendanceStatistics = () =>
    import ('@/pages/auxiliarySystem/AttendanceStatistics')
const AttendanceTypeDetails = () =>
    import ('@/pages/auxiliarySystem/AttendanceTypeDetails')
const PersonnelStatisticsDetails = () =>
    import ('@/pages/auxiliarySystem/PersonnelStatisticsDetails')
const SubmitSuccessfully = () =>
    import ('@/pages/auxiliarySystem/SubmitSuccessfully')
const PersonalData = () =>
    import ('@/pages/auxiliarySystem/PersonalData')                
const Login = () =>
    import ('@/pages/Login')
const MyInfo = () =>
    import ('@/pages/MyInfo')
Vue.use(Router)
let baseRoute = [{
        path: '/',
        name: 'login',
        component: Login
    },
    {
        path: '/home',
        name: 'home',
        component: Home
    },
    {
        path: '/patrolRecords',
        name: 'patrolRecords',
        component: PatrolRecords
    },
    {
        path: '/myInfo',
        name: 'myInfo',
        component: MyInfo
    },
    {
        path: '/submitRecords',
        name: 'submitRecords',
        component: SubmitRecords
    },
    {
        path: '/scanQRCode',
        name: 'scanQRCode',
        component: ScanQRCode
    },
    {
        path: '/personalData',
        name: 'personalData',
        component: PersonalData
    },
    {
        path: '/attendanceManagement',
        name: 'attendanceManagement',
        component: AttendanceManagement
    },
    {
        path: '/attendanceStatistics',
        name: 'attendanceStatistics',
        component: AttendanceStatistics
    },
    {
        path: '/attendanceTypeDetails',
        name: 'attendanceTypeDetails',
        component: AttendanceTypeDetails
    },
    {
        path: '/personnelStatisticsDetails',
        name: 'personnelStatisticsDetails',
        component: PersonnelStatisticsDetails
    },
    {
        path: '/submitSuccessfully',
        name: 'submitSuccessfully',
        component: SubmitSuccessfully
    }
];
let router = new Router({
    routes: baseRoute,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            // return {
            //     x: 0,
            //     y: 0
            // }
        }
    }
});
router.beforeEach((to, from, next) => {
    let login = getStore('isLogin');
    let name = to.name;
    if (name === 'login') {
        if (login) {
            next({ path: '/home' })
        } else {
            next()
        }
    } else {
        if (login) {
            next()
        } else {
            next({ path: '/' })
        }
    }
});
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
};
export default router