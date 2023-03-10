import React, { useEffect, useState } from 'react';
import { SettingOutlined, UserOutlined } from '@ant-design/icons';
import {
  Row,
  Button,
  Divider,
  Col,
  Radio,
  Space,
  Form,
  InputNumber,
  Modal,
  Tag,
} from 'antd';
import CardOrTable from '@/components/CardOrTableComp';
import IndentitySelect from '@/bizcomponents/IndentityManage';
import cls from './index.module.less';
import { NodeType } from '../../processType';
import userCtrl from '@/ts/controller/setting';
import { ISpeciesItem } from '@/ts/core';
import { XOperation } from '@/ts/base/schema';
import { OperationColumns } from '@/pages/Setting/config/columns';
interface IProps {
  current: NodeType;
  orgId?: string;
  species?: ISpeciesItem;
}

/**
 * @description: 审批对象
 * @return {*}
 */

const ApprovalNode: React.FC<IProps> = (props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false); // 打开弹窗
  const [radioValue, setRadioValue] = useState(1);
  const [operations, setOperations] = useState<XOperation[]>([]);
  const [operationIds, setOperationIds] = useState<string[]>([]);
  const [operationModal, setOperationModal] = useState<any>();
  // 操作内容渲染函数
  const renderOperate = (item: XOperation) => {
    return [
      {
        key: 'bind',
        label: '绑定',
        onClick: async () => {
          if (!operationIds.includes(item.id)) {
            props.current.props.operationIds = [...operationIds, item.id];
            setOperationIds([...operationIds, item.id]);
          }
          setOperationModal(undefined);
        },
      },
    ];
  };
  useEffect(() => {
    setOperationIds(props.current.props.operationIds || []);
    const loadOperations = async () => {
      if (userCtrl.space.id && props.species) {
        let xOperationArray = await props.species.loadOperations(
          userCtrl.space.id,
          false,
          true,
          true,
          {
            offset: 0,
            limit: 1000,
            filter: '',
          },
        );
        setOperations(xOperationArray.result || []);
      }
    };
    loadOperations();
  }, []);

  useEffect(() => {
    // 加载业务表单列表
    if (props.current.props.num && props.current.props.num != 0) {
      setRadioValue(2);
    }
  }, [props.current]);

  // const [processValue, setProcessValue] = useState(1);
  const [nodeOperateOrgId, setNodeOperateOrgId] = useState<string>(
    props.current.belongId || props.orgId || userCtrl.space.id,
  );
  const [currentData, setCurrentData] = useState({
    title: '',
    key: '',
    data: { id: '', name: '' },
  });
  // const onChange = (newValue: string) => {
  //   setNodeOperateOrgId(newValue);
  //   props.current.belongId = newValue;
  // };

  useEffect(() => {
    if (!props.current.belongId) {
      setNodeOperateOrgId(props.orgId || userCtrl.space.id);
      props.current.belongId = props.orgId;
    }
  });

  return (
    <div className={cls[`app-roval-node`]}>
      <div className={cls[`roval-node`]}>
        <Row style={{ marginBottom: '10px' }}>
          <SettingOutlined style={{ marginTop: '3px' }} />
          <span className={cls[`roval-node-title`]}>选择审批对象</span>
        </Row>
        <Space>
          <Button
            type="primary"
            shape="round"
            size="small"
            onClick={() => {
              props.current.props.assignedType = 'JOB';
              setIsOpen(true);
            }}>
            选择身份
          </Button>
          {currentData?.title ? (
            <span>
              当前选择：<a>{currentData?.title}</a>
            </span>
          ) : null}
        </Space>
        <Divider />
        <div className={cls['roval-node-select']}>
          <Col className={cls['roval-node-select-col']}>👩‍👦‍👦 审批方式</Col>
          <Radio.Group
            onChange={(e) => {
              if (e.target.value == 1) {
                props.current.props.num = 0;
              } else {
                props.current.props.num = 1;
              }

              setRadioValue(e.target.value);
            }}
            style={{ paddingBottom: '10px' }}
            value={radioValue}>
            <Radio value={1} style={{ width: '100%' }}>
              全部: 需征得该身份下所有人员同意
            </Radio>
            <Radio value={2}>部分会签: 指定审批该节点的人员的数量</Radio>
          </Radio.Group>
          {radioValue === 2 && (
            <Form.Item label="会签人数">
              <InputNumber
                min={1}
                onChange={(e: number | null) => {
                  props.current.props.num = e;
                }}
                value={props.current.props.num}
                placeholder="请设置会签人数"
                addonBefore={<UserOutlined />}
                style={{ width: '60%' }}
              />
            </Form.Item>
          )}
        </div>
      </div>
      <Divider />
      <div style={{ marginBottom: '10px' }}>
        <Button
          type="primary"
          shape="round"
          size="small"
          onClick={() => {
            setOperationModal('');
          }}>
          绑定表单
        </Button>
      </div>
      <div>
        {operationIds && operationIds.length > 0 && (
          <span>
            已绑定表单：{' '}
            <Space size={[0, 10]} wrap>
              {operationIds.map((item) => {
                return (
                  <Tag
                    key={item}
                    closable
                    onClose={() => {
                      let tags = operationIds.filter((id: string) => id !== item);
                      props.current.props.operationIds = tags;
                      setOperationIds(tags);
                    }}>
                    {operations.filter((op) => op.id == item)[0]?.name}
                  </Tag>
                );
              })}
            </Space>
          </span>
        )}
        <Modal
          title={'绑定业务'}
          footer={[]}
          open={operationModal != undefined}
          onCancel={() => setOperationModal(undefined)}
          width={'60%'}>
          <CardOrTable<XOperation>
            rowKey={'id'}
            columns={OperationColumns}
            showChangeBtn={false}
            operation={renderOperate}
            dataSource={operations}
          />
        </Modal>
      </div>
      <Modal
        width="650px"
        title="添加身份"
        open={isOpen}
        destroyOnClose={true}
        onOk={() => {
          props.current.props.assignedUser = [
            { name: currentData.title, id: currentData.data.id },
          ];
          setIsOpen(false);
        }}
        onCancel={() => setIsOpen(false)}>
        <IndentitySelect
          multiple={false}
          orgId={nodeOperateOrgId}
          onChecked={(params: any) => {
            props.current.props.assignedUser = [
              { name: params.title, id: params.data.id },
            ];
            setCurrentData(params);
          }}
        />
      </Modal>
    </div>
  );
};
export default ApprovalNode;
