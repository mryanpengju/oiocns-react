import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import userCtrl from '@/ts/controller/setting';
import { kernel } from '@/ts/base';

interface IThingCardProps {
  thingId: string;
  setTabKey?: (tabKey: number) => void;
}
/**
 * 仓库-物-卡片
 */
const ThingCard: React.FC<IThingCardProps> = ({ thingId }) => {
  const [thing, setThing] = useState();
  useEffect(() => {
    const findThing = async () => {
      const res = await kernel.anystore.loadThing<any>(
        {
          options: {
            match: {
              _id: {
                _eq_: thingId,
              },
            },
          },
          userData: [],
        },
        userCtrl.isCompanySpace ? 'company' : 'user',
      );
      const data = res.data?.data;
      if (data && data.length > 0) {
        setThing(data[0]);
      }
      console.log('data[0]', data[0]);
    };
    findThing();
  }, [thingId]);

  return <Card bordered={false}>资产卡片</Card>;
};
export default ThingCard;
