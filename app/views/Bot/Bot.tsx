import React, { useRef, useState } from 'react';

import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
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

import {
  Topic,
  BotConfig,
  KnowledgeBase,
  TopicCategory,
  botConfigNoAnswerReply,
} from 'app/domain/Bot';
import DraggableDialog, {
  DraggableDialogRef,
} from 'app/components/DraggableDialog/DraggableDialog';
import StyledTreeItem from 'app/components/TreeView/StyledTreeItem';
import { Divider, IconButton, Toolbar, Typography } from '@material-ui/core';
import StaffFormContainer from 'app/components/StaffForm/StaffFromContainer';
import { DataGrid, GridColDef } from '@material-ui/data-grid';
import { CustomerGridToolbarCreater } from 'app/components/Table/CustomerGridToolbar';
import GRID_DEFAULT_LOCALE_TEXT from 'app/variables/gridLocaleText';
import TopicForm from 'app/components/Bot/TopicForm';
import Staff from 'app/domain/StaffInfo';
import BotConfigForm from 'app/components/Bot/BotConfigForm';
import TopicAndKnowladgeContainer, {
  TopicOrKnowladge,
} from 'app/components/Bot/TopicAndKnowladgeContainer';

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

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'knowledgeBaseId', headerName: '所属知识库ID', width: 150 },
  { field: 'question', headerName: '问题', width: 150 },
  { field: 'md5', headerName: '问题的md5', width: 150 },
  { field: 'answer', headerName: '问题的对外答案', width: 150 },
  { field: 'innerAnswer', headerName: '问题的对内答案', width: 150 },
  { field: 'fromType', headerName: '问题的来源', width: 150 },
  { field: 'type', headerName: '问题类型', width: 150 },
  { field: 'refId', headerName: '相似问题', width: 150 },
  { field: 'enabled', headerName: '是否有效标记位', width: 150 },
  { field: 'effectiveTime', headerName: '问题的有效时间', width: 150 },
  { field: 'failureTime', headerName: '有效期结束', width: 150 },
  { field: 'categoryId', headerName: '知识点所属分类', width: 150 },
];

function buildTopicCategory(
  topicCategoryList: TopicCategory[],
  onContextMenu?: (
    event: React.MouseEvent<HTMLLIElement>,
    type: TopicOrKnowladge,
    knowledgeBase?: KnowledgeBase | undefined,
    topicCategory?: TopicCategory | undefined
  ) => void
) {
  return topicCategoryList.map((cl) => (
    <StyledTreeItem
      key={cl.id?.toString()}
      nodeId={uuidv4()}
      labelText={cl.name}
      labelIcon={SubjectIcon}
      onContextMenu={(event) => {
        if (onContextMenu) {
          onContextMenu(event, 'Topic', undefined, cl);
        }
      }}
    >
      {cl.children && buildTopicCategory(cl.children)}
    </StyledTreeItem>
  ));
}

type SelectKnowlagebase = {
  mouseX: null | number;
  mouseY: null | number;
  topicOrKnowladge: TopicOrKnowladge;
  knowledgeBase: KnowledgeBase | undefined;
  topicCategory: TopicCategory | undefined;
};

const initialState: SelectKnowlagebase = {
  mouseX: null,
  mouseY: null,
  topicOrKnowladge: 'Knowladge',
  knowledgeBase: undefined,
  topicCategory: undefined,
};

