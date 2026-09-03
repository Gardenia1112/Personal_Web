const fs = require('fs');

const path = process.argv[2] || 'public/models/room_full.glb';
const buf = fs.readFileSync(path);

console.log('文件大小:', (buf.length / 1024 / 1024).toFixed(2), 'MB\n');

// 逐字节打印前 12 字节
console.log('前 12 字节 (hex):');
for (let i = 0; i < 12; i++) {
  process.stdout.write(buf[i].toString(16).padStart(2, '0') + ' ');
}
console.log('\n');

// 用 4 种方式解读版本号，看哪个合理
console.log('--- 版本号 4 种解读 ---');
console.log('  LE u32 at [8] :', buf.readUInt32LE(8));  // 小端
console.log('  BE u32 at [8] :', buf.readUInt32BE(8));  // 大端
console.log('  raw bytes[8..11] as hex:', 
  buf.slice(8, 12).toString('hex'));

// 完整结构
console.log('\n--- glb 头结构 ---');
console.log('  magic (4字节)     :', buf.slice(0, 4).toString('ascii'));
console.log('  total length (4字节 LE):', buf.readUInt32LE(4));
console.log('  version (4字节)   : 见上方 4 种解读');