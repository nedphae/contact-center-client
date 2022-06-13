/*!

=========================================================
* Material Dashboard React - v1.8.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/material-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
// @material-ui/icons
import React from 'react';

import SvgIcon, { SvgIconTypeMap } from '@material-ui/core/SvgIcon';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import Dashboard from '@material-ui/icons/Dashboard';
import ContactPhoneIcon from '@material-ui/icons/ContactPhone';
import QueryBuilderIcon from '@material-ui/icons/QueryBuilder';
import CommentIcon from '@material-ui/icons/Comment';
import SettingsIcon from '@material-ui/icons/Settings';
import EventAvailableIcon from '@material-ui/icons/EventAvailable';
// core components/views for Admin layout
import ChatHistory from 'renderer/views/ChatHistory/ChatHistory';
import Crm from 'renderer/views/Crm/Crm';
import Bot from 'renderer/views/Bot/Bot';
import Setting from 'renderer/views/Setting/Settings';
import Entertain from './views/Entertain/Entertain';
import DashboardPage from './views/Dashboard/Dashboard';
import StaffAttendance from './views/Dashboard/StaffAttendance';
// core components/views for RTL layout
import CommentManagement from './views/Comment/CommentManagement';

function BotIcon(props: SvgIconTypeMap) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <SvgIcon {...props}>
      <path d="M17.753 14a2.25 2.25 0 0 1 2.25 2.25v.904A3.75 3.75 0 0 1 18.696 20c-1.565 1.344-3.806 2-6.696 2c-2.89 0-5.128-.656-6.69-2a3.75 3.75 0 0 1-1.306-2.843v-.908A2.25 2.25 0 0 1 6.254 14h11.5ZM11.9 2.006L12 2a.75.75 0 0 1 .743.648l.007.102l-.001.749h3.5a2.25 2.25 0 0 1 2.25 2.25v4.505a2.25 2.25 0 0 1-2.25 2.25h-8.5a2.25 2.25 0 0 1-2.25-2.25V5.75A2.25 2.25 0 0 1 7.75 3.5l3.5-.001V2.75a.75.75 0 0 1 .649-.743L12 2l-.102.007ZM9.749 6.5a1.25 1.25 0 1 0 0 2.498a1.25 1.25 0 0 0 0-2.498Zm4.493 0a1.25 1.25 0 1 0 0 2.498a1.25 1.25 0 0 0 0-2.498Z" />
    </SvgIcon>
  );
}
const dashboardRoutes = [
  {
    path: '/entertain',
    name: '在线聊天',
    rtlName: 'لوحة القيادة',
    icon: QuestionAnswerIcon,
    component: Entertain,
    layout: '/admin',
  },
  {
    path: '/dashboard',
    name: '监控统计',
    rtlName: 'لوحة القيادة',
    icon: Dashboard,
    component: DashboardPage,
    layout: '/admin',
    authority: ['admin'],
  },
  {
    path: '/staff-attendance',
    name: '考勤统计',
    rtlName: 'لوحة القيادة',
    icon: EventAvailableIcon,
    component: StaffAttendance,
    layout: '/admin',
    authority: ['admin'],
  },
  {
    path: '/history',
    name: '历史记录',
    rtlName: 'لوحة القيادة',
    icon: QueryBuilderIcon,
    component: ChatHistory,
    layout: '/admin',
  },
  {
    path: '/comment',
    name: '留言管理',
    rtlName: 'لوحة القيادة',
    icon: CommentIcon,
    component: CommentManagement,
    layout: '/admin',
  },
  {
    path: '/crm',
    name: '客户资源',
    rtlName: 'لوحة القيادة',
    icon: ContactPhoneIcon,
    component: Crm,
    layout: '/admin',
  },
  {
    path: '/bot',
    name: '机器人',
    rtlName: 'لوحة القيادة',
    icon: BotIcon,
    component: Bot,
    layout: '/admin',
    authority: ['admin'],
  },
  {
    path: '/setting',
    name: '设置',
    rtlName: 'لوحة القيادة',
    icon: SettingsIcon,
    component: Setting,
    layout: '/admin',
  },
  // {
  //   path: '/table',
  //   name: '列表',
  //   rtlName: 'قائمة الجدول',
  //   icon: 'content_paste',
  //   component: TableList,
  //   layout: '/admin',
  // },
  // {
  //   path: '/user',
  //   name: '用户资料',
  //   rtlName: 'ملف تعريفي للمستخدم',
  //   icon: Person,
  //   component: UserProfile,
  //   layout: '/admin',
  // },
  // {
  //   path: '/typography',
  //   name: '版式',
  //   rtlName: 'طباعة',
  //   icon: LibraryBooks,
  //   component: Typography,
  //   layout: '/admin',
  // },
  // {
  //   path: '/icons',
  //   name: '图标',
  //   rtlName: 'الرموز',
  //   icon: BubbleChart,
  //   component: Icons,
  //   layout: '/admin',
  // },
  // {
  //   path: '/maps',
  //   name: '地图',
  //   rtlName: 'خرائط',
  //   icon: LocationOn,
  //   component: Maps,
  //   layout: '/admin',
  // },
  // {
  //   path: '/notifications',
  //   name: '通知',
  //   rtlName: 'إخطارات',
  //   icon: Notifications,
  //   component: NotificationsPage,
  //   layout: '/admin',
  // },
  // {
  //   path: '/rtl-page',
  //   name: 'RTL 支持',
  //   rtlName: 'پشتیبانی از راست به چپ',
  //   icon: Language,
  //   component: RTLPage,
  //   layout: '/rtl',
  // },
  // {
  //   path: '/upgrade-to-pro',
  //   name: 'Upgrade To PRO',
  //   rtlName: 'التطور للاحترافية',
  //   icon: Unarchive,
  //   component: UpgradeToPro,
  //   layout: '/admin',
  // },
];

export type RouteType = typeof dashboardRoutes;

export default dashboardRoutes;
