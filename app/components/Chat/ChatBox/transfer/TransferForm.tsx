/* eslint-disable react/jsx-props-no-spreading */
import React, { forwardRef, useState } from 'react';
import _ from 'lodash';

import SwipeableViews from 'react-swipeable-views';
import { useQuery } from '@apollo/client';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  Grid,
  Button,
  InputAdornment,
  makeStyles,
  Tab,
  Tabs,
  TextField,
  Theme,
  useTheme,
} from '@material-ui/core';

import {
  MonitorGraphql,
  QUERY_MONITOR_WITHOUT_CUSTOMER,
  QUERY_STORED_MONITOR,
  StoredMonitorGraphql,
} from 'app/domain/graphql/Monitor';
import { TransferQuery } from 'app/domain/Conversation';
import { TreeView } from '@material-ui/lab';
import StyledTreeItem, {
  MinusSquare,
  PlusSquare,
  CloseSquare,
} from 'app/components/TreeView/StyledTreeItem';
import { StaffGroup, StaffShunt } from 'app/domain/StaffInfo';
import { useDispatch } from 'react-redux';
import { sendTransferMsg } from 'app/state/session/sessionAction';
import noteLine from '@iconify-icons/clarity/note-line';
import { InlineIcon } from '@iconify/react';
import DraggableDialog, {
  DraggableDialogRef,
} from 'app/components/DraggableDialog/DraggableDialog';
import TabPanel from '../../Base/TabPanel';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%', // '100%', 联系人列表的宽度
    height: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  list: {
    width: '100%',
    maxHeight: '50vh',
    backgroundColor: theme.palette.background.paper,
    overflow: 'auto',
  },
  titleButton: {
    marginLeft: 'auto',
  },
}));

function a11yProps(index: number) {
  return {
    id: `scrollable-force-tab-${index}`,
    'aria-controls': `scrollable-force-tabpanel-${index}`,
  };
}

