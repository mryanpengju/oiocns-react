import CardOrTableComp from '@/components/CardOrTableComp';
import useObjectUpdate from '@/hooks/useObjectUpdate';
import { XFlowTaskHistory } from '@/ts/base/schema';
import { SpeciesItem } from '@/ts/core/thing/species';
import { Card } from 'antd';
import React from 'react';
import { MenuItemType } from 'typings/globelType';
import { WorkReocrdColumns } from '../../config/columns';
import userCtrl from '@/ts/controller/setting';
import { kernel } from '@/ts/base';

// 卡片渲染
interface IProps {
  selectMenu: MenuItemType;
}
/**
 * 已发起记录
 */
const WorkRecord: React.FC<IProps> = ({ selectMenu }) => {
  const [key] = useObjectUpdate(selectMenu);
  const species: SpeciesItem = selectMenu.item;

  return (
    <Card>
      <CardOrTableComp<XFlowTaskHistory>
        key={key}
        rowKey={(record) => record?.id}
        columns={WorkReocrdColumns}
        dataSource={[]}
        request={async (params) => {
          const res = await kernel.queryRecord({
            id: species.id,
            spaceId: userCtrl.space.id,
            page: { offset: params.offset, limit: params.limit, filter: params.filter },
          });
          return {
            result: res.data.result,
            total: res.data.total,
            offset: res.data.offset,
            limit: res.data.limit,
          };
        }}
      />
    </Card>
  );
};

export default WorkRecord;
