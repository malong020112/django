from django.urls import path, include
from game.views.rank.getRank import getRank


urlpatterns = [
    path("getrank/", getRank, name="get_rank"),

]