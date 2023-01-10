/*eslint-disable*/
import React from 'react';
import classNames from 'classnames';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { NavLink, useLocation } from 'react-router-dom';
// @material-ui/core components
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Icon from '@material-ui/core/Icon';
// core components
import AdminNavbarLinks from '../Navbars/AdminNavbarLinks';
import RTLNavbarLinks from '../Navbars/RTLNavbarLinks';

import styles from '../../assets/jss/material-dashboard-react/components/sidebarStyle';
import { RouteType } from 'renderer/useRoutes';
import { checkPermissions } from '../Authorized/CheckPermissions';
import { CURRENT } from '../Authorized/renderAuthorize';
import { Badge, Tooltip } from '@material-ui/core';
import { useAppSelector } from 'renderer/store';
import { getTotalUnreadCount } from 'renderer/state/session/sessionAction';

const useStyles = makeStyles(styles);

const BiggerTooltip = withStyles((theme) => ({
  tooltip: {
    fontSize: 15,
  },
}))(Tooltip);

export default function Sidebar(props: {
  rtlActive?: any;
  open?: any;
  handleDrawerToggle?: any;
  color?: any;
  logo?: any;
  image?: any;
  logoText?: any;
  routes?: RouteType;
}) {
  const classes = useStyles();
  let location = useLocation();
  const totalUnreadCount = useAppSelector(getTotalUnreadCount);

  // verifies if routeName is the one active (in browser input)
  function activeRoute(routeName: string) {
    // 修复 生产版本无法刷新此组件的 bug
    return location.pathname.indexOf(routeName) > -1 ? true : false;
    // return window.location.href.indexOf(routeName) > -1 ? true : false;
  }
  const { color, logo, image, logoText, routes } = props;
  var links = (
    <List className={classes.list}>
      {routes &&
        routes
          .filter((it) => checkPermissions(it.authority, CURRENT, true, false) && it.showInSidebar)
          .map(
            (
              prop: {
                path: string;
                layout: any;
                icon: any | null | undefined;
                rtlName: string;
                name: string;
              },
              key: string | number | undefined
            ) => {
              var activePro = ' ';
              var listItemClasses;
              if (prop.path === '/upgrade-to-pro') {
                activePro = classes.activePro + ' ';
                listItemClasses = classNames({
                  [' ' + classes[color]]: true,
                });
              } else {
                listItemClasses = classNames({
                  [' ' + classes[color]]: activeRoute(prop.layout + prop.path),
                });
              }
              const whiteFontClasses = classNames({
                [' ' + classes.whiteFont]: activeRoute(prop.layout + prop.path),
              });

              const menuIcon =
                typeof prop.icon === 'string' ? (
                  <Icon
                    className={classNames(classes.itemIcon, whiteFontClasses, {
                      [classes.itemIconRTL]: props.rtlActive,
                    })}
                  >
                    {prop.icon}
                  </Icon>
                ) : (
                  <prop.icon
                    className={classNames(classes.itemIcon, whiteFontClasses, {
                      [classes.itemIconRTL]: props.rtlActive,
                    })}
                  />
                );
              return (
                <NavLink
                  to={prop.layout + prop.path}
                  className={(navData) =>
                    navData.isActive ? 'active' : '' + activePro + classes.item
                  }
                  key={key}
                >
                  <BiggerTooltip title={props.rtlActive ? prop.rtlName : prop.name} placement="right">
                  <ListItem
                    button
                    className={classes.itemLink + listItemClasses}
                  >
                    {prop.path === '/entertain' ? (
                      <Badge
                        badgeContent={totalUnreadCount}
                        max={99}
                        color="secondary"
                        style={{display: 'inline'}}
                      >
                        {menuIcon}
                      </Badge>
                    ) : (
                      menuIcon
                    )}
                    <ListItemText
                      // primary={props.rtlActive ? prop.rtlName : prop.name}
                      primary="&nbsp;"
                      className={classNames(
                        classes.itemText,
                        whiteFontClasses,
                        {
                          [classes.itemTextRTL]: props.rtlActive,
                          // [classes.itemTextHidden]: true,
                        }
                      )}
                      disableTypography={true}
                    />
                  </ListItem>
                  </BiggerTooltip>
                </NavLink>
              );
            }
          )}
    </List>
  );
  var brand = (
    <div className={classes.logo}>
      <a
        //href="https://www.creative-tim.com?ref=mdr-sidebar" // TODO 后期添加上官网介绍
        className={classNames(classes.logoLink, {
          [classes.logoLinkRTL]: props.rtlActive,
        })}
        target="_blank"
      >
        <div className={classes.logoImage}>
          <img src={logo} alt="logo" className={classes.img} />
        </div>
        {/* {logoText} */}
      </a>
    </div>
  );
  return (
    <div>
      <Hidden mdUp implementation="css">
        <Drawer
          variant="temporary"
          anchor={props.rtlActive ? 'left' : 'right'}
          open={props.open}
          classes={{
            paper: classNames(classes.drawerPaper, {
              [classes.drawerPaperRTL]: props.rtlActive,
            }),
          }}
          onClose={props.handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          {brand}
          <div className={classes.sidebarWrapper}>
            {props.rtlActive ? <RTLNavbarLinks /> : <AdminNavbarLinks />}
            {links}
          </div>
          {image !== undefined ? (
            <div
              className={classes.background}
              style={{ backgroundImage: 'url(' + image + ')' }}
            />
          ) : null}
        </Drawer>
      </Hidden>
      <Hidden smDown implementation="css">
        <Drawer
          anchor={props.rtlActive ? 'right' : 'left'}
          variant="permanent"
          open
          className={clsx(classes.drawer, {
            // [classes.drawerOpen]: false,
            // [classes.drawerClose]: true,
          })}
          classes={{
            paper: classNames(classes.drawerPaper, {
              [classes.drawerPaperRTL]: props.rtlActive,
              // [classes.drawerOpen]: false,
              // [classes.drawerClose]: true,
            }),
          }}
        >
          {brand}
          <div className={classes.sidebarWrapper}>{links}</div>
          {image !== undefined ? (
            <div
              className={classes.background}
              style={{ backgroundImage: 'url(' + image + ')' }}
            />
          ) : null}
        </Drawer>
      </Hidden>
    </div>
  );
}

Sidebar.propTypes = {
  rtlActive: PropTypes.bool,
  handleDrawerToggle: PropTypes.func,
  color: PropTypes.oneOf(['purple', 'blue', 'green', 'orange', 'red']),
  logo: PropTypes.string,
  image: PropTypes.string,
  logoText: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object),
  open: PropTypes.bool,
};
