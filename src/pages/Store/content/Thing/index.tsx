import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import storeCtrl from '@/ts/controller/store';
import useCtrlUpdate from '@/hooks/useCtrlUpdate';
import userCtrl from '@/ts/controller/setting';
import { XAttribute } from '@/ts/base/schema';
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
/**
 * 仓库-物
 */
const Thing: React.FC<IProps> = (props: IProps) => {
  const [key] = useCtrlUpdate(storeCtrl);
  const [thingAttrs, setThingAttrs] = useState<any[]>([]);
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
          attrArray.push(attr);
        }
      }
    }

    let sortedSpecies = getSortedList(instances, [], false);
    for (let species of sortedSpecies) {
      if (attrArray.map((attr: XAttribute) => attr.speciesId).includes(species.id)) {
        let attrs =
          attrArray?.filter((attr: XAttribute) => attr.speciesId == species.id) || [];
        parentHeaders.push({
          id: attrs[0].species?.id || species.id,
          caption: attrs[0].species?.name || species.name,
          children: attrs,
        });
      }
    }
    setThingAttrs(parentHeaders);
  };

  useEffect(() => {
    if (storeCtrl.checkedSpeciesList.length > 0) {
      if (props.checkedList && props.checkedList.length > 0) {
        loadAttrs(props.checkedList.map((item) => item.item));
      } else if (props.current && userCtrl.space.id) {
        loadAttrs([props.current]);
      }
    }
  }, [props.current, props.checkedList, storeCtrl.checkedSpeciesList]);

  const getColumn = (
    id: string,
    caption: string,
    valueType: string,
    dataField: string,
    dictItems?: any[],
  ) => {
    switch (valueType) {
      case '时间型':
        return (
          <Column
            key={id}
            dataField={dataField}
            caption={caption}
            dataType="datetime"
            width={250}
            format="yyyy年MM月dd日 HH:mm:ss"
          />
        );
      case '日期型':
        return (
          <Column
            key={id}
            dataField={dataField}
            caption={caption}
            dataType="date"
            width={180}
            format="yyyy年MM月dd日"
          />
        );
      case '选择型':
        return (
          <Column key={id} dataField={dataField} caption={caption} width={150}>
            <Lookup dataSource={dictItems || []} displayExpr="name" valueExpr="value" />
          </Column>
        );
      case '数值型':
        return (
          <Column key={id} dataField={dataField} caption={caption} dataType="number" />
        );
      default:
        return (
          <Column
            key={id}
            dataField={dataField}
            caption={caption}
            dataType="string"
            width={180}
          />
        );
    }
  };

  const getComponent = () => {
    return (
      <DataGrid
        dataSource={
          props.dataSource ||
          new CustomStore({
            key: 'Id',
            async load(loadOptions) {
              loadOptions.userData = thingAttrs.map((item) => `S${item.id}`);
              const result = await kernel.anystore.loadThing(
                loadOptions,
                userCtrl.isCompanySpace ? 'company' : 'user',
              );
              if (result.success) {
                return result.data;
              }
              return [];
            },
          })
        }
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
          allowedPageSizes={[10, 20, 50]}
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
        {thingAttrs.map((parentHeader: any) => (
          <Column key={parentHeader.caption} caption={parentHeader.caption}>
            {parentHeader.children.map((attr: XAttribute) =>
              getColumn(
                attr.id,
                attr.name,
                attr.valueType,
                attr.belongId ? `S${attr.speciesId}.T${attr.id}` : attr.code,
                attr.dict?.dictItems,
              ),
            )}
          </Column>
        ))}
        <Column type="buttons">{props.buttonList}</Column>
      </DataGrid>
    );
  };

  return (
    <Card id={key} bordered={false}>
      {getComponent()}
    </Card>
  );
};
export default Thing;
