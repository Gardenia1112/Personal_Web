const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const dist = path.join(process.cwd(), "dist");
let count = 0, saved = 0;

// 这些文件需要保留透明/原始质量，跳过不压缩
const SKIP_NAMES = ["welcome-balloon"];
const SKIP_IN_PATH = ["封面", "cover", "-poster"];

function shouldSkip(name, fullPath){
  const n = name.toLowerCase();
  if(SKIP_NAMES.some(s => n.includes(s.toLowerCase()))) return true;
  if(SKIP_IN_PATH.some(s => fullPath.includes(s))) return true;
  return false;
}

function walk(dir){
  for(const f of fs.readdirSync(dir)){
    const p = path.join(dir, f);
    const s = fs.statSync(p);
    if(s.isDirectory()){ walk(p); continue; }
    if(!/\.(png|jpe?g)$/i.test(f)) continue;
    if(shouldSkip(f, p)){ count++; continue; }  // 跳过透明/封面图
    const buf = fs.readFileSync(p);
    const orig = buf.length;
    sharp(buf)
      .png({ quality: 85, compressionLevel: 9 })   // 无 palette，保透明
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer()
      .then(out => {
        if(out.length < orig){
          fs.writeFileSync(p, out);
          saved += (orig - out.length);
        }
        count++;
      })
      .catch(()=>{});
  }
}
walk(dist);
setTimeout(() => {
  console.log(`done: ${count} files, saved ${(saved/1024/1024).toFixed(2)} MB`);
}, 8000);
