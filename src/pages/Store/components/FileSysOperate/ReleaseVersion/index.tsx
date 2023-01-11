import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message, UploadProps, Upload, Button } from 'antd';
import { kernel } from '@/ts/base';
import userCtrl from '@/ts/controller/setting';
import { FileItemShare } from '@/ts/base/model';
import storeCtrl from '@/ts/controller/store';
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
  const [currentSelect, setCurrentSelect] = useState<XTarget>();
  const [allVersionData, setAllVersionData] = useState<AppInformation[]>([]);
  const [currentOriMes, setCurrentOriMes] = useState<{ label: string; value: string }[]>(
    [],
  );
  const [imageUrl, setImageUrl] = useState<FileItemShare>();

  const uploadButton = (
    <div>
      <Button>上传应用图标</Button>
    </div>
  );

  const getinitData = async () => {
    const getValue: { data: { versionMes: AppInformation[] } } =
      await kernel.anystore.get('version', 'all');
    console.log('getValue', getValue);
    const originData: { publisher: string; version?: number } = {
      publisher: userCtrl.user.name,
    };
    if (getValue.data && getValue.data?.versionMes) {
      if (getValue.data?.versionMes.length === 0) {
        originData.version = 1;
      }
      setAllVersionData(getValue.data?.versionMes);
      form.setFieldsValue(originData);
    } else {
      setAllVersionData([]);
      form.setFieldsValue(originData);
    }
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
  }, [open]);

  /** 文件上传参数 */
  const uploadProps: UploadProps = {
    multiple: false,
    showUploadList: false,
    maxCount: 1,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image');
      if (!isImage) {
        message.error(`${file.name} 不是一个图片文件`);
      }
      return isImage;
    },
    async customRequest(options) {
      const file = options.file as File;
      const docDir = await storeCtrl.home?.create('图片');
      if (docDir && file) {
        const result = await docDir.upload(file.name, file);
        if (result) {
          const dataMes = result.shareInfo();
          dataMes.thumbnail = '';
          setImageUrl(dataMes);
        }
      }
    },
  };

  const originForm = () => {
    form.setFieldsValue({
      appName: '',
      publisher: '',
      publishOrganize: '',
      version: '',
      remark: '',
    });
    setImageUrl(undefined);
  };

  return (
    <Modal
      destroyOnClose
      title={title}
      open={open}
      onOk={async () => {
        const getMes = await form.getFieldsValue();
        console.log('getMes', getMes);
        const currentValue = await form.validateFields();
        delete currentValue?.publishOrganize;
        currentValue.id = 'snowId()';
        currentValue.pubTeam = currentSelect || {};
        currentValue.pubAuthor = userCtrl.user.target || {};
        currentValue.uploadName = imageUrl;
        currentValue.platform =
          currentTaget.target.extension === '.apk' ? 'Android' : 'IOS';
        currentValue.pubTime = 'sysdate()';
        const currentData = {
          ...currentValue,
          ...currentTaget.shareInfo(),
        };
        // 头部插入元素 方便查询
        allVersionData.unshift(currentData);
        const result = await kernel.anystore.set(
          'version',
          {
            operation: 'replaceAll',
            data: { versionMes: allVersionData },
          },
          'all',
        );
        if (result.success) {
          message.success('发布成功');
          onChange(false);
          originForm();
          return;
        }
      }}
      onCancel={() => {
        onChange(false);
        originForm();
      }}>
      {open && (
        <Form layout="vertical" form={form}>
          <Form.Item
            name="uploadName"
            label="应用图标"
            required
            rules={[{ required: true, message: ' 请上传应用图标' }]}>
            <Upload className="avatar-uploader" {...uploadProps}>
              {imageUrl ? (
                <div>
                  <img src={imageUrl.shareLink} alt="avatar" style={{ width: '140px' }} />
                </div>
              ) : (
                uploadButton
              )}
            </Upload>
          </Form.Item>
          {imageUrl ? (
            <a
              onClick={() => {
                setImageUrl(undefined);
                form.setFieldValue('uploadName', '');
              }}>
              删除图标
            </a>
          ) : (
            ''
          )}
          <Form.Item
            label="应用名称"
            name="appName"
            required
            rules={[{ required: true, message: ' 请输入应用名称' }]}>
            <Input
              onBlur={async () => {
                const curentData = await form.getFieldsValue();
                const findData = allVersionData.find((item) => {
                  return (
                    item.appName === curentData.appName &&
                    item.extension === currentTaget.target.extension
                  );
                });

                if (findData) {
                  form.setFieldsValue({
                    ...curentData,
                    version: Number(findData.version) + 1,
                  });
                } else {
                  form.setFieldsValue({
                    ...curentData,
                    version: 1,
                  });
                }
              }}
            />
          </Form.Item>
          <Form.Item
            label="发布者"
            name="publisher"
            required
            rules={[{ required: true, message: ' 请输入发布者' }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item label="发布组织" name="publishOrganize">
            <Select
              options={currentOriMes}
              onSelect={(e, value: any) => {
                setCurrentSelect(value);
              }}
            />
          </Form.Item>
          <Form.Item label="版本号" name="version" required>
            <Input disabled />
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
