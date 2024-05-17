from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from .models import User, Pet, Client, Booking, Vet, Skill
from django import forms
import calendar
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from datetime import date, timedelta, datetime
import re


# Create your views here.
class tempBooking:
        def __init__(self, title, vet, pet, client, day, start_time, duration, comments, id):
            self.title = title
            self.vet = vet
            self.pet = pet
            self.client = client
            self.day = day
            self.start_time = start_time
            self.duration = duration
            self.comments = comments
            self.id = id
        
        def __str__(self):
            return f"Booking({self.title}, {self.vet})"

@login_required
def pet_appointments(request, pet_id):        

    pet = Pet.objects.get(id=pet_id)
    client = pet.owner
    print(client)
    tel = client.telephone 
    client_name = client.name

    bookings = Booking.objects.filter(Pet=pet)
    booking_list = []
    
    for booking in bookings:
        day_string = str(booking.day)
        day_string = day_string[5:7] + day_string[4] + day_string[8:] + day_string[4] + day_string[0:4]
        day_names = list(calendar.day_abbr)
        day_name = day_names[date.weekday(booking.day)]
        day_string = f"{day_name} {day_string}"
        temp_booking = tempBooking(booking.title, booking.vet, pet, booking.Client, day_string, str(booking.start_time)[0:5], booking.duration, booking.comments, booking.id)
        booking_list.append(temp_booking)
    
    return render(request, "VetBooker/petSearch.html", {"bookings": booking_list, "name": client_name, "telephone": tel, "petName": pet.name})


def generate_appointments(request):
    if request.method == "POST":
        data = json.loads(request.body)
        vet_id = data.get("vet")
        day = data.get("date")
        vet = Vet.objects.get(id=vet_id)
        bookings = Booking.objects.filter(vet=vet).filter(day=day)
        date_format = "%a %m-%b-%y"
       
        if not vet or not bookings:
            return JsonResponse({"message": "No bookings found on this date"})
        booking_list = {}
        print(bookings)
        for i, booking in enumerate(bookings):
            day_string = str(booking.day)
            day_string = day_string[5:7] + day_string[4] + day_string[8:] + day_string[4] + day_string[0:4]
            day_names = list(calendar.day_abbr)
            day_name = day_names[date.weekday(booking.day)]
            day_string = f"{day_name} {day_string}"
            booking_list[i] = [booking.title, day_string, str(booking.start_time)[0:5], booking.duration, booking.id]
        
    return JsonResponse({"date": day, "vet": vet.name, "bookings": booking_list}, status=200)

###TODO: Work on listings
@login_required
def appointments(request):
    if request.method == "POST":
        data = json.loads(request.body)
        tel = data.get("client")
        client = Client.objects.get(telephone=tel)
        client_name = client.name
        
        bookings = Booking.objects.filter(Client=client)
        booking_list = {}
        for i, booking in enumerate(bookings):
            day_string = str(booking.day)
            day_string = day_string[5:7] + day_string[4] + day_string[8:] + day_string[4] + day_string[0:4]
            day_names = list(calendar.day_abbr)
            day_name = day_names[date.weekday(booking.day)]
            day_string = f"{day_name} {day_string}"
            name = booking.Pet.all()[0].name
            booking_list[i] = [name, day_string, str(booking.start_time)[0:5], booking.duration, booking.id]
        return JsonResponse({"bookings": booking_list, "name": client_name, "telephone": tel}, status=200)
        
    return render(request, "VetBooker/search.html")

@login_required
def schedule(request):
    today = date.today()
    vets = Vet.objects.all()
    vet_list = []
    for vet in vets:
        vet_list.append(vet)
    
    print(vet_list)
    return render(request, "VetBooker/schedule.html", {'date': today, 'vet_list': vet_list})


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
            other_custom_day = str(custom_day)
            other_custom_day = other_custom_day[:10]
            print(other_custom_day)
            week_slots[other_custom_day] = all_time_slots[:]
            new_keys.append(f"{day_names[date.weekday(custom_day)]}, {str(custom_day)[8:10]}-{str(custom_day)[5:7]}-{str(custom_day)[0:4]}")
        else:
            return JsonResponse({"message": "Please chose a day other than sunday"}, status=400)
        
        ###Remove times at ends of day for durations that take more than 15 minutes:
        
        for key in week_slots:
            if duration == 1:
                week_slots[key] = week_slots[key][0:31]
            if duration == 2:
                week_slots[key] = week_slots[key][0:29]
            if duration == 3:
                week_slots[key] = week_slots[key][0:25]
        
     
        ###Remove times that dont fit. This bit is cumbersome. It should be replaced with a helper function
        ITERATION_LIST = [0, 1, 3, 7]
        ITERATOR_LIST = [0, 1, 2, 3]
        
        for day in week_slots:
            blocked_indices = set()

            for i, j in zip(ITERATOR_LIST, ITERATION_LIST):
                if duration == i:
                    for b in bookings:
                        apt_time = str(b.start_time)[0:5]
                        booking_day = str(b.day)
                        if booking_day == day:
                            if apt_time in week_slots[day]:
                                index = week_slots[day].index(apt_time)
                                if b.duration == 15:
                                    blocked_indices.add(index)
                                if b.duration == 30:
                                    for x in range(index - j, index + 2):
                                        if x > -1 and x < len(week_slots[day]):
                                            blocked_indices.add(x)
                                if b.duration == 60:
                                    for x in range(index - j, index + 4):
                                        if x > -1 and x < len(week_slots[day]):
                                            blocked_indices.add(x)
                                if b.duration == 120:
                                    for x in range(index - j, index + 9):
                                        if x > -1 and x < len(week_slots[day]):
                                            blocked_indices.add(x)
            week_slots[day] = [slot for i, slot in enumerate(week_slots[day]) if i not in blocked_indices]

        updated_week_slots = {}
        for i, key in enumerate(week_slots):
            updated_week_slots[new_keys[i]] = week_slots[key]
        
        return JsonResponse(updated_week_slots, status=200, safe=False)
    return JsonResponse({"message":"More information is necessary for this path"}, status=400)


