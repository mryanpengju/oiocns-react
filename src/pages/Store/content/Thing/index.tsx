import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import storeCtrl from '@/ts/controller/store';
import useCtrlUpdate from '@/hooks/useCtrlUpdate';
import userCtrl from '@/ts/controller/setting';
import { XAttribute } from '@/ts/base/schema';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import DataGrid, {
  Column,
  ColumnChooser,
  ColumnFixing,
  Editing,
  Pager,
  Paging,
  Lookup,
  SearchPanel,
  Sorting,
  FilterRow,
  Selection,
  Toolbar,
  Item,
} from 'devextreme-react/data-grid';
import config from 'devextreme/core/config';
import { loadMessages, locale } from 'devextreme/localization';
import zhMessage from 'devextreme/localization/messages/zh.json';
import { ISpeciesItem } from '@/ts/core';
import CustomStore from 'devextreme/data/custom_store';
import { kernel } from '@/ts/base';
interface IProps {
  current: ISpeciesItem;
  height?: any;
  editingTool?: any;
  checkedList?: any[];
  buttonList?: any[];
  toolBarItems?: any[];
  dataSource?: any;
  onSelectionChanged?: Function;
}
// function isNotEmpty(value: any) {
//   return value !== undefined && value !== null && value !== '';
// }
export const store = new CustomStore({
  key: 'Id',
  async load(loadOptions) {
    const result = await kernel.anystore.loadThing(loadOptions, 'company');
    console.log(result);
    if (result.success) {
      return result.data;
    }
    return [];
  },
});
/**
 * 仓库-物
 */
