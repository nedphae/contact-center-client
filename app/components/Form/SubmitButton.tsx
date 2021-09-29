import React from 'react';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      margin: theme.spacing(1),
      position: 'relative',
    },
  })
);

export default function SubmitButton() {
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      <Button type="submit" fullWidth variant="contained" color="primary">
        保存
      </Button>
    </div>
  );
}
