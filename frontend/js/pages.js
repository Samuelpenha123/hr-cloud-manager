// ============================================================
// HR Cloud Manager - All Page Modules
// ============================================================

const Pages = {

// ── DASHBOARD ──────────────────────────────────────────────
async dashboard(){
  const c=document.getElementById('pageContent');
  c.innerHTML='<div style="text-align:center;padding:60px"><div class="spinner"></div></div>';
  try{
    const{data:d}=await API.get('/dashboard');

    // Dashboard del empleado
    if(d.role==='employee'){
      if(d.no_employee){
        c.innerHTML=`<div class="alert alert-error">⚠️ Tu cuenta no tiene un empleado vinculado. Contacta al administrador.</div>`;
        return;
      }
      const emp=d.employee||{};
      c.innerHTML=`
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon si-blue">👤</div><div><div class="sv">${emp.first_name||''} ${emp.last_name||''}</div><div class="sl">Mi Nombre</div></div></div>
        <div class="stat-card"><div class="stat-icon si-green">📅</div><div><div class="sv">${d.attendance_today?.my_status||'—'}</div><div class="sl">Asistencia Hoy</div></div></div>
        <div class="stat-card"><div class="stat-icon si-amber">🏖️</div><div><div class="sv">${d.vacations?.approved||0}</div><div class="sl">Vacaciones Aprobadas</div></div></div>
        <div class="stat-card"><div class="stat-icon si-cyan">⏳</div><div><div class="sv">${d.vacations?.pending||0}</div><div class="sl">Solicitudes Pendientes</div></div></div>
      </div>
      <div class="grid-2" style="gap:20px">
        <div class="card">
          <div class="card-header"><span class="card-title">📋 Mi Asistencia Reciente</span><button class="btn btn-ghost btn-sm" onclick="nav('my_attendance')">Ver todo</button></div>
          ${(d.recent_attendance||[]).length?`<div>${d.recent_attendance.map(a=>`
            <div style="display:flex;align-items:center;gap:12px;padding:11px 16px;border-bottom:1px solid var(--gray-200)">
              <span style="font-size:20px">📅</span>
              <div style="flex:1"><div style="font-weight:600;font-size:13px">${Fmt.date(a.date)}</div>
              <div style="font-size:12px;color:var(--gray-500)">${a.check_in?a.check_in.slice(11,16):'—'} → ${a.check_out?a.check_out.slice(11,16):'—'}</div></div>
              ${Fmt.badge(a.status)}
            </div>`).join('')}</div>`
          :'<div class="empty-state"><div class="empty-icon">📋</div><p>Sin registros</p></div>'}
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">🏖️ Mis Próximas Vacaciones</span><button class="btn btn-ghost btn-sm" onclick="nav('my_vacations')">Ver todo</button></div>
          ${(d.upcoming_vacations||[]).length?`<div>${d.upcoming_vacations.map(v=>`
            <div style="display:flex;align-items:center;gap:12px;padding:11px 16px;border-bottom:1px solid var(--gray-200)">
              <span style="font-size:22px">🏖️</span>
              <div style="flex:1"><div style="font-size:12px;color:var(--gray-500)">${Fmt.date(v.start_date)} → ${Fmt.date(v.end_date)} · ${v.days_requested} días</div></div>
              ${Fmt.badge(v.status)}
            </div>`).join('')}</div>`
          :'<div class="empty-state"><div class="empty-icon">🏖️</div><p>Sin vacaciones próximas</p></div>'}
        </div>
      </div>
      <div class="card" style="margin-top:20px">
        <div class="card-header"><span class="card-title">⚡ Acciones Rápidas</span></div>
        <div class="card-body" style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="nav('my_attendance')">📅 Marcar Asistencia</button>
          <button class="btn btn-outline" onclick="nav('my_vacations');setTimeout(()=>Pages._myVacModal(),300)">🏖️ Solicitar Vacaciones</button>
          <button class="btn btn-ghost" onclick="nav('my_documents')">📁 Mis Documentos</button>
        </div>
      </div>`;
      return;
    }

    // Dashboard admin / manager / hr
    c.innerHTML=`
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon si-blue">👥</div><div><div class="sv">${d.employees?.total||0}</div><div class="sl">Total Empleados</div></div></div>
      <div class="stat-card"><div class="stat-icon si-green">✅</div><div><div class="sv">${d.attendance_today?.present||0}</div><div class="sl">Presentes Hoy</div></div></div>
      <div class="stat-card"><div class="stat-icon si-amber">🏖️</div><div><div class="sv">${d.vacations?.on_vacation||0}</div><div class="sl">De Vacaciones</div></div></div>
      <div class="stat-card"><div class="stat-icon si-red">❌</div><div><div class="sv">${d.attendance_today?.absent||0}</div><div class="sl">Ausentes Hoy</div></div></div>
      <div class="stat-card"><div class="stat-icon si-cyan">⏳</div><div><div class="sv">${d.vacations?.pending||0}</div><div class="sl">Vacaciones Pendientes</div></div></div>
      <div class="stat-card"><div class="stat-icon si-purple">📄</div><div><div class="sv">${d.documents?.expiring_soon||0}</div><div class="sl">Docs por Vencer</div></div></div>
    </div>
    <div class="grid-2" style="gap:20px">
      <div class="card">
        <div class="card-header"><span class="card-title">📋 Actividad Reciente</span><button class="btn btn-ghost btn-sm" onclick="nav('attendance')">Ver todo</button></div>
        ${(d.recent_activity||[]).length?`<div>${(d.recent_activity||[]).map(a=>`
          <div style="display:flex;align-items:center;gap:12px;padding:11px 16px;border-bottom:1px solid var(--gray-200)">
            <div class="u-avatar" style="width:32px;height:32px;font-size:12px">${(a.employee?.first_name||'?').charAt(0)}</div>
            <div style="flex:1"><div style="font-weight:600;font-size:13px">${a.employee?.first_name||''} ${a.employee?.last_name||''}</div>
            <div style="font-size:12px;color:var(--gray-500)">${Fmt.date(a.date)} · ${a.check_in?a.check_in.slice(11,16):'—'}</div></div>
            ${Fmt.badge(a.status)}
          </div>`).join('')}</div>`:
        '<div class="empty-state"><div class="empty-icon">📋</div><p>Sin actividad reciente</p></div>'}
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">🗓️ Próximas Vacaciones</span><button class="btn btn-ghost btn-sm" onclick="nav('vacations')">Ver todo</button></div>
        ${(d.upcoming_vacations||[]).length?`<div>${(d.upcoming_vacations||[]).map(v=>`
          <div style="display:flex;align-items:center;gap:12px;padding:11px 16px;border-bottom:1px solid var(--gray-200)">
            <span style="font-size:22px">🏖️</span>
            <div style="flex:1"><div style="font-weight:600;font-size:13px">${v.employee?.first_name||''} ${v.employee?.last_name||''}</div>
            <div style="font-size:12px;color:var(--gray-500)">${Fmt.date(v.start_date)} → ${Fmt.date(v.end_date)} · ${v.days_requested} días</div></div>
            ${Fmt.badge(v.status)}
          </div>`).join('')}</div>`:
        '<div class="empty-state"><div class="empty-icon">🏖️</div><p>Sin vacaciones próximas</p></div>'}
      </div>
    </div>
    <div class="card" style="margin-top:20px">
      <div class="card-header"><span class="card-title">⚡ Acciones Rápidas</span></div>
      <div class="card-body" style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="nav('employees');setTimeout(()=>Pages._empModal(),300)">➕ Nuevo Empleado</button>
        <button class="btn btn-outline" onclick="nav('attendance');setTimeout(()=>Pages._attModal(),300)">📅 Registrar Asistencia</button>
        <button class="btn btn-outline" onclick="nav('vacations');setTimeout(()=>Pages._vacModal(),300)">🏖️ Nueva Solicitud</button>
        <button class="btn btn-ghost" onclick="nav('reports')">📊 Ver Reportes</button>
      </div>
    </div>`;
  }catch(e){c.innerHTML=`<div class="alert alert-error">❌ Error: ${e.message}</div>`;}
},

// ── EMPLOYEES ──────────────────────────────────────────────
_empPage:1,
async employees(){
  document.getElementById('pageContent').innerHTML=`
  <div class="card">
    <div class="card-header"><span class="card-title">👥 Lista de Empleados</span><button class="btn btn-primary btn-sm" onclick="Pages._empModal()">➕ Nuevo Empleado</button></div>
    <div class="card-body" style="border-bottom:1px solid var(--gray-200)">
      <div class="tbl-ctrl">
        <div class="search-box flex-1" style="flex:1"><span class="search-icon">🔍</span><input type="text" class="form-control" id="empSearch" placeholder="Buscar por nombre, correo o documento..."></div>
        <select class="sel-flt" id="empStatus"><option value="all">Todos los estados</option><option value="active">Activos</option><option value="inactive">Inactivos</option><option value="suspended">Suspendidos</option></select>
        <select class="sel-flt" id="empDept"><option value="">Todos los departamentos</option><option>Tecnología</option><option>Finanzas</option><option>Ventas</option><option>RRHH</option><option>Operaciones</option><option>Marketing</option><option>Legal</option><option>Gerencia</option></select>
      </div>
    </div>
    <div id="empTable"><div style="text-align:center;padding:40px"><div class="spinner"></div></div></div>
  </div>
  <div class="modal-ov" id="empModal">
    <div class="modal" style="max-width:660px">
      <div class="modal-header"><h3 class="modal-title" id="empModalTitle">Nuevo Empleado</h3><button class="modal-close" onclick="Pages._empClose()">✕</button></div>
      <div class="modal-body">
        <div id="empAlert" class="alert alert-error" style="display:none"></div>
        <div class="grid-2">
          <div class="form-group"><label>Nombre *</label><input type="text" class="form-control" id="ef_first_name" placeholder="Nombre"><span class="field-error" id="ef_first_nameE"></span></div>
          <div class="form-group"><label>Apellido *</label><input type="text" class="form-control" id="ef_last_name" placeholder="Apellido"><span class="field-error" id="ef_last_nameE"></span></div>
          <div class="form-group"><label>Correo</label><input type="email" class="form-control" id="ef_email" placeholder="correo@empresa.com"></div>
          <div class="form-group"><label>Teléfono</label><input type="text" class="form-control" id="ef_phone" placeholder="+591 7XXXXXXX"></div>
          <div class="form-group"><label>Tipo Documento *</label><select class="form-control" id="ef_document_type"><option value="CI">CI</option><option value="RUT">RUT</option><option value="DNI">DNI</option><option value="PASAPORTE">Pasaporte</option></select></div>
          <div class="form-group"><label>N° Documento *</label><input type="text" class="form-control" id="ef_document_number" placeholder="12345678"><span class="field-error" id="ef_document_numberE"></span></div>
          <div class="form-group"><label>Fecha Nacimiento</label><input type="date" class="form-control" id="ef_birth_date"></div>
          <div class="form-group"><label>Fecha Contratación *</label><input type="date" class="form-control" id="ef_hire_date"><span class="field-error" id="ef_hire_dateE"></span></div>
          <div class="form-group"><label>Departamento *</label><select class="form-control" id="ef_department"><option value="">Seleccionar...</option><option>Tecnología</option><option>Finanzas</option><option>Ventas</option><option>RRHH</option><option>Operaciones</option><option>Marketing</option><option>Legal</option><option>Gerencia</option></select><span class="field-error" id="ef_departmentE"></span></div>
          <div class="form-group"><label>Cargo *</label><input type="text" class="form-control" id="ef_position" placeholder="Desarrollador, Contador..."><span class="field-error" id="ef_positionE"></span></div>
          <div class="form-group"><label>Salario (Bs.) *</label><input type="number" class="form-control" id="ef_salary" placeholder="5000" min="0"><span class="field-error" id="ef_salaryE"></span></div>
          <div class="form-group"><label>Estado *</label><select class="form-control" id="ef_status"><option value="active">Activo</option><option value="inactive">Inactivo</option><option value="suspended">Suspendido</option></select></div>
        </div>
        <div class="form-group"><label>Dirección</label><input type="text" class="form-control" id="ef_address" placeholder="Calle, Ciudad"></div>
        <div class="grid-2">
          <div class="form-group"><label>Contacto Emergencia</label><input type="text" class="form-control" id="ef_emergency_contact" placeholder="Nombre"></div>
          <div class="form-group"><label>Tel. Emergencia</label><input type="text" class="form-control" id="ef_emergency_phone" placeholder="+591 7XXXXXXX"></div>
        </div>
        <div id="ef_accessSection" style="margin-top:16px;border-top:2px solid var(--gray-200);padding-top:16px">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:600;margin-bottom:12px">
            <input type="checkbox" id="ef_giveAccess" onchange="Pages._empToggleAccess()">
            🔑 Dar acceso al sistema
          </label>
          <div id="ef_accessFields" style="display:none">
            <p style="font-size:12px;color:var(--gray-500);margin-bottom:12px">El empleado podrá iniciar sesión y ver su asistencia, vacaciones y documentos.</p>
            <div class="grid-2">
              <div class="form-group"><label>Correo de acceso *</label><input type="email" class="form-control" id="ef_access_email" placeholder="correo@empresa.com"></div>
              <div class="form-group"><label>Contraseña *</label><input type="password" class="form-control" id="ef_access_password" placeholder="Mínimo 8 caracteres"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn btn-ghost" onclick="Pages._empClose()">Cancelar</button><button class="btn btn-primary" id="empSaveBtn" onclick="Pages._empSave()">💾 Guardar</button></div>
    </div>
  </div>`;

  let timer;
  document.getElementById('empSearch').addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>Pages._empFetch(),400);});
  document.getElementById('empStatus').addEventListener('change',()=>Pages._empFetch());
  document.getElementById('empDept').addEventListener('change',()=>Pages._empFetch());
  Pages._empFetch();
},
_empId:null,

