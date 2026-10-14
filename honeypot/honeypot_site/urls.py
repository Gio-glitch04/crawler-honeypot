from django.urls import path, re_path

from trap import views

urlpatterns = [
    path("robots.txt", views.robots_txt),
    path("", views.home),
    re_path(r"^public/(?P<token>[0-9a-f]+)/?$", views.public_page),
    re_path(r"^trap/(?P<token>[^/]+)/?$", views.trap_page),
    re_path(r"^trap/?$", views.trap_page, {"token": ""}),
]

handler404 = "trap.views.not_found"
