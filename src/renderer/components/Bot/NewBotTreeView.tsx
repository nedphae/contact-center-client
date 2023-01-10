import React, { useRef, useState } from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import TreeView from '@material-ui/lab/TreeView';

import { KnowledgeBase, TopicCategory } from 'renderer/domain/Bot';
import StyledTreeItem, {
  CloseSquare,
  MinusSquare,
  PlusSquare,
} from 'renderer/components/TreeView/StyledTreeItem';
import {
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { useMutation, useQuery } from '@apollo/client';
import {
  TopicCategoryGraphql,
  QUERY_TOPIC_CATEGORY_BY_KNOWLEDGE_BASE_ID,
  MUTATION_DELETE_TOPIC_CATEGORY,
} from 'renderer/domain/graphql/Bot';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import useAlert from 'renderer/hook/alert/useAlert';
import DraggableDialog, {
  DraggableDialogRef,
} from '../DraggableDialog/DraggableDialog';
import TopicCategoryForm from './TopicCategoryForm';

export interface TopicOrKnowladge {
  Topic?: TopicCategory | undefined;
  Knowladge?: KnowledgeBase | undefined;
}

export type TopicOrKnowladgeKey = keyof TopicOrKnowladge;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolBar: {
      minHeight: 30,
      background: theme.palette.background.default,
      borderRightStyle: 'solid',
      borderLeftStyle: 'solid',
      borderWidth: 1,
      // 是否将按钮调中间
      // justifyContent: 'center',
    },
    list: {
      width: '100%',
      height: 'calc(100vh - 118px)',
      overflow: 'auto',
      backgroundColor: theme.palette.background.paper,
    },
    listItemIcon: {
      minWidth: '25px',
    },
    media: {
      marginTop: 10,
    },
  })
);

interface BotTreeViewProps {
  knowledgeBase: KnowledgeBase;
  selectTC: TopicCategory | undefined;
  filterTC: (topicCategory: TopicCategory | undefined) => void;
}

interface TopicCategoryItemProps {
  topicCategoryList: TopicCategory[];
  onContextMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    topicCategory: TopicCategory | undefined
  ) => void;
  selectTC: TopicCategory | undefined;
  filterTC: (topicCategory: TopicCategory) => void;
}

