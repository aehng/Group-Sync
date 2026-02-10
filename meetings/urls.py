from django.urls import path, include
from . import views

urlpatterns = [ path('', views.meeting_list, name='meeting_list'), path('meetings/', include('meetings.urls')),]