async _empFetch(){
  const s=document.getElementById('empSearch')?.value||'';
  const st=document.getElementById('empStatus')?.value||'';
  const dp=document.getElementById('empDept')?.value||'';
  const isAdmin=(Auth.getUser()?.role==='admin');
  try{
    // Traer empleados y (si es admin) lista de employee_ids que ya tienen usuario
    const promises=[API.get('/employees',{search:s,status:st,department:dp,page:Pages._empPage})];
    if(isAdmin) promises.push(API.get('/users').catch(()=>({data:[]})));
    const[r,usersRes]=await Promise.all(promises);
    const items=r.data.data||[];
    // Set de employee_ids que ya tienen cuenta de usuario
    const withAccess=new Set((usersRes?.data||[]).filter(u=>u.employee_id).map(u=>u.employee_id));
    const el=document.getElementById('empTable');
    if(!items.length){el.innerHTML='<div class="empty-state"><div class="empty-icon">👥</div><h3>Sin empleados</h3><p>Registra tu primer empleado</p><button class="btn btn-primary" onclick="Pages._empModal()">➕ Nuevo Empleado</button></div>';return;}
    el.innerHTML=`<div class="table-wrap"><table><thead><tr><th>Empleado</th><th>Documento</th><th>Departamento / Cargo</th><th>Salario</th><th>Ingreso</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
    ${items.map(e=>`<tr>
      <td><div style="display:flex;align-items:center;gap:9px"><div class="u-avatar" style="width:32px;height:32px;font-size:12px">${e.first_name.charAt(0)}</div><div><div style="font-weight:600">${e.first_name} ${e.last_name}</div><div style="font-size:12px;color:var(--gray-500)">${e.email||'—'}</div></div></div></td>
      <td><small style="color:var(--gray-500)">${e.document_type}</small> ${e.document_number}</td>
      <td><div style="font-weight:500">${e.department}</div><small style="color:var(--gray-500)">${e.position}</small></td>
      <td>${Fmt.money(e.salary)}</td><td>${Fmt.date(e.hire_date)}</td><td>${Fmt.badge(e.status)}</td>
      <td><div style="display:flex;gap:5px">
        <button class="btn btn-ghost btn-sm" onclick="Pages._empEdit(${e.id})">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="Pages._empDel(${e.id},'${e.first_name} ${e.last_name}')">🗑️</button>
        ${isAdmin?(withAccess.has(e.id)
          ?'<span class="badge badge-success" style="align-self:center;white-space:nowrap">🔑 Con acceso</span>'
          :`<button class="btn btn-outline btn-sm" onclick="Pages._empGrantAccess(${e.id},'${e.first_name} ${e.last_name}','${e.email||''}')" title="Dar acceso al sistema">🔑 Dar Acceso</button>`)
        :''}
      </div></td>
    </tr>`).join('')}</tbody></table></div>${Pages._pages(r.data,'Pages._empGoPage')}`;
  }catch(e){document.getElementById('empTable').innerHTML=`<div class="alert alert-error" style="margin:16px">❌ ${e.message}</div>`;}
},
_empGoPage(p){Pages._empPage=p;Pages._empFetch();},

