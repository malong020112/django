from django.urls import path,include
from game.views.index import index

urlpatterns = [
    path("",index,name="index"),
    path("menu/", include("game.urls.menu.index")),
    path("playground/", include("game.urls.playground.index")),
    path("rank/", include("game.urls.rank.index")),
    path("settings/", include("game.urls.settings.index")),

]