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
   
    # path("posts", views.new_post, name="newpost"),
   
]