import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

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
  ConversationQueryInput,
  CONV_PAGE_QUERY,
  PageParam,
  SearchConv,
} from 'app/domain/graphql/Conversation';
import { getSelectedConstomer } from 'app/state/session/sessionAction';
import javaInstant2DateStr from 'app/utils/timeUtils';
import MessageList from 'app/components/MessageList/MessageList';

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
      overflow: 'auto',
    },
  })
);

// 当前会话，或者会话ID
type SelectedType = number;

const QUERY = gql`
  ${CONV_PAGE_QUERY}
  query Conversation($conversationQueryInput: ConversationQueryInput!) {
    searchConv(conversationQuery: $conversationQueryInput) {
      ...PageSearchHitPage
    }
  }
`;
type Graphql = SearchConv;

export default function History() {
  const classes = useStyles();
  const user = useSelector(getSelectedConstomer);
  const [selectedId, setSelectedId] = useState<SelectedType>(0);
  const [searchConv, { data }] = useLazyQuery<Graphql>(QUERY);

  useEffect(() => {
    if (user && user.id) {
      const searchParams: ConversationQueryInput = {
        page: new PageParam(),
        userId: user.id,
      };
      searchConv({ variables: { conversationQueryInput: searchParams } });
    }
  }, [searchConv, user]);

  const result = data ? data.searchConv : null;
  const rows =
    result && result.content ? result.content.map((it) => it.content) : [];

  const selectConversation = rows[selectedId];

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedId(event.target.value as number);
  };

  return (
    <Box>
      <Paper component="div" className={classes.paper}>
        {selectConversation && (
          <MessageList conversation={selectConversation} />
        )}
      </Paper>
      <AppBar position="sticky" color="primary" className={classes.appBar}>
        <Toolbar>
          <div className={classes.grow} />
          <FormControl variant="outlined" margin="normal" fullWidth>
            <InputLabel id="demo-simple-select-outlined-label">
              选择会话
            </InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              value={selectedId}
              onChange={handleChange}
              label="Age"
            >
              <MenuItem disabled>最近的20条会话</MenuItem>
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
    </Box>
  );
}
