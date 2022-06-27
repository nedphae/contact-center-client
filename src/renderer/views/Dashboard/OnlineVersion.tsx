import { CssBaseline, Link, Typography } from '@material-ui/core';

export default function OnlineVersion() {
  return (
    <>
      <CssBaseline />
      <Typography variant="h6" gutterBottom>
        Web在线版本不支持查看监控，请
        <Link href="https://xbcs.top/download/" target="_blank">
          下载客户端
        </Link>
        查看
      </Typography>
    </>
  );
}