// Modal rápido para dar acceso a un empleado
_empGrantAccess(empId, empName, empEmail){
  // Reusar el modal de usuarios o crear uno inline
  document.getElementById('pageContent').insertAdjacentHTML('beforeend',`
    <div class="modal-ov active" id="grantModal">
      <div class="modal" style="max-width:440px">
        <div class="modal-header">
          <h3 class="modal-title">🔑 Dar Acceso a ${empName}</h3>
          <button class="modal-close" onclick="document.getElementById('grantModal').remove()">✕</button>
        </div>
        <div class="modal-body">
          <div id="grantAlert" class="alert alert-error" style="display:none"></div>
          <p style="color:var(--gray-600);font-size:13px;margin-bottom:16px">
            Se creará una cuenta para que <strong>${empName}</strong> pueda iniciar sesión y ver su asistencia, vacaciones y documentos.
          </p>
          <div class="form-group">
            <label>Correo de acceso *</label>
            <input type="email" class="form-control" id="ga_email" value="${empEmail}" placeholder="correo@empresa.com">
          </div>
          <div class="form-group">
            <label>Contraseña *</label>
            <input type="password" class="form-control" id="ga_password" placeholder="Mínimo 8 caracteres">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="document.getElementById('grantModal').remove()">Cancelar</button>
          <button class="btn btn-primary" id="grantSaveBtn" onclick="Pages._empGrantSave(${empId},'${empName}')">🔑 Crear Acceso</button>
        </div>
      </div>
    </div>`);
},
async _empGrantSave(empId, empName){
  const btn=document.getElementById('grantSaveBtn');
  btn.disabled=true; btn.textContent='Creando...';
  const body={
    name: empName,
    email: document.getElementById('ga_email').value,
    password: document.getElementById('ga_password').value,
    role: 'employee',
    employee_id: empId,
  };
  try{
    await API.post('/users', body);
    document.getElementById('grantModal').remove();
    Toast.success(`✅ Acceso creado para ${empName}`);
    Pages._empFetch(); // refrescar para mostrar el badge "Con acceso"
  }catch(e){
    const a=document.getElementById('grantAlert');
    a.textContent='⚠️ '+(e.errors?Object.values(e.errors).flat().join(' · '):e.message);
    a.style.display='flex';
    btn.disabled=false; btn.textContent='🔑 Crear Acceso';
  }
},

_empModal(data=null){
  Pages._empId=data?.id||null;
  document.getElementById('empModalTitle').textContent=Pages._empId?'Editar Empleado':'Nuevo Empleado';
  document.getElementById('empAlert').style.display='none';
  const flds=['first_name','last_name','email','phone','document_type','document_number','birth_date','hire_date','department','position','salary','status','address','emergency_contact','emergency_phone'];
  flds.forEach(f=>{const el=document.getElementById('ef_'+f);if(el)el.value=data?(data[f]||''):'';});
  if(!data){document.getElementById('ef_document_type').value='CI';document.getElementById('ef_status').value='active';}
  // Sección de acceso: solo visible al crear, no al editar
  const accessSection=document.getElementById('ef_accessSection');
  if(accessSection) accessSection.style.display=Pages._empId?'none':'block';
  const cb=document.getElementById('ef_giveAccess');
  if(cb){cb.checked=false; document.getElementById('ef_accessFields').style.display='none';}
  document.getElementById('ef_access_email')?.value && (document.getElementById('ef_access_email').value='');
  document.getElementById('ef_access_password')?.value && (document.getElementById('ef_access_password').value='');
  document.getElementById('empModal').classList.add('active');
},
_empToggleAccess(){
  const checked=document.getElementById('ef_giveAccess').checked;
  document.getElementById('ef_accessFields').style.display=checked?'block':'none';
  if(checked){
    // Pre-llenar con el correo del empleado si existe
    const empEmail=document.getElementById('ef_email').value;
    if(empEmail) document.getElementById('ef_access_email').value=empEmail;
  }
},
async _empEdit(id){
  try{const r=await API.get('/employees/'+id);Pages._empModal(r.data);}
  catch(e){Toast.error('Error: '+e.message);}
},
_empClose(){document.getElementById('empModal').classList.remove('active');Pages._empId=null;},
async _empSave(){
  const btn=document.getElementById('empSaveBtn');btn.disabled=true;btn.textContent='Guardando...';
  document.getElementById('empAlert').style.display='none';
  const flds=['first_name','last_name','email','phone','document_type','document_number','birth_date','hire_date','department','position','salary','status','address','emergency_contact','emergency_phone'];
  const body={};flds.forEach(f=>{const el=document.getElementById('ef_'+f);if(el)body[f]=el.value;});
  const giveAccess=!Pages._empId&&document.getElementById('ef_giveAccess')?.checked;
  const accessEmail=document.getElementById('ef_access_email')?.value?.trim();
  const accessPassword=document.getElementById('ef_access_password')?.value;
  if(giveAccess){
    if(!accessEmail){const a=document.getElementById('empAlert');a.textContent='⚠️ Debes ingresar un correo de acceso.';a.style.display='flex';btn.disabled=false;btn.innerHTML='💾 Guardar';return;}
    if(!accessPassword||accessPassword.length<8){const a=document.getElementById('empAlert');a.textContent='⚠️ La contraseña debe tener al menos 8 caracteres.';a.style.display='flex';btn.disabled=false;btn.innerHTML='💾 Guardar';return;}
  }
  try{
    if(Pages._empId){
      await API.put('/employees/'+Pages._empId,body);
      Toast.success('Empleado actualizado');
    } else {
      const empRes=await API.post('/employees',body);
      const newEmpId=empRes.data?.id;
      if(giveAccess&&newEmpId){
        await API.post('/users',{
          name:`${body.first_name} ${body.last_name}`,
          email:accessEmail,
          password:accessPassword,
          role:'employee',
          employee_id:newEmpId,
        });
        Toast.success('Empleado registrado y acceso creado');
      } else {
        Toast.success('Empleado registrado');
      }
    }
    Pages._empClose();Pages._empFetch();
  }catch(e){
    if(e.errors){Object.entries(e.errors).forEach(([k,v])=>{const el=document.getElementById('ef_'+k+'E');if(el){el.textContent=v[0];el.classList.add('show');}});}
    else{const a=document.getElementById('empAlert');a.textContent='⚠️ '+e.message;a.style.display='flex';}
  }finally{btn.disabled=false;btn.innerHTML='💾 Guardar';}
},
async _empDel(id,name){
  if(!confirm('¿Eliminar al empleado "'+name+'"?\n\nEsta acción no se puede deshacer.'))return;
  try{await API.delete('/employees/'+id);Toast.success('Empleado eliminado');Pages._empFetch();}
  catch(e){Toast.error(e.message);}
},

