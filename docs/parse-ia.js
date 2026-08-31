const fs=require('fs')
const dec=s=>s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&')
let shared=[]
const sp='x/xl/sharedStrings.xml'
if(fs.existsSync(sp)){
  const s=fs.readFileSync(sp,'utf8')
  shared=[...s.matchAll(/<si>([\s\S]*?)<\/si>/g)].map(m=>
    [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(t=>dec(t[1])).join(''))
}
const sheet=fs.readFileSync('x/xl/worksheets/sheet1.xml','utf8')
const rows={}
// 자기완결 셀(<c .../>)과 값 있는 셀(<c ...>..</c>)을 모두 처리
for(const m of sheet.matchAll(/<c r="([A-Z]+)(\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)){
  const [,col,rn,attrs,body]=m
  if(body===undefined) continue
  const vm=body.match(/<v>([\s\S]*?)<\/v>/), tm=body.match(/<t[^>]*>([\s\S]*?)<\/t>/)
  let v=''
  if(/\bt="s"/.test(attrs)&&vm) v=shared[+vm[1]]??''
  else if(/\bt="(inlineStr|str)"/.test(attrs)&&tm) v=dec(tm[1])
  else if(vm) v=dec(vm[1])
  v=v.trim(); if(!v) continue
  ;(rows[+rn]=rows[+rn]||{})[col]=v
}
const colN=c=>[...c].reduce((a,ch)=>a*26+ch.charCodeAt(0)-64,0)
const nCol=n=>{let s='';while(n>0){const r=(n-1)%26;s=String.fromCharCode(65+r)+s;n=(n-1-r)/26}return s}
for(const m of [...sheet.matchAll(/<mergeCell ref="([A-Z]+)(\d+):([A-Z]+)(\d+)"/g)]){
  const v=rows[+m[2]]?.[m[1]]; if(!v) continue
  for(let r=+m[2];r<=+m[4];r++) for(let c=colN(m[1]);c<=colN(m[3]);c++) (rows[r]=rows[r]||{})[nCol(c)]=v
}
fs.writeFileSync('parsed.json',JSON.stringify(rows))
const nums=Object.keys(rows).map(Number).sort((a,b)=>a-b)
console.log('데이터 행:',nums.length)
for(const n of nums.slice(0,12)) console.log(String(n).padStart(4), JSON.stringify(rows[n]))

/*
 * ia-list.xlsx → 화면ID 목록 파서 (의존성 없음)
 * 사용법:
 *   cd <scratch>; cp draft/기획서/ia-list.xlsx t.zip; unzip -q t.zip -d x
 *   node parse-ia.js            # parsed.json 생성
 * 주의: 빈 셀은 <c .../> 자기완결형이라 정규식에서 반드시 /> 분기를 처리해야 한다.
 *      안 그러면 다음 셀 값을 끌어와 행이 통째로 밀린다.
 */
