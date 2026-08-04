import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import AppDashboard from '../AppDashboard.vue'
import OfficeIndex from '../views/Office/Index.vue'
import DistrictIndex from '../views/District/Index.vue'
import UserIndex from '../views/User/Index.vue'
import AttendanceIndex from '../views/Attendance/Index.vue'
import ConfigurationIndex from '../views/Configuration/Index.vue'
import AppealIndex from '../views/Appeal/Index.vue'
import LateListIndex from '../views/LateList/Index.vue'
import AccountIndex from '../views/Account/Index.vue'
import AccountView from '../views/Account/View.vue'
import ReportIndex from '../views/Report/Index.vue'
import PostingRequestIndex from '../views/PostingRequest/Index.vue'
import LeaveIndex from '../views/Leave/Index.vue'
import MyAttendanceIndex from '../views/MyAttendance/Index.vue'
import MyAttendanceHistory from '../views/MyAttendance/History.vue'
import ChangeOfficeIndex from '../views/ChangeOffice/Index.vue'
import AttendanceAppealIndex from '../views/AttendanceAppeal/Index.vue'
import HomeIndex from '../views/Home/Index.vue'
import CalendarIndex from '../views/Calendar/Index.vue'
import NotificationIndex from '../views/Notification/Index.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeIndex
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: AppDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/offices',
    name: 'Offices',
    component: OfficeIndex,
    meta: { requiresAuth: true }
  },
  {
    path: '/districts',
    name: 'Districts',
    component: DistrictIndex,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: UserIndex,
    meta: { requiresAuth: true }
  },
  {
    path: '/attendances',
    name: 'Attendances',
    component: AttendanceIndex,
    meta: { requiresAuth: true }
  },
  {
    path: '/appeals',
    name: 'Appeals',
    component: AppealIndex,
    meta: { requiresAuth: true }
  },
  {
    path: '/late-list',
    name: 'LateList',
    component: LateListIndex,
    meta: { requiresAuth: true }
  },
  {
    path: '/accounts',
    name: 'Accounts',
    component: AccountIndex,
    meta: { requiresAuth: true }
  },
  {
    path: '/accounts/view/:id',
    name: 'AccountView',
    component: AccountView,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: ReportIndex,
    meta: { requiresAuth: true }
  },
  {
    path: '/posting-requests',
    name: 'PostingRequests',
    component: PostingRequestIndex,
    meta: { requiresAuth: true }
  },
  {
    path: '/leaves',
    name: 'Leaves',
    component: LeaveIndex,
    meta: { requiresAuth: true }
  },
  {
    path: '/config',
    name: 'Configuration',
    component: ConfigurationIndex,
    meta: { requiresAuth: true }
  },
  {
    path: '/my-attendance',
    name: 'MyAttendance',
    component: MyAttendanceIndex,
    meta: { requiresAuth: true }
  },
  {
    path: '/my-attendance/history',
    name: 'MyAttendanceHistory',
    component: MyAttendanceHistory,
    meta: { requiresAuth: true }
  },
  {
    path: '/change-office',
    name: 'ChangeOffice',
    component: ChangeOfficeIndex,
    meta: { requiresAuth: true }
  },
  {
    path: '/attendance-appeal',
    name: 'AttendanceAppeal',
    component: AttendanceAppealIndex,
    meta: { requiresAuth: true }
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: CalendarIndex,
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: NotificationIndex,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/') && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
