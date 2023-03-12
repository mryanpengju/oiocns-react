import CardOrTableComp from '@/components/CardOrTableComp';
import useObjectUpdate from '@/hooks/useObjectUpdate';
import { kernel } from '@/ts/base';
import { XFlowTaskHistory } from '@/ts/base/schema';
import userCtrl from '@/ts/controller/setting';
import { SpeciesItem } from '@/ts/core/thing/species';
import { Card } from 'antd';
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

  /**
   * 获取操作按钮
   */
  const getOperations = (task: XFlowTaskHistory) => {
    const menus = [];
    menus.push({
      key: 'approve',
      label: '审核',
      onClick: async () => {
        setFlowTask(task);
        setTabKey(1);
      },
    });
    return menus;
  };

  return (
    <Card title={selectMenu?.item?.name}>
      <CardOrTableComp<XFlowTaskHistory>
        key={key}
        rowKey={(record) => record?.id}
        columns={WorkColumns}
        dataSource={approveTasks}
        operation={(item) => getOperations(item)}
      />
    </Card>
  );
};

export default TaskList;
