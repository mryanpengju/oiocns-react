import React from 'react';
import { model } from '../../../ts/base';
import { IBelong } from '@/ts/core';

import DetailForms from './detail';
import PrimaryForms from './primary';
import FormRenders from './formPreview';

import { formatDate } from '@/utils';
import { DataType } from 'typings/globelType';
import { WorkFormRulesType } from '@/ts/core/work/rules/workFormRules';

interface IWorkFormProps {
  allowEdit: boolean;
  belong: IBelong;
  nodeId: string;
  data: model.InstanceDataModel;
  ruleService?: WorkFormRulesType;
  onChanged?: (id: string, data: model.FormEditData, changedData?: DataType) => void;
}

const getNodeByNodeId = (
  id: string,
  node: model.WorkNodeModel | undefined,
): model.WorkNodeModel | undefined => {
  if (node) {
    if (id === node.id) return node;
    const find = getNodeByNodeId(id, node.children);
    if (find) return find;
    for (const subNode of node?.branches ?? []) {
      const find = getNodeByNodeId(id, subNode.children);
      if (find) return find;
    }
  }
};

/** 流程节点表单 */
const WorkForm: React.FC<IWorkFormProps> = (props) => {
  const node = getNodeByNodeId(props.nodeId, props.data.node);
  if (!node || !node?.forms || node?.forms.length < 1) return <></>;
  /** 根据需求获取数据 */
  const getFormData = (id: string): model.FormEditData => {
    const source: model.AnyThingModel[] = [];
    if (props.data.data && props.data.data[id]) {
      const beforeData = props.data.data[id];
      if (beforeData.length > 0) {
        if (!props.allowEdit) {
          const nodeData = beforeData.filter((i) => i.nodeId === node.id);
          if (nodeData && nodeData.length > 0) {
            return nodeData.slice(-1)[0];
          }
        } else {
          source.push(...beforeData.slice(-1)[0].after);
        }
      }
    }
    return {
      before: [...source],
      after: [...source],
      nodeId: node.id,
      creator: props.belong.userId,
      createTime: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss.S'),
    };
  };
  const primaryForms = node.forms.filter((f) => f.typeName === '主表');
  const detailForms = node.forms.filter((f) => f.typeName === '子表');
  return (
    <div style={{ padding: 10 }}>
      <FormRenders {...props} forms={primaryForms} getFormData={getFormData} />
      <PrimaryForms {...props} forms={primaryForms} getFormData={getFormData} />
      <DetailForms {...props} forms={detailForms} getFormData={getFormData} />
    </div>
  );
};

export default WorkForm;
