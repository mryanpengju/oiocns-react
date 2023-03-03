import React from 'react';
import { Card, Descriptions } from 'antd';
import { ITarget } from '@/ts/core';
import cls from '../Agency/index.module.less';
import userCtrl from '@/ts/controller/setting';

/**
 * @description: 职权信息内容
 * @return {*}
 */
const Description = (props: { title: any; current: ITarget; extra: any }) => {
  const { title, current, extra } = props;
  console.log('current', current);
  const authority: any = current['_authority'];
  return (
    <Card bordered={false} className={cls['company-dept-content']}>
      <Descriptions
        size="middle"
        title={title}
        extra={extra}
        bordered
        column={3}
        labelStyle={{
          textAlign: 'left',
          color: '#606266',
          width: 120,
        }}
        contentStyle={{ textAlign: 'left', color: '#606266' }}>
        <Descriptions.Item label="职权名称">{authority.name}</Descriptions.Item>
        <Descriptions.Item label="职权编码">{authority.code || ''}</Descriptions.Item>
        <Descriptions.Item label="创建人">
          {userCtrl.findTeamInfoById(authority.createUser).name}
        </Descriptions.Item>
        <Descriptions.Item label="创建时间">
          {authority?.createTime || ''}
        </Descriptions.Item>
        <Descriptions.Item label="备注" span={3}>
          {authority?.remark}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};
export default Description;
