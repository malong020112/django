from django.urls import path
from game.consumers.multiplayer.index import MultiPlayer

# 相当于http的urls

websocket_urlpatterns = [
    path("ws/multiplayer/", MultiPlayer.as_asgi(), name="ws_multiplayer"),

]