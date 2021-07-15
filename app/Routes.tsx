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
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import Dashboard from '@material-ui/icons/Dashboard';
import Person from '@material-ui/icons/Person';
import QueryBuilderIcon from '@material-ui/icons/QueryBuilder';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import BubbleChart from '@material-ui/icons/BubbleChart';
import LocationOn from '@material-ui/icons/LocationOn';
import Notifications from '@material-ui/icons/Notifications';
import Unarchive from '@material-ui/icons/Unarchive';
import Language from '@material-ui/icons/Language';
import SettingsIcon from '@material-ui/icons/Settings';
// core components/views for Admin layout
import ChatHistory from 'app/views/ChatHistory/ChatHistory';
import Crm from 'app/views/Crm/Crm';
import Bot from 'app/views/Bot/Bot';
import Setting from 'app/views/Setting/Settings';
import Entertain from './views/Entertain/Entertain';
import DashboardPage from './views/Dashboard/Dashboard';
import UserProfile from './views/UserProfile/UserProfile';
import TableList from './views/TableList/TableList';
import Typography from './views/Typography/Typography';
import Icons from './views/Icons/Icons';
import Maps from './views/Maps/Maps';
import NotificationsPage from './views/Notifications/Notifications';
import UpgradeToPro from './views/UpgradeToPro/UpgradeToPro';
// core components/views for RTL layout
import RTLPage from './views/RTLPage/RTLPage';

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
    name: '仪表板',
    rtlName: 'لوحة القيادة',
    icon: Dashboard,
    component: DashboardPage,
    layout: '/admin',
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
    path: '/crm',
    name: '客户资源',
    rtlName: 'لوحة القيادة',
    icon: QueryBuilderIcon,
    component: Crm,
    layout: '/admin',
  },
  {
    path: '/bot',
    name: '机器人配置',
    rtlName: 'لوحة القيادة',
    icon: QueryBuilderIcon,
    component: Bot,
    layout: '/admin',
  },
  {
    path: '/setting',
    name: '设置',
    rtlName: 'لوحة القيادة',
    icon: SettingsIcon,
    component: Setting,
    layout: '/admin',
  },
  {
    path: '/table',
    name: '列表',
    rtlName: 'قائمة الجدول',
    icon: 'content_paste',
    component: TableList,
    layout: '/admin',
  },
  {
    path: '/user',
    name: '用户资料',
    rtlName: 'ملف تعريفي للمستخدم',
    icon: Person,
    component: UserProfile,
    layout: '/admin',
  },
  {
    path: '/typography',
    name: '版式',
    rtlName: 'طباعة',
    icon: LibraryBooks,
    component: Typography,
    layout: '/admin',
  },
  {
    path: '/icons',
    name: '图标',
    rtlName: 'الرموز',
    icon: BubbleChart,
    component: Icons,
    layout: '/admin',
  },
  {
    path: '/maps',
    name: '地图',
    rtlName: 'خرائط',
    icon: LocationOn,
    component: Maps,
    layout: '/admin',
  },
  {
    path: '/notifications',
    name: '通知',
    rtlName: 'إخطارات',
    icon: Notifications,
    component: NotificationsPage,
    layout: '/admin',
  },
  {
    path: '/rtl-page',
    name: 'RTL 支持',
    rtlName: 'پشتیبانی از راست به چپ',
    icon: Language,
    component: RTLPage,
    layout: '/rtl',
  },
  {
    path: '/upgrade-to-pro',
    name: 'Upgrade To PRO',
    rtlName: 'التطور للاحترافية',
    icon: Unarchive,
    component: UpgradeToPro,
    layout: '/admin',
  },
];

export default dashboardRoutes;
