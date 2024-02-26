from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from .models import User
import calendar

# Create your views here.

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "VetBooker/login.html", {
                "message": "Invalid username and/or password. Please re-enter your details, or contact your systems administrator"
            })
    else:
        return render(request, "VetBooker/login.html")

def logout_view(request):

    if request.user.is_authenticated:
        logout(request)
    return HttpResponseRedirect(reverse("index"))

###Only superusers may create other users in the system via the register page.
def register(request):
    if request.user.is_superuser:
        if request.method == "POST":
            username = request.POST["username"]
            email = request.POST["email"]

            # Ensure password matches confirmation
            password = request.POST["password"]
            confirmation = request.POST["confirmation"]
            if password != confirmation:
                return render(request, "VetBooker/register.html", {
                    "message": "Passwords must match."
                })

            # New user is created, and handled if the username already exists
            try:
                user = User.objects.create_user(username, email, password)
                user.save()
            except IntegrityError:
                return render(request, "VetBooker/register.html", {
                    "message": "Username already taken."
                })
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "VetBooker/register.html")
    else:
            return HttpResponseRedirect(reverse("index"))

def index(request):

    ## For booking, get total time of appointments booked per day. If time does not exeed a vets total working time (ie. 8 hours) then make the day have availability.
    # yy = 2024
    # mm = 2
    # cal = calendar.HTMLCalendar(firstweekday = 0)
    # cal.cssclasses = ["mon text-bold", "tue", "wed", "thu", "fri", "sat", "sun red"]
    # print(cal.formatmonth(yy, mm, withyear=True))

    return render(request, "VetBooker/index.html", {'message': f"Welcome, {request.user.username}."})

def book(request):
    if request.method == "POST":
        return render(request, "VetBooker/book.html")
    else:

        return render(request, "VetBooker/book.html")

def manage(request):
    if request.method == "POST":
        return render(request, "VetBooker/manage.html")
    else:
        
        return render(request, "VetBooker/manage.html")
