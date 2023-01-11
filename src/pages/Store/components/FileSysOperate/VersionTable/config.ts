import { ProColumns } from '@ant-design/pro-table';

export const VersionColumns: ProColumns[] = [
  {
    title: '序号',
    valueType: 'index',
    width: 50,
  },
  {
    title: '应用名称',
    dataIndex: 'appName',
    key: 'appName',
    width: 150,
  },
  {
    title: '平台',
    dataIndex: 'platform',
    key: 'platform',
    width: 200,
  },
  {
    title: '发布者',
    width: 150,
    render: (item, record) => {
      return record.pubAuthor.name;
    },
  },
  {
    title: '发布时间',
    dataIndex: 'pubTime',
    key: 'pubTime',
    width: 150,
  },
  {
    title: '发布组织',
    width: 150,
    render: (item, record) => {
      return record.pubTeam.name;
    },
  },
  {
    title: '版本号',
    width: 150,
    render: (item, record) => {
      return record.version;
    },
  },
  {
    title: '文件名',
    dataIndex: 'name',
    key: 'name',
    width: 200,
  },
];
