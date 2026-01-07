from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated  # ✅ add this
from django.shortcuts import get_object_or_404

from .models import Cart, CartItem
from .serializers import CartSerializer
from catalog.models import Product


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


class CartMe(APIView):
    permission_classes = [IsAuthenticated]  # ✅ protect

    def get(self, request):
        cart = get_or_create_cart(request.user)
        return Response(CartSerializer(cart).data)


class CartAddItem(APIView):
    permission_classes = [IsAuthenticated]  # ✅ protect

    def post(self, request):
        cart = get_or_create_cart(request.user)
        product_id = request.data.get("product_id")
        qty = int(request.data.get("quantity", 1))

        if not product_id:
            return Response({"detail": "product_id is required"}, status=400)

        product = get_object_or_404(Product, id=product_id, is_active=True)

        if qty <= 0:
            return Response({"detail": "Quantity must be >= 1"}, status=400)
        if qty > product.stock:
            return Response({"detail": "Not enough stock"}, status=400)

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": qty, "price_snapshot": product.price},
        )
        if not created:
            new_qty = item.quantity + qty
            if new_qty > product.stock:
                return Response({"detail": "Not enough stock"}, status=400)
            item.quantity = new_qty
            item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CartUpdateItem(APIView):
    permission_classes = [IsAuthenticated]  # ✅ protect

    def patch(self, request, item_id):
        cart = get_or_create_cart(request.user)
        item = get_object_or_404(CartItem, id=item_id, cart=cart)

        qty = int(request.data.get("quantity", item.quantity))

        if qty <= 0:
            item.delete()
            cart = get_or_create_cart(request.user)  # refresh
            return Response(CartSerializer(cart).data)

        if qty > item.product.stock:
            return Response({"detail": "Not enough stock"}, status=400)

        item.quantity = qty
        item.save()
        return Response(CartSerializer(cart).data)


class CartDeleteItem(APIView):
    permission_classes = [IsAuthenticated]  # ✅ protect

    def delete(self, request, item_id):
        cart = get_or_create_cart(request.user)
        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        item.delete()
        return Response(CartSerializer(cart).data)