// ── ATTENDANCE ─────────────────────────────────────────────
async attendance(){
  const emps=await Pages._getEmps();
  const today=new Date().toISOString().slice(0,10);
  document.getElementById('pageContent').innerHTML=`
  <div class="card">
    <div class="card-header"><span class="card-title">📅 Control de Asistencia</span><button class="btn btn-primary btn-sm" onclick="Pages._attModal()">➕ Registrar</button></div>
    <div class="card-body" style="border-bottom:1px solid var(--gray-200)">
      <div class="tbl-ctrl">
        <input type="date" class="sel-flt" id="attFrom" value="${today}">
        <input type="date" class="sel-flt" id="attTo" value="${today}">
        <select class="sel-flt" id="attStatus"><option value="all">Todos</option><option value="present">Presentes</option><option value="absent">Ausentes</option><option value="late">Tardanzas</option><option value="half_day">Medio Día</option></select>
        <button class="btn btn-primary btn-sm" onclick="Pages._attFetch()">🔍 Filtrar</button>
      </div>
    </div>
    <div id="attTable"><div style="text-align:center;padding:40px"><div class="spinner"></div></div></div>
  </div>
  <div class="modal-ov" id="attModal">
    <div class="modal">
      <div class="modal-header"><h3 class="modal-title">Registrar Asistencia</h3><button class="modal-close" onclick="Pages._attClose()">✕</button></div>
      <div class="modal-body">
        <div id="attAlert" class="alert alert-error" style="display:none"></div>
        <div class="form-group"><label>Empleado *</label><select class="form-control" id="att_emp"><option value="">Seleccionar...</option>${emps.map(e=>`<option value="${e.id}">${e.first_name} ${e.last_name} · ${e.department}</option>`).join('')}</select></div>
        <div class="grid-2">
          <div class="form-group"><label>Fecha *</label><input type="date" class="form-control" id="att_date" value="${today}"></div>
          <div class="form-group"><label>Estado *</label><select class="form-control" id="att_status"><option value="present">Presente</option><option value="absent">Ausente</option><option value="late">Tardanza</option><option value="half_day">Medio Día</option><option value="holiday">Feriado</option></select></div>
          <div class="form-group"><label>Hora Entrada</label><input type="time" class="form-control" id="att_in"></div>
          <div class="form-group"><label>Hora Salida</label><input type="time" class="form-control" id="att_out"></div>
        </div>
        <div class="form-group"><label>Observaciones</label><textarea class="form-control" id="att_notes" rows="2" placeholder="Notas..."></textarea></div>
      </div>
      <div class="modal-footer"><button class="btn btn-ghost" onclick="Pages._attClose()">Cancelar</button><button class="btn btn-primary" onclick="Pages._attSave()">💾 Guardar</button></div>
    </div>
  </div>`;
  Pages._attFetch();
},
_attModal(){document.getElementById('attModal').classList.add('active');},
_attClose(){document.getElementById('attModal').classList.remove('active');},
async _attFetch(){
  const from=document.getElementById('attFrom')?.value||'';
  const to=document.getElementById('attTo')?.value||'';
  const st=document.getElementById('attStatus')?.value||'';
  try{
    const r=await API.get('/attendances',{date_from:from,date_to:to,status:st});
    const items=r.data?.data||[];
    const el=document.getElementById('attTable');
    if(!items.length){el.innerHTML='<div class="empty-state"><div class="empty-icon">📅</div><h3>Sin registros</h3><p>No hay registros para el período seleccionado</p></div>';return;}
    el.innerHTML=`<div class="table-wrap"><table><thead><tr><th>Empleado</th><th>Fecha</th><th>Entrada</th><th>Salida</th><th>Tardanza</th><th>Estado</th><th></th></tr></thead><tbody>
    ${items.map(a=>`<tr><td><strong>${a.employee?.first_name||''} ${a.employee?.last_name||''}</strong><br><small style="color:var(--gray-500)">${a.employee?.department||''}</small></td>
    <td>${Fmt.date(a.date)}</td><td>${a.check_in?a.check_in.slice(11,16):'—'}</td><td>${a.check_out?a.check_out.slice(11,16):'—'}</td>
    <td>${a.late_minutes>0?`<span class="badge badge-warning">${a.late_minutes} min</span>`:'—'}</td>
    <td>${Fmt.badge(a.status)}</td>
    <td><button class="btn btn-danger btn-sm" onclick="Pages._attDel(${a.id})">🗑️</button></td></tr>`).join('')}
    </tbody></table></div>`;
  }catch(e){document.getElementById('attTable').innerHTML=`<div class="alert alert-error" style="margin:16px">❌ ${e.message}</div>`;}
},
async _attSave(){
  try{
    await API.post('/attendances',{employee_id:document.getElementById('att_emp').value,date:document.getElementById('att_date').value,check_in:document.getElementById('att_in').value||null,check_out:document.getElementById('att_out').value||null,status:document.getElementById('att_status').value,notes:document.getElementById('att_notes').value});
    Toast.success('Asistencia registrada');Pages._attClose();Pages._attFetch();
  }catch(e){const a=document.getElementById('attAlert');a.textContent='⚠️ '+e.message;a.style.display='flex';}
},
async _attDel(id){
  if(!confirm('¿Eliminar este registro?'))return;
  try{await API.delete('/attendances/'+id);Toast.success('Eliminado');Pages._attFetch();}
  catch(e){Toast.error(e.message);}
},

// ── VACATIONS ──────────────────────────────────────────────
async vacations(){
  const emps=await Pages._getEmps();
  document.getElementById('pageContent').innerHTML=`
  <div class="card">
    <div class="card-header"><span class="card-title">🏖️ Solicitudes de Vacaciones</span><button class="btn btn-primary btn-sm" onclick="Pages._vacModal()">➕ Nueva Solicitud</button></div>
    <div class="card-body" style="border-bottom:1px solid var(--gray-200)">
      <div class="tbl-ctrl">
        <select class="sel-flt" id="vacStatus"><option value="all">Todos</option><option value="pending">Pendientes</option><option value="approved">Aprobadas</option><option value="rejected">Rechazadas</option></select>
        <button class="btn btn-ghost btn-sm" onclick="Pages._vacFetch()">🔍 Filtrar</button>
      </div>
    </div>
    <div id="vacTable"><div style="text-align:center;padding:40px"><div class="spinner"></div></div></div>
  </div>
  <div class="modal-ov" id="vacModal">
    <div class="modal">
      <div class="modal-header"><h3 class="modal-title">Nueva Solicitud de Vacaciones</h3><button class="modal-close" onclick="Pages._vacClose()">✕</button></div>
      <div class="modal-body">
        <div id="vacAlert" class="alert alert-error" style="display:none"></div>
        <div class="form-group"><label>Empleado *</label><select class="form-control" id="vac_emp"><option value="">Seleccionar...</option>${emps.map(e=>`<option value="${e.id}">${e.first_name} ${e.last_name}</option>`).join('')}</select></div>
        <div class="grid-2">
          <div class="form-group"><label>Fecha Inicio *</label><input type="date" class="form-control" id="vac_start"></div>
          <div class="form-group"><label>Fecha Fin *</label><input type="date" class="form-control" id="vac_end"></div>
        </div>
        <div class="form-group"><label>Motivo</label><textarea class="form-control" id="vac_reason" rows="2" placeholder="Motivo de la solicitud..."></textarea></div>
      </div>
      <div class="modal-footer"><button class="btn btn-ghost" onclick="Pages._vacClose()">Cancelar</button><button class="btn btn-primary" onclick="Pages._vacSave()">💾 Solicitar</button></div>
    </div>
  </div>`;
  Pages._vacFetch();
},
_vacModal(){document.getElementById('vacModal').classList.add('active');},
_vacClose(){document.getElementById('vacModal').classList.remove('active');},
async _vacFetch(){
  const st=document.getElementById('vacStatus')?.value||'all';
  try{
    const r=await API.get('/vacations',{status:st});
    const items=r.data?.data||[];
    const el=document.getElementById('vacTable');
    if(!items.length){el.innerHTML='<div class="empty-state"><div class="empty-icon">🏖️</div><h3>Sin solicitudes</h3><p>No hay solicitudes de vacaciones</p></div>';return;}
    el.innerHTML=`<div class="table-wrap"><table><thead><tr><th>Empleado</th><th>Desde</th><th>Hasta</th><th>Días</th><th>Motivo</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
    ${items.map(v=>`<tr>
      <td><strong>${v.employee?.first_name||''} ${v.employee?.last_name||''}</strong><br><small style="color:var(--gray-500)">${v.employee?.department||''}</small></td>
      <td>${Fmt.date(v.start_date)}</td><td>${Fmt.date(v.end_date)}</td><td><strong>${v.days_requested}</strong></td>
      <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${v.reason||'—'}</td>
      <td>${Fmt.badge(v.status)}</td>
      <td><div style="display:flex;gap:5px">
        ${v.status==='pending'?`<button class="btn btn-success btn-sm" onclick="Pages._vacApprove(${v.id})" title="Aprobar">✓</button><button class="btn btn-danger btn-sm" onclick="Pages._vacReject(${v.id})" title="Rechazar">✗</button><button class="btn btn-ghost btn-sm" onclick="Pages._vacDel(${v.id})" title="Eliminar">🗑️</button>`:'—'}
      </div></td>
    </tr>`).join('')}</tbody></table></div>`;
  }catch(e){document.getElementById('vacTable').innerHTML=`<div class="alert alert-error" style="margin:16px">❌ ${e.message}</div>`;}
},
async _vacSave(){
  try{
    await API.post('/vacations',{employee_id:document.getElementById('vac_emp').value,start_date:document.getElementById('vac_start').value,end_date:document.getElementById('vac_end').value,reason:document.getElementById('vac_reason').value});
    Toast.success('Solicitud creada');Pages._vacClose();Pages._vacFetch();
  }catch(e){const a=document.getElementById('vacAlert');a.textContent='⚠️ '+e.message;a.style.display='flex';}
},
async _vacApprove(id){if(!confirm('¿Aprobar esta solicitud?'))return;try{await API.put('/vacations/'+id+'/approve');Toast.success('Vacaciones aprobadas');Pages._vacFetch();}catch(e){Toast.error(e.message);}},
async _vacReject(id){const r=prompt('Motivo del rechazo (opcional):');try{await API.put('/vacations/'+id+'/reject',{reason:r||''});Toast.warning('Solicitud rechazada');Pages._vacFetch();}catch(e){Toast.error(e.message);}},
async _vacDel(id){if(!confirm('¿Eliminar esta solicitud?'))return;try{await API.delete('/vacations/'+id);Toast.success('Eliminada');Pages._vacFetch();}catch(e){Toast.error(e.message);}},