export default function Bot() {
  const classes = useStyles();
  const refOfDialog = useRef<DraggableDialogRef>(null);
  const refOfTopicDialog = useRef<DraggableDialogRef>(null);
  const [state, setState] = useState<SelectKnowlagebase>(initialState);
  const [topic, setTopic] = useState<Topic | undefined>(undefined);
  const { data, loading } = useQuery<Graphql>(QUERY);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [configStaff, setConfigStaff] = useState<Staff | null>(null);
  const refOfKnowladgeDialog = useRef<DraggableDialogRef>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleContextMenuOpen = (
    event: React.MouseEvent<HTMLLIElement>,
    topicOrKnowladge: TopicOrKnowladge,
    knowledgeBase?: KnowledgeBase,
    topicCategory?: TopicCategory
  ) => {
    event.preventDefault();
    setState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      topicOrKnowladge,
      knowledgeBase,
      topicCategory,
    });
  };

  const handleContextMenuClose = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setState(initialState);
  };

  const handleClickOpen = (selectTopic: Topic) => {
    setTopic(selectTopic);
    refOfTopicDialog.current?.setOpen(true);
  };

  function newButtonClick() {
    setTopic(undefined);
    refOfTopicDialog.current?.setOpen(true);
  }

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
  const pTopicCategory = data?.allTopicCategory
    .map((it) => {
      it.topicList = topicCategoryGroup[it.id ?? -1];
      return it;
    })
    .map((it) => {
      it.children = topicCategoryPidGroup[it.id ?? -1];
      return it;
    })
    .filter((it) => it.pid === undefined || it.pid === null);

  const topicCategoryKnowledgeBaseGroup = _.groupBy(
    pTopicCategory,
    'knowledgeBaseId'
  );

  data?.allKnowledgeBase.forEach((it) => {
    it.categoryList = topicCategoryKnowledgeBaseGroup[it.id ?? -1];
    [it.botConfig] = it.id ? botConfigMap[it.id] : [];
  });

  const botConfig = state.knowledgeBase
    ? botConfigMap[state.knowledgeBase.id ?? -1][0]
    : null;

  const staffId = botConfig ? botConfig?.botId : null;

  const rows = data?.allTopic ?? [];

  function mutationCallback(staff: Staff) {
    setConfigStaff(staff);
  }

  function newTopicOrKnowladge(topicOrKnowladge: TopicOrKnowladge) {
    setState(_.assign(initialState, { topicOrKnowladge }));
    refOfKnowladgeDialog.current?.setOpen(true);
    handleMenuClose();
  }

  function editTopicOrKnowladge(topicOrKnowladge: TopicOrKnowladge) {
    setState(_.assign(state, { topicOrKnowladge }));
    refOfKnowladgeDialog.current?.setOpen(true);
    handleMenuClose();
  }

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} sm={2}>
        {/* 功能菜单 */}
        <Toolbar className={classes.toolBar}>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            onClick={handleMenuClick}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => {
                newTopicOrKnowladge('Knowladge');
              }}
            >
              添加知识库
            </MenuItem>
            <MenuItem
              onClick={() => {
                newTopicOrKnowladge('Topic');
              }}
            >
              添加知识库分类
            </MenuItem>
          </Menu>
        </Toolbar>
        {/* 知识库，分类 树状列表 */}
        <TreeView
          className={classes.list}
          defaultCollapseIcon={<ArrowDropDownIcon />}
          defaultExpandIcon={<ArrowRightIcon />}
        >
          {data?.allKnowledgeBase &&
            data.allKnowledgeBase.map((base: KnowledgeBase) => (
              <StyledTreeItem
                key={base.id?.toString()}
                nodeId={uuidv4()}
                labelText={base.name}
                labelIcon={SubjectIcon}
                onContextMenu={(event) =>
                  handleContextMenuOpen(event, 'Knowladge', base)
                }
              >
                {base.categoryList &&
                  buildTopicCategory(base.categoryList, handleContextMenuOpen)}
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
            {state.topicOrKnowladge === 'Knowladge' && [
              <MenuItem key="interrelateBot" onClick={interrelateBot}>
                关联机器人
              </MenuItem>,
              <MenuItem
                key="editTopicOrKnowladge"
                onClick={() => {
                  editTopicOrKnowladge('Knowladge');
                }}
              >
                修改知识库
              </MenuItem>,
            ]}
            {state.topicOrKnowladge === 'Topic' && (
              <MenuItem
                onClick={() => {
                  editTopicOrKnowladge('Topic');
                }}
              >
                修改知识分类
              </MenuItem>
            )}
          </Menu>
        </div>
        {/* 显示 弹窗配置知识库对应的机器人 */}
        <DraggableDialog title="配置机器人账户" ref={refOfDialog}>
          <Typography variant="h5" gutterBottom>
            客服账号配置
          </Typography>
          <StaffFormContainer
            staffId={staffId}
            mutationCallback={mutationCallback}
          />
          <Divider />
          <Typography variant="h5" gutterBottom>
            机器人配置
          </Typography>
          {(botConfig && <BotConfigForm defaultValues={botConfig} />) ||
            (configStaff && state.knowledgeBase?.id && (
              <BotConfigForm
                defaultValues={{
                  botId: configStaff.id,
                  knowledgeBaseId: state.knowledgeBase.id,
                  noAnswerReply: botConfigNoAnswerReply,
                }}
              />
            ))}
        </DraggableDialog>
        <DraggableDialog
          title={
            (state.topicOrKnowladge === 'Knowladge' && '配置知识库') ||
            '配置知识库分类'
          }
          ref={refOfKnowladgeDialog}
        >
          {state.topicOrKnowladge === 'Topic' && (
            <TopicAndKnowladgeContainer
              showWhat="Topic"
              defaultValue={state.topicCategory}
              allTopicCategoryList={data?.allTopicCategory ?? []}
            />
          )}
          {state.topicOrKnowladge === 'Knowladge' && (
            <TopicAndKnowladgeContainer
              showWhat="Knowladge"
              defaultValue={state.knowledgeBase}
              allTopicCategoryList={data?.allTopicCategory ?? []}
            />
          )}
        </DraggableDialog>
      </Grid>
      <Grid item xs={12} sm={10}>
        {/* 显示 DataGrid Topic */}
        <DraggableDialog title="配置知识库问题" ref={refOfTopicDialog}>
          <TopicForm defaultValues={topic} topicList={rows} />
        </DraggableDialog>
        <DataGrid
          localeText={GRID_DEFAULT_LOCALE_TEXT}
          rows={rows}
          columns={columns}
          components={{
            Toolbar: CustomerGridToolbarCreater({ newButtonClick }),
          }}
          onRowClick={(param) => {
            handleClickOpen(param.row as Topic);
          }}
          pagination
          pageSize={20}
          loading={loading}
          disableSelectionOnClick
        />
      </Grid>
    </Grid>
  );
}
