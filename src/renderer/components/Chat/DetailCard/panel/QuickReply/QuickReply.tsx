import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Fuse from 'fuse.js';
import { from, of, zip } from 'rxjs';
import { groupBy, mergeMap, toArray, map } from 'rxjs/operators';
import { useTranslation } from 'react-i18next';

import { makeStyles, createStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import { AppBar, Box, IconButton, Toolbar } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';

import useInitData from 'renderer/hook/data/useInitData';
import {
  getFilterQuickReply,
  getQuickReply,
} from 'renderer/state/chat/chatAction';
import { QuickReplyDto } from 'renderer/domain/Chat';
import { noGroupOptions } from 'renderer/utils/fuseUtils';

import NestedList from './NestedList';
import SplitButton from '../SplitButton';
import AddQuickReply from './AddQuickReply';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'center',
      // width: 400,
    },
    paper: {
      display: 'flex',
      alignItems: 'center',
      // width: 400,
    },
    input: {
      flex: 1,
      paddingRight: 10,
    },
    iconButton: {
      padding: 10,
      fontSize: 44,
    },
    appBar: {
      top: 'auto',
      bottom: 0,
      marginBottom: 0,
    },
    grow: {
      flexGrow: 1,
    },
    list: {
      height: 'calc(100vh - 226px)',
      display: 'flex',
      overflow: 'auto',
    },
  })
);

// useInitData 会触发 redux，TODO: 待修复
export default function QuickReply() {
  const classes = useStyles();
  const { t } = useTranslation();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [serarchText, setSerarchText] = useState('');
  const quickReplyList = useSelector(getQuickReply);
  const filterQuickReplyList = useSelector(getFilterQuickReply);
  const { refetchQuickReply: refetch } = useInitData(false);

  const optionFun = [
    {
      name: t('All'),
      run: () => {
        setSelectedIndex(0);
      },
    },
    {
      name: t('Personal'),
      run: () => {
        setSelectedIndex(1);
      },
    },
    {
      name: t('Company'),
      run: () => {
        setSelectedIndex(2);
      },
    },
  ];

  // 提高搜索性能
  const fuse = useMemo(() => {
    const index = Fuse.createIndex(noGroupOptions.keys, filterQuickReplyList);
    return new Fuse(filterQuickReplyList, noGroupOptions, index);
  }, [filterQuickReplyList]);

  const searchQuickReply = (result: QuickReplyDto, sr: string) => {
    const searchResult = fuse
      .search(sr)
      .map((r) => r.item)
      .filter((f) => {
        if (selectedIndex === 0) {
          return true;
        }
        return (
          (selectedIndex === 1 && f.personal) ||
          (selectedIndex === 2 && !f.personal)
        );
      });
    from(searchResult)
      .pipe(
        groupBy(
          (re) => re.group,
          (re) => re
        ),
        mergeMap((group) => zip(of(group.key), group.pipe(toArray()))),
        map((gr) => {
          if (gr[0]) {
            gr[0].quickReply = [];
            gr[0].quickReply?.push(...gr[1]);
          }
          return gr[0];
        })
      )
      .subscribe((re) => {
        if (re) {
          result.withGroup?.push(re);
        }
      });
    searchResult
      .filter((re) => re.group === undefined)
      .forEach((re) => {
        result.noGroup?.push(re);
      });
  };

  const getBySelectedIndex = (): QuickReplyDto => {
    const result: QuickReplyDto = {
      withGroup: [],
      noGroup: [],
    };
    if (quickReplyList) {
      const addPersonal = () => {
        // 个人
        if (quickReplyList.personal.noGroup) {
          result.noGroup?.push(...quickReplyList.personal.noGroup);
        }
        if (quickReplyList.personal.withGroup) {
          result.withGroup?.push(...quickReplyList.personal.withGroup);
        }
      };
      const addOrg = () => {
        // 公司
        if (quickReplyList.org.noGroup) {
          result.noGroup?.push(...quickReplyList.org.noGroup);
        }
        if (quickReplyList.org.withGroup) {
          result.withGroup?.push(...quickReplyList.org.withGroup);
        }
      };

      if (serarchText && serarchText !== '') {
        searchQuickReply(result, serarchText);
      } else {
        switch (selectedIndex) {
          case 1: {
            addPersonal();
            break;
          }
          case 2: {
            addOrg();
            break;
          }
          default: {
            addOrg();
            addPersonal();
            break;
          }
        }
      }
    }
    return result;
  };

  const quickReplyDtoList = getBySelectedIndex();

  function handleTextChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSerarchText(event.target.value);
  }

  const handleRefreshClick = () => refetch();

  return (
    <Box>
      <Paper component="div" className={classes.paper}>
        <Grid container>
          <Grid item xs={12} className={classes.root}>
            <SearchIcon className={classes.iconButton} />
            <InputBase
              className={classes.input}
              value={serarchText}
              placeholder={t('Search Quick Reply')}
              onChange={handleTextChange}
              inputProps={{ 'aria-label': 'search quick replies' }}
            />
            <SplitButton options={optionFun} selectedIndex={selectedIndex} />
          </Grid>
          <Grid item xs={12} className={classes.list}>
            <NestedList
              quickReplyDto={quickReplyDtoList}
              refetch={handleRefreshClick}
            />
          </Grid>
        </Grid>
      </Paper>
      <AppBar position="sticky" color="default" className={classes.appBar}>
        <Toolbar>
          <div className={classes.grow} />
          <IconButton color="inherit" onClick={handleRefreshClick}>
            <RefreshIcon />
          </IconButton>
          <AddQuickReply
            quickReplyDto={quickReplyDtoList}
            refetch={handleRefreshClick}
          />
        </Toolbar>
      </AppBar>
    </Box>
  );
}
