import PageCard from '@/components/PageCard';
import { ITarget } from '@/ts/core';
import { Button, Tabs } from 'antd';
import React, { useRef, useState } from 'react';
import Description from './Description';
import cls from './index.module.less';

interface IProps {
  current: ITarget;
}
/**
 * 职权设定
 * @returns
 */
const AuthorityStandrad: React.FC<IProps> = ({ current }: IProps) => {
  console.log('current===', current);
  const [modalType, setModalType] = useState('');
  const [tabKey, setTabKey] = useState('基本信息');
  const parentRef = useRef<any>(null); //父级容器Dom

  // Tab 改变事件
  const tabChange = (key: string) => {
    setTabKey(key);
  };

  /** 操作按钮 */
  const renderButton = (belong: boolean = false) => {
    if (belong && !current?.target.belongId) {
      return '';
    }
    switch (tabKey) {
      case '分类特性':
        return (
          <Button
            key="edit"
            type="link"
            onClick={() => {
              setModalType('新增特性');
            }}>
            {'新增特性'}
          </Button>
        );
      case '表单设计':
        return (
          <Button
            key="edit"
            type="link"
            onClick={() => {
              setModalType('新增表单');
            }}>
            {'新增表单'}
          </Button>
        );
      default:
        return <></>;
    }
  };

  const items = [
    {
      label: `基本信息`,
      key: '基本信息',
      children: <Description current={current} title={'职权'} extra={undefined} />,
    },
    {
      label: `身份管理`,
      key: '身份管理',
      children: <div>身份</div>,
    },
  ];

  return (
    <div className={cls[`dept-content-box`]}>
      {current && (
        <>
          {/** 分类特性表单 */}
          <div className={cls['pages-wrap']}>
            <PageCard bordered={false} bodyStyle={{ paddingTop: 16 }}>
              <div className={cls['page-content-table']} ref={parentRef}>
                <Tabs
                  activeKey={tabKey}
                  items={items}
                  tabBarExtraContent={renderButton()}
                  onChange={tabChange}
                />
              </div>
            </PageCard>
          </div>
        </>
      )}
    </div>
  );
};

export default AuthorityStandrad;
