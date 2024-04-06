from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterAPIView.as_view()),
    path('login/', views.LoginAPIView.as_view()),
    path('password-change/', views.ChangePasswordView.as_view()),
    path('profile/', views.ProfileView.as_view()),

    path('services/<int:business_id>/', views.ServicesView.as_view()),
    path('service/<int:business_id>/<int:service_id>/', views.ServiceView.as_view()),

    path('providers/<int:business_id>/', views.ProvidersView.as_view()),
    path('provider/<int:business_id>/<int:provider_id>/', views.ProviderView.as_view()),

    path('bookings/', views.BookingsView.as_view()),
    path('booking/<int:business_id>/', views.BookingView.as_view()),

    path('availability/<int:business_id>/', views.AvailabilityView.as_view()),

    path('review/<int:booking_id>/', views.ReviewView.as_view()),
]
