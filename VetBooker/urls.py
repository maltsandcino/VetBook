from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("book", views.book, name="book"),
    path("manage", views.manage, name="manage"),


    # API ROUTING
   
    path("clientsearch", views.c_search, name="csearch"),
    path("petremoval", views.pet_removal, name="pet_removal"),
    path("clientedit", views.client_edit, name="clientedit"),
    path("petSearch", views.pet_search, name="pets_search"),
    path("addOwner", views.add_owner, name="add_owner"),
    path("doctorSearch", views.get_doctors, name="get_doctors")
   
]