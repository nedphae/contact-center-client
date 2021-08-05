import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import classNames from 'classnames';
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Hidden from '@material-ui/core/Hidden';
import Poppers from '@material-ui/core/Popper';
import Divider from '@material-ui/core/Divider';
import { green, grey, red } from '@material-ui/core/colors';
// @material-ui/icons
// 在线 离线
import LensIcon from '@material-ui/icons/Lens';
// 忙碌
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
// 离开
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import Notifications from '@material-ui/icons/Notifications';
import Dashboard from '@material-ui/icons/Dashboard';
import Search from '@material-ui/icons/Search';
// core components
import { logout } from 'app/service/loginService';
import { Badge, Avatar } from '@material-ui/core';
import { getMyself, updateStatus } from 'app/state/staff/staffAction';
import { OnlineStatus } from 'app/domain/constant/Staff';
import Staff from 'app/domain/StaffInfo';
import { gql, useMutation } from '@apollo/client';
import CustomInput from '../CustomInput/CustomInput';
import Button from '../CustomButtons/Button';

import styles from '../../assets/jss/material-dashboard-react/components/headerLinksStyle';

const useStyles = makeStyles(styles);

function getOnlineStatusIcon(onlineStatus: OnlineStatus) {
  let icon;
  switch (onlineStatus) {
    case OnlineStatus.ONLINE: {
      icon = <LensIcon style={{ color: green.A400 }} />;
      break;
    }
    case OnlineStatus.OFFLINE: {
      icon = <LensIcon style={{ color: grey.A400 }} />;
      break;
    }
    case OnlineStatus.BUSY: {
      icon = <RemoveCircleIcon style={{ color: red.A400 }} />;
      break;
    }
    case OnlineStatus.AWAY: {
      icon = <NotInterestedIcon style={{ color: grey.A400 }} />;
      break;
    }
    default: {
      break;
    }
  }
  return icon;
}

interface Graphql {
  updateStaffStatus: Staff;
}
const MUTATION = gql`
  mutation UpdateStaffStatus($updateStaffStatus: UpdateStaffStatusInput!) {
    updateStaffStatus(updateStaffStatus: $updateStaffStatus) {
      staffId: id
      organizationId
      onlineStatus
    }
  }
`;

