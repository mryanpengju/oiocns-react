import OioForm from '@/pages/Setting/components/render';
import Design from '@/pages/Setting/content/Standard/Flow/Design';
import { kernel } from '@/ts/base';
import { XFlowDefine, XFlowTaskHistory } from '@/ts/base/schema';
import { ProFormInstance } from '@ant-design/pro-form';
import { Button, Card, Collapse, Input, message, Tabs, TabsProps, Timeline } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { ImUndo2 } from 'react-icons/im';
import cls from './index.module.less';
import userCtrl from '@/ts/controller/setting';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import Thing from '@/pages/Store/content/Thing';
import { SpeciesItem } from '@/ts/core/thing/species';
import { MenuItemType } from 'typings/globelType';
import todoCtrl from '@/ts/controller/todo/todoCtrl';

const { Panel } = Collapse;

interface IApproveProps {
  selectMenu: MenuItemType;
  flowTask?: XFlowTaskHistory;
  setTabKey: (tabKey: number) => void;
  reflashMenu: () => void;
}

const Approve: React.FC<IApproveProps> = ({
  selectMenu,
  flowTask,
  setTabKey,
  reflashMenu,
}) => {
  const formRef = useRef<ProFormInstance<any>>();
  const [taskHistory, setTaskHistorys] = useState<XFlowTaskHistory[]>([]);
  const [comment, setComment] = useState<string>('');
  const species: SpeciesItem = selectMenu.item;

  console.log('flowTask===', flowTask);

  useEffect(() => {
    const loadNodes = async () => {
      if (flowTask) {
        const res = await kernel.queryInstance({
          id: flowTask.instanceId,
          page: { offset: 0, limit: 100000, filter: '' },
        });
        const instances = res.data.result || [];
        if (instances.length > 0) {
          setTaskHistorys(instances[0].historyTasks as XFlowTaskHistory[]);
        }
      }
    };
    // const loadThings = () => {
    //   const thingIds = flowTask?.instance?.thingIds;
    //   console.log('thingIds==', JSON.parse(thingIds));
    // };
    // loadThings();
    loadNodes();
  }, [flowTask]);

  // 审批
  const approvalTask = async (status: number) => {
    const result = await formRef.current?.validateFields();
    console.log(result);
    const res = await kernel.approvalTask({
      id: flowTask?.id as string,
      status,
      comment,
      data: JSON.stringify(formRef.current?.getFieldsValue()),
    });
    if (res.success) {
      message.success('审批成功!');
      await todoCtrl.refreshWorkTodo();
      reflashMenu();
      setTabKey(0);
    } else {
      message.error('审批失败!');
    }
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `办事详情`,
      children: (
        <>
          <Timeline>
            {taskHistory.map((th, index) => {
              const isCur = th.status != 100;
              const color = isCur ? 'red' : 'green';
              const title = index == 0 ? '发起人' : '审批人';
              return (
                <Timeline.Item key={th.id} color={color}>
                  <Card>
                    <div style={{ display: 'flex' }}>
                      <div style={{ paddingRight: '18px' }}>{th.createTime}</div>
                      <div>
                        {title}：{userCtrl.findTeamInfoById(th.createUser).name}
                      </div>
                    </div>
                    {!isCur && (
                      <Collapse ghost>
                        {(th.node?.bindOperations || []).map((operation, i) => {
                          const record =
                            th.records && th.records.length > 0
                              ? th.records[i]
                              : undefined;
                          let formValue = {};
                          if (record?.data) {
                            formValue = JSON.parse(record?.data);
                          }
                          return (
                            <Panel header={operation.name} key={th.id}>
                              <OioForm
                                key={operation.id}
                                operation={operation}
                                formRef={undefined}
                                fieldsValue={formValue}
                                disabled={th.status == 100}></OioForm>
                            </Panel>
                          );
                        })}
                      </Collapse>
                    )}
                    {isCur && (
                      <>
                        {th.node?.bindOperations.map((operation, i) => {
                          const record =
                            th.records && th.records.length > 0
                              ? th.records[i]
                              : undefined;
                          let formValue = {};
                          if (record?.data) {
                            formValue = JSON.parse(record?.data);
                          }
                          return (
                            <Card title={operation.name} key={th.id} bordered={false}>
                              <OioForm
                                key={operation.id}
                                operation={operation}
                                fieldsValue={formValue}
                                formRef={formRef}
                                disabled={th.status == 100}></OioForm>
                            </Card>
                          );
                        })}
                      </>
                    )}
                  </Card>
                </Timeline.Item>
              );
            })}
          </Timeline>

          <Thing current={species} height={'400px'} />

          <div className={cls['bootom_right']}>
            <Input.TextArea
              size="small"
              placeholder="请填写审批意见"
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
              }}></Input.TextArea>
            <div style={{ paddingTop: '12px', display: 'flex' }}>
              <Button
                type="primary"
                style={{ marginRight: '8px', marginLeft: '12px' }}
                icon={<CloseOutlined />}
                onClick={() => {
                  approvalTask(200);
                }}>
                驳回
              </Button>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => {
                  approvalTask(100);
                }}>
                同意
              </Button>
            </div>
          </div>
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
