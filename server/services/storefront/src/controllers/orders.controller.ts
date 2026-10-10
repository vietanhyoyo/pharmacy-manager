import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CheckoutRequest } from '../requests/checkout.request';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get('track') track(@Query('number') number: string, @Query('phone') phone: string) { return this.orders.track(number, phone); }

  @Post() checkout(@Body() input: CheckoutRequest) { return this.orders.checkout(input); }
}