export interface TransferFormProps {
  defaultValues: TransferQuery;
}
function TransferForm(
  props: TransferFormProps,
  ref: React.Ref<DraggableDialogRef>
) {
  const { defaultValues } = props;

  const classes = useStyles();
  const theme = useTheme();

  const dispatch = useDispatch();
  const [tab, setTab] = useState(0);
  const { data: storeMonitorData, refetch: refetchStaff } =
    useQuery<StoredMonitorGraphql>(QUERY_STORED_MONITOR);
  const { data, refetch } = useQuery<MonitorGraphql>(
    QUERY_MONITOR_WITHOUT_CUSTOMER
  );
  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm<TransferQuery>({
    defaultValues,
    shouldUnregister: true,
  });

  const handleChange = (
    event: React.ChangeEvent<unknown>,
    newValue: number
  ) => {
    setTab(newValue);
    event.preventDefault();
    // setValue('type', newValue === 0 ? 'SHUNT' : 'GROUP');
  };
  const handleChangeIndex = (index: number) => {
    setTab(index);
  };

  let groupListWithStaff: StaffGroup[] | undefined;
  let shuntListWithStaff: StaffShunt[] | undefined;
  if (data && storeMonitorData) {
    const { staffStatusList } = _.cloneDeep(data);
    const { allStaff, allStaffGroup, allStaffShunt } =
      _.cloneDeep(storeMonitorData);
    const mapOfStaffStatus = _.groupBy(allStaff, 'id');

    const staffStatusListWithStaff = staffStatusList
      .filter((it) => it.staffType === 1 && it.id !== defaultValues.fromStaffId)
      .map((it) => _.defaults(it, mapOfStaffStatus[it.id.toString()][0]));

    const staffStatusListMap = _.groupBy(
      staffStatusListWithStaff,
      (it) => it.groupId
    );
    groupListWithStaff = allStaffGroup.map((element) =>
      _.defaults({ staffList: staffStatusListMap[element.id] }, element)
    );
    shuntListWithStaff = allStaffShunt.map((it) => {
      const staffListForShunt = staffStatusListWithStaff.filter((ss) =>
        ss.shunt.includes(it.id)
      );
      return _.defaults({ staffList: staffListForShunt }, it);
    });
  }

  const setStaffId = (staffId: number) => {
    setValue('type', 'STAFF');
    setValue('toStaffId', staffId);
  };

  const onSubmit: SubmitHandler<TransferQuery> = (form) => {
    // 提交转接作业，等待回应
    dispatch(sendTransferMsg(form));
    (ref as React.RefObject<DraggableDialogRef>)?.current?.setOpen(false);
  };

  return (
    <DraggableDialog
      title={
        <Grid container justifyContent="flex-end">
          转接客户
          <Button
            color="primary"
            className={classes.titleButton}
            onClick={() => {
              refetch();
              refetchStaff();
            }}
          >
            刷新
          </Button>
        </Grid>
      }
      ref={ref}
    >
      <div className={classes.root}>
        <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
          <Tabs
            value={tab}
            onChange={handleChange}
            variant="fullWidth"
            scrollButtons="off"
            aria-label="scrollable prevent tabs example"
          >
            <Tab label="按接待组" aria-label="SHUNT" {...a11yProps(0)} />
            <Tab label="按客服组" aria-label="GROUP" {...a11yProps(1)} />
          </Tabs>
          <SwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={tab}
            onChangeIndex={handleChangeIndex}
          >
            <TabPanel value={tab} index={0} className={classes.list}>
              <TreeView
                defaultCollapseIcon={<MinusSquare />}
                defaultExpandIcon={<PlusSquare />}
                defaultEndIcon={<CloseSquare />}
              >
                {shuntListWithStaff &&
                  shuntListWithStaff.map((shunt) => (
                    <StyledTreeItem
                      key={shunt.id.toString()}
                      nodeId={`shunt-${shunt.id}`}
                      label={shunt.name}
                    >
                      {shunt.staffList &&
                        shunt.staffList.map((staff) => (
                          <StyledTreeItem
                            key={staff.id.toString()}
                            nodeId={`staff-${staff.id}`}
                            label={`${staff.realName}[${staff.nickName}] 接待量: ${staff.currentServiceCount}/${staff.maxServiceCount}`}
                            onClick={() => {
                              setStaffId(staff.id);
                            }}
                          />
                        ))}
                    </StyledTreeItem>
                  ))}
              </TreeView>
            </TabPanel>
            <TabPanel value={tab} index={1} className={classes.list}>
              <TreeView
                defaultCollapseIcon={<MinusSquare />}
                defaultExpandIcon={<PlusSquare />}
                defaultEndIcon={<CloseSquare />}
              >
                {groupListWithStaff &&
                  groupListWithStaff.map((group) => (
                    <StyledTreeItem
                      key={group.id.toString()}
                      nodeId={`group-${group.id}`}
                      label={group.groupName}
                    >
                      {group.staffList &&
                        group.staffList.map((staff) => (
                          <StyledTreeItem
                            key={staff.id.toString()}
                            nodeId={`staff-${staff.id}`}
                            label={`${staff.realName}[${staff.nickName}] 接待量: ${staff.currentServiceCount}/${staff.maxServiceCount}`}
                            onClick={() => {
                              setStaffId(staff.id);
                            }}
                          />
                        ))}
                    </StyledTreeItem>
                  ))}
              </TreeView>
            </TabPanel>
          </SwipeableViews>
          <TextField type="hidden" {...register('type')} />
          <TextField
            value={defaultValues.userId || ''}
            type="hidden"
            {...register('userId', { valueAsNumber: true })}
          />
          <TextField
            type="hidden"
            {...register('toStaffId', { valueAsNumber: true })}
          />
          <TextField
            type="hidden"
            {...register('fromStaffId', { valueAsNumber: true })}
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            multiline
            id="remarks"
            label="转接原因"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <InlineIcon icon={noteLine} />
                </InputAdornment>
              ),
            }}
            error={errors.remarks && true}
            helperText={errors.remarks?.message}
            {...register('remarks', {
              required: '转接原因必填',
              maxLength: {
                value: 500,
                message: '转接原因不能大于500个字符',
              },
            })}
          />
          <Button type="submit" fullWidth variant="contained" color="primary">
            转接
          </Button>
        </form>
      </div>
    </DraggableDialog>
  );
}

export default forwardRef<DraggableDialogRef, TransferFormProps>(TransferForm);
