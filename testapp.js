// 모듈 import
import { createServer } from "http";
import { Server } from "socket.io";
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

// 모듈 할당
const httpServer = createServer();      // http 모듈 할당
let io = new Server(httpServer, {       // io 모듈 할당
    // cors 설정 파트
    // 해당 서버 주소 외에 다른 주소(Server)에서 요청 할 시 옵션 추가
    cors: {
        origin: ['url1', 'url2'],
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    },
    // V2 - V3 버전간의 통신을 가능케 하는 옵션 (마이그레이션을 용이하기 위한 용도)
    allowEIO3: true,                     // default : false
    // 클라이언트와 연결 상태를 확인하는 옵션
    pingInterval: 10000,                 // ping을 어떤 시간 간격으로 보낼지 체크 ex, 10초(10000) 간격으로 ping을 날림
    pingTimeout: 5000                    // 연결이 끊켰을 시, 몇초 뒤에 연결을 끊을지 설정 ex, 5초(5000) 핑에 대한 답이 안온 뒤 5초 뒤 연결 끊음(재연결을 기다리는 시간)

});

let port = 6555;        // 서버 포트 값

// port - 해당 포트로 요청을 들음
httpServer.listen(port, () =>{
    console.log(`Success Open Server : %s`,port);
});

// 연결 성공
io.on("connection", socket => {
    console.log(`Connect Socket : %s`,socket.id);

    // 클라이언트에서 보낸
    // message.id 요청 분기를 나눠 실행

    // 방 입장 관련 리스너
    socket.on('room', message => {
        // 벙애 대헌 이벤트를 묶을 것
        // Validation 필요에 따라 로직 추가

        // 모든 이벤트의 공통 값을 할당할 경우 모아서 할당할 것
        let roomId = message.roomId;                                // 받은 메세지 값에서 방 고유값 할당
        let sendData = {                                            // 반환 메세지에 대한 form
            result: 'success' //or fail
            // 공통 된 형태를 묶어주기
            // 결과에 대한 값 json 형태로 보낼것
        }

       switch (message.id) {
           case 'join' :

               socket.join(roomId);                                 // 해당 방에 join
               console.log(`Success Join Room : %s`,roomId);

               let sendData = {                                     // 반환 메세지에 대한 form
                   // 결과에 대한 값 json 형태로 보낼것
               }
               socket.emit(sendData);                               // 해당 유저에게 메세지 보내기
               break;
           case 'reave' :
               socket.leave(roomId);                                // 해당 방에서 leave
               //or socket.rooms 데이터를 확인 후, 방ID를 찾아서 내보낼 것
               console.log(`Success Leave Room : %s`,roomId);


               io.in(roomId).emit(sendData);                        // 해당 방안에 있는 유저들에게 방을 떠났다는걸 알림
               break;
       }
    });

    // 채팅 관련 리스너
    socket.on('chat', message => {
        // 방에 입장해 있는 상태인지 체크
        // Validation 필요에 따라 로직 추가

        let sendData = {                                             // 반환 메세지에 대한 form
            // 결과에 대한 값 json 형태로 보낼것
        }
        switch (message.id) {
            case 'all' :
                let user = message.user;                             // 메세지를 보낸 유저
                let chatMessage = message.chatMessage;               // 보낸 채팅 메세지 내용

                io.in(roomId).emit(sendData);                        // 해당 방안에 있는 유저들에게 방을 떠났다는걸 알림
                break;
            case 'to' :
                // 득정 유저의 소켓 id를 받아 보내는 방식
                // 객체로 저장된 정보에서 유저를 찾아 보내는 방식
                // 방식에 따라 다르게 구현이 가능함
                break;
        }


    });


    // 클라이언트 - 서버 간의 연결이 끊키는 경우, 상황에 따라 예외처리 로직을 추가할 것
    socket.on('disconnect', data => {
        console.error(`Connection %s disconnect : %s`, socket.id, data);
        switch (data) {
            case 'server namespace disconnect' :
                // 서버 소켓이 socket.disconnect()로 강제로 연결 해제
                // console.log('서버 소켓이 socket.disconnect()로 강제로 연결 해제');
                break;
            case 'client namespace disconnect' :
                // 클라이언트가 socket.disconnect()를 사용하여 소켓을 수동으로 연결 해제
                // console.log('클라이언트가 socket.disconnect()를 사용하여 소켓을 수동으로 연결 해제');
                break;
            case 'server shutting down' :
                // 서버가 종료
                // console.log('서버가 종료');
                break;
            case 'ping timeout' :
                // 클라이언트가 pingTimeout지연 시간에 PONG 패킷을 보내지 않았습니다.
                // console.log('클라이언트가 pingTimeout지연 시간에 PONG 패킷을 보내지 않았습니다.');
                break;
            case 'transport close' :
                // 연결이 닫혔습니다(예: 사용자가 연결이 끊겼거나 네트워크가 WiFi에서 4G로 변경됨)
                // console.log('연결이 닫혔습니다(예: 사용자가 연결이 끊겼거나 네트워크가 WiFi에서 4G로 변경됨)');
                break;
            case 'transport error' :
                // 연결에 오류가 발생했습니다.
                // console.log('연결에 오류가 발생했습니다.');
                break;
        }
    });

    // 연결 에러에 대한 처리
    socket.on('error', error => {
        console.error(`Connection %s error : %s`, socket.id, error);
    });


});

