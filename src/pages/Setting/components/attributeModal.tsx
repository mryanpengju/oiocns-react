import React, { useEffect, useRef, useState } from 'react';
import { ProFormColumnsType, ProFormInstance } from '@ant-design/pro-components';
import SchemaForm from '@/components/SchemaForm';
import { AttributeModel } from '@/ts/base/model';
import { IDict, ISpeciesItem, ITarget } from '@/ts/core';
import userCtrl from '@/ts/controller/setting';
import { XAttribute } from '@/ts/base/schema';
import { targetsToTreeData } from '..';

interface Iprops {
  title: string;
  open: boolean;
  data: XAttribute | undefined;
  handleCancel: () => void;
  handleOk: (success: boolean) => void;
  current: ISpeciesItem;
  target?: ITarget;
}
/*
  特性编辑模态框
*/
const AttributeModal = (props: Iprops) => {
  const [selectType, setSelectType] = useState<string>();
  const { open, title, handleOk, data, current, handleCancel } = props;
  const formRef = useRef<ProFormInstance>();
  const [dictItemMap, setDictItemMap] = useState<any>({});
  const buildTree = (dicts: IDict[]) => {
    const result: any = {};
    for (const item of dicts) {
      result[item.id] = { id: item.id, name: item.name, text: item.name };
    }
    return result;
  };
  useEffect(() => {
    current
      .loadDictsEntity(userCtrl.space.id, true, true, {
        offset: 0,
        limit: 10000,
        filter: '',
      })
      .then((data) => {
        setDictItemMap(buildTree(data));
      });
    // const dataSelectItems = buildTree(data);
  }, []);
  const getFromColumns = () => {
    const columns: ProFormColumnsType<AttributeModel>[] = [
      {
        title: '特性名称',
        dataIndex: 'name',
        formItemProps: {
          rules: [{ required: true, message: '特性名称为必填项' }],
        },
      },
      {
        title: '特性代码',
        dataIndex: 'code',
        formItemProps: {
          rules: [{ required: true, message: '特性代码为必填项' }],
        },
      },
      {
        title: '选择制定组织',
        dataIndex: 'belongId',
        valueType: 'treeSelect',
        initialValue: userCtrl.space.id,
        formItemProps: { rules: [{ required: true, message: '组织为必填项' }] },
        request: async () => {
          const res = await userCtrl.getTeamTree();
          return targetsToTreeData(res);
        },
        fieldProps: {
          disabled: title === '修改',
          showSearch: true,
        },
      },
      {
        title: '选择管理权限',
        dataIndex: 'authId',
        valueType: 'treeSelect',
        formItemProps: { rules: [{ required: true, message: '管理权限为必填项' }] },
        request: async () => {
          const data = await userCtrl.company.loadAuthorityTree(false);
          return data ? [data] : [];
        },
        fieldProps: {
          disabled: title === '编辑',
          fieldNames: { label: 'name', value: 'id' },
          showSearch: true,
          filterTreeNode: true,
          treeNodeFilterProp: 'name',
          treeDefaultExpandAll: true,
        },
      },
      {
        title: '向下级组织公开',
        dataIndex: 'public',
        valueType: 'select',
        fieldProps: {
          options: [
            {
              value: true,
              label: '公开',
            },
            {
              value: false,
              label: '不公开',
            },
          ],
        },
        formItemProps: {
          rules: [{ required: true, message: '是否公开为必填项' }],
        },
      },
      {
        title: '特性类型',
        dataIndex: 'valueType',
        valueType: 'select',
        fieldProps: {
          options: [
            {
              value: '数值型',
              label: '数值型',
            },
            {
              value: '描述型',
              label: '描述型',
            },
            {
              value: '选择型',
              label: '选择型',
            },
            {
              value: '分类',
              label: '分类',
            },
            {
              value: '附件',
              label: '附件',
            },
            {
              value: '日期型',
              label: '日期型',
            },
            {
              value: '时间型',
              label: '时间型',
            },
            {
              value: '人员',
              label: '人员',
            },
            {
              value: '部门',
              label: '部门',
            },
          ],
          onSelect: (select: string) => {
            setSelectType(select);
          },
        },
        formItemProps: {
          rules: [{ required: true, message: '特性类型为必填项' }],
        },
      },
    ];
    if (selectType === '选择型') {
      columns.push({
        title: '选择枚举分类',
        dataIndex: 'dictId',
        valueType: 'select',
        formItemProps: { rules: [{ required: true, message: '枚举分类为必填项' }] },
        valueEnum: dictItemMap,
        fieldProps: {
          disabled: selectType !== '选择型',
          showSearch: true,
        },
      });
    }
    columns.push({
      title: '特性定义',
      dataIndex: 'remark',
      valueType: 'textarea',
      colProps: { span: 24 },
      formItemProps: {
        rules: [{ required: true, message: '特性定义为必填项' }],
      },
    });
    return columns;
  };
  return (
    <SchemaForm<AttributeModel>
      formRef={formRef}
      title={title}
      open={open}
      width={640}
      onOpenChange={(open: boolean) => {
        if (open) {
          // console.log('props.target?.id', props.target?.id);
          // formRef.current?.setFieldsValue({ belongId: props.target?.id });
          if (title.includes('修改')) {
            setSelectType(data?.valueType);
            formRef.current?.setFieldsValue(data);
          }
        } else {
          formRef.current?.resetFields();
          handleCancel();
        }
      }}
      rowProps={{
        gutter: [24, 0],
      }}
      layoutType="ModalForm"
      onFinish={async (values) => {
        values = { ...data, ...values };
        if (title.includes('新增')) {
          handleOk(await current.createAttr(values));
        } else {
          handleOk(await current.updateAttr(values));
        }
      }}
      columns={getFromColumns()}></SchemaForm>
  );
};

export default AttributeModal;
