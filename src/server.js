import express from "express"; //express모듈 가져오기
import http from "http";
import {WebSocketServer} from "ws";
import path from 'path';
const __dirname = path.resolve();

const app = express(); //express 함수를 호출하여 Express 애플리케이션의 인스턴스를 생성 app변수는 웹 서버의 동작을 구성하고 정의하는데 사용

app.set("view engine", "pug"); //Pug로 view engine 설정
app.set("views", __dirname + "/src/views"); //Express에 template이 어디 있는지 지정
app.use("/public", express.static(__dirname + "/src/public"));
app.get("/", (_, res) => res.render("home")); // home.pug를 reder해주는 route hadler를 만듬
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
//app.listen(3000, handleListen); //Express 애플리케이션이 포트 3000에서 들어오는 http요청 수신대기를 시작하도록 지시함, Express 서버를 시작하고 들어오는 트래픽 처리를 시작하게 하는 것

const server = http.createServer(app); // http 작동
const wss = new WebSocketServer({ server }); // WebSocket 작동
//둘이 같이 만들 필요는 없다.

const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon";
    console.log("Connected to Browser 👍");
    socket.on("close", () => console.log("Disconnected to Browser 🙅‍♂️"))
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        switch (message.type){
            case "new_message":
                sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`));
            case "nickname":
                socket["nickname"] = message.payload;
        }
    });
});

server.listen(3000, handleListen);

