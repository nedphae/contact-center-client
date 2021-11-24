import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import Button from '@material-ui/core/Button';
import CardHeader from '@material-ui/core/CardHeader';

const useStyles = makeStyles({
  root: {
    maxWidth: 350,
    maxHeight: 120,
  },
});

interface FileProps {
  filename: string;
  fileSize: number;
  url: string;
}

export default function FileCard(props: FileProps) {
  const classes = useStyles();
  const { filename, fileSize, url } = props;

  function downloadFile() {
    window.open(url);
  }

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <CardHeader
          avatar={<InsertDriveFileIcon />}
          title={filename}
          subheader={fileSize}
        />
      </CardActionArea>
      <CardActions>
        <Button size="small">预览</Button>
        <Button size="small" onClick={downloadFile}>
          下载
        </Button>
      </CardActions>
    </Card>
  );
}
