// import { Form } from 'antd';
// import cls from './index.module.less';
// import React, { useEffect, useRef } from 'react';
// import { ProFormColumnsType, ProFormInstance } from '@ant-design/pro-components';
// import SchemaForm from '@/components/SchemaForm';
// import thingCtrl from '@/ts/controller/thing';
// import { TreeSelect } from 'antd';
// import userCtrl from '@/ts/controller/setting';
// const { SHOW_PARENT } = TreeSelect;
// interface IProps {
//   currentFormValue: any;
// }
// export const toTreeData = (species: any[]): any[] => {
//   return species.map((t) => {
//     return {
//       label: t.name,
//       value: t.id,
//       children: toTreeData(t.children),
//     };
//   });
// };
// /** 傻瓜组件，只负责读取状态 */
// const DefineInfo: React.FC<IProps> = ({ currentFormValue }) => {
//   const [form] = Form.useForm();
//   const formRef = useRef<ProFormInstance>();
//   const getFromColumns = () => {
//     const columns: ProFormColumnsType<any>[] = [
//       {
//         title: '办事名称',
//         dataIndex: 'name',
//         formItemProps: {
//           rules: [{ required: true, message: '办事名称为必填项' }],
//         },
//         colProps: { span: 12 },
//       },

//       {
//         title: '制定组织',
//         dataIndex: 'belongId',
//         valueType: 'treeSelect',
//         formItemProps: { rules: [{ required: true, message: '组织为必填项' }] },
//         request: async () => {
//           return await userCtrl.getTeamTree();
//         },
//         fieldProps: {
//           fieldNames: { label: 'teamName', value: 'id', children: 'subTeam' },
//           showSearch: true,
//           filterTreeNode: true,
//           treeNodeFilterProp: 'teamName',
//         },
//       },
//       {
//         title: '操作对象',
//         dataIndex: 'sourceIds',
//         valueType: 'treeSelect',
//         request: async () => {
//           const species = await thingCtrl.loadSpeciesTree();
//           let tree = toTreeData([species]);
//           return tree;
//         },
//         fieldProps: {
//           treeCheckable: true,
//           showSearch: true,
//           filterTreeNode: true,
//           allowClear: true,
//           showCheckedStrategy: SHOW_PARENT,
//         },
//         colProps: { span: 24 },
//       },
//     ];
//     columns.push({
//       title: '备注',
//       dataIndex: 'remark',
//       valueType: 'textarea',
//       colProps: { span: 24 },
//     });
//     return columns;
//   };

//   useEffect(() => {
//     form.setFieldsValue(currentFormValue);
//   }, [currentFormValue]);

//   return (
//     <div className={cls['contentMes']}>
//       <SchemaForm
//         formRef={formRef}
//         form={form}
//         open={true}
//         width={640}
//         onValuesChange={async () => {}}
//         rowProps={{
//           gutter: [24, 0],
//         }}
//         layoutType="Form"
//         onFinish={async (values) => {
//           values.sourceIds = values.sourceIds.join(',');
//         }}
//         columns={getFromColumns()}></SchemaForm>
//     </div>
//   );
// };

// export default DefineInfo;

import { Branche, FlowNode } from '@/ts/base/schema';
import userCtrl from '@/ts/controller/setting';
import { ISpeciesItem } from '@/ts/core';
import thingCtrl from '@/ts/controller/thing';
import { ProForm, ProFormText, ProFormTreeSelect } from '@ant-design/pro-components';
import { message, Modal } from 'antd';
import { useForm } from 'antd/es/form/Form';
import React from 'react';
import { TreeSelect } from 'antd';
import { kernel } from '@/ts/base';
import { getUuid } from '@/utils/tools';

interface Iprops {
  title: string;
  open: boolean;
  data: any;
  handleCancel: () => void;
  handleOk: (res: any) => void;
  current: ISpeciesItem;
}

/**
 * 默认备注：表单默认布局
 */
export const defaultRemark: any = {
  type: 'object',
  properties: {},
  labelWidth: 120,
  layout: 'horizontal',
  col: 12,
};

export const toTreeData = (species: any[]): any[] => {
  return species.map((t) => {
    return {
      label: t.name,
      value: t.id,
      children: toTreeData(t.children),
    };
  });
};

