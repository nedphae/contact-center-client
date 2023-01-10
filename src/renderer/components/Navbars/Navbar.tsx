import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Hidden from '@material-ui/core/Hidden';
// @material-ui/icons
import Menu from '@material-ui/icons/Menu';
// core components
import { Breadcrumbs, Link, Typography } from '@material-ui/core';
import { NavLink } from 'react-router-dom';
import AdminNavbarLinks from './AdminNavbarLinks';
import RTLNavbarLinks from './RTLNavbarLinks';
import Button from '../CustomButtons/Button';

import styles from '../../assets/jss/material-dashboard-react/components/headerStyle';

const useStyles = makeStyles(styles);

export default function Header(props: {
  routes?: any[];
  rtlActive?: any;
  handleDrawerToggle?: any;
  color?: any;
}) {
  const classes = useStyles();

  function getParentPath(parentPath: string) {
    let thisParentPath;
    props.routes.forEach(
      (prop: { layout: any; path: any; rtlName: any; name: any }) => {
        if (prop.path === parentPath) {
          thisParentPath = prop;
        }
      }
    );
    if (thisParentPath && thisParentPath.parentPath) {
      return [...getParentPath(thisParentPath.parentPath), thisParentPath];
    }
    return [thisParentPath];
  }

  function makeBrand() {
    let name;
    let route;
    props.routes.map(
      (prop: { layout: any; path: any; rtlName: any; name: any }) => {
        if (window.location.href.indexOf(prop.layout + prop.path) !== -1) {
          route = prop;
          name = props.rtlActive ? prop.rtlName : prop.name;
        }
        return null;
      }
    );
    let routeList = [];
    if (route && route.parentPath) {
      routeList = getParentPath(route.parentPath);
    }

    const linkList = routeList.map((it) => {
      const { name: tempName } = it;
      return (
        <Link color="inherit" to={it.layout + it.path} component={NavLink}>
          {tempName}
        </Link>
      );
    });

    return [...linkList, <Typography color="textPrimary">{name}</Typography>];
  }
  const { color } = props;
  const appBarClasses = classNames({
    [` ${classes[color]}`]: color,
  });
  return (
    <AppBar className={classes.appBar + appBarClasses}>
      <Toolbar className={classes.container}>
        <div className={classes.flex}>
          {/* Here we create navbar brand, based on route name */}
          {/* href 在本地文件下不起作用 */}
          <Breadcrumbs aria-label="breadcrumb">{makeBrand()}</Breadcrumbs>
        </div>
        <Hidden smDown implementation="css">
          {props.rtlActive ? <RTLNavbarLinks /> : <AdminNavbarLinks />}
        </Hidden>
        <Hidden mdUp implementation="css">
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={props.handleDrawerToggle}
          >
            <Menu />
          </IconButton>
        </Hidden>
      </Toolbar>
    </AppBar>
  );
}

Header.propTypes = {
  color: PropTypes.oneOf(['primary', 'info', 'success', 'warning', 'danger']),
  rtlActive: PropTypes.bool,
  handleDrawerToggle: PropTypes.func,
  routes: PropTypes.arrayOf(PropTypes.object),
  rest: PropTypes.any,
};
