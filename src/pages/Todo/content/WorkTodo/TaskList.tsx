import CardOrTableComp from '@/components/CardOrTableComp';
import useObjectUpdate from '@/hooks/useObjectUpdate';
import { kernel } from '@/ts/base';
import { XFlowTaskHistory } from '@/ts/base/schema';
import userCtrl from '@/ts/controller/setting';
import { SpeciesItem } from '@/ts/core/thing/species';
import { Card, Tabs, TabsProps } from 'antd';
import React, { useEffect, useState } from 'react';
import { MenuItemType } from 'typings/globelType';
import { WorkColumns } from '../../config/columns';

// 卡片渲染
interface IProps {
  selectMenu: MenuItemType;
  setTabKey: (tabKey: number) => void;
  setFlowTask: (flowTask: XFlowTaskHistory) => void;
}
/**
 * 事--待办
 * @returns
 */
const TaskList: React.FC<IProps> = ({ selectMenu, setTabKey, setFlowTask }) => {
  const [key, forceUpdate] = useObjectUpdate(selectMenu);
  const species: SpeciesItem = selectMenu.item;
  const [approveTasks, setApproveTasks] = useState<XFlowTaskHistory[]>([{ id: '111' }]);

  useEffect(() => {
    // 查询待办任务
    const loadTasks = async () => {
      if (species?.id) {
        const res = await kernel.queryDefine({
          speciesId: species?.id,
          spaceId: userCtrl.space.id,
          page: { offset: 0, limit: 1000000, filter: '' },
        });
        const flowDefines = res.data?.result || [];
        let flowTasks: XFlowTaskHistory[] = [];
        if (flowDefines.length > 0) {
          for (const flowDefine of flowDefines) {
            const taskRes = await kernel.queryApproveTask({
              defineId: flowDefine.id,
              typeName: '审批',
            });
            flowTasks = [...flowTasks, ...(taskRes.data?.result || [])];
          }
        }
        // setApproveTasks(flowTasks);
      }
    };
    loadTasks();
  }, [species?.id]);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `待办`,
      children: (
        <CardOrTableComp<XFlowTaskHistory>
          key={key}
          rowKey={(record) => record?.id}
          columns={WorkColumns}
          dataSource={approveTasks}
          operation={(item) => {
            return [
              {
                key: 'approve',
                label: '审批',
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
          columns={WorkColumns}
          dataSource={approveTasks}
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
          columns={WorkColumns}
          dataSource={approveTasks}
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
