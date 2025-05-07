import { EventEmitter } from 'node:events';
import { Mutex } from 'async-mutex';

// tạo 1 event 
const bus = new EventEmitter();

// tạo một Mutex để bảo vệ shared counter (để đếm số lần tăng)
// mutex cho phép chỉ một task được chạy trong vùng bảo vệ tại 1 thời điểm
const mutex = new Mutex();
let sharedCounter = 0;

//listener cho event increment
bus.on('increment', async (taskId: number) => {
  console.log(`Task ${taskId} nhận sk increment, chuẩn bị vào`);

  //Chỉ một task được chạy tại 1 thời điểm
  await mutex.runExclusive(async () => {
    const before = sharedCounter;
    console.log(`   [${taskId}] Trước: ${before}`);

    // bị delay 200ms 
    await new Promise(r => setTimeout(r, 200));

    sharedCounter = before + 1;
    console.log(`   [${taskId}] Sau:  ${sharedCounter}`);
  });

  console.log(`Task ${taskId} đã thoát \n`);
});

// thử phát nhiều event random độ trễ
function emitTasks(count: number) {
  for (let i = 1; i <= count; i++) {
    setTimeout(() => {
      console.log(`\n Bắt đầu event increment từ Task ${i}`);
      bus.emit('increment', i);
    }, Math.random() * 1000);
  }
}

// demo 5 tasks
emitTasks(5);