function TopicCategoryItem(props: TopicCategoryItemProps) {
  const { topicCategoryList, onContextMenu, selectTC, filterTC } = props;
  return (
    <>
      {topicCategoryList.map((cl) => (
        <StyledTreeItem
          key={cl.id?.toString()}
          nodeId={`topicCategory-${cl.id}`}
          label={
            <>
              <ListItem
                component="ul"
                selected={selectTC && selectTC.id === cl.id}
                onClick={() => filterTC(cl)}
              >
                {cl.name}
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="more"
                    size="small"
                    onClick={(event) => {
                      onContextMenu(event, cl);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </>
          }
        >
          {cl.children && (
            <TopicCategoryItem
              topicCategoryList={cl.children}
              onContextMenu={onContextMenu}
              selectTC={selectTC}
              filterTC={filterTC}
            />
          )}
        </StyledTreeItem>
      ))}
    </>
  );
}

export default React.memo(function NewBotTreeView(props: BotTreeViewProps) {
  const { knowledgeBase, selectTC, filterTC } = props;
  const knowledgeBaseId = knowledgeBase.id;

  const classes = useStyles();
  const { t } = useTranslation();

  const refOfCategoryDialog = useRef<DraggableDialogRef>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [allAnchorEl, setAllAnchorEl] = useState<HTMLButtonElement | null>(
    null
  );
  const [selectTCMenu, setSelectTCMenu] = useState<TopicCategory>();
  const open = Boolean(anchorEl);
  const allOpen = Boolean(allAnchorEl);

  const { onCompleted, onError, onErrorMsg } = useAlert();
  const { data, refetch } = useQuery<TopicCategoryGraphql>(
    QUERY_TOPIC_CATEGORY_BY_KNOWLEDGE_BASE_ID,
    {
      variables: { knowledgeBaseId },
    }
  );
  const [deleteTopicCategoryById] = useMutation<unknown>(
    MUTATION_DELETE_TOPIC_CATEGORY,
    {
      onCompleted,
      onError,
    }
  );

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    topicCategory: TopicCategory | undefined
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectTCMenu(topicCategory);
    event.preventDefault();
  };

  const handleClose = () => {
    setAnchorEl(null);
    // setSelectTCMenu(undefined);
  };

  const handleAllClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAllAnchorEl(event.currentTarget);
    setSelectTCMenu(undefined);
    event.preventDefault();
  };

  const handleAllClose = () => {
    setAllAnchorEl(null);
    // setSelectTCMenu(undefined);
  };

  const allTopicCategory = data?.topicCategoryByKnowledgeBaseId;
  const topicCategoryPidGroup = allTopicCategory
    ? _.groupBy(allTopicCategory, (it) => it.pid)
    : {};

  const topicCategoryList = allTopicCategory
    ?.map((it) => {
      const children = topicCategoryPidGroup[it.id ?? -1];
      return _.defaults({ children }, it);
    })
    .filter((it) => it.pid === undefined || it.pid === null);

  return (
    <>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            setSelectTCMenu({
              knowledgeBaseId,
              pid: selectTCMenu?.id,
            });
            refOfCategoryDialog.current?.setOpen(true);
          }}
        >
          {t('Add subcategory')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            setSelectTCMenu(selectTCMenu);
            refOfCategoryDialog.current?.setOpen(true);
          }}
        >
          {t('Modify knowledge category')}
        </MenuItem>
        <MenuItem
          key="deleteTopicOrKnowladge"
          onClick={async () => {
            handleClose();
            if (selectTCMenu?.id) {
              if (selectTCMenu.children && selectTCMenu.children.length > 0) {
                onErrorMsg(
                  'The current category is not empty, please delete the subcategory first'
                );
              } else {
                await deleteTopicCategoryById({
                  variables: { ids: [selectTCMenu?.id] },
                });
                refetch();
              }
            }
          }}
        >
          {t('Delete knowledge category')}
        </MenuItem>
      </Menu>
      <Menu
        id="short-menu"
        anchorEl={allAnchorEl}
        keepMounted
        open={allOpen}
        onClose={handleAllClose}
      >
        <MenuItem
          onClick={() => {
            handleAllClose();
            setSelectTCMenu({
              knowledgeBaseId,
            });
            refOfCategoryDialog.current?.setOpen(true);
          }}
        >
          {t('Add knowledge base category')}
        </MenuItem>
      </Menu>
      <DraggableDialog
        title={t('Configure knowledge base category')}
        ref={refOfCategoryDialog}
      >
        <TopicCategoryForm
          defaultValues={selectTCMenu}
          allTopicCategoryList={allTopicCategory ?? []}
          refetch={refetch}
        />
      </DraggableDialog>
      <Toolbar className={classes.toolBar}>
        <Typography variant="subtitle2">{knowledgeBase.name}</Typography>
      </Toolbar>
      <TreeView
        className={classes.list}
        defaultCollapseIcon={<MinusSquare />}
        defaultExpandIcon={<PlusSquare />}
        defaultEndIcon={<CloseSquare />}
      >
        <StyledTreeItem
          key="all"
          nodeId="topicCategory-all"
          label={
            <>
              <ListItem
                component="ul"
                selected={!selectTC}
                onClick={() => filterTC(undefined)}
              >
                {t('All')}
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="more"
                    size="small"
                    onClick={(event) => {
                      handleAllClick(event);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </>
          }
        />
        {topicCategoryList && (
          <TopicCategoryItem
            topicCategoryList={topicCategoryList}
            onContextMenu={handleClick}
            selectTC={selectTC}
            filterTC={filterTC}
          />
        )}
      </TreeView>
    </>
  );
});