// ── DOCUMENTS ──────────────────────────────────────────────
async documents(){
  const emps=await Pages._getEmps();
  document.getElementById('pageContent').innerHTML=`
  <div class="card">
    <div class="card-header"><span class="card-title">📁 Gestión Documental</span><button class="btn btn-primary btn-sm" onclick="Pages._docModal()">➕ Subir Documento</button></div>
    <div class="card-body" style="border-bottom:1px solid var(--gray-200)">
      <div class="tbl-ctrl">
        <div class="search-box" style="flex:1"><span class="search-icon">🔍</span><input type="text" class="form-control" id="docSearch" placeholder="Buscar documentos..."></div>
        <select class="sel-flt" id="docType"><option value="all">Todos los tipos</option><option value="contract">Contratos</option><option value="certificate">Certificados</option><option value="id_document">Documentos ID</option><option value="payroll">Nómina</option><option value="other">Otros</option></select>
        <button class="btn btn-ghost btn-sm" onclick="Pages._docFetch()">🔍 Filtrar</button>
      </div>
    </div>
    <div id="docTable"><div style="text-align:center;padding:40px"><div class="spinner"></div></div></div>
  </div>
  <div class="modal-ov" id="docModal">
    <div class="modal">
      <div class="modal-header"><h3 class="modal-title">Subir Documento</h3><button class="modal-close" onclick="Pages._docClose()">✕</button></div>
      <div class="modal-body">
        <div id="docAlert" class="alert alert-error" style="display:none"></div>
        <div class="form-group"><label>Empleado *</label><select class="form-control" id="doc_emp"><option value="">Seleccionar...</option>${emps.map(e=>`<option value="${e.id}">${e.first_name} ${e.last_name}</option>`).join('')}</select></div>
        <div class="grid-2">
          <div class="form-group"><label>Título *</label><input type="text" class="form-control" id="doc_title" placeholder="Nombre del documento"></div>
          <div class="form-group"><label>Tipo *</label><select class="form-control" id="doc_type"><option value="contract">Contrato</option><option value="certificate">Certificado</option><option value="id_document">Documento ID</option><option value="payroll">Nómina</option><option value="other">Otro</option></select></div>
        </div>
        <div class="form-group"><label>Archivo * (PDF, DOC, JPG, PNG — máx. 10MB)</label><input type="file" class="form-control" id="doc_file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"></div>
        <div class="grid-2">
          <div class="form-group"><label>Fecha Vencimiento</label><input type="date" class="form-control" id="doc_exp"></div>
          <div class="form-group"><label>Notas</label><input type="text" class="form-control" id="doc_notes" placeholder="Notas opcionales"></div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn btn-ghost" onclick="Pages._docClose()">Cancelar</button><button class="btn btn-primary" id="docSaveBtn" onclick="Pages._docSave()">📤 Subir</button></div>
    </div>
  </div>`;
  Pages._docFetch();
},
_docModal(){document.getElementById('docModal').classList.add('active');},
_docClose(){document.getElementById('docModal').classList.remove('active');},
async _docFetch(){
  const s=document.getElementById('docSearch')?.value||'';
  const t=document.getElementById('docType')?.value||'';
  const typeL={contract:'Contrato',certificate:'Certificado',id_document:'Doc. ID',payroll:'Nómina',other:'Otro'};
  try{
    const r=await API.get('/documents',{search:s,type:t});
    const items=r.data?.data||[];
    const el=document.getElementById('docTable');
    if(!items.length){el.innerHTML='<div class="empty-state"><div class="empty-icon">📁</div><h3>Sin documentos</h3><p>Sube el primer documento</p></div>';return;}
    el.innerHTML=`<div class="table-wrap"><table><thead><tr><th>Empleado</th><th>Título</th><th>Tipo</th><th>Vencimiento</th><th>Subido</th><th></th></tr></thead><tbody>
    ${items.map(d=>{const exp=d.expiry_date&&new Date(d.expiry_date)<new Date(Date.now()+30*86400000);return`<tr>
      <td>${d.employee?.first_name||''} ${d.employee?.last_name||''}<br><small style="color:var(--gray-500)">${d.employee?.department||''}</small></td>
      <td><strong>📄 ${d.title}</strong></td>
      <td><span class="badge badge-info">${typeL[d.type]||d.type}</span></td>
      <td>${d.expiry_date?`<span class="${exp?'badge badge-warning':''}">${Fmt.date(d.expiry_date)}</span>`:'—'}</td>
      <td>${Fmt.date(d.created_at)}</td>
      <td><button class="btn btn-danger btn-sm" onclick="Pages._docDel(${d.id})">🗑️</button></td>
    </tr>`}).join('')}</tbody></table></div>`;
  }catch(e){document.getElementById('docTable').innerHTML=`<div class="alert alert-error" style="margin:16px">❌ ${e.message}</div>`;}
},
async _docSave(){
  const file=document.getElementById('doc_file').files[0];
  if(!file){Toast.warning('Selecciona un archivo');return;}
  const fd=new FormData();
  fd.append('employee_id',document.getElementById('doc_emp').value);
  fd.append('title',document.getElementById('doc_title').value);
  fd.append('type',document.getElementById('doc_type').value);
  fd.append('file',file);
  fd.append('expiry_date',document.getElementById('doc_exp').value||'');
  fd.append('notes',document.getElementById('doc_notes').value||'');
  const btn=document.getElementById('docSaveBtn');btn.disabled=true;btn.textContent='Subiendo...';
  try{await API.upload('/documents',fd);Toast.success('Documento subido');Pages._docClose();Pages._docFetch();}
  catch(e){const a=document.getElementById('docAlert');a.textContent='⚠️ '+e.message;a.style.display='flex';}
  finally{btn.disabled=false;btn.innerHTML='📤 Subir';}
},
async _docDel(id){if(!confirm('¿Eliminar este documento?'))return;try{await API.delete('/documents/'+id);Toast.success('Eliminado');Pages._docFetch();}catch(e){Toast.error(e.message);}},

