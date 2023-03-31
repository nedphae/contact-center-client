/** ！
 * 咨询接待页面
 */
import { createStyles, makeStyles } from '@material-ui/core';
import ChatApp from '../../components/Chat/ChatApp';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      flexGrow: 1,
      height: '100%',
    },
  })
);

export default function Chat() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <ChatApp />
    </div>
  );
}
