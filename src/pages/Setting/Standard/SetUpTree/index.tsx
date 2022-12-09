import { Tree } from 'antd';
import React from 'react';
import type { DataNode } from 'antd/es/tree';
import cls from './index.module.less';

const { DirectoryTree } = Tree;

const SetUpTree: React.FC = () => {
  /**
   * @description: treeData数据
   * @return {*}
   */
  const treeData: DataNode[] = [
    {
      title: 'parent 0',
      key: '0-0',
      children: [
        { title: 'leaf 0-0', key: '0-0-0', isLeaf: true },
        { title: 'leaf 0-1', key: '0-0-1', isLeaf: true },
      ],
    },
    {
      title: 'parent 1',
      key: '0-1',
      children: [
        { title: 'leaf 1-0', key: '0-1-0', isLeaf: true },
        { title: 'leaf 1-1', key: '0-1-1', isLeaf: true },
      ],
    },
  ];

  return (
    <div className={cls['setup-tree']}>
      <DirectoryTree
        multiple
        defaultExpandAll
        // onSelect={onSelect}
        // onExpand={onExpand}
        treeData={treeData}
      />
    </div>
  );
};
export default SetUpTree;
