/*
 * @Author: zhangqiang 1196217890@qq.com
 * @Date: 2022-11-14 16:43:05
 * @LastEditors: zhangqiang 1196217890@qq.com
 * @LastEditTime: 2022-11-21 09:51:54
 * @FilePath: /oiocns-react/src/pages/Setting/Dept/components/EditCustomModal/index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置
 * 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 *
 */
import React, { useEffect } from 'react';
import { Modal } from 'antd';
import type { ProFormColumnsType } from '@ant-design/pro-components';
import { BetaSchemaForm } from '@ant-design/pro-components';

import cls from './index.module.less';
import positionCtrl from '@/ts/controller/position/positionCtrl';

/* 
  编辑
*/
interface Iprops {
  title: string;
  open: boolean;
  onOk: () => void;
  handleOk: () => void;
  handleCancel: () => void;
  selectId?: string;
  defaultData: any;
  // callback: Function;
}

const EditCustomModal = (props: Iprops) => {
  const { open, title, onOk, handleOk, defaultData } = props;
  useEffect(() => {}, []);

  const getColumn = (target: any): ProFormColumnsType<any>[] => {
    const columns: ProFormColumnsType<any>[] = [
      {
        title: '岗位名称',
        dataIndex: 'name',
        initialValue: target ? target.name : '',
        formItemProps: {
          rules: [
            {
              required: true,
              message: '名称为必填项',
            },
          ],
        },
        width: 'm',
      },
      {
        title: '岗位编号',
        dataIndex: 'code',
        initialValue: target ? target.code : '',
        formItemProps: {
          rules: [
            {
              required: true,
              message: '编码为必填项',
            },
          ],
        },
        width: 'm',
      },
      {
        valueType: 'divider',
      },
    ];
    return columns;
  };
  return (
    <div className={cls['edit-custom-modal']}>
      <Modal
        title={title}
        open={open}
        getContainer={false}
        width={450}
        destroyOnClose={true}
        onCancel={() => handleOk()}
        footer={null}>
        <BetaSchemaForm<any>
          shouldUpdate={false}
          layoutType="Form"
          onFinish={async (values) => {
            defaultData.name = values.name;
            defaultData.code = values.code;
            positionCtrl.updatePosttion(defaultData);
            onOk();
          }}
          columns={getColumn(defaultData)}
        />
      </Modal>
    </div>
  );
};

export default EditCustomModal;
