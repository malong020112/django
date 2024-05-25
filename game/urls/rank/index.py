from django.urls import path, include
from game.views.rank.getRank import getRank
from game.views.rank.getHistoryRank import getHistoryRank

urlpatterns = [
    path("getrank/", getRank, name="get_rank"),
    path("gethistoryrank/", getHistoryRank, name="get_history_rank"),
]