// ── REPORTS ────────────────────────────────────────────────
async reports(){
  const c=document.getElementById('pageContent');
  c.innerHTML='<div style="text-align:center;padding:60px"><div class="spinner"></div></div>';
  try{
    const[dash,rep]=await Promise.all([API.get('/dashboard'),API.get('/attendances/report')]);
    const d=dash.data;
    c.innerHTML=`
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon si-blue">👥</div><div><div class="sv">${d.employees?.total||0}</div><div class="sl">Total Empleados</div></div></div>
      <div class="stat-card"><div class="stat-icon si-green">✅</div><div><div class="sv">${d.employees?.active||0}</div><div class="sl">Empleados Activos</div></div></div>
      <div class="stat-card"><div class="stat-icon si-amber">⏳</div><div><div class="sv">${d.vacations?.pending||0}</div><div class="sl">Vacaciones Pendientes</div></div></div>
      <div class="stat-card"><div class="stat-icon si-red">📄</div><div><div class="sv">${d.documents?.expiring_soon||0}</div><div class="sl">Docs por Vencer</div></div></div>
    </div>
    <div class="card">
      <div class="card-header">
        <span class="card-title">📊 Reporte de Asistencia Mensual</span>
        <div style="display:flex;gap:8px">
          <input type="month" class="sel-flt" id="repMonth" value="${new Date().toISOString().slice(0,7)}">
          <button class="btn btn-primary btn-sm" onclick="Pages._repRefresh()">Actualizar</button>
        </div>
      </div>
      <div id="repTable">${Pages._repTbl(rep.data?.report||[])}</div>
    </div>`;
  }catch(e){c.innerHTML=`<div class="alert alert-error">❌ ${e.message}</div>`;}
},
async _repRefresh(){
  const m=document.getElementById('repMonth')?.value;if(!m)return;
  const[y,mo]=m.split('-');
  const from=`${y}-${mo}-01`,to=new Date(y,mo,0).toISOString().slice(0,10);
  try{const r=await API.get('/attendances/report',{from,to});document.getElementById('repTable').innerHTML=Pages._repTbl(r.data?.report||[]);}
  catch(e){Toast.error(e.message);}
},
_repTbl(items){
  if(!items.length)return'<div class="empty-state"><div class="empty-icon">📊</div><p>Sin datos para el período</p></div>';
  return`<div class="table-wrap"><table><thead><tr><th>Empleado</th><th>Departamento</th><th>Presentes</th><th>Ausentes</th><th>Tardanzas</th><th>Medio Día</th><th>Min. Tardanza</th></tr></thead><tbody>
  ${items.map(r=>`<tr><td><strong>${r.employee}</strong></td><td>${r.department}</td>
  <td><span class="badge badge-success">${r.present}</span></td><td><span class="badge badge-danger">${r.absent}</span></td>
  <td><span class="badge badge-warning">${r.late}</span></td><td>${r.half_day}</td>
  <td>${r.late_minutes>0?`<span class="badge badge-warning">${r.late_minutes} min</span>`:'—'}</td></tr>`).join('')}
  </tbody></table></div>`;
},

// ── NOTIFICATIONS ──────────────────────────────────────────
async notifications(){
  const c=document.getElementById('pageContent');
  c.innerHTML='<div style="text-align:center;padding:60px"><div class="spinner"></div></div>';
  try{
    const r=await API.get('/notifications');
    const items=r.data?.data||[];
    c.innerHTML=`<div class="card">
      <div class="card-header"><span class="card-title">🔔 Notificaciones</span><button class="btn btn-ghost btn-sm" onclick="Pages._notifMarkAll()">✓ Marcar todas leídas</button></div>
      ${items.length?`<div id="notifList">${items.map(n=>`
        <div style="display:flex;gap:14px;padding:14px 18px;border-bottom:1px solid var(--gray-200);${n.is_read?'':'background:rgba(79,70,229,.03)'}">
          <span style="font-size:22px">${n.type==='success'?'✅':n.type==='warning'?'⚠️':n.type==='error'?'❌':'ℹ️'}</span>
          <div style="flex:1">
            <div style="font-weight:${n.is_read?500:700};margin-bottom:3px">${n.title}</div>
            <div style="color:var(--gray-600);font-size:13px">${n.message}</div>
            <div style="font-size:11px;color:var(--gray-400);margin-top:4px">${Fmt.date(n.created_at)}</div>
          </div>
          <div style="display:flex;gap:5px;align-items:flex-start">
            ${!n.is_read?`<button class="btn btn-ghost btn-sm" onclick="Pages._notifRead(${n.id})" title="Marcar leída">👁️</button>`:''}
            <button class="btn btn-danger btn-sm" onclick="Pages._notifDel(${n.id})" title="Eliminar">🗑️</button>
          </div>
        </div>`).join('')}</div>`:'<div class="empty-state"><div class="empty-icon">🔔</div><h3>Sin notificaciones</h3><p>Todo al día 🎉</p></div>'}
    </div>`;
  }catch(e){c.innerHTML=`<div class="alert alert-error">❌ ${e.message}</div>`;}
},
async _notifRead(id){try{await API.put('/notifications/'+id+'/read');Pages.notifications();refreshBadge();}catch(e){Toast.error(e.message);}},
async _notifMarkAll(){try{await API.put('/notifications/read-all');Toast.success('Todas marcadas como leídas');Pages.notifications();refreshBadge();}catch(e){Toast.error(e.message);}},
async _notifDel(id){try{await API.delete('/notifications/'+id);Pages.notifications();refreshBadge();}catch(e){Toast.error(e.message);}},

