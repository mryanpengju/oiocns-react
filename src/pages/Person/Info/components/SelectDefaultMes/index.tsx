import React, { useEffect, useState } from 'react';
import { Modal, Select } from 'antd';
import { SpaceType } from '@/ts/core/target/itarget';
import userCtrl from '@/ts/controller/setting/userCtrl';
import styles from './index.module.less';

type SelectDefaultMesProps = {
  isOpen: boolean;
  onCancel: () => void;
  onOk: (params: string) => void;
};

type optionType = {
  label: string;
  value: string;
};

const SelectDefaultMes: React.FC<SelectDefaultMesProps> = ({
  isOpen,
  onCancel,
  onOk,
}) => {
  const [current, setCurrent] = useState<string>('');
  const [menuList, setMenuList] = useState<optionType[]>([]);
  const [currentValue, setCurrentValue] = useState<string>('');

  const handleChange = (value: string) => {
    setCurrentValue(value);
  };

  const refreshUI = () => {
    const all: SpaceType[] =
      userCtrl.user?.joinedCompany?.map((item) => {
        return item.spaceData;
      }) || [];
    all.unshift(userCtrl.user.spaceData);
    const returnValue = all.map((item) => {
      return {
        label: item.name,
        value: item.id,
      };
    });
    setMenuList(returnValue);
    setCurrent(userCtrl.space.spaceData.id);
  };
  useEffect(() => {
    refreshUI();
  }, []);

  return (
    <Modal
      title="设置默认单位"
      open={isOpen}
      onCancel={onCancel}
      onOk={() => {
        onOk(currentValue);
      }}>
      <div className={styles[`menu-list`]}>
        <Select
          defaultValue={current}
          style={{ width: '100%' }}
          onChange={handleChange}
          options={menuList}
        />
      </div>
    </Modal>
  );
};
export default SelectDefaultMes;