const Thing: React.FC<IProps> = (props: IProps) => {
  const [key] = useCtrlUpdate(storeCtrl);
  const [thingAttrs, setThingAttrs] = useState<any[]>([]);
  const allowedPageSizes = [10, 20, 50];
  const getSortedList = (
    speciesArray: ISpeciesItem[],
    array: any[],
    front: boolean,
  ): any[] => {
    for (let species of speciesArray) {
      if (!array.includes(species)) {
        //没有就放在最前面 改为父级放前，子级放后
        if (front) {
          array = [species, ...array];
        } else {
          array = [...array, species];
        }
      }
      if (species.parent) {
        array = getSortedList([species.parent], array, true);
      }
    }
    return array;
  };

  const loadAttrs = async (speciesArray: ISpeciesItem[]) => {
    let parentHeaders: any[] = [];
    let speciesIds = speciesArray.map((item) => item.id);
    //带属性的分类
    let instances = storeCtrl.checkedSpeciesList.filter((item: ISpeciesItem) =>
      speciesIds.includes(item.id),
    );
    //属性set
    let attrArray: XAttribute[] = [];
    for (let instance of instances) {
      for (let attr of instance.attrs || []) {
        if (!attrArray.map((item) => item.id).includes(attr.id)) {
          if (attr.belongId) {
            attrArray.push(attr);
          }
        }
      }
    }

    let sortedSpecies = getSortedList(instances, [], false);
    for (let species of sortedSpecies) {
      if (attrArray.map((attr: XAttribute) => attr.speciesId).includes(species.id)) {
        let attrs =
          attrArray?.filter((attr: XAttribute) => attr.speciesId == species.id) || [];
        parentHeaders.push({
          caption: attrs[0].species?.name || species.name,
          children: attrs,
        });
      }
    }
    setThingAttrs(parentHeaders);
  };

  useEffect(() => {
    config({ defaultCurrency: 'zh' });
    loadMessages(zhMessage);
    locale('zh');
    if (storeCtrl.checkedSpeciesList.length > 0) {
      if (props.checkedList && props.checkedList.length > 0) {
        loadAttrs(props.checkedList.map((item) => item.item));
      } else if (props.current && userCtrl.space.id) {
        loadAttrs([props.current]);
      }
    }
  }, [props.current, props.checkedList, storeCtrl.checkedSpeciesList]);

  const getColumn = (attr: XAttribute) => {
    switch (attr.valueType) {
      case '时间型':
        return (
          <Column
            key={attr.id}
            dataField={`S${attr.speciesId}.T${attr.id}`}
            caption={attr.name}
            dataType="datetime"
            width={250}
            format="yyyy年MM月dd日 HH:mm:ss"
          />
        );
      case '日期型':
        return (
          <Column
            key={attr.id}
            dataField={`S${attr.speciesId}.T${attr.id}`}
            caption={attr.name}
            dataType="date"
            width={180}
            format="yyyy年MM月dd日"
          />
        );
      case '选择型':
        return (
          <Column
            key={attr.id}
            dataField={`S${attr.speciesId}.T${attr.id}`}
            caption={attr.name}
            width={150}>
            <Lookup
              dataSource={attr.dict?.dictItems || []}
              displayExpr="name"
              valueExpr="value"
            />
          </Column>
        );
      case '数值型':
        return (
          <Column
            key={attr.id}
            dataField={`S${attr.speciesId}.T${attr.id}`}
            caption={attr.name}
            dataType="number"
            // format="current"
          />
        );
      default:
        return (
          <Column
            key={attr.id}
            dataField={`S${attr.speciesId}.T${attr.id}`}
            caption={attr.name}
            dataType="string"
            width={180}
          />
        );
    }
  };

  const getComponent = () => {
    return (
      <DataGrid
        dataSource={props.dataSource || store}
        columnMinWidth={80}
        focusedRowEnabled={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
        showColumnLines={true}
        showRowLines={true}
        rowAlternationEnabled={true}
        hoverStateEnabled={true}
        onSelectionChanged={(e) => {
          console.log(e.selectedRowsData);
          props.onSelectionChanged?.call(this, e.selectedRowsData);
        }}
        height={props.height || 'calc(100vh - 175px)'}
        width={'calc(100vw - 320px)'}
        showBorders={true}>
        <ColumnChooser
          enabled={true}
          title={'列选择器'}
          height={'500px'}
          allowSearch={true}
          mode={'select'}
          sortOrder={'asc'}
        />
        <ColumnFixing enabled={true} />
        <Selection mode="multiple" selectAllMode="allPages" />
        {props.editingTool || (
          <Editing
            allowAdding={false}
            allowUpdating={false}
            allowDeleting={false}
            selectTextOnEditStart={true}
            useIcons={true}
          />
        )}
        <Pager
          visible={true}
          allowedPageSizes={allowedPageSizes}
          showPageSizeSelector={true}
          showNavigationButtons={true}
          showInfo={true}
          infoText={'共{2}条'}
          displayMode={'full'}
        />
        <Sorting mode="multiple" />
        <Paging defaultPageSize={10} />
        <FilterRow visible={true} />
        <Toolbar>
          {props.toolBarItems}
          <Item name="searchPanel" />
          <Item name="columnChooserButton" locateInMenu="auto" location="after" />
        </Toolbar>
        <SearchPanel visible={true} highlightCaseSensitive={true} />

        <Column
          key="Id"
          dataField="Id"
          caption="唯一标识"
          dataType="number"
          // format="current"
        />
        <Column
          key="Creater"
          dataField="Creater"
          caption="创建人"
          dataType="number"
          // format="current"
        />
        <Column
          width={200}
          key="CreateTime"
          dataField="CreateTime"
          caption="创建时间"
          dataType="datetime"
          format="yyyy年MM月dd日 HH:mm:ss"
        />
        <Column key="Status" dataField="Status" caption="状态" dataType="string">
          <Lookup dataSource={['正常', '一销毁']} />
        </Column>
        {thingAttrs.map((parentHeader: any) => (
          <Column key={parentHeader.caption} caption={parentHeader.caption}>
            {parentHeader.children.map((attr: XAttribute) => getColumn(attr))}
          </Column>
        ))}
        <Column type="buttons">{props.buttonList}</Column>
      </DataGrid>
    );
  };

  return (
    <Card id={key} bordered={false}>
      {thingAttrs && thingAttrs.length > 0 && getComponent()}
    </Card>
  );
};
export default Thing;
