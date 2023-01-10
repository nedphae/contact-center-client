import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { BotGraphql, QUERY_BOTS } from 'renderer/domain/graphql/Bot';
import _ from 'lodash';

/**
 * 获取知识库和机器人信息 hook
 * 为了知识库列表和知识库条目同时使用
 * @returns 组装的Map数据
 */
const useLoadBotData = () => {
  const { data, loading, refetch } = useQuery<BotGraphql>(QUERY_BOTS);

  const memoBotData = useMemo(() => {
    if (data) {
      // 生成各种需要的Map, 根据 ID 填充名称
      const allBotConfig = _.cloneDeep(data?.allBotConfig ?? []);
      const allKnowledgeBase = _.cloneDeep(data?.allKnowledgeBase ?? []);
      const botConfigMap = _.groupBy(allBotConfig, 'knowledgeBaseId');

      const memoAllKnowledgeBase = allKnowledgeBase.map((it) => {
        const [botConfig] = it.id ? botConfigMap[it.id] ?? [] : [];
        it.botConfig = botConfig;
        return it;
      });

      return {
        allKnowledgeBase: memoAllKnowledgeBase,
        botConfigMap,
        botConfigList: allBotConfig,
      };
    }
    return undefined;
  }, [data]);
  return { memoBotData, loading, refetch };
};

export default useLoadBotData;
