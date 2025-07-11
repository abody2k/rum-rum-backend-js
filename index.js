var express = require("express");
const { room } = require("./rooms");
let app = express()
let web = require("http").createServer(app)
const { Server } = require('socket.io');
let io =  new Server(web)

// {
//     cors:{
//         origin:"*"
//     }
// }

app.use(express.json());
app.use(require("cors")())
// app.use(express.static())

const crypto = require("crypto");
const path = require("path");

let rooms = new Map();
let users = new Map();
let roomsUpdated= false;


function getIPHash(ip) {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 12);
}



const DIST_PATH = path.join(__dirname, 'rum-rum',"browser");
app.use(express.static(DIST_PATH));


app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});













io.on("connection",(client)=>{



    
    console.log("new connection");

    client.on("jrms",(d)=>{
        console.log("user joined room");
        
        client.join("rms");

    })

    client.on("jr",(data,ack)=>{

        client.leave("rms");


        
        
        io.in(data).fetchSockets().then((sockets)=>{
            console.log(data);
            let roomDetails = data.split(",");

            let roomID = roomDetails[0];
            console.log(roomID);
            

            let room = rooms.get(roomID);
            if(room){ // the room does exist

                if (room.ppl>=2){ // let the user join only if there is a sufficent number of seats
                    ack("lv"); // leave the room to a new window
                    return;
                }

                if(room.key){

                    if(roomDetails[1] != room.key){

                        ack("lv"); // leave the room to a new window
                        return;
                    }



                }


                
                room.ppl++;

                
                client.join(roomID);
                ack(room.ppl);
                io.to(roomID).emit("nou",room.ppl);

                users.set(client.id,roomID);
                roomsUpdated=true;
                

                

            }else{ // room does not exist
                ack("lv"); // leave the room to a new window

            }

            
            
            // client.send("this is my response to your message"); // number of users


        })



        

    })


    client.on("offer",(data)=>{

        
        io.to(data.split("،")[0]).except(client.id).emit("offer",data.split("،")[1]);
        
    })

        client.on("ans",(data)=>{

        
        io.to(data.split("،")[0]).except(client.id).emit("ans",data.split("،")[1]);
        
    })
        client.on("can",(data)=>{

        
        io.to(data.split("،")[0]).except(client.id).emit("can",data.split("،")[1]);
        
    })
    client.on("lv",(data)=>{

        // check if the room exist
        const room = rooms.get(users.get(client.id));
        if(room){

            //take the user out and update room info
        io.to(users.get(client.id)).emit("lft") // someone left
        rooms.get(users.get(client.id)).ppl--; // decrease ppl in room 
        if(rooms.get(users.get(client.id)).ppl<=0) // if it's empty delete the room
        rooms.delete(users.get(client.id));
        users.delete(client.id); //delete the user info as the user might not join a room for a while and this data is just redundant
        roomsUpdated = true;
        client.join("rms");
        }else{ // ignore it


        }

    })

    client.on("disconnect",(e)=>{

     
  
        
        
        if(!client.id){
            return;
        }
        
        
try {
            
        io.to(users.get(client.id)).emit("lft") // someone left
        rooms.get(users.get(client.id)).ppl--;
        if(rooms.get(users.get(client.id)).ppl<=0)
            rooms.delete(users.get(client.id));
        users.delete(client.id);
        roomsUpdated=true;


} catch (error) {
    
}
        

        console.log("somebodyy just left");
        
    })
    
})

app.post("/gr",(req,res)=>{

    
    res.send([...rooms.values()].map((e)=>{return[e.title,e.ID,e.ppl,e.key? true : false]}));



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

        rooms.get(hashedIP).key = req.body.rk == 1 ?  (Math.random()*10000).toString("24").replace(".","") : null;

        rooms.get(hashedIP).ID = hashedIP;
        rooms.get(hashedIP).title = req.body.rt;
        io.in(hashedIP).fetchSockets().then((e)=>{ // get all the sockets in that room
        
            e.forEach((socket)=>{

                socket.leave(hashedIP); // leaving the room from the server side
            });
        res.send({id:hashedIP, k:rooms.get(hashedIP).key});

        })
    }else{


        const newRoom= room();
        newRoom.title = req.body.rt ?? "";

        newRoom.key = req.body.rk == 1 ?  (Math.random()*10000).toString("24").replace(".","") : null;
        newRoom.ID = hashedIP;
        rooms.set(hashedIP,newRoom);
        res.send({id:hashedIP, k:newRoom.key});

        
    }

    roomsUpdated=true;

})


// app.get("*",(req,res)=>{



// })


// app.use(express.static("rum-rum/browser"));




web.listen(3000,()=>{



    console.log("Server is up and listening!");

    setInterval(() => {

        if(!roomsUpdated)
            return;
        console.log("Sending rooms ...");
        
        roomsUpdated = false;
        io.to("rms").emit("rms",[...rooms.values()].map((e)=>{return[e.title,e.ID,e.ppl,e.key? true : false]}));
    }, 1000 * 30);
    
})