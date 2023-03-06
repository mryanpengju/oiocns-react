import React, { useRef, useState } from 'react';
import CardOrTableComp from '@/components/CardOrTableComp';
import { IApplyItem, IApprovalItem } from '@/ts/core/todo/itodo';
import { CommonStatus, WorkType } from '@/ts/core';
import { PageRequest } from '@/ts/base/model';
import { ProColumns } from '@ant-design/pro-components';
import useObjectUpdate from '@/hooks/useObjectUpdate';
import { Button } from 'antd';
import PageCard from '@/components/PageCard';
import cls from './index.module.less';

// 卡片渲染
interface IProps {
  type: WorkType;
  reflashMenu: () => void;
  columns: ProColumns<IApplyItem>[];
}
/**
 * 办事-好友申请
 * @returns
 */
const CommonTodo: React.FC<IProps> = (props) => {
  const parentRef = useRef<any>(null);
  const [key, forceUpdate] = useObjectUpdate(props);
  const [selectedRows, setSelectRows] = useState<IApplyItem[] | IApprovalItem[]>([]);

  const operation = () => {
    return (
      <Button
        type="link"
        onClick={async () => {
          selectedRows.forEach(async (a) => {
            await (a as IApplyItem).cancel(CommonStatus.ApproveStartStatus, '');
            forceUpdate();
          });
        }}
        style={{ color: 'red' }}>
        取消
      </Button>
    );
  };

  return (
    <PageCard
      bordered={false}
      tabBarExtraContent={operation()}
      tabList={[{ key: 'apply', tab: '我的申请' }]}>
      <div className={cls['page-content-table']} ref={parentRef}>
        <CardOrTableComp<IApplyItem>
          key={key}
          dataSource={[]}
          parentRef={parentRef}
          rowKey={(record: IApplyItem) => record.Data?.id}
          columns={props.columns}
          // request={async (page: PageRequest) => {
          //   return await props.todoGroup.getApplyList(page);
          // }}
          operation={(item: IApplyItem) => {
            return [
              {
                key: 'cancel',
                label: '取消',
                onClick: async () => {
                  await (item as IApplyItem).cancel(CommonStatus.ApproveStartStatus, '');
                  forceUpdate();
                },
              },
            ];
          }}
          rowSelection={{
            type: 'checkbox',
            onChange: (_: React.Key[], selectedRows: IApplyItem[] | IApprovalItem[]) => {
              setSelectRows(selectedRows);
            },
          }}
        />
      </div>
    </PageCard>
  );
};

export default CommonTodo;
