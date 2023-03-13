import OioForm from '@/pages/Setting/components/render';
import Design from '@/pages/Setting/content/Standard/Flow/Design';
import { kernel } from '@/ts/base';
import { XFlowDefine, XFlowTaskHistory } from '@/ts/base/schema';
import { ProFormInstance } from '@ant-design/pro-form';
import thingCtrl from '@/ts/controller/thing';
import { Button, Card, Collapse, Input, message, Tabs, TabsProps, Timeline } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { ImUndo2 } from 'react-icons/im';
import cls from './index.module.less';
import userCtrl from '@/ts/controller/setting';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import Thing from '@/pages/Store/content/Thing';
import { MenuItemType } from 'typings/globelType';
import todoCtrl from '@/ts/controller/todo/todoCtrl';
import { ISpeciesItem } from '@/ts/core';
import storeCtrl from '@/ts/controller/store';
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
  let comment = '';
  const [instance, setInstance] = useState<any>();
  const [speciesItem, setSpeciesItem] = useState<any>();
  const [flowSpeciesItem, setFlowSpeciesItem] = useState<any>();
  // const [rootSpecies, setRootSpecies] = useState<any>();

  const lookForAll = (data: any[], arr: any[]) => {
    for (let item of data) {
      arr.push(item);
      if (item.children && item.children.length) {
        lookForAll(item.children, arr);
      }
    }
    return arr;
  };
  useEffect(() => {
    const loadNodes = async () => {
      if (flowTask) {
        const res = await kernel.queryInstance({
          id: flowTask.instanceId,
          page: { offset: 0, limit: 100000, filter: '' },
        });
        const instances = res.data.result || [];
        if (instances.length > 0) {
          const species_ = await thingCtrl.loadSpeciesTree();
          // setRootSpecies(species_);
          let allNodes: ISpeciesItem[] = lookForAll([species_], []);
          setInstance(instances[0]);
          let speciesIds = instances[0].define?.sourceIds?.split(',');
          let speciesItem = allNodes.filter((item) => speciesIds?.includes(item.id))[0];
          let flowSpeciesItem = allNodes.filter(
            (item) => item.id == instances[0].define?.speciesId,
          )[0];
          storeCtrl.addCheckedSpeciesList(
            [species_ as ISpeciesItem, speciesItem, flowSpeciesItem],
            userCtrl.space.id,
          );
          setSpeciesItem(speciesItem);
          setFlowSpeciesItem(flowSpeciesItem);
          setTaskHistorys(instances[0].historyTasks as XFlowTaskHistory[]);
        }
      }
    };
    loadNodes();
  }, [flowTask]);

  // 审批
  const approvalTask = async (status: number) => {
    const result = await formRef.current?.validateFields();
    console.log(result);
    const params = {
      id: flowTask?.id as string,
      status,
      comment,
      data: JSON.stringify(formRef.current?.getFieldsValue()),
    };
    const res = await kernel.approvalTask(params);
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
                      <div style={{ paddingRight: '24px' }}>{th.createTime}</div>
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
                        {th.node?.bindOperations?.map((operation, i) => {
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

          <Thing
            current={speciesItem}
            height={'400px'}
            byIds={(flowTask?.instance?.thingIds ?? '')
              .split(',')
              .filter((id) => id != '')}
            selectable={false}
          />

          <Card className={cls['bootom_right']}>
            <div style={{ display: 'flex', width: '100%' }}>
              <div style={{ width: '84%' }}>
                <Input.TextArea
                  placeholder="请填写审批意见"
                  onChange={(e) => {
                    comment = e.target.value;
                  }}></Input.TextArea>
              </div>
              <div style={{ width: '16%', display: 'flex', marginTop: '18px' }}>
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
          </Card>
        </>
      ),
    },
    {
      key: '2',
      label: `流程图`,
      children: (
        <>
          {flowSpeciesItem && (
            <Design
              current={flowTask?.instance?.define as XFlowDefine}
              species={flowSpeciesItem}
              instance={instance}
              setInstance={setInstance}
              operateOrgId={userCtrl.space.id}
              defaultEditable={false}
              setOperateOrgId={() => {}}
              onBack={() => {}}
              modalType={'设计流程'}
              setModalType={() => {}}
            />
          )}
        </>
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
