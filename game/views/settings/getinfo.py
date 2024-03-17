from django.http import JsonResponse
from game.models.player.player import Player

def getinfo(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({
            'result': "not login"
        })
    else :
        player = Player.objects.get(user=user) #从数据库中获取一个对象 该对象user字段与提供的uer字段相同
        return JsonResponse({
            'result': "success",
            'username': player.user.username,
            'photo': player.photo,
        })

