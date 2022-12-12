import React, { useState, useMemo } from 'react';
import InsertButton from '@/bizcomponents/Flow/Process/InsertButton';
import cls from './index.module.less';
import { CopyOutlined, CloseOutlined } from '@ant-design/icons';
import { useAppwfConfig } from '@/bizcomponents/Flow/flow';

type ConditionNodeProps = {
  onInsertNode: Function;
  onDelNode: Function;
  onCopy: Function;
  onSelected: Function;
  config: any;
  level: any;
  [key: string]: any;
};

/**
 * 条件节点
 * @returns
 */
const ConditionNode: React.FC<ConditionNodeProps> = (props: ConditionNodeProps) => {
  const [showError, setShowError] = useState<boolean>(false);
  const design = useAppwfConfig((state: any) => state.design);
  const delNode = () => {
    props.onDelNode();
  };
  const copy = () => {
    props.onCopy();
  };
  const select = () => {
    props.onSelected();
  };
  const content = useMemo(() => {
    const conditions = props.config.conditions;
    const currentCondition = JSON.parse(
      design.remark === '备注说明' ? '{}' : design.remark,
    );
    var text = '请设置条件';
    if (conditions && conditions.length > 0) {
      text = '';
      for (let condition of conditions) {
        text +=
          condition.paramLabel +
          condition.label +
          (condition.valLabel || condition.val) +
          ' 且 ';
      }
      text = text.substring(0, text.lastIndexOf(' 且 '));
      /** 如果没有找到字段就报错 */
      // console.log('conditions', conditions);
      // console.log('currentCondition', currentCondition);
      /** conditions中的每一项 在currentCondition中都要存在 如果不存在就报错 */
      const getFindValue = conditions.find(
        (item: { paramLabel: string; paramKey: string }) => {
          const findData = currentCondition.find(
            (innItem: { label: string; value: string }) => {
              return item.paramLabel === innItem.label && innItem.value === item.paramKey;
            },
          );
          /**能找到说明是可以的 */
          return typeof findData === 'undefined';
        },
      );
      console.log('getFindValue', getFindValue);
      if (getFindValue) {
        setShowError(true);
      }
    }
    return text;
  }, [props.config]);
  const footer = (
    <div className={cls['btn']}>
      <InsertButton onInsertNode={props.onInsertNode}></InsertButton>
    </div>
  );
  const nodeHeader = (
    <div className={cls['node-body-main-header']}>
      <span className={cls['title']}>
        {props.config.name ? props.config.name : '条件' + props.level}
      </span>
      <span className={cls['option']}>
        <CopyOutlined style={{ fontSize: '12px', paddingRight: '5px' }} onClick={copy} />
        <CloseOutlined style={{ fontSize: '12px' }} onClick={delNode} />
      </span>
    </div>
  );
  const nodeContent = (
    <div className={cls['node-body-main-content']} onClick={select}>
      {!content && <span className={cls['placeholder']}>请设置条件</span>}
      {content && <span className={cls['name']}>{content}</span>}
      {showError ? (
        <p style={{ color: 'red', paddingBottom: '10px' }}>
          该条件已修改或则删除，请重新设置
        </p>
      ) : null}
    </div>
  );
  return (
    <div className={`${cls['node']} ${showError ? cls['node-error-state'] : ''}`}>
      <div className={`${cls['node-body']} ${showError ? cls['error'] : ''}`}>
        <div className={cls['node-body-main']}>
          {nodeHeader}
          {nodeContent}
        </div>
      </div>

      <div className={cls['node-footer']}>{footer}</div>
    </div>
  );
};

ConditionNode.defaultProps = {
  config: {},
  level: 1,
  size: 0,
};

export default ConditionNode;