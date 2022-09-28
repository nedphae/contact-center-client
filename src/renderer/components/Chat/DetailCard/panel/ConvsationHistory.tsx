import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { makeStyles, createStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import {
  AppBar,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Toolbar,
} from '@material-ui/core';

import { gql, useLazyQuery } from '@apollo/client';
import {
  ConversationFilterInput,
  CONV_PAGE_QUERY,
  SearchConv,
} from 'renderer/domain/graphql/Conversation';
import javaInstant2DateStr from 'renderer/utils/timeUtils';
import MessageList from 'renderer/components/MessageList/MessageList';
import { PageParam } from 'renderer/domain/graphql/Query';
import { getSelectedConstomer } from 'renderer/state/chat/chatAction';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
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
      zIndex: 'auto', // 2
    },
    grow: {
      flexGrow: 1,
    },
    list: {
      display: 'flex',
      overflow: 'auto',
    },
  })
);

// 当前会话，或者会话ID
type SelectedType = string;

const QUERY = gql`
  ${CONV_PAGE_QUERY}
  query Conversation($conversationFilter: ConversationFilterInput!) {
    searchConv(conversationFilter: $conversationFilter) {
      ...pageOnSearchHitPage
    }
  }
`;
type Graphql = SearchConv;

const page = new PageParam();
page.properties = ['id'];

export default function ConvsationHistory() {
  const classes = useStyles();
  const { t } = useTranslation();

  const user = useSelector(getSelectedConstomer);
  const [selectedId, setSelectedId] = useState<SelectedType>('');
  const [searchConv, { data }] = useLazyQuery<Graphql>(QUERY);

  useEffect(() => {
    if (user && user.userId) {
      const conversationFilter: ConversationFilterInput = {
        page,
        userId: user.userId,
      };
      searchConv({ variables: { conversationFilter } });
    }
  }, [searchConv, user]);

  const result = data?.searchConv;
  const rows =
    result && result.content ? result.content.map((it) => it.content) : [];

  const selectConversation = rows[parseInt(selectedId, 10)];

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedId(event.target.value as string);
  };

  return (
    <Box>
      <AppBar position="sticky" color="primary" className={classes.appBar}>
        <Toolbar>
          <div className={classes.grow} />
          <FormControl variant="outlined" margin="normal" fullWidth>
            <InputLabel id="demo-simple-select-outlined-label">
              {t('Choose 20 recent sessions')}
            </InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              value={selectedId}
              onChange={handleChange}
              label={t('Choose 20 recent sessions')}
            >
              {rows &&
                rows.map((conv, index) => (
                  <MenuItem key={conv.id} value={index}>
                    {javaInstant2DateStr(conv.startTime)}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>
      <Paper component="div" className={classes.list}>
        {selectConversation && (
          <MessageList conversation={selectConversation} />
        )}
      </Paper>
    </Box>
  );
}
