import { CssBaseline, Link, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export default function OnlineVersion() {
  const { t } = useTranslation();

  return (
    <>
      <CssBaseline />
      <Typography variant="h6" gutterBottom>
        {t('Web version does not support viewing monitoring, please')}
        <Link href="https://xbcs.top/download/" target="_blank">
          {t('download client')}
        </Link>
        {t('to view')}
      </Typography>
    </>
  );
}
