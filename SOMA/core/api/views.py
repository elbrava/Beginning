import threading

from django.http import HttpResponse
from django.shortcuts import render
from .apps import s
# Create your views here.7
import os

from django.http import HttpResponse
import socketio

from . import utils

async_mode = None
basedir = os.path.dirname(os.path.realpath(__file__))
sio = socketio.Server(async_mode=async_mode)


def sioi(request):
    return render(request, "index.html")


@sio.event
def sig(sid, message):
    msg = threading.Thread(target=s.run, args=[message["data"], sio,sid]).start()


@sio.event
def disconnect(sid):
    print("didsc")
    sio.disconnect(sid)


@sio.event
def connect(sid, environ):
    print("0000connected")
