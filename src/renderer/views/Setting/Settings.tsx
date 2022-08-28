import { useMemo, useState } from 'react';

import _ from 'lodash';
import { gql, useQuery } from '@apollo/client';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import Grid from '@material-ui/core/Grid';

import Authorized from 'renderer/components/Authorized/Authorized';
import StyledTreeItem, {
  CloseSquare,
  MinusSquare,
  PlusSquare,
} from 'renderer/components/TreeView/StyledTreeItem';
import Account from 'renderer/components/Settings/personal/Account';
import Group from 'renderer/components/Settings/org/Group';
import AccountList from 'renderer/components/Settings/org/AccountList';
import Shunt from 'renderer/components/Settings/org/Shunt';
import { Properties, RootProperties } from 'renderer/domain/Properties';
import PropertiesFrom from 'renderer/components/Settings/org/PropertiesFrom';
import ComingSoon from 'renderer/components/ComingSoon/ComingSoon';
import BlacklistView from 'renderer/components/Settings/org/BlacklistView';
import SessionCategoryView from 'renderer/components/Settings/org/SessionCategoryView';
import CustomerTagTable from 'renderer/components/Settings/CustomerTag/CustomerTagTable';
import OrgInfo from 'renderer/components/Settings/org/OrgInfo';
import WeChatOpenInfoView from 'renderer/components/Settings/org/WeChatOpenInfoView';

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
  refetch: () => void,
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
      if (properties && properties4Set && allProperties4Set) {
        result = (
          <PropertiesFrom
            defaultValues={properties}
            properties4Set={properties4Set}
            allProperties4Set={allProperties4Set}
            refetch={refetch}
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
  | 'org.Info'
  | 'org.Account'
  | 'org.Group'
  | 'org.Shunt'
  | 'org.WeChat'
  | 'org.Blacklist'
  | 'org.SessionCategory'
  | 'org.CustomerTag'
  | 'org.Properties';

export default function Setting() {
  const classes = useStyles();
  const { data, refetch } = useQuery<Graphql>(QUERY);
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
        defaultSelected={['personal.Account']}
        defaultCollapseIcon={<MinusSquare />}
        defaultExpandIcon={<PlusSquare />}
        defaultEndIcon={<CloseSquare />}
      >
        <StyledTreeItem nodeId="personal" label="个人设置">
          <StyledTreeItem
            nodeId="personal.Account"
            label="账号设置"
            onClick={() => setPageName('personal.Account')}
          />
          {/* <StyledTreeItem
              nodeId=""
              label="客户端设置"
                            onClick={() => setPageName('personal.Client')}
            /> */}
        </StyledTreeItem>
        <Authorized authority={['admin']} noMatch={<></>}>
          <StyledTreeItem nodeId="org" label="企业设置">
            <StyledTreeItem
              nodeId="org.Info"
              label="企业信息"
              onClick={() => setPageName('org.Info')}
            />
            <StyledTreeItem
              nodeId="org.Account"
              label="账号管理"
              onClick={() => setPageName('org.Account')}
            />
            <StyledTreeItem
              nodeId="org.Group"
              label="客服组"
              onClick={() => setPageName('org.Group')}
            />
            <StyledTreeItem
              nodeId="org.Shunt"
              label="接待组"
              onClick={() => setPageName('org.Shunt')}
            />
            <StyledTreeItem
              nodeId="org.WeChat"
              label="微信接入"
              onClick={() => setPageName('org.WeChat')}
            />
            <StyledTreeItem
              nodeId="org.SessionCategory"
              label="咨询类型"
              onClick={() => setPageName('org.SessionCategory')}
            />
            <StyledTreeItem
              nodeId="org.Blacklist"
              label="黑名单"
              onClick={() => setPageName('org.Blacklist')}
            />
            <StyledTreeItem
              nodeId="org.CustomerTag"
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
                    nodeId={`properties.${k}`}
                    label={properties[k].label}
                  >
                    {propertiesFilter.map((fk) => {
                      const childProp = properties[k][fk] as Properties;
                      return (
                        <StyledTreeItem
                          key={fk}
                          nodeId={`properties.${k}.${fk}`}
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
          settingPage(
            pageName,
            properties4Set,
            allProperties4Set,
            () => {
              refetch();
            },
            properties
          )}
      </Grid>
    </Grid>
  );
}
