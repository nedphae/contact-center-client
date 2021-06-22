import React, { useState } from 'react';

import _ from 'lodash';
import { gql, useQuery } from '@apollo/client';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import SubjectIcon from '@material-ui/icons/Subject';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ReplyIcon from '@material-ui/icons/Reply';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import { Topic, BotConfig, KnowledgeBase, TopicCategory } from 'app/domain/Bot';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
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
  topicList: Topic[];
  botConfigList: BotConfig[];
  knowledgeBaseList: KnowledgeBase[];
  topicCategoryList: TopicCategory[];
}

const QUERY = gql`
  query Bot {
    topicList {
      id
      knowledgeBaseId
      question
      md5
      answer
      innerAnswer
      fromType
      type
      refId
      connectIds
      enabled
      effectiveTime
      failureTime
      categoryId
      faqType
    }
    botConfigList {
      id
      botId
      knowledgeBaseId
      noAnswerReply
    }
    knowledgeBaseList {
      id
      name
      description
    }
    topicCategoryList {
      id
      name
      pid
    }
  }
`;

const initialState = {
  mouseX: null,
  mouseY: null,
};

export default function Bot() {
  const classes = useStyles();
  const [open, setOpen] = useState(-1);
  const [state, setState] = useState<{
    mouseX: null | number;
    mouseY: null | number;
  }>(initialState);

  const { loading, data, refetch } = useQuery<Graphql>(QUERY);

  const handleClose = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setState(initialState);
  };

  const topicCategoryPidGroup = _.groupBy(
    data?.topicCategoryList,
    (it) => it.pid ?? -2
  );
  const topicCategoryGroup = _.groupBy(data?.topicList, 'categoryId');
  data?.topicCategoryList
    .map((it) => {
      it.topicList = topicCategoryGroup[it.id ?? -1];
      return it;
    })
    .filter((it) => it.pid === undefined || it.pid === null)
    .forEach((it) => {
      it.children = topicCategoryPidGroup[it.id ?? -1];
    });

  const handleClick = (index: number) => {
    setOpen(index);
  };

  const topicCategoryKnowledgeBaseGroup = _.groupBy(
    data?.topicCategoryList,
    'knowledgeBaseId'
  );

  data?.knowledgeBaseList.forEach((it) => {
    it.categoryList = topicCategoryKnowledgeBaseGroup[it.id ?? -1];
  });

  // TODO: useMemo 优化一下

  return (
    <Grid container className={classes.root}>
      {/* 显示 弹窗配置知识库对应的机器人 */}
      <Grid item xs={12} sm={2}>
        <List
          component="nav"
          aria-labelledby="nested-list-subheader"
          className={classes.list}
        >
          {data?.knowledgeBaseList &&
            data?.knowledgeBaseList.map((base, index) => (
              <React.Fragment key={base.id}>
                <ListItem button onClick={() => handleClick(index)}>
                  <ListItemIcon>
                    <SubjectIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={base.name}
                    secondary={base.description}
                  />
                  {open === index ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={open === index} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {base.categoryList &&
                      base.categoryList.map((cl) => (
                        <ListItem key={cl.id} button className={classes.nested}>
                          <ListItemIcon>
                            <ReplyIcon />
                          </ListItemIcon>
                          <ListItemText primary={cl.name} />
                        </ListItem>
                      ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ))}
          {/* 右键菜单 */}
          <div onContextMenu={handleClose} style={{ cursor: 'context-menu' }}>
            <Menu
              keepMounted
              open={state.mouseY !== null}
              onClose={handleClose}
              anchorReference="anchorPosition"
              anchorPosition={
                state.mouseY !== null && state.mouseX !== null
                  ? { top: state.mouseY, left: state.mouseX }
                  : undefined
              }
            >
              <MenuItem key="sticky" onClick={() => doSticky(menuState.userId)}>
                关联机器人
              </MenuItem>
            </Menu>
          </div>
        </List>
      </Grid>
      <Grid item xs={12} sm={10}>
        {/* 显示 DataGrid Topic, 或者 BotConfig */}
      </Grid>
    </Grid>
  );
}
