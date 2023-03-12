import { kernel } from '@/ts/base';
import { SpeciesItem } from '@/ts/core/thing/species';
import { Button, Card, InputNumber, message, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { MenuItemType } from 'typings/globelType';
import userCtrl from '@/ts/controller/setting';
import { XFlowDefine } from '@/ts/base/schema';
import CardOrTableComp from '@/components/CardOrTableComp';
import cls from './index.module.less';
import { FlowColumn } from '@/pages/Setting/config/columns';
import Thing from '@/pages/Store/content/Thing';
import { INullSpeciesItem, ISpeciesItem } from '@/ts/core';
import thingCtrl from '@/ts/controller/thing';
import storeCtrl from '@/ts/controller/store';
import { Editing, Item } from 'devextreme-react/data-grid';
import { getUuid } from '@/utils/tools';
import OioForm from '@/pages/Setting/components/render';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { FooterToolbar } from '@ant-design/pro-components';

// 卡片渲染
interface IProps {
  selectMenu: MenuItemType;
}
/**
 * 办事-业务流程
 * @returns
 */
const Work: React.FC<IProps> = ({ selectMenu }) => {
  const [data, setData] = useState<any>({});
  const species: SpeciesItem = selectMenu.item;
  const [flowDefines, setFlowDefines] = useState<XFlowDefine[]>([]);
  // const [key, forceUpdate] = useObjectUpdate(flowDefines);
  const [key, setKey] = useState<string>();
  const [chooseThingModal, setChooseThingModal] = useState<ISpeciesItem>();
  const [operations, setOperations] = useState<any>([]);
  const [currentDefine, setCurrentDefine] = useState<any>();
  const [createThingByInputNumModal, setCreateThingByInputNumModal] =
    useState<boolean>(false);
  const [createThingNum, setCreateThingNum] = useState<number>();
  const [rows, setRows] = useState<any>([]);

  const getSpecies = (parent: INullSpeciesItem, id: string) => {
    if (parent) {
      if (parent.id == id) {
        storeCtrl.addCheckedSpeciesList([parent], userCtrl.space.id);
        setChooseThingModal(parent);
      } else if (parent.children && parent.children.length > 0) {
        for (let child of parent.children) {
          getSpecies(child, id);
        }
      }
    }
  };

  useEffect(() => {
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
        setKey(getUuid());
      }
    };
    loadFlowDefine();
  }, [species?.id]);

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
        if (resource.operations && !chooseThingModal) {
          setOperations(resource.operations);
        }
        const species = await thingCtrl.loadSpeciesTree();
        storeCtrl.addCheckedSpeciesList([species], userCtrl.space.id);
        if (data.sourceId && data.sourceId != '') {
          getSpecies(species, data.sourceId);
        } else {
          setChooseThingModal(species);
        }
      },
    });
    return menus;
  };

  return (
    <Card title={selectMenu?.item?.name}>
      {operations.length == 0 && (
        <CardOrTableComp<XFlowDefine>
          key={key}
          rowKey={(record) => record?.id}
          columns={FlowColumn}
          dataSource={flowDefines}
          operation={(item) => getRenderOperations(item)}
        />
      )}

      {operations.length > 0 && (
        <>
          {operations.map((operation: any) => (
            <OioForm
              key={operation.id}
              operation={operation}
              submitter={{
                render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
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
                  thingIds: rows.map((row: any) => row['416237430006484992']),
                });
                message.success('提交成功');
              }}
              onValuesChange={(changedValues, values) => {
                data[operation.id] = values;
                setData(data);
              }}
            />
          ))}
        </>
      )}

      {chooseThingModal && (
        <Modal
          title={'选择数据'}
          width="92%"
          open={chooseThingModal != undefined}
          onCancel={() => {
            setOperations([]);
            setChooseThingModal(undefined);
          }}
          onOk={() => {
            //获取表格选中的数据
            if (rows && rows.length > 0) {
              setChooseThingModal(undefined);
            } else {
              message.warn('请至少选择一条数据');
            }
          }}>
          <Modal
            title="创建物"
            open={createThingByInputNumModal}
            onCancel={() => {
              setCreateThingByInputNumModal(false);
            }}
            onOk={async () => {
              let res = await kernel.anystore.createThing(createThingNum || 1);
              if (res && res.success) {
                message.success('创建成功');
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
          <Thing
            dataSource={[
              { key: 111, '416237430006484992': 111, '422398957721882624': 222 },
            ]}
            current={chooseThingModal}
            onSelectionChanged={(rows: any) => {
              setRows(rows);
            }}
            height={600}
            toolBarItems={
              currentDefine.sourceId
                ? []
                : [
                    <Item key={getUuid()}>
                      {' '}
                      <Button
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setCreateThingByInputNumModal(true);
                        }}
                      />
                    </Item>,
                  ]
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
        </Modal>
      )}
    </Card>
  );
};

export default Work;
