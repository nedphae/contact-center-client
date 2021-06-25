import React, { useRef, useState } from 'react';

import _ from 'lodash';
import { gql, useQuery } from '@apollo/client';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import Grid from '@material-ui/core/Grid';
import SubjectIcon from '@material-ui/icons/Subject';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuIcon from '@material-ui/icons/Menu';

import { Topic, BotConfig, KnowledgeBase, TopicCategory } from 'app/domain/Bot';
import DraggableDialog, {
  DraggableDialogRef,
} from 'app/components/DraggableDialog/DraggableDialog';
import StyledTreeItem from 'app/components/TreeView/StyledTreeItem';
import { IconButton, Toolbar } from '@material-ui/core';
import StaffFormContainer from 'app/components/StaffForm/StaffFromContainer';

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
  allTopic: Topic[];
  allBotConfig: BotConfig[];
  allKnowledgeBase: KnowledgeBase[];
  allTopicCategory: TopicCategory[];
}

const QUERY = gql`
  query Bot {
    allTopic {
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
    allBotConfig {
      id
      botId
      knowledgeBaseId
      noAnswerReply
    }
    allKnowledgeBase {
      id
      name
      description
    }
    allTopicCategory {
      id
      name
      pid
    }
  }
`;

const initialState = {
  mouseX: null,
  mouseY: null,
  knowledgeBaseId: null,
};

function buildTopicCategory(topicCategoryList: TopicCategory[]) {
  return topicCategoryList.map((cl, ci) => (
    <StyledTreeItem
      key={cl.id?.toString()}
      nodeId={cl.id?.toString() || ci.toString()}
      labelText={cl.name}
      labelIcon={SubjectIcon}
    >
      {cl.children && buildTopicCategory(cl.children)}
    </StyledTreeItem>
  ));
}

export default function Bot() {
  const classes = useStyles();
  const refOfDialog = useRef<DraggableDialogRef>(null);

  const [state, setState] = useState<{
    mouseX: null | number;
    mouseY: null | number;
    knowledgeBaseId: null | number | undefined;
  }>(initialState);

  const { loading, data, refetch } = useQuery<Graphql>(QUERY);

  const handleContextMenuOpen = (
    event: React.MouseEvent<HTMLLIElement>,
    knowledgeBaseId?: number
  ) => {
    event.preventDefault();
    setState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      knowledgeBaseId,
    });
  };

  const handleContextMenuClose = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setState(initialState);
  };

  /**
   * 关联知识库和机器人
   */
  const interrelateBot = () => {
    refOfDialog.current?.setOpen(true);
  };

  // TODO: useMemo 优化一下
  const botConfigMap = _.groupBy(data?.allBotConfig, 'knowledgeBaseId');

  const topicCategoryPidGroup = _.groupBy(
    data?.allTopicCategory,
    (it) => it.pid ?? -2
  );
  const topicCategoryGroup = _.groupBy(data?.allTopic, 'categoryId');
  data?.allTopicCategory
    .map((it) => {
      it.topicList = topicCategoryGroup[it.id ?? -1];
      return it;
    })
    .filter((it) => it.pid === undefined || it.pid === null)
    .forEach((it) => {
      it.children = topicCategoryPidGroup[it.id ?? -1];
    });

  const topicCategoryKnowledgeBaseGroup = _.groupBy(
    data?.allTopicCategory,
    'knowledgeBaseId'
  );

  data?.allKnowledgeBase.forEach((it) => {
    it.categoryList = topicCategoryKnowledgeBaseGroup[it.id ?? -1];
    [it.botConfig] = botConfigMap[it.id ?? -1];
  });

  const staffId = botConfigMap[state.knowledgeBaseId ?? -1][0]?.botId;

  return (
    <Grid container className={classes.root}>
      <Toolbar className={classes.toolBar}>
        <IconButton
          edge="start"
          className={classes.menuButton}
          color="inherit"
          aria-label="menu"
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
      {/* 显示 弹窗配置知识库对应的机器人 */}
      <DraggableDialog title="配置机器人" ref={refOfDialog}>
        <StaffFormContainer staffId={staffId} />
      </DraggableDialog>
      <Grid item xs={12} sm={2}>
        <TreeView
          className={classes.list}
          defaultCollapseIcon={<ArrowDropDownIcon />}
          defaultExpandIcon={<ArrowRightIcon />}
        >
          {data?.allKnowledgeBase &&
            data.allKnowledgeBase.map((base, index) => (
              <StyledTreeItem
                key={base.id?.toString()}
                nodeId={base.id?.toString() || index.toString()}
                labelText={base.name}
                labelIcon={SubjectIcon}
                onContextMenu={(event) => handleContextMenuOpen(event, base.id)}
              >
                {base.categoryList && buildTopicCategory(base.categoryList)}
              </StyledTreeItem>
            ))}
        </TreeView>
        {/* 右键菜单 */}
        <div
          onContextMenu={handleContextMenuClose}
          style={{ cursor: 'context-menu' }}
        >
          <Menu
            keepMounted
            open={state.mouseY !== null}
            onClose={handleContextMenuClose}
            anchorReference="anchorPosition"
            anchorPosition={
              state.mouseY !== null && state.mouseX !== null
                ? { top: state.mouseY, left: state.mouseX }
                : undefined
            }
          >
            <MenuItem key="sticky" onClick={interrelateBot}>
              关联机器人
            </MenuItem>
          </Menu>
        </div>
      </Grid>
      <Grid item xs={12} sm={10}>
        {/* 显示 DataGrid Topic */}
      </Grid>
    </Grid>
  );
}