// ── USUARIOS (solo admin) ──────────────────────────────────
async users(){
  const c=document.getElementById('pageContent');
  c.innerHTML='<div style="text-align:center;padding:60px"><div class="spinner"></div></div>';
  try{
    const[usersRes,empsRes]=await Promise.all([API.get('/users'),API.get('/users/available-employees')]);
    const users=usersRes.data||[];
    const avEmps=empsRes.data||[];
    const roleLabels={manager:'Gerente',hr:'Recursos Humanos',employee:'Empleado'};
    const roleBadge={manager:'badge-info',hr:'badge-warning',employee:'badge-success'};
    c.innerHTML=`
    <div class="card">
      <div class="card-header"><span class="card-title">🔑 Gestión de Usuarios</span><button class="btn btn-primary btn-sm" onclick="Pages._usrModal()">➕ Nuevo Usuario</button></div>
      <div class="table-wrap"><table><thead><tr><th>Usuario</th><th>Rol</th><th>Empleado vinculado</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
      ${users.length?users.map(u=>`<tr>
        <td><div style="font-weight:600">${u.name}</div><div style="font-size:12px;color:var(--gray-500)">${u.email}</div></td>
        <td><span class="badge ${roleBadge[u.role]||'badge-info'}">${roleLabels[u.role]||u.role}</span></td>
        <td>${u.employee?`<strong>${u.employee.full_name}</strong><br><small style="color:var(--gray-500)">${u.employee.department}</small>`:'<span style="color:var(--gray-400)">—</span>'}</td>
        <td><span class="badge ${u.is_active?'badge-success':'badge-danger'}">${u.is_active?'Activo':'Inactivo'}</span></td>
        <td><div style="display:flex;gap:5px">
          <button class="btn btn-ghost btn-sm" onclick="Pages._usrEdit(${u.id})">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="Pages._usrDel(${u.id},'${u.name}')">🗑️</button>
        </div></td>
      </tr>`).join(''):'<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">🔑</div><p>Sin usuarios creados. Crea el primero.</p></div></td></tr>'}
      </tbody></table></div>
    </div>
    <div class="modal-ov" id="usrModal">
      <div class="modal" style="max-width:520px">
        <div class="modal-header"><h3 class="modal-title" id="usrModalTitle">Nuevo Usuario</h3><button class="modal-close" onclick="Pages._usrClose()">✕</button></div>
        <div class="modal-body">
          <div id="usrAlert" class="alert alert-error" style="display:none"></div>
          <div class="form-group"><label>Nombre *</label><input type="text" class="form-control" id="uf_name" placeholder="Nombre completo"></div>
          <div class="form-group"><label>Correo *</label><input type="email" class="form-control" id="uf_email" placeholder="correo@empresa.com"></div>
          <div class="form-group"><label>Contraseña *</label><input type="password" class="form-control" id="uf_password" placeholder="Mínimo 8 caracteres"><small id="uf_pwdNote" style="color:var(--gray-400)"></small></div>
          <div class="form-group"><label>Rol *</label>
            <select class="form-control" id="uf_role" onchange="Pages._usrRoleChange()">
              <option value="manager">Gerente</option>
              <option value="hr">Recursos Humanos</option>
              <option value="employee">Empleado</option>
            </select>
          </div>
          <div class="form-group" id="uf_empGroup" style="display:none">
            <label>Empleado al que pertenece esta cuenta *</label>
            <select class="form-control" id="uf_employee_id">
              <option value="">Seleccionar empleado...</option>
              ${avEmps.map(e=>`<option value="${e.id}">${e.first_name} ${e.last_name} · ${e.department}</option>`).join('')}
            </select>
            <small style="color:var(--gray-500)">💡 Cuando este usuario inicie sesión, verá <strong>los datos del empleado seleccionado</strong> (su asistencia, vacaciones, documentos).</small>
          </div>
          <div class="form-group"><label>Estado</label>
            <select class="form-control" id="uf_is_active">
              <option value="1">Activo</option><option value="0">Inactivo</option>
            </select>
          </div>
        </div>
        <div class="modal-footer"><button class="btn btn-ghost" onclick="Pages._usrClose()">Cancelar</button><button class="btn btn-primary" id="usrSaveBtn" onclick="Pages._usrSave()">💾 Guardar</button></div>
      </div>
    </div>`;
    Pages._usrAvEmps=avEmps;
  }catch(e){c.innerHTML=`<div class="alert alert-error">❌ ${e.message}</div>`;}
},
_usrId:null,_usrAvEmps:[],
_usrRoleChange(){
  const r=document.getElementById('uf_role')?.value;
  document.getElementById('uf_empGroup').style.display=r==='employee'?'block':'none';
},
_usrModal(data=null){
  Pages._usrId=data?.id||null;
  document.getElementById('usrModalTitle').textContent=Pages._usrId?'Editar Usuario':'Nuevo Usuario';
  document.getElementById('usrAlert').style.display='none';
  document.getElementById('uf_name').value=data?.name||'';
  document.getElementById('uf_email').value=data?.email||'';
  document.getElementById('uf_password').value='';
  document.getElementById('uf_role').value=data?.role||'manager';
  document.getElementById('uf_is_active').value=data?.is_active===false?'0':'1';
  if(Pages._usrId){
    document.getElementById('uf_pwdNote').textContent='Dejar vacío para no cambiar la contraseña';
    document.getElementById('uf_password').required=false;
  } else {
    document.getElementById('uf_pwdNote').textContent='';
    document.getElementById('uf_password').required=true;
  }
  // Si editando y tiene empleado vinculado, agregarlo al select
  const empSel=document.getElementById('uf_employee_id');
  if(data?.employee){
    const exists=[...empSel.options].some(o=>o.value==data.employee.id);
    if(!exists){const o=new Option(`${data.employee.full_name} · ${data.employee.department}`,data.employee.id);empSel.add(o,1);}
    empSel.value=data.employee.id;
  } else {empSel.value='';}
  Pages._usrRoleChange();
  document.getElementById('usrModal').classList.add('active');
},
async _usrEdit(id){
  try{const r=await API.get('/users/'+id);Pages._usrModal(r.data);}
  catch(e){Toast.error(e.message);}
},
_usrClose(){document.getElementById('usrModal').classList.remove('active');Pages._usrId=null;},
async _usrSave(){
  const btn=document.getElementById('usrSaveBtn');btn.disabled=true;btn.textContent='Guardando...';
  document.getElementById('usrAlert').style.display='none';
  const body={
    name:document.getElementById('uf_name').value,
    email:document.getElementById('uf_email').value,
    password:document.getElementById('uf_password').value,
    role:document.getElementById('uf_role').value,
    is_active:document.getElementById('uf_is_active').value==='1',
    employee_id:document.getElementById('uf_employee_id').value||null,
  };
  if(!body.password)delete body.password;
  try{
    if(Pages._usrId){await API.put('/users/'+Pages._usrId,body);Toast.success('Usuario actualizado');}
    else{await API.post('/users',body);Toast.success('Usuario creado');}
    Pages._usrClose();Pages.users();
  }catch(e){
    if(e.errors){const msgs=Object.values(e.errors).flat().join('\n');const a=document.getElementById('usrAlert');a.textContent='⚠️ '+msgs;a.style.display='flex';}
    else{const a=document.getElementById('usrAlert');a.textContent='⚠️ '+e.message;a.style.display='flex';}
  }finally{btn.disabled=false;btn.innerHTML='💾 Guardar';}
},
async _usrDel(id,name){
  if(!confirm(`¿Eliminar el usuario "${name}"?\nEl empleado vinculado no se eliminará.`))return;
  try{await API.delete('/users/'+id);Toast.success('Usuario eliminado');Pages.users();}
  catch(e){Toast.error(e.message);}
},

