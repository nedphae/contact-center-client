import {
  drawerWidth,
  transition,
  container,
} from '../../material-dashboard-react';

const appStyle: any = (theme: {
  breakpoints: { up: (arg0: string) => any };
}) => ({
  wrapper: {
    position: 'sticky',
    top: '0',
    // 自定义标题栏时为 height: 'calc(100vh - 30px)',
    height: '100vh',
  },
  mainPanel: {
    [theme.breakpoints.up('md')]: {
      height: '100vh',
      width: `calc(100% - ${drawerWidth}px)`,
    },
    overflowX: 'hidden',
    overflowY: 'auto',
    position: 'relative',
    float: 'right',
    ...transition,
    maxHeight: '100%',
    width: '100%',
    overflowScrolling: 'touch',
  },
  content: {
    marginTop: '70px',
    // padding: '30px 15px',
    height: `calc(100vh - 70px)`,
  },
  container,
  map: {
    marginTop: '70px',
    height: `calc(100vh - 70px)`,
  },
});

export default appStyle;
