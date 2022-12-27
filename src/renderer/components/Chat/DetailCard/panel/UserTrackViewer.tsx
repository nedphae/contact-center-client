import { useTranslation } from 'react-i18next';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Typography from '@material-ui/core/Typography';
import { UserTrack } from 'renderer/domain/Customer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    button: {
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    actionsContainer: {
      margin: theme.spacing(2),
    },
    resetContainer: {
      padding: theme.spacing(3),
    },
  })
);

interface UserTrackProp {
  userTrackList: UserTrack[] | undefined;
}

export default function UserTrackViewer(prop: UserTrackProp) {
  const { userTrackList } = prop;
  const classes = useStyles();
  const { t } = useTranslation();

  const activeStep = userTrackList?.filter((it) => it.awayTime).length ?? 0;

  return (
    <>
      {userTrackList && (
        <div className={classes.root}>
          <Stepper nonLinear activeStep={activeStep} orientation="vertical">
            {userTrackList.map((userTrack) => {
              const time = userTrack.awayTime
                ? `${t('Duration')}: ${Math.trunc(
                    userTrack.awayTime - userTrack.enterTime
                  )} ${t('Second')}`
                : t('Being visiting');
              return (
                <Step key={`${userTrack.enterTime}-${userTrack.url}`}>
                  <StepLabel>
                    {`${time}, ${t('Being visiting')}: ${userTrack.url}`}
                  </StepLabel>
                  <StepContent>
                    <Typography>{userTrack.title}</Typography>
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
        </div>
      )}
    </>
  );
}
