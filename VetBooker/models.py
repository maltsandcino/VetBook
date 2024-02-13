from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
    pass

class Vet(models.Model):
    name = models.TextField(blank=True)
    priority_skills = models.ManyToManyField("Skill", related_name="priority_skill", null=True)
    secondary_skills = models.ManyToManyField("Skill", related_name="secondary_skill", null=True)
    general_availibility = models.ManyToManyField("Shift", null=True)
    bookings = models.ManyToManyField("Booking", related_name="vet_bookings", null=True)

class Client(models.Model):
    name = models.TextField(blank=True)
    telephone = models.TextField(blank=True)
    email = models.TextField(blank=True)
    address = models.TextField(blank=True)
    pet = models.ManyToManyField("Pet", related_name="pet_owner", null=True)
    bookings = models.ManyToManyField("Booking", related_name="client_bookings", null=True)
    bills = models.ManyToManyField("Bill", related_name="bills", null=True)

class Skill(models.Model):
    skill = models.TextField(blank=True)

class Shift(models.Model):
    day = models.TextField(blank=True, null=True)
    start_time = models.TimeField
    end_time = models.TimeField

class Booking(models.Model):
    start_time = models.DateTimeField(auto_now_add=False)
    end_time = models.DateTimeField(auto_now_add=False)
    procedure = models.ManyToManyField("Procedure", related_name="booking_procedure", null=True)
    comments = models.TextField(blank=True)
    bill = models.ManyToManyField("Bill", related_name="procedure_bill", null=True)

class Pet(models.Model):
    name = models.TextField(blank=True)
    species = models.TextField(blank=True)
    breed = models.TextField(blank=True, null=True)
    conditions = models.TextField(blank=True)
    bookings = models.ManyToManyField("Booking", related_name="pet_bookings", null=True)
    owner = models.ManyToManyField("Client", related_name="owner_pet", null=True)
    comments = models.ManyToManyField("Booking", related_name="booking_comments", null=True)

class Procedure(models.Model):
    name = models.TextField(blank=True)
    price = models.IntegerField(blank=True)

class Bill(models.Model):
    pass