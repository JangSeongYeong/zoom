import express from "express"; //express모듈 가져오기
import http from "http";
import path from 'path';
import {Server} from "socket.io";
import {instrument} from "@socket.io/admin-ui";
const __dirname = path.resolve();

const app = express(); //express 함수를 호출하여 Express 애플리케이션의 인스턴스를 생성 app변수는 웹 서버의 동작을 구성하고 정의하는데 사용

app.set("view engine", "pug"); //Pug로 view engine 설정
app.set("views", __dirname + "/src/views"); //Express에 template이 어디 있는지 지정
app.use("/public", express.static(__dirname + "/src/public"));
app.get("/", (_, res) => res.render("home")); // home.pug를 reder해주는 route hadler를 만듬
app.get("/*", (_, res) => res.redirect("/"));


const httpServer = http.createServer(app); // http 작동
const wsServer = new Server(httpServer);

wsServer.on("connection", (socket) => {
    socket.on("join_room", (roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit("welcome"); //3.4
    });
    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
    });
    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    });
    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
//app.listen(3000, handleListen); //Express 애플리케이션이 포트 3000에서 들어오는 http요청 수신대기를 시작하도록 지시함, Express 서버를 시작하고 들어오는 트래픽 처리를 시작하게 하는 것
httpServer.listen(3000, handleListen);
