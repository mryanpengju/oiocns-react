import { kernel } from '@/ts/base';
import { SpeciesItem } from '@/ts/core/thing/species';
import { Card } from 'antd';
import React, { useEffect, useState } from 'react';
import { MenuItemType } from 'typings/globelType';
import userCtrl from '@/ts/controller/setting';
import { XFlowDefine } from '@/ts/base/schema';
import CardOrTableComp from '@/components/CardOrTableComp';
import useObjectUpdate from '@/hooks/useObjectUpdate';
import { FlowColumn } from '@/pages/Setting/config/columns';

// 卡片渲染
interface IProps {
  selectMenu: MenuItemType;
}
/**
 * 办事-业务流程
 * @returns
 */
const Work: React.FC<IProps> = ({ selectMenu }) => {
  const [key, forceUpdate] = useObjectUpdate(selectMenu);
  const [data, setData] = useState<any>({});
  const species: SpeciesItem = selectMenu.item;
  const [flowDefines, setFlowDefines] = useState<XFlowDefine[]>([]);

  useEffect(() => {
    const loadFlowDefine = async () => {
      if (species?.id) {
        const res = await kernel.queryDefine({
          speciesId: species?.id,
          spaceId: userCtrl.space.id,
          page: { offset: 0, limit: 1000000, filter: '' },
        });
        setFlowDefines(res.data?.result || []);
      }
    };
    loadFlowDefine();
  }, [species?.id]);

  const getOperations = (data: XFlowDefine) => {
    const menus = [];
    menus.push({
      key: 'retractApply',
      label: '发起',
      onClick: async () => {
        // 1、 选物
        // 2、 通过流程，获取所有流程节点
        // 3、 通过流程节点获取节点对应的表单
        const res = await kernel.queryNodes({
          id: data.id,
          spaceId: userCtrl.space.id,
          page: { offset: 0, limit: 100000, filter: '' },
        });
      },
    });
    return menus;
  };

  return (
    <Card>
      <CardOrTableComp<XFlowDefine>
        key={key}
        rowKey={(record) => record?.id}
        columns={FlowColumn}
        dataSource={flowDefines}
        operation={(item) => getOperations(item)}
      />
    </Card>
  );
};

export default Work;
