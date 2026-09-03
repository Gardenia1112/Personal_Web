/**
 * 命名校验脚本（原生解析，不依赖 three / GLTFLoader）
 *
 * 作用：
 *   1. 读取 public/models/room_full.glb
 *   2. 手动解析 glb 的 chunk 结构，从 JSON chunk 里取出所有 mesh / node 名字
 *   3. 核对是否符合 obj_* 规范、是否覆盖必需物件
 *
 * 用法：
 *   node scripts/check-glb-names.cjs
 *   node scripts/check-glb-names.cjs public/models/xxx.glb   (指定别的文件)
 */
const fs = require('fs');

const GLB_PATH = process.argv[2] || 'public/models/room_full.glb';

// ===== 架构规定的必需物件（手册 §0 映射表）=====
const REQUIRED = {
  obj_computer: '电脑 → /desktop',
  obj_gamepad:  '手柄 → /about',
  obj_notebook: '日记本 → /contact',
  obj_filepile: '文件堆 → /awards',
  obj_lamp:     '台灯 → 昼夜切换',
  obj_coffee:   '咖啡杯 → 奶茶彩蛋',
};

// 允许存在但不强制（装饰物，无需 obj_ 前缀也不会报警）
const OPTIONAL = [
  // 房间结构
  'room_shell', 'room', 'floor', 'wall', 'desk',
  // 鼠标（已是中文名，按子串匹配）
  '鼠标', '鼠标垫', '中键', '左右键', '鼠标盖',
  // 键盘
  'keyboard', 'Keyboard',
  // 平面 / 立方体 / 柱体 / Object（Blender 默认名，纯装饰）
  '平面', '立方体', '柱体', 'Cube', 'Object',
  // 其他
  'Case',
];
// ===== 0. 文件存在性检查 =====
if (!fs.existsSync(GLB_PATH)) {
  console.error('❌ 找不到文件：' + GLB_PATH);
  console.error('   用法: node scripts/check-glb-names.js [glb路径]');
  process.exit(1);
}

const buffer = fs.readFileSync(GLB_PATH);
const u32 = new Uint32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4);
const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

console.log('\n📦 文件: ' + GLB_PATH);
console.log('📦 大小: ' + (buffer.length / 1024 / 1024).toFixed(2) + ' MB\n');

// ===== 1. 解析 glb 头（12 字节）=====
// 偏移 0: magic(4)  偏移 4: version(4)  偏移 8: totalLength(4)
const magic   = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
const version = view.getUint32(4, true);   // little-endian
const totalLen = view.getUint32(8, true);

if (magic !== 'glTF') {
  console.error('❌ 这不是 glTF 文件（magic = "' + magic + '"）');
  process.exit(1);
}
if (version !== 2) {
  console.error('❌ 仅支持 glTF 2.0，当前 version = ' + version);
  process.exit(1);
}
if (totalLen !== buffer.length) {
  console.warn('⚠️  头声明长度(' + totalLen + ') ≠ 文件实际大小(' + buffer.length + ')，文件可能损坏');
}
console.log('✅ glb 头校验通过：glTF 2.0\n');

// ===== 2. 遍历所有 chunk，找到 JSON chunk =====
// chunk 结构：length(4) + type(4) + data(length)
// type = 0x4E4F534A "JSON"  或  0x004E4942 "BIN\0"
let offset = 12; // 跳过头
let jsonText = null;

while (offset < buffer.length) {
  const chunkLen = view.getUint32(offset, true);
  const typeBytes = [view.getUint8(offset + 4), view.getUint8(offset + 5),
                     view.getUint8(offset + 6), view.getUint8(offset + 7)];
  const typeStr = String.fromCharCode(...typeBytes);
  const dataStart = offset + 8;

  if (typeStr === 'JSON ') {
    // JSON chunk（注意 type 是 "JSON" 后跟一个空格，即 0x4E4F534A + 0x20）
    jsonText = buffer.slice(dataStart, dataStart + chunkLen).toString('utf8');
    break;
  }
  // 也兼容 type = "JSON"（无空格）的写法
  if (typeStr.replace(/\0/g, '').trim() === 'JSON') {
    jsonText = buffer.slice(dataStart, dataStart + chunkLen).toString('utf8');
    break;
  }

  offset = dataStart + chunkLen;
  // chunk 按 4 字节对齐
  if (chunkLen % 4 !== 0) offset += 4 - (chunkLen % 4);
}

if (!jsonText) {
  console.error('❌ 未在 glb 中找到 JSON chunk，无法解析 mesh 名');
  process.exit(1);
}

// ===== 3. 解析 JSON，提取所有 mesh 名 =====
let gltf;
try {
  gltf = JSON.parse(jsonText);
} catch (e) {
  console.error('❌ JSON chunk 解析失败：' + e.message);
  process.exit(1);
}

// 收集所有 mesh 名（nodes 里带 mesh 引用的节点名）
const meshNames = [];
const nodeNames = [];
const usedMeshIndices = new Set();

if (gltf.nodes && gltf.meshes) {
  // 先收集所有 mesh 自身的 name
  gltf.meshes.forEach((m, i) => {
    if (m.name) meshNames.push(m.name);
  });
  // 再收集引用了 mesh 的 node 名（Raycaster 命中的是 node）
  gltf.nodes.forEach((node) => {
    if (node.mesh !== undefined && node.name) {
      nodeNames.push(node.name);
    }
  });
}

// 去重
const allNames = Array.from(new Set([...nodeNames, ...meshNames]));

console.log('--- 所有 mesh / node 名 ---');
if (allNames.length === 0) {
  console.log('  （无，可能模型未命名或结构异常）');
} else {
  allNames.forEach((n) => console.log('  · ' + n));
}
console.log('');

// ===== 4. 必需物件核对 =====
console.log('--- 必需物件核对 ---');
let missing = 0;
for (const [name, desc] of Object.entries(REQUIRED)) {
  const found = allNames.some((n) => n === name || n.includes(name));
  console.log('  ' + (found ? '✅' : '❌') + ' ' + name.padEnd(16) + ' ' + desc);
  if (!found) missing++;
}
console.log('');

// ===== 5. 命名规范检查 =====
const bad = allNames.filter((n) => {
  if (/^obj_/.test(n)) return false;       // 符合规范
  if (OPTIONAL.some((o) => n.toLowerCase().includes(o))) return false; // 装饰白名单
  return true;
});
console.log('--- 命名规范 ---');
if (bad.length) {
  console.log('  ⚠️  以下 mesh 未以 "obj_" 开头（可能无法被点击判定命中）:');
  bad.forEach((n) => console.log('    · ' + n));
  console.log('\n  → 建议：回 Blender 给这些 mesh 加上 "obj_" 前缀');
} else {
  console.log('  ✅ 所有 mesh 命名规范 OK');
}

console.log('');
if (missing) {
  console.error('❌ 缺少 ' + missing + ' 个必需物件，请回 Blender 核对命名！');
  process.exit(1);
}
console.log('🎉 全部必需物件齐全，命名规范通过！');