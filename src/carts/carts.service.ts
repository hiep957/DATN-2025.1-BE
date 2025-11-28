import { BadRequestException, Injectable } from '@nestjs/common';
import { AddItemDto, CreateCartDto, DecreaseItemDto, MergeCartDto } from './dto/create-cart.dto';
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
  async create(createCartDto: CreateCartDto, userId: number) {
    const existingCart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'items', 'items.variant'],
    })
    console.log("Existing cart:", existingCart);
    if (!existingCart) {
      console.log("Bạn chưa tạo cart, tạo mới cho bạn")
      const newCart = this.cartRepo.create({
        user: { id: userId },
        items: [],
      })
      const cartServed = await this.cartRepo.save(newCart);
      return this.toClient(cartServed);
    }
    console.log("Bạn đã có cart, trả về cho bạn")
    return this.toClient(existingCart);
  }

  async addItemToCart(addItemDto: AddItemDto, userId: number) {
    const cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'items', 'items.variant'],
    });
    if (!cart) {
      throw new BadRequestException('Cart not found for user');
    }
    // Logic to add item to cart
    const existingItem = cart.items?.find(item => item.variant.id === addItemDto.variantId);
    if (existingItem) {
      existingItem.quantity += addItemDto.quantity;
      await this.cartRepo.save(cart);
      return this.toClient(cart);
    }
    const variant = await this.variantRepo.findOne({ where: { id: addItemDto.variantId } });
    if (!variant) {
      throw new BadRequestException('Variant not found');
    }
    if(variant.quantity < addItemDto.quantity){
      throw new BadRequestException('Số lượng sản phẩm trong kho không đủ');
    }
    cart.items = cart.items || [];
    const newItem = this.cartItemRepo.create({
      variant,
      quantity: addItemDto.quantity,
      cart,
      productId: addItemDto.productId,
      productName: addItemDto.productName,
      productImage: addItemDto.productImage,
    });
    cart.items.push(newItem);
    await this.cartRepo.save(cart);
    return this.toClient(cart);
  }

  async decreaseItemQuantity(decreaseItemDto: DecreaseItemDto, userId: number) {
    console.log("Decrease item called with:", decreaseItemDto, "for user:", userId);
    const cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
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
      throw new BadRequestException('Item not found in cart');
    }
    if (cartItem.quantity < decreaseItemDto.quantity) {
      throw new BadRequestException('Bạn không thể giảm số lượng sản phẩm nhỏ hơn 0');
    }
    if (cartItem.quantity === 1) {
      await this.cartItemRepo.remove(cartItem);
    }
    else if (cartItem.quantity > decreaseItemDto.quantity) {
      cartItem.quantity = cartItem.quantity - decreaseItemDto.quantity;
      await this.cartItemRepo.save(cartItem);
    }
    const cartServed = await this.cartRepo.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.variant'],
    });
    console.log("Cart after decreasing item quantity:", cartServed);
    return this.toClient(cartServed ?? cart);
  }


  async mergeCart(mergeCartDto: MergeCartDto[], userId: number) {
    const cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'items', 'items.variant'],
    });
    console.log("Cart found for user:", cart);
    if (!cart) {
      throw new BadRequestException('Cart not found for user');
    }
    for (const itemDto of mergeCartDto) {
      const existingItem = cart.items?.find(item => item.variant.id === itemDto.variantId);
      if (existingItem) {
        existingItem.quantity += itemDto.quantity;
      }
      else {
        const variant = await this.variantRepo.findOne({ where: { id: itemDto.variantId } });
        if (variant) {
          const newItem = this.cartItemRepo.create({
            variant,
            quantity: itemDto.quantity,
            cart,
            productId: itemDto.productId,
            productName: itemDto.productName,
            productImage: itemDto.productImage,
          });
          cart.items = cart.items || [];
          cart.items.push(newItem);
        }
      }
    }
    const cartServed = await this.cartRepo.save(cart);
    return this.toClient(cartServed);
  }

  async removeItemFromCart(variantId: number, userId: number) {
    console.log("đi xoá cartItem")
    const cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'items', 'items.variant'],
    });
    if (!cart) {
      throw new BadRequestException('Cart not found for user');
    }
    const itemIndex = cart.items?.findIndex(item => item.variant.id === variantId);
    if (itemIndex === undefined || itemIndex < 0) {
      throw new BadRequestException('Item not found in cart');
    }
    cart.items?.splice(itemIndex, 1);
    const cartServed = await this.cartRepo.save(cart);
    return this.toClient(cartServed);
  }

  toClient(cart: Cart) {
    return {
      items: cart.items?.map(item => ({
        id: item.id,
        variant: item.variant,
        quantity: item.quantity,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
      })) ?? [],
    };
  }
}
