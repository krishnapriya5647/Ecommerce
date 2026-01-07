from django.db import models
from django.contrib.auth.models import User
from catalog.models import Product

class Order(models.Model):
    STATUS = (
        ("PENDING", "PENDING"),
        ("PAID", "PAID"),
        ("CANCELLED", "CANCELLED"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    status = models.CharField(max_length=20, choices=STATUS, default="PENDING")

    full_name = models.CharField(max_length=120)
    phone = models.CharField(max_length=30)
    address_line1 = models.CharField(max_length=200)
    city = models.CharField(max_length=80)
    pincode = models.CharField(max_length=10)

    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    price_snapshot = models.DecimalField(max_digits=10, decimal_places=2)
