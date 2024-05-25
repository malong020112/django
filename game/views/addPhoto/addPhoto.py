from django.http import JsonResponse
from game.models.player.player import Player

def addPhoto(request):
    user = request.user
    # print(user.username)
    if not user.is_authenticated:
        return JsonResponse({
            'result': "not login"
        })
    else :
        data = request.GET
        photo_src = data.get('src')
        player = Player.objects.get(user=user)
        player.photo = photo_src
        player.save()
        # print("scr---->",photo_src)
        return JsonResponse({
            'result': "success"
        })