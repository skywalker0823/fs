from flask import Flask, session, request, Response, jsonify, render_template as rt
from flask_socketio import SocketIO
from flask_socketio import emit, send, disconnect
from flask_socketio import join_room, leave_room
from flask_session import Session
from os import urandom
from random import randint,random,choice
# import cv2
import os
import string

app = Flask(__name__,static_folder="static",static_url_path="/",template_folder="template")
app.config['SECRET_KEY'] = os.urandom(8)
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)
socketio = SocketIO(app, manage_session=False, cors_allowed_origins="*")

random_que = {}

@app.route('/')
def index():
    return rt('index.html')

# back checker
@app.route("/back_checker")
def back_check():
    if session.get("room") != None:
        return jsonify({"ok": True, "type": "back", "room": session.get('room'), "username": session.get('username')})
    else:
        return jsonify({"ok":True,"type":"new"})

@socketio.on('test_connection')
def test_connection():
    emit('test_connection', {'ok': True})


# roll
@app.route('/roll', methods=['GET', 'POST'])
def roll():
    if request.method == 'GET':
        username = request.args.get('username')
        # room = request.form.get('room')
        session['username'] = username
        # session['room'] = room
        # if room not in random_que:
        #     random_que[room] = []
        # random_que[room].append(username)
        # print(random_que)
        # return jsonify({"ok": True, "room": room, "username": username})
        return jsonify({"ok": True, "username": username})
    else:
        return jsonify({"ok": False})





if __name__=='__main__':
    socketio.run(app,host='0.0.0.0',debug=True,port=3000)
