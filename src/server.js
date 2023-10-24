import { Socket } from "dgram";
import express from "express"; //express모듈 가져오기
import http from "http";
import path from 'path';
import {Server} from "socket.io"; // npm i socket.io
// import {WebSocketServer} from "ws";
import {instrument} from "@socket.io/admin-ui";
const __dirname = path.resolve();

const app = express(); //express 함수를 호출하여 Express 애플리케이션의 인스턴스를 생성 app변수는 웹 서버의 동작을 구성하고 정의하는데 사용

app.set("view engine", "pug"); //Pug로 view engine 설정
app.set("views", __dirname + "/src/views"); //Express에 template이 어디 있는지 지정
app.use("/public", express.static(__dirname + "/src/public"));
app.get("/", (_, res) => res.render("home")); // home.pug를 reder해주는 route hadler를 만듬
app.get("/*", (_, res) => res.redirect("/"));


const httpServer = http.createServer(app); // http 작동
const wsServer = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true,
    },
});

instrument(wsServer, {
    auth: false
});

function publicRooms(){
    const {
        sockets: {
            adapter: {sids, rooms},
        },
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined){
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

function countRoom(roomName){
   return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}


wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anon";  //룸을 입력하면 닉네임 창이 먼저 나오게 하는 코드 챌린지가 있음
    socket.onAny((event) => {
        console.log(`Socket Events:${event}`);
    });
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname, countRoom(room)-1));
    });
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

// const wss = new WebSocketServer({ server });
// const sockets = [];
// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     socket["nickname"] = "Anon";
//     console.log("Connected to Browser 👍");
//     socket.on("close", () => console.log("Disconnected to Browser 🙅‍♂️"))
//     socket.on("message", (msg) => {
//         const message = JSON.parse(msg);
//         switch (message.type){
//             case "new_message":
//                 sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`));
//             case "nickname":
//                 socket["nickname"] = message.payload;
//         }
//     });
// });

const handleListen = () => console.log(`Listening on http://localhost:3000`);
//app.listen(3000, handleListen); //Express 애플리케이션이 포트 3000에서 들어오는 http요청 수신대기를 시작하도록 지시함, Express 서버를 시작하고 들어오는 트래픽 처리를 시작하게 하는 것
httpServer.listen(3000, handleListen);

