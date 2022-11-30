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
        url: 'clean/attendance/dayApp',
        method: 'get',
        params: data
    })
}

// 考勤日统计详情
export function cleanAttendanceDayInfo(data) {
    return request({
        url: 'clean/attendance/dayAppInfo',
        method: 'get',
        params: data
    })
}

// 考勤月统计
export function cleanAttendanceMonth(data) {
    return request({
        url: 'clean/attendance/monthApp',
        method: 'get',
        params: data
    })
}

// 考勤月统计详情
export function cleanAttendanceMonthInfo(data) {
    return request({
        url: 'clean/attendance/monthAppInfo',
        method: 'get',
        params: data
    })
}

// 考勤月统计出勤详情
export function cleanAttendanceMonthAttendance(data) {
    return request({
        url: 'clean/attendance/monthAttendanceApp',
        method: 'get',
        params: data
    })
}

// 考勤人员统计
export function cleanAttendancePeople(data) {
    return request({
        url: 'clean/attendance/peopleApp',
        method: 'get',
        params: data
    })
}

// 考勤人员详情统计
export function cleanAttendancePeopleInfo(data) {
    return request({
        url: 'clean/attendance/peopleInfoApp',
        method: 'get',
        params: data
    })
}

// 查询考勤列表
export function cleanAttendanceList(data) {
    return request({
        url: 'clean/attendance/app',
        method: 'get',
        params: data
    })
}

// 录入考勤
export function cleanAttendanceUpdate(data) {
    return request({
        url: 'clean/attendance/update',
        method: 'put',
        data
    })
}

// 批量录入考勤
export function cleanAttendanceUpdateBatch(data) {
    return request({
        url: 'clean/attendance/updateBatch',
        method: 'put',
        data
    })
}

// 查询保洁员(考勤管理)
export function cleanbxWorkerList(proId) {
    return request({
        url: `clean/bxWorker/workers/${proId}`,
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