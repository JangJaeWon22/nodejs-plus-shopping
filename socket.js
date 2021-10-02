const socketIo = require('socket.io');
const http = require('./app');
const io = socketIo(http); // http 객체를 Socket.io 모듈에 넘겨서 소켓 핸들러 생성

function initSocket(sock) {
  console.log('새로운 소켓이 연결됐어요!');

  // 연결된 모든 클라이언트에 데이터를 보낼때 사용될 함수
  function notifyEveryone(event, data) {
    io.emit(event, data);
  }

  return {
    watchBuying: () => { 
      sock.on('BUY', (data) => {
        const emitData = {
          ...data,
          date: new Date().toISOString(),
        };
        notifyEveryone('BUY_GOODS', emitData);
      });
    },

    watchByebye: () => {
      sock.on('disconnect', () => {
        console.log(sock.id, '연결이 끊어졌어요!');
      });
    },
  };
}

io.on('connection', (sock) => {
    const { watchBuying, watchByebye } = initSocket(sock);
  
    watchBuying();
    watchByebye();
  });
  