
    let me;
    let message_id = 0;
    let input_bar =  document.getElementById("input_bar")
    document.addEventListener("DOMContentLoaded", async() => {
        console.log("DOM loaded");
        let result = await init_user();
        if(result.type == "back"){
            console.log("Prime check:back")
            //啟動連回函式
            init_socket(result.type,null);
        }else{
            console.log("Prime check:new user, do nothing")
            return
        };
        
    });




    //init user
    init_user = async () => {
        console.log(">>>initializing user<<<")
        options = {
            method: "GET",
            credentials: "same-origin",
            headers: {
                "content-type": "application/json",
            },
        };
        const response = await fetch("/back_checker", options);
        const result = await response.json();
        //if back
        if (result.type == "back") {
            console.log(">>>back<<<")
            me = result.username;
            loger_off();
        //Else is all new
        }else{
            console.log(">>>new<<<")
            console.log(result)
            loger_on(result);
        };
        return result;
    };



    //Start by user pressing button
    // leads to init_socket
    init_new = async () => {
        me = document.getElementById("user_name").value;
        let secret = document.getElementById("secret").value;
        if (me == null || me == "") {
            console.log("輸入名稱喔！");
            return null;
        }
        init_socket("new",secret);
    }

    init_socket = async (status,secret) => {
        console.log("init_socket_status: ",status)
        console.log(">>>initializing websocket<<<")
        socket = io.connect("/random");
        let test_result = test_socket()
        if(!test_result){
            console.log("socket connection 失敗")
            return
        }
        //BACK
        if(status == "back"){
            console.log(">>>back<<<")
            socket.emit("go_connect",{
                username:me,
                status:"back"
            })
            //recieve all sp messages
            socket.on("special", (data) => {
                console.log("sp",data)
                if(data.history_messages){
                    console.log("這裡是斷線前的歷史訊息",data.history_messages)
                    data.history_messages.forEach((m)=>{
                        console.log(m)
                        if(m.username == me){
                            draw(m.message,"me")
                            //change class name to msg_me
                            document.getElementById("me_message"+message_id).className = "msg_me"
                            message_id+=1
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
        }

        //NEW
        if(status == "new"){
            console.log(">>>new<<<",me)
            socket.emit("go_connect",{
                username:me,
                status:"new",
                secret:secret
            })
            //recieve go_connect result
            socket.on("go_connect", (data) => {
                console.log("go_connect",data)
                if(data.ok){
                    console.log("go_connect success")
                    loger_off();
                    return
                }else{
                    console.log("go_connect fail")
                    return
                }
            });
        }




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
        socket.on("chat", (data) => {
            console.log("chat",data)
            if (data.who == me){
                // turn this message class name to msg_me
                console.log(data)
                document.getElementById("me_message"+message_id).className = "msg_me"
                message_id+=1
                console.log("My message get!")

                return
            }
            draw(data.msg,"other")
            return
        });
    }








    // //init socket -> link_start
    // init_socket = async (status) => {
    //     console.log("checking status")
    //     if(status == "back"){
    //         console.log("init socket for back")
    //         return
    //     }else if(status == "new"){
    //         console.log("init socket for new")
    //         let user_name = document.getElementById("user_name").value;
    //         if (user_name == null || user_name == "") {
    //             console.log("輸入名稱喔！");
    //             return null;
    //         }
    //         return
    //     }
    //     console.log("initializing...websocket")
    // }
    // //init socket
    // init_socket = async(status) => {
    //     let input_bar =  document.getElementById("input_bar")
    //     //initialize
    //     console.log("initializing...")
    //     //start socket
    //     socket = io.connect("/random");

    //     if(status=="back"){
    //         console.log("back")
    //         socket.emit("reconnect",{
    //             username:me
    //         })

    //     //recieve all sp messages
    //     socket.on("special", (data) => {
    //         console.log("sp",data)
    //         if(data.history_messages){
    //             console.log("這裡是斷線前的歷史訊息",data.history_messages)
    //             data.history_messages.forEach((m)=>{
    //                 console.log(m)
    //                 if(m.username == me){
    //                     draw(m.message,"me")
    //                     return
    //                 }else{
    //                     draw(m.message,"other")
    //                 }
    //             })
    //             return
    //         }else{
    //             console.log("連回來囉，但你們啥都還沒說")
    //         }
    //     });


    //     //test socket connection
    //     test_result = test_socket();
    //     if(test_result){
    //         console.log("socket connection 成功")
    //     }


    //     //restore connections

        
    //     //輸入欄位


    //     //input detector 偵測使用者正在輸入
    //     input_bar.addEventListener('input',()=>{
    //         console.log("inputing...")

    //         //後加入websocket
    //         // socket.emit("inputing",{
    //         //     username:me
    //         // })
    //     })

    //     //detec user press enter
    //     input_bar.addEventListener('keydown',(e)=>{
    //         let content = input_bar.value

    //         // if user has inpot something and press enter
    //         if(e.keyCode == 13){
    //             //if content is empty then do nothing
    //             if(content == ""){
    //                 console.log("u enter nothing...")
    //                 return
    //             }
    //             console.log(content)

    //             //先渲染自身的訊息
    //             draw(content,"me")


    //             send(content)
    //             //clear input bar
    //             input_bar.value = ""
    //         }
    //     })


    //     //開啟接收訊息, server hit confirmed
    //     socket.on("chat", (data) => { 
    //         console.log("socket_on_chat_get",data)
    //         //if it's my msg, change message opacity to 1
    //         if(data.who == me){
    //             console.log("this is my msg, change opacity to 1")
    //             //delete this id
    //             //delay 1 second
    //             //if message_id matches, then change opacity to 1
    //             console.log(data)
                
    //             setTimeout(()=>{
    //                 id = "me_message"+data.message_id
    //                 document.getElementById(id).className = "msg_me"
    //             }
    //             ,250)      
    //             message_id += 1          
    //             return
    //         };
    //         draw(data.msg,"other");
    //     })
    // };


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
        console.log("who:",who," me:",me)
        if(who == "me"){
            new_msg.className += "_me_half"
            new_msg.id = "me_message"+message_id
        }else if(who == "other"){
            new_msg.className += "_other"
        }

        chat_content.appendChild(new_msg)
        chat_content.scrollTop = chat_content.scrollHeight;

    }









    loger_on = (result) => {
        let loger = document.getElementById("loger");
        let mask = document.getElementById("mask");
        loger.style.display = "block";
        mask.style.display = "block";
        window.addEventListener("scroll", locker);
        let total_online = document.getElementById("total_online");
        // reset total_online
        total_online.innerHTML = "目前線上人數: ";
        total_online.innerHTML = total_online.innerHTML+=result.total_online_users;
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







    //   //孤兒
    //   link_start = async () => {
    //     let user_name = document.getElementById("user_name").value;
    //     if (user_name == null || user_name == "") {
    //       console.log("輸入名稱喔！");
    //       return null;
    //     }
    //     options = {
    //       method: "GET",
    //       credentials: "same-origin",
    //       headers: {
    //         "content-type": "application/json",
    //       },
    //     };
    //     const response = await fetch("/link_start?username=" + user_name, options);
    //     const result = await response.json();
    //     if (result.ok) {
    //        //請求成功   
    //       console.log(result);
    //       console.log("request roll success, closing loger and mask");
    //       link_start(result);
    //       return;
    //     }
    //     console.log("request roll failed");
    //     return {"error":"request roll failed"};
    // };






    // User quit
    clear_all = async () => {
        //改為 socket.emit("leave")
        options = {
            method: "GET",
            credentials: "same-origin",
            headers: {
                "content-type": "application/json",
            },
        };
        const response = await fetch("/clear_all", options);
        const result = await response.json();


        //clear websocket connection
        console.log("clear websocket connection",result)

        if (result.ok) {
            console.log("clear session success");
            // clear all session
            console.log("clear session storage")
            sessionStorage.clear();
            // clear chat content
            console.log("clear chat content")
            document.getElementById("chat_content").innerHTML = "";
            // close socket connection
            console.log("close socket connection")

            //close socket connection
            io.connect("/random").close();
            console.log(result)
            loger_on(result);
            return result;
        }
        console.log("clear session failed");
        return {"error":"clear session failed"}
    }


    test_socket = async() => {
        let data
        socket.emit("test_connection",{
            msg:"hello"
        })
        socket.on("test_connection", (data) => { 
            if(data.ok){
                console.log("socket connection test ok")
                return true
            }else{
                console.log("socket connection test fail")
                return false
            }
        })
    }




    // link_start = async (result) => {
    //     socket.emit("link_start",result)
    //     if(result.ok){
    //         console.log("link start success")
    //         loger_off();
    //         return
    //     }
    // }
