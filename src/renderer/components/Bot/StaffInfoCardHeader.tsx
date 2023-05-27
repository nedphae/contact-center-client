import { useEffect, useRef } from 'react';
import { useLazyQuery } from '@apollo/client';
import {
  CardHeader,
  Avatar,
  createStyles,
  makeStyles,
  CardActionArea,
} from '@material-ui/core';
import { red } from '@material-ui/core/colors';
import { useTranslation } from 'react-i18next';
import { getDownloadS3StaffImgPath } from 'renderer/config/clientConfig';
import { StaffGraphql, QUERY_STAFF_BY_ID } from 'renderer/domain/graphql/Staff';
import Staff from 'renderer/domain/StaffInfo';
import DraggableDialog, {
  DraggableDialogRef,
} from '../DraggableDialog/DraggableDialog';
import StaffForm from '../StaffForm/StaffForm';

interface StaffInfoCardHeaderProp {
  staffId?: number;
  mutationCallback?: (staff: Staff) => void | undefined;
}

const useStyles = makeStyles(() =>
  createStyles({
    avatar: {
      backgroundColor: red[500],
    },
  })
);

const StaffInfoCardHeader = (prop: StaffInfoCardHeaderProp) => {
  const { staffId, mutationCallback } = prop;
  const classes = useStyles();
  const { t } = useTranslation();

  const refOfDialog = useRef<DraggableDialogRef>(null);
  const [getStaff, { data }] = useLazyQuery<StaffGraphql>(QUERY_STAFF_BY_ID, {
    variables: { staffId },
  });

  const staff = data?.getStaffById;

  useEffect(() => {
    if (staffId) {
      getStaff({
        variables: { staffId },
      });
    }
  }, [getStaff, staffId]);

  const interrelateBot = () => {
    refOfDialog.current?.setOpen(true);
  };

  return (
    <>
      <DraggableDialog
        title={t('Associate to a robot account')}
        ref={refOfDialog}
      >
        {(staff && (
          <StaffForm
            defaultValues={staff}
            mutationCallback={mutationCallback}
          />
        )) || (
          <StaffForm
            defaultValues={{ staffType: 0, simultaneousService: 9999 } as Staff}
            mutationCallback={mutationCallback}
          />
        )}
      </DraggableDialog>
      {(staff && (
        <CardActionArea>
          <CardHeader
            onClick={interrelateBot}
            avatar={
              <Avatar
                aria-label="recipe"
                src={
                  staff?.avatar &&
                  `${getDownloadS3StaffImgPath()}${staff?.avatar}`
                }
                className={classes.avatar}
              >
                {staff?.realName?.charAt(0) ?? 'A'}
              </Avatar>
            }
            title={staff?.realName ?? t('Not associate to robot account')}
            subheader={staff?.nickname}
          />
        </CardActionArea>
      )) ||
        (!staff && (
          <CardActionArea>
            <CardHeader
              onClick={interrelateBot}
              avatar={
                <Avatar aria-label="recipe" className={classes.avatar}>
                  A
                </Avatar>
              }
              title={t('Associate to a robot account')}
              subheader=" "
            />
          </CardActionArea>
        ))}
    </>
  );
};

export default StaffInfoCardHeader;
