from django.urls import path
from .views import index

urlpatterns = [
    path('', index),
    path('login/', index),
    path('register/', index),
    path('register/admin', index),
    path('profile/', index)
]
