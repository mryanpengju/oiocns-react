import React, { useEffect, useState } from 'react';
import { Button, message, Space, Tag } from 'antd';
import cls from './index.module.less';
import { NodeType } from '../../processType';
import { XOperation } from '@/ts/base/schema';
import { ISpeciesItem } from '@/ts/core';
import ChooseOperation from '@/pages/App/chooseOperation';
import ViewFormModal from '@/pages/Setting/components/viewFormModal';
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
  const [operations, setOperations] = useState<XOperation[]>([]);
  const [operationModal, setOperationModal] = useState<any>();
  const [viewFormOpen, setViewFormOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<XOperation>();
  // 操作内容渲染函数
  useEffect(() => {
    setOperations(props.current.props.operations || []);
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
          {operations && operations.length > 0 && (
            <span>
              点击预览：{' '}
              <Space size={[0, 10]} wrap>
                {operations.map((item) => {
                  return (
                    <a
                      key={item.id}
                      onClick={() => {
                        setEditData(item);
                        setViewFormOpen(true);
                      }}>
                      表单_{item.name}
                    </a>
                    // <Tag
                    //   key={item.id}
                    //   closable
                    //   onClose={() => {
                    //     let operations_ = operations.filter(
                    //       (operation: XOperation) => operation.id !== item.id,
                    //     );
                    //     props.current.props.operations = operations_;
                    //     setOperations(operations_);
                    //   }}>
                    //   {operations.filter((op) => op.id == item.id)[0]?.name}
                    // </Tag>
                  );
                })}
              </Space>
            </span>
          )}
          <ChooseOperation
            open={operationModal != undefined}
            onOk={(item: any) => {
              props.current.props.operations = [item.operation];
              setOperations([item.operation]);
              setOperationModal(undefined);
            }}
            onCancel={() => setOperationModal(undefined)}></ChooseOperation>
          <ViewFormModal
            data={editData}
            open={viewFormOpen}
            handleCancel={() => {
              setViewFormOpen(false);
            }}
            handleOk={() => {
              setViewFormOpen(false);
            }}
          />
        </div>
      </div>
    </div>
  );
};
export default RootNode;
