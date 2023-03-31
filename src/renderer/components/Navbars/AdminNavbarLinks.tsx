/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useContext, useMemo } from 'react';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
// @material-ui/core components
import { makeStyles, useTheme } from '@material-ui/core/styles';
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

import Brightness7Icon from '@material-ui/icons/Brightness7';
import Brightness4Icon from '@material-ui/icons/Brightness4';

import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
// core components
import { logout } from 'renderer/service/loginService';
import { Badge, Avatar, CssBaseline, IconButton } from '@material-ui/core';
import {
  clearToken,
  getMyself,
  setOnlineAndInterval,
} from 'renderer/state/staff/staffAction';
import { OnlineStatus, OnlineStatusKey } from 'renderer/domain/constant/Staff';
import Staff from 'renderer/domain/StaffInfo';
import { gql, useMutation } from '@apollo/client';
import { getDownloadS3StaffImgPath } from 'renderer/config/clientConfig';
import { ColorModeContext } from 'renderer/HomePage';
import { useAppDispatch } from 'renderer/store';
import Button from '../CustomButtons/Button';

import styles from '../../assets/jss/material-dashboard-react/components/headerLinksStyle';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';

const useStyles = makeStyles(styles);

function getOnlineStatusIcon(onlineStatus: OnlineStatusKey) {
  let icon;
  switch (onlineStatus) {
    case 'ONLINE': {
      icon = <LensIcon style={{ color: green.A400 }} />;
      break;
    }
    case 'OFFLINE': {
      icon = <LensIcon style={{ color: grey.A400 }} />;
      break;
    }
    case 'BUSY': {
      icon = <RemoveCircleIcon style={{ color: red.A400 }} />;
      break;
    }
    case 'AWAY': {
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
interface AssignmentGraphql {
  assignmentFromQueue: Staff;
}
const MUTATION = gql`
  mutation UpdateStaffStatus($updateStaffStatus: UpdateStaffStatusInput!) {
    updateStaffStatus(updateStaffStatus: $updateStaffStatus) {
      autoBusy
      currentServiceCount
      groupId
      loginTime
      maxServiceCount
      organizationId
      priorityOfShunt
      role
      shunt
      staffId
      staffType
      userIdList
      onlineStatus
    }
  }
`;

const MUTATION_ASSIGNMENT = gql`
  mutation AssignmentFromQueue($staffStatus: StaffStatusInput!) {
    assignmentFromQueue(staffStatus: $staffStatus) {
      id: staffId
      organizationId
      onlineStatus
    }
  }
`;

export default function AdminNavbarLinks() {
  const classes = useStyles();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [openNotification, setOpenNotification] = React.useState<any>(null);
  const [openProfile, setOpenProfile] = React.useState<any>(null);
  const mySelf = useSelector(getMyself);
  const [updateStaffStatus] = useMutation<Graphql>(MUTATION);
  const [assignmentFromQueue] =
    useMutation<AssignmentGraphql>(MUTATION_ASSIGNMENT);

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
  const handleLogout = async () => {
    setOpenProfile(null);
    // 清除全部 token 缓存
    dispatch(clearToken());
    await logout();
    navigate('/login');
  };
  const handleChangeOnlineStatus = useCallback(
    (onlineStatus: OnlineStatusKey) => () => {
      updateStaffStatus({
        variables: {
          updateStaffStatus: { onlineStatus },
        },
      })
        .then((data) => {
          const staffStatus = data.data?.updateStaffStatus;
          if (staffStatus) {
            const returnOnlineStatus = staffStatus.onlineStatus;
            if (
              returnOnlineStatus !== onlineStatus &&
              returnOnlineStatus === 'OFFLINE'
            ) {
              // 在线状态设置失败，返回的状态不是设置的状态，则更新为离线状态
              // 并提示用户设置失败
              const msg = t(
                'The number of online customer service has reached the upper limit, please try again later'
              );
              toast.warn(msg);
            } else if (
              returnOnlineStatus === 'ONLINE' &&
              !_.isEmpty(JSON.parse(staffStatus.priorityOfShunt))
            ) {
              assignmentFromQueue({
                variables: {
                  staffStatus: _.omit(
                    staffStatus,
                    'onlineStatusKey',
                    '__typename'
                  ),
                },
              });
            }
            dispatch(setOnlineAndInterval(returnOnlineStatus));
          }
          return staffStatus;
        })
        .catch((error) => console.error(error));
      setOpenProfile(null);
    },
    [assignmentFromQueue, dispatch, updateStaffStatus]
  );

  const memoMap = useMemo(() => {
    const map = new Map<OnlineStatus, any>()
      .set(
        OnlineStatus.ONLINE,
        <MenuItem
          key={OnlineStatus.ONLINE}
          onClick={handleChangeOnlineStatus('ONLINE')}
          className={classes.dropdownItem}
        >
          {t('onlineStatus.Online')}
        </MenuItem>
      )
      .set(
        OnlineStatus.BUSY,
        <MenuItem
          key={OnlineStatus.BUSY}
          onClick={handleChangeOnlineStatus('BUSY')}
          className={classes.dropdownItem}
        >
          {t('onlineStatus.Bussy')}
        </MenuItem>
      )
      .set(
        OnlineStatus.AWAY,
        <MenuItem
          key={OnlineStatus.AWAY}
          onClick={handleChangeOnlineStatus('AWAY')}
          className={classes.dropdownItem}
        >
          {t('onlineStatus.Leave')}
        </MenuItem>
      )
      .set(
        OnlineStatus.OFFLINE,
        <MenuItem
          key={OnlineStatus.OFFLINE}
          onClick={handleChangeOnlineStatus('OFFLINE')}
          className={classes.dropdownItem}
        >
          {t('onlineStatus.Offline')}
        </MenuItem>
      );
    return map;
  }, [classes.dropdownItem, handleChangeOnlineStatus, t]);

  function getOnlineStatusMenuItem(onlineStatus: OnlineStatusKey) {
    const map = new Map(memoMap);
    map.delete(OnlineStatus[onlineStatus]);
    return Array.from(map.values());
  }

  return (
    <div>
      <CssBaseline />
      {/*
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
       */}
      <div className={classes.manager}>
        <LanguageSwitcher />
      </div>
      <NavLink
        className={(navData) => (navData.isActive ? 'active' : '')}
        to="/admin/chat"
      >
        <IconButton
          aria-label="Dashboard"
          size="small"
          className={classes.buttonLink}
        >
          <QuestionAnswerIcon fontSize="inherit" />
        </IconButton>
      </NavLink>
      <IconButton
        aria-label="Toggle light/dark theme"
        className={classes.buttonLink}
        onClick={colorMode.toggleColorMode}
        size="small"
      >
        {theme.palette.type === 'dark' ? (
          <Brightness7Icon fontSize="inherit" />
        ) : (
          <Brightness4Icon fontSize="inherit" />
        )}
      </IconButton>
      {/*
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
                      You&apos;re now friend with Andrew
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
       */}
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
            <Avatar
              alt={mySelf.realName}
              src={
                mySelf.avatar
                  ? `${getDownloadS3StaffImgPath()}${mySelf.avatar}`
                  : undefined
              }
            />
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
                    {getOnlineStatusMenuItem(mySelf.onlineStatus)}
                    <Divider light />
                    <MenuItem
                      onClick={handleLogout}
                      className={classes.dropdownItem}
                    >
                      {t('Logout')}
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
