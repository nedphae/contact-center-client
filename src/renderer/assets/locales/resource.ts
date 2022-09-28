import { Resource } from 'i18next';
import translation_en from './en_US.json';
import translation_zh from './zh_CN.json';

const resources: Resource = {
  en: translation_en,
  zh: translation_zh,
};

export const LANGUAGES_LABEL = [
  {
    code: 'en',
    text: 'English',
  },
  {
    code: 'zh',
    text: '中文',
  },
];

export default resources;
