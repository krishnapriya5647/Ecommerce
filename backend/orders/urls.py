from django.urls import path
from .views import MyOrders, Checkout

urlpatterns = [
    path("orders/", MyOrders.as_view(), name="my-orders"),     # /api/orders/
    path("checkout/", Checkout.as_view(), name="checkout"),    # /api/checkout/
]
