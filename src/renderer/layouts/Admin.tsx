import React, { createContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { debounceTime, Subject } from 'rxjs';
// creates a beautiful scrollbar
import PerfectScrollbar from 'perfect-scrollbar';
import { ToastContainer } from 'react-toastify';
import './ReactToastify.global.css';
// @material-ui/core components
import { makeStyles, useTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import useWebSocket from 'renderer/hook/websocket/useWebSocket';
// core components
import useInitData from 'renderer/hook/data/useInitData';
import TransferSnackbar from 'renderer/components/Snackbar/TransferSnackbar';
import {
  clearPlayNewMessageSound,
  getPlayNewMessageSound,
} from 'renderer/state/chat/chatAction';
import useAutoLoadConv from 'renderer/hook/data/useAutoLoadConv';
import useRoutes from 'renderer/useRoutes';
import styles from 'renderer/assets/jss/material-dashboard-react/layouts/adminStyle';

import bgImage from 'renderer/assets/img/sidebar-4.jpg';
import logo from 'renderer/assets/img/logo.ico';
import newMsgSound from 'renderer/assets/sounds/new-msg.wav';

import { getDownloadS3ChatImgPath } from 'renderer/config/clientConfig';
import Navbar from '../components/Navbars/Navbar';
// import Footer from "../components/Footer/Footer";
import Sidebar from '../components/Sidebar/Sidebar';

let ps: PerfectScrollbar;

const useStyles = makeStyles(styles);

export const WebSocketContext = createContext<
  SocketIOClient.Socket | undefined
>(undefined);

const subjectMessage = new Subject<void>();

export default function Admin({ ...rest }) {
  // styles
  const classes = useStyles();
  const theme = useTheme();
  const dispatch = useDispatch();
  const routes = useRoutes();
  const { t } = useTranslation();

  // ref to help us initialize PerfectScrollbar on windows devices
  const mainPanel = React.createRef<HTMLDivElement>();
  // states and functions
  const [image, setImage] = React.useState(bgImage);
  const [color, setColor] = React.useState('blue');
  const [fixedClasses, setFixedClasses] = React.useState('dropdown show');
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [refetch] = useAutoLoadConv();
  // socket 重连后需要同步一下会话
  const [webSocket] = useWebSocket(refetch);
  const { prop } = useInitData();
  // const [play] = useSound(newMsgSound);
  window.audio = new Audio(
    prop?.value ? `${getDownloadS3ChatImgPath()}${prop?.value}` : newMsgSound
  );

  const momeSubject = useMemo(() => {
    return subjectMessage.pipe(debounceTime(1500)).subscribe({
      next: () => {
        window.audio.play();
        if (document.hidden) {
          const notification = new Notification(t('New Message'), {
            body: t('View Message'),
            silent: true,
            icon: logo,
          });
          notification.onclick = () => {
            window.electron.ipcRenderer.sendMessage('show-main-window');
          };
          setTimeout(() => {
            notification.close();
          }, 5000);
        }
        dispatch(clearPlayNewMessageSound());
      },
    });
  }, [dispatch, t]);

  const currentPath = useLocation().pathname;
  const playNewMessageSound = useSelector(getPlayNewMessageSound);
  // 判断是否在聊天界面
  useEffect(() => {
    if (
      playNewMessageSound &&
      (!currentPath.includes('/entertain') || document.hidden)
    ) {
      // 延迟设置提示音，防止太多提示音
      subjectMessage.next();
    }
  }, [currentPath, dispatch, playNewMessageSound]);

  useEffect(() => {
    return () => {
      momeSubject.unsubscribe();
    };
  }, [momeSubject]);

  const handleImageClick = (selectImage: React.SetStateAction<string>) => {
    setImage(selectImage);
  };
  const handleColorClick = (selectColor: React.SetStateAction<string>) => {
    setColor(selectColor);
  };
  const handleFixedClick = () => {
    if (fixedClasses === 'dropdown') {
      setFixedClasses('dropdown show');
    } else {
      setFixedClasses('dropdown');
    }
  };
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const getRoute = () => {
    return !currentPath.includes('/admin/entertain');
  };
  const resizeFunction = () => {
    if (window.innerWidth >= 960) {
      setMobileOpen(false);
    }
  };
  // initialize and destroy the PerfectScrollbar plugin
  React.useEffect(() => {
    if (navigator.platform.indexOf('Win') > -1 && mainPanel.current) {
      ps = new PerfectScrollbar(mainPanel.current, {
        suppressScrollX: true,
        suppressScrollY: false,
      });
      document.body.style.overflow = 'hidden';
    }
    window.addEventListener('resize', resizeFunction);
    // Specify how to clean up after this effect:
    return function cleanup() {
      if (navigator.platform.indexOf('Win') > -1) {
        ps.destroy();
      }
      window.removeEventListener('resize', resizeFunction);
    };
  }, [mainPanel]);
  return (
    <WebSocketContext.Provider value={webSocket}>
      <TransferSnackbar />
      {/* <DefaultSnackbar /> */}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        // pauseOnHover
        theme={theme.palette.type}
      />
      <div className={classes.wrapper}>
        {/* 修复样式错误 */}
        <CssBaseline />
        {/** 侧边选项卡 */}
        <Sidebar
          routes={routes}
          // logoText="小白客服系统" // 客服
          logo={logo}
          image={image}
          handleDrawerToggle={handleDrawerToggle}
          open={mobileOpen}
          color={color}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...rest}
        />
        <div className={classes.mainPanel} ref={mainPanel}>
          {/** 此处的 routes 仅仅获取 routes 对应的选项卡名称作为 appbar(应用头部) 显示 */}
          <Navbar
            routes={routes}
            handleDrawerToggle={handleDrawerToggle}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
          />
          {/* On the /maps route we want the map to be on full screen - this is not possible if the content and conatiner classes are present because they have some paddings which would make the map smaller */}
          {getRoute() ? (
            <div className={classes.content}>
              <div className={classes.container}>
                <Outlet />
              </div>
            </div>
          ) : (
            <div className={classes.map}>
              <Outlet />
            </div>
          )}
          {/* {getRoute() ? <Footer /> : null} */}
          {/* <FixedPlugin
            handleImageClick={handleImageClick}
            handleColorClick={handleColorClick}
            bgColor={color}
            bgImage={image}
            handleFixedClick={handleFixedClick}
            fixedClasses={fixedClasses}
          /> */}
        </div>
      </div>
    </WebSocketContext.Provider>
  );
}
