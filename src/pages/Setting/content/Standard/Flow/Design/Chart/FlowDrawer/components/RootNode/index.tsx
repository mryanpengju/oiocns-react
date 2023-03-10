import React, { useEffect, useState } from 'react';
import { Button, Modal, Space, Tag } from 'antd';
import cls from './index.module.less';
import { NodeType } from '../../processType';
import userCtrl from '@/ts/controller/setting';
import { XOperation } from '@/ts/base/schema';
import { ISpeciesItem } from '@/ts/core';
import CardOrTable from '@/components/CardOrTableComp';
import { OperationColumns } from '@/pages/Setting/config/columns';
interface IProps {
  current: NodeType;
  orgId?: string;
  species?: ISpeciesItem;
}
/**
 * @description: 角色
 * @return {*}
 */

const RootNode: React.FC<IProps> = (props) => {
  const [operationIds, setOperationIds] = useState<string[]>([]);
  const [operations, setOperations] = useState<XOperation[]>([]);
  const [operationModal, setOperationModal] = useState<any>();
  // 操作内容渲染函数
  const renderOperate = (item: XOperation) => {
    return [
      {
        key: 'bind',
        label: '绑定',
        onClick: async () => {
          if (!operationIds.includes(item.id)) {
            props.current.props.operationIds = [...operationIds, item.id];
            setOperationIds([...operationIds, item.id]);
          }
          setOperationModal(undefined);
        },
      },
    ];
  };
  useEffect(() => {
    setOperationIds(props.current.props.operationIds || []);
    const loadOperations = async () => {
      if (userCtrl.space.id && props.species) {
        let xOperationArray = await props.species.loadOperations(
          userCtrl.space.id,
          false,
          true,
          true,
          {
            offset: 0,
            limit: 1000,
            filter: '',
          },
        );
        setOperations(xOperationArray.result || []);
      }
    };
    loadOperations();
  }, []);
  return (
    <div className={cls[`app-roval-node`]}>
      <div className={cls[`roval-node`]}>
        <div style={{ marginBottom: '10px' }}>
          <Button
            type="primary"
            shape="round"
            size="small"
            onClick={() => {
              setOperationModal('');
            }}>
            绑定表单
          </Button>
        </div>
        <div>
          {operationIds && operationIds.length > 0 && (
            <span>
              已绑定表单：{' '}
              <Space size={[0, 10]} wrap>
                {operationIds.map((item) => {
                  return (
                    <Tag
                      key={item}
                      closable
                      onClose={() => {
                        let tags = operationIds.filter((id: string) => id !== item);
                        props.current.props.operationIds = tags;
                        setOperationIds(tags);
                      }}>
                      {operations.filter((op) => op.id == item)[0]?.name}
                    </Tag>
                  );
                })}
              </Space>
            </span>
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
              dataSource={operations}
            />
          </Modal>
        </div>
      </div>
    </div>
  );
};
export default RootNode;
