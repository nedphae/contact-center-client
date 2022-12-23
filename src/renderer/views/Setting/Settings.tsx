import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import Grid from '@material-ui/core/Grid';

import Authorized from 'renderer/utils/Authorized';
import StyledTreeItem, {
  CloseSquare,
  MinusSquare,
  PlusSquare,
} from 'renderer/components/TreeView/StyledTreeItem';
import Account from 'renderer/components/Settings/personal/Account';
import Group from 'renderer/components/Settings/org/Group';
import AccountList from 'renderer/components/Settings/org/AccountList';
import Shunt from 'renderer/components/Settings/org/Shunt';
import PropertiesFrom from 'renderer/components/Settings/org/PropertiesFrom';
import ComingSoon from 'renderer/components/ComingSoon/ComingSoon';
import BlacklistView from 'renderer/components/Settings/org/BlacklistView';
import SessionCategoryView from 'renderer/components/Settings/org/SessionCategoryView';
import CustomerTagTable from 'renderer/components/Settings/CustomerTag/CustomerTagTable';
import OrgInfo from 'renderer/components/Settings/org/OrgInfo';
import WeChatOpenInfoView from 'renderer/components/Settings/org/WeChatOpenInfoView';
import Client from 'renderer/components/Settings/personal/Client';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      height: 'calc(100vh - 70px)',
    },
    toolBar: {
      minHeight: 30,
      background: 'white',
      borderRightStyle: 'solid',
      borderLeftStyle: 'solid',
      borderWidth: 1,
      // 是否将按钮调中间
      // justifyContent: 'center',
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    list: {
      width: '100%',
      height: 'calc(100vh - 70px)',
      backgroundColor: theme.palette.background.paper,
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
  })
);

function settingPage(pageName: PageName) {
  let result: JSX.Element;
  switch (pageName) {
    case 'personal.Account': {
      result = <Account />;
      break;
    }
    case 'personal.Client': {
      result = <Client />;
      break;
    }
    case 'org.Info': {
      result = <OrgInfo />;
      break;
    }
    case 'org.Account': {
      result = <AccountList />;
      break;
    }
    case 'org.Group': {
      result = <Group />;
      break;
    }
    case 'org.Shunt': {
      result = <Shunt />;
      break;
    }
    case 'org.WeChat': {
      result = <WeChatOpenInfoView />;
      break;
    }
    case 'org.Blacklist': {
      result = <BlacklistView />;
      break;
    }
    case 'org.SessionCategory': {
      result = <SessionCategoryView />;
      break;
    }
    case 'org.CustomerTag': {
      result = <CustomerTagTable />;
      break;
    }
    case 'org.Properties': {
      result = <PropertiesFrom />;
      break;
    }
    default: {
      result = <ComingSoon />;
      break;
    }
  }
  return result;
}

type PageName =
  | 'personal.Account'
  | 'personal.Client'
  | 'org.Info'
  | 'org.Account'
  | 'org.Group'
  | 'org.Shunt'
  | 'org.WeChat'
  | 'org.Blacklist'
  | 'org.SessionCategory'
  | 'org.CustomerTag'
  | 'org.CommentAndEvaluate'
  | 'org.Properties';

export default function Setting() {
  const classes = useStyles();
  const { t } = useTranslation();

  const [pageName, setPageName] = useState<PageName>('personal.Account');

  const memoTreeView = useMemo(() => {
    return (
      <TreeView
        className={classes.list}
        defaultExpanded={['personal', 'org']}
        defaultSelected={['personal.Account']}
        defaultCollapseIcon={<MinusSquare />}
        defaultExpandIcon={<PlusSquare />}
        defaultEndIcon={<CloseSquare />}
      >
        <StyledTreeItem nodeId="personal" label={t('Personal Settings')}>
          <StyledTreeItem
            nodeId="personal.Account"
            label={t('Account Settings')}
            onClick={() => setPageName('personal.Account')}
          />
          <StyledTreeItem
            nodeId="personal.Client"
            label={t('Client setting')}
            onClick={() => setPageName('personal.Client')}
          />
        </StyledTreeItem>
        <Authorized authority={['admin']} noMatch={<></>}>
          <StyledTreeItem nodeId="org" label={t('Enterprise settings')}>
            <StyledTreeItem
              nodeId="org.Info"
              label={t('Enterprise Information')}
              onClick={() => setPageName('org.Info')}
            />
            <StyledTreeItem
              nodeId="org.Account"
              label={t('Account Management')}
              onClick={() => setPageName('org.Account')}
            />
            <StyledTreeItem
              nodeId="org.Group"
              label={t('Customer Service Group')}
              onClick={() => setPageName('org.Group')}
            />
            <StyledTreeItem
              nodeId="org.Shunt"
              label={t('Shunt Group')}
              onClick={() => setPageName('org.Shunt')}
            />
            <StyledTreeItem
              nodeId="org.WeChat"
              label={t('WeChat Access')}
              onClick={() => setPageName('org.WeChat')}
            />
            <StyledTreeItem
              nodeId="org.SessionCategory"
              label={t('Session Category')}
              onClick={() => setPageName('org.SessionCategory')}
            />
            <StyledTreeItem
              nodeId="org.Blacklist"
              label={t('Blocklist')}
              onClick={() => setPageName('org.Blacklist')}
            />
            <StyledTreeItem
              nodeId="org.CustomerTag"
              label={t('Customer Tags')}
              onClick={() => setPageName('org.CustomerTag')}
            />
            {/* 先不开放自定义评价和留言配置 */}
            {/* <StyledTreeItem
              nodeId="org.CommentAndEvaluate"
              label={t('Message & Rate Config')}
              onClick={() => setPageName('org.CommentAndEvaluate')}
            /> */}
            <StyledTreeItem
              nodeId="org.Properties"
              label={t('System Setting')}
              onClick={() => setPageName('org.Properties')}
            />
          </StyledTreeItem>
        </Authorized>
      </TreeView>
    );
  }, [classes.list, t]);

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} sm={2}>
        {memoTreeView}
      </Grid>
      <Grid item xs={12} sm={10}>
        <div style={{ height: 'calc(100vh - 70px)', overflow: 'auto' }}>
          {/* 显示 配置页面 */}
          {pageName && settingPage(pageName)}
        </div>
      </Grid>
    </Grid>
  );
}
