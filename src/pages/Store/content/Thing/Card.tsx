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
      let thing: any;
      const data = res.data?.data;
      if (data && data.length > 0) {
        thing = data[0];
      }
      if (thing) {
        // kernel.querySpeciesAttrs()
        for (const key in thing) {
          if (Object.prototype.hasOwnProperty.call(thing, key)) {
            const element = thing[key];
            if (key.startsWith('S')) {
              console.log(key);
            }
          }
        }
      }
    };
    findThing();
  }, [thingId]);

  return <Card bordered={false}>资产卡片</Card>;
};
export default ThingCard;
