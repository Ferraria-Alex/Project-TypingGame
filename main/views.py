from django.shortcuts import render
from .models import Character

# Create your views here.
def index(request):
    return render(request, "index.html")

def vlaesyvia(request):
    return render(request, "vlaesyvia.html")
