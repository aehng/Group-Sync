from django.urls import path

from .views import (
    GroupCreateView,
    GroupDetailView,
    GroupJoinView,
    GroupMembersListView,
    GroupMemberRoleUpdateView,
)

urlpatterns = [
    path("", GroupCreateView.as_view(), name="group-create"),
    path("join/", GroupJoinView.as_view(), name="group-join"),
    path("<int:group_id>/", GroupDetailView.as_view(), name="group-detail"),
    path("<int:group_id>/members/", GroupMembersListView.as_view(), name="group-members"),
    path(
        "<int:group_id>/members/<int:user_id>/",
        GroupMemberRoleUpdateView.as_view(),
        name="group-member-role",
    ),
]
