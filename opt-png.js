const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const dist = path.join(process.cwd(), "dist");
let count = 0, saved = 0;
function walk(dir){
  for(const f of fs.readdirSync(dir)){
    const p = path.join(dir, f);
    const s = fs.statSync(p);
    if(s.isDirectory()){ walk(p); continue; }
    if(!/\.(png|jpe?g)$/i.test(f)) continue;
    const buf = fs.readFileSync(p);
    const orig = buf.length;
    sharp(buf)
      .png({ quality: 80, compressionLevel: 9, palette: true })
      .jpeg({ quality: 80, mozjpeg: true })
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
