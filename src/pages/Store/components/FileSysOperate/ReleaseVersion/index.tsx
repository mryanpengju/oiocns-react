import React, { useMemo, useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { kernel } from '@/ts/base';
import userCtrl from '@/ts/controller/setting';
import { FileItemShare } from '@/ts/base/model';
import { XTarget } from '@/ts/base/schema';
import { IFileSystemItem } from '@/ts/core';

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
    const all =
      userCtrl.user?.joinedCompany?.map((item) => {
        return item.target;
      }) || [];

    const currentOri = all.map((item) => {
      return {
        value: item.id,
        label: item.name,
        ...item,
      };
    });
    setCurrentOriMes(currentOri);
    form.setFieldsValue({
      publisher: userCtrl.user.name,
    });
  }, []);
  return (
    <Modal
      destroyOnClose
      title={title}
      open={open}
      onOk={async () => {
        const currentValue: AppInformation = await form.validateFields();
        delete currentValue?.publishOrganize;
        currentValue.id = 'snowId()';
        currentValue.pubTeam = currentSelect || {};
        currentValue.pubAuthor = currentSelect || {};
        currentValue.platform = 'Android';
        currentValue.pubTime = 'sysdate()';
        const currentData = {
          ...currentValue,
          ...currentTaget.shareInfo(),
        };
        console.log('currentData', currentData);
        const result = await kernel.anystore.set(
          'version',
          {
            operation: 'replaceAll',
            data: { versionMes: [currentData] },
          },
          'all',
        );
        if (result.success) {
          message.success('发布成功');
          onChange(false);
          return;
        }
      }}
      onCancel={() => {
        onChange(false);
      }}>
      {open && (
        <Form layout="vertical" form={form}>
          <Form.Item
            label="应用名称"
            name="appName"
            required
            rules={[{ required: true, message: ' 请输入应用名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="发布者"
            name="publisher"
            required
            rules={[{ required: true, message: ' 请输入发布者' }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="发布组织"
            name="publishOrganize"
            required
            rules={[{ required: true, message: ' 请选择发布组织' }]}>
            <Select
              options={currentOriMes}
              onSelect={(e, value) => {
                setCurrentSelect(value);
              }}
            />
          </Form.Item>
          <Form.Item
            label="版本号"
            name="version"
            required
            rules={[{ required: true, message: ' 请输入版本号' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="版本信息"
            name="remark"
            required
            rules={[{ required: true, message: ' 请输入版本信息' }]}>
            <TextArea />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};
export default CopyOrMoveModal;
