// HR Cloud Manager - API Client
const API_BASE = 'http://localhost:8000/api'; // Cambiar a la URL del backend

const API = (() => {
  function getHeaders(multipart=false){
    const h={'Accept':'application/json'};
    const t=localStorage.getItem('hr_token');
    if(t) h['Authorization']='Bearer '+t;
    if(!multipart) h['Content-Type']='application/json';
    return h;
  }

  async function handle(res){
    const data=await res.json().catch(()=>({}));
    if(res.status===401){Auth.clearSession();location.href='login.html';throw new Error('Sesión expirada');}
    if(!res.ok){const e=new Error(data.message||'Error '+res.status);e.status=res.status;e.errors=data.errors||null;throw e;}
    return data;
  }

  return {
    get:async(ep,params={})=>{
      const url=new URL(API_BASE+ep);
      Object.entries(params).forEach(([k,v])=>{if(v!==undefined&&v!==null&&v!=='')url.searchParams.set(k,v);});
      return handle(await fetch(url.toString(),{headers:getHeaders()}));
    },
    post:async(ep,body={})=>handle(await fetch(API_BASE+ep,{method:'POST',headers:getHeaders(),body:JSON.stringify(body)})),
    put:async(ep,body={})=>handle(await fetch(API_BASE+ep,{method:'PUT',headers:getHeaders(),body:JSON.stringify(body)})),
    delete:async(ep)=>handle(await fetch(API_BASE+ep,{method:'DELETE',headers:getHeaders()})),
    upload:async(ep,fd)=>handle(await fetch(API_BASE+ep,{method:'POST',headers:getHeaders(true),body:fd})),
  };
})();

// Toast notifications
const Toast = (() => {
  let cont;
  function getCont(){if(!cont){cont=document.createElement('div');cont.className='toast-cont';document.body.appendChild(cont);}return cont;}
  function show(msg,type='info',ms=3500){
    const icons={success:'✅',error:'❌',warning:'⚠️',info:'ℹ️'};
    const t=document.createElement('div');
    t.className='toast toast-'+type;
    t.innerHTML='<span>'+icons[type]+'</span><span>'+msg+'</span>';
    getCont().appendChild(t);
    setTimeout(()=>{t.style.opacity='0';t.style.transform='translateX(110px)';t.style.transition='.3s';setTimeout(()=>t.remove(),300);},ms);
  }
  return{success:m=>show(m,'success'),error:m=>show(m,'error',5000),warning:m=>show(m,'warning'),info:m=>show(m,'info')};
})();

// Format utilities
const Fmt = {
  date(d){if(!d)return'—';return new Date(d).toLocaleDateString('es-BO',{day:'2-digit',month:'2-digit',year:'numeric'});},
  money(n){return'Bs. '+parseFloat(n||0).toLocaleString('es-BO',{minimumFractionDigits:2});},
  badge(st){
    const m={
      active:['success','✓ Activo'],inactive:['gray','⏸ Inactivo'],suspended:['danger','⚠ Suspendido'],
      present:['success','✓ Presente'],absent:['danger','✗ Ausente'],late:['warning','⏰ Tardanza'],
      half_day:['info','½ Medio día'],holiday:['info','🎉 Feriado'],
      pending:['warning','⏳ Pendiente'],approved:['success','✓ Aprobado'],rejected:['danger','✗ Rechazado'],
    };
    const[cls,lbl]=m[st]||['gray',st];
    return`<span class="badge badge-${cls}">${lbl}</span>`;
  }
};