export default function AdminNavbarLinks() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [openNotification, setOpenNotification] = React.useState<any>(null);
  const [openProfile, setOpenProfile] = React.useState<any>(null);
  const mySelf = useSelector(getMyself);
  const [updateStaffStatus] = useMutation<Graphql>(MUTATION);

  const handleClickNotification = (event: {
    target: any;
    currentTarget: React.SetStateAction<null>;
  }) => {
    if (openNotification && openNotification.contains(event.target)) {
      setOpenNotification(null);
    } else {
      setOpenNotification(event.currentTarget);
    }
  };
  const handleCloseNotification = () => {
    setOpenNotification(null);
  };
  const handleClickProfile = (event: {
    target: any;
    currentTarget: React.SetStateAction<null>;
  }) => {
    if (openProfile && openProfile.contains(event.target)) {
      setOpenProfile(null);
    } else {
      setOpenProfile(event.currentTarget);
    }
  };
  const handleCloseProfile = () => {
    setOpenProfile(null);
  };
  const handleLogout = () => {
    setOpenProfile(null);
    // 清除全部 token 缓存
    logout();
  };
  const handleChangeOnlineStatus = (onlineStatus: OnlineStatus) => () => {
    updateStaffStatus({
      variables: { updateStaffStatus: { onlineStatus } },
    })
      .then((data) => {
        const staffStatus = data.data?.updateStaffStatus;
        if (staffStatus) {
          dispatch(updateStatus(staffStatus.onlineStatus));
        }
        return staffStatus;
      })
      .catch((error) => console.error(error));
    setOpenProfile(null);
  };
  return (
    <div>
      <div className={classes.searchWrapper}>
        <CustomInput
          formControlProps={{
            className: `${classes.margin} ${classes.search}`,
          }}
          inputProps={{
            placeholder: 'Search',
            inputProps: {
              'aria-label': 'Search',
            },
          }}
        />
        <Button color="white" aria-label="edit" justIcon round>
          <Search />
        </Button>
      </div>
      <Button
        color={window.innerWidth > 959 ? 'transparent' : 'white'}
        justIcon={window.innerWidth > 959}
        simple={!(window.innerWidth > 959)}
        aria-label="Dashboard"
        className={classes.buttonLink}
      >
        <Dashboard className={classes.icons} />
        <Hidden mdUp implementation="css">
          <p className={classes.linkText}>Dashboard</p>
        </Hidden>
      </Button>
      <div className={classes.manager}>
        <Button
          color={window.innerWidth > 959 ? 'transparent' : 'white'}
          justIcon={window.innerWidth > 959}
          simple={!(window.innerWidth > 959)}
          aria-owns={openNotification ? 'notification-menu-list-grow' : null}
          aria-haspopup="true"
          onClick={handleClickNotification}
          className={classes.buttonLink}
        >
          <Notifications className={classes.icons} />
          <span className={classes.notifications}>5</span>
          <Hidden mdUp implementation="css">
            <p onClick={handleCloseNotification} className={classes.linkText}>
              Notification
            </p>
          </Hidden>
        </Button>
        <Poppers
          open={Boolean(openNotification)}
          anchorEl={openNotification}
          transition
          disablePortal
          className={`${classNames({
            [classes.popperClose]: !openNotification,
          })} ${classes.popperNav}`}
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              // id="notification-menu-list-grow"
              style={{
                transformOrigin:
                  placement === 'bottom' ? 'center top' : 'center bottom',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleCloseNotification}>
                  <MenuList role="menu">
                    <MenuItem
                      onClick={handleCloseNotification}
                      className={classes.dropdownItem}
                    >
                      Mike John responded to your email
                    </MenuItem>
                    <MenuItem
                      onClick={handleCloseNotification}
                      className={classes.dropdownItem}
                    >
                      You have 5 new tasks
                    </MenuItem>
                    <MenuItem
                      onClick={handleCloseNotification}
                      className={classes.dropdownItem}
                    >
                      You're now friend with Andrew
                    </MenuItem>
                    <MenuItem
                      onClick={handleCloseNotification}
                      className={classes.dropdownItem}
                    >
                      Another Notification
                    </MenuItem>
                    <MenuItem
                      onClick={handleCloseNotification}
                      className={classes.dropdownItem}
                    >
                      Another One
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Poppers>
      </div>
      <div className={classes.manager}>
        <Button
          color={window.innerWidth > 959 ? 'transparent' : 'white'}
          justIcon={window.innerWidth > 959}
          simple={!(window.innerWidth > 959)}
          aria-owns={openProfile ? 'profile-menu-list-grow' : null}
          aria-haspopup="true"
          onClick={handleClickProfile}
          className={classes.buttonLink}
        >
          {/* <Person className={classes.icons} /> */}
          <Badge
            overlap="circular"
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            badgeContent={getOnlineStatusIcon(mySelf.onlineStatus)}
          >
            <Avatar alt={mySelf.realName} src={mySelf.avatar} />
          </Badge>
          <Hidden mdUp implementation="css">
            <p className={classes.linkText}>Profile</p>
          </Hidden>
        </Button>
        <Poppers
          open={Boolean(openProfile)}
          anchorEl={openProfile}
          transition
          disablePortal
          className={`${classNames({ [classes.popperClose]: !openProfile })} ${
            classes.popperNav
          }`}
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              // id="profile-menu-list-grow"
              style={{
                transformOrigin:
                  placement === 'bottom' ? 'center top' : 'center bottom',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleCloseProfile}>
                  <MenuList role="menu">
                    <MenuItem
                      onClick={handleChangeOnlineStatus(OnlineStatus.AWAY)}
                      className={classes.dropdownItem}
                    >
                      设置离开
                    </MenuItem>
                    <MenuItem
                      onClick={handleChangeOnlineStatus(OnlineStatus.BUSY)}
                      className={classes.dropdownItem}
                    >
                      设置忙碌
                    </MenuItem>
                    <Divider light />
                    <MenuItem
                      onClick={handleLogout}
                      className={classes.dropdownItem}
                    >
                      退出系统
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Poppers>
      </div>
    </div>
  );
}
