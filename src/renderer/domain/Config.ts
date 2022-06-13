export interface ShuntUIConfig {
  id?: number;
  /** 接待组 */
  shuntId?: number;
  /** 界面配置，不会做 json 解析，直接通过 json-schema-validator 进行验证 */
  config?: string;
}
