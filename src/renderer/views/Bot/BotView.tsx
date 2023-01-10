import { useRef, useState } from 'react';
import _, { NumericDictionary } from 'lodash';
import {
  List,
  Card,
  IconButton,
  CardContent,
  Typography,
  CardActions,
  Collapse,
  Box,
  ListSubheader,
  Grid,
  Paper,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { red } from '@material-ui/core/colors';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { BotConfig, KnowledgeBase } from 'renderer/domain/Bot';
import { Skeleton } from '@material-ui/lab';
import StaffInfoCardHeader from 'renderer/components/Bot/StaffInfoCardHeader';
import { useTranslation } from 'react-i18next';
import HotQuestionList from 'renderer/components/Bot/HotQuestionList';
import BotConfigForm from 'renderer/components/Bot/BotConfigForm';
import useLoadBotData from 'renderer/hook/data/useLoadBotData';
import KnowledgeBaseForm from 'renderer/components/Bot/KnowledgeBaseForm';
import DraggableDialog, {
  DraggableDialogRef,
} from 'renderer/components/DraggableDialog/DraggableDialog';
import KnowledgeBaseCardHeader from 'renderer/components/Bot/KnowledgeBaseCardHeader';
import Staff from 'renderer/domain/StaffInfo';
import { useMutation } from '@apollo/client';
import {
  BotMutationGraphql,
  MUTATION_BOT_CONFIG,
} from 'renderer/domain/graphql/Bot';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    flexContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      '& > *': {
        margin: theme.spacing(1),
      },
    },
    root: {
      width: 345,
    },
    list: {
      height: 200,
      overflow: 'auto',
    },
    expand: {
      transform: 'rotate(0deg)',
      marginLeft: 'auto',
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
      }),
    },
    expandOpen: {
      transform: 'rotate(180deg)',
    },
    avatar: {
      backgroundColor: red[500],
    },
    subheader: {
      backgroundColor: theme.palette.background.paper,
    },
  })
);

type ExpandedMap = NumericDictionary<boolean>;

export default function BotView() {
  const classes = useStyles();
  const { t } = useTranslation();
  const refOfKnowladgeFormDialog = useRef<DraggableDialogRef>(null);
  const { memoBotData, loading, refetch } = useLoadBotData();

  const [expandedMap, setExpandedMap] = useState<ExpandedMap>({});
  const [saveBotConfig] = useMutation<BotMutationGraphql>(MUTATION_BOT_CONFIG);

  const handleExpandClick = (id?: number) => {
    if (id) {
      const temptExpanded = expandedMap[id] ?? false;
      setExpandedMap(_.defaults({ [id]: !temptExpanded }, expandedMap));
    }
  };

  const allKnowledgeBase = memoBotData?.allKnowledgeBase;

  return (
    <div className={classes.flexContainer}>
      {(loading || !allKnowledgeBase) && (
        <div className={classes.root}>
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
              <Skeleton animation="wave" height={400} width={300} />
            </Box>
          </Box>
        </div>
      )}
      {allKnowledgeBase &&
        allKnowledgeBase.map((base: KnowledgeBase) => {
          function mutationCallback(botConfig: BotConfig | undefined) {
            return async (staff: Staff) => {
              if (botConfig) {
                refetch();
              } else if (base.id) {
                // 是新账号，就新建一个机器人配置
                // 防止用户不点击机器人配置按钮，导致没有机器人配置
                await saveBotConfig({
                  variables: {
                    botConfigInput: {
                      botId: staff.id,
                      knowledgeBaseId: base.id,
                      noAnswerReply: t(
                        'Sorry, did not find the answer you want'
                      ),
                      questionPrecision: 0.9,
                      similarQuestionEnable: true,
                      similarQuestionNotice: t(
                        'Sorry, the answer you were looking for was not found. you may want to ask'
                      ),
                      similarQuestionCount: 5,
                    },
                  },
                });
                refetch();
              }
            };
          }

          if (base.id) {
            const botConfig = (memoBotData?.botConfigMap[base.id] ?? [])[0];
            return (
              <div key={`knowledgeBase-${base.id}`}>
                <Card className={classes.root}>
                  <KnowledgeBaseCardHeader
                    knowledgeBase={base}
                    mutationCallback={() => {
                      refetch();
                    }}
                  />
                  {/* 关联的机器人信息 */}
                  <StaffInfoCardHeader
                    staffId={botConfig?.botId}
                    mutationCallback={(staff) => {
                      mutationCallback(botConfig)(staff);
                    }}
                  />
                  <CardContent>
                    <List
                      component="nav"
                      aria-label="secondary mailbox folders"
                      className={classes.list}
                      subheader={
                        <ListSubheader className={classes.subheader}>
                          {t('Hot Questions')}
                        </ListSubheader>
                      }
                    >
                      {botConfig && botConfig.hotQuestion && (
                        <HotQuestionList hotQuestion={botConfig?.hotQuestion} />
                      )}
                    </List>
                  </CardContent>
                  <CardActions disableSpacing>
                    <IconButton
                      className={clsx(classes.expand, {
                        [classes.expandOpen]: Boolean(
                          expandedMap[base.id ?? -1]
                        ),
                      })}
                      onClick={() => handleExpandClick(base.id)}
                      aria-expanded={Boolean(expandedMap[base.id ?? -1])}
                      aria-label="show more"
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </CardActions>
                  <Collapse
                    in={Boolean(expandedMap[base.id ?? -1])}
                    timeout="auto"
                    unmountOnExit
                  >
                    <CardContent>
                      {(botConfig && (
                        <BotConfigForm
                          defaultValues={botConfig}
                          afterMutationCallback={() => {
                            refetch();
                          }}
                        />
                      )) || (
                        <Typography>
                          {t('Please associate a robot account first')}
                        </Typography>
                      )}
                    </CardContent>
                  </Collapse>
                </Card>
              </div>
            );
          }
          return <></>;
        })}
      <Paper className={classes.root} style={{ minHeight: 400 }}>
        {/* 新增知识库窗口 */}
        <DraggableDialog
          title={t('Configure the knowledge base')}
          ref={refOfKnowladgeFormDialog}
        >
          <KnowledgeBaseForm defaultValues={undefined} refetch={refetch} />
        </DraggableDialog>
        <Grid container justifyContent="center" style={{ marginTop: 120 }}>
          <IconButton
            aria-label="delete"
            onClick={() => {
              refOfKnowladgeFormDialog.current?.setOpen(true);
            }}
          >
            <AddIcon style={{ fontSize: 80 }} />
          </IconButton>
        </Grid>
      </Paper>
    </div>
  );
}
