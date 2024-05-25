from django.urls import path, include
from game.views.addPhoto.addPhoto import addPhoto


urlpatterns = [
    path("addphoto/", addPhoto, name="add_photo"),

]