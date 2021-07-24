import React, { useRef, useState, useCallback } from 'react';

import _ from 'lodash';
import { Object } from 'ts-toolbelt';
import { gql, useMutation } from '@apollo/client';

import Grid from '@material-ui/core/Grid';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import {
  BotConfig,
  KnowledgeBase,
  TopicCategory,
  botConfigNoAnswerReply,
} from 'app/domain/Bot';
import DraggableDialog, {
  DraggableDialogRef,
} from 'app/components/DraggableDialog/DraggableDialog';
import { Divider, Typography } from '@material-ui/core';
import StaffFormContainer from 'app/components/StaffForm/StaffFromContainer';
import Staff from 'app/domain/StaffInfo';
import BotConfigForm from 'app/components/Bot/BotConfigForm';
import TopicAndKnowladgeContainer, {
  TopicOrKnowladgeKey,
  TopicOrKnowladge,
} from 'app/components/Bot/TopicAndKnowladgeContainer';
import unimplemented from 'app/utils/Error';
import BotToolbar from './BotToolbar';
import BotTreeView from './BotTreeView';

type Select = {
  mouseX: null | number;
  mouseY: null | number;
};

type TopicOrKnowladgeWithKey = Object.Merge<
  TopicOrKnowladge,
  { topicOrKnowladgeKey: TopicOrKnowladgeKey | undefined }
>;

const initialState: Select = {
  mouseX: null,
  mouseY: null,
};

interface BotProps {
  memoData: {
    allKnowledgeBase: KnowledgeBase[];
    botConfigMap: _.Dictionary<BotConfig[]>;
  };
  allTopicCategory: TopicCategory[] | undefined;
}

const MUTATION_BOT_CONFIG = gql`
  mutation DeleteBotConfig($ids: [Long]!) {
    deleteBotConfigByIds(ids: $ids)
  }
`;
const MUTATION_KNOWLEDGE_BASE = gql`
  mutation DeleteKnowledgeBase($ids: [Long]!) {
    deleteKnowledgeBaseByIds(ids: $ids)
  }
`;
const MUTATION_TOPIC_CATEGORY = gql`
  mutation DeleteTopicCategory($ids: [Long]!) {
    deleteTopicCategoryByIds(ids: $ids)
  }
`;

