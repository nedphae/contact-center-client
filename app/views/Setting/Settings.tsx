import React, { useMemo, useState } from 'react';

import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { gql, useQuery } from '@apollo/client';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import Grid from '@material-ui/core/Grid';

import Authorized from 'app/components/Authorized/Authorized';
import StyledTreeItem, {
  CloseSquare,
  MinusSquare,
  PlusSquare,
} from 'app/components/TreeView/StyledTreeItem';
import Account from 'app/components/Settings/personal/Account';
import Group from 'app/components/Settings/org/Group';
import AccountList from 'app/components/Settings/org/AccountList';
import Shunt from 'app/components/Settings/org/Shunt';
import { Properties, RootProperties } from 'app/domain/Properties';
import PropertiesFrom from 'app/components/Settings/org/PropertiesFrom';
import ComingSoon from 'app/components/ComingSoon/ComingSoon';
import BlacklistView from 'app/components/Settings/org/BlacklistView';
import SessionCategoryView from 'app/components/Settings/org/SessionCategoryView';
import CustomerTagTable from 'app/components/Settings/CustomerTag/CustomerTagTable';

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
  getAllProperties: string;
}

const QUERY = gql`
  query Properties {
    getAllProperties
  }
`;

function settingPage(
  pageName: PageName,
  properties4Set: string | undefined,
  allProperties4Set: string[] | undefined,
  properties?: RootProperties
) {
  let result: JSX.Element;
  switch (pageName) {
    case 'personal.Account': {
      result = <Account />;
      break;
    }
    case 'personal.Client': {
      result = <ComingSoon />;
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
      if (properties && properties4Set && allProperties4Set) {
        result = (
          <PropertiesFrom
            defaultValues={properties}
            properties4Set={properties4Set}
            allProperties4Set={allProperties4Set}
          />
        );
      } else {
        result = <ComingSoon />;
      }
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
  | 'org.Account'
  | 'org.Group'
  | 'org.Shunt'
  | 'org.Blacklist'
  | 'org.SessionCategory'
  | 'org.CustomerTag'
  | 'org.Properties';

export default function Setting() {
  const classes = useStyles();
  const { data } = useQuery<Graphql>(QUERY);
  const [pageName, setPageName] = useState<PageName>('personal.Account');
  const [properties4Set, setProperties4Set] = useState<string>();
  const [allProperties4Set, setAllProperties4Set] = useState<string[]>();

  const properties: RootProperties = useMemo(
    () =>
      data?.getAllProperties ? JSON.parse(data?.getAllProperties) : undefined,
    [data]
  );

  const memoTreeView = useMemo(() => {
    return (
      <TreeView
        className={classes.list}
        defaultExpanded={['personal', 'org']}
        defaultSelected={['default-select']}
        defaultCollapseIcon={<MinusSquare />}
        defaultExpandIcon={<PlusSquare />}
        defaultEndIcon={<CloseSquare />}
      >
        <StyledTreeItem nodeId="personal" label="个人设置">
          <StyledTreeItem
            nodeId="default-select"
            label="账号设置"
            onClick={() => setPageName('personal.Account')}
          />
          {/* <StyledTreeItem
              nodeId={uuidv4()}
              label="客户端设置"
                            onClick={() => setPageName('personal.Client')}
            /> */}
        </StyledTreeItem>
        <Authorized authority={['admin']} noMatch={<></>}>
          <StyledTreeItem nodeId="org" label="企业设置">
            <StyledTreeItem
              nodeId={uuidv4()}
              label="账号管理"
              onClick={() => setPageName('org.Account')}
            />
            <StyledTreeItem
              nodeId={uuidv4()}
              label="客服组"
              onClick={() => setPageName('org.Group')}
            />
            <StyledTreeItem
              nodeId={uuidv4()}
              label="接待组"
              onClick={() => setPageName('org.Shunt')}
            />
            <StyledTreeItem
              nodeId={uuidv4()}
              label="咨询类型"
              onClick={() => setPageName('org.SessionCategory')}
            />
            <StyledTreeItem
              nodeId={uuidv4()}
              label="黑名单"
              onClick={() => setPageName('org.Blacklist')}
            />
            <StyledTreeItem
              nodeId={uuidv4()}
              label="客户标签"
              onClick={() => setPageName('org.CustomerTag')}
            />
            {properties &&
              _.keys(properties).map((k) => {
                const propertiesFilter = _.keys(properties[k]).filter(
                  (pk) => !['id', 'label', 'available', 'value'].includes(pk)
                );
                const allProperties4SetTemp = propertiesFilter.map(
                  (fk) => `${k}.${fk}`
                );
                return (
                  <StyledTreeItem
                    key={k}
                    nodeId={uuidv4()}
                    label={properties[k].label}
                  >
                    {propertiesFilter.map((fk) => {
                      const childProp = properties[k][fk] as Properties;
                      return (
                        <StyledTreeItem
                          key={fk}
                          nodeId={uuidv4()}
                          label={childProp.label}
                          onClick={() => {
                            setPageName('org.Properties');
                            setProperties4Set(`${k}.${fk}`);
                            setAllProperties4Set(allProperties4SetTemp);
                          }}
                        />
                      );
                    })}
                  </StyledTreeItem>
                );
              })}
          </StyledTreeItem>
        </Authorized>
      </TreeView>
    );
  }, [classes, properties]);

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} sm={2}>
        {memoTreeView}
      </Grid>
      <Grid item xs={12} sm={10}>
        {/* 显示 配置页面 */}
        {pageName &&
          settingPage(pageName, properties4Set, allProperties4Set, properties)}
      </Grid>
    </Grid>
  );
}
