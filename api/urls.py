from django.urls import path
from .views import RoomView, CreateRoomView, getRoom

urlpatterns = [
    path('room', RoomView.as_view()),
    path('create-room', CreateRoomView.as_view()),
    path('get_room', getRoom.as_view())
]
