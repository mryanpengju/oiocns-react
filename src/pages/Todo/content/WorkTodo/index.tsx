import React, { useEffect, useState } from 'react';
import { MenuItemType } from 'typings/globelType';
import TaskList from './TaskList';
import Approve from './Approve';
import { XFlowTaskHistory } from '@/ts/base/schema';

interface IProps {
  reflashMenu: () => void;
  selectMenu: MenuItemType;
}
/**
 * 事--待办
 * @returns
 */
const WorkTodo: React.FC<IProps> = ({ selectMenu, reflashMenu }) => {
  const [tabKey, setTabKey] = useState(0);
  const [flowTask, setFlowTask] = useState<XFlowTaskHistory>();

  useEffect(() => {
    setTabKey(0);
  }, [selectMenu]);

  return tabKey == 0 ? (
    <TaskList
      selectMenu={selectMenu}
      setTabKey={setTabKey}
      setFlowTask={setFlowTask}
      tabKey={tabKey}
    />
  ) : (
    <Approve
      selectMenu={selectMenu}
      flowTask={flowTask}
      setTabKey={setTabKey}
      reflashMenu={reflashMenu}
    />
  );
};

export default WorkTodo;
