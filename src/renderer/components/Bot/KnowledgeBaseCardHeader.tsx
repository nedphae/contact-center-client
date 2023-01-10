import React, { useRef, useState } from 'react';
import {
  Button,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Typography,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { useTranslation } from 'react-i18next';
import { KnowledgeBase } from 'renderer/domain/Bot';
import { useMutation } from '@apollo/client';
import { getDownloadS3ChatFilePath } from 'renderer/config/clientConfig';
import useAlert from 'renderer/hook/alert/useAlert';
import {
  MutationExportKnowledgeBaseGraphql,
  MUTATION_DELETE_KNOWLEDGE_BASE,
  MUTATION_TOPIC_EXPORT,
} from 'renderer/domain/graphql/Bot';
import { MUTATION_DELETE_STAFF } from 'renderer/domain/graphql/Staff';
import { NavLink } from 'react-router-dom';
import KnowledgeBaseForm from './KnowledgeBaseForm';
import DraggableDialog, {
  DraggableDialogRef,
} from '../DraggableDialog/DraggableDialog';
import BotTopicUploadForm from './BotTopicUploadForm';

interface KnowledgeBaseCardHeaderProp {
  knowledgeBase: KnowledgeBase;
  mutationCallback: () => void;
}

const KnowledgeBaseCardHeader = (prop: KnowledgeBaseCardHeaderProp) => {
  const { knowledgeBase, mutationCallback } = prop;
  const { t } = useTranslation();
  const refOfDialog = useRef<DraggableDialogRef>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const refOfUploadForm = useRef<DraggableDialogRef>(null);
  const open = Boolean(anchorEl);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { onCompleted, onError, onLoadding, onErrorMsg } = useAlert();
  // 导出知识库
  const [exportTopic, { loading }] =
    useMutation<MutationExportKnowledgeBaseGraphql>(MUTATION_TOPIC_EXPORT, {
      onCompleted,
      onError,
    });
  if (loading) {
    onLoadding(loading);
  }

  // 删除知识库
  const [deleteKnowledgeBaseById] = useMutation<unknown>(
    MUTATION_DELETE_KNOWLEDGE_BASE,
    {
      onCompleted,
      onError,
    }
  );

  const [deleteStaffByIds] = useMutation<unknown>(MUTATION_DELETE_STAFF, {
    onCompleted,
    onError,
  });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    event.preventDefault();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
  };

  const editKnowladgeBase = () => {
    handleClose();
    refOfDialog.current?.setOpen(true);
  };

  const handleDialogAgree = async () => {
    if (knowledgeBase.id) {
      await deleteKnowledgeBaseById({ variables: { ids: [knowledgeBase.id] } });
    }
    if (knowledgeBase.botConfig) {
      await deleteStaffByIds({
        variables: { ids: [knowledgeBase.botConfig.botId] },
      });
    }
    mutationCallback();
  };

  return (
    <>
      <DraggableDialog
        title={t('Configure the knowledge base')}
        ref={refOfDialog}
      >
        <KnowledgeBaseForm
          defaultValues={knowledgeBase}
          refetch={mutationCallback}
        />
      </DraggableDialog>
      <CardHeader
        title={
          <Link
            color="inherit"
            to="/admin/bot/detail"
            state={{ knowledgeBase }}
            component={NavLink}
          >
            <Typography variant="h6">{knowledgeBase.name}</Typography>
          </Link>
        }
        subheader={
          <Typography variant="body2" color="textSecondary">
            {knowledgeBase.description}
          </Typography>
        }
        action={
          <IconButton aria-label="settings" onClick={handleClick}>
            <MoreVertIcon />
          </IconButton>
        }
      />
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
      >
        <MenuItem key="editKnowladge" onClick={editKnowladgeBase}>
          {t('Modify knowledge base')}
        </MenuItem>
        <MenuItem
          key="deleteTopicOrKnowladge"
          onClick={() => {
            handleClose();
            setConfirmOpen(true);
          }}
        >
          {t('Delete knowledge base')}
        </MenuItem>
        <Divider />
        <MenuItem
          aria-label="export Topic"
          onClick={async () => {
            handleClose();
            if (knowledgeBase?.id) {
              const exportResult = await exportTopic({
                variables: {
                  knowledgeBaseId: knowledgeBase.id,
                },
              });
              const filekey = exportResult.data?.exportTopic;
              if (filekey) {
                const url = `${getDownloadS3ChatFilePath()}${filekey}`;
                window.open(url, '_blank');
              } else {
                onErrorMsg('Export failed');
              }
            }
          }}
        >
          {t('Export knowledge base')}
        </MenuItem>
        <MenuItem
          aria-label="import Topic"
          onClick={() => {
            handleClose();
            refOfUploadForm.current?.setOpen(true);
          }}
        >
          {t('Import knowledge base')}
        </MenuItem>
      </Menu>
      <DraggableDialog title={t('Import knowledge base')} ref={refOfUploadForm}>
        {knowledgeBase.id && (
          <BotTopicUploadForm
            knowledgeBaseId={knowledgeBase.id}
            onSuccess={() => {
              mutationCallback();
            }}
          />
        )}
      </DraggableDialog>
      <Dialog
        open={confirmOpen}
        onClose={handleConfirmClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {t('Are you sure you want to delete the knowledge base?')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t(
              'If you delete a knowledge base, all knowledge categories and knowledge under the knowledge base will be deleted, and the associated robot account will be deleted!'
            )}
            <br />
            {t('This operation is irreversible, please be careful!')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose} color="primary">
            {t('Cancel')}
          </Button>
          <Button
            onClick={() => {
              handleDialogAgree();
            }}
            color="secondary"
            autoFocus
          >
            {t('OK')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default KnowledgeBaseCardHeader;
