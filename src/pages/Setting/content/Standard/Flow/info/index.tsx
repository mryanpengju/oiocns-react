import { Card, Modal, message } from 'antd';
import React, { useRef, useEffect, useState } from 'react';
import cls from './index.module.less';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import userCtrl from '@/ts/controller/setting';
import CardOrTable from '@/components/CardOrTableComp';
import { XFlowDefine, XFlowDefineArray, XOperation } from '@/ts/base/schema';
import { OperationColumns } from '@/pages/Setting/config/columns';
import FlowCard from './FlowCard';
import { FlowColumn } from '@/pages/Setting/config/columns';
import useObjectUpdate from '@/hooks/useObjectUpdate';
import { ISpeciesItem } from '@/ts/core/thing/ispecies';
import { kernel } from '@/ts/base';
import { PageRequest } from '@/ts/base/model';
import { getUuid } from '@/utils/tools';
// import FieldInfo from '../Design/Field';
import DefineInfo from '@/pages/Setting/content/Standard/Flow/info/DefineInfo';

interface IProps {
  modalType: string;
  species?: ISpeciesItem;
  operateOrgId?: string;
  setOperateOrgId: Function;
  isAdmin: boolean;
  setModalType: (modalType: string) => void;
  onDesign: () => void;
  onCurrentChaned: (item?: XFlowDefine) => void;
  setInstance: Function;
  setTestModel?: Function;
}

/**
 * 流程设置
 * @returns
 */
