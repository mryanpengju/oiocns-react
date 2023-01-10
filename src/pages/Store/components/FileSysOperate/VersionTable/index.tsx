import CardOrTable from '@/components/CardOrTableComp';
import React, { useMemo, useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { kernel } from '@/ts/base';
import userCtrl from '@/ts/controller/setting';
import { FileItemShare } from '@/ts/base/model';
import { XTarget } from '@/ts/base/schema';
import { IFileSystemItem } from '@/ts/core';
import { VersionColumns } from './config';

const { TextArea } = Input;

export type AppInformation = {
  id: 'snowId()';
  appName: string;
  platform: string;
  pubTime: 'sysdate()';
  version: string;
  pubTeam: XTarget;
  pubAuthor: XTarget;
  remark: string;
} & FileItemShare;

/** 移动或复制复选框 */
const CopyOrMoveModal = (props: {
  open: boolean;
  title: string; // 弹出框名称
  currentTaget: IFileSystemItem; // 需要操作的文件
  onChange: (val: boolean) => void;
}) => {
  const { open, title, onChange, currentTaget } = props;
  const [form] = Form.useForm();
  const [currentSelect, setCurrentSelect] = useState<AppInformation>();
  const [currentOriMes, setCurrentOriMes] = useState<{ label: string; value: string }[]>(
    [],
  );

  const getinitData = async () => {
    const getValue = await kernel.anystore.get('version', 'all');
    console.log('getValue', getValue);
  };
  useEffect(() => {
    getinitData();
  }, []);
  return (
    <Modal
      destroyOnClose
      title={title}
      open={open}
      width="1400px"
      onOk={() => {}}
      onCancel={() => {
        onChange(false);
      }}>
      {open && (
        <CardOrTable
          rowKey={'id'}
          // params={tkey}
          request={async (page) => {
            const currentData: { data: { versionMes: [] } } = await kernel.anystore.get(
              'version',
              'all',
            );
            console.log('currentData', currentData?.data.versionMes);
            return {
              result: currentData?.data.versionMes || [],
              limit: 10,
              offset: 10,
              total: currentData?.data.versionMes.length,
            };
          }}
          // operation={renderAttrItemOperate}
          columns={VersionColumns}
          showChangeBtn={false}
          dataSource={[]}
        />
      )}
    </Modal>
  );
};
export default CopyOrMoveModal;
