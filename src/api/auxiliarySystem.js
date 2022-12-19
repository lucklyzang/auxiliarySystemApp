import request from '@/utils/request'

// 即时保洁任务新增
export function addForthwithCleanTask(data) {
    return request({
        url: 'clean/cleanTask/add',
        method: 'post',
        data
    })
}

// 考勤日统计
export function cleanAttendanceDay(data) {
    return request({
        url: 'nblink/attend/attendance/dayApp',
        method: 'get',
        params: data
    })
}

// 考勤日统计详情
export function cleanAttendanceDayInfo(data) {
    return request({
        url: 'nblink/attend/attendance/dayAppInfo',
        method: 'get',
        params: data
    })
}

// 考勤月统计
export function cleanAttendanceMonth(data) {
    return request({
        url: 'nblink/attend/attendance/monthApp',
        method: 'get',
        params: data
    })
}

// 考勤月统计详情
export function cleanAttendanceMonthInfo(data) {
    return request({
        url: 'nblink/attend/attendance/monthAppInfo',
        method: 'get',
        params: data
    })
}

// 考勤月统计出勤详情
export function cleanAttendanceMonthAttendance(data) {
    return request({
        url: 'nblink/attend/attendance/monthAttendanceApp',
        method: 'get',
        params: data
    })
}

// 考勤人员统计
export function cleanAttendancePeople(data) {
    return request({
        url: 'nblink/attend/attendance/peopleApp',
        method: 'get',
        params: data
    })
}

// 考勤人员详情统计
export function cleanAttendancePeopleInfo(data) {
    return request({
        url: 'nblink/attend/attendance/peopleInfoApp',
        method: 'get',
        params: data
    })
}

// 查询考勤列表
export function cleanAttendanceList(data) {
    return request({
        url: 'nblink/attend/attendance/app',
        method: 'get',
        params: data
    })
}

// 录入考勤
export function cleanAttendanceUpdate(data) {
    return request({
        url: 'nblink/attend/attendance/',
        method: 'put',
        data
    })
}

// 批量录入考勤
export function cleanAttendanceUpdateBatch(data) {
    return request({
        url: 'nblink/attend/attendance/updateBatch',
        method: 'put',
        data
    })
}

// 查询保洁员(考勤管理)
export function cleanbxWorkerList(data) {
    return request({
        url: 'nblink/user/employees',
        method: 'get'
    })
}

// 查询保洁员(保洁管理)
export function attendanceWorkerList(proId) {
    return request({
        url: `clean/attendance/forIndex/${proId}`,
        method: 'get'
    })
}

// 添加巡查记录
export function addPatrolRecords(data) {
    return request({
        url: 'nblink/attend/patrolTask/',
        method: 'post',
        data
    })
}

// 查询巡查记录
export function getPatrolRecordsList(data) {
    return request({
        url: 'nblink/attend/patrolTask/list',
        method: 'get',
        params: data
    })
}

// 查询员工详情
export function getPersonInfo(data) {
    return request({
        url: 'nblink/attend/worker/info',
        method: 'get',
        params: data
    })
}