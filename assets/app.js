const state = { all: [], filtered: [], charts: {} };
const $ = (id) => document.getElementById(id);

const demoData = [
['Volkswagen','Passat',2012,12300,'Минск'],['Volkswagen','Polo',2018,14800,'Гомель'],['Volkswagen','Tiguan',2017,22900,'Минск'],['Volkswagen','Passat',2015,16900,'Брест'],['Volkswagen','Golf',2014,13700,'Минск'],
['BMW','5 series',2016,28700,'Минск'],['BMW','3 series',2014,21300,'Гродно'],['BMW','X5',2017,40900,'Минск'],['BMW','5 series',2013,19400,'Витебск'],
['Mercedes-Benz','E-class',2015,26900,'Минск'],['Mercedes-Benz','C-class',2016,24400,'Брест'],['Mercedes-Benz','E-class',2012,17800,'Могилёв'],
['Audi','A6',2014,22900,'Минск'],['Audi','A4',2016,23100,'Гомель'],['Audi','Q7',2015,33700,'Минск'],['Audi','A6',2011,15400,'Гродно'],
['Renault','Duster',2019,18100,'Брест'],['Renault','Logan',2018,11900,'Минск'],['Renault','Megane',2015,13300,'Витебск'],
['Skoda','Octavia',2018,18900,'Минск'],['Skoda','Rapid',2019,16300,'Гомель'],['Skoda','Octavia',2016,15700,'Брест'],
['Toyota','Camry',2017,26900,'Минск'],['Toyota','RAV4',2018,30100,'Минск'],['Toyota','Corolla',2016,17200,'Гродно'],
['Ford','Mondeo',2015,14600,'Могилёв'],['Ford','Focus',2017,15100,'Минск'],['Nissan','Qashqai',2018,20900,'Гомель'],['Nissan','X-Trail',2017,22200,'Минск'],['Volvo','XC60',2016,25700,'Брест']
].map((r,i)=>({source_id:`demo-${i+1}`,brand:r[0],model:r[1],year:r[2],price_usd:r[3],city:r[4],url:''}));

