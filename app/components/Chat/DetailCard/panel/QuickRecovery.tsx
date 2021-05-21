import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import Fuse from 'fuse.js';
import { from, of, zip } from 'rxjs';
import { groupBy, mergeMap, toArray, map } from 'rxjs/operators';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';

import { getFilterQuickReply, getQuickReply } from 'app/state/chat/chatAction';
import { QuickReplyDto } from 'app/domain/Chat';
import { noGroupOptions } from 'app/utils/fuseUtils';
import SplitButton from './SplitButton';
import NestedList from './NestedList';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'center',
      width: 400,
    },
    input: {
      flex: 1,
      paddingRight: 10,
    },
    iconButton: {
      padding: 10,
    },
  })
);

export default function CustomizedInputBase() {
  const classes = useStyles();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [serarchText, setSerarchText] = useState('');
  const quickReplyList = useSelector(getQuickReply);
  const filterQuickReplyList = useSelector(getFilterQuickReply);

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

  const getBySelectedIndex = useCallback((): QuickReplyDto => {
    const result: QuickReplyDto = {
      withGroup: [],
      noGroup: [],
    };

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
      const fuse = new Fuse(filterQuickReplyList, noGroupOptions);
      const searchResult = fuse.search(serarchText).map((r) => r.item);
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
    } else {
      addOrg();
      addPersonal();
    }
    return result;
  }, [serarchText, quickReplyList, filterQuickReplyList]);

  const quickReplyDtoList = getBySelectedIndex();

  function handleTextChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSerarchText(event.target.value);
  }

  return (
    <Paper component="form" className={classes.root}>
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
        <Grid item xs={12} className={classes.root}>
          <NestedList quickReplyDto={quickReplyDtoList} />
        </Grid>
      </Grid>
    </Paper>
  );
}
