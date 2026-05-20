var Ae=Object.defineProperty;var Ie=(e,t,n)=>t in e?Ae(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var i=(e,t,n)=>Ie(e,typeof t!="symbol"?t+"":t,n);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const l of a.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&s(l)}).observe(document,{childList:!0,subtree:!0});function n(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(o){if(o.ep)return;o.ep=!0;const a=n(o);fetch(o.href,a)}})();const ht="spring",ft="summer",mt="autumn",gt="winter",Ee={SPRING:ht,SUMMER:ft,AUTUMN:mt,WINTER:gt},Me=[ht,ft,mt,gt],je={[ht]:"🌸 Xuân",[ft]:"☀️ Hạ",[mt]:"🍂 Thu",[gt]:"❄️ Đông"};window.SEASON_SPRING=ht;window.SEASON_SUMMER=ft;window.SEASON_AUTUMN=mt;window.SEASON_WINTER=gt;window.SEASON=Ee;window.SEASONS=Me;window.SEASON_LABELS=je;class v{constructor(t={}){this.plot_key=t.plot_key||"",this.plant_id=t.plant_id||this.constructor.id,this.status=typeof t.status=="number"?t.status:0,this.planted_at=t.planted_at||Date.now(),this.is_wrong_season=typeof t.is_wrong_season=="boolean"?t.is_wrong_season:!1,this.fertilizer_type=typeof t.fertilizer_type=="number"?t.fertilizer_type:0,this.current_water=typeof t.current_water=="number"?t.current_water:0,this.last_watered_at=t.last_watered_at||null,this.bug_started_at=t.bug_started_at||null,this.pesticide_until=t.pesticide_until||null,this.lost_yield_by_water=typeof t.lost_yield_by_water=="number"?t.lost_yield_by_water:0,this.lost_yield_by_bug=typeof t.lost_yield_by_bug=="number"?t.lost_yield_by_bug:0,this.last_calculated_at=t.last_calculated_at||Date.now(),this.grown_ms=typeof t.grown_ms=="number"?t.grown_ms:0,this.rot_ms=typeof t.rot_ms=="number"?t.rot_ms:0}get id(){return this.constructor.id}get name(){return this.constructor.name}get season(){return this.constructor.season}get buy_price(){return this.constructor.buy_price}get sell_price_per_yield(){return this.constructor.sell_price_per_yield}get base_yield(){return this.constructor.base_yield}get growth_time(){return this.constructor.growth_time}get rot_time(){return this.constructor.rot_time}get water_consume_per_hour(){return this.constructor.water_consume_per_hour}get drought_penalty_per_hour(){return this.constructor.drought_penalty_per_hour}get bug_penalty_per_hour(){return this.constructor.bug_penalty_per_hour}get emoji(){return this.constructor.emoji}toJSON(){return{plot_key:this.plot_key,plant_id:this.plant_id,status:this.status,planted_at:this.planted_at,is_wrong_season:this.is_wrong_season,fertilizer_type:this.fertilizer_type,current_water:this.current_water,last_watered_at:this.last_watered_at,bug_started_at:this.bug_started_at,pesticide_until:this.pesticide_until,lost_yield_by_water:this.lost_yield_by_water,lost_yield_by_bug:this.lost_yield_by_bug,last_calculated_at:this.last_calculated_at,grown_ms:this.grown_ms,rot_ms:this.rot_ms}}calcGrossYield(){var s;const t=this.is_wrong_season?.5:1,n=((s=window.FERTILIZER_DATA&&window.FERTILIZER_DATA[this.fertilizer_type])==null?void 0:s.multiplier)||1;return Math.round(this.base_yield*t*n)}calcNetYield(){const t=this.calcGrossYield(),n=t*.6,s=Math.min(n,this.lost_yield_by_bug),o=this.lost_yield_by_water+s;return Math.max(1,t-Math.floor(o))}lazyUpdate(t=Date.now()){var d;const n=t-this.last_calculated_at;if(n<=0)return this;const s=this.growth_time*6e4*(((d=window.FERTILIZER_DATA&&window.FERTILIZER_DATA[this.fertilizer_type])==null?void 0:d.time_multiplier)||1);let o=0;const a=this.calcGrossYield();if(this.status===0){const u=s-this.grown_ms,c=this.water_consume_per_hour>0?this.current_water/this.water_consume_per_hour*36e5:1/0;o=Math.min(n,c,u),o<0&&(o=0);const p=o/36e5;if(this.water_consume_per_hour>0&&(this.current_water=Math.max(0,this.current_water-this.water_consume_per_hour*p)),o>0){if(this.bug_started_at){const f=this.pesticide_until&&this.pesticide_until>this.last_calculated_at;let _=0;f?this.pesticide_until<this.last_calculated_at+o&&(_=(this.last_calculated_at+o-this.pesticide_until)/36e5):_=p,this.lost_yield_by_bug+=_*this.base_yield*this.bug_penalty_per_hour;const m=a*.6;this.lost_yield_by_bug>m&&(this.lost_yield_by_bug=m)}if(!this.bug_started_at&&(!this.pesticide_until||this.pesticide_until<t)){const f=1-Math.pow(.7,p);Math.random()<f&&(this.bug_started_at=this.last_calculated_at+Math.random()*o)}}if(this.grown_ms+=o,this.grown_ms>=s){this.status=1,this.bug_started_at=null;const f=n-o;f>0&&(this.rot_ms+=f)}}else this.status===1&&(this.rot_ms+=n);return this.status===1&&this.rot_ms>=this.rot_time*6e4&&(this.status=2),a-this.lost_yield_by_water-this.lost_yield_by_bug<=0&&this.status!==2&&(this.status=2),this.last_calculated_at=t,this}}let Le=class{constructor(t={}){this.zone=typeof t.zone=="number"?t.zone:0,this.index=typeof t.index=="number"?t.index:0,this.locked=typeof t.locked=="boolean"?t.locked:!0}toJSON(){return{zone:this.zone,index:this.index,locked:this.locked}}};class S extends v{}i(S,"id","p01"),i(S,"name","Dâu tây"),i(S,"season",SEASON_SPRING),i(S,"buy_price",30),i(S,"sell_price_per_yield",5),i(S,"base_yield",9),i(S,"growth_time",15),i(S,"rot_time",1440),i(S,"water_consume_per_hour",16.67),i(S,"drought_penalty_per_hour",.05),i(S,"bug_penalty_per_hour",.03),i(S,"emoji","🍓");class $ extends v{}i($,"id","p02"),i($,"name","Cải xanh"),i($,"season",SEASON_SPRING),i($,"buy_price",200),i($,"sell_price_per_yield",9),i($,"base_yield",40),i($,"growth_time",360),i($,"rot_time",1440),i($,"water_consume_per_hour",16.67),i($,"drought_penalty_per_hour",.05),i($,"bug_penalty_per_hour",.03),i($,"emoji","🥬");class k extends v{}i(k,"id","p03"),i(k,"name","Hoa tulip"),i(k,"season",SEASON_SPRING),i(k,"buy_price",600),i(k,"sell_price_per_yield",12),i(k,"base_yield",110),i(k,"growth_time",720),i(k,"rot_time",1440),i(k,"water_consume_per_hour",16.67),i(k,"drought_penalty_per_hour",.05),i(k,"bug_penalty_per_hour",.03),i(k,"emoji","🌷");class T extends v{}i(T,"id","p04"),i(T,"name","Cà rốt"),i(T,"season",SEASON_SPRING),i(T,"buy_price",1500),i(T,"sell_price_per_yield",15),i(T,"base_yield",260),i(T,"growth_time",1440),i(T,"rot_time",1440),i(T,"water_consume_per_hour",16.67),i(T,"drought_penalty_per_hour",.05),i(T,"bug_penalty_per_hour",.03),i(T,"emoji","🥕");class A extends v{}i(A,"id","p05"),i(A,"name","Cà chua"),i(A,"season",SEASON_SUMMER),i(A,"buy_price",40),i(A,"sell_price_per_yield",6),i(A,"base_yield",10),i(A,"growth_time",15),i(A,"rot_time",1440),i(A,"water_consume_per_hour",16.67),i(A,"drought_penalty_per_hour",.05),i(A,"bug_penalty_per_hour",.03),i(A,"emoji","🍅");class I extends v{}i(I,"id","p06"),i(I,"name","Ớt chuông"),i(I,"season",SEASON_SUMMER),i(I,"buy_price",250),i(I,"sell_price_per_yield",10),i(I,"base_yield",45),i(I,"growth_time",360),i(I,"rot_time",1440),i(I,"water_consume_per_hour",16.67),i(I,"drought_penalty_per_hour",.05),i(I,"bug_penalty_per_hour",.03),i(I,"emoji","🫑");class E extends v{}i(E,"id","p07"),i(E,"name","Ngô"),i(E,"season",SEASON_SUMMER),i(E,"buy_price",700),i(E,"sell_price_per_yield",14),i(E,"base_yield",110),i(E,"growth_time",720),i(E,"rot_time",1440),i(E,"water_consume_per_hour",16.67),i(E,"drought_penalty_per_hour",.05),i(E,"bug_penalty_per_hour",.03),i(E,"emoji","🌽");class M extends v{}i(M,"id","p08"),i(M,"name","Dưa hấu"),i(M,"season",SEASON_SUMMER),i(M,"buy_price",1800),i(M,"sell_price_per_yield",18),i(M,"base_yield",260),i(M,"growth_time",1440),i(M,"rot_time",1440),i(M,"water_consume_per_hour",16.67),i(M,"drought_penalty_per_hour",.05),i(M,"bug_penalty_per_hour",.03),i(M,"emoji","🍉");class j extends v{}i(j,"id","p09"),i(j,"name","Cà tím"),i(j,"season",SEASON_AUTUMN),i(j,"buy_price",35),i(j,"sell_price_per_yield",5),i(j,"base_yield",10),i(j,"growth_time",15),i(j,"rot_time",1440),i(j,"water_consume_per_hour",16.67),i(j,"drought_penalty_per_hour",.05),i(j,"bug_penalty_per_hour",.03),i(j,"emoji","🍆");class L extends v{}i(L,"id","p10"),i(L,"name","Khoai lang"),i(L,"season",SEASON_AUTUMN),i(L,"buy_price",220),i(L,"sell_price_per_yield",9),i(L,"base_yield",44),i(L,"growth_time",360),i(L,"rot_time",1440),i(L,"water_consume_per_hour",16.67),i(L,"drought_penalty_per_hour",.05),i(L,"bug_penalty_per_hour",.03),i(L,"emoji","🍠");class D extends v{}i(D,"id","p11"),i(D,"name","Táo"),i(D,"season",SEASON_AUTUMN),i(D,"buy_price",650),i(D,"sell_price_per_yield",13),i(D,"base_yield",110),i(D,"growth_time",720),i(D,"rot_time",1440),i(D,"water_consume_per_hour",16.67),i(D,"drought_penalty_per_hour",.05),i(D,"bug_penalty_per_hour",.03),i(D,"emoji","🍎");class N extends v{}i(N,"id","p12"),i(N,"name","Bí ngô"),i(N,"season",SEASON_AUTUMN),i(N,"buy_price",2e3),i(N,"sell_price_per_yield",20),i(N,"base_yield",260),i(N,"growth_time",1440),i(N,"rot_time",1440),i(N,"water_consume_per_hour",16.67),i(N,"drought_penalty_per_hour",.05),i(N,"bug_penalty_per_hour",.03),i(N,"emoji","🎃");class C extends v{}i(C,"id","p13"),i(C,"name","Cải bắp"),i(C,"season",SEASON_WINTER),i(C,"buy_price",45),i(C,"sell_price_per_yield",6),i(C,"base_yield",11),i(C,"growth_time",15),i(C,"rot_time",1440),i(C,"water_consume_per_hour",16.67),i(C,"drought_penalty_per_hour",.05),i(C,"bug_penalty_per_hour",.03),i(C,"emoji","🥦");class R extends v{}i(R,"id","p14"),i(R,"name","Hành tây"),i(R,"season",SEASON_WINTER),i(R,"buy_price",260),i(R,"sell_price_per_yield",10),i(R,"base_yield",47),i(R,"growth_time",360),i(R,"rot_time",1440),i(R,"water_consume_per_hour",16.67),i(R,"drought_penalty_per_hour",.05),i(R,"bug_penalty_per_hour",.03),i(R,"emoji","🧅");class B extends v{}i(B,"id","p15"),i(B,"name","Củ cải"),i(B,"season",SEASON_WINTER),i(B,"buy_price",750),i(B,"sell_price_per_yield",15),i(B,"base_yield",110),i(B,"growth_time",720),i(B,"rot_time",1440),i(B,"water_consume_per_hour",16.67),i(B,"drought_penalty_per_hour",.05),i(B,"bug_penalty_per_hour",.03),i(B,"emoji","⬜");class P extends v{}i(P,"id","p16"),i(P,"name","Gừng"),i(P,"season",SEASON_WINTER),i(P,"buy_price",2200),i(P,"sell_price_per_yield",22),i(P,"base_yield",260),i(P,"growth_time",1440),i(P,"rot_time",1440),i(P,"water_consume_per_hour",16.67),i(P,"drought_penalty_per_hour",.05),i(P,"bug_penalty_per_hour",.03),i(P,"emoji","🫚");var At;let pt=(At=class{static register(t){this.classes[t.id]=t}static create(t,n={}){const s=this.classes[t];return s?new s(n):(console.warn(`Plant class for ID ${t} not found. Using BasePlant.`),new v(n))}},i(At,"classes",{}),At);[S,$,k,T,A,I,E,M,j,L,D,N,C,R,B,P].forEach(e=>pt.register(e));window.BasePlant=v;window.Plot=Le;window.PlantFactory=pt;window.StrawberryPlant=S;window.CabbageGreenPlant=$;window.TulipPlant=k;window.CarrotPlant=T;window.TomatoPlant=A;window.BellPepperPlant=I;window.CornPlant=E;window.WatermelonPlant=M;window.EggplantPlant=j;window.SweetPotatoPlant=L;window.ApplePlant=D;window.PumpkinPlant=N;window.CabbageWinterPlant=C;window.OnionPlant=R;window.RadishPlant=B;window.GingerPlant=P;class rt{constructor(t,n,s,o,a,l){this.id=t,this.name=n,this.emoji=s,this.buyPrice=o,this.sellPrice=a,this.type=l}}class st extends rt{constructor(t,n,s,o,a){super(t,n,s,o,Math.floor(o*.5),"food"),this.energyRestored=a}}class yt extends rt{constructor(t,n,s,o,a,l){super(t,n,s,o,Math.floor(o*.5),"fertilizer"),this.multiplier=a,this.timeMultiplier=l}}class Ft extends rt{constructor(t=500){super("pesticide","Thuốc trừ sâu","🧪",t,Math.floor(t*.5),"pesticide")}}class Ht extends rt{constructor(t=50){super("medicine_animal","Thuốc thú y","💊",t,Math.floor(t*.5),"medicine_animal")}}var It;let U=(It=class{static register(t){this.items[t.id]=t}static get(t){return this.items[t]}static getAll(){return Object.values(this.items)}},i(It,"items",{}),It);U.register(new st("bread","Bánh mì","🍞",1e3,10));U.register(new st("noodle","Mì","🍜",1800,25));U.register(new st("rice","Cơm","🍚",4800,50));U.register(new st("poultry","Thức ăn gia cầm","🌾",50,0));U.register(new st("livestock","Thức ăn gia súc","🌾",50,0));U.register(new yt("1","Phân hữu cơ","💩",100,1.2,.9));U.register(new yt("2","Phân hóa học","🧪",250,1.5,.7));U.register(new yt("3","Phân thần kỳ","✨",600,2,.5));U.register(new Ft(500));U.register(new Ht(50));window.BaseShopItem=rt;window.FoodItem=st;window.FertilizerItem=yt;window.PesticideItem=Ft;window.MedicineAnimalItem=Ht;window.ShopItemRegistry=U;const Ot={0:{name:"Không có",multiplier:1,time_multiplier:1,price:0,emoji:""}};[1,2,3].forEach(e=>{const t=U.get(e.toString());t&&(Ot[e]={name:t.name,multiplier:t.multiplier,time_multiplier:t.timeMultiplier,price:t.buyPrice,emoji:t.emoji})});window.FERTILIZER_DATA=Ot;const De=U.get("pesticide").buyPrice;window.PESTICIDE_PRICE=De;const Kt={};for(const e in pt.classes){const t=pt.classes[e];Kt[e]={id:t.id,name:t.name,season:t.season,buy_price:t.buy_price,sell_price_per_yield:t.sell_price_per_yield,base_yield:t.base_yield,growth_time:t.growth_time,rot_time:t.rot_time,water_consume_per_hour:t.water_consume_per_hour,drought_penalty_per_hour:t.drought_penalty_per_hour,bug_penalty_per_hour:t.bug_penalty_per_hour,emoji:t.emoji}}window.PLANTS_DATA=Kt;class bt{constructor(t={}){this.id=t.id||"animal_"+Math.random().toString(36).substr(2,9),this.type=t.type||this.constructor.type,this.purchased_at=t.purchased_at||Date.now(),this.last_fed_at=t.last_fed_at||Date.now(),this.last_harvested_at=t.last_harvested_at||Date.now(),this.accumulated_production=typeof t.accumulated_production=="number"?t.accumulated_production:0,this.status=t.status||"baby",this.health=typeof t.health=="number"?t.health:100,this.dead_at=t.dead_at||null,this.last_calculated_at=t.last_calculated_at||this.purchased_at,this.sick_started_at=t.sick_started_at||null,this.medicine_until=t.medicine_until||null,this.grown_ms=typeof t.grown_ms=="number"?t.grown_ms:0}get name(){return this.constructor.name_label}get buy_price(){return this.constructor.buy_price}get sell_price(){return this.constructor.sell_price}get emoji(){return this.constructor.emoji}get production_rate(){return this.constructor.production_rate}get max_production(){return this.constructor.max_production}get feed_item(){return this.constructor.feed_item}get produce_item(){return this.constructor.produce_item}toJSON(){return{id:this.id,type:this.type,purchased_at:this.purchased_at,last_fed_at:this.last_fed_at,last_harvested_at:this.last_harvested_at,accumulated_production:this.accumulated_production,status:this.status,health:this.health,dead_at:this.dead_at,last_calculated_at:this.last_calculated_at,sick_started_at:this.sick_started_at,medicine_until:this.medicine_until,grown_ms:this.grown_ms}}lazyUpdate(t=Date.now()){if(this.status==="dead")return;const n=t-this.last_calculated_at;if(n<=0)return;const s=36e5,o=100/6,a=n/s;if(this.health>0){const c=this.health;if(this.health=Math.max(0,this.health-o*a),this.health<=0){const p=c/o;this.dead_at=this.last_calculated_at+p*s}}if(this.dead_at&&t-this.dead_at>=6*s){this.status="dead",this.health=0,this.last_calculated_at=t;return}if(!this.sick_started_at&&(!this.medicine_until||this.medicine_until<t)){let c=n;if(this.medicine_until&&this.medicine_until>this.last_calculated_at&&(c=t-this.medicine_until),c>0){const p=c/36e5,f=1-Math.pow(.95,p);if(Math.random()<f){const _=Math.random()*c;this.sick_started_at=Math.max(this.last_calculated_at,t-c)+_}}}const l=4*s;if(this.status==="baby"){let c=n;this.sick_started_at&&(this.sick_started_at>this.last_calculated_at&&this.sick_started_at<t?c=this.sick_started_at-this.last_calculated_at:c=0),this.grown_ms+=c,this.grown_ms>=l&&(this.status="adult")}if(this.status==="adult"&&this.health>0){let c=a;if(this.dead_at){const f=this.dead_at-this.last_calculated_at;c=Math.max(0,f/s)}if(this.sick_started_at)if(this.sick_started_at>this.last_calculated_at&&this.sick_started_at<t){const f=this.sick_started_at-this.last_calculated_at;c=Math.min(c,Math.max(0,f/s))}else c=0;const p=c*this.production_rate;this.accumulated_production=Math.min(this.max_production,this.accumulated_production+p)}const d=t-this.purchased_at,u=14*24*s;d>=u&&(this.status="dead"),this.last_calculated_at=t}feed(t=Date.now()){return this.health>50?{ok:!1,msg:"Sinh lực vẫn trên 50%, chưa thể cho ăn!"}:(this.health=100,this.last_fed_at=t,this.dead_at=null,this.last_calculated_at=t,{ok:!0})}harvest(){if(this.status==="dead")return{ok:!1,msg:"Thú nuôi đã chết, không thể thu hoạch!"};if(this.status==="baby")return{ok:!1,msg:"Thú nuôi còn non, chưa thể sản xuất!"};const t=Math.floor(this.accumulated_production);return t<=0?{ok:!1,msg:"Chưa có sản phẩm tích lũy!"}:(this.accumulated_production=0,this.last_harvested_at=Date.now(),{ok:!0,qty:t})}}class H extends bt{}i(H,"type","chicken"),i(H,"name_label","Gà"),i(H,"buy_price",100),i(H,"sell_price",200),i(H,"emoji","🐔"),i(H,"production_rate",20),i(H,"max_production",20),i(H,"feed_item","food_poultry"),i(H,"produce_item","harvest_chicken_egg");class O extends bt{}i(O,"type","cow"),i(O,"name_label","Bò"),i(O,"buy_price",200),i(O,"sell_price",400),i(O,"emoji","🐮"),i(O,"production_rate",5),i(O,"max_production",5),i(O,"feed_item","food_livestock"),i(O,"produce_item","harvest_cow_milk");var Et;let Ne=(Et=class{static create(t,n={}){const s=this.classes[t];return s?new s(n):new bt(n)}},i(Et,"classes",{chicken:H,cow:O}),Et);window.BaseAnimal=bt;window.ChickenAnimal=H;window.CowAnimal=O;window.AnimalFactory=Ne;const Ge=24*60*60*1e3,Tt=24*60*60*1e3,Lt=[0];let qt=12e3;for(let e=1;e<=36;e++)Lt.push(qt),qt*=2;function Mt(){const e=Date.now();return{gold:5e3,energy:100,season:"spring",game_day:1,lastDayTick:e,lastEnergyTick:e,needsStartSeason:!0,inventory:{},plots:Vt(),plots_unlocked:[3,0,0],plants:{},animals:[],poultry_capacity:3,livestock_capacity:3,lastAutoCheck:e,producerUnlocked:!1,producerSlots:[{inputKey:null,qtyLeft:0,qtyReady:0,lastUpdate:e,timeSpent:0},{inputKey:null,qtyLeft:0,qtyReady:0,lastUpdate:e,timeSpent:0},{inputKey:null,qtyLeft:0,qtyReady:0,lastUpdate:e,timeSpent:0}]}}function Vt(){const e={};for(let t=0;t<3;t++)for(let n=0;n<36;n++)e[`${t}_${n}`]=new Plot({zone:t,index:n,locked:!0});return e}const Dt="mangak_farm_v1";function Qt(){try{const e=localStorage.getItem(Dt);let t;if(e?t=JSON.parse(e):(t=Mt(),t.needsStartSeason=!0),t.plots_unlocked||(t.plots_unlocked=[3,0,0]),t.inventory||(t.inventory={}),(typeof t.game_day!="number"||t.game_day<1)&&(t.game_day=1),t.lastDayTick||(t.lastDayTick=Date.now()),t.season||(t.season=Zt(t.game_day)),typeof t.needsStartSeason!="boolean"&&(t.needsStartSeason=!1),typeof t.energy!="number"&&(t.energy=100),typeof t.lastEnergyTick!="number"&&(t.lastEnergyTick=Date.now()),t.animals||(t.animals=[]),typeof t.poultry_capacity!="number"&&(t.poultry_capacity=3),typeof t.livestock_capacity!="number"&&(t.livestock_capacity=3),t.animals=t.animals.map(n=>AnimalFactory.create(n.type,n)),!t.quests||t.quests.length!==3?t.quests=[{quest:Q(Z()),cooldownUntil:null},{quest:Q(Z()),cooldownUntil:null},{quest:Q(Z()),cooldownUntil:null}]:t.quests.forEach((n,s)=>{!n.cooldownUntil&&!n.quest&&(n.quest=Q(Z()))}),typeof t.producerUnlocked>"u"&&(t.producerUnlocked=!1),(!t.producerSlots||t.producerSlots.length!==3)&&(t.producerSlots=[{inputKey:null,qtyLeft:0,qtyReady:0,lastUpdate:Date.now(),timeSpent:0},{inputKey:null,qtyLeft:0,qtyReady:0,lastUpdate:Date.now(),timeSpent:0},{inputKey:null,qtyLeft:0,qtyReady:0,lastUpdate:Date.now(),timeSpent:0}]),!t.plots||Object.keys(t.plots).length===0)t.plots=Vt();else{const n={};for(const s in t.plots){const o=s.split("_");o.length===2&&parseInt(o[1])<36&&(n[s]=new Plot(t.plots[s]))}for(let s=0;s<3;s++)for(let o=0;o<36;o++){const a=`${s}_${o}`;n[a]||(n[a]=new Plot({zone:s,index:o,locked:!0}))}t.plots=n}if(!t.plants)t.plants={};else{const n={};for(const s in t.plants){const o=s.split("_");o.length===2&&parseInt(o[1])<36&&t.plants[s]&&(n[s]=PlantFactory.create(t.plants[s].plant_id,t.plants[s]))}t.plants=n}return t}catch(e){console.error("Lỗi khi load game state, khôi phục lại mặc định:",e);const t=Mt();return t.needsStartSeason=!0,t}}function y(){localStorage.setItem(Dt,JSON.stringify(r))}function Zt(e){const t=Math.floor((e-1)/30)%SEASONS.length;return SEASONS[t]}function Yt(e){return(e-1)%30+1}function Ce(){const t=Date.now()-r.lastDayTick;if(t<Tt)return!1;const n=Math.floor(t/Tt);r.game_day+=n,r.lastDayTick+=n*Tt;const s=Zt(r.game_day),o=s!==r.season;return r.season=s,y(),o}function Re(){localStorage.removeItem(Dt),r=Mt(),r.quests=[{quest:Q(Z()),cooldownUntil:null},{quest:Q(Z()),cooldownUntil:null},{quest:Q(Z()),cooldownUntil:null}],lt(),y(),openStartSeasonModal()}function Be(e){const t=SEASONS.indexOf(e);t!==-1&&(r.game_day=t*30+1,r.season=e,r.lastDayTick=Date.now(),r.needsStartSeason=!1,lt(),y(),render(),closeStartSeasonModal(),toast(`Bắt đầu từ ${SEASON_LABELS[e]} - ngày ${Yt(r.game_day)}/30`,"success"))}let r=Qt();function lt(){for(let e=0;e<3;e++){const t=r.plots_unlocked[e];for(let n=0;n<36;n++)r.plots[`${e}_${n}`].locked=n>=t}}lt();function ot(e){return e&&e.lazyUpdate(Date.now())}function Pe(e,t){return e?e.calcGrossYield():0}function Jt(e){return e?e.calcNetYield():0}function ze(){let e=!1;const t=Date.now();typeof r.lastEnergyTick!="number"&&(r.lastEnergyTick=t,e=!0);const n=t-r.lastEnergyTick,s=36e5;if(n>=s){const l=Math.floor(n/s);if(l>0){if(r.energy<100){const d=l*20;r.energy=Math.min(100,r.energy+d),e=!0}r.lastEnergyTick+=l*s}}for(const l in r.plants){const d=r.plants[l].status;r.plants[l]=r.plants[l].lazyUpdate(Date.now()),r.plants[l].status!==d&&(e=!0)}return r.animals&&r.animals.length>0&&r.animals.forEach(l=>{const d=l.status;l.lazyUpdate(t),l.status!==d&&(e=!0)}),Wt()&&(e=!0),Xt(t)&&(e=!0),e&&y(),e}function K(e=1){return typeof r.energy!="number"&&(r.energy=100),r.energy<e?{ok:!1,msg:"❌ Không đủ năng lượng! Hãy ăn thêm thức ăn hoặc nông sản."}:(r.energy-=e,{ok:!0})}function Ue(e,t,n=0){const s=r.plots[e];if(!s||s.locked)return{ok:!1,msg:"Ô đất bị khóa"};if(r.plants[e])return{ok:!1,msg:"Ô đất đã có cây"};const o=PLANTS_DATA[t];if(!o)return{ok:!1,msg:"Không tìm thấy cây"};if(!r.inventory[t]||r.inventory[t]<=0)return{ok:!1,msg:"Không có hạt giống trong túi"};const a=K(1);if(!a.ok)return a;r.inventory[t]--;const l=Date.now(),d=o.season!==r.season;return r.plants[e]=PlantFactory.create(t,{plot_key:e,plant_id:t,status:0,planted_at:l,is_wrong_season:d,fertilizer_type:0,current_water:0,last_watered_at:null,bug_started_at:null,pesticide_until:null,lost_yield_by_water:0,lost_yield_by_bug:0,last_calculated_at:l,grown_ms:0,rot_ms:0}),y(),{ok:!0}}function qe(e){const t=r.plants[e];if(!t)return{ok:!1,msg:"Không có cây"};if(t.status===2)return{ok:!1,msg:"Cây đã chết"};if(t.current_water>50)return{ok:!1,msg:"Nước vẫn còn đủ (>50%)"};const n=K(1);return n.ok?(r.plants[e]=ot(t),r.plants[e].current_water=100,r.plants[e].last_watered_at=Date.now(),y(),{ok:!0}):n}function Fe(e){const t=r.plants[e];if(!t)return{ok:!1,msg:"Không có cây"};if(!t.bug_started_at)return{ok:!1,msg:"Không có sâu"};const n=K(1);return n.ok?(r.plants[e]=ot(t),r.plants[e].bug_started_at=null,y(),{ok:!0}):n}function He(e){const t=r.plants[e];if(!t)return{ok:!1,msg:"Không có cây"};if(!r.inventory.pesticide||r.inventory.pesticide<=0)return{ok:!1,msg:"Không có thuốc trừ sâu"};const n=K(1);return n.ok?(r.plants[e]=ot(t),r.plants[e].bug_started_at=null,r.plants[e].pesticide_until=Date.now()+Ge,r.inventory.pesticide--,r.inventory.pesticide<=0&&delete r.inventory.pesticide,y(),{ok:!0}):n}function Oe(e,t){const n=r.plants[e];if(!n)return{ok:!1,msg:"Không có cây"};if(n.status===2)return{ok:!1,msg:"Cây đã chết"};if(!Number.isInteger(t)||t<=0)return{ok:!1,msg:"Loại phân không hợp lệ"};const s=`fertilizer_${t}`;if(!r.inventory[s]||r.inventory[s]<=0)return{ok:!1,msg:"Không có phân bón trong túi"};const o=K(1);return o.ok?(r.plants[e]=ot(n),r.plants[e].fertilizer_type=t,r.inventory[s]--,r.inventory[s]<=0&&delete r.inventory[s],y(),{ok:!0}):o}function Ke(e){const t=r.plants[e];if(!t)return{ok:!1,msg:"Không có cây"};r.plants[e]=ot(t);const n=r.plants[e];if(n.status===0)return{ok:!1,msg:"Cây chưa chín"};if(n.status===2)return{ok:!1,msg:"Cây đã chết, phải cuốc hoặc dọn cây chết!"};const s=K(1);if(!s.ok)return s;const o=PLANTS_DATA[n.plant_id],a=Jt(n),l=`harvest_${n.plant_id}`;return r.inventory[l]=(r.inventory[l]||0)+a,delete r.plants[e],y(),{ok:!0,qty:a,plant:o}}function Ve(e){const t=r.plants[e];if(!t||t.status!==2)return{ok:!1,msg:"Không phải cây chết"};const n=K(1);return n.ok?(delete r.plants[e],y(),{ok:!0}):n}function Qe(e){if(!r.plants[e])return{ok:!1,msg:"Không có cây ở ô này"};const n=K(1);return n.ok?(delete r.plants[e],y(),{ok:!0}):n}function Ze(e,t,n=1){let s=0,o="";if(e==="animal")if(t==="chicken"){const a=r.animals.filter(l=>l.type==="chicken").length;if(a+n>r.poultry_capacity)return{ok:!1,msg:`Chuồng gà không đủ chỗ trống (Còn: ${r.poultry_capacity-a})`};s=100*n}else if(t==="cow"){const a=r.animals.filter(l=>l.type==="cow").length;if(a+n>r.livestock_capacity)return{ok:!1,msg:`Chuồng bò không đủ chỗ trống (Còn: ${r.livestock_capacity-a})`};s=200*n}else return{ok:!1,msg:"Không tìm thấy loại vật nuôi này"};else if(e==="seed"){const a=PLANTS_DATA[t];if(!a)return{ok:!1,msg:"Không tìm thấy cây"};s=a.buy_price*n,o=t}else if(e==="fertilizer"){const a=ShopItemRegistry.get(t);if(!a)return{ok:!1,msg:"Không tìm thấy loại phân bón này"};s=a.buyPrice*n,o=`fertilizer_${t}`}else if(e==="pesticide")s=ShopItemRegistry.get("pesticide").buyPrice*n,o="pesticide";else if(e==="food"){const a=ShopItemRegistry.get(t);if(!a)return{ok:!1,msg:"Không tìm thấy loại thực phẩm này"};s=a.buyPrice*n,o=`food_${t}`}else if(e==="medicine_animal"){const a=ShopItemRegistry.get("medicine_animal");if(!a)return{ok:!1,msg:"Không tìm thấy thuốc thú y"};s=a.buyPrice*n,o="medicine_animal"}if(r.gold<s)return{ok:!1,msg:`Không đủ vàng (cần ${s}🪙)`};if(r.gold-=s,e==="animal")for(let a=0;a<n;a++)r.animals.push(AnimalFactory.create(t,{purchased_at:Date.now()}));else r.inventory[o]=(r.inventory[o]||0)+n;return y(),{ok:!0,cost:s}}function Ye(e,t=1){if(!r.inventory[e]||r.inventory[e]<t)return{ok:!1,msg:"Không đủ hàng để bán"};let n=0;if(e==="cheese")n=2500*t;else if(e==="harvest_chicken_egg")n=50*t;else if(e==="harvest_cow_milk")n=500*t;else if(e.startsWith("harvest_")){const s=e.replace("harvest_",""),o=PLANTS_DATA[s];if(!o)return{ok:!1,msg:"Không xác định được loại nông sản"};n=o.sell_price_per_yield*t}else if(e.startsWith("fertilizer_")){const s=e.replace("fertilizer_",""),o=ShopItemRegistry.get(s);n=Math.floor(((o==null?void 0:o.buyPrice)||0)*.5*t)}else if(e==="pesticide"){const s=ShopItemRegistry.get("pesticide");n=Math.floor(((s==null?void 0:s.buyPrice)||500)*.5*t)}else if(e==="medicine_animal"){const s=ShopItemRegistry.get("medicine_animal");n=Math.floor(((s==null?void 0:s.buyPrice)||50)*.5*t)}else if(e.startsWith("food_")){const s=e.replace("food_",""),o=ShopItemRegistry.get(s);n=Math.floor(((o==null?void 0:o.buyPrice)||0)*.5*t)}else{const s=PLANTS_DATA[e];s&&(n=Math.floor(s.buy_price*.5*t))}return r.inventory[e]-=t,r.inventory[e]<=0&&delete r.inventory[e],r.gold+=n,y(),{ok:!0,revenue:n}}function Je(e,t=1){return!r.inventory[e]||r.inventory[e]<t?{ok:!1,msg:"Không đủ vật phẩm trong túi!"}:(r.inventory[e]-=t,r.inventory[e]<=0&&delete r.inventory[e],y(),{ok:!0})}function We(e){if(e>0&&r.plots_unlocked[e-1]<36)return{ok:!1,msg:`Phải mở khóa hết Khu ${e} trước!`};const t=r.plots_unlocked[e],n=r.plots_unlocked.reduce((a,l)=>a+l,0),s=Math.floor(n/3),o=Lt[s]??999999;return t>=36?{ok:!1,msg:"Khu đất đã đầy"}:r.gold<o?{ok:!1,msg:`Cần ${o}🪙`}:(r.gold-=o,r.plots_unlocked[e]=Math.min(36,t+3),lt(),y(),{ok:!0,price:o})}function Xe(e){if(e==="poultry"){const t=r.poultry_capacity;if(t>=20)return{ok:!1,msg:"Chuồng gà đã đạt sức chứa tối đa (20)"};const n=12e3*Math.pow(2,t-3);return r.gold<n?{ok:!1,msg:`Cần ${n}🪙 để mở rộng!`}:(r.gold-=n,r.poultry_capacity+=1,y(),{ok:!0,price:n,newCap:r.poultry_capacity})}else if(e==="livestock"){const t=r.livestock_capacity;if(t>=20)return{ok:!1,msg:"Chuồng bò đã đạt sức chứa tối đa (20)"};const n=12e3*Math.pow(2,t-3);return r.gold<n?{ok:!1,msg:`Cần ${n}🪙 để mở rộng!`}:(r.gold-=n,r.livestock_capacity+=1,y(),{ok:!0,price:n,newCap:r.livestock_capacity})}return{ok:!1,msg:"Loại chuồng không hợp lệ"}}function tn(e){const t=r.animals.find(a=>a.id===e);if(!t)return{ok:!1,msg:"Không tìm thấy con vật!"};const n=t.feed_item;if(!r.inventory[n]||r.inventory[n]<1)return{ok:!1,msg:`Không đủ thức ăn trong túi (cần 1 ${n==="food_poultry"?"thức ăn gia cầm":"thức ăn gia súc"})!`};const s=K(1);if(!s.ok)return s;t.lazyUpdate(Date.now());const o=t.feed(Date.now());return o.ok?(r.inventory[n]-=1,r.inventory[n]<=0&&delete r.inventory[n],y(),{ok:!0}):o}function en(e){return e.lazyUpdate(Date.now()),e.health<=50}function nn(e){const t=r.animals.find(a=>a.id===e);if(!t)return{ok:!1,msg:"Không tìm thấy con vật!"};const n=K(1);if(!n.ok)return n;t.lazyUpdate(Date.now());const s=t.harvest();if(!s.ok)return s;const o=t.produce_item;return r.inventory[o]=(r.inventory[o]||0)+s.qty,y(),{ok:!0,qty:s.qty,item:o}}function sn(e){const t=r.animals.findIndex(o=>o.id===e);if(t===-1)return{ok:!1,msg:"Không tìm thấy con vật!"};const n=r.animals[t];if(n.lazyUpdate(Date.now()),n.status!=="adult")return{ok:!1,msg:"Con vật chưa trưởng thành, không thể bán!"};const s=n.sell_price;return r.gold+=s,r.animals.splice(t,1),y(),{ok:!0,price:s}}function on(e){const t=r.animals.findIndex(s=>s.id===e);return t===-1?{ok:!1,msg:"Không tìm thấy con vật!"}:r.animals[t].status!=="dead"?{ok:!1,msg:"Con vật vẫn còn sống!"}:(r.animals.splice(t,1),y(),{ok:!0})}function an(e){const t=r.animals.find(o=>o.id===e);if(!t)return{ok:!1,msg:"Không tìm thấy vật nuôi!"};if(t.status==="dead")return{ok:!1,msg:"Vật nuôi đã chết!"};const n="medicine_animal";if(!r.inventory[n]||r.inventory[n]<1)return{ok:!1,msg:"Không đủ Thuốc thú y trong túi (cần 1)!"};const s=K(1);return s.ok?(t.lazyUpdate(Date.now()),t.sick_started_at=null,t.medicine_until=Date.now()+24*60*60*1e3,r.inventory[n]--,r.inventory[n]<=0&&delete r.inventory[n],y(),{ok:!0}):s}function rn(e){r.season=e,y()}function ln(){const e=[];for(const t in PLANTS_DATA)e.push({key:`harvest_${t}`,name:PLANTS_DATA[t].name,emoji:PLANTS_DATA[t].emoji,sellPrice:PLANTS_DATA[t].sell_price_per_yield});return e.push({key:"harvest_chicken_egg",name:"Trứng gà",emoji:"🥚",sellPrice:50}),e.push({key:"harvest_cow_milk",name:"Sữa bò",emoji:"🥛",sellPrice:500}),e.push({key:"cheese",name:"Phô mai",emoji:"🧀",sellPrice:800}),e}function cn(e,t){return t>=500?Math.floor(Math.random()*3)+1:t>=50?Math.floor(Math.random()*7)+2:t>=18?Math.floor(Math.random()*5)+2:t>=12?Math.floor(Math.random()*8)+3:t>=8?Math.floor(Math.random()*9)+4:Math.floor(Math.random()*11)+5}function Z(){return Math.floor(Math.random()*3)+1}function Q(e){const t=ln();let n=1,s=1.5;e===2?(n=3,s=2):e===3&&(n=5,s=2.5);const l=[...t].sort(()=>.5-Math.random()).slice(0,n).map(c=>{const p=cn(c.key,c.sellPrice);return{key:c.key,name:c.name,emoji:c.emoji,qtyRequired:p,sellPrice:c.sellPrice}});let d=0;l.forEach(c=>{d+=c.qtyRequired*c.sellPrice});const u=Math.round(d*s);return{id:"quest_"+Math.random().toString(36).substr(2,9),level:e,items:l,rewardGold:u,baseValue:d,completed:!1}}function dn(e){const t=r.quests[e];if(!t||!t.quest||t.quest.completed)return{ok:!1,msg:"Nhiệm vụ không hợp lệ hoặc đã hoàn thành!"};const n=t.quest;for(const s of n.items){const o=r.inventory[s.key]||0;if(o<s.qtyRequired)return{ok:!1,msg:`Thiếu vật phẩm: ${s.emoji} ${s.name} (Cần: ${s.qtyRequired}, Có: ${o})`}}for(const s of n.items)r.inventory[s.key]-=s.qtyRequired,r.inventory[s.key]<=0&&delete r.inventory[s.key];return r.gold+=n.rewardGold,t.quest=Q(Z()),t.cooldownUntil=null,y(),{ok:!0,rewardGold:n.rewardGold}}function un(e){const t=r.quests[e];if(!t||t.cooldownUntil)return{ok:!1,msg:"Đang trong thời gian chờ hoặc slot không hợp lệ!"};const n=Date.now();return t.cooldownUntil=n+15*60*1e3,t.quest=null,y(),{ok:!0}}function Wt(){let e=!1;const t=Date.now();return r.quests&&r.quests.length>0&&r.quests.forEach((n,s)=>{n.cooldownUntil&&t>=n.cooldownUntil&&(n.quest=Q(Z()),n.cooldownUntil=null,e=!0)}),e&&y(),e}function _t(e){if(!e)return null;if(e==="harvest_cow_milk")return{key:"cheese",name:"Phô mai",emoji:"🧀",time:5*60*1e3,inputRatio:4};if(e.startsWith("harvest_")){const t=e.replace("harvest_",""),n=PLANTS_DATA[t];if(n)return{key:t,name:n.name+" (Hạt)",emoji:n.emoji,time:5*60*1e3,inputRatio:1}}return null}function pn(){return r.producerUnlocked?{ok:!1,msg:"Nhà sản xuất vật tư đã được mở khoá từ trước!"}:r.gold<1e5?{ok:!1,msg:"Không đủ vàng để mở khoá (Cần 100.000 🪙)!"}:(r.gold-=1e5,r.producerUnlocked=!0,y(),{ok:!0})}function hn(e,t,n){if(!r.producerUnlocked)return{ok:!1,msg:"Nhà sản xuất vật tư chưa được mở khoá!"};const s=r.producerSlots[e];if(!s)return{ok:!1,msg:"Slot không hợp lệ!"};if(s.inputKey&&s.inputKey!==t)return{ok:!1,msg:"Slot đang sản xuất vật phẩm khác, không thể trộn lẫn!"};const o=_t(t),a=o&&o.inputRatio||1;if(t==="harvest_cow_milk"&&n%a!==0)return{ok:!1,msg:`Số lượng sữa bò nạp vào phải là bội số của ${a}!`};const l=s.qtyLeft+s.qtyReady*a;return l+n>64?{ok:!1,msg:`Vượt quá giới hạn chứa tối đa 64 nguyên liệu trong một slot (Hiện có tương đương: ${l})!`}:(r.inventory[t]||0)<n?{ok:!1,msg:"Không đủ vật phẩm trong túi đồ!"}:(r.inventory[t]-=n,r.inventory[t]<=0&&delete r.inventory[t],s.inputKey=t,s.qtyLeft+=n,s.qtyLeft===n&&(s.lastUpdate=Date.now(),s.timeSpent=0),y(),{ok:!0})}function fn(e){if(!r.producerUnlocked)return{ok:!1,msg:"Nhà sản xuất vật tư chưa được mở khoá!"};const t=r.producerSlots[e];if(!t||t.qtyReady<=0)return{ok:!1,msg:"Không có vật phẩm nào đã hoàn thành để thu hoạch!"};const n=_t(t.inputKey);if(!n)return{ok:!1,msg:"Vật phẩm không hợp lệ!"};const s=t.qtyReady;return r.inventory[n.key]=(r.inventory[n.key]||0)+s,t.qtyReady=0,t.qtyLeft===0&&(t.inputKey=null,t.timeSpent=0),y(),{ok:!0,key:n.key,name:n.name,emoji:n.emoji,qty:s}}function Xt(e=Date.now()){let t=!1;return!r.producerUnlocked||!r.producerSlots?!1:(r.producerSlots.forEach(n=>{if(n.inputKey&&n.qtyLeft>0){n.lastUpdate||(n.lastUpdate=e);const s=e-n.lastUpdate;n.timeSpent+=s,n.lastUpdate=e;const o=_t(n.inputKey),a=o?o.time:5*60*1e3,l=o&&o.inputRatio||1;if(n.timeSpent>=a){const d=Math.floor(n.timeSpent/a),u=Math.floor(n.qtyLeft/l),c=Math.min(d,u);c>0&&(n.qtyReady+=c,n.qtyLeft-=c*l,n.timeSpent=n.timeSpent%a,n.qtyLeft<l&&(n.timeSpent=0),t=!0)}}else n.inputKey&&n.qtyLeft===0&&(n.lastUpdate=e)}),t)}window.GAME={G:r,PLANTS_DATA,FERTILIZER_DATA,SEASONS,SEASON_LABELS,PESTICIDE_PRICE,LAND_PRICES:Lt,loadState:Qt,saveState:y,syncUnlockedPlots:lt,lazyUpdateAll:ze,lazyUpdatePlant:ot,calcNetYield:Jt,calcGrossYield:Pe,plantSeed:Ue,waterPlant:qe,catchBug:Fe,usePesticide:He,useFertilizer:Oe,harvestPlant:Ke,removeDead:Ve,clearPlot:Qe,buyItem:Ze,sellItem:Ye,buyLand:We,changeSeason:rn,expandBarn:Xe,feedAnimal:tn,harvestAnimal:nn,sellAnimal:sn,removeDeadAnimal:on,canFeedAnimal:en,cureAnimal:an,discardItem:Je,completeQuest:dn,resetQuest:un,checkQuestCooldowns:Wt,generateRandomQuest:Q,unlockProducer:pn,loadProducerSlot:hn,collectProducerSlot:fn,updateProducer:Xt,getProducerOutputInfo:_t,updateSeasonClock:Ce,getDayOfSeason:Yt,resetGame:Re,setStartSeason:Be};for(const e in window.GAME)window[e]=window.GAME[e];function te(){let e='<div class="space-y-6">';for(let t=0;t<3;t++){const n=G.plots_unlocked[t],s=t>0?G.plots_unlocked[t-1]:36,o=t>0&&s<36;if(e+=`
      <div class="bg-gray-800/80 border border-gray-700 rounded-2xl p-4 relative shadow-lg ${o?"opacity-50":""}">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <span class="font-bold text-yellow-400 text-sm sm:text-base flex items-center gap-1.5">
            <span>🏡 Khu đất ${t+1}</span>
            <span class="text-xs bg-gray-900 border border-gray-700 px-2 py-0.5 rounded-full text-cyan-400 font-mono">
              ${n}/36 ô đã mở
            </span>
          </span>
    `,o){e+=`
          <span class="text-xs text-red-400 font-semibold">🔒 Yêu cầu mở hết Khu ${t} trước</span>
        </div>
        <div class="flex items-center justify-center h-48 bg-gray-900/50 rounded-xl border border-dashed border-gray-700">
          <div class="text-center">
            <span class="text-4xl block mb-2">🔒</span>
            <span class="text-xs text-gray-500 font-bold uppercase tracking-wider">Khu đất chưa khai thác</span>
          </div>
        </div>
      </div>
      `;continue}const a=G.plots_unlocked.reduce((c,p)=>c+p,0),l=Math.floor(a/3),d=LAND_PRICES[l]??999999;n<36?e+=`
          <button class="btn btn-green text-xs font-bold py-1.5 px-3 shadow-md" onclick="handleBuyLand(${t})">
            🏗️ Mở thêm 3 ô (+${d}🪙)
          </button>
      `:e+=`
          <span class="text-xs text-gray-500 font-bold">✓ Đã mở hết</span>
      `,e+=`
        </div>
        <!-- 2x2 Grid of 3x3 Plot blocks -->
        <div class="grid grid-cols-2 gap-3 max-w-full mx-auto" style="width: max-content;">
    `,[{rStart:0,rEnd:3,cStart:0,cEnd:3},{rStart:0,rEnd:3,cStart:3,cEnd:6},{rStart:3,rEnd:6,cStart:0,cEnd:3},{rStart:3,rEnd:6,cStart:3,cEnd:6}].forEach(c=>{e+='<div class="grid grid-cols-3 gap-1">';for(let p=c.rStart;p<c.rEnd;p++)for(let f=c.cStart;f<c.cEnd;f++){const _=p*6+f,m=`${t}_${_}`,b=G.plots[m],g=G.plants[m],w=selectedPlot===m,V="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14";if(!b||b.locked){e+=`
              <div class="plot-cell locked select-none flex items-center justify-center border border-gray-700/60 rounded-lg bg-gray-950/80 text-lg cursor-not-allowed ${V}" title="Ô đất bị khóa">
                🔒
              </div>
            `;continue}if(!g){e+=`
              <div class="plot-cell empty select-none flex items-center justify-center border border-gray-700 rounded-lg bg-amber-950/40 text-2xl cursor-pointer hover:border-yellow-400 transition-all ${w?"ring-2 ring-yellow-400 border-yellow-400":""} ${V}"
                data-plot-key="${m}" title="Ô trống - click để trồng cây" onclick="selectPlotCell('${m}')">
                🟫
              </div>
            `;continue}const q=PLANTS_DATA[g.plant_id],$t=Math.round(g.current_water),X=!!g.bug_started_at,ut=g.status===0?"growing":g.status===1?"ready":"dead",z=X?"bug":"",kt=g.status===0?"🌱":g.status===1?q.emoji:"💀",at=g.status===1?"✨":"";e+=`
            <div class="plot-cell ${ut} ${z} select-none flex flex-col justify-between p-1 border border-gray-700 rounded-lg bg-amber-950/40 cursor-pointer relative hover:border-yellow-400 transition-all ${w?"ring-2 ring-yellow-400 border-yellow-400":""} ${V}"
              data-plot-key="${m}" title="${q.name}" onclick="selectPlotCell('${m}')">
              
              <div class="flex-1 flex items-center justify-center w-full">
                <span class="text-xl sm:text-2xl display:block filter drop-shadow">${kt}</span>
              </div>

              ${at||X?`<div class="absolute -top-1 -right-1 text-[10px] bg-gray-900 rounded-full px-1 border border-gray-700 shadow-lg z-10">${at}${X?"🐛":""}</div>`:""}
              
              <div style="width: 80%; height: 5px; background: rgba(0,0,0,0.65); border-radius: 9999px; overflow: hidden; margin: 2px auto 0 auto; flex-shrink: 0;">
                <div style="width: ${$t}%; height: 5px; background: #4fc3f7; border-radius: 9999px; transition: width 0.3s;"></div>
              </div>
            </div>
          `}e+="</div>"}),e+=`
        </div>
      </div>
    `}return e+="</div>",e}window.renderCropsView=te;function it(){var b,g,w;const e=document.getElementById("plotModalContent"),t=document.getElementById("plotModalTitle");if(!selectedPlot||!e||!t)return;wt();const n=G.plots[selectedPlot];if(!n||n.locked)return;const s=G.plants[selectedPlot];if(!s){t.textContent="🟫 Ô đất trống",e.innerHTML=`
      <div class="text-center py-6">
        <div class="text-5xl mb-3">🟫</div>
        <div class="text-gray-300 font-bold mb-1">Ô đất này đang trống</div>
        <div class="text-xs text-gray-500 mb-4">Ô số ${parseInt(selectedPlot.split("_")[1])+1} - Khu ${parseInt(selectedPlot.split("_")[0])+1}</div>
        <button class="btn btn-green w-full py-3 text-base" data-action="open-planting-view">🌱 Trồng cây</button>
      </div>
    `;return}const o=PLANTS_DATA[s.plant_id],a=Math.round(s.current_water),l=calcGrossYield(s,o),d=calcNetYield(s),u=s.status===0?'<span class="text-green-400 font-bold">🌱 Sinh trưởng</span>':s.status===1?'<span class="text-yellow-400 font-bold">✨ Sẵn sàng thu hoạch</span>':'<span class="text-red-400 font-bold">💀 Đã chết</span>',c=s.is_wrong_season?'<span class="text-red-400 text-xs">(⚠️ trái mùa -50%)</span>':"",p=Date.now(),f=o.growth_time*6e4*(((b=FERTILIZER_DATA[s.fertilizer_type])==null?void 0:b.time_multiplier)||1);let _="";if(s.status===0){const V=Math.max(0,f-(s.grown_ms||0));_=`⏱️ Còn ${F(V)}`,s.current_water<=0&&(_+=' <span class="text-red-400 text-[10px] ml-1">(Tạm dừng do thiếu nước)</span>')}else if(s.status===1){const V=o.rot_time*6e4,q=Math.max(0,V-(s.rot_ms||0));_=`<span class="text-yellow-400">⚠️ Héo sau ${F(q)}</span>`}t.textContent="📋 Chi tiết ô đất";let m="";s.status===2?m=`
      <button class="btn btn-gray w-full py-2" data-action="remove-dead" data-plot="${selectedPlot}">🗑️ Dọn cây chết</button>
      <button class="btn btn-red w-full py-2" data-action="clear-plot" data-plot="${selectedPlot}">⛏️ Cuốc đất</button>
    `:(m+=`<button class="btn btn-blue w-full py-2" data-action="water-plant" data-plot="${selectedPlot}">💧 Tưới nước</button>`,m+='<button class="btn btn-green w-full py-2" data-action="open-fertilizer-view">🌿 Bón phân</button>',m+=`<button class="btn btn-yellow w-full py-2" data-action="harvest-plant" data-plot="${selectedPlot}">🌾 Thu hoạch</button>`,m+=`<button class="btn btn-green w-full py-2" data-action="catch-bug" data-plot="${selectedPlot}">👋 Bắt sâu thủ công</button>`,m+=`<button class="btn btn-purple w-full py-2" data-action="pesticide-plant" data-plot="${selectedPlot}">🧪 T.diệt sâu (Còn x${G.inventory.pesticide||0})</button>`,m+=`<button class="btn btn-red w-full py-2" data-action="clear-plot" data-plot="${selectedPlot}">⛏️ Cuốc đất</button>`),e.innerHTML=`
    <div class="flex items-center gap-3 bg-gray-800 p-3 rounded-lg border border-gray-700 mb-4">
      <span class="text-4xl">${o.emoji}</span>
      <div>
        <div class="font-bold text-yellow-400 text-lg">${o.name}</div>
        <div class="text-xs text-gray-400">Mùa thích hợp: ${SEASON_LABELS[o.season]}</div>
      </div>
    </div>

    <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3 mb-4 text-sm">
      <div class="flex justify-between border-b border-gray-700 pb-1">
        <span>Trạng thái:</span>
        <span>${u} ${c}</span>
      </div>
      ${_?`
      <div class="flex justify-between border-b border-gray-700 pb-1">
        <span>Thời gian:</span>
        <span>${_}</span>
      </div>`:""}
      <div class="flex justify-between border-b border-gray-700 pb-1">
        <span>Độ ẩm đất:</span>
        <span class="${a<=20?"text-red-400":a<=50?"text-yellow-400":"text-blue-400"} font-bold">${a}%</span>
      </div>
      <div class="w-full bg-gray-900 rounded-full h-2.5 mb-1">
        <div class="bg-blue-500 h-2.5 rounded-full" style="width: ${a}%"></div>
      </div>
      <div class="flex justify-between border-b border-gray-700 pb-1">
        <span>Sản lượng ước tính:</span>
        <div>
          <span class="text-green-400 font-bold">${d}</span>
          <span class="text-gray-500">/${Math.round(l)}</span>
        </div>
      </div>
      <div class="flex justify-between border-b border-gray-700 pb-1">
        <span>Phân bón đã dùng:</span>
        <span>${((g=FERTILIZER_DATA[s.fertilizer_type])==null?void 0:g.emoji)||""} ${((w=FERTILIZER_DATA[s.fertilizer_type])==null?void 0:w.name)||"Không có"}</span>
      </div>
      <div class="flex justify-between pb-1">
        <span>Sâu hại:</span>
        <span>${s.bug_started_at?'<span class="text-red-400 font-bold">🐛 Đang có sâu!</span>':'<span class="text-green-400">✅ Sạch sâu</span>'}</span>
      </div>
      ${s.pesticide_until&&s.pesticide_until>p?`
      <div class="text-xs text-green-400 bg-green-950 bg-opacity-35 p-2 rounded border border-green-900 text-center">
        🛡️ Đang được bảo vệ bởi thuốc diệt sâu (Còn ${F(s.pesticide_until-p)})
      </div>`:""}
    </div>

    <div class="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">⚡ Hành động nhanh</div>
    <div class="grid grid-cols-2 gap-2">
      ${m}
    </div>
  `}window.renderPlotModalContent=it;function ee(){const e=Object.values(G.plants),t=e.filter(l=>l.status===0).length,n=e.filter(l=>l.status===1).length,s=e.filter(l=>l.status===2).length,o=e.filter(l=>l.bug_started_at).length,a=document.getElementById("farmSummary");a&&(a.innerHTML=`
      <div class="flex justify-between"><span class="text-gray-400">🌱 Đang trồng</span><span>${t}</span></div>
      <div class="flex justify-between"><span class="text-gray-400">✨ Có thể thu</span><span class="text-yellow-400">${n}</span></div>
      <div class="flex justify-between"><span class="text-gray-400">💀 Đã chết</span><span class="text-red-400">${s}</span></div>
      <div class="flex justify-between"><span class="text-gray-400">🐛 Đang có sâu</span><span class="text-red-400">${o}</span></div>
    `)}window.renderFarmSummary=ee;function ne(){plantingPlotKey=selectedPlot,selectedPlantId=null,selectedFert=0,currentModalScreen="planting",Nt()}window.openPlantingView=ne;function Nt(){const e=document.getElementById("plotModalContent"),t=document.getElementById("plotModalTitle");if(!e||!t)return;t.textContent="🌱 Gieo Hạt",wt();let n=Object.keys(G.inventory).filter(o=>PLANTS_DATA[o]&&G.inventory[o]>0);n=n.filter(o=>PLANTS_DATA[o].season===G.season);const s='<button class="btn btn-gray w-full text-sm mb-3" data-action="go-back-to-details">⬅️ Quay lại</button>';if(n.length===0){e.innerHTML=`
      ${s}
      <div class="text-center py-6 text-gray-400">
        <div class="text-4xl mb-3">😢</div>
        <div>Bạn không có hạt giống nào cho mùa ${SEASON_LABELS[G.season]}!</div>
        <div class="text-sm mt-2">Hãy mua hạt giống ở tiệm tạp hóa</div>
        <button class="btn btn-yellow mt-4" data-action="close-plot-modal-open-shop">🏪 Đến tiệm</button>
      </div>`;return}e.innerHTML=`
    ${s}
    <div class="mb-3 text-xs text-gray-400">Chọn hạt giống để gieo (mùa hiện tại: <span class="text-yellow-400">${SEASON_LABELS[G.season]}</span>)</div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4" id="seedPicker" style="max-height: 45vh; overflow-y: auto;">
      ${n.map(o=>{const a=PLANTS_DATA[o],l=a.season!==G.season,d=a.growth_time*6e4,u=a.base_yield;return`<div class="plant-card ${l?"wrong-season":""} ${selectedPlantId===o?"selected":""}" id="seed_${o}" data-action="select-seed" data-seed-id="${o}">
          <div class="flex items-center gap-2">
            <span class="text-2xl">${a.emoji}</span>
            <div>
              <div class="font-bold text-sm">${a.name}</div>
              <div class="text-xs text-gray-400">${SEASON_LABELS[a.season]} · Còn x${G.inventory[o]}</div>
            </div>
          </div>
          <div class="mt-1 text-xs text-gray-500 flex gap-3">
            <span>⏱️${F(d)}</span>
            <span>🌾${u}</span>
            <span>💧-${Math.round(a.water_consume_per_hour)}%/h</span>
          </div>
        </div>`}).join("")}
    </div>

    <button class="btn btn-green w-full text-base py-2.5" data-action="confirm-plant">🌱 Gieo hạt (tốn 1 ⚡)</button>
  `}window.renderPlantingViewContent=Nt;function se(e){selectedPlantId=e,document.querySelectorAll(".plant-card").forEach(n=>n.classList.remove("selected"));const t=document.getElementById(`seed_${e}`);t&&t.classList.add("selected")}window.selectSeed=se;function oe(e){selectedFert=e,Nt()}window.selectFert=oe;function ie(){if(!selectedPlantId){h("Chọn hạt giống trước!","error");return}const e=plantSeed(plantingPlotKey,selectedPlantId);if(!e.ok){h(e.msg,"error");return}h(`🌱 Đã gieo ${PLANTS_DATA[selectedPlantId].name}!`,"success"),x(),xt()}window.confirmPlant=ie;function ae(){fertilizePlotKey=selectedPlot,selectedFertilizerType=0,currentModalScreen="fertilizing",Gt()}window.openFertilizerView=ae;function Gt(){const e=document.getElementById("plotModalContent"),t=document.getElementById("plotModalTitle");if(!e||!t)return;t.textContent="🌿 Bón phân",wt();const n='<button class="btn btn-gray w-full text-sm mb-3" data-action="go-back-to-details">⬅️ Quay lại</button>';if(!fertilizePlotKey||!G.plants[fertilizePlotKey]){e.innerHTML=`${n}<div class="text-center py-6 text-gray-400">Không có cây để bón phân.</div>`;return}const s=[1,2,3].filter(o=>G.inventory[`fertilizer_${o}`]>0);if(s.length===0){e.innerHTML=`
      ${n}
      <div class="text-center py-6 text-gray-400">
        <div class="text-4xl mb-3">😢</div>
        <div>Bạn không có bất kỳ loại phân bón nào trong túi đồ!</div>
        <div class="text-sm mt-2">Hãy mua phân bón ở tiệm tạp hóa</div>
        <button class="btn btn-yellow mt-4" data-action="close-plot-modal-open-shop">🏪 Đến tiệm</button>
      </div>`;return}e.innerHTML=`
    ${n}
    <div class="mb-3 text-sm text-gray-400">Chọn phân bón để áp dụng cho cây hiện tại.</div>
    <div class="grid grid-cols-1 gap-2 mb-4" id="fertilizerPicker">
      ${s.map(o=>{const a=FERTILIZER_DATA[o];return`<button class="fert-option-btn w-full text-left rounded-lg border px-3 py-3 ${selectedFertilizerType===o?"border-yellow-400 bg-yellow-400 bg-opacity-10":"border-gray-600 bg-gray-800"}" data-action="select-fertilizer-type" data-fertilizer-type="${o}">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-bold text-yellow-400">${a.emoji} ${a.name}</div>
              <div class="text-xs text-gray-400">Hiệu quả: +${Math.round((a.multiplier-1)*100)}% Sản lượng, -${Math.round((1-a.time_multiplier)*100)}% Thời gian</div>
            </div>
            <div class="text-sm text-yellow-400 font-bold">Còn x${G.inventory[`fertilizer_${o}`]||0}</div>
          </div>
        </button>`}).join("")}
    </div>
    <button class="btn btn-green w-full py-2.5 text-base" data-action="confirm-fertilizer" ${selectedFertilizerType?"":"disabled"} style="${selectedFertilizerType?"":"opacity:.5;cursor:not-allowed;"}">🌿 Áp dụng</button>
  `}window.renderFertilizerViewContent=Gt;function re(e){selectedFertilizerType=e,Gt()}window.selectFertilizerType=re;function le(){if(!selectedFertilizerType){h("Chọn loại phân trước!","error");return}const e=useFertilizer(fertilizePlotKey,selectedFertilizerType);if(!e.ok){h(e.msg,"error");return}h(`🌿 Đã bón ${FERTILIZER_DATA[selectedFertilizerType].name}!`,"success"),x(),xt()}window.confirmFertilizer=le;function xt(){currentModalScreen="details",it()}window.goBackToDetails=xt;function ce(e){const t=G.plots[e];if(!t||t.locked){h("🔒 Ô đất này bị khóa!","error");return}selectedPlot=e,currentModalScreen="details",x();const n=document.getElementById("plotModal");n&&(n.style.display="flex"),it()}window.selectPlot=ce;function de(e){const t=waterPlant(e);if(!t.ok){h(t.msg,"error");return}x(),h("💧 Đã tưới nước!","success")}window.handleWater=de;function ue(e){const t=catchBug(e);if(!t.ok){h(t.msg,"error");return}x(),h("👋 Đã bắt sâu!","success")}window.handleCatchBug=ue;function pe(e){const t=usePesticide(e);if(!t.ok){h(t.msg,"error");return}x(),h("🧪 Đã phun thuốc! (hiệu lực 24h)","success")}window.handlePesticide=pe;function he(e){const t=harvestPlant(e);t.ok?(tt(),x(),h(`🌾 Thu hoạch ${t.qty} ${t.plant.name}! (+${t.qty*t.plant.sell_price_per_yield}🪙 nếu bán)`,"success")):(x(),h(t.msg,"error"))}window.handleHarvest=he;function fe(e){const t=removeDead(e);t&&t.ok?(tt(),x(),h("🗑️ Đã dọn cây chết","info")):t&&h(t.msg,"error")}window.handleRemoveDead=fe;function me(e){const t=G.plants[e];if(!t)return;const n=PLANTS_DATA[t.plant_id];if(confirm(`Bạn có chắc chắn muốn cuốc đất để huỷ bỏ cây ${n.name} không? (Hạt giống sẽ không được hoàn lại)`)){const s=clearPlot(e);s.ok?(tt(),x(),h("⛏️ Đã cuốc đất và huỷ cây thành công!","success")):h(s.msg,"error")}}window.handleClearPlot=me;function mn(){const e=buyLand(currentZone);if(!e.ok){h(e.msg,"error");return}x(),h(`🏗️ Đã mở thêm 3 ô đất! (-${e.price}🪙)`,"success")}window.handleBuyLand=mn;function Ct(e){const t=e.split("_"),n=t[0]!==void 0?parseInt(t[0]):0,s=t[1]!==void 0?parseInt(t[1]):0,o=n*36+s;let a=null,l=!1;if(o>0){const c=Math.floor((o-1)/36),p=(o-1)%36;a=`${c}_${p}`;const f=G.plots[a];f&&!f.locked&&(l=!0)}let d=null,u=!1;if(o<107){const c=Math.floor((o+1)/36),p=(o+1)%36;d=`${c}_${p}`;const f=G.plots[d];f&&!f.locked&&(u=!0)}return{prevKey:a,prevActive:l,nextKey:d,nextActive:u}}window.getNavigationPlots=Ct;function wt(){const e=document.getElementById("btnPrevPlot"),t=document.getElementById("btnNextPlot");if(!e||!t||!selectedPlot)return;const n=Ct(selectedPlot);e.disabled=!n.prevActive,t.disabled=!n.nextActive}window.updatePlotNavigationButtons=wt;function gn(e){if(!selectedPlot)return;const t=Ct(selectedPlot),n=e==="prev"?t.prevKey:t.nextKey;(e==="prev"?t.prevActive:t.nextActive)&&n&&(selectedPlot=n,it(),renderFarmGridArea())}window.navigatePlot=gn;document.addEventListener("click",e=>{const t=e.target;if(t.closest(".close-plot-modal")||t.closest('[data-action="close-plot-modal"]')){tt(),e.preventDefault();return}const n=t.closest(".plot-cell");if(n&&n.hasAttribute("data-plot-key")){const o=n.getAttribute("data-plot-key");ce(o),e.preventDefault();return}const s=t.closest("[data-action]");if(s){const o=s.getAttribute("data-action"),a=s.getAttribute("data-plot")||selectedPlot;switch(o){case"close-plot-modal":tt();break;case"open-planting-view":ne();break;case"water-plant":de(a);break;case"open-fertilizer-view":ae();break;case"harvest-plant":he(a);break;case"catch-bug":ue(a);break;case"pesticide-plant":pe(a);break;case"clear-plot":me(a);break;case"remove-dead":fe(a);break;case"go-back-to-details":xt();break;case"close-plot-modal-open-shop":tt(),Se("viewShop");break;case"select-seed":const l=s.getAttribute("data-seed-id");se(l);break;case"select-fert":const d=parseInt(s.getAttribute("data-fert-id"));oe(d);break;case"confirm-plant":ie();break;case"select-fertilizer-type":const u=parseInt(s.getAttribute("data-fertilizer-type"));re(u);break;case"confirm-fertilizer":le();break}e.preventDefault()}});function jt(e){const t=e==="poultry",n=t?"Chuồng gia cầm 🐔":"Chuồng gia súc 🐮",s=t?G.poultry_capacity:G.livestock_capacity,o=G.animals.filter(c=>c.type===(t?"chicken":"cow")),a=12e3*Math.pow(2,s-3),l=t?"food_poultry":"food_livestock",d=G.inventory[l]||0;let u=`
    <div class="flex flex-col gap-4">
      <!-- Barn Header -->
      <div class="bg-gray-800/80 border border-gray-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div>
          <h2 class="text-lg font-bold text-yellow-400 flex items-center gap-2">
            <span>${t?"🐔":"🐮"}</span>
            <span>${n}</span>
          </h2>
          <div class="text-xs text-gray-400 mt-1 font-semibold flex items-center gap-1.5">
            <span>Sức chứa:</span>
            <span class="text-cyan-400 font-bold">${o.length}/${s} con</span>
            <span class="text-gray-600">|</span>
            <span>Tối đa: 20 con</span>
          </div>
        </div>
        <div>
  `;return s<20?u+=`
          <button class="btn btn-green text-xs font-bold py-2 px-3 shadow-md" onclick="handleExpandBarn('${e}')">
            🏗️ Mở rộng +1 sức chứa (${a}🪙)
          </button>
    `:u+=`
          <span class="text-xs text-gray-500 font-bold">✓ Chuồng đã mở tối đa</span>
    `,u+=`
        </div>
      </div>
      
      <!-- Animal Grid -->
  `,o.length===0?u+=`
      <div class="flex flex-col items-center justify-center py-12 bg-gray-900/50 rounded-2xl border border-dashed border-gray-700 text-center">
        <span class="text-5xl mb-3">${t?"🐔":"🐮"}</span>
        <div class="text-gray-300 font-bold mb-1">Chuồng đang trống</div>
        <p class="text-xs text-gray-500 mb-4">Hãy mua vật nuôi từ tiệm tạp hóa để bắt đầu chăn nuôi.</p>
        <button class="btn btn-yellow text-xs font-bold py-2 px-4 shadow-md" onclick="switchView('viewShop')">
          🏪 Đến Cửa hàng mua vật nuôi
        </button>
      </div>
    `:(u+='<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">',o.forEach(c=>{c.lazyUpdate(Date.now());const p=Date.now(),f=p-c.purchased_at,_=4,m=36e5;let b="",g="",w="",V="";if(c.status!=="dead"&&c.medicine_until&&c.medicine_until>p&&(V=`<div class="text-[11px] text-cyan-400 font-bold flex items-center gap-1 mt-0.5">🛡️ Kháng bệnh: ${F(c.medicine_until-p)}</div>`),c.status==="dead")b="Đã chết 💀",g="text-red-400",w="Sinh vật đã qua đời";else if(c.sick_started_at)if(b="Nhiễm bệnh 🤒",g="text-purple-400 font-extrabold animate-pulse",c.status==="baby"){const z=Math.max(0,_*m-c.grown_ms);w=`Trưởng thành sau: <span class="text-white font-bold font-mono">${F(z)}</span> <span class="text-purple-400 font-semibold block text-[10px] mt-0.5">⚠️ Đã dừng lớn do bệnh</span>`}else{const z=Math.max(0,336*m-f);w=`Tuổi thọ còn: <span class="text-white font-bold font-mono">${F(z)}</span> <span class="text-purple-400 font-semibold block text-[10px] mt-0.5">⚠️ Đã dừng sản xuất do bệnh</span>`}else if(c.status==="baby"){b="Con non 🍼",g="text-green-400";const z=Math.max(0,_*m-c.grown_ms);w=`Trưởng thành sau: <span class="text-white font-bold font-mono">${F(z)}</span>`}else{b="Trưởng thành ✨",g="text-yellow-400";const z=Math.max(0,14*24*m-f);w=`Tuổi thọ còn: <span class="text-white font-bold font-mono">${F(z)}</span>`}const q=Math.round(c.health),$t=q<=20?"bg-red-500":q<=50?"bg-yellow-500":"bg-green-500",X=Math.floor(c.accumulated_production),ut=c.max_production;if(u+=`
        <div class="bg-gray-800/80 border border-gray-700 rounded-2xl p-4 flex flex-col justify-between hover:border-gray-500 transition-all shadow-lg relative">
          <!-- Top section -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-3xl">${c.emoji}</span>
              <span class="text-xs font-bold uppercase tracking-wider ${g}">${b}</span>
            </div>
            
            <div class="space-y-1.5 text-xs text-gray-300">
              <div>${w}</div>
              ${V}
              
              <!-- Health bar -->
              <div>
                <div class="flex justify-between mb-0.5 font-semibold text-[11px]">
                  <span>Sinh lực:</span>
                  <span class="${q<=20?"text-red-400":q<=50?"text-yellow-400":"text-green-400"} font-bold font-mono">${q}%</span>
                </div>
                <div class="w-full bg-gray-900 rounded-full h-2 overflow-hidden shadow-inner border border-gray-700">
                  <div class="${$t} h-2 rounded-full transition-all" style="width: ${q}%"></div>
                </div>
              </div>
              
              <!-- Production info -->
              ${c.status==="adult"?`
                <div class="flex justify-between items-center py-1 border-t border-gray-700/60 mt-2">
                  <span>${t?"🥚 Trứng tích lũy:":"🥛 Sữa tích lũy:"}</span>
                  <span class="font-bold font-mono text-cyan-400">${X}/${ut}</span>
                </div>
                ${X>=ut?`
                  <div class="text-[10px] text-yellow-500 font-bold animate-pulse text-right">⚠️ Đã đầy sản lượng! Cần thu hoạch.</div>
                `:""}
              `:""}
            </div>
          </div>
          
          <!-- Bottom actions -->
          <div class="mt-4 pt-3 border-t border-gray-700/60 flex flex-col gap-1.5">
      `,c.status==="dead")u+=`
            <button class="btn btn-gray w-full py-2 text-xs font-bold" onclick="handleRemoveDeadAnimal('${c.id}')">
              🗑️ Dọn dẹp xác vật nuôi
            </button>
        `;else{u+='<div class="grid grid-cols-2 gap-2">';const z=q<=50;if(u+=`
          <button class="btn ${z?"btn-blue":"btn-gray opacity-50 cursor-not-allowed"} py-2 text-xs font-bold flex items-center justify-center gap-1" 
                  ${z?`onclick="handleFeedAnimal('${c.id}')"`:"disabled"}
                  title="${z?"Cho ăn":"Chưa thể cho ăn (chỉ khi sinh lực <= 50%)"}">
            🥣 Cho ăn (Còn x${d})
          </button>
        `,c.status==="adult"){const at=X>=1;u+=`
            <button class="btn ${at?"btn-yellow animate-bounce":"btn-gray opacity-50 cursor-not-allowed"} py-2 text-xs font-bold" 
                    ${at?`onclick="handleHarvestAnimal('${c.id}')"`:"disabled"}>
              🧺 Thu hoạch
            </button>
          `,u+="</div>",u+=`
            <button class="btn btn-green w-full py-2 text-xs font-bold mt-1.5" onclick="handleSellAnimal('${c.id}')">
              💰 Bán vật nuôi (+${c.sell_price}🪙)
            </button>
          `}else u+=`
            <button class="btn btn-gray opacity-50 cursor-not-allowed py-2 text-xs font-bold" disabled>
              🚫 Chưa thể thu hoạch
            </button>
          </div>
          `;const kt=G.inventory.medicine_animal||0;u+=`
          <button class="btn btn-purple w-full py-2 text-xs font-bold mt-1.5 flex items-center justify-center gap-1"
                  onclick="handleCureAnimal('${c.id}')">
            💊 Tiêm thuốc (Còn x${kt})
          </button>
        `}u+=`
          </div>
        </div>
      `}),u+="</div>"),u+=`
    </div>
  `,u}window.renderBarnView=jt;function yn(e){const t=GAME.expandBarn(e);t.ok?(x(),h(`🏗️ Mở rộng chuồng thành công! Sức chứa mới: ${t.newCap} con`,"success")):h(t.msg,"error")}window.handleExpandBarn=yn;function bn(e){const t=GAME.feedAnimal(e);t.ok?(x(),h("🥣 Cho vật nuôi ăn thành công! Sinh lực hồi phục 100%","success")):h(t.msg,"error")}window.handleFeedAnimal=bn;function _n(e){const t=GAME.harvestAnimal(e);if(t.ok){x();const n=t.item==="harvest_chicken_egg"?"Trứng gà":"Sữa bò";h(`🧺 Đã thu hoạch ${t.qty} ${n}! (+${t.item==="harvest_chicken_egg"?t.qty*50:t.qty*500}🪙 nếu bán)`,"success")}else h(t.msg,"error")}window.handleHarvestAnimal=_n;function xn(e){const t=GAME.sellAnimal(e);t.ok?(x(),h(`💰 Đã bán vật nuôi! Nhận được +${t.price}🪙`,"success")):h(t.msg,"error")}window.handleSellAnimal=xn;function wn(e){const t=GAME.removeDeadAnimal(e);t.ok?(x(),h("🗑️ Đã dọn dẹp xác vật nuôi","info")):h(t.msg,"error")}window.handleRemoveDeadAnimal=wn;function vn(e){const t=GAME.cureAnimal(e);t.ok?(x(),h("💊 Đã tiêm thuốc trị bệnh và bảo vệ thành công!","success")):h(t.msg,"error")}window.handleCureAnimal=vn;function Sn(e){window.shopTab=e,document.querySelectorAll(".shop-tab").forEach(n=>{n.classList.remove("active","text-yellow-400","border-b-2","border-yellow-400"),n.classList.add("text-gray-400")});const t=document.getElementById(e==="buy"?"tabBuy":"tabSell");t&&(t.classList.add("active","text-yellow-400","border-b-2","border-yellow-400"),t.classList.remove("text-gray-400")),ct()}window.showShopTab=Sn;function ct(){J();const e=document.getElementById("shopContent");e&&(window.shopTab==="buy"?e.innerHTML=ge():e.innerHTML=be())}window.renderShopContent=ct;function ge(){const e=[];Object.values(PLANTS_DATA).filter(o=>o.season===G.season).forEach(o=>{e.push({type:"seed",id:o.id,data:o})}),e.push({type:"animal",id:"chicken",data:{name:"Gà con",buy_price:100,emoji:"🐔"}}),e.push({type:"animal",id:"cow",data:{name:"Bò con",buy_price:200,emoji:"🐮"}}),[1,2,3].forEach(o=>{e.push({type:"fertilizer",id:o.toString(),data:FERTILIZER_DATA[o]})}),e.push({type:"pesticide",id:"pesticide",data:{name:"Thuốc trừ sâu",price:PESTICIDE_PRICE,emoji:"🧪"}}),e.push({type:"food",id:"bread",data:{name:"Bánh mì",price:1e3,emoji:"🍞",energy:10}}),e.push({type:"food",id:"noodle",data:{name:"Mì",price:1800,emoji:"🍜",energy:25}}),e.push({type:"food",id:"rice",data:{name:"Cơm",price:4800,emoji:"🍚",energy:50}}),e.push({type:"food",id:"poultry",data:{name:"Thức ăn gia cầm",price:50,emoji:"🌾",energy:0}}),e.push({type:"food",id:"livestock",data:{name:"Thức ăn gia súc",price:50,emoji:"🌾",energy:0}}),e.push({type:"medicine_animal",id:"medicine_animal",data:{name:"Thuốc thú y",price:50,emoji:"💊"}}),!window.selectedShopItemId&&e.length>0&&(window.selectedShopItemId=e[0].type+"_"+e[0].id);let t='<div class="w-full md:w-3/5 overflow-y-auto pr-2" style="max-height: 60vh;">';[{title:"🌱 Hạt giống",filter:o=>o.type==="seed"},{title:"🐔 Gia súc & Gia cầm",filter:o=>o.type==="animal"},{title:"🍞 Thực phẩm hồi năng lượng (Người)",filter:o=>o.type==="food"&&o.id!=="poultry"&&o.id!=="livestock"},{title:"🌾 Thức ăn vật nuôi & Hỗ trợ",filter:o=>o.type==="fertilizer"||o.type==="pesticide"||o.type==="medicine_animal"||o.id==="poultry"||o.id==="livestock"}].forEach(o=>{const a=e.filter(o.filter);a.length>0&&(t+=`<div class="font-bold text-yellow-400 mb-2 mt-4 first:mt-1 text-xs uppercase tracking-wider">${o.title}</div>`,a.forEach(l=>{const d=l.data,u=window.selectedShopItemId===`${l.type}_${l.id}`,c=d.price||d.buy_price||PESTICIDE_PRICE;let p="";l.type==="seed"?p=`Hạt giống · Mùa ${SEASON_LABELS[d.season]}`:l.type==="animal"?p="Vật nuôi nuôi ở Farm":l.type==="food"?l.id==="poultry"||l.id==="livestock"?p="Thức ăn cho vật nuôi":p=`Thực phẩm · Hồi +${d.energy}⚡`:l.type==="fertilizer"?p="Phân bón tăng trưởng":l.type==="pesticide"?p="Thuốc phòng trừ sâu hại":l.type==="medicine_animal"&&(p="Thuốc thú y trị bệnh"),t+=`
          <div class="p-3 mb-2 rounded-xl cursor-pointer flex justify-between items-center border transition-all ${u?"bg-yellow-950/40 border-yellow-500 shadow-md shadow-yellow-500/10":"bg-gray-800/80 border-gray-700 hover:border-gray-500"}" onclick="selectShopItem('${l.type}_${l.id}')">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${d.emoji}</span>
              <div>
                <div class="font-bold text-white text-sm">${d.name}</div>
                <div class="text-xs text-gray-400 mt-0.5">${p}</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div class="text-yellow-400 font-bold text-sm bg-gray-900 px-2 py-1 rounded border border-gray-700 flex items-center gap-1">${c}🪙</div>
              <span class="text-gray-500 text-xs md:hidden">▶</span>
            </div>
          </div>
        `}))}),t+="</div>";let s='<div class="hidden md:flex md:w-2/5 pl-4 border-l border-gray-700 flex-col gap-4">';return s+=vt(window.selectedShopItemId),s+="</div>",`<div class="flex flex-col md:flex-row w-full gap-4">${t}${s}</div>`}window.renderBuyTab=ge;function vt(e){const t=[];Object.values(PLANTS_DATA).filter(o=>o.season===G.season).forEach(o=>{t.push({type:"seed",id:o.id,data:o})}),t.push({type:"animal",id:"chicken",data:{name:"Gà",buy_price:100,emoji:"🐔"}}),t.push({type:"animal",id:"cow",data:{name:"Bò",buy_price:200,emoji:"🐮"}}),[1,2,3].forEach(o=>{t.push({type:"fertilizer",id:o.toString(),data:FERTILIZER_DATA[o]})}),t.push({type:"pesticide",id:"pesticide",data:{name:"Thuốc trừ sâu",price:PESTICIDE_PRICE,emoji:"🧪"}}),t.push({type:"food",id:"bread",data:{name:"Bánh mì",price:1e3,emoji:"🍞",energy:10}}),t.push({type:"food",id:"noodle",data:{name:"Mì",price:1800,emoji:"🍜",energy:25}}),t.push({type:"food",id:"rice",data:{name:"Cơm",price:4800,emoji:"🍚",energy:50}}),t.push({type:"food",id:"poultry",data:{name:"Thức ăn gia cầm",price:50,emoji:"🌾",energy:0}}),t.push({type:"food",id:"livestock",data:{name:"Thức ăn gia súc",price:50,emoji:"🌾",energy:0}}),t.push({type:"medicine_animal",id:"medicine_animal",data:{name:"Thuốc thú y",price:50,emoji:"💊"}});const n=t.find(o=>`${o.type}_${o.id}`===e);if(!n)return"";let s="";if(n.type==="seed"){const o=n.data,a=o.season!==G.season;s+=`
      <div class="text-center">
        <div class="text-6xl mb-2">${o.emoji}</div>
        <div class="text-xl font-bold text-yellow-400">${o.name}</div>
        <div class="text-sm text-gray-400">Mùa ${SEASON_LABELS[o.season]}</div>
      </div>
      <div class="bg-gray-800 p-3 rounded-lg border border-gray-700 text-sm space-y-2">
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Giá mua:</span> <span class="text-yellow-400 font-bold">${o.buy_price}🪙</span></div>
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Giá bán NS:</span> <span class="text-green-400">${o.sell_price_per_yield}🪙/sp</span></div>
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Sản lượng:</span> <span class="text-green-400">${o.base_yield}</span></div>
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Thời gian:</span> <span class="text-blue-400">${F(o.growth_time*6e4)}</span></div>
        <div class="flex justify-between"><span>Khát nước:</span> <span class="text-blue-400">-${Math.round(o.water_consume_per_hour)}%/h</span></div>
        ${a?'<div class="text-red-400 text-xs mt-2 text-center bg-red-950/40 p-1.5 rounded border border-red-900">⚠️ Trái mùa: -50% sản lượng</div>':'<div class="text-green-400 text-xs mt-2 text-center bg-green-950/40 p-1.5 rounded border border-green-900">✅ Đang đúng mùa</div>'}
      </div>
      <div class="mt-4 md:mt-auto flex flex-col gap-2">
        <button class="btn btn-green w-full py-2.5 font-bold" onclick="shopBuy('seed', '${o.id}', 1)">Mua x1 (${o.buy_price}🪙)</button>
        <button class="btn btn-green w-full py-2.5 font-bold" onclick="shopBuy('seed', '${o.id}', 5)">Mua x5 (${o.buy_price*5}🪙)</button>
      </div>
    `}else if(n.type==="animal"){const o=n.data,a=n.id==="chicken",l=a?200:400,d=a?`Gà con (Chuồng gia cầm, capacity: ${G.animals.filter(u=>u.type==="chicken").length}/${G.poultry_capacity})`:`Bò con (Chuồng gia súc, capacity: ${G.animals.filter(u=>u.type==="cow").length}/${G.livestock_capacity})`;s+=`
      <div class="text-center">
        <div class="text-6xl mb-2">${o.emoji}</div>
        <div class="text-xl font-bold text-yellow-400">${o.name}</div>
        <div class="text-sm text-gray-400">${d}</div>
      </div>
      <div class="bg-gray-800 p-3 rounded-lg border border-gray-700 text-xs space-y-2 leading-relaxed">
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Giá mua:</span> <span class="text-yellow-400 font-bold">${o.buy_price}🪙</span></div>
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Giá bán (lớn):</span> <span class="text-green-400 font-bold">${l}🪙</span></div>
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Thời gian trưởng thành:</span> <span class="text-blue-400">4 giờ</span></div>
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Tuổi thọ:</span> <span class="text-green-400">14 ngày</span></div>
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Sản lượng:</span> <span class="text-cyan-400">${a?"20 trứng/giờ":"5 sữa bò/giờ"}</span></div>
        <div class="text-[11px] text-gray-400 mt-1">💡 Cần cho ăn cứ mỗi 6 giờ bằng <b>${a?"thức ăn gia cầm":"thức ăn gia súc"}</b> (khi sinh lực <= 50%). Nếu sinh lực về 0 và không cho ăn trong 6 giờ, vật nuôi sẽ chết.</div>
      </div>
      <div class="mt-4 md:mt-auto flex flex-col gap-2">
        <button class="btn btn-green w-full py-2.5 font-bold" onclick="shopBuy('animal', '${n.id}', 1)">Mua x1 (${o.buy_price}🪙)</button>
      </div>
    `}else if(n.type==="fertilizer"){const o=n.data;s+=`
      <div class="text-center">
        <div class="text-6xl mb-2">${o.emoji}</div>
        <div class="text-xl font-bold text-yellow-400">${o.name}</div>
        <div class="text-sm text-gray-400">Dùng để bón cây</div>
      </div>
      <div class="bg-gray-800 p-3 rounded-lg border border-gray-700 text-sm space-y-2">
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Giá mua:</span> <span class="text-yellow-400 font-bold">${o.price}🪙</span></div>
        <div class="flex flex-col mt-2">
          <span class="text-gray-400 mb-1 font-bold">Tác dụng:</span>
          <span class="text-green-400">+${Math.round((o.multiplier-1)*100)}% Sản lượng</span>
          <span class="text-blue-400">-${Math.round((1-o.time_multiplier)*100)}% Thời gian lớn</span>
        </div>
      </div>
      <div class="mt-4 md:mt-auto flex flex-col gap-2">
        <button class="btn btn-green w-full py-2.5 font-bold" onclick="shopBuy('fertilizer', '${n.id}', 1)">Mua x1 (${o.price}🪙)</button>
        <button class="btn btn-green w-full py-2.5 font-bold" onclick="shopBuy('fertilizer', '${n.id}', 5)">Mua x5 (${o.price*5}🪙)</button>
      </div>
    `}else if(n.type==="pesticide")s+=`
      <div class="text-center">
        <div class="text-6xl mb-2">🧪</div>
        <div class="text-xl font-bold text-yellow-400">Thuốc trừ sâu</div>
        <div class="text-sm text-gray-400">Dùng để diệt sâu bọ</div>
      </div>
      <div class="bg-gray-800 p-3 rounded-lg border border-gray-700 text-sm space-y-2">
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Giá mua:</span> <span class="text-yellow-400 font-bold">${PESTICIDE_PRICE}🪙</span></div>
        <div class="flex flex-col mt-2">
          <span class="text-gray-400 mb-1 font-bold">Tác dụng:</span>
          <span class="text-green-400 font-bold">Diệt sâu hại tức thì</span>
          <span class="text-blue-400">Bảo vệ cây khỏi sâu bệnh trong 24h</span>
        </div>
      </div>
      <div class="mt-4 md:mt-auto flex flex-col gap-2">
        <button class="btn btn-green w-full py-2.5 font-bold" onclick="shopBuy('pesticide', '', 1)">Mua x1 (${PESTICIDE_PRICE}🪙)</button>
        <button class="btn btn-green w-full py-2.5 font-bold" onclick="shopBuy('pesticide', '', 5)">Mua x5 (${PESTICIDE_PRICE*5}🪙)</button>
      </div>
    `;else if(n.type==="food"){const o=n.data,a=n.id==="poultry"||n.id==="livestock";s+=`
      <div class="text-center">
        <div class="text-6xl mb-2">${o.emoji}</div>
        <div class="text-xl font-bold text-yellow-400">${o.name}</div>
        <div class="text-sm text-gray-400">${a?"Thức ăn cho vật nuôi":"Thực phẩm hồi năng lượng"}</div>
      </div>
      <div class="bg-gray-800 p-3 rounded-lg border border-gray-700 text-sm space-y-2">
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Giá mua:</span> <span class="text-yellow-400 font-bold">${o.price}🪙</span></div>
        <div class="flex flex-col mt-2">
          <span class="text-gray-400 mb-1 font-bold">Tác dụng:</span>
          ${a?`
            <span class="text-green-400 font-bold">Hồi phục 100% sinh lực cho vật nuôi</span>
            <span class="text-gray-400 text-xs mt-1">Dùng khi sinh lực của vật nuôi <= 50%</span>
          `:`
            <span class="text-cyan-400 font-bold">+${o.energy} ⚡ Năng lượng cho người chơi</span>
          `}
        </div>
      </div>
      <div class="mt-4 md:mt-auto flex flex-col gap-2">
        <button class="btn btn-green w-full py-2.5 font-bold" onclick="shopBuy('food', '${n.id}', 1)">Mua x1 (${o.price}🪙)</button>
        <button class="btn btn-green w-full py-2.5 font-bold" onclick="shopBuy('food', '${n.id}', 5)">Mua x5 (${o.price*5}🪙)</button>
      </div>
    `}else if(n.type==="medicine_animal"){const o=n.data;s+=`
      <div class="text-center">
        <div class="text-6xl mb-2">${o.emoji}</div>
        <div class="text-xl font-bold text-yellow-400">${o.name}</div>
        <div class="text-sm text-gray-400">Thuốc hỗ trợ điều trị và phòng bệnh cho vật nuôi</div>
      </div>
      <div class="bg-gray-800 p-3 rounded-lg border border-gray-700 text-sm space-y-2">
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Giá mua:</span> <span class="text-yellow-400 font-bold">${o.price}🪙</span></div>
        <div class="flex flex-col mt-2">
          <span class="text-gray-400 mb-1 font-bold">Tác dụng:</span>
          <span class="text-green-400 font-bold">Trị bệnh ngay lập tức cho vật nuôi</span>
          <span class="text-blue-400">Bảo vệ vật nuôi không bị nhiễm bệnh trong 24h</span>
        </div>
      </div>
      <div class="mt-4 md:mt-auto flex flex-col gap-2">
        <button class="btn btn-green w-full py-2.5 font-bold" onclick="shopBuy('medicine_animal', '${n.id}', 1)">Mua x1 (${o.price}🪙)</button>
        <button class="btn btn-green w-full py-2.5 font-bold" onclick="shopBuy('medicine_animal', '${n.id}', 5)">Mua x5 (${o.price*5}🪙)</button>
      </div>
    `}return s}window.renderShopItemDetails=vt;function ye(e){const t=document.getElementById("shopItemModal"),n=document.getElementById("shopItemModalContent");t&&n&&(n.innerHTML=vt(e),t.style.display="flex")}window.openShopItemModal=ye;function $n(){const e=document.getElementById("shopItemModal");e&&(e.style.display="none")}window.closeShopItemModal=$n;function kn(e){window.selectedShopItemId=e,window.innerWidth<768?ye(e):ct()}window.selectShopItem=kn;function be(){const e=G.inventory,t=Object.keys(e).filter(s=>e[s]>0&&(s.startsWith("harvest_")||s==="cheese"));if(t.length===0)return'<div class="text-center py-8 text-gray-400"><div class="text-4xl mb-2">🎒</div>Không có sản phẩm thu hoạch nào để bán</div>';let n='<div class="grid grid-cols-2 md:grid-cols-3 gap-3 p-1">';return t.forEach(s=>{let o=s,a=0,l="📦";if(s==="harvest_chicken_egg")o="Trứng gà",a=50,l="🥚";else if(s==="harvest_cow_milk")o="Sữa bò",a=500,l="🥛";else if(s.startsWith("harvest_")){const d=PLANTS_DATA[s.replace("harvest_","")];d&&(o=d.name,a=d.sell_price_per_yield,l=d.emoji)}else if(s.startsWith("fertilizer_")){const d=parseInt(s.replace("fertilizer_","")),u=FERTILIZER_DATA[d];u&&(o=u.name,a=Math.floor(u.price*.5),l=u.emoji)}else if(s==="pesticide")o="Thuốc trừ sâu",a=Math.floor(PESTICIDE_PRICE*.5),l="🧪";else if(s==="food_bread")o="Bánh mì",a=500,l="🍞";else if(s==="food_noodle")o="Mì",a=900,l="🍜";else if(s==="food_rice")o="Cơm",a=2400,l="🍚";else if(s==="food_poultry")o="Thức ăn gia cầm",a=25,l="🌾";else if(s==="food_livestock")o="Thức ăn gia súc",a=25,l="🌾";else if(s==="medicine_animal")o="Thuốc thú y",a=25,l="💊";else if(PLANTS_DATA[s]){const d=PLANTS_DATA[s];o=d.name+" (hạt giống)",a=Math.floor(d.buy_price*.5),l=d.emoji}else s==="cheese"&&(o="Phô mai",a=2500,l="🧀");n+=`
      <div class="relative bg-gray-800 border border-gray-700 rounded-2xl p-3 flex flex-col justify-between hover:border-gray-500 transition-all shadow-lg">
        <!-- Badge -->
        <div class="absolute top-2 right-2 text-[10px] sm:text-xs bg-gray-900 border border-gray-700 px-2 py-0.5 rounded-full text-cyan-400 font-bold font-mono shadow-md z-10">
          x${e[s]}
        </div>
        
        <!-- Info -->
        <div class="flex items-center gap-2 mb-3 pr-8">
          <span class="text-3xl">${l}</span>
          <div class="min-w-0 flex-1">
            <div class="font-bold text-white text-xs sm:text-sm truncate" title="${o}">${o}</div>
            <div class="text-[11px] text-yellow-400 font-semibold mt-0.5 flex items-center gap-0.5">
              <span>Bán:</span>
              <span class="text-yellow-300 font-bold">${a}🪙</span>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="grid grid-cols-2 gap-1.5 mt-auto">
          <button class="btn btn-yellow text-[10px] sm:text-xs py-1.5 font-bold flex items-center justify-center gap-1 shadow-sm" onclick="shopSell('${s}', 1)">Bán 1</button>
          <button class="btn btn-red text-[10px] sm:text-xs py-1.5 font-bold flex items-center justify-center gap-1 shadow-sm" onclick="shopSell('${s}', ${e[s]})">Bán hết</button>
        </div>
      </div>
    `}),n+="</div>",n}window.renderSellTab=be;function Tn(e,t,n){const s=buyItem(e,t,n);if(!s.ok){h(s.msg,"error");return}J(),ct(),window.innerWidth<768&&document.getElementById("shopItemModal").style.display==="flex"&&(document.getElementById("shopItemModalContent").innerHTML=vt(window.selectedShopItemId)),h(`✅ Đã mua (${s.cost}🪙)`,"success")}window.shopBuy=Tn;function An(e,t){const n=sellItem(e,t);if(!n.ok){h(n.msg,"error");return}J(),ct(),h(`💰 Bán được ${n.revenue}🪙!`,"success")}window.shopSell=An;window.selectedInventoryItem=null;function Rt(){const e=G.inventory,t=Object.keys(e).filter(l=>e[l]>0),n=document.getElementById("inventoryContent");if(!n)return;if(t.length===0){n.innerHTML='<div class="text-center py-8 text-gray-400"><div class="text-4xl mb-2">🎒</div>Túi trống</div>';return}(!window.selectedInventoryItem||!e[window.selectedInventoryItem])&&(window.selectedInventoryItem=t[0]);let s='<div class="w-full md:w-3/5 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 content-start pr-2 overflow-y-auto" style="max-height: 50vh;">';t.forEach(l=>{let d=l,u="📦";if(l==="harvest_chicken_egg")d="Trứng gà",u="🥚";else if(l==="harvest_cow_milk")d="Sữa bò",u="🥛";else if(l.startsWith("harvest_")){const p=PLANTS_DATA[l.replace("harvest_","")];p&&(d=p.name,u=p.emoji)}else if(l.startsWith("fertilizer_")){const p=parseInt(l.replace("fertilizer_","")),f=FERTILIZER_DATA[p];f&&(d=f.name,u=f.emoji)}else if(l==="pesticide")d="Thuốc trừ sâu",u="🧪";else if(PLANTS_DATA[l]){const p=PLANTS_DATA[l];d=p.name,u=p.emoji}else l==="food_bread"?(d="Bánh mì",u="🍞"):l==="food_noodle"?(d="Mì",u="🍜"):l==="food_rice"?(d="Cơm",u="🍚"):l==="food_poultry"?(d="Thức ăn gia cầm",u="🌾"):l==="food_livestock"?(d="Thức ăn gia súc",u="🌾"):l==="medicine_animal"?(d="Thuốc thú y",u="💊"):l==="cheese"&&(d="Phô mai",u="🧀");const c=window.selectedInventoryItem===l;s+=`
      <div class="relative flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer border-2 transition-all ${c?"border-yellow-400 bg-yellow-900 bg-opacity-30":"border-gray-700 bg-gray-800 hover:border-gray-500"}" style="aspect-ratio: 1;" onclick="selectInventoryItem('${l}')" title="${d}">
        <span style="font-size: 28px;">${u}</span>
        <span class="absolute bottom-1 right-1 text-[10px] font-bold text-yellow-400 bg-gray-900 px-1 rounded shadow">x${e[l]}</span>
      </div>
    `}),s+="</div>";let o='<div class="w-full md:w-2/5 mt-4 md:mt-0 md:pl-4 border-t md:border-t-0 md:border-l border-gray-700 flex flex-col gap-4 pt-4 md:pt-0">';const a=window.selectedInventoryItem;if(a){let l=a,d="📦",u="Khác",c="";if(a==="harvest_chicken_egg")l="Trứng gà",d="🥚",u="Nông sản",c='Trứng gà tươi ngon thu hoạch từ chuồng gia cầm.<br>Giá bán: <span class="text-yellow-400">50🪙</span>.<br><span class="text-green-400">💡 Ăn để hồi phục +2 Năng lượng.</span>';else if(a==="harvest_cow_milk")l="Sữa bò",d="🥛",u="Nông sản",c='Sữa bò tươi nguyên chất thu hoạch từ chuồng gia súc.<br>Giá bán: <span class="text-yellow-400">500🪙</span>.<br><span class="text-green-400">💡 Ăn để hồi phục +10 Năng lượng.</span>';else if(a.startsWith("harvest_")){const b=PLANTS_DATA[a.replace("harvest_","")];b&&(l=b.name,d=b.emoji,u="Nông sản",c=`Giá bán: <span class="text-yellow-400">${b.sell_price_per_yield}🪙/cái</span><br><br><span class="text-green-400">💡 Có thể ăn để hồi phục +2 Năng lượng.</span>`)}else if(a.startsWith("fertilizer_")){const b=parseInt(a.replace("fertilizer_","")),g=FERTILIZER_DATA[b];g&&(l=g.name,d=g.emoji,u="Phân bón",c=`Giúp tăng <span class="text-green-400">${Math.round((g.multiplier-1)*100)}% SL</span> và giảm <span class="text-blue-400">${Math.round((1-g.time_multiplier)*100)}% thời gian</span> sinh trưởng của cây.`)}else if(a==="pesticide")l="Thuốc trừ sâu",d="🧪",u="Vật phẩm",c='Diệt sâu bọ ngay lập tức và bảo vệ cây khỏi sâu bệnh trong vòng <span class="text-blue-400">24 giờ</span>.';else if(PLANTS_DATA[a]){const b=PLANTS_DATA[a];l=b.name,d=b.emoji,u="Hạt giống",c=`Mùa thích hợp: <span class="text-yellow-400">${SEASON_LABELS[b.season]}</span><br>Thời gian sinh trưởng: <span class="text-blue-400">${F(b.growth_time*6e4)}</span><br>Sản lượng gốc: <span class="text-green-400">${b.base_yield}</span>`}else a==="food_bread"?(l="Bánh mì",d="🍞",u="Thực phẩm",c='Bánh mì thơm ngon giúp hồi phục <span class="text-cyan-400">+10 Năng lượng</span>.'):a==="food_noodle"?(l="Mì",d="🍜",u="Thực phẩm",c='Bát mì ăn liền nóng hổi giúp hồi phục <span class="text-cyan-400">+25 Năng lượng</span>.'):a==="food_rice"?(l="Cơm",d="🍚",u="Thực phẩm",c='Bát cơm nóng đầy đặn giúp hồi phục <span class="text-cyan-400">+50 Năng lượng</span>.'):a==="food_poultry"?(l="Thức ăn gia cầm",d="🌾",u="Thức ăn",c="Thức ăn dùng để cho gà ăn tại chuồng gia cầm. Hồi 100% sinh lực cho gà."):a==="food_livestock"?(l="Thức ăn gia súc",d="🌾",u="Thức ăn",c="Thức ăn dùng để cho bò ăn tại chuồng gia súc. Hồi 100% sinh lực cho bò."):a==="medicine_animal"?(l="Thuốc thú y",d="💊",u="Vật phẩm",c='Thuốc dùng để điều trị bệnh ngay lập tức cho vật nuôi và bảo vệ vật nuôi khỏi dịch bệnh trong vòng <span class="text-blue-400">24 giờ</span>.'):a==="cheese"&&(l="Phô mai",d="🧀",u="Sản phẩm",c='Phô mai béo ngậy được chế biến từ sữa bò tươi nguyên chất.<br>Giá bán: <span class="text-yellow-400">2500🪙</span>.<br><span class="text-green-400">💡 Ăn để hồi phục +18 Năng lượng.</span>');let p=0;a==="harvest_chicken_egg"?p=2:a==="harvest_cow_milk"?p=10:a.startsWith("harvest_")?p=2:a==="food_bread"?p=10:a==="food_noodle"?p=25:a==="food_rice"?p=50:a==="cheese"&&(p=18);let f="";p>0&&(f=`
        <div class="mt-4">
          <button class="btn btn-blue w-full py-2 font-bold" onclick="eatFood('${a}', ${p})">🍽️ Ăn (+${p} ⚡)</button>
        </div>
      `);const _=e[a]||0,m=`
      <div class="mt-4 pt-3 border-t border-gray-700/60 flex flex-col gap-2">
        <div class="text-[11px] text-gray-400 font-bold mb-0.5">Hành động túi đồ:</div>
        <div class="grid grid-cols-2 gap-2">
          <button class="btn btn-red py-2 text-xs font-bold flex items-center justify-center gap-1 shadow-sm" 
                  onclick="handleDiscardItem('${a}', 1)">
            🗑️ Vứt x1
          </button>
          <button class="btn btn-red py-2 text-xs font-bold flex items-center justify-center gap-1 shadow-sm ${_<5?"opacity-50 cursor-not-allowed":""}" 
                  ${_<5?"disabled":""} 
                  onclick="handleDiscardItem('${a}', 5)">
            🗑️ Vứt x5
          </button>
        </div>
      </div>
    `;o+=`
      <div class="text-center">
        <div class="text-6xl mb-2">${d}</div>
        <div class="text-xl font-bold text-yellow-400">${l}</div>
        <div class="text-sm text-gray-400">Loại: ${u}</div>
        <div class="text-sm text-yellow-400 font-bold mt-1">Đang có: x${e[a]}</div>
      </div>
      <div class="bg-gray-800 p-3 rounded text-sm text-gray-300 mt-2 leading-relaxed">
        ${c}
      </div>
      ${f}
      ${m}
    `}o+="</div>",n.innerHTML=`<div class="flex flex-col md:flex-row w-full">${s}${o}</div>`}window.renderInventoryContent=Rt;function In(e){window.selectedInventoryItem=e,Rt()}window.selectInventoryItem=In;function En(e,t){if(G.energy>=100){h("⚡ Năng lượng đã đầy!","info");return}if(!G.inventory[e]||G.inventory[e]<=0){h("❌ Không có vật phẩm này!","error");return}G.inventory[e]--,G.inventory[e]<=0&&delete G.inventory[e],G.energy=Math.min(100,G.energy+t),saveState(),J(),Rt(),h(`🍽️ Đã ăn, hồi phục +${t} ⚡!`,"success")}window.eatFood=En;function Mn(e,t){const n=GAME.discardItem(e,t);n.ok?(h(`🗑️ Đã vứt x${t} vật phẩm!`,"info"),G.inventory[e]||(window.selectedInventoryItem=null),x()):h(n.msg,"error")}window.handleDiscardItem=Mn;let et=null;function jn(){et&&clearInterval(et),et=setInterval(()=>{const e=document.getElementById("viewTasks");if(!e||e.classList.contains("hidden")){_e();return}if(GAME.checkQuestCooldowns()){St();return}Ln()},1e3)}window.startTasksTimer=jn;function _e(){et&&(clearInterval(et),et=null)}window.stopTasksTimer=_e;function Ln(){const e=Date.now();G.quests.forEach((t,n)=>{if(!t.cooldownUntil||t.cooldownUntil<=e)return;const s=document.getElementById(`quest_countdown_${n}`);if(!s)return;const o=t.cooldownUntil-e,a=Math.floor(o/6e4),l=Math.floor(o%6e4/1e3);s.textContent=`${a.toString().padStart(2,"0")}:${l.toString().padStart(2,"0")}`})}function St(){GAME.checkQuestCooldowns();const e=document.getElementById("tasksContent");if(!e)return;const t=Date.now();let n=`
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
  `;for(let s=0;s<3;s++){const o=G.quests[s];if(n+=`
      <div class="flex flex-col bg-gray-800/30 border border-gray-700/80 rounded-2xl p-5 hover:border-gray-500 transition-all shadow-lg min-h-[380px]">
    `,o.cooldownUntil&&o.cooldownUntil>t){const a=o.cooldownUntil-t,l=Math.floor(a/6e4),d=Math.floor(a%6e4/1e3),u=`${l.toString().padStart(2,"0")}:${d.toString().padStart(2,"0")}`;n+=`
        <div class="flex justify-between items-center pb-2.5 border-b border-gray-700/60 mb-3">
          <span class="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border text-gray-400 bg-gray-900 border-gray-800">
            ⏱️ Đang chờ
          </span>
          <span class="text-xs text-gray-400 font-bold">Ô số ${s+1}</span>
        </div>
        <div class="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div class="text-4xl mb-3 animate-pulse">⏱️</div>
          <div class="text-sm font-bold text-gray-400 mb-1">Đang chờ nhiệm vụ mới...</div>
          <div class="text-2xl font-bold font-mono text-yellow-500 bg-gray-900 px-4 py-1.5 rounded-lg border border-gray-800 shadow-inner">
            <span id="quest_countdown_${s}">${u}</span>
          </div>
          <div class="text-[11px] text-gray-500 mt-2 italic">Làm mới nhiệm vụ cần đợi 15 phút.</div>
        </div>
      `}else if(o.quest){const a=o.quest,l=a.level===1?"text-green-400 bg-green-950/30 border-green-800/40":a.level===2?"text-yellow-400 bg-yellow-950/30 border-yellow-800/40":"text-red-400 bg-red-950/30 border-red-800/40",d=a.level===1?"🟢 Cấp 1":a.level===2?"🟡 Cấp 2":"🔴 Cấp 3";let u='<div class="space-y-2 flex-1 overflow-y-auto mb-4 pr-1" style="max-height: 180px;">',c=!0;a.items.forEach(f=>{const _=G.inventory[f.key]||0,m=_>=f.qtyRequired;m||(c=!1),u+=`
          <div class="flex items-center justify-between bg-gray-900 bg-opacity-35 p-2 rounded-lg border border-gray-800">
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-2xl flex-shrink-0">${f.emoji}</span>
              <div class="min-w-0">
                <div class="text-xs font-bold text-gray-200 truncate">${f.name}</div>
                <div class="text-[10px] text-gray-500 font-mono">Gốc: ${f.sellPrice}🪙/cái</div>
              </div>
            </div>
            <div class="text-right flex-shrink-0 font-mono">
              <span class="text-xs font-bold ${m?"text-green-400":"text-red-400"}">${_}</span>
              <span class="text-xs text-gray-400 font-semibold">/${f.qtyRequired}</span>
            </div>
          </div>
        `}),u+="</div>";const p=a.rewardGold-a.baseValue;n+=`
        <div class="flex justify-between items-center pb-2.5 border-b border-gray-700/60 mb-3">
          <span class="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${l}">
            ${d}
          </span>
          <span class="text-xs text-gray-400 font-bold">Ô số ${s+1}</span>
        </div>
        <div class="text-[11px] text-gray-400 font-bold mb-2 uppercase tracking-wider">📦 Yêu cầu vật phẩm:</div>
        ${u}
        
        <div class="bg-gray-900/60 p-3 rounded-xl border border-gray-800 mb-4 text-xs">
          <div class="flex justify-between items-center text-gray-400 mb-1.5">
            <span>Giá trị bán gốc:</span>
            <span class="font-mono text-gray-300">${a.baseValue}🪙</span>
          </div>
          <div class="flex justify-between items-center border-t border-gray-800 pt-1.5">
            <span class="font-bold text-yellow-400">Vàng thưởng:</span>
            <span class="text-base font-extrabold text-yellow-400 font-mono flex items-center gap-0.5">
              <span>${a.rewardGold}</span>
              <span class="text-xs">🪙</span>
            </span>
          </div>
          <div class="text-[10px] text-green-400 text-right font-bold mt-1">
            🔥 Lời thêm +${p}🪙 (+${Math.round((a.rewardGold/a.baseValue-1)*100)}%)
          </div>
        </div>

        <div class="mt-auto flex gap-2">
          <button class="btn btn-red flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1 shadow-md"
                  onclick="handleResetQuest(${s})">
            🔄 Reset
          </button>
          <button class="btn ${c?"btn-green shadow-[0_0_10px_rgba(76,175,80,0.3)] animate-pulse":"btn-gray opacity-50 cursor-not-allowed"} flex-[2] py-2 text-xs font-bold flex items-center justify-center gap-1 shadow-md"
                  ${c?"":"disabled"}
                  onclick="handleCompleteQuest(${s})">
            ✓ Giao hàng
          </button>
        </div>
      `}else n+=`
        <div class="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Không có nhiệm vụ
        </div>
      `;n+=`
      </div>
    `}n+=`
    </div>
  `,e.innerHTML=n}window.renderTasksContent=St;function Dn(e){if(!confirm("Bạn có chắc chắn muốn làm mới nhiệm vụ này? Bạn sẽ phải đợi 15 phút để nhận nhiệm vụ mới."))return;const t=GAME.resetQuest(e);t.ok?(h("🔄 Đã làm mới nhiệm vụ, vui lòng chờ 15 phút!","info"),St(),W()):h(t.msg,"error")}window.handleResetQuest=Dn;function Nn(e){const t=GAME.completeQuest(e);t.ok?(h(`🎉 Đã giao hàng thành công! (+${t.rewardGold}🪙)`,"success"),St(),J(),W()):h(t.msg,"error")}window.handleCompleteQuest=Nn;function Gn(){if(G.gold<1e5){h("❌ Không đủ vàng để mở khóa (Cần 100.000 🪙)!","error");return}if(confirm("Bạn có chắc chắn muốn dùng 100.000 🪙 để mở khóa Nhà sản xuất vật tư?")){const e=GAME.unlockProducer();e.ok?(h("🎉 Đã mở khóa Nhà sản xuất vật tư!","success"),Y(),J(),W()):h(e.msg,"error")}}window.handleUnlockProducer=Gn;function Cn(e){const t=GAME.collectProducerSlot(e);t.ok?(h(`📥 Đã thu hoạch x${t.qty} ${t.emoji} ${t.name}!`,"success"),Y(),W()):h(t.msg,"error")}window.handleCollectProducer=Cn;function xe(e,t,n){const s=GAME.loadProducerSlot(e,t,n);s.ok?(h(`✅ Đã thêm x${n} vào máy sản xuất!`,"success"),slotSelectingItem[e]=!1,slotSelectedInput[e]=null,Y(),W()):h(s.msg,"error")}window.handleLoadProducer=xe;let nt=null;function Rn(){nt&&clearInterval(nt),nt=setInterval(()=>{const e=document.getElementById("viewProducer");if(!e||e.classList.contains("hidden")){we();return}GAME.updateProducer(),Y()},1e3)}window.startProducerTimer=Rn;function we(){nt&&(clearInterval(nt),nt=null)}window.stopProducerTimer=we;function Bn(e){slotSelectingItem[e]=!0,slotSelectedInput[e]=null,Y()}window.openProducerSelect=Bn;function Pn(e){slotSelectingItem[e]=!1,slotSelectedInput[e]=null,Y()}window.cancelProducerSelect=Pn;function zn(e,t){slotSelectedInput[e]=t,Y()}window.selectProducerInput=zn;function Un(e,t){slotSelectingItem[e]=!0,slotSelectedInput[e]=t,Y()}window.openProducerAddMore=Un;function qn(e,t){const n=document.getElementById(`producer_qty_input_${e}`);n&&(n.value=t)}window.setProducerQtyInputValue=qn;function Fn(e,t){const n=document.getElementById(`producer_qty_input_${e}`);if(!n)return;const s=parseInt(n.value);if(isNaN(s)||s<=0){h("❌ Số lượng nạp không hợp lệ!","error");return}if(t==="harvest_cow_milk"&&s%4!==0){h("❌ Số lượng sữa bò nạp vào phải là bội số của 4 (ví dụ: 4, 8, 12, ...)!","error");return}xe(e,t,s)}window.confirmLoadProducerSlot=Fn;function Y(){const e=document.getElementById("producerContent");if(!e)return;if(!G.producerUnlocked){e.innerHTML=`
      <div class="flex flex-col items-center justify-center py-12 px-4 text-center max-w-xl mx-auto">
        <div class="text-7xl mb-4 animate-bounce">🏭</div>
        <h2 class="text-xl font-bold text-yellow-400 mb-2">Nhà Sản Xuất Vật Tư Bị Khóa</h2>
        <p class="text-sm text-gray-300 mb-6 leading-relaxed">
          Nhà sản xuất vật tư cho phép bạn tự sản xuất hạt giống từ sản lượng nông sản thu hoạch (tối đa 64 cây trồng mỗi slot, 5 phút mỗi hạt giống) và chuyển hóa sữa bò tươi thành phô mai thơm ngon!
        </p>
        <div class="bg-gray-800/80 p-4 rounded-xl border border-gray-700 w-full mb-6 text-xs text-left space-y-2">
          <div class="flex items-center gap-2 text-yellow-400 font-bold mb-1">
            <span>💡 Chi tiết chế biến:</span>
          </div>
          <div>• <span class="text-green-400">1 Nông sản</span> ➔ <span class="text-green-400">1 Hạt giống cùng loại</span> (Thời gian: 5 phút/hạt)</div>
          <div>• <span class="text-green-400">4 Sữa bò 🥛</span> ➔ <span class="text-green-400">1 Phô mai 🧀</span> (Thời gian: 5 phút/cái. Phô mai bán được 2500🪙 hoặc ăn hồi 18⚡)</div>
        </div>
        <button class="btn btn-yellow w-full py-3.5 text-base font-extrabold shadow-lg flex items-center justify-center gap-2" onclick="handleUnlockProducer()">
          🔓 Mở khóa ngay (100.000 🪙)
        </button>
      </div>
    `;return}let t=`
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  `;for(let n=0;n<3;n++){const s=G.producerSlots[n];if(t+=`
      <div class="flex flex-col bg-gray-800/30 border border-gray-700/80 rounded-2xl p-5 hover:border-gray-500 transition-all shadow-lg min-h-[380px]">
        <div class="flex justify-between items-center pb-2.5 border-b border-gray-700/60 mb-4">
          <span class="text-xs font-bold text-gray-400">Slot Sản Xuất #${n+1}</span>
          ${s.inputKey?`
            <span class="text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
              ${s.qtyLeft>0?"⚙️ Đang chạy":"✓ Hoàn thành"}
            </span>
          `:`
            <span class="text-xs bg-gray-900 text-gray-500 border border-gray-800 px-2 py-0.5 rounded font-extrabold uppercase">
              📭 Trống
            </span>
          `}
        </div>
    `,slotSelectingItem[n]){const o=G.inventory,a=Object.keys(o).filter(d=>o[d]<=0?!1:d==="harvest_cow_milk"||d.startsWith("harvest_")&&d!=="harvest_chicken_egg"),l=slotSelectedInput[n];if(!l)t+=`
          <div class="flex-1 flex flex-col justify-between">
            <div>
              <div class="text-xs text-gray-400 font-bold mb-3 uppercase tracking-wider">Chọn nguyên liệu nạp:</div>
              ${a.length===0?`
                <div class="text-center py-8 text-xs text-gray-500 italic">
                  Không có nông sản hoặc sữa bò trong túi đồ để chế biến!
                </div>
              `:`
                <div class="space-y-1.5 overflow-y-auto max-h-[200px] pr-1">
                  ${a.map(d=>{let u=d,c="📦";if(d==="harvest_cow_milk")u="Sữa bò",c="🥛";else{const p=PLANTS_DATA[d.replace("harvest_","")];p&&(u=p.name,c=p.emoji)}return`
                      <button class="w-full flex items-center justify-between bg-gray-900/40 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 p-2.5 rounded-lg text-left text-xs transition"
                              onclick="selectProducerInput(${n}, '${d}')">
                        <span class="flex items-center gap-2">
                          <span class="text-xl">${c}</span>
                          <span class="font-bold text-gray-200">${u}</span>
                        </span>
                        <span class="font-mono text-yellow-400 font-bold bg-gray-950 px-2 py-0.5 rounded">x${o[d]}</span>
                      </button>
                    `}).join("")}
                </div>
              `}
            </div>
            <button class="btn btn-red w-full py-2 text-xs font-bold mt-4" onclick="cancelProducerSelect(${n})">
              Trở lại
            </button>
          </div>
        `;else{let d=l,u="📦",c="",p="";if(l==="harvest_cow_milk")d="Sữa bò",u="🥛",c="Phô mai",p="🧀";else{const w=PLANTS_DATA[l.replace("harvest_","")];w&&(d=w.name,u=w.emoji,c=w.name+" (Hạt)",p=w.emoji)}const f=GAME.getProducerOutputInfo(l),_=f&&f.inputRatio||1,b=64-(s.inputKey===l?s.qtyLeft+s.qtyReady*_:0);let g=Math.min(o[l],b);l==="harvest_cow_milk"&&(g=Math.floor(g/4)*4),t+=`
          <div class="flex-1 flex flex-col justify-between">
            <div class="space-y-4">
              <div class="flex items-center gap-3 bg-gray-950/40 p-2.5 rounded-xl border border-gray-800">
                <span class="text-3xl">${u}</span>
                <div>
                  <div class="text-xs text-gray-400">Đã chọn:</div>
                  <div class="text-sm font-bold text-white">${d}</div>
                  <div class="text-[10px] text-gray-500">Trong túi có: x${o[l]} | Sức chứa slot còn: ${b}</div>
                </div>
              </div>
              
              <div>
                <label class="block text-xs text-gray-400 font-bold mb-2">Số lượng nạp vào (tối đa x${g}):</label>
                <div class="flex gap-2 mb-3">
                  <input type="number" id="producer_qty_input_${n}" class="bg-gray-900 border border-gray-700 text-white rounded px-3 py-1.5 text-sm w-full font-bold font-mono focus:border-yellow-400 focus:outline-none" min="1" max="${g}" value="${g}">
                </div>
                <div class="grid grid-cols-3 gap-1.5">
                  ${l==="harvest_cow_milk"?`
                    <button class="bg-gray-900 border border-gray-800 text-gray-400 hover:text-white px-2 py-1 rounded text-[10px] font-bold uppercase transition" onclick="setProducerQtyInputValue(${n}, 4)">x4</button>
                    <button class="bg-gray-900 border border-gray-800 text-gray-400 hover:text-white px-2 py-1 rounded text-[10px] font-bold uppercase transition" onclick="setProducerQtyInputValue(${n}, 16)">x16</button>
                    <button class="bg-gray-900 border border-gray-800 text-gray-400 hover:text-white px-2 py-1 rounded text-[10px] font-bold uppercase transition" onclick="setProducerQtyInputValue(${n}, ${g})">Tối đa</button>
                  `:`
                    <button class="bg-gray-900 border border-gray-800 text-gray-400 hover:text-white px-2 py-1 rounded text-[10px] font-bold uppercase transition" onclick="setProducerQtyInputValue(${n}, 1)">x1</button>
                    <button class="bg-gray-900 border border-gray-800 text-gray-400 hover:text-white px-2 py-1 rounded text-[10px] font-bold uppercase transition" onclick="setProducerQtyInputValue(${n}, 10)">x10</button>
                    <button class="bg-gray-900 border border-gray-800 text-gray-400 hover:text-white px-2 py-1 rounded text-[10px] font-bold uppercase transition" onclick="setProducerQtyInputValue(${n}, ${g})">Tối đa</button>
                  `}
                </div>
              </div>
              
              <div class="text-[10px] bg-gray-900/60 p-2 rounded-lg text-gray-400 leading-relaxed border border-gray-850">
                Chế biến ra: <span class="text-green-400 font-bold">${p} ${c}</span>.<br>
                ${l==="harvest_cow_milk"?'Tỷ lệ: <span class="text-yellow-400 font-bold">4 Sữa bò ➔ 1 Phô mai</span>.<br>':""}
                Thời gian yêu cầu: <span class="text-blue-400 font-bold font-mono">5 phút / cái</span>.
              </div>
            </div>
            
            <div class="flex gap-2 mt-4">
              <button class="btn btn-gray flex-1 py-2 text-xs font-bold" onclick="selectProducerInput(${n}, null)">
                Trở lại
              </button>
              <button class="btn btn-green flex-[2] py-2 text-xs font-bold" onclick="confirmLoadProducerSlot(${n}, '${l}')">
                Nạp nguyên liệu
              </button>
            </div>
          </div>
        `}}else if(s.inputKey){const o=GAME.getProducerOutputInfo(s.inputKey),a=o&&o.inputRatio||1;let l=s.inputKey,d="📦";if(s.inputKey==="harvest_cow_milk")l="Sữa bò",d="🥛";else{const f=PLANTS_DATA[s.inputKey.replace("harvest_","")];f&&(l=f.name,d=f.emoji)}const u=o?o.time:3e5,c=Math.min(100,Math.floor(s.timeSpent/u*100));let p="";if(s.qtyLeft>0){const f=u-s.timeSpent,_=Math.floor(f/6e4),m=Math.floor(f%6e4/1e3);p=`<span class="text-xs text-yellow-500 font-bold font-mono">⏱️ ${`${_.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}`}</span>`}else p='<span class="text-xs text-green-400 font-bold">✓ Đã hoàn tất tất cả</span>';t+=`
        <div class="flex-1 flex flex-col justify-between">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-2 text-center text-xs">
              <div class="bg-gray-900 bg-opacity-35 p-2.5 rounded-xl border border-gray-800 flex flex-col justify-between">
                <span class="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Nguyên liệu</span>
                <span class="text-2xl my-1">${d}</span>
                <span class="font-bold text-gray-200 block truncate">${l}</span>
                <span class="text-yellow-400 font-mono font-bold text-[11px] block mt-1">Còn: x${s.qtyLeft}</span>
              </div>
              
              <div class="bg-gray-900 bg-opacity-35 p-2.5 rounded-xl border border-gray-800 flex flex-col justify-between">
                <span class="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Thành phẩm</span>
                <span class="text-2xl my-1">${o?o.emoji:"📦"}</span>
                <span class="font-bold text-gray-200 block truncate">${o?o.name:"Chưa rõ"}</span>
                <span class="text-green-400 font-mono font-bold text-[11px] block mt-1">Sẵn sàng: x${s.qtyReady}</span>
              </div>
            </div>
            
            <div class="space-y-1">
              <div class="flex justify-between items-center text-xs text-gray-400">
                <span>Chế biến cây hiện tại:</span>
                ${p}
              </div>
              <div class="w-full bg-gray-900 rounded-full h-3.5 border border-gray-800 overflow-hidden relative shadow-inner">
                <div class="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-1000" style="width: ${s.qtyLeft>0?c:100}%"></div>
                <div class="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white select-none">
                  ${s.qtyLeft>0?c+"%":"100%"}
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex flex-col gap-2 mt-5">
            ${s.qtyLeft+s.qtyReady*a<64?`
              <button class="btn btn-blue py-2 text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                      onclick="openProducerAddMore(${n}, '${s.inputKey}')">
                ➕ Nạp thêm vật liệu cùng loại
              </button>
            `:""}
            <button class="btn ${s.qtyReady>0?"btn-green shadow-[0_0_10px_rgba(76,175,80,0.3)] animate-pulse":"btn-gray opacity-50 cursor-not-allowed"} py-2 text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                    ${s.qtyReady>0?"":"disabled"}
                    onclick="handleCollectProducer(${n})">
              📥 Thu hoạch thành phẩm (x${s.qtyReady})
            </button>
          </div>
        </div>
      `}else t+=`
        <div class="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div class="text-5xl mb-4 text-gray-600">📭</div>
          <div class="text-sm font-bold text-gray-400 mb-1">Thiết bị đang nhàn rỗi</div>
          <div class="text-xs text-gray-500 mb-4 max-w-[200px]">Hãy thêm nguyên liệu để chế biến thành phẩm hữu ích!</div>
          <button class="btn btn-yellow px-6 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                  onclick="openProducerSelect(${n})">
            ➕ Thêm nguyên liệu
          </button>
        </div>
      `;t+=`
      </div>
    `}t+=`
    </div>
  `,e.innerHTML=t}window.renderProducerContent=Y;window.G||Object.defineProperty(window,"G",{get(){return window.GAME?window.GAME.G:null},set(e){window.GAME&&(window.GAME.G=e)}});window.selectedPlot=null;window.currentZone=0;window.plantingPlotKey=null;window.selectedPlantId=null;window.selectedFert=0;window.fertilizePlotKey=null;window.selectedFertilizerType=0;window.shopTab="buy";window.autoRefreshTimer=null;window.selectedShopItemId=null;window.currentModalScreen="details";window.slotSelectingItem=[!1,!1,!1];window.slotSelectedInput=[null,null,null];window.currentFarmTab="crops";document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("seasonSelect");e&&G&&(e.value=G.season,e.addEventListener("change",t=>{GAME.changeSeason(t.target.value),x(),h(`Đổi sang ${SEASON_LABELS[G.season]}`,"info")})),x(),G&&G.needsStartSeason&&$e(),ve()});function ve(){window.autoRefreshTimer&&clearInterval(window.autoRefreshTimer),window.autoRefreshTimer=setInterval(()=>{const e=GAME.updateSeasonClock(),t=GAME.lazyUpdateAll();J(),Pt(),zt(),dt(),W(),t&&h("🔄 Trạng thái nông trại đã cập nhật!","info"),e&&h(`🍂 Chuyển sang ${SEASON_LABELS[G.season]}`,"success");const n=document.getElementById("refreshStatus");n&&(n.textContent=`🔄 Sync: ${new Date().toLocaleTimeString("vi")}`)},1e4)}window.startAutoRefresh=ve;function x(){!window.GAME||!G||(GAME.updateSeasonClock(),GAME.lazyUpdateAll(),Bt(),dt(),W(),J(),Pt(),zt())}window.render=x;function Bt(){const e=[{id:"crops",label:"🏡 Trồng trọt"},{id:"poultry",label:"🐔 Gia cầm"},{id:"livestock",label:"🐮 Gia súc"}],t=document.getElementById("farmSubTabs");t&&(t.innerHTML=e.map(n=>`
    <div class="zone-tab ${n.id===window.currentFarmTab?"active":""}" onclick="switchFarmTab('${n.id}')">
      ${n.label}
    </div>
  `).join(""))}window.renderFarmSubTabs=Bt;function Hn(e){window.currentFarmTab=e,window.selectedPlot=null,Bt(),dt()}window.switchFarmTab=Hn;function dt(){const e=document.getElementById("farmGridContainer");e&&(window.currentFarmTab==="crops"?e.innerHTML=te():window.currentFarmTab==="poultry"?e.innerHTML=jt("poultry"):window.currentFarmTab==="livestock"&&(e.innerHTML=jt("livestock")))}window.renderFarmGridArea=dt;function On(e){window.selectedPlot=e,window.currentModalScreen="details";const t=document.getElementById("plotModal");t&&(t.style.display="flex"),it()}window.selectPlotCell=On;function tt(){window.selectedPlot=null,window.currentModalScreen="details";const e=document.getElementById("plotModal");e&&(e.style.display="none"),dt()}window.closePlotModal=tt;function W(){ee(),window.selectedPlot&&window.currentModalScreen==="details"&&it()}window.renderSidebar=W;function F(e){if(e<=0)return"0ph";const t=Math.floor(e/6e4),n=Math.floor(t/1440),s=Math.floor(t%1440/60),o=t%60;if(n>0){let a=[`${n}d`];return s>0&&a.push(`${s}h`),o>0&&a.push(`${o}m`),a.join(" ")}else return s>0?o>0?`${s}h ${o}m`:`${s}h`:`${o}m`}window.formatTime=F;function h(e,t="info"){const n=document.getElementById("toast");if(!n)return;const s=document.createElement("div");s.className=`toast-item ${t}`,s.textContent=e,n.appendChild(s),setTimeout(()=>s.remove(),3500)}window.toast=h;function J(){if(!G)return;const e=document.getElementById("goldDisplay");e&&(e.textContent=Math.floor(G.gold));const t=document.getElementById("energyDisplay");t&&(t.textContent=Math.floor(G.energy))}window.updateGold=J;function Pt(){if(!G)return;const e=document.getElementById("seasonSelect");e&&(e.value=G.season)}window.updateSeasonDisplay=Pt;function zt(){if(!G)return;const e=document.getElementById("dayDisplay");e&&(e.textContent=`${GAME.getDayOfSeason(G.game_day)}/30`,Ut())}window.updateDayDisplay=zt;function Ut(){if(!G)return;const e=document.getElementById("gameClockDisplay");if(e){const t=Date.now()-G.lastDayTick,n=Math.floor(t/36e5)%24,s=Math.floor(t%36e5/6e4);e.textContent=`${n.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`}}window.updateClockDisplay=Ut;setInterval(Ut,1e3);document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll(".modal-overlay").forEach(e=>{e.addEventListener("click",t=>{t.target===e&&(e.style.display="none")})})});function Se(e){document.querySelectorAll(".app-view").forEach(s=>s.classList.add("hidden"));const t=document.getElementById(e);t&&t.classList.remove("hidden"),document.querySelectorAll(".nav-btn").forEach(s=>{s.classList.remove("text-yellow-400"),s.classList.add("text-gray-400")});const n=document.getElementById("nav-"+e);n&&(n.classList.add("text-yellow-400"),n.classList.remove("text-gray-400")),typeof closeShopItemModal=="function"&&closeShopItemModal(),e==="viewShop"?(window.stopTasksTimer&&window.stopTasksTimer(),window.stopProducerTimer&&window.stopProducerTimer(),typeof window.shopTab>"u"||!window.shopTab?window.showShopTab("buy"):window.renderShopContent()):e==="viewInventory"?(window.stopTasksTimer&&window.stopTasksTimer(),window.stopProducerTimer&&window.stopProducerTimer(),window.renderInventoryContent()):e==="viewTasks"?(window.stopProducerTimer&&window.stopProducerTimer(),window.renderTasksContent(),window.startTasksTimer&&window.startTasksTimer()):e==="viewProducer"?(window.stopTasksTimer&&window.stopTasksTimer(),window.renderProducerContent(),window.startProducerTimer&&window.startProducerTimer()):(window.stopTasksTimer&&window.stopTasksTimer(),window.stopProducerTimer&&window.stopProducerTimer())}window.switchView=Se;function Kn(){confirm("Bạn có muốn bắt đầu lại hoặc nạp file save khác? Dữ liệu hiện tại sẽ bị xóa sạch.")&&(GAME.resetGame(),x(),h("🔄 Hãy chọn màn mới hoặc nạp file save","info"))}window.confirmResetGame=Kn;function $e(){const e=document.getElementById("startSeasonModal");e&&(e.style.display="flex",Te())}window.openStartSeasonModal=$e;function ke(){const e=document.getElementById("startSeasonModal");e&&(e.style.display="none")}window.closeStartSeasonModal=ke;function Te(){const e=document.getElementById("startSeasonContent");e&&(e.innerHTML=`
    <div class="mb-3 text-sm text-gray-400">Tùy chọn bắt đầu nông trại:</div>
    <div class="mb-2 font-bold text-yellow-400">1. Chơi màn mới (Chọn mùa)</div>
    <div class="grid grid-cols-2 gap-2 mb-4">
      ${SEASONS.map(t=>{const n=SEASON_LABELS[t];return`<button class="btn btn-yellow w-full text-sm" onclick="setStartSeason('${t}')">${n}</button>`}).join("")}
    </div>
    
    <div class="mb-2 font-bold text-yellow-400">2. Hoặc nạp file save (Import Data)</div>
    <input type="file" id="importSaveFile" accept=".json" class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-gray-900 hover:file:bg-yellow-500 mb-4" onchange="handleImportSave(event)">
    
    <div class="text-xs text-gray-500">Mỗi mùa kéo dài 30 ngày. Lịch game tự động chạy theo thời gian thực.</div>
  `)}window.renderStartSeasonContent=Te;function Vn(e){GAME.setStartSeason(e)}window.setStartSeason=Vn;function Qn(){const e=localStorage.getItem("mangak_farm_v1");if(!e){h("Chưa có dữ liệu để xuất!","error");return}const t=new Blob([e],{type:"application/json"}),n=URL.createObjectURL(t),s=document.createElement("a");s.href=n,s.download=`mangak_farm_save_${Date.now()}.json`,document.body.appendChild(s),s.click(),document.body.removeChild(s),URL.revokeObjectURL(n),h("💾 Đã xuất file save thành công!","success")}window.exportSave=Qn;function Zn(e){const t=e.target.files[0];if(!t)return;const n=new FileReader;n.onload=function(s){try{const o=s.target.result,a=JSON.parse(o);if(typeof a!="object"||!a.plots)throw new Error("Invalid save format");localStorage.setItem("mangak_farm_v1",o);const l=GAME.loadState();GAME.G=l,GAME.syncUnlockedPlots(),x(),ke(),h("✅ Đã nạp file save thành công!","success")}catch(o){h("❌ File save không hợp lệ!","error"),console.error(o)}},n.readAsText(t)}window.handleImportSave=Zn;console.log("🌾 Mangak Farm UI Modules initialized successfully.");
