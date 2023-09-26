const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload){ 
    // send는 String밖에 인식을 못하기 때문에 Json형식을 String으로 변경해준다. 
    const msg = {type, payload};
    return JSON.stringify(msg);
}

socket.addEventListener("open", () => {
    console.log("Connected to Server 👍") //이모티콘 단축키 win + .
});

socket.addEventListener("message", (message) => {
    const li = document.createElement("li")
    li.innerText = message.data;
    messageList.append(li);
});

socket.addEventListener("close", () => {
    console.log("Disconnected to Server 🙅‍♂️")
}); 


function handleSubmit(event){
    event.preventDefault();
    const input = messageForm.querySelector("input"); //messageForm을 정의하고 Form안에 구성요소를 한번 더 정의
    socket.send(makeMessage("new_message", input.value));
    const li = document.createElement("li");
    li.innerText = `You: ${input.value}`;
    messageList.append(li);
    input.value = "";  // 입력창의 값을 비워줌
}

function handleNickSubmit(event){
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);