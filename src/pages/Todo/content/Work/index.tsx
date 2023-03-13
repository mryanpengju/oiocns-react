import { kernel } from '@/ts/base';
import { SpeciesItem } from '@/ts/core/thing/species';
import { Button, Card, InputNumber, message, Modal, Result, Tabs } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { MenuItemType } from 'typings/globelType';
import userCtrl from '@/ts/controller/setting';
import { XFlowDefine } from '@/ts/base/schema';
import CardOrTableComp from '@/components/CardOrTableComp';
import { FlowColumn } from '@/pages/Setting/config/columns';
import Thing from '@/pages/Store/content/Thing';
import { INullSpeciesItem, ISpeciesItem } from '@/ts/core';
import thingCtrl from '@/ts/controller/thing';
import storeCtrl from '@/ts/controller/store';
import { Editing, Item } from 'devextreme-react/data-grid';
import { getUuid } from '@/utils/tools';
import OioForm from '@/pages/Setting/components/render';
import { PlusOutlined } from '@ant-design/icons';
import cls from './index.module.less';
import { ProFormInstance } from '@ant-design/pro-components';
import useMenuUpdate from '../../hooks/useMenuUpdate';
import todoCtrl from '@/ts/controller/todo/todoCtrl';
import TabPane from 'antd/lib/tabs/TabPane';

// 卡片渲染
interface IProps {
  selectMenu: MenuItemType;
}
/**
 * 办事-业务流程
 * @returns
 */
