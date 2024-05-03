from django.http import JsonResponse
from game.models.player.player import Player

def getRank(request):
    user = request.user
    # print(user.username)
    if not user.is_authenticated:
        return JsonResponse({
            'result': "not login"
        })
    else :
        top_players = Player.objects.order_by('-score')[:10]

        # 构建返回结果列表
        rank_list = [{'username': player.user.username, 'score': player.score} for player in top_players]

        user_score = Player.objects.get(user=user).score
        user_rank = Player.objects.filter(score__gt=user_score).count() + 1
        return JsonResponse({
            'rank_list': rank_list,
            'rank_me': user_rank,
            'score_me': user_score,
            'iname': user.username
        })