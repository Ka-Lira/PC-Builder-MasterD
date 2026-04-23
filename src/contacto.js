import { gsap } from 'gsap';
import 'bootstrap/dist/css/bootstrap.min.css';

/* Estilos base compartidos */
import './style.css';
/* Estilo de la galeria */
import './contacto.css';


/* copia logica de navegacion */
const menuToggle = document.getElementById('menu-toggle');
const navOverlay = document.getElementById('nav-overlay');
let menuAberto = false;

function toggleMenu() {
  menuAberto = !menuAberto;
  navOverlay.classList.toggle('active');
  const tl = gsap.timeline();

  if (menuAberto) {
    tl.to(menuToggle, { 
        width: "100%", 
        height: "75vh", 
        duration: 0.8, 
        ease: "expo.inOut" 
    });

    tl.to("#menu-content", { 
        opacity: 1, 
        pointerEvents: "auto", 
        duration: 0.4 
    }, "-=0.3");
    document.getElementById('page-title').innerText = 'CERRAR';
  } else {
    tl.to("#menu-content", { 
        opacity: 0, 
        pointerEvents: "none", 
        duration: 0.3 
    });
    tl.to(menuToggle, { 
        width: "70%", 
        height: "60px", 
        duration: 0.6, 
        ease: "expo.out" 
    });
    document.getElementById('page-title').innerText = 'FINALIZAR PEDIDO';
  }
}

menuToggle.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });
navOverlay.addEventListener('click', () => { if (menuAberto) toggleMenu(); });

/* new code */
/* mapa - coordenadas */
const coordsTienda = [40.3458, -3.8249];

function inicializarPagina() {
  const datosRaw = localStorage.getItem('pedidoActual');
  if (!datosRaw) {
    alert("No se detectó ningún pedido activo. Regresa al constructor.");
    window.location.href = "/views/presupuesto.html";
    return;
  }

  const pedido = JSON.parse(datosRaw);
  rellenarResumen(pedido);
  
  /* adicionei um delay para carregar o mapa, estava bugando */
  setTimeout(() => {
    inicializarMapa(pedido.cliente.direccion);
  }, 100);
}

function rellenarResumen(pedido) {
  /* datos cliente */
  const infoCliente = document.getElementById('info-cliente');
  infoCliente.innerHTML = `
    <p class="mb-1"><strong>CLIENTE:</strong> ${pedido.cliente.nombre} ${pedido.cliente.apellidos}</p>
    <p class="mb-1"><strong>DNI:</strong> ${pedido.cliente.documento}</p>
    <p class="mb-1"><strong>CONTACTO:</strong> ${pedido.cliente.email} | ${pedido.cliente.telefono}</p>
    <p class="mb-0 text-cyan"><strong>DIRECCIÓN:</strong> ${pedido.cliente.direccion}</p>
  `;

  /* lista hardware */
  const lista = document.getElementById('lista-hardware');
  lista.innerHTML = ""; //limpiar

  for (const [cat, pieza] of Object.entries(pedido.configuracion)) {
    if (pieza) {
      lista.innerHTML += `
        <li class="d-flex justify-content-between mb-1 opacity-75">
          <span>${pieza.nome}</span>
          <span>${pieza.preco}€</span>
        </li>
      `;
    }
  }

  /* extras si existe */
  if (pedido.extras && pedido.extras.length > 0) {
    pedido.extras.forEach(extra => {
      lista.innerHTML += `
        <li class="d-flex justify-content-between mb-1 text-info small">
          <span>[Extra] ${extra.nombre}</span>
          <span>+${extra.precio}€</span>
        </li>
      `;
    });
  }

  /* descuento si existe  */
  if (pedido.descuento > 0) {
    lista.innerHTML += `
      <li class="d-flex justify-content-between mt-2 pt-2 border-top border-secondary text-success fw-bold">
        <span>DESCUENTO PLAZO (10%)</span>
        <span>-${pedido.descuento.toFixed(2)}€</span>
      </li>
    `;
  }

  document.getElementById('total-final').innerText = pedido.total;
}

/* Mapa */
async function inicializarMapa(direccionUsuario) {
  /* comprobar si Leaflet existe en window */
  if (typeof window.L === 'undefined') {
    console.error("Leaflet no se ha cargado todavía.");
    return;
  }

  /* garantir que L sea global */
  const L = window.L;


  const miMapa = L.map('map').setView(coordsTienda, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(miMapa);

    /* Icono para tienda */
    const storeIcon = L.icon({
      iconUrl: '/hard-disk.svg',
      iconSize: [45, 45],
      iconAnchor: [22, 22],
      popupAnchor: [0, -20]
    });

    L.marker(coordsTienda, {icon: storeIcon}).addTo(miMapa)
    .bindPopup('<b>PC Gamer Master</b><br>Nuestra Tienda en Alcorcón')
    .openPopup();

    /* codificar la dirección del usuario con Nominatim*/
    try {
      /* Limpiar direccion poluida // quitar piso, puerta... // quedar solamente calle y numero */
      const direccionParaMapa = direccionUsuario.split(',')[0] + ", " + direccionUsuario.split(',')[2];

      console.log("Buscando en mapa:", direccionParaMapa);


      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccionParaMapa)}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const coordsUsuario = [parseFloat(data[0].lat), parseFloat(data[0].lon)];

        /* anadir marcador de usuario */
        L.marker(coordsUsuario).addTo(miMapa).bindPopup('Tu Domicilio');

        /* Trazar ruta */
        const polyline = L.polyline([coordsTienda, coordsUsuario], {
          color: 'cyan', 
          weight: 3, 
          dashArray: '10, 10'
        }).addTo(miMapa);

        /* ajustar zoom */
        miMapa.fitBounds(polyline.getBounds(), {padding: [50, 50]});

        /* calcular distancia */
        const dist = (miMapa.distance(coordsTienda, coordsUsuario) / 1000).toFixed(2);
        document.getElementById('distancia-km').innerText = `${dist} KM`;
        document.getElementById('ruta-info').classList.remove('d-none');
      }
    } catch (e) { console.error("Error al localizar dirección", e); }
}

inicializarPagina();