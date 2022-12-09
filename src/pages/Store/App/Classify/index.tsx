import { Form, Input, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
// import { useHistory } from 'react-router-dom';
import SearchSjopComp from '@/bizcomponents/SearchShop';
import cls from './index.module.less';
import StoreClassifyTree from '@/components/CustomTreeComp';
import AppDetail from '@/components/AppDetail'; // 新建商店
import { getUuid, findAimObj } from '@/utils/tools';

import ReactDOM from 'react-dom';
import SelfAppCtrl, {
  TreeType,
  MenuOptTypes,
  SelfCallBackTypes,
} from '@/ts/controller/store/selfAppCtrl';

let selectMenuInfo: any = {},
  modalType = '';
const { confirm } = Modal;
//自定义树
const StoreClassify: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  // const [open, setOpen] = useState<boolean>(false);
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(false); // 新建商店弹窗
  const [isAppDetailOpen, setisAppDetailOpen] = useState<boolean>(false); // 新建商店弹窗
  const [customMenu, setCustomMenu] = useState<TreeType[]>([]);
  const [newMenuForm] = Form.useForm();

  useEffect(() => {
    const id = SelfAppCtrl.subscribePart(SelfCallBackTypes.CustomMenu, () => {
      console.log('监听,tree变化', SelfAppCtrl.customMenu || []);
      const arr = SelfAppCtrl.customMenu || [];
      setCustomMenu([...arr]);
    });
    return () => {
      return SelfAppCtrl.unsubscribe(id);
    };
  }, []);

  /*******
   * @desc:新增 自定义目录
   */
  const newMenuFormSubmit = async () => {
    let { title } = await newMenuForm.validateFields();
    let obj: any = findAimObj(false, selectMenuInfo.id, customMenu);
    if (modalType === '新增子级') {
      let newObj = {
        id: getUuid(),
        key: `${selectMenuInfo?.key}-${selectMenuInfo?.children?.length || '01'}`,
        title: title,
        children: [],
      };
      obj.children.push(newObj);
    } else if (modalType === '重命名') {
      obj.title = title;
    }

    setIsStoreOpen(false);
    // 数据缓存
    SelfAppCtrl.cacheSelfMenu(customMenu);
  };

  /*******
   * @desc: 删除一个自定义目录
   * @param {string} name
   * @param {string} id
   */
  const handleMenuChagnge = (name: string, id: string, type: string) => {
    confirm({
      content: `确认${type}目录《 ${name} 》?`,
      onOk() {
        _updataMenuData(id, type);
      },
      onCancel() {},
    });
  };
  function _updataMenuData(id: string, type: string) {
    switch (type) {
      case '删除':
        {
          const obj = findAimObj(true, id, customMenu);
          const newData = obj.children.filter((v: any) => {
            return v.id !== id;
          });
          obj.children = newData;
        }
        break;
      case '重命名':
        {
          const obj = findAimObj(false, id, customMenu);
          obj.title = '修改名称';
        }
        break;

      default:
        break;
    }
    SelfAppCtrl.cacheSelfMenu(customMenu);
  }
  const onCancel = () => {
    setIsStoreOpen(false);
    setisAppDetailOpen(false);
  };

  /*******
   * @desc: 目录更多操作 触发事件
   * @param {'新增子级','重命名', '创建副本', '拷贝链接', '移动到', '固定到常用', '删除'} key
   * @param {object} param1
   * @return {*}
   */
  const handleMenuClick = (key: string | MenuOptTypes, data: any) => {
    console.log('目录更多操作', key, data);
    selectMenuInfo = data;
    modalType = key;
    switch (key) {
      case '新增子级':
        newMenuForm.setFieldValue('title', '');
        setIsStoreOpen(true);
        break;
      case '重命名':
        setIsStoreOpen(true);
        newMenuForm.setFieldValue('title', data.title);
        break;
      case '删除':
        handleMenuChagnge(data.title, data.id, '删除');
        break;
      case '创建副本':
        //TODO: 复制当前对象 遍历修改所有id
        // handleMenuChagnge(data.title, data.id, '创建副本');
        break;

      default:
        break;
    }
  };
  /*******
   * @desc: 点击目录 触发事件
   * @param {any} item
   * @return {*}
   */
  const handleTitleClick = (item: TreeType) => {
    // 触发内容去变化
    console.log('点击', item);
    SelfAppCtrl.curMenuKey = item.key || item.id;
  };
  const domNode = document.getElementById('templateMenu');
  if (!domNode) return null;
  return ReactDOM.createPortal(
    <>
      {customMenu && (
        <>
          <div className={cls.container}>
            <StoreClassifyTree
              title={'我的分类'}
              menu={SelfAppCtrl.MenuOpts}
              searchable
              isDirectoryTree
              treeData={customMenu}
              handleTitleClick={handleTitleClick}
              handleMenuClick={handleMenuClick}
            />
          </div>
          <Modal
            title="搜索商店"
            width={670}
            destroyOnClose={true}
            open={showModal}
            bodyStyle={{ padding: 0 }}
            okText="确定加入"
            onOk={() => {
              console.log(`确定按钮`);
              setShowModal(false);
            }}
            onCancel={() => {
              console.log(`取消按钮`);
              setShowModal(false);
            }}>
            <SearchSjopComp />
          </Modal>
          <Modal
            title={modalType}
            width={670}
            destroyOnClose={true}
            open={isStoreOpen}
            okText="确定"
            onOk={() => {
              console.log(`确定按钮`);
              newMenuFormSubmit();
            }}
            onCancel={() => {
              console.log(`取消按钮`);
              setIsStoreOpen(false);
            }}>
            <Form form={newMenuForm} autoComplete="off">
              <Form.Item
                name="title"
                rules={[{ required: true, message: '请填写目录名称' }]}>
                <Input placeholder="请填写目录名称" />
              </Form.Item>
            </Form>
          </Modal>
          <AppDetail open={isAppDetailOpen} onCancel={onCancel} />
        </>
      )}
    </>,
    domNode,
  );
};

export default StoreClassify;