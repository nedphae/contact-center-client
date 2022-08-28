import { gql } from '@apollo/client';

/** 微信授权信息 */
export interface WeChatOpenInfo {
  id?: number;
  authorizerAppid?: string;
  nickName?: string;
  headImg?: string;
  serviceTypeInfo?: number;
  verifyTypeInfo?: number;
  userName?: string;
  principalName?: string;
  businessInfo?: string;
  alias?: string;
  qrcodeUrl?: string;
  signature?: string;
  miniProgram: boolean;
  enable: boolean;
  remove: boolean;
  // 关联的接待组
  shuntId?: number;
  bindingTime?: number;

  shuntName?: string;
}

export const QUERY_WECHAT_INFO = gql`
  query WeChatOpenInfo {
    getAllWeChatOpenInfo {
      id
      authorizerAppid
      nickName
      headImg
      serviceTypeInfo
      verifyTypeInfo
      userName
      principalName
      businessInfo
      alias
      qrcodeUrl
      signature
      miniProgramInfo
      enable
      shuntId
    }
  }
`;

export interface WeChatOpenInfoGraphql {
  getAllWeChatOpenInfo: WeChatOpenInfo[];
}

export const MUTATION_WECHAT_INFO = gql`
  mutation WeChatOpenInfo($weChatOpenInfo: WeChatOpenInfoInput!) {
    updateWeChatOpenInfo(weChatOpenInfo: $weChatOpenInfo) {
      id
      authorizerAppid
      nickName
      headImg
      serviceTypeInfo
      verifyTypeInfo
      userName
      principalName
      businessInfo
      alias
      qrcodeUrl
      signature
      miniProgramInfo
      enable
      shuntId
    }
  }
`;

export interface UpdateWeChatOpenInfoGraphql {
  updateWeChatOpenInfo: WeChatOpenInfo;
}