const FlowList: React.FC<IProps> = ({
  modalType,
  species,
  setOperateOrgId,
  isAdmin,
  setModalType,
  onDesign,
  onCurrentChaned,
  setInstance,
  setTestModel,
}: IProps) => {
  const parentRef = useRef<any>(null);
  const parentRef2 = useRef<any>(null);
  const [tkey, tforceUpdate] = useObjectUpdate(species);
  const [key, setKey] = useState<string>();
  const [binds, setBinds] = useState<any[]>([]);
  const [operationModal, setOperationModal] = useState<string>();
  const [defineInfo, setDefineInfo] = useState<XFlowDefine>();
  useEffect(() => {
    if (modalType.includes('新增办事')) {
      onCurrentChaned(undefined);
      setDefineInfo(undefined);
      // onDesign();
    }
  }, [modalType]);

  useEffect(() => {
    setBinds([]);
  }, [species]);

  const renderOperation = (record: XFlowDefine): any[] => {
    let operations: any[] = [
      {
        key: 'editor',
        label: '编辑',
        onClick: () => {
          onCurrentChaned(undefined);
          setModalType('编辑办事');
          setDefineInfo(record);
        },
      },
      {
        key: 'design',
        label: '设计',
        onClick: () => {
          onCurrentChaned(record);
          setOperateOrgId(userCtrl.space.id);
          setModalType('设计流程');
          onDesign();
        },
      },
      // {
      //   key: 'createInstance',
      //   label: '发起测试流程',
      //   onClick: async () => {
      //     let res = await kernel.createInstance({
      //       defineId: record.id,
      //       SpaceId: userCtrl.space.id,
      //       content: 'Text文本显示正常',
      //       contentType: 'Text',
      //       data: JSON.stringify({
      //         id: '789171',
      //         name: '测试流程的数据',
      //         code: 'test',
      //         // price: '0',
      //         remark: '测试流程的数据',
      //       }),
      //       title: record.name,
      //       hook: '',
      //       thingIds: [],
      //     });
      //     if (res.success) {
      //       message.success('发起测试流程成功');
      //       setTestModel?.call(this, true);
      //       setInstance(res.data);
      //       onCurrentChaned(record);
      //       setOperateOrgId(userCtrl.space.id);
      //       setModalType('设计流程');
      //       onDesign();
      //     } else {
      //       message.error('发起测试流程失败');
      //     }
      //   },
      // },
    ];
    if (isAdmin) {
      operations.push({
        key: 'delete',
        label: '删除',
        style: { color: 'red' },
        onClick: async () => {
          Modal.confirm({
            title: '确定删除流程?',
            icon: <ExclamationCircleOutlined />,
            okText: '确认',
            okType: 'danger',
            cancelText: '取消',
            onOk: async () => {
              if (await userCtrl.space.deleteDefine(record.id)) {
                message.success('删除成功');
                setBinds([]);
                tforceUpdate();
              }
            },
            onCancel() {},
          });
        },
      });
    }
    return operations;
  };

  const loadOperations = async (page: PageRequest) => {
    let res = await species!.loadOperations(userCtrl.space.id, false, true, true, page);
    return res;
  };

  // 操作内容渲染函数
  const renderOperate = (item: XOperation) => {
    return [
      {
        key: 'bind',
        label: '绑定',
        onClick: async () => {
          // setEditData(item);
          // setModalType('修改业务标准');
          let res = await kernel.createFlowRelation({
            defineId: operationModal || '',
            operationId: item.id,
          });
          if (res.success) {
            message.success('绑定成功');
            setOperationModal(undefined);
            setKey(getUuid());
          } else {
            message.error('绑定失败');
          }
        },
      },
    ];
  };

  return (
    <div className={cls['company-top-content']} key={tkey}>
      <div style={{ background: '#EFF4F8' }}>
        <Card
          bordered={false}
          // style={{ paddingBottom: '10px' }}
          bodyStyle={{ paddingTop: 0 }}>
          <div className={cls['app-wrap']} ref={parentRef}>
            <CardOrTable<XFlowDefine>
              columns={FlowColumn}
              parentRef={parentRef}
              dataSource={[]}
              operation={renderOperation}
              rowKey={(record: XFlowDefine) => record.id}
              request={async (page) => {
                let res: XFlowDefineArray | undefined = await species?.loadFlowDefines(
                  userCtrl.space.id,
                  page,
                );
                return res;
              }}
              onRow={(record: any) => {
                return {
                  onClick: async () => {},
                };
              }}
              renderCardContent={(items) => {
                return items.map((item) => (
                  <FlowCard
                    className="card"
                    data={item}
                    key={item.id}
                    operation={renderOperation}
                  />
                ));
              }}
            />
          </div>
        </Card>
      </div>
      {binds.length > 0 && (
        <div style={{ height: 200 }} ref={parentRef2}>
          <Card
            // key={tkey}
            title={'已绑定业务'}
            bordered={false}
            style={{ paddingBottom: '10px' }}
            bodyStyle={{ paddingTop: 0 }}>
            <CardOrTable<XOperation>
              parentRef={parentRef2}
              key={key}
              rowKey={'id'}
              columns={OperationColumns}
              showChangeBtn={false}
              dataSource={binds}
            />
          </Card>
        </div>
      )}
      <Modal
        title={'绑定业务'}
        footer={[]}
        open={operationModal != undefined}
        onCancel={() => setOperationModal(undefined)}
        width={'60%'}>
        <CardOrTable<XOperation>
          rowKey={'id'}
          columns={OperationColumns}
          showChangeBtn={false}
          operation={renderOperate}
          request={async (page) => {
            return await loadOperations(page);
          }}
          dataSource={[]}
        />
      </Modal>

      {species && (
        <DefineInfo
          data={defineInfo}
          title={modalType}
          open={modalType.includes('新增办事') || modalType.includes('编辑办事')}
          handleCancel={function (): void {
            setDefineInfo(undefined);
            setModalType('');
          }}
          handleOk={async (res: any) => {
            if (res) {
              setDefineInfo(undefined);
              message.success('保存成功');
              setModalType('');
              tforceUpdate();
            } else {
              message.error('保存失败');
            }
          }}
          current={species}
        />
      )}
    </div>
  );
};

export default FlowList;