function parseCSV(text){
  const rows=[]; let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i], next=text[i+1];
    if(c==='"' && quoted && next==='"'){cell+='"';i++;continue}
    if(c==='"'){quoted=!quoted;continue}
    if(c===',' && !quoted){row.push(cell.trim());cell='';continue}
    if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&next==='\n')i++;row.push(cell.trim());cell='';if(row.some(Boolean))rows.push(row);row=[];continue}
    cell+=c;
  }
  if(cell||row.length){row.push(cell.trim());rows.push(row)}
  if(rows.length<2) throw new Error('CSV не содержит строк данных');
  const headers=rows[0].map(h=>h.toLowerCase().replace(/^\ufeff/,'').trim());
  const aliases={brand:['brand','марка'],model:['model','модель'],year:['year','год'],price_usd:['price_usd','price','цена'],city:['city','город'],url:['url','ссылка'],source_id:['source_id','id']};
  const index={}; Object.entries(aliases).forEach(([key,names])=>index[key]=headers.findIndex(h=>names.includes(h)));
  if(index.brand<0||index.model<0||index.year<0) throw new Error('Нужны колонки brand, model и year');
  return rows.slice(1).map((r,i)=>({
    source_id:index.source_id>=0?r[index.source_id]:String(i+1),brand:(r[index.brand]||'').trim(),model:(r[index.model]||'').trim(),year:Number(r[index.year])||0,
    price_usd:index.price_usd>=0?Number(String(r[index.price_usd]).replace(/[^\d.]/g,''))||0:0,city:index.city>=0?r[index.city]||'': '',url:index.url>=0?r[index.url]||'':''
  })).filter(x=>x.brand&&x.model&&x.year);
}
function countBy(rows,key,combine){const m=new Map();rows.forEach(x=>{const k=combine?combine(x):x[key];m.set(k,(m.get(k)||0)+1)});return [...m].map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count)}
function money(n){return n?new Intl.NumberFormat('ru-RU',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n):'—'}
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2500)}
function createChart(id,type,labels,data,horizontal=false){if(state.charts[id])state.charts[id].destroy();state.charts[id]=new Chart($(id),{type,data:{labels,datasets:[{data,borderRadius:7,backgroundColor:labels.map((_,i)=>i===0?'#2864dc':'#9eb9ea'),borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:horizontal?'y':'x',plugins:{legend:{display:false},tooltip:{displayColors:false}},scales:{x:{grid:{color:'#edf0f5'},ticks:{color:'#8a94a6',font:{size:10}}},y:{grid:{display:!horizontal,color:'#edf0f5'},ticks:{color:'#657086',font:{size:10}}}}}})}
function applyFilters(){const q=$('searchInput').value.trim().toLowerCase(),brand=$('brandFilter').value,from=Number($('yearFrom').value)||0,to=Number($('yearTo').value)||9999;state.filtered=state.all.filter(x=>(!q||`${x.brand} ${x.model}`.toLowerCase().includes(q))&&(!brand||x.brand===brand)&&x.year>=from&&x.year<=to);render()}
function render(){const r=state.filtered,brands=countBy(r,'brand'),models=countBy(r,null,x=>`${x.brand} ${x.model}`),years=countBy(r,'year').sort((a,b)=>Number(a.name)-Number(b.name));
 $('totalListings').textContent=r.length.toLocaleString('ru-RU');$('listingDelta').textContent=state.all.length?`${Math.round(r.length/state.all.length*100)}% от загруженных`:'Нет данных';
 const priced=r.filter(x=>x.price_usd);$('avgPrice').textContent=money(priced.reduce((s,x)=>s+x.price_usd,0)/(priced.length||1));$('topBrand').textContent=brands[0]?.name||'—';$('topBrandShare').textContent=brands[0]?`${Math.round(brands[0].count/r.length*100)}% выборки`:'—';
 $('avgYear').textContent=r.length?Math.round(r.reduce((s,x)=>s+x.year,0)/r.length):'—';$('yearRange').textContent=years.length?`${years[0].name}–${years.at(-1).name}`:'—';$('brandCount').textContent=`${brands.length} марок`;
 createChart('brandsChart','bar',brands.slice(0,8).map(x=>x.name),brands.slice(0,8).map(x=>x.count),true);createChart('yearsChart','line',years.map(x=>x.name),years.map(x=>x.count));createChart('modelsChart','bar',models.slice(0,10).map(x=>x.name),models.slice(0,10).map(x=>x.count),true);
 renderSegments(r);renderTable(r);}
function renderSegments(rows){const segs=[['до $10k',0,10000],['$10–15k',10000,15000],['$15–20k',15000,20000],['$20–30k',20000,30000],['$30k+',30000,Infinity]],priced=rows.filter(x=>x.price_usd),counts=segs.map(s=>priced.filter(x=>x.price_usd>=s[1]&&x.price_usd<s[2]).length),max=Math.max(...counts,1);$('priceSegments').innerHTML=segs.map((s,i)=>`<div class="price-row"><span>${s[0]}</span><div class="progress"><i style="width:${counts[i]/max*100}%"></i></div><b>${counts[i]}</b></div>`).join('')}
function renderTable(rows){$('emptyState').style.display=rows.length?'none':'block';$('listingsBody').innerHTML=rows.slice(0,100).map(x=>`<tr><td><b>${escapeHtml(x.brand)}</b></td><td>${escapeHtml(x.model)}</td><td>${x.year}</td><td>${money(x.price_usd)}</td><td>${escapeHtml(x.city||'—')}</td><td>${x.url?`<a target="_blank" rel="noopener" href="${escapeAttr(x.url)}">Открыть ↗</a>`:'—'}</td></tr>`).join('')}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function escapeAttr(v){return escapeHtml(v)}
function setData(data,label){state.all=data;state.filtered=data;const brands=[...new Set(data.map(x=>x.brand))].sort();$('brandFilter').innerHTML='<option value="">Все марки</option>'+brands.map(x=>`<option>${escapeHtml(x)}</option>`).join('');render();toast(`${label}: ${data.length} объявлений`)}
$('fileInput').addEventListener('change',async e=>{try{const f=e.target.files[0];if(!f)return;setData(parseCSV(await f.text()),f.name)}catch(err){toast(err.message)}});$('demoButton').onclick=()=>setData(demoData,'Демо загружено');['searchInput','brandFilter','yearFrom','yearTo'].forEach(id=>$(id).addEventListener(id==='searchInput'?'input':'change',applyFilters));$('resetFilters').onclick=()=>{['searchInput','brandFilter','yearFrom','yearTo'].forEach(id=>$(id).value='');applyFilters()};
$('exportButton').onclick=()=>{if(!state.filtered.length)return toast('Нет данных для экспорта');const header='source_id,brand,model,year,price_usd,city,url\n',body=state.filtered.map(x=>[x.source_id,x.brand,x.model,x.year,x.price_usd,x.city,x.url].map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n'),blob=new Blob([header+body],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='analytics-filtered.csv';a.click();URL.revokeObjectURL(a.href)};
setData(demoData,'Демо загружено');
