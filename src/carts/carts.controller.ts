import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CartsService } from './carts.service';
import { AddItemDto, CreateCartDto, DecreaseItemDto, MergeCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Request } from 'express';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) { }

  @Post('/get-cart')
  @UseGuards(AuthGuard)
  create(@Body() createCartDto: CreateCartDto, @Req() req: Request) {
    const user = req['user']; // Access the user info attached by AuthGuard
    console.log("User info from token:", user);
    return this.cartsService.create(createCartDto, user.sub);
  }

  @Post('/add-item')
  @UseGuards(AuthGuard)
  addItemToCart(@Body() addItemDto: AddItemDto, @Req() req: Request) {
    const user = req['user']; // Access the user info attached by AuthGuard
    return this.cartsService.addItemToCart(addItemDto, user.sub);
  }

  @Post('/decrease-item')
  @UseGuards(AuthGuard)
  decreaseItemQuantity(@Body() decreaseItemDto: DecreaseItemDto, @Req() req: Request) {
    const user = req['user']; // Access the user info attached by AuthGuard
    return this.cartsService.decreaseItemQuantity(decreaseItemDto, user.sub);
  }

  @Post('/merge-cart')
  @UseGuards(AuthGuard)
  mergeCart(@Body() mergeCartDto: MergeCartDto[], @Req() req: Request) {
    const user = req['user']; // Access the user info attached by AuthGuard
    return this.cartsService.mergeCart(mergeCartDto, user.sub);
  }

  // @Post('/remove-item')
  // // @UseGuards(AuthGuard)
  // removeItemFromCart() {

  //   return this.cartsService.removeItemFromCart(89, 8);
  // }

}