##TO DO
def add_booking(request):
    ###Needs server side validation big time
    if request.method == "POST":
        date_format = "%Y-%m-%d"
        data = json.loads(request.body)

        owner = Client.objects.get(telephone=data.get("number"))
        
        doctor = Vet.objects.get(id=data.get("doctorID"))
        pet = Pet.objects.get(id=data.get("petID"))
        pet_name = pet.name

        date = data.get("date")
        date = datetime.strptime(date, date_format)

        time = data.get("time")
        note = data.get("note")
        duration = data.get("duration")
        if duration == 0:
            duration = 15
        elif duration == 1:
            duration = 30
        elif duration == 2:
            duration = 60
        elif duration == 3:
            duration = 120
        title = data.get("title")

        bookings_check = Booking.objects.filter(vet=doctor).filter(day=date)
        # for current_booking in bookings_check:
            # print(current_booking.duration)
            # print(current_booking.start_time)

        new_booking = Booking(title=title, day=date, start_time=time, duration=duration, comments=note, vet=doctor)      
        new_booking.save()
        doctor.bookings.add(new_booking)
        doctor.save()
        owner.bookings.add(new_booking)
        owner.save()
        pet.bookings.add(new_booking)
        pet.save()
        new_booking.Pet.add(pet)
        new_booking.save()
        new_booking.Client.add(owner)
        new_booking.save()
        print(new_booking.id)

        ##Make sure to change status and messages below:
        return JsonResponse({"message":"More information is necessary for this path", "status": "200", "name": pet_name, "id": new_booking.id}, status=200) 
    return JsonResponse({"message":"More information is necessary for this path", "status": "400"}, status=400)

@login_required
def view_specific_booking(request, booking_id):
    ###Getting all relevant booking information
    booking_id = int(booking_id)
    booking = Booking.objects.get(id=booking_id)
    client = booking.Client.all()[0]
    pet = booking.Pet.all()[0]
    note = booking.comments
    day = booking.day
    time = booking.start_time
    vet = booking.vet.name
    duration = booking.duration
    booking_name = booking.title

    ##Determine what day of the week it is
    day_names = list(calendar.day_abbr)
    day_name = day_names[date.weekday(day)]
    day = str(day)
    ##Put string in American format
    day = day[5:7] + day[4:5] + day[8:10] + day[4:5] + day[0:4]

    
    ##Pass information to template
    return render(request, "VetBooker/view_specific_booking.html", {'pet_name': pet.name, 'client_name': client.name, 'vet_name': vet, 'note': note, 'time': time, 'duration': duration, 'pet_id': pet.id, 'booking_name': booking_name, 'date': day})
    

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
        

        if date.weekday(today) == 6:
            week_in_future = today + timedelta(days=10)
            print(week_in_future)
            DAY_CONSTANT = 9
        else:
            week_in_future = today + timedelta(days=9)
            DAY_CONSTANT = 8
        
        

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
        
        for i in range(DAY_CONSTANT):
            current_day = today + timedelta(days=i)
            if date.weekday(current_day) != 6:
                week_slots[str(current_day)] = all_time_slots[:]
                new_keys.append(f"{day_names[date.weekday(current_day)]}, {str(current_day)[8:10]}-{str(current_day)[5:7]}-{str(current_day)[0:4]}")
        

        
        
        
        ###Remove times at ends of day for durations that take more than 15 minutes:
        
        for key in week_slots:
            if duration == 1:
                week_slots[key] = week_slots[key][0:31]
            if duration == 2:
                
                week_slots[key] = week_slots[key][0:29]
            if duration == 3:
               
                week_slots[key] = week_slots[key][0:25]
        
        
        
     
        ###Remove times that dont fit.
        ##Basically we use this to map duration values to number of slots that need to be removed
        ITERATION_LIST = [0, 1, 3, 7]
        ITERATOR_LIST = [0, 1, 2, 3]

        for day in week_slots:
            blocked_indices = set()

            for i, j in zip(ITERATOR_LIST, ITERATION_LIST):
                if duration == i:
                    for b in bookings:
                        apt_time = str(b.start_time)[0:5]
                        booking_day = str(b.day)
                        if booking_day == day:
                            if apt_time in week_slots[day]:
                                index = week_slots[day].index(apt_time)
                                if b.duration == 15:
                                    blocked_indices.add(index)
                                if b.duration == 30:
                                    for x in range(index - j, index + 2):
                                        if x > -1 and x < len(week_slots[day]):
                                            blocked_indices.add(x)
                                if b.duration == 60:
                                    for x in range(index - j, index + 4):
                                        if x > -1 and x < len(week_slots[day]):
                                            blocked_indices.add(x)
                                if b.duration == 120:
                                    for x in range(index - j, index + 9):
                                        if x > -1 and x < len(week_slots[day]):
                                            blocked_indices.add(x)
            week_slots[day] = [slot for i, slot in enumerate(week_slots[day]) if i not in blocked_indices]

        updated_week_slots = {}
        for i, key in enumerate(week_slots):
            updated_week_slots[new_keys[i]] = week_slots[key]
        
        
        
        return JsonResponse(updated_week_slots, status=200, safe=False)
    return JsonResponse({"message": "More information is necessary for this path"}, status=400)

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            if user.can_access == False:
                return render(request, "VetBooker/login.html", {
                "message": "Your account has not yet been activated. Please re-enter your details, or contact your systems administrator"
                })
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "VetBooker/login.html", {
                "message": "Invalid username and/or password. Please re-enter your details, or contact your systems administrator"
            })
    else:
        return render(request, "VetBooker/login.html")
    
