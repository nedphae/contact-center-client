/**
 * 客户信息
 */
export interface Customer {
  // 客户关联的会话id
  conversationId: number | undefined;
  // 客户 id 服务器自动设置
  userId: number;
  // 用户在企业产品中的标识
  uid: string;
  // 咨询入口
  shuntId: number;
  // 用户姓名
  name: string | undefined;
  // 用户邮箱
  email: string | undefined;
  // 用户手机号
  mobile: string | undefined;
  // vip等级 1-10
  vipLevel: number | undefined;
  title: string | undefined;
  referrer: string | undefined;
  // 来源类型
  fromType: 'WEB' | 'IOS' | 'ANDROID' | 'WX' | 'WX_MA' | 'WB' | 'OPEN';
  ip: string | undefined;
  // 企业当前登录用户其他信息，JSON字符串
  data: DetailData[] | undefined;
}
export interface DetailData {
  /**
   * 数据项的名称
   * 用于区别不同的数据。其中real_name、mobile_phone、email为保留字段，
   * 分别对应客服工作台用户信息中的“姓名”、“手机”、“邮箱”这三项数据。
   * 保留关键字对应的数据项中，index、label属性将无效
   */
  key: string;
  // 该数据显示的值，类型不做限定
  value: string;
  // 该项数据显示的名称
  label: string;
  /**
   * 用于排序，显示数据时数据项按index值升序排列；
   * 不设定index的数据项将排在后面；
   * index相同或未设定的数据项将按照其在 JSON 中出现的顺序排列。
   */
  index: number | undefined;
  /**
   * 超链接地址。若指定该值，
   * 则该项数据将显示为超链接样式，点击后跳转到其值所指定的 URL 地址。
   */
  href: string | undefined;
  /**
   * 仅对mobile_phone、email两个保留字段有效，
   * 表示是否隐藏对应的数据项，true为隐藏，false为不隐藏。
   * 若不指定，默认为false不隐藏。
   */
  hidden: boolean;
}
/**
 * 客户备注(客服临时备注)
 */
export interface CustomerRemark {
  userId: number;
  // vip
}
