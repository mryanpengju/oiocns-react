import CardOrTableComp from '@/components/CardOrTableComp';
import useObjectUpdate from '@/hooks/useObjectUpdate';
import { XFlowTaskHistory } from '@/ts/base/schema';
import { SpeciesItem } from '@/ts/core/thing/species';
import { Card, Tabs, TabsProps } from 'antd';
import React, { useEffect, useState } from 'react';
import { MenuItemType } from 'typings/globelType';
import { WorkTodoColumns } from '../../config/columns';
import todoCtrl from '@/ts/controller/todo/todoCtrl';

// 卡片渲染
interface IProps {
  tabKey: number;
  selectMenu: MenuItemType;
  setTabKey: (tabKey: number) => void;
  setFlowTask: (flowTask: XFlowTaskHistory) => void;
}
/**
 * 事--待办
 * @returns
 */
const TaskList: React.FC<IProps> = ({ tabKey, selectMenu, setTabKey, setFlowTask }) => {
  const [key, forceUpdate] = useObjectUpdate(selectMenu);
  const species: SpeciesItem = selectMenu.item;
  const [todoTasks, setTodoTasks] = useState<XFlowTaskHistory[]>([]);
  const [csTasks, setCsTasks] = useState<XFlowTaskHistory[]>([]);

  // 查询待办任务
  const loadTasks = async () => {
    const tasks = (await todoCtrl.getWorkTodoBySpeciesId(species?.id)) || [];
    setTodoTasks(tasks.filter((t) => t.node?.nodeType == '审批'));
    setCsTasks(tasks.filter((t) => t.node?.nodeType == '抄送'));
    forceUpdate();
  };

  useEffect(() => {
    loadTasks();
  }, [species?.id]);

  useEffect(() => {
    loadTasks();
  }, [tabKey]);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `待办`,
      children: (
        <CardOrTableComp<XFlowTaskHistory>
          key={key}
          rowKey={(record) => record?.id}
          columns={WorkTodoColumns}
          dataSource={todoTasks}
          operation={(item) => {
            return [
              {
                key: 'approve',
                label: '去审批',
                onClick: async () => {
                  setFlowTask(item);
                  setTabKey(1);
                },
              },
            ];
          }}
        />
      ),
    },
    {
      key: '2',
      label: `已办`,
      children: (
        <CardOrTableComp<XFlowTaskHistory>
          key={key}
          rowKey={(record) => record?.id}
          columns={WorkTodoColumns}
          dataSource={csTasks}
          operation={(item) => {
            return [
              {
                key: 'view',
                label: '查看',
                onClick: async () => {
                  setFlowTask(item);
                  setTabKey(1);
                },
              },
            ];
          }}
        />
      ),
    },
    {
      key: '3',
      label: `抄送`,
      children: (
        <CardOrTableComp<XFlowTaskHistory>
          key={key}
          rowKey={(record) => record?.id}
          columns={WorkTodoColumns}
          dataSource={csTasks}
          operation={(item) => {
            return [
              {
                key: 'view',
                label: '查看',
                onClick: async () => {
                  setFlowTask(item);
                  setTabKey(1);
                },
              },
            ];
          }}
        />
      ),
    },
  ];

  return (
    <Card>
      <Tabs items={items}></Tabs>
    </Card>
  );
};

export default TaskList;
