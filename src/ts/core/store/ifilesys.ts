import { FileItemModel } from '../../base/model';

/** 可为空的文件系统 */
export type IObjectItem = IFileSystemItem | undefined;

/**
 * 文件系统项接口
 */
export interface IFileSystemItem {
  /** 主键,唯一 */
  key: string;
  /** 名称 */
  name: string;
  /** 是否为根路径 */
  isRoot: boolean;
  /** 拓展名 */
  extension: string;
  /** 文件系统项对应的目标 */
  target: FileItemModel;
  /** 上级文件系统项 */
  parent: IObjectItem;
  /** 下级文件系统项数组 */
  children: IFileSystemItem[];
  /**
   * 根据名称查询子文件系统项
   * @param name 名称
   */
  findByName(name: string): IObjectItem;
  /**
   * 创建文件系统项（目录）
   * @param name 文件系统项名称
   */
  create(name: string): Promise<boolean>;
  /**
   * 删除文件系统项（目录）
   */
  delete(): Promise<boolean>;
  /**
   * 重命名
   * @param name 新名称
   */
  rename(name: string): Promise<boolean>;
  /**
   * 拷贝文件系统项（目录）
   * @param {IFileSystemItem} destination 目标文件系统
   */
  copy(destination: IFileSystemItem): Promise<boolean>;
  /**
   * 移动文件系统项（目录）
   * @param {IFileSystemItem} destination 目标文件系统
   */
  move(destination: IFileSystemItem): Promise<boolean>;
  /**
   * 加载下级文件系统项数组
   * @param {boolean} reload 重新加载,默认false
   */
  loadChildren(reload: boolean): Promise<boolean>;
}