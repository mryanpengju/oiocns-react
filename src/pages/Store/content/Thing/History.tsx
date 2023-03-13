import React, { useEffect } from 'react';
import { Card } from 'antd';
import userCtrl from '@/ts/controller/setting';
import { kernel } from '@/ts/base';

interface IThingCardProps {
  thingId: string;
  setTabKey?: (tabKey: number) => void;
}
/**
 * 仓库-物-归档日志
 */
const ThingHistory: React.FC<IThingCardProps> = ({ thingId }) => {
  useEffect(() => {
    const findThing = async () => {
      const res = await kernel.anystore.loadThing(
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
      console.log('res', res);
    };
    findThing();
  }, [thingId]);

  return <Card bordered={false}>归档日志</Card>;
};
export default ThingHistory;
