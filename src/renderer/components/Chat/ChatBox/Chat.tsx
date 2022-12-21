/**
 * 聊天窗口设计
 */
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import Uploady, { FileFilterMethod } from '@rpldy/uploady';
import createUploader from '@rpldy/uploader';
import UploadDropZone from '@rpldy/upload-drop-zone';
import withPasteUpload from '@rpldy/upload-paste';

import {
  createStyles,
  Theme,
  makeStyles,
  styled,
} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Resizable } from 're-resizable';

import Grid from '@material-ui/core/Grid';

import axios from 'renderer/utils/request';
import {
  addImageToSend,
  getSelectedSession,
} from 'renderer/state/chat/chatAction';
import { getUploadS3ChatPath } from 'renderer/config/clientConfig';
import { useEffect, useRef } from 'react';
import { useAppDispatch } from 'renderer/store';
import { Session } from 'renderer/domain/Session';
import ChatHeader from './ChatHeader';
import MesageList from './MessagePanel';
import Editor from './Editor';

const style = {
  display: 'flex',
  // alignItems: 'center',
  justifyContent: 'center',
  background: '#f0f0f0',
} as const;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      // backgroundColor: '#424242',
      borderLeft: 'solid 1px #ddd',
      borderRight: 'solid 1px #ddd',
      height: '100%',
    },
    paper: {
      height: 140,
      width: 100,
    },
    control: {
      padding: theme.spacing(2),
    },
  })
);

const StyledDropZone = styled(UploadDropZone)({
  height: '100%',
});
const PasteUploadDropZone = withPasteUpload(StyledDropZone);

export const uploader = createUploader({
  destination: { url: getUploadS3ChatPath() },
});

export default function Chat() {
  const classes = useStyles();
  const selectedSession = useSelector(getSelectedSession);
  const dispatch = useAppDispatch();
  const handlerRef = useRef<() => void>();
  const selectedSessionRef = useRef<Session>();

  const fileFilter: FileFilterMethod = (file) => {
    return selectedSession && (file as File).size < 10485760;
  };

  useEffect(() => {
    selectedSessionRef.current = selectedSession;
  }, [selectedSession]);

  useEffect(() => {
    if (!handlerRef.current && window.electron) {
      handlerRef.current = window.electron.ipcRenderer.on(
        'screenshots-ok',
        (buffer) => {
          if (selectedSessionRef.current) {
            const file = new Blob(
              [(buffer as Uint8Array).buffer],
              { type: 'image/png' } /* (1) */
            );
            const formData = new FormData();
            formData.append('file', file, `${uuidv4().substring(0, 8)}.png`);
            axios
              .post(getUploadS3ChatPath(), formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              })
              .then((res) => {
                const mediaId = (res.data as string[])[0];
                dispatch(addImageToSend([mediaId]));
                return undefined;
              })
              .catch(() => {});
          }
        }
      );
    }
    return () => {
      if (handlerRef.current) {
        handlerRef.current();
      }
    };
  }, [dispatch]);

  return (
    <Uploady
      destination={{ url: getUploadS3ChatPath() }}
      fileFilter={fileFilter}
    >
      <PasteUploadDropZone>
        <Grid container className={classes.root}>
          <CssBaseline />
          <ChatHeader />
          <div
            style={{
              width: 'auto',
              height: '80vh',
              // 预留出 header 的位置, header 修改为 sticky，不用再预留位置
              paddingTop: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
            }}
          >
            <Resizable
              style={style}
              defaultSize={{
                width: 'auto',
                height: '65vh',
              }}
              maxHeight="70vh"
              minHeight="30vh"
              enable={{
                top: false,
                right: false,
                bottom: true,
                left: false,
                topRight: false,
                bottomRight: false,
                bottomLeft: false,
                topLeft: false,
              }}
            >
              <MesageList />
            </Resizable>
            <Editor selectedSession={selectedSession} />
          </div>
        </Grid>
      </PasteUploadDropZone>
    </Uploady>
  );
}
