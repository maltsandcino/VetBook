from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from .models import User, Pet, Client, Booking, Procedure, Vet, Skill
from django import forms
import calendar
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from datetime import date, timedelta, datetime


# Create your views here.

def get_doctors(request):
    if request.method == "POST":
        ###Grab data entered by user
        data = json.loads(request.body)
        skill = data.get("domain", "")
        skill = skill.title()
        ##Make sureto find the skill ID
        skill = Skill.objects.get(skill=skill)
        ##Look for vets with this skill ID
        vets = Vet.objects.filter(priority_skills=skill)
        ##Add these vets to list with relevant information
        vet_list = []
        for vet in vets:
            vet_list.append({"vet": vet.name, "id": vet.id})
        ##Return information to front end
        if not vets:
            return JsonResponse({"message":"No vets found with this skill"}, status=400)
        else:
            return JsonResponse({"vet_list": vet_list}, status=200)


def custom_times(request):
    if request.method == "POST":
        ###Looking to see what appointments already exist for the custom day
        data = json.loads(request.body)
        custom_day= data.get("day")
        date_format = "%Y-%m-%d"
        custom_day = datetime.strptime(custom_day, date_format)       
        vet_ID = data.get("doctorID", "")
        
        ##Access vet and their shift
        vet = Vet.objects.get(id=vet_ID)
        shift = vet.general_availibility.all()[0]
        
        ###We need to know the length of the duration of the appointment in order to properly find available slots. 
        duration = int(data.get("duration", ""))      
        planned_bookings = Booking.objects.filter(vet=vet).filter(day=custom_day)
        bookings = []
        for b in planned_bookings:
            bookings.append(b)
        
        ###Put all possible times into a list and into a dict, plus a dict for names of days
        all_time_slots = list()
        all_hours = []
       
        ###Determine if appointments can be made in morning or evening based on shift
        if shift.name == "Morning":
            all_hours = ["09"] + [str(h) for h in range(10,17)]
            
        if shift.name == "Afternoon":
            all_hours = ["12"] + [str(h) for h in range(13,20)]
           
        minutes = ["00", "15", "30", "45"]
        
        for h in all_hours:
            for m in minutes:
                all_time_slots.append(h+":"+m)
        
        week_slots = {}
        day_names = list(calendar.day_abbr)
        new_keys = []
        
        
        if date.weekday(custom_day) != 6:
            week_slots[str(custom_day)] = all_time_slots[:]
            new_keys.append(f"{day_names[date.weekday(custom_day)]}, {str(custom_day)[8:10]}-{str(custom_day)[5:7]}-{str(custom_day)[0:4]}")
        else:
            return JsonResponse({"message": "Please chose a day other than sunday"}, status=400)
        
        ###Remove times at ends of day for durations that take more than 15 minutes:
        
        for key in week_slots:
            if duration == 1:
                week_slots[key] = week_slots[key][0:35]
            if duration == 2:
                week_slots[key] = week_slots[key][0:33]
            if duration == 3:
                week_slots[key] = week_slots[key][0:29]
        
     
        ###Remove times that dont fit. This bit is cumbersome
        ITERATION_LIST = [0, 1, 3, 7]
        ITERATOR_LIST = [0, 1, 2, 3]
        for i, j in zip(ITERATOR_LIST, ITERATION_LIST):
            if duration == i:
                for b in bookings:
                    print(b.start_time)
                    apt_time = str(b.start_time)[0:5]
                    day = str(b.day)
                    if apt_time in week_slots[day]:
                        index = week_slots[day].index(apt_time)
                        if b.duration == 15:
                            week_slots[day] = week_slots[day][0:index - j] + week_slots[day][index + 1:]                   
                        if b.duration == 30:
                            try:
                                week_slots[day] = week_slots[day][0:index - j] + week_slots[day][index + j:]
                            except:
                                week_slots[day] = week_slots[day][0:index - j]  
                        if b.duration == 60:
                            try:
                                week_slots[day] = week_slots[day][0:index - j] + week_slots[day][index + 3:]
                            except:
                                week_slots[day] = week_slots[day][0:index - j]
                        if b.duration == 120:
                            try:
                                week_slots[day] = week_slots[day][0:index - j] + week_slots[day][index + 8:]
                            except:
                                week_slots[day] = week_slots[day][0:index - j]
        updated_week_slots = {}
        for i, key in enumerate(week_slots):
            updated_week_slots[new_keys[i]] = week_slots[key]
        
        return JsonResponse(updated_week_slots, status=200, safe=False)
    return JsonResponse({"message":"More information is necessary for this path"}, status=200)
    pass
        
