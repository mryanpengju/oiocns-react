import React from 'react';
import Content from './content';
import MainLayout from '@/components/MainLayout';
import useMenuUpdate from './hooks/useMenuUpdate';
import { IconFont } from '@/components/IconFont';
const Setting: React.FC<any> = () => {
  const [
    key,
    menus,
    refreshMenu,
    selectMenu,
    setSelectMenu,
    checkedList,
    operations,
    setCheckedList,
  ] = useMenuUpdate();
  return (
    <MainLayout
      title={{ label: '办事', icon: <IconFont type={'icon-todo'} /> }}
      selectMenu={selectMenu}
      onSelect={async (data) => {
        setSelectMenu(data);
      }}
      checkedList={checkedList}
      onTabChanged={(key) => {
        setCheckedList([]);
        let menu = menus.find((a) => a.key == key)?.menu;
        if (menu) {
          setSelectMenu(menu);
        }
      }}
      tabKey={'1'}
      onCheckedChange={(checkedList: any[]) => {
        setCheckedList(checkedList);
        // refreshMenu();
      }}
      siderMenuData={menus[0]?.menu}
      tabs={menus}>
      <Content
        key={key}
        selectMenu={selectMenu}
        reflashMenu={refreshMenu}
        operations={operations}
      />
    </MainLayout>
  );
};

export default Setting;
