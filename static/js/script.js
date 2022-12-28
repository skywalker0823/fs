
    document.addEventListener("DOMContentLoaded", () => {
        init_user();
        init_socket();
    });


    //init user
    init_user = async () => {
        //偵測使用者狀態 如已有連線則幫助他連回
        let me;
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
            loger.style.display = "none";
            mask.style.display = "none";
            chatter.style.filter = "none";
            window.removeEventListener("scroll", locker);
            //重連機制







        }else if(result.type == "new"){
        //New user, open loger 開啟登入div
            loger_on();
            //重新挑選對象
            roll();

        }else{
            console.log("cannot define new or back")
            loger_on();
        }
    

    }

    //init socket
    init_socket = async() => {

        //initialize
        console.log("initializing...")
        //start socket
        socket = io.connect("/random");



        //test socket connection
        test_result = test_socket();
        if(test_result){
            console.log("socket connection 成功")
        }


        //restore connections

        
        //輸入欄位
        let input_bar =  document.getElementById("input_bar")



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
                send(content)
                //clear input bar
                input_bar.value = ""
            }
        })
    }


    send = async(content) => {
        console.log("sending...")

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
        console.log(result);
        if (result.ok) {
          console.log("申請隨機中");
          loger.style.display = "none";
          mask.style.display = "none";
          window.removeEventListener("scroll", locker);
          return result;
        }
        console.log("request roll failed");
        return {"error":"request roll failed"}
    };
