import React, { createContext } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
// creates a beautiful scrollbar
import PerfectScrollbar from 'perfect-scrollbar';
// @material-ui/core components
import {
  makeStyles,
  createTheme,
  ThemeProvider,
} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import useWebSocket from 'app/hook/websocket/useWebSocket';
// core components
import useInitData from 'app/hook/init/useInitData';
import DefaultSnackbar from 'app/components/Snackbar/DefaultSnackbar';
import Navbar from '../components/Navbars/Navbar';
// import Footer from "../components/Footer/Footer";
import Sidebar from '../components/Sidebar/Sidebar';
import FixedPlugin from '../components/FixedPlugin/FixedPlugin';

import routes from '../routes';

import styles from '../assets/jss/material-dashboard-react/layouts/adminStyle';

import bgImage from '../assets/img/sidebar-2.jpg';
import logo from '../assets/img/reactlogo.png';

let ps: PerfectScrollbar;

const switchRoutes = (
  <Switch>
    {routes.map((prop) => {
      if (prop.layout === '/admin') {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={prop.layout + prop.path}
          />
        );
      }
      return null;
    })}
    <Redirect from="/admin" to="/admin/entertain" />
  </Switch>
);

const darkTheme = createTheme({
  palette: {
    type: 'dark',
  },
});
const useStyles = makeStyles(styles);

export const WebSocketContext = createContext<
  SocketIOClient.Socket | undefined
>(undefined);

export default function Admin({ ...rest }) {
  // styles
  const classes = useStyles();
  // ref to help us initialize PerfectScrollbar on windows devices
  const mainPanel = React.createRef<HTMLDivElement>();
  // states and functions
  const [image, setImage] = React.useState(bgImage);
  const [color, setColor] = React.useState('blue');
  const [fixedClasses, setFixedClasses] = React.useState('dropdown show');
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [webSocket] = useWebSocket();
  useInitData();

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
    return window.location.pathname !== '/admin/maps';
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
      <ThemeProvider theme={darkTheme}>
        <DefaultSnackbar />
        <div className={classes.wrapper}>
          {/* 修复样式错误 */}
          <CssBaseline />
          {/** 侧边选项卡 */}
          <Sidebar
            routes={routes}
            logoText="小白客服系统" // 客服
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
                <div className={classes.container}>{switchRoutes}</div>
              </div>
            ) : (
              <div className={classes.map}>{switchRoutes}</div>
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
      </ThemeProvider>
    </WebSocketContext.Provider>
  );
}
