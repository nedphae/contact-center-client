import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import SubjectIcon from '@material-ui/icons/Subject';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ReplyIcon from '@material-ui/icons/Reply';
import { QuickReplyDto } from 'app/domain/Chat';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
  })
);

interface NestedListProps {
  quickReplyDto: QuickReplyDto;
}

export default function NestedList(prop: NestedListProps) {
  const { quickReplyDto } = prop;
  const classes = useStyles();
  const [open, setOpen] = React.useState(-1);

  const handleClick = (index: number) => {
    setOpen(index);
  };

  return (
    <List
      component="nav"
      aria-labelledby="nested-list-subheader"
      className={classes.root}
    >
      {quickReplyDto.noGroup &&
        quickReplyDto.noGroup.map((qr) => (
          <ListItem key={qr.id} button>
            <ListItemIcon>
              <ReplyIcon />
            </ListItemIcon>
            <ListItemText primary={qr.title} secondary={qr.content} />
          </ListItem>
        ))}
      {quickReplyDto.withGroup &&
        quickReplyDto.withGroup.map((group, index) => (
          <React.Fragment key={group.id}>
            <ListItem button onClick={() => handleClick(index)}>
              <ListItemIcon>
                <SubjectIcon />
              </ListItemIcon>
              <ListItemText primary={group.groupName} />
              {open === index ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={open === index} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {group.quickReply &&
                  group.quickReply.map((qr) => (
                    <ListItem key={qr.id} button className={classes.nested}>
                      <ListItemIcon>
                        <ReplyIcon />
                      </ListItemIcon>
                      <ListItemText primary={qr.title} secondary={qr.content} />
                    </ListItem>
                  ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
    </List>
  );
}
