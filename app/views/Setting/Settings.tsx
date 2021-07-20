import React, { useMemo, useState } from 'react';

import { v4 as uuidv4 } from 'uuid';
import { gql, useQuery } from '@apollo/client';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import Grid from '@material-ui/core/Grid';
import SubjectIcon from '@material-ui/icons/Subject';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';

import StyledTreeItem from 'app/components/TreeView/StyledTreeItem';
import Account from 'app/components/Settings/personal/Account';
import unimplemented from 'app/utils/Error';
import Group from 'app/components/Settings/org/Group';
import AccountList from 'app/components/Settings/org/AccountList';
import Shunt from 'app/components/Settings/org/Shunt';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
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
      height: '80vh',
      backgroundColor: theme.palette.background.paper,
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
  })
);

interface Graphql {
  allProperties: string;
}

const QUERY = gql`
  query Properties {
    allProperties
  }
`;

function settingPage(pageName: PageName) {
  let result: JSX.Element;
  switch (pageName) {
    case 'personal.Account': {
      result = <Account />;
      break;
    }
    case 'personal.Client': {
      unimplemented();
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
    case 'org.BlackList': {
      unimplemented();
      break;
    }
    case 'org.ConsultationType': {
      unimplemented();
      break;
    }
    default: {
      unimplemented();
      break;
    }
  }
  return result;
}

type PageName =
  | 'personal.Account'
  | 'personal.Client'
  | 'org.Account'
  | 'org.Group'
  | 'org.Shunt'
  | 'org.BlackList'
  | 'org.ConsultationType';

export default function Setting() {
  const classes = useStyles();
  const { data } = useQuery<Graphql>(QUERY);
  const [pageName, setPageName] = useState<PageName>('personal.Account');

  const memoTreeView = useMemo(() => {
    return (
      <TreeView
        className={classes.list}
        defaultExpanded={['default-expanded']}
        defaultSelected={['default-select']}
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
      >
        <StyledTreeItem
          nodeId="default-expanded"
          labelText="个人设置"
          labelIcon={SubjectIcon}
        >
          <StyledTreeItem
            nodeId="default-select"
            labelText="账号设置"
            labelIcon={SubjectIcon}
            onClick={() => setPageName('personal.Account')}
          />
          {/* <StyledTreeItem
              nodeId={uuidv4()}
              labelText="客户端设置"
              labelIcon={SubjectIcon}
              onClick={() => setPageName('personal.Client')}
            /> */}
        </StyledTreeItem>
        <StyledTreeItem
          nodeId={uuidv4()}
          labelText="企业设置"
          labelIcon={SubjectIcon}
        >
          <StyledTreeItem
            nodeId={uuidv4()}
            labelText="账号管理"
            labelIcon={SubjectIcon}
            onClick={() => setPageName('org.Account')}
          />
          <StyledTreeItem
            nodeId={uuidv4()}
            labelText="客服组"
            labelIcon={SubjectIcon}
            onClick={() => setPageName('org.Group')}
          />
          <StyledTreeItem
            nodeId={uuidv4()}
            labelText="接待组"
            labelIcon={SubjectIcon}
            onClick={() => setPageName('org.Shunt')}
          />
          <StyledTreeItem
            nodeId={uuidv4()}
            labelText="咨询类型"
            labelIcon={SubjectIcon}
            onClick={() => setPageName('org.ConsultationType')}
          />
          <StyledTreeItem
            nodeId={uuidv4()}
            labelText="黑名单设置"
            labelIcon={SubjectIcon}
            onClick={() => setPageName('org.BlackList')}
          />
        </StyledTreeItem>
      </TreeView>
    );
  }, [classes]);

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} sm={2}>
        {memoTreeView}
      </Grid>
      <Grid item xs={12} sm={10}>
        {/* 显示 配置页面 */}
        {pageName && settingPage(pageName)}
      </Grid>
    </Grid>
  );
}
