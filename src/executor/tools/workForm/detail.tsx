import { model, schema } from '../../../ts/base';
import { IBelong } from '@/ts/core';
import { useEffect, useState } from 'react';
import React from 'react';
import { Tabs } from 'antd';
import { EditModal } from '../editModal';
import GenerateThingTable from '../generate/thingTable';
import { WorkFormRulesType } from '@/ts/core/work/rules/workFormRules';
import { RuleTriggers } from '@/ts/base/model';

interface IProps {
  allowEdit: boolean;
  belong: IBelong;
  forms: schema.XForm[];
  data: model.InstanceDataModel;
  ruleService?: WorkFormRulesType;
  getFormData: (id: string) => model.FormEditData;
  onChanged?: (id: string, data: model.FormEditData) => void;
}

const DetailTable: React.FC<IProps> = (props) => {
  if (props.forms.length < 1) return <></>;
  const form = props.forms[0];
  if (!props.data.fields[form.id]) return <></>;
  const fields = props.data.fields[form.id];
  const [formData, setFormData] = useState(props.getFormData(form.id));
  const [selectKeys, setSelectKeys] = useState<string[]>([]);
  useEffect(() => {
    props.onChanged?.apply(this, [form.id, formData]);
    props.ruleService?.resloveFormRule(RuleTriggers.ThingsChanged, {
      id: form.id,
      data: formData,
    });
  }, [formData]);
  return (
    <GenerateThingTable
      fields={fields}
      height={500}
      dataIndex={'attribute'}
      columnChooser={{ enabled: true }}
      selection={
        props.allowEdit
          ? {
              mode: 'multiple',
              allowSelectAll: true,
              selectAllMode: 'allPages',
              showCheckBoxesMode: 'always',
            }
          : undefined
      }
      onSelectionChanged={(e) => setSelectKeys(e.selectedRowKeys)}
      toolbar={{
        visible: true,
        items: [
          {
            name: 'add',
            location: 'after',
            widget: 'dxButton',
            options: {
              text: '新增',
              icon: 'add',
              onClick: () => {
                EditModal.showFormEdit({
                  form: form,
                  fields: fields,
                  belong: props.belong,
                  create: true,
                  onSave: (values) => {
                    formData.after.push(values);
                    setFormData({ ...formData });
                  },
                });
              },
            },
            visible: props.allowEdit && (props.data.allowAdd || false),
          },
          {
            name: 'edit',
            location: 'after',
            widget: 'dxButton',
            options: {
              text: '变更',
              icon: 'edit',
              onClick: () => {
                EditModal.showFormEdit({
                  form: form,
                  fields: fields,
                  belong: props.belong,
                  create: false,
                  onSave: (values) => {
                    formData.after = formData.after.map((item) => {
                      if (selectKeys.includes(item.Id)) {
                        Object.keys(values).forEach((k) => {
                          item[k] = values[k];
                        });
                      }
                      return item;
                    });
                    setFormData({ ...formData });
                  },
                });
              },
            },
            visible:
              props.allowEdit && (props.data.allowEdit || false) && selectKeys.length > 0,
          },
          {
            name: 'select',
            location: 'after',
            widget: 'dxButton',
            options: {
              text: '选择',
              icon: 'bulletlist',
              onClick: () => {
                EditModal.showFormSelect({
                  form: form,
                  fields: fields,
                  belong: props.belong,
                  onSave: (values) => {
                    values.forEach((item) => {
                      if (formData.after.every((i) => i.Id !== item.Id)) {
                        formData.after.unshift(item);
                      }
                      if (formData.before.every((i) => i.Id !== item.Id)) {
                        formData.before.unshift({ ...item });
                      }
                    });
                    setFormData({ ...formData });
                  },
                });
              },
            },
            visible: props.allowEdit && (props.data.allowSelect || false),
          },
          {
            name: 'remove',
            location: 'after',
            widget: 'dxButton',
            options: {
              text: '移除',
              icon: 'remove',
              onClick: () => {
                formData.before = formData.before.filter(
                  (i) => !selectKeys.includes(i.Id),
                );
                formData.after = formData.after.filter((i) => !selectKeys.includes(i.Id));
                setSelectKeys([]);
                setFormData({ ...formData });
              },
            },
            visible: props.allowEdit && selectKeys.length > 0,
          },
          {
            name: 'columnChooserButton',
            location: 'after',
          },
          {
            name: 'searchPanel',
            location: 'after',
          },
        ],
      }}
      dataSource={formData.after}
      beforeSource={formData.before}
      hideColumns={['Creater', 'CreateTime', 'ModifiedTime']}
    />
  );
};

const DetailForms: React.FC<IProps> = (props) => {
  if (props.forms.length < 1) return <></>;
  const [activeTabKey, setActiveTabKey] = useState(props.forms[0].id);
  const loadItems = () => {
    return props.forms.map((f) => {
      return {
        key: f.id,
        label: f.name,
        children: <DetailTable {...props} forms={[f]} />,
      };
    });
  };
  return (
    <Tabs
      items={loadItems()}
      activeKey={activeTabKey}
      onChange={(key) => setActiveTabKey(key)}
    />
  );
};

export default DetailForms;