const Work: React.FC<IProps> = ({ selectMenu }) => {
  const [key, menus, refreshMenu] = useMenuUpdate();
  // useEffect(() => {
  //   refreshMenu();
  //   todoCtrl.refreshWorkTodo();
  // }, [userCtrl.space.id]);
  const [data, setData] = useState<any>({});
  const species: SpeciesItem = selectMenu.item;
  const [flowDefines, setFlowDefines] = useState<XFlowDefine[]>([]);
  // const [key, forceUpdate] = useObjectUpdate(flowDefines);
  const [defineKey, setDefineKey] = useState<string>();
  const [chooseThingModal, setChooseThingModal] = useState<ISpeciesItem[]>([]);
  const [operations, setOperations] = useState<any>([]);
  const [currentDefine, setCurrentDefine] = useState<any>();
  const [createThingByInputNumModal, setCreateThingByInputNumModal] =
    useState<boolean>(false);
  const [createThingNum, setCreateThingNum] = useState<number>();
  const [rows, setRows] = useState<any>([]);
  const [successPage, setSuccessPage] = useState<boolean>(false);
  const [thingFreshKey, setThingFreshKey] = useState<string>();
  const formRef = useRef<ProFormInstance<any>>();

  // const getSpecies = (
  //   parent: INullSpeciesItem,
  //   idArray: string[],
  //   choosed: ISpeciesItem[],
  // ) => {
  //   if (parent) {
  //     if (idArray.includes(parent.id)) {
  //       storeCtrl.addCheckedSpeciesList([parent], userCtrl.space.id);
  //       choosed.push(parent);
  //       setChooseThingModal(choosed);
  //     } else if (parent.children && parent.children.length > 0) {
  //       for (let child of parent.children) {
  //         getSpecies(child, idArray, choosed);
  //       }
  //     }
  //   }
  // };

  useEffect(() => {
    setSuccessPage(false);
    setRows([]);
    setCreateThingNum(1);
    setOperations([]);
    const loadFlowDefine = async () => {
      if (species?.id) {
        const res = await kernel.queryDefine({
          speciesId: species?.id,
          spaceId: userCtrl.space.id,
          page: { offset: 0, limit: 1000000, filter: '' },
        });
        setFlowDefines(res.data?.result || []);
        setDefineKey(getUuid());
      }
    };
    loadFlowDefine();
  }, [species?.id]);

  const lookForAll = (data: any[], arr: any[]) => {
    for (let item of data) {
      arr.push(item);
      if (item.children && item.children.length) {
        lookForAll(item.children, arr);
      }
    }
    return arr;
  };

  const getRenderOperations = (data: XFlowDefine) => {
    const menus = [];
    menus.push({
      key: 'retractApply',
      label: '发起',
      onClick: async () => {
        setCurrentDefine(data);
        // 1、 选物
        // 2、 通过流程，获取所有流程节点
        // 3、 通过流程节点获取节点对应的表单
        const resource = (
          await kernel.queryNodes({
            id: data.id,
            spaceId: userCtrl.space.id,
            page: { offset: 0, limit: 100000, filter: '' },
          })
        ).data;
        //设置起始节点绑定的表单
        if (resource.operations && chooseThingModal.length == 0) {
          setOperations(resource.operations);
        }
        const species_ = await thingCtrl.loadSpeciesTree();
        storeCtrl.addCheckedSpeciesList([species_ as ISpeciesItem], userCtrl.space.id);
        if (data.sourceIds && data.sourceIds != '') {
          let idArray = data.sourceIds.split(',').filter((id) => id != '');
          let allNodes: ISpeciesItem[] = lookForAll([species_], []);
          // getSpecies(species, idArray, []);
          let speciess = allNodes.filter((item) => idArray.includes(item.id));
          storeCtrl.addCheckedSpeciesList(speciess, userCtrl.space.id);
          setChooseThingModal(speciess);
        } else {
          if (species_) {
            setChooseThingModal([species_]);
          }
        }
      },
    });
    return menus;
  };

  return (
    <Card>
      {successPage && (
        <Result
          status="success"
          title="流程发起成功"
          extra={[
            <Button
              type="primary"
              key="back"
              onClick={() => {
                setSuccessPage(false);
              }}>
              返回
            </Button>,
          ]}
        />
      )}
      {operations.length == 0 && !successPage && (
        <CardOrTableComp<XFlowDefine>
          key={defineKey}
          rowKey={(record) => record?.id}
          columns={FlowColumn}
          dataSource={flowDefines}
          operation={(item) => getRenderOperations(item)}
        />
      )}

      {operations.length > 0 && (
        <>
          {operations.map((operation: any) => (
            <>
              <OioForm
                key={operation.id}
                operation={operation}
                formRef={formRef}
                submitter={{
                  resetButtonProps: {
                    style: { display: 'none' },
                  },
                  render: (_: any, dom: any) => (
                    <div className={cls['bootom_right']}>{dom}</div>
                  ),
                }}
                onFinished={async (values: any) => {
                  //发起流程
                  let instance = await kernel.createInstance({
                    defineId: currentDefine.id,
                    SpaceId: userCtrl.space.id,
                    content: '',
                    contentType: 'Text',
                    data: JSON.stringify(values),
                    title: currentDefine.name,
                    hook: '',
                    thingIds: rows.map((row: any) => row['Id']),
                  });
                  console.log('instance', instance);
                  if (instance) {
                    setOperations([]);
                    setSuccessPage(true);
                  }
                  setTimeout(() => {
                    refreshMenu();
                    todoCtrl.refreshWorkTodo();
                  }, 1000);
                }}
                onValuesChange={(changedValues, values) => {
                  data[operation.id] = values;
                  setData(data);
                }}
              />
              <Tabs defaultActiveKey="1">
                <TabPane tab="数据" key="1">
                  <Thing
                    dataSource={rows.map((item: any) => {
                      item.key = 'Id';
                      return item;
                    })}
                    current={chooseThingModal[0]}
                    checkedList={chooseThingModal.map((e) => {
                      return { item: e };
                    })}
                    selectable={false}
                    // onSelectionChanged={(rows: any) => {}}
                    // height={600}
                    // height={'calc(80vh - 175px)'}
                    editingTool={
                      <Editing
                        allowAdding={false}
                        allowUpdating={false}
                        allowDeleting={false}
                        selectTextOnEditStart={true}
                        useIcons={true}
                      />
                    }
                  />
                </TabPane>
              </Tabs>
              ,
            </>
          ))}
        </>
      )}

      {chooseThingModal.length > 0 && (
        <Modal
          title={'选择操作实体'}
          width="92%"
          open={true}
          onCancel={() => {
            setOperations([]);
            setChooseThingModal([]);
          }}
          onOk={() => {
            //获取表格选中的数据
            if (rows && rows.length > 0) {
              setChooseThingModal([]);
            } else {
              message.warn('请至少选择一条操作实体');
            }
          }}>
          <Modal
            title="创建操作实体"
            open={createThingByInputNumModal}
            onCancel={() => {
              setCreateThingByInputNumModal(false);
            }}
            onOk={async () => {
              let res = await kernel.anystore.createThing(
                createThingNum || 1,
                userCtrl.isCompanySpace ? 'company' : 'user',
              );
              if (res && res.success) {
                message.success('创建成功');
                setThingFreshKey(getUuid());
              } else {
                message.error('创建失败');
              }
              setCreateThingByInputNumModal(false);
            }}>
            请输入数量：
            <InputNumber
              min={1}
              value={createThingNum}
              onChange={(e) => {
                setCreateThingNum(e || 1);
              }}
            />
          </Modal>
          {chooseThingModal.length > 0 && (
            <Thing
              key={thingFreshKey}
              current={chooseThingModal[0]}
              checkedList={chooseThingModal.map((e) => {
                return { item: e };
              })}
              onSelectionChanged={(rows: any) => {
                setRows(rows);
              }}
              selectable={true}
              // height={600}
              height={'calc(80vh - 175px)'}
              toolBarItems={
                chooseThingModal[0].name == '道'
                  ? [
                      <Item key={getUuid()}>
                        {' '}
                        <Button
                          icon={<PlusOutlined></PlusOutlined>}
                          onClick={() => {
                            setCreateThingByInputNumModal(true);
                          }}>
                          创建实体
                        </Button>
                      </Item>,
                    ]
                  : []
              }
              editingTool={
                <Editing
                  allowAdding={false}
                  allowUpdating={false}
                  allowDeleting={false}
                  selectTextOnEditStart={true}
                  useIcons={true}
                />
              }
            />
          )}
        </Modal>
      )}
    </Card>
  );
};

export default Work;
