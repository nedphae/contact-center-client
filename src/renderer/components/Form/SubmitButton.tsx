import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <div className={classes.wrapper}>
      <Button type="submit" fullWidth variant="contained" color="primary">
        {t('Save')}
      </Button>
    </div>
  );
}
