const express=require('express');
const http=require('http');
const {Server}=require('socket.io');
const path=require('path');
const app=express();const server=http.createServer(app);const io=new Server(server);
app.use(express.static(path.join(__dirname,'public')));
app.get('/health', (_req,res)=>res.json({status:'ok'}));
const rooms=new Map();
const SUITS=['♠','♥','♦','♣'];
function deck(){let d=[];for(let s of SUITS)for(let r=1;r<=13;r++)d.push({s,r});for(let i=d.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}return d}
function score(cards){return cards.reduce((a,c)=>a+Math.min(c.r,10),0)%10}
function publicRoom(room){return {code:room.code,phase:room.phase,round:room.round,players:room.players.map(p=>({id:p.id,name:p.name,chips:p.chips,ready:p.ready,cardCount:p.cards.length,score:room.phase==='results'?score(p.cards):null,cards:room.phase==='results'?p.cards:undefined})),message:room.message,host:room.players[0]?.id}}
function emit(room){io.to(room.code).emit('room',publicRoom(room));for(let p of room.players)io.to(p.id).emit('hand',p.cards)}
function getRoom(socket){const code=socket.data.code;return code&&rooms.get(code)}
function error(socket,msg){socket.emit('notice',msg)}
io.on('connection',socket=>{
 socket.on('join',({code,name})=>{code=String(code||'').trim().toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8);name=String(name||'Player').trim().slice(0,18)||'Player';if(!code)return error(socket,'Enter a room code');let room=rooms.get(code);if(!room){room={code,phase:'lobby',round:0,players:[],message:'Waiting for players'};rooms.set(code,room)}if(room.players.length>=6)return error(socket,'Room is full');if(room.phase==='playing')return error(socket,'Round in progress; try again shortly');if(getRoom(socket))return error(socket,'Already in a room');const p={id:socket.id,name,chips:1000,ready:false,cards:[]};room.players.push(p);socket.join(code);socket.data.code=code;emit(room)});
 socket.on('ready',()=>{const r=getRoom(socket);if(!r||r.phase==='playing')return;const p=r.players.find(x=>x.id===socket.id);if(p){p.ready=!p.ready;emit(r)}});
 socket.on('start',()=>{const r=getRoom(socket);if(!r||r.phase==='playing')return;if(r.players[0]?.id!==socket.id)return error(socket,'Only the host can deal');if(r.players.length<2)return error(socket,'Need at least two players');if(!r.players.every(p=>p.ready))return error(socket,'All players must be ready');const d=deck();r.phase='playing';r.round++;r.message='Cards dealt. Host can reveal results.';for(const p of r.players){p.cards=[d.pop(),d.pop()];p.ready=false}emit(r)});
 socket.on('reveal',()=>{const r=getRoom(socket);if(!r||r.phase!=='playing'||r.players[0]?.id!==socket.id)return;const best=Math.max(...r.players.map(p=>score(p.cards)));const winners=r.players.filter(p=>score(p.cards)===best);r.phase='results';r.message=`Winner${winners.length>1?'s':''}: ${winners.map(p=>p.name).join(', ')} (${best} points). No chips transferred.`;emit(r)});
 socket.on('reset',()=>{const r=getRoom(socket);if(!r||r.phase!=='results'||r.players[0]?.id!==socket.id)return;r.phase='lobby';r.message='Ready for next round';r.players.forEach(p=>{p.cards=[];p.ready=false});emit(r)});
 socket.on('disconnect',()=>{const r=getRoom(socket);if(!r)return;r.players=r.players.filter(p=>p.id!==socket.id);if(!r.players.length)rooms.delete(r.code);else{if(r.phase==='playing'){r.phase='lobby';r.players.forEach(p=>{p.cards=[];p.ready=false});r.message='A player disconnected. Round cancelled.'}emit(r)}});
});
server.listen(process.env.PORT||3000,()=>console.log('Shan Koe Mee demo on port '+(process.env.PORT||3000)));
