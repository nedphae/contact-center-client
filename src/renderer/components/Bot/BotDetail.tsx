import { createStyles, Grid, makeStyles } from '@material-ui/core';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { KnowledgeBase, TopicCategory } from 'renderer/domain/Bot';
import BotDataGrid from './BotDataGrid';
import NewBotTreeView from './NewBotTreeView';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      height: 'calc(100vh - 70px)',
      flexGrow: 1,
    },
  })
);

export default function BotDetail() {
  const classes = useStyles();
  const location = useLocation();
  const { knowledgeBase } = location.state as { knowledgeBase: KnowledgeBase };
  const [topicCategory, setTopicCategory] = useState<TopicCategory>();

  return (
    <>
      {knowledgeBase && (
        <Grid container className={classes.root}>
          <Grid item xs={12} sm={2}>
            <NewBotTreeView
              knowledgeBase={knowledgeBase}
              selectTC={topicCategory}
              filterTC={setTopicCategory}
            />
          </Grid>
          <Grid item xs={12} sm={10}>
            <BotDataGrid
              knowledgeBase={knowledgeBase}
              topicCategory={topicCategory}
            />
          </Grid>
        </Grid>
      )}
    </>
  );
}
