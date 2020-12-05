import tokenConfig from "src/config/tokenConfig.json"
import axios from "axios"

/**
 * 配置全局的 header 和过滤器
 */

export interface LoginParamsType {
    org_id: Number
    username: string
    password: string
}

interface OauthParams {
    grant_type: string
    org_id: Number
    username: string
    password: string
}

const parseParams = (uri: string, params: any) => {
    const paramsArray: any = []
    Object.keys(params).forEach(key => params[key] && paramsArray.push(`${key}=${params[key]}`))
    if (uri.search(/\?/) === -1) {
        uri += `?${paramsArray.join('&')}`
    } else {
        uri += `&${paramsArray.join('&')}`
    }
    return uri
}

interface OauthToken {
  access_token: string
  token_type: string,
  refresh_token: string,
  expires_in: number,
  scope: string
  organizationId: number
  jti: string
}

export async function oauthLogin<T = any>(param: LoginParamsType) {
    console.log(param)
    const oauthParam: OauthParams = {
        grant_type: tokenConfig.oauth.grant_type,
        org_id: param.org_id,
        username: param.username,
        password: param.password,
    }
    const url = parseParams(tokenConfig.oauth.oauthHost + tokenConfig.oauth.oauthPath, oauthParam)
    console.log(url)
    const result = await axios.post<OauthToken>(url, null, {
        headers: tokenConfig.headers
    })
    console.log(result.data)
}