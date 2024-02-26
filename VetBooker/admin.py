from django.contrib import admin
from .models import User, Vet, Client, Skill, Shift, Booking, Pet, Procedure, Bill

# Register your models here.


###TODO: IMPORT MODELS AND REGISTER FOR AMDIN PAGE BELOW

admin.site.register(User)
admin.site.register(Vet)
admin.site.register(Client)
admin.site.register(Skill)
admin.site.register(Shift)
admin.site.register(Booking)
admin.site.register(Pet)
admin.site.register(Procedure)