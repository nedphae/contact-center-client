import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import _ from 'lodash';
import { gql, useQuery } from '@apollo/client';

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
import { Properties, RootProperties } from 'renderer/domain/Properties';
import PropertiesFrom from 'renderer/components/Settings/org/PropertiesFrom';
import ComingSoon from 'renderer/components/ComingSoon/ComingSoon';
import BlacklistView from 'renderer/components/Settings/org/BlacklistView';
import SessionCategoryView from 'renderer/components/Settings/org/SessionCategoryView';
import CustomerTagTable from 'renderer/components/Settings/CustomerTag/CustomerTagTable';
import OrgInfo from 'renderer/components/Settings/org/OrgInfo';
import WeChatOpenInfoView from 'renderer/components/Settings/org/WeChatOpenInfoView';
import CommentAndEvaluateConfig from 'renderer/components/Settings/org/CommentAndEvaluateConfig';

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
  customerProps: Pick<RootProperties, 'cae'>,
  properties?: RootProperties,
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
    case 'org.CommentAndEvaluate': {
      result = (
        <CommentAndEvaluateConfig props={customerProps.cae} refetch={refetch} />
      );
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
  | 'org.CommentAndEvaluate'
  | 'org.Properties';

export default function Setting() {
  const classes = useStyles();
  const { t } = useTranslation();

  const { data, refetch } = useQuery<Graphql>(QUERY, {
    fetchPolicy: 'no-cache',
  });
  const [pageName, setPageName] = useState<PageName>('personal.Account');
  const [properties4Set, setProperties4Set] = useState<string>();
  const [allProperties4Set, setAllProperties4Set] = useState<string[]>();

  let properties: RootProperties = useMemo(
    () =>
      data?.getAllProperties ? JSON.parse(data?.getAllProperties) : undefined,
    [data]
  );

  const customerProps = _.pick(properties, 'cae');
  properties = _.omit(properties, _.keys(customerProps));

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
          {/* <StyledTreeItem
              nodeId=""
              label="客户端设置"
                            onClick={() => setPageName('personal.Client')}
            /> */}
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
                    label={t(properties[k].label)}
                  >
                    {propertiesFilter.map((fk) => {
                      const childProp = properties[k][fk] as Properties;
                      return (
                        <StyledTreeItem
                          key={fk}
                          nodeId={`properties.${k}.${fk}`}
                          label={t(childProp.label)}
                          onClick={ () => {
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
  }, [classes.list, properties, t]);

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
            customerProps,
            properties
          )}
      </Grid>
    </Grid>
  );
}