export default function BotSidecar(props: BotProps) {
  const { memoData, allTopicCategory } = props;
  const [state, setState] = useState<Select>(initialState);
  const refOfDialog = useRef<DraggableDialogRef>(null);
  const refOfKnowladgeDialog = useRef<DraggableDialogRef>(null);
  const [configStaff, setConfigStaff] = useState<Staff | null>(null);
  const [topicOrKnowladge, setTopicOrKnowladge] =
    useState<TopicOrKnowladgeWithKey>({} as TopicOrKnowladgeWithKey);

  // 删除 Mutation
  const [deleteBotConfigById] = useMutation<unknown>(MUTATION_BOT_CONFIG);
  const [deleteKnowledgeBaseById] = useMutation<unknown>(
    MUTATION_KNOWLEDGE_BASE
  );
  const [deleteTopicCategoryById] = useMutation<unknown>(
    MUTATION_TOPIC_CATEGORY
  );

  const handleContextMenuOpen = useCallback(
    (
      event: React.MouseEvent<HTMLLIElement>,
      topicOrKnowladgeKey: TopicOrKnowladgeKey,
      Knowladge?: KnowledgeBase,
      Topic?: TopicCategory
    ) => {
      event.preventDefault();
      event.stopPropagation();
      setState({
        mouseX: event.clientX - 2,
        mouseY: event.clientY - 4,
      });
      setTopicOrKnowladge({
        Knowladge,
        Topic,
        topicOrKnowladgeKey,
      });
    },
    []
  );

  const handleContextMenuClose = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setState(initialState);
  };

  function newTopicOrKnowladge(topicOrKnowladgeKey: TopicOrKnowladgeKey) {
    setState(initialState);
    setTopicOrKnowladge({ topicOrKnowladgeKey });
    refOfKnowladgeDialog.current?.setOpen(true);
  }

  function editTopicOrKnowladge(topicOrKnowladgeKey: TopicOrKnowladgeKey) {
    setState(initialState);
    setTopicOrKnowladge(_.assignIn({ topicOrKnowladgeKey }, topicOrKnowladge));
    refOfKnowladgeDialog.current?.setOpen(true);
  }

  function deleteTopicOrKnowladge(topicOrKnowladgeKey: TopicOrKnowladgeKey) {
    setState(initialState);
    switch (topicOrKnowladgeKey) {
      case 'Topic': {
        const id = topicOrKnowladge.Topic?.id;
        if (id) deleteTopicCategoryById({ variables: { id: [id] } });
        break;
      }
      case 'Knowladge': {
        const id = topicOrKnowladge.Knowladge?.id;
        const botConfigId = topicOrKnowladge.Knowladge?.botConfig?.id;
        if (botConfigId)
          deleteBotConfigById({ variables: { id: [botConfigId] } });
        if (id) deleteKnowledgeBaseById({ variables: { id: [id] } });
        break;
      }
      default:
        unimplemented();
    }
  }
  /**
   * 关联知识库和机器人
   */
  const interrelateBot = () => {
    refOfDialog.current?.setOpen(true);
  };

  function mutationCallback(staff: Staff) {
    setConfigStaff(staff);
  }

  const botConfigList =
    memoData.botConfigMap[topicOrKnowladge.Knowladge?.id ?? -1] ?? [];
  const botConfig = botConfigList[0];

  const staffId = botConfig ? botConfig?.botId : null;
  const memoStaffAndBotConfig = {
    botConfig,
    staffId,
  };

  return (
    <Grid item xs={12} sm={2}>
      {/* 功能菜单 */}
      <BotToolbar newTopicOrKnowladge={newTopicOrKnowladge} />
      {/* 知识库，分类 树状列表 */}
      <BotTreeView
        allKnowledgeBase={memoData.allKnowledgeBase}
        setOnContextMenu={handleContextMenuOpen}
      />
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
          {topicOrKnowladge.topicOrKnowladgeKey === 'Knowladge' && [
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
            <MenuItem
              key="addTopicCategory"
              onClick={() => {
                setState(initialState);
                newTopicOrKnowladge('Topic');
              }}
            >
              添加知识库分类
            </MenuItem>,
            <MenuItem
              key="deleteTopicOrKnowladge"
              onClick={() => {
                deleteTopicOrKnowladge('Knowladge');
              }}
            >
              删除知识库
            </MenuItem>,
          ]}
          {topicOrKnowladge.topicOrKnowladgeKey === 'Topic' && [
            <MenuItem
              key="editTopicOrKnowladge"
              onClick={() => {
                editTopicOrKnowladge('Topic');
              }}
            >
              修改知识分类
            </MenuItem>,
            <MenuItem
              key="deleteTopicOrKnowladge"
              onClick={() => {
                deleteTopicOrKnowladge('Topic');
              }}
            >
              删除知识分类
            </MenuItem>,
          ]}
        </Menu>
      </div>
      {/* 显示 弹窗配置知识库对应的机器人 */}
      <DraggableDialog title="配置机器人账户" ref={refOfDialog}>
        <Typography variant="h5" gutterBottom>
          客服账号配置
        </Typography>
        <StaffFormContainer
          staffId={memoStaffAndBotConfig.staffId}
          mutationCallback={mutationCallback}
        />
        <Divider />
        <Typography variant="h5" gutterBottom>
          机器人配置
        </Typography>
        {(memoStaffAndBotConfig.botConfig && (
          <BotConfigForm defaultValues={memoStaffAndBotConfig.botConfig} />
        )) ||
          (configStaff && topicOrKnowladge.Knowladge?.id && (
            <BotConfigForm
              defaultValues={{
                botId: configStaff.id,
                knowledgeBaseId: topicOrKnowladge.Knowladge.id,
                noAnswerReply: botConfigNoAnswerReply,
              }}
            />
          ))}
      </DraggableDialog>
      <DraggableDialog
        title={
          (topicOrKnowladge.topicOrKnowladgeKey === 'Knowladge' &&
            '配置知识库') ||
          '配置知识库分类'
        }
        ref={refOfKnowladgeDialog}
      >
        {topicOrKnowladge.topicOrKnowladgeKey === 'Topic' && (
          <TopicAndKnowladgeContainer
            showWhat="Topic"
            defaultValue={topicOrKnowladge.Topic}
            allTopicCategoryList={allTopicCategory ?? []}
          />
        )}
        {topicOrKnowladge.topicOrKnowladgeKey === 'Knowladge' && (
          <TopicAndKnowladgeContainer
            showWhat="Knowladge"
            defaultValue={topicOrKnowladge.Knowladge}
            allTopicCategoryList={allTopicCategory ?? []}
          />
        )}
      </DraggableDialog>
    </Grid>
  );
}
