import { useEffect, useState } from 'react'
import { fetchImages } from '../api/client'
const cache=new Map(),pending=new Map()
export function useImages(topic,count=6){
 const [state,setState]=useState({topic,items:cache.get(topic)||[],error:''})
 useEffect(()=>{let active=true;if(!pending.has(topic))pending.set(topic,cache.has(topic)?Promise.resolve(cache.get(topic)):fetchImages(topic,12).then(items=>{cache.set(topic,items);return items}).catch(e=>{pending.delete(topic);throw e}));pending.get(topic).then(items=>{if(active)setState({topic,items,error:''})}).catch(e=>{if(active)setState({topic,items:[],error:e.message})});return ()=>{active=false}},[topic])
 return {items:(state.topic===topic?state.items:cache.get(topic)||[]).slice(0,count),error:state.topic===topic?state.error:''}
}
