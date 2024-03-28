from django.db import models
from django.contrib.auth.models import AbstractUser
# from rest_framework import serializers

# Create your models here.

class User(AbstractUser):
    pass

class Vet(models.Model):
    name = models.TextField(blank=True)
    priority_skills = models.ManyToManyField("Skill", related_name="priority_skill")
    general_availibility = models.ManyToManyField("Shift")
    bookings = models.ManyToManyField("Booking", related_name="vet_bookings", blank=True)
    def __str__(self):
        return self.name
    
    def serialize(self):

        bookings = Booking.objects.filter(vet=self)
        booking_list = []
        for booking in bookings:
            booking_list.append({'pet name': booking.Pet, 'day': booking.day, 'start time': booking.start_time, 'end time': booking.end_time, 'procedure': booking.procedure})

        return {
            "id": self.id,
            "name": self.name,
            "priority_skills": self.priority_skills,
            "general_availibility": self.general_availibility,
            "bookings": booking_list,
            # "bookings": self.bookings,
        }

class Client(models.Model):
    name = models.TextField(blank=True)
    telephone = models.TextField(blank=True, unique=True)
    email = models.TextField(blank=True)
    address = models.TextField(blank=True)
    bookings = models.ManyToManyField("Booking", related_name="client_bookings", blank=True)
    bills = models.ManyToManyField("Bill", related_name="bills", blank=True)
    def __str__(self):
        return self.name
    
    # def serialize(self):
    #     class PetSerializer(serializers.ModelSerializer):
    #         class Meta:
    #             model = Pet
    #             fields = ('id', 'name', 'species')

    #     class ClientSerializer(serializers.ModelSerializer):
    #         pet = PetSerializer(read_only=True, many=True)
    #         class Meta:
    #             model = Client
    #             fields = '__all__'

    #     return ClientSerializer(self).data
    
    # implementing my own serialization without relying on the REST framework. This results in a much better JSON object!

    def serialize(self):
        pet_query_set = Pet.objects.filter(owner=self)
        pet_list = []
        for pet in pet_query_set:
            pet_list.append({'name': pet.name, 'species': pet.species, 'id': pet.id})

        return {
            "id": self.id,
            "name": self.name,
            "pets": pet_list,
            "email": self.email,
            "address": self.address,
            "telephone": self.telephone,
            # "bookings": self.bookings,
        }

class Skill(models.Model):
    skill = models.TextField(blank=True)
    def __str__(self):
        return self.skill

class Shift(models.Model):
    name = models.TextField(blank=True, null=True)
    day = models.TextField(blank=True, null=True)
    start_time = models.TimeField(auto_now_add=False, null=True)
    end_time = models.TimeField(auto_now_add=False, null=True)
    def __str__(self):
        return self.name
    
class Booking(models.Model):

    class Duration(models.IntegerChoices):
        SHORT = 15, "Short"
        MEDIUM = 30, "Medium"
        LONG = 60, "Long"
        XLONG = 120, "Extra Long"

    title = models.TextField(blank=True, null=True)
    vet = models.ManyToManyField("Vet", related_name="booking_vet")
    Pet = models.ManyToManyField("Pet", related_name="booking_pet")
    Client = models.ManyToManyField("Client", related_name="booking_owner")
    day = models.DateField(auto_now_add=False, null=True)
    start_time = models.TimeField(auto_now_add=False)
    duration = models.IntegerField(choices=Duration.choices, default=Duration.SHORT, verbose_name="Duration", blank=True, null=True)
    procedure = models.ManyToManyField("Procedure", related_name="booking_procedure")
    comments = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.title} + {self.day} + {self.start_time}"

class Pet(models.Model):
    name = models.TextField(blank=True)
    species = models.TextField(blank=True)
    breed = models.TextField(blank=True, null=True)
    conditions = models.TextField(blank=True)
    bookings = models.ManyToManyField("Booking", related_name="pet_bookings", blank=True)
    owner = models.ForeignKey("Client", related_name="owner_pet", null=True, blank=True, on_delete=models.CASCADE)
    comments = models.ManyToManyField("Booking", related_name="booking_comments", blank=True)

    def __str__(self):
        return self.name
    
    def serialize(self):

        bookings = Booking.objects.filter(Pet=self)
        booking_list = []
        for booking in bookings:
            booking_list.append({'name': booking.Pet, 'day': booking.day, 'start time': booking.start_time, 'procedure': booking.procedure} )
        

        return {
            "id": self.id,
            "name": self.name,
            "species": self.species,
            "conditions": self.conditions,
            "bookings": booking_list,
            "owner": self.owner,
            "comments": self.comments
        }

class Procedure(models.Model):
    name = models.TextField(blank=True)
    price = models.IntegerField(blank=True)
    def __str__(self):
        return self.name

class Bill(models.Model):
    pass