import { kernel } from '@/ts/base';
import { XFlowDefine, XFlowTaskHistory } from '@/ts/base/schema';
import { Card, Tabs, TabsProps } from 'antd';
import React, { useEffect } from 'react';
import userCtrl from '@/ts/controller/setting';
import { ImUndo2 } from 'react-icons/im';
import Design from '@/pages/Setting/content/Standard/Flow/Design';

interface IApproveProps {
  flowTask?: XFlowTaskHistory;
  setTabKey: (tabKey: number) => void;
}

const Approve: React.FC<IApproveProps> = ({ flowTask, setTabKey }) => {
  useEffect(() => {
    const loadNodes = async () => {
      if (flowTask) {
        // 1、 通过流程节点获取节点对应的表单
        // 2、 跳界面显示详情
        // 3、 详情页显示绑定表单
        const res = await kernel.queryNodes({
          id: flowTask.flowInstance?.defineId as string,
          spaceId: userCtrl.space.id,
          page: { offset: 0, limit: 100000, filter: '' },
        });
        console.log('res===', res);
      }
    };
    loadNodes();
  }, [flowTask]);

  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `流程审批`,
      children: `Content of Tab Pane 1`,
    },
    {
      key: '2',
      label: `审批记录`,
      children: (
        <Design
          current={flowTask?.flowInstance?.flowDefine as XFlowDefine}
          species={undefined}
          instance={flowTask?.flowInstance}
          modalType={'编辑流程设计'}
          setInstance={() => {}}
          operateOrgId={undefined}
          setOperateOrgId={() => {}}
          onBack={() => {}}
          setModalType={() => {}}
        />
      ),
    },
  ];

  const operations = (
    <div
      style={{ display: 'flex', cursor: 'pointer' }}
      onClick={() => {
        setTabKey(0);
      }}>
      <a style={{ paddingTop: '2px' }}>
        <ImUndo2 />
      </a>
      <a style={{ paddingLeft: '6px' }}>返回</a>
    </div>
  );

  return (
    <Card>
      <Tabs
        defaultActiveKey="1"
        items={items}
        onChange={onChange}
        tabBarExtraContent={operations}></Tabs>
    </Card>
  );
};

export default Approve;
