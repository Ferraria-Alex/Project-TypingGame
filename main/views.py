from django.shortcuts import render
from django.http import JsonResponse
from .models import *


# Create your views here.
def index(request):
    return render(request, "index.html")

def vlaesyvia(request):
    if request.method == 'POST':
        try:
            character_name = request.POST.get('character_name')
            character = Characters.objects.get(name=character_name)
            gold = int(request.POST.get('gold'))
            survival_time = int(request.POST.get('time'))
            kill_amount = int(request.POST.get('kills'))
            level_name = request.POST.get('level')
            account_id = int(request.POST.get('account_id'))

            account = Accounts.objects.get(id=account_id)
            account.gold += gold
            account.save()
            
            if Levels.objects.get(name=level, Characters=character):
               level = Levels.objects.get(name=level_name, Characters=character)
               level.survival_time = survival_time
               level.kill_amount = kill_amount
               level.save()
            else:
                Levels.objects.create( 
                    name=level_name,
                    completion_time=survival_time,
                    kill_amount=kill_amount,
                    Characters=character
                )
            return JsonResponse({ 'type': 'success', 'message': f'Level Completed! You killed {kill_amount} enemies and survived {survival_time/1000} seconds.'})
        except Accounts.DoesNotExist:
            return JsonResponse({ 'type': 'error', 'message': 'Account not found.'})
        except (ValueError, TypeError):
            return JsonResponse({ 'type': 'error', 'message': 'Invalid data submitted.'})
        except Exception as e:
            return JsonResponse({ 'type': 'error', 'message': f'An error occurred: {str(e)}'})
    return render(request, "vlaesyvia.html")