var express = require("express");
const { room } = require("./rooms");
let app = express()
app.use(express.json());
app.use(require("cors")())

const crypto = require("crypto");

let rooms = new Map();


function getIPHash(ip) {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 12);
}


app.post("/gr",(req,res)=>{

    
    res.send([...rooms.values()].map((e)=>{return[e.title,e.ID,e.ppl]}))



})


app.put("/nr",(req,res)=>{


    console.log(req.body);
    
    res.sendStatus(200);
})



app.post("/nr",(req,res)=>{

    console.log(rooms);
    console.log(req.body);
    
    
const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const hashedIP = getIPHash(ip);

    if(rooms.get(hashedIP)){

        rooms.get(hashedIP).ppl=0; // empty the room so that when a new socket joins the room it's clean

        io.to(hashedIP).emit("lv"); // leave the room, delete event listeners from the user

        rooms.get(hashedIP).key = req.body.rk == 1 ?  (Math.random()*10000).toString("24").replace(".","") : 0;

        rooms.get(hashedIP).ID = hashedIP;

        io.in(hashedIP).fetchSockets().then((e)=>{ // get all the sockets in that room
        
            e.forEach((socket)=>{

                socket.leave(hashedIP); // leaving the room from the server side
            });
            res.send({id:hashedIP});

        })
    }else{


        const newRoom= room();
        newRoom.title = req.body.rt ?? "";

        newRoom.key = req.body.rk == 1 ?  (Math.random()*10000).toString("24").replace(".","") : 0;
        newRoom.ID = hashedIP;
        rooms.set(hashedIP,newRoom);
        res.send({id:hashedIP, k:newRoom.key});

        
    }

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