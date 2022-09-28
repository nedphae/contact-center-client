import React, { useState } from 'react';
import _ from 'lodash';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Menu, MenuItem } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import SubjectIcon from '@material-ui/icons/Subject';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ReplyIcon from '@material-ui/icons/Reply';
import {
  QuickReply,
  QuickReplyDto,
  QuickReplyGroup,
} from 'renderer/domain/Chat';
import {
  MUTATION_DELETE_QUICK_REPLY,
  MUTATION_DELETE_QUICK_REPLY_GROUP,
} from 'renderer/domain/graphql/QuickReply';
import useAlert from 'renderer/hook/alert/useAlert';
import { QuickReplyForm, QuickReplyGroupForm } from './QuickReplyForm';

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
  refetch: () => void;
}

const initialState = {
  mouseX: undefined,
  mouseY: undefined,
};

type Form = QuickReply | QuickReplyGroup;

export default function NestedList(prop: NestedListProps) {
  const { quickReplyDto, refetch } = prop;
  const classes = useStyles();
  const { t } = useTranslation();

  const [open, setOpen] = useState(-1);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [state, setState] = useState<{
    mouseX?: undefined | number;
    mouseY?: undefined | number;
    group?: boolean;
    form?: Form;
  }>(initialState);

  const { onCompleted, onError } = useAlert();
  const [deleteQuickReplyByIds] = useMutation<unknown>(
    MUTATION_DELETE_QUICK_REPLY,
    {
      onCompleted,
      onError,
    }
  );
  const [deleteQuickReplyGroupByIds] = useMutation<unknown>(
    MUTATION_DELETE_QUICK_REPLY_GROUP,
    {
      onCompleted,
      onError,
    }
  );

  const handleClick = (index: number) => {
    setOpen(index);
  };

  const handleContextMenu = (
    event: React.MouseEvent<HTMLDivElement>,
    form: { group?: boolean; form?: Form }
  ) => {
    event.preventDefault();
    setState(
      _.merge(
        {
          mouseX: event.clientX - 2,
          mouseY: event.clientY - 4,
        },
        form
      )
    );
  };

  function setStateWithData() {
    setState(_.pick(state, ['group', 'form']));
  }

  const handleClose = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setStateWithData();
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setState(initialState);
  };

  function createMenuItem() {
    const menuList = [];
    if (state.group) {
      menuList.push(
        <MenuItem
          key="group-edit"
          onClick={() => {
            setOpenForm(true);
            setStateWithData();
          }}
        >
          {t('Edit Group')}
        </MenuItem>
      );
      menuList.push(
        <MenuItem
          key="group-del"
          onClick={() => {
            setStateWithData();
            if (state?.form?.id) {
              deleteQuickReplyGroupByIds({
                variables: { id: state.form.id },
              })
                .then(refetch)
                .catch((error) => {
                  throw error;
                });
            }
          }}
        >
          {t('Delete Group')}
        </MenuItem>
      );
    } else {
      menuList.push(
        <MenuItem
          key="qr-edit"
          onClick={() => {
            setStateWithData();
            setOpenForm(true);
          }}
        >
          {t('Edit Quick Reply')}
        </MenuItem>
      );
      menuList.push(
        <MenuItem
          key="qr-del"
          onClick={() => {
            setStateWithData();
            if (state?.form?.id) {
              deleteQuickReplyByIds({
                variables: { id: state.form.id },
              })
                .then(refetch)
                .catch((error) => {
                  throw error;
                });
            }
          }}
        >
          {t('Delete Quick Reply')}
        </MenuItem>
      );
    }
    return menuList;
  }

  return (
    <List
      component="nav"
      aria-labelledby="nested-list-subheader"
      className={classes.root}
      dense
    >
      {quickReplyDto.noGroup &&
        quickReplyDto.noGroup.map((qr) => (
          <ListItem
            key={qr.id}
            button // 右键菜单
            onContextMenu={(event) =>
              handleContextMenu(event, { group: false, form: qr })
            }
          >
            <ListItemIcon>
              <ReplyIcon />
            </ListItemIcon>
            <ListItemText primary={qr.title} secondary={qr.content} />
          </ListItem>
        ))}
      {quickReplyDto.withGroup &&
        quickReplyDto.withGroup.map((group, index) => (
          <React.Fragment key={group.id}>
            <ListItem
              button
              onClick={() => handleClick(index)}
              onContextMenu={(event) =>
                handleContextMenu(event, { group: true, form: group })
              }
            >
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
                    <ListItem
                      key={qr.id}
                      button
                      className={classes.nested}
                      onContextMenu={(event) =>
                        handleContextMenu(event, { group: false, form: qr })
                      }
                    >
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
      {/* 右键菜单 */}
      <div onContextMenu={handleClose} style={{ cursor: 'context-menu' }}>
        <Menu
          keepMounted
          open={state.mouseY !== undefined}
          onClose={handleClose}
          anchorReference="anchorPosition"
          anchorPosition={
            state.mouseY !== undefined && state.mouseX !== undefined
              ? { top: state.mouseY, left: state.mouseX }
              : undefined
          }
        >
          {createMenuItem()}
        </Menu>
      </div>
      {state.form &&
        (state.group ? (
          <QuickReplyGroupForm
            open={openForm}
            handleClose={handleCloseForm}
            defaultValues={state.form as QuickReplyGroup}
            refetch={refetch}
          />
        ) : (
          <QuickReplyForm
            open={openForm}
            handleClose={handleCloseForm}
            defaultValues={state.form as QuickReply}
            refetch={refetch}
            quickReplyGroup={quickReplyDto.withGroup ?? []}
          />
        ))}
    </List>
  );
}