def get_avails(request):
    if request.method == "POST":
        ###Looking to see what appointments already exist in the coming week    
        data = json.loads(request.body)
        vet_ID = data.get("doctorID", "")
        
        ##Access vet and their shift
        vet = Vet.objects.get(id=vet_ID)
        shift = vet.general_availibility.all()[0]
        
        ##Determining what period we are looking into. Default starts with today.
        today = date.today()
        
        custom_date = data.get("date")
        direction = data.get("direction")
        
        if custom_date:
            print(today)
            date_format = "%Y-%m-%d"
            custom_date = custom_date[11:] + "-" + custom_date[8:10] + "-" + custom_date[5:7]
            today = datetime.strptime(custom_date, date_format)


        week_in_future = today + timedelta(days=9)

        if direction == "left":
            print(direction)
            week_in_future = today + timedelta(days=1)
            today = week_in_future - timedelta(days=8)
        
        ###We need to know the length of the duration of the appointment in order to properly find available slots. Filtering between today and LESS than 1 week in the future
        duration = int(data.get("duration", ""))      
        planned_bookings = Booking.objects.filter(vet=vet).filter(day__gte=today).filter(day__lte=week_in_future)
        bookings = []
        for b in planned_bookings:
            bookings.append(b)
        
        
            
        ###Put all possible times into a list and into a dict, plus a dict for names of days
        all_time_slots = list()
        all_hours = []
       
        ###Determine if appointments can be made in morning or evening based on shift
        if shift.name == "Morning":
            all_hours = ["09"] + [str(h) for h in range(10,17)]
            
        if shift.name == "Afternoon":
            all_hours = ["12"] + [str(h) for h in range(13,20)]
           
        minutes = ["00", "15", "30", "45"]
        
        for h in all_hours:
            for m in minutes:
                all_time_slots.append(h+":"+m)
        
        week_slots = {}
        day_names = list(calendar.day_abbr)
        new_keys = []
        for i in range(8):
            current_day = today + timedelta(days=i)
            if date.weekday(current_day) != 6:
                week_slots[str(current_day)] = all_time_slots[:]
                new_keys.append(f"{day_names[date.weekday(current_day)]}, {str(current_day)[8:10]}-{str(current_day)[5:7]}-{str(current_day)[0:4]}")
        
        ###Remove times at ends of day for durations that take more than 15 minutes:
        
        for key in week_slots:
            if duration == 1:
                week_slots[key] = week_slots[key][0:35]
            if duration == 2:
                week_slots[key] = week_slots[key][0:33]
            if duration == 3:
                week_slots[key] = week_slots[key][0:29]
        
     
        ###Remove times that dont fit. This bit is cumbersome
        ITERATION_LIST = [0, 1, 3, 7]
        ITERATOR_LIST = [0, 1, 2, 3]
        for i, j in zip(ITERATOR_LIST, ITERATION_LIST):
            if duration == i:
                for b in bookings:
                    print(b.start_time)
                    apt_time = str(b.start_time)[0:5]
                    day = str(b.day)
                    if apt_time in week_slots[day]:
                        index = week_slots[day].index(apt_time)
                        if b.duration == 15:
                            week_slots[day] = week_slots[day][0:index - j] + week_slots[day][index + 1:]                   
                        if b.duration == 30:
                            try:
                                week_slots[day] = week_slots[day][0:index - j] + week_slots[day][index + j:]
                            except:
                                week_slots[day] = week_slots[day][0:index - j]  
                        if b.duration == 60:
                            try:
                                week_slots[day] = week_slots[day][0:index - j] + week_slots[day][index + 3:]
                            except:
                                week_slots[day] = week_slots[day][0:index - j]
                        if b.duration == 120:
                            try:
                                week_slots[day] = week_slots[day][0:index - j] + week_slots[day][index + 8:]
                            except:
                                week_slots[day] = week_slots[day][0:index - j]
        updated_week_slots = {}
        for i, key in enumerate(week_slots):
            updated_week_slots[new_keys[i]] = week_slots[key]
        
        return JsonResponse(updated_week_slots, status=200, safe=False)
    return JsonResponse({"message":"More information is necessary for this path"}, status=400)

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


    return render(request, "VetBooker/index.html", {'message': f"Welcome, {request.user.username}."})

def book(request):
    vet_list = []
    vets = Vet.objects.all()
    for vet in vets:
        vet_list.append({"vet": vet.name, "id": vet.id})
      
    
    if request.method == "POST":
        return render(request, "VetBooker/book.html", {'vetlist': vet_list})
    else:

        return render(request, "VetBooker/book.html", {'vetlist': vet_list})

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
        
        id_number = data.get("id", "")
        field_to_edit = data.get("field", "")
        new_value = data.get("new_value", "")
        client = Client.objects.get(id=id_number)
        
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
        id_number = data.get("id", "")
        pet = Pet.objects.get(id=id_number)
        if not pet:
            return JsonResponse({"message": "Pet not found."}, status=400)
        pet.owner = None
        pet.save()
        return JsonResponse({"message":"Pet successfully removed"}, status=200)
        
    else:
        return JsonResponse({"error": "POST request required."})

def pet_search(request):
    if request.method == "POST":
        # data = json.loads(request.body)
        unowned = Pet.objects.filter(owner=None)
        pet_options = []
        for pet in unowned:
            pet_options.append({"name": pet.name, "species": pet.species, "id": pet.id})
        print(pet_options)
        if not unowned:
            return JsonResponse({"message":"No pets found"}, status=400)
        else:
            return JsonResponse({"options": pet_options}, status=200)
    return JsonResponse({"message":"No pets found"}, status=400)

def add_owner(request):
    if request.method == "POST":
        data = json.loads(request.body)
        owner_id = data.get("owner_id", "")
        pet_id = data.get("pet_id", "")
        pet = Pet.objects.get(id=pet_id)
        if not pet:
            return JsonResponse({"message":"Pet not found"}, status=400)
        user = Client.objects.get(id=owner_id)
        if not user:
            return JsonResponse({"message":"Owner not found"}, status=400)
        pet.owner = user
        pet.save()
        return JsonResponse(user.serialize(), status=200)
    
    return JsonResponse({"message":"Pet not found"}, status=400)

def manage(request):
    if request.method == "POST":
        return render(request, "VetBooker/manage.html")
        
    return render(request, "VetBooker/manage.html")
