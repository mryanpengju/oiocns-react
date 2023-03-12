import OioForm from '@/pages/Setting/components/render';
import Design from '@/pages/Setting/content/Standard/Flow/Design';
import { kernel } from '@/ts/base';
import { XFlowDefine, XFlowInstance, XFlowTaskHistory } from '@/ts/base/schema';
import { ProFormInstance } from '@ant-design/pro-form';
import { Button, Card, Collapse, Input, Tabs, TabsProps, Timeline } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { ImUndo2 } from 'react-icons/im';
import cls from './index.module.less';
import userCtrl from '@/ts/controller/setting';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { Panel } = Collapse;

interface IApproveProps {
  flowTask?: XFlowTaskHistory;
  setTabKey: (tabKey: number) => void;
}

const Approve: React.FC<IApproveProps> = ({ flowTask, setTabKey }) => {
  const formRef = useRef<ProFormInstance<any>>();
  const [nodes, setNodes] = useState<XFlowInstance[]>([]);

  useEffect(() => {
    const loadNodes = async () => {
      if (flowTask) {
        const res = await kernel.queryInstance({
          id: flowTask.instanceId,
          page: { offset: 0, limit: 100000, filter: '' },
        });
        const instances = res.data.result || [];
        if (instances.length > 0) {
          console.log(instances[0].historyTasks);
          setNodes(instances[0].historyTasks);
        }
      }
    };
    loadNodes();
  }, [flowTask]);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `办事详情`,
      children: (
        <>
          <Timeline>
            {nodes.map((node, index) => {
              const color = node.status == 100 ? 'green' : 'red';
              const activeKey = node.status == 100 ? undefined : node.id;
              const title = index == 0 ? '发起人' : '审批人';
              return (
                <Timeline.Item key={node.id} color={color}>
                  <Card>
                    <div style={{ display: 'flex' }}>
                      <div style={{ paddingRight: '18px' }}>{node.createTime}</div>
                      <div>
                        {title}：{userCtrl.findTeamInfoById(node.createUser).name}
                      </div>
                    </div>
                    <Collapse ghost activeKey={activeKey}>
                      <Panel header="表单信息" key={node.id}>
                        {node.bindOperations.map(operation => {
                          return (
                            <OioForm
                              key={operation.id}
                              operation={operation}
                              formRef={undefined}></OioForm>
                          );
                        })}
                      </Panel>
                    </Collapse>
                  </Card>
                </Timeline.Item>
              );
            })}
          </Timeline>
          {flowTask?.node?.bindOperations.map((operation: any) => (
            <OioForm
              key={operation.id}
              operation={operation}
              formRef={formRef}
              submitter={{
                resetButtonProps: {
                  style: { display: 'none' },
                },
                render: (_: any, dom: any) => (
                  <div className={cls['bootom_right']}>
                    <Input.TextArea
                      size="small"
                      placeholder="请填写审批意见"></Input.TextArea>
                    <div style={{ paddingTop: '8px', display: 'flex' }}>
                      <Button
                        type="primary"
                        style={{ marginRight: '8px', marginLeft: '12px' }}
                        icon={<CloseOutlined />}
                        onClick={() => {
                          console.log(200);
                        }}>
                        驳回
                      </Button>
                      <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => {
                          console.log(100);
                        }}>
                        同意
                      </Button>
                    </div>
                  </div>
                ),
              }}
              onFinished={async (values: any) => {
                console.log('values', values);
              }}
              onValuesChange={(changedValues, values) => {
                console.log('values', values);
              }}
            />
          ))}
        </>
      ),
    },
    {
      key: '2',
      label: `流程图`,
      children: (
        <Design
          current={flowTask?.instance?.define as XFlowDefine}
          species={undefined}
          instance={flowTask?.instance}
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
