import React, { forwardRef, useEffect, useState } from 'react';
import { MenuItemType } from 'typings/globelType';
import TaskList from './TaskList';
import Approve from './Approve';
import { XFlowTaskHistory } from '@/ts/base/schema';
import { kernel } from '@/ts/base';
import userCtrl from '@/ts/controller/setting';

// 卡片渲染
interface IProps {
  selectMenu: MenuItemType;
}
/**
 * 事--待办
 * @returns
 */
const WorkTodo: React.FC<IProps> = ({ selectMenu }) => {
  const [tabKey, setTabKey] = useState(0);
  const [flowTask, setFlowTask] = useState<XFlowTaskHistory>();

  useEffect(() => {
    setTabKey(0);
  }, [selectMenu]);

  return tabKey == 0 ? (
    <TaskList selectMenu={selectMenu} setTabKey={setTabKey} setFlowTask={setFlowTask} />
  ) : (
    <Approve flowTask={flowTask} setTabKey={setTabKey} />
  );
};

export default WorkTodo;
