var express = require("express")
let app = express()
app.use(express.json());
app.use(require("cors")())


let rooms = [
    
    {roomTitle:"bla bla bla", roomID:1234},
    {roomTitle:"bla kmka", roomID:1234},
        {roomTitle:"blakmla", roomID:1234},
            {roomTitle:"bla bla bla", roomID:1234},
                {roomTitle:"blakmkmkmka", roomID:1234},


];



app.post("/gr",(req,res)=>{


    res.send(rooms.map((e)=>[e.roomTitle,e.roomID]))



})


app.put("/nr",(req,res)=>{


    console.log(req.body);
    
    res.sendStatus(200);
})





let socket = require("socket.io").Server
let web = require("http").createServer(app)
let io = new socket(web,{
    cors:{
            origin: 'http://localhost:4200', // 
    methods: ['GET', 'POST'],
    credentials: true
    }
})


io.on("connection",(client)=>{




    console.log("new connection");


    client.on("jr",(data)=>{


        
        
        io.in(data).fetchSockets().then((sockets)=>{
            console.log(socket.length);
            
            // client.send("nou",sockets.length); // number of users
            client.emit("nou",sockets.length)
            io.to(data).emit("nou",sockets.length);
            client.join(data);
        })



        

    })


    client.on("offer",(data)=>{

        
        io.to(data.split("،")[0]).except(client.id).emit("offer",data.split("،")[1]);
        console.log(data.split("،")[1]);
        
    })

        client.on("ans",(data)=>{

        
        io.to(data.split("،")[0]).except(client.id).emit("ans",data.split("،")[1]);
        console.log(data.split("،")[1]);
        
    })
        client.on("can",(data)=>{

        
        io.to(data.split("،")[0]).except(client.id).emit("can",data.split("،")[1]);
        console.log(data.split("،")[1]);
        
    })
    // client.on("lv")

    client.on("disconnect",()=>{

        console.log("somebodyy just left");
        
    })
    
})

web.listen(3000,()=>{



    console.log("Server is up and listening!");
    
})