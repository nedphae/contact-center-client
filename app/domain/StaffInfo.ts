type Staff = {
  organizationId: number;
  id: number;
  // 用来获取分组 同事会话;
  staffGroup: StaffGroup;
  role: string;
  realName: string;
  username: string;
  nickName: string;
  gender: string;
  createTime: Date;
  headImg: string;
};

type StaffGroup = {
  id: number;
  groupName: string;
};

export default Staff;
