import{t as e}from"./gsap-Z6x547R-.js";var t=document.getElementById(`menu-toggle`),n=document.getElementById(`nav-overlay`),r=!1;function i(){r=!r,n.classList.toggle(`active`);let i=e.timeline();r?(i.to(t,{width:`100%`,height:`75vh`,duration:.8,ease:`expo.inOut`}),i.to(`#menu-content`,{opacity:1,pointerEvents:`auto`,duration:.4},`-=0.3`),document.getElementById(`page-title`).innerText=`CERRAR`):(i.to(`#menu-content`,{opacity:0,pointerEvents:`none`,duration:.3}),i.to(t,{width:`70%`,height:`60px`,duration:.6,ease:`expo.out`}),document.getElementById(`page-title`).innerText=`FINALIZAR PEDIDO`)}t.addEventListener(`click`,e=>{e.stopPropagation(),i()}),n.addEventListener(`click`,()=>{r&&i()});var a=[40.3458,-3.8249];function o(){let e=localStorage.getItem(`pedidoActual`);if(!e){alert(`No se detectó ningún pedido activo. Regresa al constructor.`),window.location.href=`/views/presupuesto.html`;return}let t=JSON.parse(e);s(t),setTimeout(()=>{c(t.cliente.direccion)},100)}function s(e){let t=document.getElementById(`info-cliente`);t.innerHTML=`
    <p class="mb-1"><strong>CLIENTE:</strong> ${e.cliente.nombre} ${e.cliente.apellidos}</p>
    <p class="mb-1"><strong>DNI:</strong> ${e.cliente.documento}</p>
    <p class="mb-1"><strong>CONTACTO:</strong> ${e.cliente.email} | ${e.cliente.telefono}</p>
    <p class="mb-0 text-cyan"><strong>DIRECCIÓN:</strong> ${e.cliente.direccion}</p>
  `;let n=document.getElementById(`lista-hardware`);n.innerHTML=``;for(let[t,r]of Object.entries(e.configuracion))r&&(n.innerHTML+=`
        <li class="d-flex justify-content-between mb-1 opacity-75">
          <span>${r.nome}</span>
          <span>${r.preco}€</span>
        </li>
      `);e.extras&&e.extras.length>0&&e.extras.forEach(e=>{n.innerHTML+=`
        <li class="d-flex justify-content-between mb-1 text-info small">
          <span>[Extra] ${e.nombre}</span>
          <span>+${e.precio}€</span>
        </li>
      `}),e.descuento>0&&(n.innerHTML+=`
      <li class="d-flex justify-content-between mt-2 pt-2 border-top border-secondary text-success fw-bold">
        <span>DESCUENTO PLAZO (10%)</span>
        <span>-${e.descuento.toFixed(2)}€</span>
      </li>
    `),document.getElementById(`total-final`).innerText=e.total}async function c(e){if(window.L===void 0){console.error(`Leaflet no se ha cargado todavía.`);return}let t=window.L,n=t.map(`map`).setView(a,13);t.tileLayer(`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`,{attribution:`© OpenStreetMap`}).addTo(n);let r=t.icon({iconUrl:`/hard-disk.svg`,iconSize:[45,45],iconAnchor:[22,22],popupAnchor:[0,-20]});t.marker(a,{icon:r}).addTo(n).bindPopup(`<b>PC Gamer Master</b><br>Nuestra Tienda en Alcorcón`).openPopup();try{let r=e.split(`,`)[0]+`, `+e.split(`,`)[2];console.log(`Buscando en mapa:`,r);let i=await(await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(r)}`)).json();if(i&&i.length>0){let e=[parseFloat(i[0].lat),parseFloat(i[0].lon)];t.marker(e).addTo(n).bindPopup(`Tu Domicilio`);let r=t.polyline([a,e],{color:`cyan`,weight:3,dashArray:`10, 10`}).addTo(n);n.fitBounds(r.getBounds(),{padding:[50,50]});let o=(n.distance(a,e)/1e3).toFixed(2);document.getElementById(`distancia-km`).innerText=`${o} KM`,document.getElementById(`ruta-info`).classList.remove(`d-none`)}}catch(e){console.error(`Error al localizar dirección`,e)}}o();