from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.permissions import AllowAny

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class CategoryViewSet(ReadOnlyModelViewSet):
    queryset = Category.objects.all().order_by("id")
    serializer_class = CategorySerializer
    authentication_classes = []          # ✅ public
    permission_classes = [AllowAny]      # ✅ public


class ProductViewSet(ReadOnlyModelViewSet):
    queryset = Product.objects.all().order_by("id")
    serializer_class = ProductSerializer
    authentication_classes = []          # ✅ public
    permission_classes = [AllowAny]      # ✅ public


