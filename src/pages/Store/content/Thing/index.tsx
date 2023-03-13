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
  Button,
  HeaderFilter,
} from 'devextreme-react/data-grid';
import { ISpeciesItem } from '@/ts/core';
import CustomStore from 'devextreme/data/custom_store';
import { kernel } from '@/ts/base';
import TeamIcon from '@/bizcomponents/GlobalComps/teamIcon';
interface IProps {
  current: ISpeciesItem;
  height?: any;
  width?: any;
  editingTool?: any;
  checkedList?: any[];
  buttonList?: any[];
  toolBarItems?: any[];
  dataSource?: any;
  byIds?: string[];
  onSelectionChanged?: Function;
  selectable: boolean;
}
// function isNotEmpty(value: any) {
//   return value !== undefined && value !== null && value !== '';
// }
/**
 * 仓库-物
 */
const Thing: React.FC<IProps> = (props: IProps) => {
  console.log('byIds', props.byIds);
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
            headerFilter={{
              groupInterval: 'day',
            }}
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
            headerFilter={{
              groupInterval: 'day',
            }}
            format="yyyy年MM月dd日"
          />
        );
      case '选择型':
        var dataSource =
          dictItems?.map((item) => {
            return {
              text: item.name,
              value: item.value,
            };
          }) || [];
        return (
          <Column
            key={id}
            dataField={dataField}
            caption={caption}
            width={150}
            headerFilter={{
              dataSource: dataSource,
            }}>
            <Lookup dataSource={dataSource} displayExpr="text" valueExpr="value" />
          </Column>
        );
      case '数值型':
        return (
          <Column
            key={id}
            fixed={id === 'Id'}
            dataField={dataField}
            caption={caption}
            dataType="number"
            width={150}
            allowHeaderFiltering={false}
          />
        );
      case '组织型':
        return (
          <Column
            key={id}
            dataField={dataField}
            caption={caption}
            dataType="string"
            width={150}
            allowFiltering={false}
            cellRender={(data: any) => {
              var share = userCtrl.findTeamInfoById(data.value);
              if (data) {
                return (
                  <>
                    <TeamIcon share={share} />
                    <span style={{ marginLeft: 10 }}>{share.name}</span>
                  </>
                );
              }
              return <span>{share.name}</span>;
            }}
          />
        );
      default:
        return (
          <Column
            key={id}
            dataField={dataField}
            caption={caption}
            dataType="string"
            width={180}
            allowHeaderFiltering={false}
          />
        );
    }
  };

  const getComponent = () => {
    return (
      <DataGrid
        keyExpr="Id"
        dataSource={
          props.dataSource ||
          new CustomStore({
            key: 'Id',
            async load(loadOptions) {
              const species = [
                ...(props.checkedList || []).map((item) => item.item.target),
                props.current.target,
              ];
              loadOptions.userData = species
                .filter((item) => item.code != 'anything')
                .map((item) => `S${item.id}`);
              let request: any = { ...loadOptions };
              if (props.byIds) {
                request.options = {
                  match: {
                    _id: {
                      _in_: props.byIds,
                      // _in_: ['27502969349997568', '27503071439619072'],
                    },
                  },
                };
              }
              const result = await kernel.anystore.loadThing(
                request,
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
        columnResizingMode={'widget'}
        height={props.height || 'calc(100vh - 175px)'}
        width="100%"
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
        {props.selectable && (
          <Selection
            mode="multiple"
            selectAllMode="allPages"
            showCheckBoxesMode="always"
          />
        )}
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
          infoText={'共{2}项'}
          displayMode={'full'}
        />
        <Sorting mode="multiple" />
        <Paging defaultPageSize={10} />
        <FilterRow visible={true} />
        <HeaderFilter visible={true} />
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
        <Column type="buttons" width={((props.buttonList?.length || 0) + 2) * 40}>
          <Button hint="信息卡片" icon="paste" />
          <Button hint="归档记录" icon="bulletlist" />
          {props.buttonList}
        </Column>
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
