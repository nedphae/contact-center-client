export default interface Organization {
  id: number;
  callingCode: string;
  phone: string;
  // 企业邮箱
  email?: string;
  // 企业名称
  name?: string;
  // 企业地址
  address?: string;
  // 企业主页
  homepage?: string;
  // 企业详细信息
  detail?: string;
}
