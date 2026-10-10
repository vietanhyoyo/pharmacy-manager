import { getOrder, getOrderBranches, getOrders } from '@/lib/api/orders.api';
import type { OrderListQuery } from '@/lib/api/req/orders.req';
import type { OrderBranch, OrderDetail, OrderPage } from '@/lib/api/res/orders.res';
import { LocalApiState } from './local-api-state';

export const ordersApiState = new LocalApiState<OrderPage, OrderListQuery>(getOrders, query => JSON.stringify(query));
export const orderBranchesApiState = new LocalApiState<OrderBranch[], undefined>(() => getOrderBranches(), () => 'branches');
export const orderDetailApiState = new LocalApiState<OrderDetail, string>(getOrder, id => id);
