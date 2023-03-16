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
        console.log('thing', thing);
        for (const key in thing) {
          if (Object.prototype.hasOwnProperty.call(thing, key)) {
            const element = thing[key];
            if (key.startsWith('S')) {
              const id = key.substring(1, key.length);
              if (id.length >= 16 && id.length <= 20) {
                const attrRes = await kernel.querySpeciesAttrs({
                  id,
                  spaceId: userCtrl.space.id,
                  recursionOrg: true,
                  recursionSpecies: false,
                  page: { offset: 0, limit: 1000000, filter: '' },
                });
                console.log('attrRes===', attrRes);
              }
            }
          }
        }
      }
    };
    findThing();
  }, [thingId]);

  return <Card bordered={false} title="资产卡片"></Card>;
};
export default ThingCard;