// ── VISTAS PERSONALES DEL EMPLEADO ─────────────────────────
async myAttendance(){
  const c=document.getElementById('pageContent');
  c.innerHTML='<div style="text-align:center;padding:60px"><div class="spinner"></div></div>';
  try{
    const[todayRes,histRes]=await Promise.all([API.get('/attendances/today'),API.get('/attendances',{per_page:30})]);
    const today=todayRes.data;
    const items=histRes.data?.data||[];
    const now=new Date();
    const timeStr=now.toTimeString().slice(0,5);
    const hasIn=!!(today?.check_in);
    const hasOut=!!(today?.check_out);

    c.innerHTML=`
    <div class="card" style="margin-bottom:20px">
      <div class="card-header"><span class="card-title">📅 Mi Asistencia de Hoy</span><span style="font-size:13px;color:var(--gray-500)">${new Date().toLocaleDateString('es',{weekday:'long',day:'numeric',month:'long'})}</span></div>
      <div class="card-body" style="display:flex;align-items:center;gap:24px;flex-wrap:wrap">
        <div style="text-align:center;min-width:120px">
          <div style="font-size:13px;color:var(--gray-500);margin-bottom:4px">Estado</div>
          ${today?Fmt.badge(today.status):'<span class="badge" style="background:var(--gray-200);color:var(--gray-600)">Sin registro</span>'}
        </div>
        <div style="text-align:center;min-width:100px">
          <div style="font-size:13px;color:var(--gray-500);margin-bottom:4px">Entrada</div>
          <div style="font-size:22px;font-weight:700;color:var(--success)">${hasIn?today.check_in.slice(11,16):'—'}</div>
        </div>
        <div style="text-align:center;min-width:100px">
          <div style="font-size:13px;color:var(--gray-500);margin-bottom:4px">Salida</div>
          <div style="font-size:22px;font-weight:700;color:var(--danger)">${hasOut?today.check_out.slice(11,16):'—'}</div>
        </div>
        ${today?.late_minutes>0?`<div style="text-align:center"><div style="font-size:13px;color:var(--gray-500);margin-bottom:4px">Tardanza</div><span class="badge badge-warning">${today.late_minutes} min</span></div>`:''}
        <div style="margin-left:auto;display:flex;gap:10px;flex-wrap:wrap">
          ${!hasIn?`<button class="btn btn-primary" id="btnCheckIn" onclick="Pages._doCheckIn()">🟢 Marcar Entrada (${timeStr})</button>`:''}
          ${hasIn&&!hasOut?`<button class="btn btn-danger" id="btnCheckOut" onclick="Pages._doCheckOut()">🔴 Marcar Salida (${timeStr})</button>`:''}
          ${hasIn&&hasOut?`<div style="padding:10px 16px;background:var(--gray-100);border-radius:8px;font-size:13px;color:var(--gray-500)">✅ Asistencia completa registrada</div>`:''}
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">📋 Historial de Asistencia</span></div>
      ${items.length?`<div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Entrada</th><th>Salida</th><th>Tardanza</th><th>Estado</th></tr></thead><tbody>
      ${items.map(a=>`<tr>
        <td>${Fmt.date(a.date)}</td>
        <td>${a.check_in?a.check_in.slice(11,16):'—'}</td>
        <td>${a.check_out?a.check_out.slice(11,16):'—'}</td>
        <td>${a.late_minutes>0?`<span class="badge badge-warning">${a.late_minutes} min</span>`:'—'}</td>
        <td>${Fmt.badge(a.status)}</td>
      </tr>`).join('')}</tbody></table></div>`
      :'<div class="empty-state"><div class="empty-icon">📅</div><p>Sin registros de asistencia</p></div>'}
    </div>`;
  }catch(e){c.innerHTML=`<div class="alert alert-error">❌ ${e.message}</div>`;}
},
async _doCheckIn(){
  const btn=document.getElementById('btnCheckIn');
  if(btn){btn.disabled=true;btn.textContent='Registrando...';}
  try{
    await API.post('/attendances/check-in');
    Toast.success('¡Entrada registrada!');
    Pages.myAttendance();
  }catch(e){
    Toast.error(e.message||'Error al registrar entrada');
    if(btn){btn.disabled=false;btn.textContent='🟢 Marcar Entrada';}
  }
},
async _doCheckOut(){
  const btn=document.getElementById('btnCheckOut');
  if(btn){btn.disabled=true;btn.textContent='Registrando...';}
  try{
    await API.post('/attendances/check-out');
    Toast.success('¡Salida registrada!');
    Pages.myAttendance();
  }catch(e){
    Toast.error(e.message||'Error al registrar salida');
    if(btn){btn.disabled=false;btn.textContent='🔴 Marcar Salida';}
  }
},

async myVacations(){
  const c=document.getElementById('pageContent');
  c.innerHTML='<div style="text-align:center;padding:60px"><div class="spinner"></div></div>';
  const user=Auth.getUser();
  try{
    const r=await API.get('/vacations');
    const items=r.data?.data||[];
    c.innerHTML=`<div class="card">
      <div class="card-header"><span class="card-title">🏖️ Mis Vacaciones</span><button class="btn btn-primary btn-sm" onclick="Pages._myVacModal()">➕ Solicitar</button></div>
      ${items.length?`<div class="table-wrap"><table><thead><tr><th>Desde</th><th>Hasta</th><th>Días</th><th>Motivo</th><th>Estado</th></tr></thead><tbody>
      ${items.map(v=>`<tr>
        <td>${Fmt.date(v.start_date)}</td><td>${Fmt.date(v.end_date)}</td>
        <td><strong>${v.days_requested}</strong></td>
        <td>${v.reason||'—'}</td>
        <td>${Fmt.badge(v.status)}</td>
      </tr>`).join('')}</tbody></table></div>`
      :'<div class="empty-state"><div class="empty-icon">🏖️</div><p>Sin solicitudes de vacaciones</p></div>'}
    </div>
    <div class="modal-ov" id="myVacModal">
      <div class="modal">
        <div class="modal-header"><h3 class="modal-title">Solicitar Vacaciones</h3><button class="modal-close" onclick="Pages._myVacClose()">✕</button></div>
        <div class="modal-body">
          <div id="myVacAlert" class="alert alert-error" style="display:none"></div>
          <div class="grid-2">
            <div class="form-group"><label>Fecha Inicio *</label><input type="date" class="form-control" id="mv_start"></div>
            <div class="form-group"><label>Fecha Fin *</label><input type="date" class="form-control" id="mv_end"></div>
          </div>
          <div class="form-group"><label>Motivo</label><textarea class="form-control" id="mv_reason" rows="2" placeholder="Motivo de la solicitud..."></textarea></div>
        </div>
        <div class="modal-footer"><button class="btn btn-ghost" onclick="Pages._myVacClose()">Cancelar</button><button class="btn btn-primary" onclick="Pages._myVacSave()">💾 Solicitar</button></div>
      </div>
    </div>`;
  }catch(e){c.innerHTML=`<div class="alert alert-error">❌ ${e.message}</div>`;}
},
_myVacModal(){document.getElementById('myVacModal')?.classList.add('active');},
_myVacClose(){document.getElementById('myVacModal')?.classList.remove('active');},
async _myVacSave(){
  const user=Auth.getUser();
  if(!user?.employee_id){Toast.error('Tu cuenta no tiene un empleado vinculado.');return;}
  try{
    await API.post('/vacations',{
      employee_id:user.employee_id,
      start_date:document.getElementById('mv_start').value,
      end_date:document.getElementById('mv_end').value,
      reason:document.getElementById('mv_reason').value,
    });
    Toast.success('Solicitud enviada');Pages._myVacClose();Pages.myVacations();
  }catch(e){const a=document.getElementById('myVacAlert');a.textContent='⚠️ '+e.message;a.style.display='flex';}
},

async myDocuments(){
  const c=document.getElementById('pageContent');
  c.innerHTML='<div style="text-align:center;padding:60px"><div class="spinner"></div></div>';
  try{
    const r=await API.get('/documents');
    const items=r.data?.data||[];
    const typeL={contract:'Contrato',certificate:'Certificado',id_document:'Doc. ID',payroll:'Nómina',other:'Otro'};
    c.innerHTML=`<div class="card">
      <div class="card-header"><span class="card-title">📁 Mis Documentos</span></div>
      ${items.length?`<div class="table-wrap"><table><thead><tr><th>Título</th><th>Tipo</th><th>Vencimiento</th><th>Subido</th></tr></thead><tbody>
      ${items.map(d=>{const exp=d.expiry_date&&new Date(d.expiry_date)<new Date(Date.now()+30*86400000);return`<tr>
        <td><strong>📄 ${d.title}</strong></td>
        <td><span class="badge badge-info">${typeL[d.type]||d.type}</span></td>
        <td>${d.expiry_date?`<span class="${exp?'badge badge-warning':''}">${Fmt.date(d.expiry_date)}</span>`:'—'}</td>
        <td>${Fmt.date(d.created_at)}</td>
      </tr>`}).join('')}</tbody></table></div>`
      :'<div class="empty-state"><div class="empty-icon">📁</div><p>Sin documentos asignados</p></div>'}
    </div>`;
  }catch(e){c.innerHTML=`<div class="alert alert-error">❌ ${e.message}</div>`;}
},

// ── HELPERS ────────────────────────────────────────────────
async _getEmps(){
  try{const r=await API.get('/employees',{status:'active',per_page:100});return r.data?.data||[];}catch{return[];}
},
_pages(data,fn){
  if(data.last_page<=1)return'';
  const pgs=Array.from({length:data.last_page},(_,i)=>i+1);
  return`<div class="pagination">
    <button class="pg-btn" onclick="${fn}(${data.current_page-1})" ${data.current_page<=1?'disabled':''}>‹ Ant</button>
    ${pgs.map(p=>`<button class="pg-btn ${p===data.current_page?'active':''}" onclick="${fn}(${p})">${p}</button>`).join('')}
    <button class="pg-btn" onclick="${fn}(${data.current_page+1})" ${data.current_page>=data.last_page?'disabled':''}>Sig ›</button>
  </div>`;
},
};
