from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from decimal import Decimal

from .models import Order, OrderItem
from .serializers import OrderSerializer
from cart.models import Cart

class MyOrders(APIView):
    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by("-id")
        return Response(OrderSerializer(orders, many=True).data)

class Checkout(APIView):
    @transaction.atomic
    def post(self, request):
        # address
        full_name = request.data.get("full_name")
        phone = request.data.get("phone")
        address_line1 = request.data.get("address_line1")
        city = request.data.get("city")
        pincode = request.data.get("pincode")

        if not all([full_name, phone, address_line1, city, pincode]):
            return Response({"detail": "All address fields are required"}, status=400)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        items = cart.items.select_related("product").all()

        if not items.exists():
            return Response({"detail": "Cart is empty"}, status=400)

        # stock check + subtotal
        subtotal = Decimal("0.00")
        for it in items:
            if it.quantity > it.product.stock:
                return Response({"detail": f"Not enough stock for {it.product.name}"}, status=400)
            subtotal += (it.price_snapshot * it.quantity)

        order = Order.objects.create(
            user=request.user,
            full_name=full_name,
            phone=phone,
            address_line1=address_line1,
            city=city,
            pincode=pincode,
            subtotal=subtotal,
            status="PENDING",
        )

        # create order items + reduce stock
        for it in items:
            OrderItem.objects.create(
                order=order,
                product=it.product,
                quantity=it.quantity,
                price_snapshot=it.price_snapshot,
            )
            it.product.stock -= it.quantity
            it.product.save()

        # clear cart
        items.delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
