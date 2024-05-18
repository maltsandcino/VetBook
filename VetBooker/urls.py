from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("accounts/login/", views.login_view, name="login_decorator"),
    path("register", views.register, name="register"),
    path("book", views.book, name="book"),
    path("manage", views.manage, name="manage"),
    path("appointment/<str:booking_id>", views.view_specific_booking, name="view_specific_booking"),
    path("schedule", views.schedule, name="schedule"),
    path("clientAppointments", views.appointments, name="appointments"),
    path("petAppointments/<str:pet_id>", views.pet_appointments, name="pet_appointments"),
    path("approval", views.account_approval, name="account_approval"),


    # API ROUTING
   
    path("clientsearch", views.c_search, name="csearch"),
    path("petremoval", views.pet_removal, name="pet_removal"),
    path("clientedit", views.client_edit, name="clientedit"),
    path("petSearch", views.pet_search, name="pets_search"),
    path("addOwner", views.add_owner, name="add_owner"),
    path("doctorSearch", views.get_doctors, name="get_doctors"),
    path("getAvailableTimes", views.get_avails, name="get_avails"),
    path("customTimes", views.custom_times, name="custom_times"),
    path("addappointment", views.add_booking, name="add_booking"),
    path("generateAppointments", views.generate_appointments, name="generate_appointments"),
    path("addPet", views.add_pet, name="add_pet"),
    path("addCustomer", views.add_customer, name="add_customer"),
    
       
]