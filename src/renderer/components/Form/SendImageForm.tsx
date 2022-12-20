/* eslint-disable react/jsx-props-no-spreading */
import { useTranslation } from 'react-i18next';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import { ImageList, ImageListItem, Button, Divider } from '@material-ui/core';
import { getDownloadS3ChatImgPath } from 'renderer/config/clientConfig';

const useStyles = makeStyles((theme) =>
  createStyles({
    paper: {
      // marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    imageList: {
      alignItems: 'center',
      flexWrap: 'nowrap',
      // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
      transform: 'translateZ(0)',
    },
    title: {
      color: theme.palette.primary.light,
    },
    titleBar: {
      background:
        'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
    },
  })
);

interface SendImageFormProps {
  urls: string[];
  send: (urls: string[]) => void;
}

export default function SendImageForm(props: SendImageFormProps) {
  const { urls, send } = props;
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.paper}>
      <ImageList rowHeight={180} className={classes.imageList}>
        {urls.map((item) => (
          <ImageListItem key={item}>
            <img
              src={`${getDownloadS3ChatImgPath()}${item}`}
              alt="imageForSend"
            />
          </ImageListItem>
        ))}
      </ImageList>
      <Divider />
      <Button
        variant="contained"
        onClick={() => {
          send(urls);
        }}
      >
        {t('editor.Send')}
      </Button>
    </div>
  );
}
