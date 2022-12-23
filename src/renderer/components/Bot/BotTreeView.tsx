import React from 'react';
import { useTranslation } from 'react-i18next';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import FilterListIcon from '@material-ui/icons/FilterList';
import Skeleton from '@material-ui/lab/Skeleton';

import { BotConfig, KnowledgeBase, TopicCategory } from 'renderer/domain/Bot';
import StyledTreeItem, {
  CloseSquare,
  MinusSquare,
  PlusSquare,
} from 'renderer/components/TreeView/StyledTreeItem';
import {
  Box,
  Divider,
  Grid,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@material-ui/core';
import Staff from 'renderer/domain/StaffInfo';

export interface TopicOrKnowladge {
  Topic?: TopicCategory | undefined;
  Knowladge?: KnowledgeBase | undefined;
}

export type TopicOrKnowladgeKey = keyof TopicOrKnowladge;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
  loading: boolean;
  allKnowledgeBase: KnowledgeBase[] | undefined;
  botConfigMap: _.Dictionary<BotConfig[]> | undefined;
  staffMap: _.Dictionary<Staff> | undefined;
  setOnContextMenu: (
    event: React.MouseEvent<HTMLLIElement>,
    topicOrKnowladgeKey: TopicOrKnowladgeKey,
    knowledgeBase?: KnowledgeBase,
    topicCategory?: TopicCategory
  ) => void;
  selectTC: TopicCategory | undefined;
}

function buildTopicCategory(
  topicCategoryList: TopicCategory[],
  onContextMenu: (
    event: React.MouseEvent<HTMLLIElement>,
    type: TopicOrKnowladgeKey,
    knowledgeBase?: KnowledgeBase | undefined,
    topicCategory?: TopicCategory | undefined
  ) => void,
  selectTC: TopicCategory | undefined
) {
  return topicCategoryList.map((cl) => (
    <StyledTreeItem
      key={cl.id?.toString()}
      nodeId={`topicCategory-${cl.id}`}
      label={
        <>
          <ListItem component="ul">
            {cl.name}
            {selectTC && selectTC.id === cl.id && (
              <FilterListIcon fontSize="small" />
            )}
          </ListItem>
        </>
      }
      onContextMenu={(event) => {
        if (onContextMenu) {
          onContextMenu(event, 'Topic', undefined, cl);
        }
      }}
    >
      {cl.children && buildTopicCategory(cl.children, onContextMenu, selectTC)}
    </StyledTreeItem>
  ));
}

export default React.memo(function BotTreeView(props: BotTreeViewProps) {
  const {
    loading,
    allKnowledgeBase,
    botConfigMap,
    staffMap,
    setOnContextMenu,
    selectTC,
  } = props;
  const classes = useStyles();
  const { t } = useTranslation();

  const handleContextMenuOpen = (
    event: React.MouseEvent<HTMLLIElement>,
    topicOrKnowladgeKey: TopicOrKnowladgeKey,
    Knowladge?: KnowledgeBase,
    Topic?: TopicCategory
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setOnContextMenu(event, topicOrKnowladgeKey, Knowladge, Topic);
  };
  return (
    <>
      <TreeView
        className={classes.list}
        defaultCollapseIcon={<MinusSquare />}
        defaultExpandIcon={<PlusSquare />}
        defaultEndIcon={<CloseSquare />}
      >
        {(loading || !allKnowledgeBase) && (
          <div className={classes.media}>
            <Box display="flex" alignItems="center">
              <Box margin={1}>
                <Skeleton variant="circle" width={40} height={40} />
              </Box>
              <Box width="100%">
                <Skeleton
                  animation="wave"
                  height={10}
                  style={{ marginBottom: 6 }}
                />
                <Skeleton animation="wave" height={10} width="80%" />
              </Box>
            </Box>
          </div>
        )}
        {!loading &&
          allKnowledgeBase &&
          allKnowledgeBase.map((base: KnowledgeBase) => (
            <StyledTreeItem
              key={base.id?.toString()}
              nodeId={`knowledgeBase-${base.id}`}
              label={
                <ListItem component="ul">
                  <ListItemIcon className={classes.listItemIcon}>
                    <LibraryBooksIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Grid container alignItems="center">
                        <Grid item xl={7} lg={10} sm={10} xs={7}>
                          <Tooltip title={base.name} aria-label="name">
                            <Typography variant="body1" display="block" noWrap>
                              {base.name}
                            </Typography>
                          </Tooltip>
                        </Grid>
                        <Grid item xl={5} lg={2} sm={2} xs={5}>
                          <Divider
                            orientation="vertical"
                            flexItem
                            style={{ marginLeft: '5px', marginRight: '5px' }}
                          />
                          <Tooltip
                            title={base.description || ''}
                            aria-label="description"
                          >
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              display="block"
                              noWrap
                            >
                              {base.description}
                            </Typography>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    }
                    disableTypography
                    secondary={
                      <Typography
                        variant="body2"
                        color="primary"
                        display="block"
                        noWrap
                      >
                        {base.id &&
                        botConfigMap &&
                        staffMap &&
                        botConfigMap[base.id]
                          ? staffMap[botConfigMap[base.id][0]?.botId ?? -2]
                              ?.realName
                          : t('Not associate to robot account')}
                      </Typography>
                    }
                  />
                </ListItem>
              }
              onContextMenu={(event) =>
                handleContextMenuOpen(event, 'Knowladge', base)
              }
            >
              {base.categoryList &&
                buildTopicCategory(
                  base.categoryList,
                  handleContextMenuOpen,
                  selectTC
                )}
            </StyledTreeItem>
          ))}
      </TreeView>
    </>
  );
});
