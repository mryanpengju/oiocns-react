import { TodoType } from '../enum';
import { model } from '../../base';

/** 待办组 */
export interface ITodoGroup {
  /**@type 待办类型 */
  type: TodoType;
  /** 待办名称 */
  name: string;
  /**@count  待办数量*/
  getCount(): Promise<number>;
  /**@desc 获取待办列表 */
  getTodoList(refresh: boolean): Promise<IApprovalItem[]>;
  /**@desc 获取待抄送待阅列表 */
  getNoticeList(refresh: boolean): Promise<IApprovalItem[]>;
  /**@desc 获取已办列表 */
  getDoList(page: model.PageRequest): Promise<IApprovalItem[]>;
  /**@desc 获取申请列表 */
  getApplyList(page: model.PageRequest): Promise<IApplyItem[]>;
}

/** 待办/已办项 */
export interface IApprovalItem {
  /** 获得审批内容 */
  Data: any;
  /**@pass 通过 */
  pass(status: number, remark: string): Promise<model.ResultType<any>>;
  /**@reject 拒绝 */
  reject(status: number, remark: string): Promise<model.ResultType<any>>;
}
/** 申请项 */
export interface IApplyItem {
  /** 获得审批内容 */
  Data: any;
  /**@cancel 取消 */
  cancel(status: number, remark: string): Promise<model.ResultType<any>>;
}

export interface IOrderApplyItem extends IApplyItem {
  /**
   * 取消订单详情项
   * @param status 状态
   * @param remark 备注
   */
  cancelItem(status: number, remark: string): Promise<model.ResultType<any>>;
}
