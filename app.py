from flask import Flask, session, request, Response, jsonify, render_template as rt
from flask_socketio import SocketIO
from flask_socketio import emit, send, disconnect
from flask_socketio import join_room, leave_room
from flask_session import Session
from os import urandom
import datetime
from random import randint,random,choices
# import cv2
import os
import string

app = Flask(__name__,static_folder="static",static_url_path="/",template_folder="template")
app.config['SECRET_KEY'] = os.urandom(8)
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)
socketio = SocketIO(app, manage_session=False, cors_allowed_origins="*")



# 基本房間狀態
random_que = {}
# random_que example = {room1: [user1, user2], room2: [user3, user4]}

# 聊天歷史紀錄，未來套用 redis，目前先用 dict，當有一方在，記錄會保留，當雙方離開，記錄會消失
history_messages = {}
# history_messages format example
# history_messages = {
#     room1: [ 
#         {username: user1, message: "hello", time: "2021-01-01 00:00:00"},
#         {username: user2, message: "hi", time: "2021-01-01 00:00:01"}
#     ],
#     room2: [
#         {username: user3, message: "hello", time: "2021-01-01 00:00:00"},
#         {username: user4, message: "hi", time: "2021-01-01 00:00:01"}
#     ]
# }


# ID可隨意 可重複 無關資料庫 識別都靠 socket id
# 密語可以將同樣輸入的人都放到一個房間

# 按下 random 後 若都沒房間 會停留在 block 開啟頁面 別顯示等待中

@app.route('/')
def index():
    # print random_que and history_messages
    print("random_que:",random_que)
    print("history_messages:",history_messages)
    return rt('index.html')

# back checker
# 斷線連回檢查器
@app.route("/back_checker")
def back_check():
    if session.get("room") != None:
        print("back_checker :room:",session.get("room"),", username:",session.get("username"))
        # send back old messages of this room
        return jsonify({"ok": True, "type": "back", "room": session.get('room'), "username": session.get('username')})
    else:
        # get total online users in random _que
        total_online_users = 0
        for room in random_que:
            total_online_users += len(random_que[room])
        return jsonify({"ok": True, "type": "new", "total_online_users": total_online_users})

@socketio.on("test_connection")
def test_connection():
    print("test_connection")
    emit('test_connection', {'ok': True})


# recieve chat message
# 對話來往用
@socketio.on("chat", namespace="/random")
def transfer_chat(data):
    # print randon que
    print(random_que)

    # 取得該使用者 username
    print(">>>",data)
    
    username = session.get('username')
    # 取得該房間
    room = session.get('room')

    # 前端發來訊息會附上此 content 發出者，會比對session 來辨識是否是己方發言
    # 若是己方發言 會將前端己方發言由半透明變成 opacity = 1
    # 若是對方發言 則照正常程序貼上訊息

    # record message into history_messages
    # 若該房間沒有歷史紀錄 則建立
    if room not in history_messages:
        history_messages[room] = []
    # 將對方發言存入歷史紀錄, timestamp like 20220101235959
    history_messages[room].append({"username": username, "message": data["msg"], "timestamp": datetime.datetime.now().strftime("%Y%m%d%H%M%S"), "message_id": data["message_id"]})
    # print history messages
    print(history_messages)
    print("誰:",username," 房號:",room)
    emit("chat", {"who":username,"msg":data["msg"],"room":room,"message_id":data["message_id"]}, room=room, broadcast=True)
    # 將對方發言存入歷史紀錄
    # history_messages[room][username] = {"message": data["msg"], "timestamp": datetime.datetime.now()}




# # roll
# # 確認是否有房間
# @app.route('/link_start', methods=['GET', 'POST'])
# def roll():
#     # 先看有無房間 若無則自建
#     # 會進到此處都是已經無 session 狀態
#     try:
#         if request.method == 'GET':
#             # regist new 
#             print("設置好username 並丟給session")
#             username = request.args.get('username')
#             session['username'] = username
#             for room in random_que:
#                 # 檢查房間是否有人
#                 if len(random_que[room]) < 2:
#                     print("有人,將使用者加入房間")
#                     # 若有人 將使用者加入房間
#                     session['room'] = room
                    
