const BASE = 'https://apis.data.go.kr/B551011/KorService2';
const clean = value => String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim().slice(0,1200);
export function distanceKm(a,b) {
  const rad = n => n * Math.PI / 180;
  const h = Math.sin(rad(b.lat-a.lat)/2)**2 + Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(rad(b.lng-a.lng)/2)**2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(h),Math.sqrt(1-h)) * 100) / 100;
}
async function tour(op, values) {
  if (!process.env.DATA_GO_KR_KEY) throw new Error('관광정보 연결 미설정');
  const params = new URLSearchParams({ serviceKey:process.env.DATA_GO_KR_KEY,MobileOS:'ETC',MobileApp:'JejuWellness',_type:'json',pageNo:'1',numOfRows:'15',...values });
  const response = await fetch(`${BASE}/${op}?${params}`, { signal:AbortSignal.timeout(12000) });
  if(!response.ok) throw new Error('관광정보 조회 실패');
  const data = await response.json();
  if(data?.response?.header?.resultCode !== '0000') throw new Error('관광정보 응답 오류');
  const item=data.response.body?.items?.item;
  return item ? Array.isArray(item)?item:[item] : [];
}
export async function visitInfo({id, type='12',lat,lng}) {
  lat=Number(lat);lng=Number(lng);
  if(!Number.isFinite(lat)||!Number.isFinite(lng)||lat<=33||lat>=34||lng<=126||lng>=127) throw new Error('제주 장소의 유효한 좌표가 필요합니다.');
  if(id && (!/^\d{1,12}$/.test(String(id))||!['12','14','15','39'].includes(String(type)))) throw new Error('장소 정보가 올바르지 않습니다.');
  const point={lat,lng};
  const queries=[tour('locationBasedList2',{mapX:String(lng),mapY:String(lat),radius:'5000',contentTypeId:'39',arrange:'E'}),tour('locationBasedList2',{mapX:String(lng),mapY:String(lat),radius:'5000',contentTypeId:'12',arrange:'E'})];
  if(id) queries.push(tour('detailIntro2',{contentId:String(id),contentTypeId:String(type)}));
  const responses=await Promise.allSettled(queries);
  const nearby=index => responses[index].status==='fulfilled' ? responses[index].value.filter(x=>x.contentid!==String(id)&&Number(x.mapy)>33&&Number(x.mapy)<34&&Number(x.mapx)>126&&Number(x.mapx)<127).map(x=>({id:x.contentid,name:clean(x.title),addr:clean(x.addr1),lat:Number(x.mapy),lng:Number(x.mapx),distanceKm:distanceKm(point,{lat:Number(x.mapy),lng:Number(x.mapx)})})).filter(x=>x.distanceKm<=5).sort((a,b)=>a.distanceKm-b.distanceKm).slice(0,5) : [];
  const detail=responses[2]?.status==='fulfilled'?responses[2].value[0]??{}:{};
  return {parking:clean(detail.parking||detail.parkingculture||detail.parkingfood)||null,hours:clean(detail.usetime||detail.usetimeculture||detail.opentimefood||detail.playtime)||null,closed:clean(detail.restdate||detail.restdateculture||detail.restdatefood)||null,contact:clean(detail.infocenter||detail.infocenterculture||detail.infocenterfood)||null,food:nearby(0),places:nearby(1),warnings:responses.map((r,i)=>r.status==='rejected'?['주변 음식점 조회 실패','주변 장소 조회 실패','상세정보 조회 실패'][i]:null).filter(Boolean),source:'한국관광공사 TourAPI',queriedAt:new Date().toISOString(),distanceType:'직선거리',parkingAvailability:'실시간 주차 가능 대수는 제공하지 않습니다.'};
}
