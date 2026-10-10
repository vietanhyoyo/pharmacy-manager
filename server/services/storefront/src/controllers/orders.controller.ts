import { Body, Controller, Post } from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CheckoutRequest } from '../requests/checkout.request';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post() checkout(@Body() input: CheckoutRequest) { return this.orders.checkout(input); }
}
