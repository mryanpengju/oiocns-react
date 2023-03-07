import { MenuItemType } from 'typings/globelType';
import React from 'react';
import {
  IApplyItem,
  IApprovalItem,
  ITodoGroup,
  loadMarketApply,
  loadOrgApply,
  loadPublishApply,
  WorkType,
} from '@/ts/core';
import { MarketColumns, MerchandiseColumns, OrgColumns } from '../config/columns';
import CommonTodo from './Common/Todo';
import CommonApply from './Common/Apply';
import SellOrder from './Common/Order/Sell';
import Work from './Work';
import { XOperation } from '@/ts/base/schema';
import { ProColumns } from '@ant-design/pro-components';
import BuyOrder from './Common/Order/Buy';
import userCtrl from '@/ts/controller/setting';

interface IProps {
  reflashMenu: () => void;
  selectMenu: MenuItemType;
  operations: XOperation[];
}

const TypeSetting = ({ selectMenu, reflashMenu, operations }: IProps) => {
  if (operations.length <= 0) {
    let todoGroup = selectMenu.item as ITodoGroup;
    switch (selectMenu.itemType) {
      case WorkType.FriendTodo:
      case WorkType.CompanyTodo:
      case WorkType.GroupTodo:
        return (
          <CommonTodo
            todoGroup={todoGroup}
            columns={OrgColumns as ProColumns<IApprovalItem>[]}
            reflashMenu={reflashMenu}
            tabList={[
              { key: 'todo', tab: '我的待办' },
              { key: 'complete', tab: '我的已办' },
            ]}
          />
        );
      case WorkType.JoinStoreTodo:
        return (
          <CommonTodo
            todoGroup={todoGroup}
            tabList={[
              { key: 'todo', tab: '我的待办' },
              { key: 'complete', tab: '我的已办' },
            ]}
            columns={MarketColumns as ProColumns<IApprovalItem>[]}
            reflashMenu={reflashMenu}
          />
        );
      case WorkType.PublishTodo:
        return (
          <CommonTodo
            todoGroup={todoGroup}
            tabList={[
              { key: 'todo', tab: '我的待办' },
              { key: 'complete', tab: '我的已办' },
            ]}
            columns={MerchandiseColumns as ProColumns<IApprovalItem>[]}
            reflashMenu={reflashMenu}
          />
        );
      case WorkType.OrderTodo:
        return <SellOrder typeName={selectMenu.key} todoGroup={todoGroup} />;
      case WorkType.FriendApply:
      case WorkType.CompanyApply:
      case WorkType.GroupApply:
        return (
          <CommonApply
            type={selectMenu.itemType}
            todoGroup={loadOrgApply(userCtrl.space, selectMenu.itemType as WorkType)}
            columns={OrgColumns as ProColumns<IApplyItem>[]}
            reflashMenu={reflashMenu}
          />
        );
      case WorkType.JoinStoreApply:
        return (
          <CommonApply
            type={selectMenu.itemType}
            todoGroup={loadMarketApply()}
            columns={MarketColumns as ProColumns<IApplyItem>[]}
            reflashMenu={reflashMenu}
          />
        );
      case WorkType.PublishApply:
        return (
          <CommonApply
            type={selectMenu.itemType}
            todoGroup={loadPublishApply()}
            columns={MerchandiseColumns as ProColumns<IApplyItem>[]}
            reflashMenu={reflashMenu}
          />
        );
      case WorkType.OrderApply:
        return <BuyOrder typeName={selectMenu.key} todoGroup={todoGroup} />;
      default:
        return <></>;
    }
  } else {
    return <Work key={'work'} operations={operations}></Work>;
  }
  return <></>;
};

export default TypeSetting;
