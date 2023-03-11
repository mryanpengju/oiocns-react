import React, { useEffect, useState } from 'react';
import { Button, Space, Tag } from 'antd';
import cls from './index.module.less';
import { NodeType } from '../../processType';
import { XOperation } from '@/ts/base/schema';
import { ISpeciesItem } from '@/ts/core';
import ChooseOperation from '@/pages/App/chooseOperation';
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
  debugger;
  const [operationIds, setOperationIds] = useState<string[]>([]);
  const [operations, setOperations] = useState<XOperation[]>([]);
  const [operationModal, setOperationModal] = useState<any>();
  // 操作内容渲染函数
  useEffect(() => {
    setOperations(props.current.props.bindOperations || []);
    setOperationIds(props.current.props.operationIds || []);

    // const loadOperations = async () => {
    //   if (userCtrl.space.id && props.species) {
    //     //要改成根据id查询operation
    //     let xOperationArray = await props.species.loadOperations(
    //       userCtrl.space.id,
    //       false,
    //       true,
    //       true,
    //       {
    //         offset: 0,
    //         limit: 1000,
    //         filter: '',
    //       },
    //     );
    //     setOperations(xOperationArray.result || []);
    //   }
    // };
    // loadOperations();
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
                        let operations_ = operations.filter(
                          (operation: XOperation) => operation.id !== item,
                        );
                        props.current.props.operationIds = tags;
                        props.current.props.bindOperations = operations_;
                        setOperations(operations_);
                        setOperationIds(tags);
                      }}>
                      {operations.filter((op) => op.id == item)[0]?.name}
                    </Tag>
                  );
                })}
              </Space>
            </span>
          )}
          <ChooseOperation
            open={operationModal != undefined}
            onOk={(item: any) => {
              props.current.props.operationIds = [item.operation.id];
              props.current.props.bindOperations = [item.operation];
              setOperations([item.operation]);
              setOperationIds([item.operation.id]);
              setOperationModal(undefined);
            }}
            onCancel={() => setOperationModal(undefined)}></ChooseOperation>
        </div>
      </div>
    </div>
  );
};
export default RootNode;
