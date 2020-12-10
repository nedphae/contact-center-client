import axios from 'app/utils/request';
import Staff from 'app/domain/StaffInfo';

export async function getCurrentStaff(): Promise<Staff> {
  const result = await axios.get<Staff>(`/staff/info`);
  return result.data;
}
