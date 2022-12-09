import React, { useState } from 'react';
import SetUpTree from './SetUpTree';
import { ITarget } from '@/ts/core';

/**
 * 标准设置
 * @returns
 */

const SettingStandard: React.FC = () => {
  const [current, setCurrent] = useState<ITarget>();

  /**点击操作内容触发的事件 */
  const handleMenuClick = (key: string, item: ITarget | undefined) => {
    // switch (key) {
    //   case 'new':
    //     setEdit(undefined);
    //     setCreateOrEdit('新增');
    //     setActiveModal('edit');
    //     break;
    //   case '新增部门':
    //     if (!item) return;
    //     setEdit(item);
    //     setCreateOrEdit('新增');
    //     setActiveModal('edit');
    //     break;
    //   case 'changeDept': //变更部门
    //     setActiveModal('transfer');
    //     break;
    //   case 'updateDept': // 编辑部门
    //     if (!item) return;
    //     setCreateOrEdit('编辑');
    //     setEdit(item);
    //     setActiveModal('edit');
    //     break;
    //   case '删除部门':
    //     if (!item) return;
    //     Modal.confirm({
    //       title: '提示',
    //       icon: <ExclamationCircleOutlined />,
    //       content: `是否确定删除${item.target.name}?`,
    //       okText: '确认',
    //       cancelText: '取消',
    //       onOk: async () => {
    //         const idelete = item as unknown as ICanDelete;
    //         if (idelete && (await idelete.delete())) {
    //           message.success(`删除${item.target.name}成功!`);
    //           userCtrl.changCallback();
    //         } else {
    //           message.error(`删除${item.target.name}失败!`);
    //         }
    //       },
    //     });
    // }
  };
  return (
    <div>
      <SetUpTree
        current={current}
        handleMenuClick={handleMenuClick}
        setCurrent={(item) => setCurrent(item)}
      />
      <div>aaaaa</div>
    </div>
  );
};

export default SettingStandard;
