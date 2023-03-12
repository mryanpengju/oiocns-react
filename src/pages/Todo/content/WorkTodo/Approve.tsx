import { kernel } from '@/ts/base';
import { XFlowDefine, XFlowTaskHistory } from '@/ts/base/schema';
import { Card, Tabs, TabsProps } from 'antd';
import React, { useEffect, useState } from 'react';
import userCtrl from '@/ts/controller/setting';
import { ImUndo2 } from 'react-icons/im';
import Design from '@/pages/Setting/content/Standard/Flow/Design';
import OioForm from '@/pages/Setting/components/render';

interface IApproveProps {
  flowTask?: XFlowTaskHistory;
  setTabKey: (tabKey: number) => void;
}

const Approve: React.FC<IApproveProps> = ({ flowTask, setTabKey }) => {
  const [operations, setOperations] = useState<any>([]);

  useEffect(() => {
    const loadNodes = async () => {
      if (flowTask) {
        const res = await kernel.queryNodes({
          id: flowTask.flowInstance?.defineId as string,
          spaceId: userCtrl.space.id,
          page: { offset: 0, limit: 100000, filter: '' },
        });
        const node = res.data;
        setOperations(node.operations || []);
      }
    };
    loadNodes();
  }, [flowTask]);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `流程审批`,
      children: (
        <>
          {operations.length > 0 && (
            <>
              {operations.map((operation: any) => (
                <OioForm
                  key={operation.id}
                  operation={operation}
                  //   submitter={{
                  //     render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                  //   }}
                  onFinished={async (values: any) => {
                    // Todo 提交
                  }}
                  onValuesChange={(changedValues, values) => {
                    console.log('values', values);
                  }}
                />
              ))}
            </>
          )}
        </>
      ),
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

  const tabBarExtraContent = (
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
        tabBarExtraContent={tabBarExtraContent}></Tabs>
    </Card>
  );
};

export default Approve;
