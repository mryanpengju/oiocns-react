import React, { useEffect, useState } from 'react';
import Thing from './Thing';
import ThingCard from './Card';
import ThingHistory from './History';
import { ISpeciesItem } from '@/ts/core';

interface IProps {
  species: ISpeciesItem;
  selectable: boolean;
  checkedList?: any[];
}
/**
 * 仓库-物
 */
const ThingIndex: React.FC<IProps> = ({ species, selectable, checkedList }) => {
  const [tabKey, setTabKey] = useState(0);
  const [thingId, setThingId] = useState<string>('');

  useEffect(() => {
    setTabKey(0);
  }, [species]);

  switch (tabKey) {
    case 0:
      return (
        <Thing
          current={species}
          checkedList={checkedList}
          selectable={selectable}
          setTabKey={setTabKey}
          setThingId={setThingId}
        />
      );
    case 1:
      return <ThingCard thingId={thingId} setTabKey={setTabKey} />;
    case 2:
      return <ThingHistory thingId={thingId} setTabKey={setTabKey} />;
    default:
      return <></>;
  }
};
export default ThingIndex;
