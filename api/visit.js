import { visitInfo } from '../server/visit.js';
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'GET only'});
 try{const data=await visitInfo(req.query??{});res.setHeader('Cache-Control','public, s-maxage=3600');return res.status(200).json(data)}catch(e){return res.status(e.message.includes('올바르')||e.message.includes('좌표')?400:502).json({error:'방문 정보를 확인하지 못했습니다. 좌표와 연결 상태를 확인해 주세요.'})}
}