@login_required
def logout_view(request):

    if request.user.is_authenticated:
        logout(request)
    return HttpResponseRedirect(reverse("index"))

###Only superusers may create other users in the system via the register page.
def register(request):    
    if request.method == "POST":
        print("posting")
        username = request.POST["username"]
        email = request.POST["email"]
        first_name = request.POST["firstName"]
        last_name = request.POST["lastName"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "VetBooker/register.html", {
                "message": "Passwords must match."
            })

        # New user is created, and handled if the username already exists
        try:
            user = User.objects.create_user(username=username, 
                                            email=email,
                                            first_name=first_name,
                                            last_name=last_name,
                                            password=password, 
                                            can_access=False)
        except IntegrityError:
            return render(request, "VetBooker/register.html", {
                "message": "Username already in use."
            })
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "VetBooker/register.html")
    # else:
    #     return HttpResponseRedirect(reverse("index"))

@login_required
def index(request):

    return render(request, "VetBooker/index.html", {'message': f"Welcome, {request.user.username}"})

@login_required
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
        number = re.sub("[^0-9]", "", number)

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
                new_value = re.sub("[^0-9]", "", new_value)
                try:
                    existing_record = Client.objects.get(telephone=new_value)
                    if existing_record:
                        return JsonResponse({"error": "One or more fields contains an error."}, status=501)
                except:
                    pass
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

    
    return JsonResponse({"error": "POST request required.", "message": "One or more fields contains an error."}, status=400)
        
def add_customer(request):
    
    if request.method == "POST":
        data = json.loads(request.body)
        tel = data.get("telephone")
        name = data.get("name")
        name = name.strip()
        email = data.get("email")
        email = email.strip()
        address = data.get("address")
        address = address.strip()
        tel = re.sub("[^0-9]", "", tel)
        try:
            existing_client = Client.objects.get(telephone=tel)
            if existing_client:
                return JsonResponse({"error": "Client already exists with this telephone number"}, status=501)
        except:
            pass
        new_customer = Client(name=name, telephone=tel, email=email, address=address)
        print(new_customer)
        new_customer.save()
        return JsonResponse({"message": "New Client successfully created", "tel": tel}, status=200)

        
    return JsonResponse({"error": "POST request required."}, status=400)

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

def add_pet(request):
    if request.method == "POST":
        data = json.loads(request.body)
        name = data.get("name")
        owner = data.get("owner")
        print(owner)
        species = data.get("species")
        breed = data.get("breed")
        
        if owner == "None":
            new_pet = Pet(name=name, species=species, breed=breed)
            new_pet.save()
            
            return JsonResponse({"message": "this seems to work", "name": name}, status=200)
        else:

            owner = Client.objects.get(id=owner)
            print(owner)
            new_pet = Pet(name=name, species=species, breed=breed, owner=owner)
            new_pet.save()
            
            return JsonResponse({"message": "this seems to work", "name": name}, status=200)

    return JsonResponse({"message": "this seems to work"}, status=200)
        
    pass

@login_required
def manage(request):

    if request.method == "POST":
        return render(request, "VetBooker/manage.html")
        
    return render(request, "VetBooker/manage.html")
