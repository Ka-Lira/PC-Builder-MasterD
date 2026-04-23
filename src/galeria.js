import { gsap } from 'gsap';
import 'bootstrap/dist/css/bootstrap.min.css';

/* Estilos base compartidos */
import './style.css';
/* Estilo de la galeria */
import './galeria.css';


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
    document.getElementById('page-title').innerText = 'CATÁLOGO';
  }
}

menuToggle.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });
navOverlay.addEventListener('click', () => { if (menuAberto) toggleMenu(); });

/* Galeria */
let todosLosProductos = [];

async function cargarProductos() {
    try {
        const res = await fetch('./produtos.json');
        const data = await res.json();

        /* Aplanar JSON*/
        for (const [cat, items] of Object.entries(data.produtos)) {
            items.forEach(p => todosLosProductos.push({ ...p, categoria: cat }));
        }
        renderGrid('todos');
    } catch (e) {console.error("Error cargando productos", e); }
}

function renderGrid(cat) {
    const grid = document.getElementById('productos-grid');
    if (!grid) return;

    grid.innerHTML = "";

    const categoria = cat ? cat.toLowerCase() : 'todos';

    const filtrados = (categoria === 'todos')
        ? todosLosProductos
        : todosLosProductos.filter(p => p.categoria.toLowerCase() === categoria);

    const counter = document.getElementById('total-counter');
    if (counter) counter.innerText = filtrados.length;
    
    filtrados.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'producto-card';
        card.innerHTML = `
            <div class="card-img-wrap">
                <img src="/${prod.imagem}" alt="${prod.nome}">
            </div>
            <p class="card-nombre">${prod.nome}</p>
        `;
        card.onclick = () => abrirModal(prod);
        grid.appendChild(card);
    });
}
cargarProductos();

function abrirModal(prod) {
    const modal = document.getElementById('modal-overlay');
    document.getElementById('modal-img').src = `/${prod.imagem}`;
    document.getElementById('modal-nombre').innerText = prod.nome;
    document.getElementById('modal-categoria').innerText = prod.categoria.toUpperCase();

    /* mostrar el precio */
    const precioElement = document.getElementById('modal-precio-tag');
    precioElement.innerText = `${prod.preco.toLocaleString('es-ES')} €`;

    /* boton 'anandir a mi pc' */
    const btnAction = modal.querySelector('.btn-action');
    const params = new URLSearchParams({
        nombre: prod.nome,
        precio: prod.preco,
        categoria: prod.categoria
    });

    btnAction.href = `/views/presupuesto.html?${params.toString()}`;

    const specsGrid = document.getElementById('modal-specs');
    specsGrid.innerHTML = Object.entries(prod.especificacoes)
        .map(([k, v]) => `<div class="spec-item"><small>${k}</small><p>${v}</p></div>`).join('');

        modal.classList.add('abierto');
}

/* cerrar si hacer clic em X */
document.getElementById('modal-close').onclick = () => document.getElementById('modal-overlay').classList.remove('abierto');

/* cerrar se hacer clic en el fondo oscuro */
document.getElementById('modal-overlay').onclick = (e) => {
    if (e.target.id === 'modal-overlay') {
        document.getElementById('modal-overlay').classList.remove('abierto');
    }
};

/* filtros */

document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        /* para gestionar clases */
        document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('activo'));
        this.classList.add('activo');

        /* ejecutar */
        const categoriaSeleccionada = this.getAttribute('data-cat');
        console.log("Filtrando por:", categoriaSeleccionada);

        renderGrid(categoriaSeleccionada);
    })
});
