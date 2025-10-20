import { Injectable } from '@nestjs/common';
import { AddItemDto, CreateCartDto, DecreaseItemDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Cart } from 'src/common/entities/cart.entity';
import { ProductVariant } from 'src/common/entities/product-variant.entity';
import { CartItem } from 'src/common/entities/cart-item.entity';

@Injectable()
export class CartsService {

  constructor(
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(ProductVariant) private variantRepo: Repository<ProductVariant>,
    @InjectRepository(CartItem) private cartItemRepo: Repository<CartItem>,
  ) { }

  //get cart or create cart if not exist
  async create(createCartDto: CreateCartDto) {
    const existingCart = await this.cartRepo.findOne({
      where: { user: { id: createCartDto.userId } },
      relations: ['user', 'items', 'items.variant'],
    })
    console.log("Existing cart:", existingCart);
    if (!existingCart) {
      console.log("Bạn chưa tạo cart, tạo mới cho bạn")
      const newCart = this.cartRepo.create({
        user: { id: createCartDto.userId },
        items: [],
      })
      return this.cartRepo.save(newCart);
    }
    console.log("Bạn đã có cart, trả về cho bạn")
    return existingCart;
  }

  async addItemToCart(addItemDto: AddItemDto) {
    const cart = await this.cartRepo.findOne({
      where: { user: { id: addItemDto.userId } },
      relations: ['user', 'items', 'items.variant'],
    });
    if (!cart) {
      throw new Error('Cart not found for user');
    }
    // Logic to add item to cart
    const existingItem = cart.items?.find(item => item.variant.id === addItemDto.variantId);
    if (existingItem) {
      existingItem.quantity += addItemDto.quantity;
      await this.cartRepo.save(cart);
      return cart;
    }
    const variant = await this.variantRepo.findOne({ where: { id: addItemDto.variantId } });
    if (!variant) {
      throw new Error('Variant not found');
    }
    cart.items = cart.items || [];
    const newItem = this.cartItemRepo.create({
      variant,
      quantity: addItemDto.quantity,
      cart,
    });
    cart.items.push(newItem);
    await this.cartRepo.save(cart);
    return cart;
  }


  async decreaseItemQuantity(decreaseItemDto: DecreaseItemDto) {
    const cart = await this.cartRepo.findOne({
      where: { user: { id: decreaseItemDto.userId } },
      relations: ['user', 'items', 'items.variant'],
    });
    if (!cart) {
      throw new Error('Cart not found for user');
    }
    const cartItem = await this.cartItemRepo.findOne({
      where: { cart: { id: cart.id }, variant: { id: decreaseItemDto.variantId } },
      relations: ['variant', 'cart'],
    });
    if (!cartItem) {
      throw new Error('Item not found in cart');
    }
    if (cartItem.quantity < decreaseItemDto.quantity) {
      throw new Error('Bạn không thể giảm số lượng sản phẩm nhỏ hơn 0');
    }
    if (cartItem.quantity === 1) {
      await this.cartItemRepo.remove(cartItem);
    }
    else if (cartItem.quantity > decreaseItemDto.quantity) {
      cartItem.quantity = cartItem.quantity - decreaseItemDto.quantity;
      await this.cartItemRepo.save(cartItem);
    }
    return cart;
  }

  findAll() {
    return `This action returns all carts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cart`;
  }

  update(id: number, updateCartDto: UpdateCartDto) {
    return `This action updates a #${id} cart`;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
}