const { SHOW_PARENT } = TreeSelect;
/*
  业务标准编辑模态框
*/
const DefineInfo = (props: Iprops) => {
  const { open, title, handleOk, data, current, handleCancel } = props;
  const [form] = useForm<any>();
  if (data) {
    if (!Array.isArray(data.sourceIds)) {
      data.sourceIds = data.sourceIds?.split(',').filter((id: any) => id != '');
    }
    form.setFieldsValue(data);
  }
  const loadResource = (resource: any): any => {
    let obj: any;
    if (resource) {
      switch (resource.type) {
        case '起始':
          resource.type = 'ROOT';
          break;
        case '审批':
          resource.type = 'APPROVAL';
          break;
        case '抄送':
          resource.type = 'CC';
          break;
        case '条件':
          resource.type = 'CONDITIONS';
          break;
        case '全部':
          resource.type = 'CONCURRENTS';
          break;
        case '组织':
          resource.type = 'ORGANIZATIONAL';
          break;
        //如果是空结点（下个流程的起始节点）
        case '空':
        case 'EMPTY':
          resource.type = 'EMPTY';
          break;
        default:
          break;
      }
    }
    obj = resource;
    if (obj.branches) {
      obj.branches = obj.branches.map((item: any) => loadResource(item));
    }
    if (obj.children) {
      obj.children = loadResource(obj.children);
    }
    return obj;
  };

  return (
    <Modal
      title={data?.name || title}
      open={open}
      onOk={async () => {
        const value = {
          ...{ remark: JSON.stringify(defaultRemark) },
          ...data,
          ...form.getFieldsValue(),
        };
        if (value.name && value.belongId && value.sourceIds) {
          console.log(value.sourceIds);
        } else {
          message.warn('请先完成表单');
          return;
        }
        if (title.includes('新增')) {
          // handleOk(await current.createOperation(value));
          let resource_: FlowNode = {
            id: '0',
            code: getUuid(),
            type: 'ROOT',
            name: '发起人',
            num: 0,
            destType: '角色',
            destId: '0',
            destName: '',
            children: undefined,
            branches: [],
            belongId: userCtrl.space.id,
            operations: [],
          };
          let define = await current.createFlowDefine({
            code: value.name,
            name: value.name,
            sourceIds: value.sourceIds?.join(','),
            fields: undefined,
            remark: value.remark,
            resource: resource_,
            belongId: value.belongId,
          });
          if (define) {
            form.resetFields();
          }
          handleOk(define);
        } else {
          let resource_ = (
            await kernel.queryNodes({
              id: value.id || '',
              spaceId: userCtrl.space.id,
              page: { offset: 0, limit: 1000, filter: '' },
            })
          ).data;
          let resourceData = loadResource(resource_);
          let define = await current?.updateFlowDefine({
            id: value.id,
            code: value.name,
            name: value.name,
            sourceIds: value.sourceIds?.join(','),
            fields: undefined,
            remark: value.remark,
            resource: resourceData,
            belongId: value.belongId,
          });
          if (define) {
            form.resetFields();
          }
          handleOk(define);
        }
      }}
      onCancel={() => {
        form.resetFields();
        handleCancel();
      }}
      destroyOnClose={true}
      cancelText={'关闭'}
      width={700}>
      <ProForm<any>
        layout="vertical"
        grid={true}
        form={form}
        rowProps={{
          gutter: [24, 0],
        }}
        submitter={{
          searchConfig: {
            resetText: '重置',
            submitText: '提交',
          },
          resetButtonProps: {
            style: { display: 'none' },
          },
          submitButtonProps: {
            style: { display: 'none' },
          },
        }}>
        <ProFormText
          width="md"
          name="name"
          label="办事名称"
          placeholder="请输入办事名称"
          required={true}
          colProps={{ span: 12 }}
          rules={[{ required: true, message: '办事名称为必填项' }]}
        />
        <ProFormTreeSelect
          width="md"
          name="belongId"
          label="制定组织"
          placeholder="请选择制定组织"
          required={true}
          colProps={{ span: 12 }}
          request={async () => {
            return await userCtrl.getTeamTree();
          }}
          fieldProps={{
            disabled: title === '修改' || title === '编辑',
            showSearch: true,
            fieldNames: { label: 'teamName', value: 'id', children: 'subTeam' },
            filterTreeNode: true,
            treeNodeFilterProp: 'teamName',
          }}
        />
        <ProFormTreeSelect
          width="md"
          name="sourceIds"
          label="操作实体"
          placeholder="请选择操作实体"
          required={true}
          colProps={{ span: 12 }}
          request={async () => {
            const species = await thingCtrl.loadSpeciesTree();
            let tree = toTreeData([species]);
            return tree;
          }}
          fieldProps={{
            treeCheckable: true,
            showSearch: true,
            filterTreeNode: true,
            allowClear: true,
            showCheckedStrategy: SHOW_PARENT,
          }}
        />
        {/* <ProFormTextArea
          width="md"
          name="remark"
          label="备注"
          placeholder="请输入备注信息"
          colProps={{ span: 24 }}></ProFormTextArea> */}
      </ProForm>
    </Modal>
  );
};

export default DefineInfo;