#                     random_que[room].append(username)
#                     print("房間字典狀態",random_que)
#                     return jsonify({"ok": True, "room": room, "username": username,"status":"將使用者加入房間"})
#             # 若無人 則建立新房間
#             print("無人,建立新房間")
#             #產生亂數英文   數字房間號碼
#             room = ''.join(choices(string.ascii_letters + string.digits, k=6))
#             random_que[room] = [username]
#             # random_que[room] = [username]
#             session['room'] = room
#             print("房間字典狀態",random_que)
#             return jsonify({"ok": True, "room": room, "username": username,"status":"建立新房間"})
#         return jsonify({"error": True, "message": "Invalid request method"})
#     except Exception as e:
#         print(e)
#         return jsonify({"error": True, "message": "Something went wrong"})


# # link start
# @socketio.on("link_start", namespace="/random")
# def link_start(data):
#     # 取得該使用者 username
#     username = session.get('username')
#     # 取得該房間
#     #check if data room is same as session room
#     if data["room"]==session.get('room'):
#         room = session.get('room')
#         # 將使用者加入房間
#         join_room(room)
#         # 發送訊息給房間內所有人
#         emit('link_start', {'ok': True, 'username': username}, room=room)
#     else:
#         emit('link_start', {'ok': False, 'message': '房號錯誤'})

# connect
@socketio.on("go_connect", namespace="/random")
def reconnect(data):
    # if data["secret"]:
    #     secret = data["secret"]
    # data["secret"] = ""
    # check status
    if data["status"] == "back":
        print("back")
        # send back history messages
        # 取得該使用者 username
        username = session.get('username')
        # 取得該房間
        room = session.get('room')
        # 將使用者加入房間
        join_room(room)
        # 發送訊息給房間內所有人
        try:
            if history_messages[room]:
                emit('special', {'ok': True, 'username': username, "history_messages": history_messages[room]}, room=room)
                return
        except:
            emit('special', {'ok': True, 'username': username, "history_messages": []}, room=room)
            return
    elif data["status"] == "new":
        print("new")
        # 取得該使用者 username
        session['username'] = data["username"]
        username = session.get('username')
        # Create new room
        # 產生亂數英文   數字房間號碼
        room = ''.join(choices(string.ascii_letters + string.digits, k=6))
        random_que[room] = [username]
        # random_que[room] = [username]
        session['room'] = room
        print("房間字典狀態",random_que)
        # 將使用者加入房間
        join_room(room)
        # 發送訊息給房間內所有人
        emit('go_connect', {'ok': True, 'username': username,"room":room}, room=room)
        return
    else:
        return {"error": True, "message": "Leave room error"}


    # # 取得該使用者 username
    # username = session.get('username')
    # # 取得該房間
    # #check if data room is same as session room
    # room = session.get('room')
    # join_room(room)
    # print("history_message",history_messages)
    # if room in history_messages:
    #     emit('special', {'ok': True, 'username': username,"history_messages":history_messages[session.get('room')]}, room=room)
    # else:
    #     emit('special', {'ok': True, 'username': username}, room=room)




#清除 session
@app.route("/clear_all", methods=['GET'])
def clear_session():
    username = session.get('username')
    room = session.get('room')
    # clear this user from random_que if excist or not
    random_que[room].remove(username)
    # if no one in this room, delete this room as well
    if len(random_que[room]) == 0:
        del random_que[room]
    #delete history messages
    if room in history_messages:
        del history_messages[room]
    # clear session
    session.clear()
    # count random_que for online users
    total_online_users = 0
    for room in random_que:
        total_online_users += len(random_que[room])
    return jsonify({"ok": True,"total_online_users":total_online_users})


# @socketio.on("leave", namespace="/random")
# def leave(data):
#     # 取得該使用者 username
#     username = session.get('username')
#     # 取得該房間
#     room = session.get('room')
#     # 將使用者從房間移除
#     random_que[room].remove(username)
#     print(">>>>>>>>>>",room)
#     # 若房內無人 刪除歷史訊息
#     if len(random_que[room]) == 0:
#         del history_messages[room]
#     # 若房間內無人 刪除房間
#     if len(random_que[room]) == 0:
#         del random_que[room]
#     # 發送訊息給房間內所有人
#     emit('leave', {'ok': True, 'username': username}, room=room)
#     # 離開房間
#     leave_room(room)
#     session.clear()






if __name__=='__main__':
    socketio.run(app,host='0.0.0.0',debug=True,port=3000)
