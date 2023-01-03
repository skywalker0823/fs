
    let me;
    let message_id = 0;
    document.addEventListener("DOMContentLoaded", () => {
        init_user();
        init_socket();
    });


    //init user
    init_user = async () => {
        


        //偵測使用者狀態 如已有連線則幫助他連回
        options = {
            method: "GET",
            credentials: "same-origin",
            headers: {
                "content-type": "application/json",
            },
        };
        const response = await fetch("/back_checker", options);
        const result = await response.json();

        if (result.type == "back") {
            //啟動重連機制
            me = result.username;
            chatter_inner = document.getElementById("chatter_inner");
            console.log("this user is still connected! taking back to your room...");
            loger_off();
            //重連機制
            socket.emit("reconnect",{
                username:me
            })            


        }else if(result.type == "new"){
        //New user, open loger 開啟登入div
            console.log("new user, open loger")
            loger_on();
            //重新挑選對象
        }else{
            console.log("cannot define new or back")
            loger_on();
        }
    

    }

    //init socket
    init_socket = async() => {
        let input_bar =  document.getElementById("input_bar")
        //initialize
        console.log("initializing...")
        //start socket
        socket = io.connect("/random");

        //recieve all sp messages
        socket.on("special", (data) => {
            console.log("sp",data)
            if(data.history_messages){
                console.log("這裡是斷線前的歷史訊息",data.history_messages)
                data.history_messages.forEach((m)=>{
                    console.log(m)
                    if(m.username == me){
                        draw(m.message,"me")
                        return
                    }else{
                        draw(m.message,"other")
                    }
                })
                return
            }else{
                console.log("連回來囉，但你們啥都還沒說")
            }
        });


        //test socket connection
        test_result = test_socket();
        if(test_result){
            console.log("socket connection 成功")
        }


        //restore connections

        
        //輸入欄位


        //input detector 偵測使用者正在輸入
        input_bar.addEventListener('input',()=>{
            console.log("inputing...")

            //後加入websocket
            // socket.emit("inputing",{
            //     username:me
            // })
        })

        //detec user press enter
        input_bar.addEventListener('keydown',(e)=>{
            let content = input_bar.value

            // if user has inpot something and press enter
            if(e.keyCode == 13){
                //if content is empty then do nothing
                if(content == ""){
                    console.log("u enter nothing...")
                    return
                }
                console.log(content)

                //先渲染自身的訊息
                draw(content,"me")


                send(content)
                //clear input bar
                input_bar.value = ""
            }
        })


        //開啟接收訊息, server hit confirmed
        socket.on("chat", (data) => { 
            console.log("socket_on_chat_get",data)
            //if it's my msg, change message opacity to 1
            if(data.who == me){
                console.log("this is my msg, change opacity to 1")
                //delete this id
                //delay 1 second
                //if message_id matches, then change opacity to 1
                console.log(data)
                
                setTimeout(()=>{
                    id = "me_message"+data.message_id
                    document.getElementById(id).className = "msg_me"
                }
                ,250)      
                message_id += 1          
                return
            };
            draw(data.msg,"other");
        })
    };


    send = async(content) => {
        console.log("sending...")
        //websocket chat send
        socket.emit("chat",{
            username:me,
            msg:content,
            message_id:message_id
        })
    };
    // draw(m.message,"other")
    draw = (content,who) => {
        //渲染訊息
        let chat_content = document.getElementById("chat_content")
        let new_msg = document.createElement("div")
        new_msg.className = "msg"
        new_msg.innerHTML = content

        //判斷是自己還是對方
        // if it's me, make opacity=0.5
        console.log("who",who,"me",me)
        if(who == "me"){
            new_msg.className += "_me_half"
            new_msg.id = "me_message"+message_id
        }else if(who == "other"){
            new_msg.className += "_other"
        }

        chat_content.appendChild(new_msg)
        chat_content.scrollTop = chat_content.scrollHeight;

    }








    test_socket = async() => {
        let data
        socket.emit("test_connection",{
            msg:"hello"
        })
        socket.on("test_connection", (data) => { 
            console.log(data)
        })
        if(data){
            return true
        }
        return false
    }





    loger_on = () => {
        let loger = document.getElementById("loger");
        let mask = document.getElementById("mask");
        loger.style.display = "block";
        mask.style.display = "block";
        window.addEventListener("scroll", locker);
      };





    loger_off = () => {
        let loger = document.getElementById("loger");
        let mask = document.getElementById("mask");
        loger.style.display = "none";
        mask.style.display = "none";
        window.removeEventListener("scroll", locker);
        };

      locker = () => {
        window.scrollTo(0, 0);
      };








      roll = async () => {
        let user_name = document.getElementById("user_name").value;
        if (user_name == null || user_name == "") {
          console.log("輸入名稱喔！");
          return null;
        }
        options = {
          method: "GET",
          credentials: "same-origin",
          headers: {
            "content-type": "application/json",
          },
        };
        const response = await fetch("/roll?username=" + user_name, options);
        const result = await response.json();
        if (result.ok) {
           //請求成功   
          console.log(result);
          console.log("request roll success, closing loger and mask");
          link_start(result);
          return;
        }
        console.log("request roll failed");
        return {"error":"request roll failed"};
    };







    clear_session = async () => {
        options = {
            method: "GET",
            credentials: "same-origin",
            headers: {
                "content-type": "application/json",
            },
        };
        const response = await fetch("/clear_session", options);
        const result = await response.json();
        console.log(result);
        if (result.ok) {
            console.log("clear session success");
            // clear all session
            console.log("clear session storage")
            sessionStorage.clear();
            // clear chat content
            console.log("clear chat content")
            document.getElementById("chat_content").innerHTML = "";
            loger_on();
            return result;
        }
        console.log("clear session failed");
        return {"error":"clear session failed"}
    }







    link_start = async (result) => {
        socket.emit("link_start",result)
        if(result.ok){
            console.log("link start success")
            loger_off();
            return
        }
    }


