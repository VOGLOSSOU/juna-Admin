const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const ts=require('typescript'),React=require('react');
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}};
const flush=async()=>{for(let i=0;i<20;i++)await Promise.resolve()};
const text=node=>node==null||typeof node==='boolean'?'':typeof node!=='object'?String(node):React.Children.toArray(node.props?.children).map(text).join('');
const walk=node=>!node||typeof node!=='object'?[]:[node,...React.Children.toArray(node.props?.children).flatMap(walk)];
const row=(name='Menu')=>({orderId:'order',orderNumber:'TEST',subscriptionName:name,providerName:name,providerAmount:1000,clientName:'Client',providerConfigured:true,activatedAt:null,payout:{status:'MANUAL',mode:null,label:'Aucun suivi',canConfirmManual:true,canTrigger:true}});
function setup(t){
 const previous=global.window;global.window={confirm:()=>true};
 let admin={id:'A'},cursor=0;const slots=[],effects=[],cleanups=[],calls=[];
 const response=items=>({data:{data:{items,total:items.length,totalPages:1}}});
 const api={get:async(url,config)=>{calls.push({method:'GET',url,config});return response([row()])},post:async(url,data)=>{calls.push({method:'POST',url,data});return{data:{}}}};
 function useState(initial){const i=cursor++;if(!(i in slots))slots[i]=initial;return[slots[i],value=>{slots[i]=typeof value==='function'?value(slots[i]):value}]}
 const react={...React,useState,useRef:initial=>{const[value]=useState({current:initial});return value},
 useCallback:(fn,deps)=>{const i=cursor++;if(!slots[i]||deps.some((v,j)=>v!==slots[i].deps[j]))slots[i]={fn,deps};return slots[i].fn},
 useEffect:(fn,deps)=>{const i=cursor++;if(!slots[i]||deps.some((v,j)=>v!==slots[i][j])){slots[i]=deps;effects.push(()=>{cleanups[i]?.();cleanups[i]=fn()})}}};
 const filename=path.resolve('app/(admin)/payouts/page.tsx');
 const m=new Module(filename,module);m.filename=filename;m.paths=Module._nodeModulePaths(process.cwd());const original=m.require.bind(m);
 const mocks={react,'@/lib/api':{__esModule:true,default:api},'@/contexts/auth-context':{useAuth:()=>({admin})},'lucide-react':new Proxy({},{get:()=>()=>null})};
 m.require=name=>name in mocks?mocks[name]:original(name);
 m._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,filename);
 const render=()=>{cursor=0;const tree=m.exports.default();while(effects.length)effects.shift()();return tree};
 const button=label=>{const b=walk(render()).find(n=>n.type==='button'&&text(n).trim()===label);assert.ok(b,`button ${label}`);return b};
 const settle=async()=>{for(let i=0;i<3;i++){render();await flush()}};
 const dispose=()=>cleanups.forEach(fn=>fn?.());
 t.after(()=>{dispose();if(previous===undefined)delete global.window;else global.window=previous});
 return{api,calls,response,render,button,settle,dispose,changeAdmin:id=>{admin={id}}};
}
for(const amount of ['0','-1','','1.5','Infinity'])test(`manual amount ${JSON.stringify(amount)} never submits`,async t=>{
 const s=setup(t);await s.settle();s.button('Manuel').props.onClick();
 walk(s.render()).find(n=>n.type==='input').props.onChange({target:{value:amount}});
 await s.button('Confirmer le paiement manuel').props.onClick();
 assert.equal(s.calls.filter(c=>c.method==='POST').length,0);
 assert.match(text(s.render()),/montant entier strictement positif/);
});
test('valid manual amount is explicit and double submission is blocked immediately',async t=>{
 const s=setup(t);await s.settle();s.button('Manuel').props.onClick();const gate=deferred();
 s.api.post=async(url,data)=>{s.calls.push({method:'POST',url,data});return gate.promise};
 const click=s.button('Confirmer le paiement manuel').props.onClick;
 const first=click();await click();
 assert.deepEqual(s.calls.filter(c=>c.method==='POST').map(c=>c.data),[{amount:1000}]);
 gate.resolve({data:{}});await first;
});
test('trigger double click sends a single request',async t=>{
 const s=setup(t);await s.settle();const gate=deferred();
 s.api.post=async(url,data)=>{s.calls.push({method:'POST',url,data});return gate.promise};
 const click=s.button('Déclencher').props.onClick;const first=click();await click();
 assert.equal(s.calls.filter(c=>c.method==='POST').length,1);gate.resolve({data:{}});await first;
});
test('late filter response cannot replace the current filter result',async t=>{
 const s=setup(t);const old=deferred();s.api.get=()=>old.promise;s.render();
 s.api.get=async()=>s.response([row('Current filter')]);s.button('Tous les paiements').props.onClick();await s.settle();
 old.resolve(s.response([row('Old filter')]));await s.settle();
 assert.match(text(s.render()),/Current filter/);assert.doesNotMatch(text(s.render()),/Old filter/);
});
test('old account data cannot replace the current administrator response',async t=>{
 const s=setup(t);const old=deferred();s.api.get=()=>old.promise;s.render();
 s.changeAdmin('B');s.api.get=async()=>s.response([row('Account B')]);await s.settle();
 old.resolve(s.response([row('Account A')]));await s.settle();
 assert.match(text(s.render()),/Account B/);assert.doesNotMatch(text(s.render()),/Account A/);
});
test('failed loading displays retry instead of an empty ledger',async t=>{
 const s=setup(t);s.api.get=async()=>{throw new Error('offline')};await s.settle();
 assert.match(text(s.render()),/Impossible de charger/);assert.ok(s.button('Réessayer'));
});
