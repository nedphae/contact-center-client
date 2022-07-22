import { useEffect, useState } from 'react';
import axios from 'axios';
// react plugin for creating charts
// @material-ui/core
// @material-ui/icons
// core components
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import { gql, useQuery } from '@apollo/client';
import useAlert from 'renderer/hook/alert/useAlert';
import clientConfig, {
  getDashboardUrlById,
  getKibanaSpaceUrl,
} from 'renderer/config/clientConfig';
import SpeedDials from 'renderer/components/SpeedDials/SpeedDials';

interface KibanaUrl {
  kibanaUsername?: string;
  kibanaPassword?: string;
  kibanaUrl?: string;
}

interface KibanaUrlGraphql {
  getKibanaUrl: KibanaUrl;
}

export const QUERY_KIBANA_URL = gql`
  query KibanaUrl {
    getKibanaUrl {
      kibanaUsername
      kibanaPassword
      kibanaUrl
    }
  }
`;

interface KibanaUrlString {
  spaceId: string;
  conv: string;
  staff: string;
}

export default function StaffAttendance() {
  const { onErrorMsg } = useAlert();

  const { data: kibanaUrlGraphql } =
    useQuery<KibanaUrlGraphql>(QUERY_KIBANA_URL);
  const [kibanaUrl, setKibanaUrl] = useState<KibanaUrlString>();

  useEffect(() => {
    (async function runAsync() {
      const kibanaData = kibanaUrlGraphql?.getKibanaUrl;
      // 因为 graphql 的 hook 会导致登录两次
      if (!kibanaUrl && kibanaData && kibanaData?.kibanaUrl) {
        const tempKibanaUrl = JSON.parse(
          kibanaData.kibanaUrl
        ) as KibanaUrlString;

        const kibanaLoginUrl = clientConfig.kibana.loginUrl;
        const currentUrl = getKibanaSpaceUrl(tempKibanaUrl.spaceId);

        try {
          await axios.get<void>(currentUrl);
        } catch (ex) {
          // 需要登陆
          const kibanaLoginBody = {
            providerType: 'basic',
            providerName: 'basic',
            currentURL: currentUrl,
            params: {
              username: kibanaData?.kibanaUsername,
              password: kibanaData?.kibanaPassword,
            },
          };
          const result = await axios.post<void>(
            kibanaLoginUrl,
            kibanaLoginBody,
            {
              headers: {
                'Content-Type': 'application/json',
                'kbn-version': '7.16.1',
              },
            },
          );
          if (result.status !== 200) {
            onErrorMsg('登录Kibana失败，请联系管理员');
          }
        } finally {
          setKibanaUrl(tempKibanaUrl);
        }
      }
    })();
  }, [kibanaUrl, kibanaUrlGraphql, onErrorMsg]);
  // {document.documentElement.clientHeight - 60}

  const tempActions = [
    {
      icon: <OpenInBrowserIcon />,
      name: '在浏览器中打开',
      doAction: () => {
        if (kibanaUrl) {
          window.open(
            getDashboardUrlById(kibanaUrl.spaceId, kibanaUrl.staff),
            '_blank',
          );
        }
      },
    },
  ];

  return (
    <>
      <SpeedDials actions={tempActions} />
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: 'calc(100vh - 60px)',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {kibanaUrl && (
          <iframe
            title="考勤"
            style={{
              flexGrow: 1,
              border: 'none',
              margin: 0,
              padding: 0,
            }}
            src={getDashboardUrlById(kibanaUrl.spaceId, kibanaUrl.staff)}
          />
        )}
      </div>
    </>
  );
}
