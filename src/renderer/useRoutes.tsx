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
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// @material-ui/icons
import SvgIcon, { SvgIconTypeMap } from '@material-ui/core/SvgIcon';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import Dashboard from '@material-ui/icons/Dashboard';
import ContactPhoneIcon from '@material-ui/icons/ContactPhone';
import QueryBuilderIcon from '@material-ui/icons/QueryBuilder';
import CommentIcon from '@material-ui/icons/Comment';
import SettingsIcon from '@material-ui/icons/Settings';
import EventAvailableIcon from '@material-ui/icons/EventAvailable';
import BotDetail from './components/Bot/BotDetail';
// import BotView from './views/Bot/BotView';
// core components/views for Admin layout
// core components/views for RTL layout

function BotIcon(props: SvgIconTypeMap) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <SvgIcon {...props}>
      <path d="M17.753 14a2.25 2.25 0 0 1 2.25 2.25v.904A3.75 3.75 0 0 1 18.696 20c-1.565 1.344-3.806 2-6.696 2c-2.89 0-5.128-.656-6.69-2a3.75 3.75 0 0 1-1.306-2.843v-.908A2.25 2.25 0 0 1 6.254 14h11.5ZM11.9 2.006L12 2a.75.75 0 0 1 .743.648l.007.102l-.001.749h3.5a2.25 2.25 0 0 1 2.25 2.25v4.505a2.25 2.25 0 0 1-2.25 2.25h-8.5a2.25 2.25 0 0 1-2.25-2.25V5.75A2.25 2.25 0 0 1 7.75 3.5l3.5-.001V2.75a.75.75 0 0 1 .649-.743L12 2l-.102.007ZM9.749 6.5a1.25 1.25 0 1 0 0 2.498a1.25 1.25 0 0 0 0-2.498Zm4.493 0a1.25 1.25 0 1 0 0 2.498a1.25 1.25 0 0 0 0-2.498Z" />
    </SvgIcon>
  );
}

const Entertain = React.lazy(() => import('./views/Entertain/Entertain'));
const DashboardPage = React.lazy(() => import('./views/Dashboard/Dashboard'));
const OnlineVersion = React.lazy(
  () => import('./views/Dashboard/OnlineVersion')
);
const StaffAttendance = React.lazy(
  () => import('./views/Dashboard/StaffAttendance')
);
const ChatHistory = React.lazy(
  () => import('renderer/views/ChatHistory/ChatHistory')
);
const StaffAttendanceDataGrid = React.lazy(
  () => import('./views/Attendance/StaffAttendanceDataGrid')
);
const CommentManagement = React.lazy(
  () => import('./views/Comment/CommentManagement')
);
const Crm = React.lazy(() => import('renderer/views/Crm/Crm'));
const BotView = React.lazy(() => import('renderer/views/Bot/BotView'));
const Setting = React.lazy(() => import('renderer/views/Setting/Settings'));

const useRoutes = () => {
  const { t } = useTranslation();

  const dashboardRoutes = useMemo(
    () => [
      {
        path: '/entertain',
        name: t('Online Chat'),
        rtlName: 'لوحة القيادة',
        icon: QuestionAnswerIcon,
        component: Entertain,
        layout: '/admin',
        showInSidebar: true,
      },
      {
        path: '/dashboard',
        name: t('Monitor&Statistics'),
        rtlName: 'لوحة القيادة',
        icon: Dashboard,
        component: window.electron ? DashboardPage : OnlineVersion, // OnlineVersion,
        layout: '/admin',
        authority: ['admin'],
        showInSidebar: true,
      },
      {
        path: '/staff-attendance',
        name: t('Staff Attendance'),
        rtlName: 'لوحة القيادة',
        icon: EventAvailableIcon,
        component: window.electron ? StaffAttendance : OnlineVersion, // OnlineVersion,
        layout: '/admin',
        authority: ['admin'],
        showInSidebar: true,
      },
      {
        path: '/history',
        name: t('Chat History'),
        rtlName: 'لوحة القيادة',
        icon: QueryBuilderIcon,
        component: ChatHistory,
        layout: '/admin',
        showInSidebar: true,
      },
      {
        path: '/sa-data-grid',
        name: t('S-A Table'),
        rtlName: 'لوحة القيادة',
        icon: EventAvailableIcon,
        component: StaffAttendanceDataGrid,
        layout: '/admin',
        authority: ['admin'],
        showInSidebar: true,
      },
      {
        path: '/comment',
        name: t('Message Manage'),
        rtlName: 'لوحة القيادة',
        icon: CommentIcon,
        component: CommentManagement,
        layout: '/admin',
        showInSidebar: true,
      },
      {
        path: '/crm',
        name: t('CRM'),
        rtlName: 'لوحة القيادة',
        icon: ContactPhoneIcon,
        component: Crm,
        layout: '/admin',
        showInSidebar: true,
      },
      {
        path: '/bot',
        name: t('Bot'),
        rtlName: 'لوحة القيادة',
        icon: BotIcon,
        component: BotView,
        layout: '/admin',
        authority: ['admin'],
        showInSidebar: true,
      },
      {
        path: '/setting',
        name: t('Setting'),
        rtlName: 'لوحة القيادة',
        icon: SettingsIcon,
        component: Setting,
        layout: '/admin',
        showInSidebar: true,
      },
      {
        path: '/bot/detail',
        name: t('Knowledge base'),
        component: BotDetail,
        layout: '/admin',
        showInSidebar: false,
        parentPath: '/bot',
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
    ],
    [t]
  );

  return dashboardRoutes;
};

export type RouteType = ReturnType<typeof useRoutes>;

export default useRoutes;
