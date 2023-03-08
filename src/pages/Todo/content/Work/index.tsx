import OioForm from '@/pages/Setting/components/render';
import { XOperation } from '@/ts/base/schema';
import { SaveOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import React, { useState } from 'react';
import cls from './index.module.less';

// 卡片渲染
interface IProps {
  operations: XOperation[];
}
/**
 * 办事-订单
 * @returns
 */
const Work: React.FC<IProps> = ({ operations }) => {
  const [data, setData] = useState<any>({});

  const submit = () => {
    console.log('data', data);
  };
  return (
    <>
      {operations.length > 0 && (
        <>
          {operations.map((operation) => (
            <Card key={operation.id} title={operation?.name}>
              <OioForm
                operation={operation}
                onValuesChange={(changedValues, values) => {
                  data[operation.id] = values;
                  setData(data);
                }}
              />
            </Card>
          ))}
          <Button
            icon={<SaveOutlined />}
            type="primary"
            className={cls['bootom_right']}
            onClick={() => submit()}>
            提交
          </Button>
        </>
      )}
    </>
  );
};

export default Work;
