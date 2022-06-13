import { gql } from '@apollo/client';
import { RealTimeStatistics } from '../RealTimeStatistics';

export interface RealTimeStatisticsGraphql {
  realTimeStatistics: RealTimeStatistics;
}
export const QUERY_REALTIME_STATISTICS = gql`
  query RealTimeStatistics {
    realTimeStatistics {
      time
      onlineStaffCount
      busyStaffCount
      onlineCustomerCount
      queueCount {
        id
        name
        count
      }
    }
  }
`;
