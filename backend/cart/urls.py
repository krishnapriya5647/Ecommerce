from django.urls import path
from .views import CartMe, CartAddItem, CartUpdateItem, CartDeleteItem

urlpatterns = [
    path("", CartMe.as_view(), name="cart-me"),  # /api/cart/
    path("items/add/", CartAddItem.as_view(), name="cart-add-item"),
    path("items/<int:item_id>/", CartUpdateItem.as_view(), name="cart-update-item"),
    path("items/<int:item_id>/delete/", CartDeleteItem.as_view(), name="cart-delete-item"),
]
