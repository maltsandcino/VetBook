from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from .models import User, Pet, Client, Booking, Procedure, Vet
from django import forms
import calendar
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt


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

def c_search(request):
    if request.method == "POST":
        data = json.loads(request.body)
        number = data.get("number", "")

        client = Client.objects.get(telephone=number)

        if not client:
            return JsonResponse({"message": "Client not found."}, status=400)
        
        return JsonResponse(client.serialize(), status=200)
        
    else:
        return JsonResponse({"error": "POST request required."})
    
def client_edit(request):
    
    if request.method == "POST":
        data = json.loads(request.body)
        print(data)
        id_number = data.get("id", "")
        field_to_edit = data.get("field", "")
        new_value = data.get("new_value", "")
        client = Client.objects.get(id=id_number)
        print(client)
        if not client:
            pass
        else:
            if field_to_edit == "name":
                client.name = new_value
                client.save()
                return JsonResponse({"message": "Name Updated."}, status=200)
            if field_to_edit == "telephone":
                client.telephone = new_value
                client.save()
                return JsonResponse({"message": "Telephone Updated."}, status=200)
            if field_to_edit == "email":
                client.email = new_value
                client.save()
                return JsonResponse({"message": "Email Updated."}, status=200)
            if field_to_edit == "address":
                client.address = new_value
                client.save()
                return JsonResponse({"message": "Address Updated."}, status=200)

    
    return JsonResponse({"error": "POST request required."})
        

def pet_removal(request):
    if request.method == "POST":
        data = json.loads(request.body)
        print(data)
        id_number = data.get("id", "")
        print(id_number)
        
        print(id_number)

        pet = Pet.objects.get(id=id_number)
        print(pet)

        if not pet:
            return JsonResponse({"message": "Pet not found."}, status=400)
        
        print(pet)
        print(pet.serialize())

        pet.owner = None
        pet.save()

        print(pet)
        print(pet.serialize())

        return JsonResponse({"message":"Pet successfully removed"}, status=200)
        
    else:
        return JsonResponse({"error": "POST request required."})

def manage(request):
    if request.method == "POST":
        return render(request, "VetBooker/manage.html")
    else:

        ### Edit a pet based on owners telephone number.

        # petqs = Pet.objects.all()
        # ownerqs = Client.objects.all()
        # pet_list = []
        # owner_list = []
        # for pet, owner in zip(petqs, ownerqs):
        #     pet_list.append(pet)
        #     owner_list.append(owner)
        
        # print(pet_list[0])
        # print(pet_list[0].pet_owner.all()[0].name)
        # print(owner_list[0].owner_pet.all()[0].name)
        
        return render(request, "VetBooker/manage.html")
