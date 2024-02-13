from django.shortcuts import render

# Create your views here.

def index(request):


    
    return render(request, "VetBooker/index.html", {'message': "yo"})
