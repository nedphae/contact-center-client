import { TreeNodeProps } from 'react-dropdown-tree-select';

export interface KnowledgeBase {
  id: number | undefined;
  name: string;
  description: string | undefined;
  categoryList: TopicCategory[] | undefined;
  botConfig: BotConfig | undefined;
}

export interface Answer {
  type: string;
  content: string;
}

export interface Topic {
  id: string | undefined;
  /** 所属知识库ID * */
  knowledgeBaseId: number;
  knowledgeBaseName?: string;
  /** 问题，使用ik分词器查询和索引 */
  question: string;
  /** 问题的md5 */
  md5: string;
  /** 问题的对外答案，如果是相似问题，可以设置为空 */
  answer: Answer[] | undefined;
  /** 问题的对内答案 */
  innerAnswer: string | undefined;
  /** 问题的来源;0:用户手动添加;1:寒暄库;2:文件导入 */
  fromType: number;
  /** 问题类型;1:标准问题;2:相似问题 */
  type: number;
  /** 相似问题(type=10)对应的标准问题id */
  refId: string | undefined;
  refQuestion?: string;
  /** 关联的问题id列表 */
  connectIds: string[] | undefined;
  /** 是否有效标记位 */
  enabled: boolean;
  /** 问题的有效时间 */
  effectiveTime: Date | undefined;
  /** 有效期结束 */
  failureTime: Date | undefined;
  /** 知识点所属分类 */
  categoryId: number | undefined;
  categoryName?: string;
  /** 问题答案类型，0只有对外答案，1只有对内答案，2同时有对内和对外答案，undefined 相似问题，无答案 */
  faqType: number | undefined;
}

export interface TopicCategory {
  id?: number | undefined;
  name?: string | undefined;
  knowledgeBaseId?: number | undefined;
  pid?: number | undefined;
  children?: TopicCategory[] | undefined;
  topicList?: Topic[] | undefined;
}

export interface BotConfig {
  id?: number | undefined;
  botId: number;
  knowledgeBaseId: number;
  noAnswerReply: string;
}

export const botConfigNoAnswerReply = '抱歉，没有找到您想要的答案';

export function makeTreeNode(
  topicCategory: TopicCategory[],
  selectValue?: number,
  setExtraProperties?: (
    topicCategory: TopicCategory,
    node: TreeNodeProps
  ) => void
): TreeNodeProps[] {
  return topicCategory.map((it) => {
    const node: TreeNodeProps = {
      label: it.name || '未命名',
      value: it.id?.toString() ?? '',
    };
    if (selectValue && it.id === selectValue) {
      node.checked = true;
    }
    if (it.children) {
      node.children = makeTreeNode(
        it.children,
        selectValue,
        setExtraProperties
      );
    }
    if (setExtraProperties) {
      setExtraProperties(it, node);
    }
    return node;
  });
}
