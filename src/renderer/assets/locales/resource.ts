import { Resource } from 'i18next';
import translation_en from './en_US.json';
import translation_zh from './zh_CN.json';

const resources: Resource = {
  'en-US': translation_en,
  'zh-CN': translation_zh,
};

export const LANGUAGES_LABEL = [
  {
    code: 'en-US',
    text: 'English',
  },
  {
    code: 'zh-CN',
    text: '中文',
  },
];

export default resources;
