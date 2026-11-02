export function preparation(weather, air) {
  const clothes=[],items=['물과 개인용 물병','충전된 휴대전화'],cautions=['영업시간·입장 가능 여부와 현장 통제를 방문 전에 확인하세요.'];
  const temp=weather?.temp;
  if(typeof temp==='number'&&Number.isFinite(temp)){
    if(temp<10)clothes.push('보온 겉옷과 여러 겹의 옷');
    else if(temp<20)clothes.push('가벼운 겉옷과 얇은 옷을 겹쳐 입기');
    else clothes.push('통기성 있는 옷과 실내 냉방에 대비한 얇은 겉옷');
  } else clothes.push('기온을 확인한 뒤 옷차림을 조절해 주세요.');
  if(weather&&(weather.rain!=='없음'||weather.pop>=50)){items.push('우산 또는 우비','물에 젖지 않는 신발');cautions.push('야외 길이 미끄러울 수 있어 현장 상태를 확인하세요.');}
  items.push('걷기 편한 신발');
  if(Number(air?.uv)>=3){items.push('모자와 자외선 차단용품');cautions.push('햇볕 노출이 긴 일정은 그늘과 휴식을 고려하세요.');}
  if(['민감군 주의','나쁨'].includes(air?.grade))cautions.push('대기질 모델 정보가 좋지 않습니다. 야외 활동 시간을 줄이고 개인 상태에 맞춰 조절하세요.');
  cautions.push('바람·기상특보·파도 정보는 이 안내로 확인되지 않습니다. 해안·오름 방문 전 공식 특보를 확인하세요.');
  return {clothes,items:[...new Set(items)],cautions};
}
