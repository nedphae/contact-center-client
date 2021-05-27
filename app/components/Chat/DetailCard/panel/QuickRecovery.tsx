import React, { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Fuse from 'fuse.js';
import { from, of, zip } from 'rxjs';
import { groupBy, mergeMap, toArray, map } from 'rxjs/operators';

import { makeStyles, createStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import { AppBar, Box, IconButton, Toolbar } from '@material-ui/core';
import MoreIcon from '@material-ui/icons/MoreVert';
import RefreshIcon from '@material-ui/icons/Refresh';

import useInitData from 'app/hook/init/useInitData';
import { getFilterQuickReply, getQuickReply } from 'app/state/chat/chatAction';
import { QuickReplyDto } from 'app/domain/Chat';
import { noGroupOptions } from 'app/utils/fuseUtils';

import NestedList from './NestedList';
import SplitButton from './SplitButton';

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
      height: 'calc(80vh - 160px)',
      display: 'flex',
      alignItems: 'center',
    },
  })
);

export default function QuickRecovery() {
  const classes = useStyles();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [serarchText, setSerarchText] = useState('');
  const quickReplyList = useSelector(getQuickReply);
  const filterQuickReplyList = useSelector(getFilterQuickReply);
  const [refetch] = useInitData();

  const optionFun = [
    {
      name: '全部',
      run: () => {
        setSelectedIndex(0);
      },
    },
    {
      name: '个人',
      run: () => {
        setSelectedIndex(1);
      },
    },
    {
      name: '企业',
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

  const searchCallback = useCallback(
    (result: QuickReplyDto, sr: string) => {
      const searchResult = fuse.search(sr).map((r) => r.item);
      from(searchResult)
        .pipe(
          groupBy(
            (re) => re.group,
            (re) => re
          ),
          mergeMap((group) => zip(of(group.key), group.pipe(toArray()))),
          map((gr) => {
            if (gr[0]) {
              gr[0].quickRecovery = [];
              gr[0].quickRecovery?.push(...gr[1]);
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
    },
    [fuse]
  );

  const getBySelectedIndex = useCallback((): QuickReplyDto => {
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
        searchCallback(result, serarchText);
      } else {
        addOrg();
        addPersonal();
      }
    }
    return result;
  }, [serarchText, quickReplyList, searchCallback]);

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
              placeholder="搜索快捷回复"
              onChange={handleTextChange}
              inputProps={{ 'aria-label': 'search quick replies' }}
            />
            <SplitButton options={optionFun} selectedIndex={selectedIndex} />
          </Grid>
          <Grid item xs={12} className={classes.list}>
            <NestedList quickReplyDto={quickReplyDtoList} />
          </Grid>
        </Grid>
      </Paper>
      <AppBar position="sticky" color="primary" className={classes.appBar}>
        <Toolbar>
          <div className={classes.grow} />
          <IconButton color="inherit" onClick={handleRefreshClick}>
            <RefreshIcon />
          </IconButton>
          <IconButton edge="end" color="inherit">
            <MoreIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
