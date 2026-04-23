import { gsap } from 'gsap';
import 'bootstrap/dist/css/bootstrap.min.css';

/* Estilos base compartidos */
import './style.css';
/* Estilo de presupuesto */
import './presupuesto.css';
import { sub } from 'three/tsl';


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

/* Constructor */
let productosDB = {};
let elecciones = {
    processadores: null,
    placas_mae: null,
    memorias_ram: null,
    placas_de_video: null,
    armazenamento: null,
    gabinetes: null,
    fontes: null
};

/* cargar y detectar URL */
async function inicializarBuilder() {
    const res = await fetch('./produtos.json');
    const data = await res.json();
    productosDB = data.produtos;

    /* obtener parametros de la URL (vide galería) */
    const urlParams = new URLSearchParams(window.location.search);
    const preSelecNombre = urlParams.get('nombre');
    const preSelecCat = urlParams.get('categoria');

    crearSelectores(preSelecCat, preSelecNombre);

    verificarCompatibilidad();
    actualizarResumen();
}

/* crear los dropdowns */
function crearSelectores(catPre, nombrePre) {
    const container = document.getElementById('selectors-container');

    for (const [categoria, items] of Object.entries(productosDB)) {
        const col = document.createElement('div');
        col.className = 'col-md-6';

        /* cambiar nombres */
        const nombresCat = {
            processadores: "Procesador",
            placas_mae: "Placa Base",
            memorias_ram: "Memoria RAM",
            placas_de_video: "Tarjeta Gráfica",
            armazenamento: "Almacenamiento",
            gabinetes: "Gabinete / Caja",
            fontes: "Fuente de Alimentación"
        };

        let optionsHTML = `<option value="">Selecciona ${nombresCat[categoria]}...</option>`;
        items.forEach(p => {
            const seleccionado = (categoria === catPre && p.nome === nombrePre) ? 'selected' : '';
            if (seleccionado) elecciones[categoria] = p; //Guardar da URL

            optionsHTML += `<option value="${p.nome}" ${seleccionado}>${p.nome} (${p.preco}€)</option>`;
        });

        col.innerHTML = `
        <label class="form-label small text-cyan">${nombresCat[categoria].toUpperCase()}</label>
        <select class="form-select bg-dark text-white border-secondary select-pieza" data-cat="${categoria}">
            ${optionsHTML}
        </select>
        `;
        container.appendChild(col);
    }

    document.querySelectorAll('.select-pieza').forEach(select => {
        select.addEventListener('change', (e) => {
            const cat = e.target.getAttribute('data-cat');
            const nombre = e.target.value;
            elecciones[cat] = productosDB[cat].find(p => p.nome === nombre) || null;

            verificarCompatibilidad();
            actualizarResumen();
        });
    });
}

/* verificar soquete compativel processador/placa mae */
function verificarCompatibilidad() {
    const cpu = elecciones.processadores;
    const mobo = elecciones.placas_mae;
    const ram = elecciones.memorias_ram;

    const cpuSelect = document.querySelector('select[data-cat="processadores"]');
    const moboSelect = document.querySelector('select[data-cat="placas_mae"]');
    const ramSelect = document.querySelector('select[data-cat="memorias_ram"]');   

    /* filtrar placa base */
    if (moboSelect) {
        const opcionesMobo = moboSelect.querySelectorAll('option');
        opcionesMobo.forEach(opt => {
            if (!opt.value) return;
            const pieza = productosDB.placas_mae.find(p => p.nome === opt.value);

            if (cpu && pieza.especificacoes.soquete !== cpu.especificacoes.soquete) {
                opt.disabled = true;
                opt.innerText = `${pieza.nome} [Incompatible - Socket ${pieza.especificacoes.soquete}]`;

                /* resetar si placa elegida es incompatible */
                if ( mobo && mobo.nome === pieza.nome) {
                    elecciones.placas_mae = null;
                    moboSelect.value = "";
                    alert(`La placa ${pieza.nome} no es compatible con el socket del procesador.`);
                }
            } else {
                opt.disabled = false;
                opt.innerText = `${pieza.nome} (${pieza.preco}€)`;
            }
        });
    }

    /* filtro memorias ram */
    if (ramSelect) {
        const opcionesRam = ramSelect.querySelectorAll('option');
        opcionesRam.forEach(opt => {
            if (!opt.value) return;
            const pieza = productosDB.memorias_ram.find(p => p.nome === opt.value);

            if (mobo && pieza.especificacoes.tipo !== mobo.especificacoes.memoria) {
                opt.disabled = true;
                opt.innerText = `${pieza.nome} [Incompatible - Requiere ${mobo.especificacoes.memoria}]`;

                /* Si ram incompatible, resetear */
                if (ram && ram.nome === pieza.nome) {
                    elecciones.memorias_ram = null;
                    ramSelect.value = "";
                    alert(`La memoria RAM elegida no es compatible con el tipo (${mobo.especificacoes.memoria}) de la placa base.`);
                }
            } else {
                opt.disabled = false;
                opt.innerText = `${pieza.nome} (${pieza.preco}€)`;
            }
        });
    }

    /* filtrar procesadores */
    if (cpuSelect) {
        const opcionesCpu = cpuSelect.querySelectorAll('option');
        opcionesCpu.forEach(opt => {
            if (!opt.value) return;
            const pieza = productosDB.processadores.find(p => p.nome === opt.value);;

            if (mobo && pieza.especificacoes.soquete !== mobo.especificacoes.soquete) {
                opt.disabled = true;
                opt.innerText = `${pieza.nome} [Incompatible con Placa ${mobo.especificacoes.soquete}]`;
            } else {
                opt.disabled = false;
                opt.innerText = `${pieza.nome} (${pieza.preco}€)`;
            }
        });
    }
}

/* actualizar recibo y precio */

//boton reset
document.querySelectorAll('.extra-check').forEach(check => {
    check.addEventListener('change', actualizarResumen);
});

document.getElementById('btn-reset').addEventListener('click', () => {
    document.getElementById('form-cliente').reset();
    document.querySelectorAll('.select-pieza').forEach(s => s.value = "");
    document.querySelectorAll('.extra-check').forEach(c => c.checked = false);

    /* limpiar elecciones */
    Object.keys(elecciones).forEach(k => elecciones[k] = null);
    actualizarResumen();
});

function actualizarResumen() {
    const list = document.getElementById('summary-list');
    const totalDisplay = document.getElementById('total-price');
    const plazo = document.getElementById('plazo').value;
    const badge = document.getElementById('urgent-badge');

    list.innerHTML = "";
    let subtotal = 0;

    /* listar piezas */
    for (const [cat, pieza] of Object.entries(elecciones)) {
        if (pieza) {
            subtotal += pieza.preco;
            list.innerHTML += `
                <li class="d-flex justify-content-between mb-2">
                    <span class="opacity-75">${pieza.nome}</span>
                    <span class="text-cyan">${pieza.preco}€</span>
                </li>
            `;
        }
    }

    /* extras - checkbox */
    document.querySelectorAll('.extra-check:checked').forEach(check => {
        const precioExtra = parseInt(check.value);
        const nombreExtra = check.nextElementSibling.innerText.split(' (+')[0];
        subtotal += precioExtra;
        list.innerHTML += `
            <li class="d-flex justify-content-between mb-2 text-info">
                <span>[Extra] ${nombreExtra}</span>
                <span>+${precioExtra}€</span>
            </li>
        `;
    });

    let total = subtotal;

    /* descuento */
    if (plazo > 26 && subtotal > 0) {
        const descuento = subtotal * 0.10;
        total = subtotal - descuento;

        list.innerHTML += `
            <li class="d-flex justify-content-between text-success fw-bold border-top border-secondary pt-2">
                <span>DESCUENTO PLAZO (10%)</span>
                <span>-${descuento.toFixed(2)}€</span>
            </li>
        `;
        badge.classList.remove('d-none');
    } else {
        badge.classList.add('d-none');
    }

    /* Urgencia */

    if (plazo < 5 && subtotal > 0) {
        const adicional = subtotal * 0.10;
        total = subtotal + adicional;

        list.innerHTML += `
            <li class="d-flex justify-content-between item-urgencia">
                <span>ADICIONAL URGENCIA (10%)</span>
                <span>+${adicional.toFixed(2)}€</span>
            </li>
        `;

        badge.classList.remove('d-none');
    } else {
        badge.classList.add('d-none');
    }

    totalDisplay.innerText = `${Math.round(total)} €`;
}

document.getElementById('plazo').addEventListener('input', (e) => {
    document.getElementById('plazo-valor').innerText = e.target.value;
    actualizarResumen();
});

inicializarBuilder();

/* Validacion form */
const inputs = document.querySelectorAll('#form-cliente input');

inputs.forEach(input => {
    input.addEventListener('input', () => {
        validarCampo(input);
    });
});

function validarCampo(input) {
    if (input.checkValidity()) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    } else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
    }
}

// bloquear si formulario invalido
document.getElementById('form-cliente').addEventListener('submit', (e) => {
    e.preventDefault();

    let formularioValido = true;
    inputs.forEach(input => {
        if (!input.checkValidity()) {
            formularioValido = false;
            input.classList.add('is-invalid');
        }
    });

/*     if (formularioValido) {
        alert("¡Pedido procesado con éxito! Tu PC Gamer Master está en camino.");
    } else {
        alert("Por favor, corrige los errores en el formulario antes de finalizar.");
    } */
});

/* seguimiento suave resumen */
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const col8 = document.querySelector('.col-lg-8');
    const sticky = document.querySelector('#sticky-summary');

    if (!col8 || !sticky) return;

    const maxMove = col8.offsetHeight - sticky.offsetHeight;

    gsap.to("#sticky-summary", {
        y: Math.min(Math.max(0, scrollY - 50), maxMove),
        duration: 1.2,
        ease: "power2.out"
    });
});

/* validar DNI / NIE */
function validarDNI(value) {
    const validChars = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const nifRexp = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
    const nieRexp = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
    const str = value.toString().toUpperCase();

    if (!nifRexp.test(str) && !nieRexp.test(str)) return false;

    const nie = str
        .replace(/^[X]/, '0')
        .replace(/^[Y]/, '1')
        .replace(/^[Z]/, '2');

    const letter = str.substr(-1);
    const charIndex = parseInt(nie.substr(0, 8)) % 23;

    return validChars.charAt(charIndex) === letter;
}

/* envio final */
document.getElementById('form-cliente').addEventListener('submit', (e) => {
    e.preventDefault();

    const inputs = document.querySelectorAll('#form-cliente input, #form-cliente select');
    let formularioValido = true;

    /* validar DNI */
    const docInput = document.getElementById('documento');
    if (!validarDNI(docInput.value)) {
        docInput.classList.add('is-invalid');
        formularioValido = false;
    }

    inputs.forEach(input => {
        if (!input.checkValidity()) {
            formularioValido = false;
            input.classList.add('is-invalid');
        }
    });

    if (formularioValido) {
        /* capturar extras */
        const extrasGuardados = [];
        document.querySelectorAll('.extra-check:checked').forEach(check => {
            extrasGuardados.push({
                nombre: check.nextElementSibling.innerText.split(' (+')[0],
                precio: parseInt(check.value)
            });
        });

        /* descuento */
        let subtotalHardware = 0;
        Object.values(elecciones).forEach(p => { if(p) subtotalHardware += p.preco; });
        let subtotalExtras = extrasGuardados.reduce((acc, current) => acc + current.precio, 0);

        let subtotalTotal = subtotalHardware + subtotalExtras;
        let valorDescuento = (document.getElementById('plazo').value > 26) ? (subtotalTotal * 0.10) : 0;

        /* guardar dados pedido y direccion */
        const calleLimpia = document.getElementById('calle').value.split(',')[0];

        const datosPedido = {
            cliente: {
                nombre: document.getElementById('nombre').value,
                apellidos: document.getElementById('apellidos').value,
                documento: document.getElementById('documento').value,
                email: document.getElementById('email').value,
                telefono: document.getElementById('telefono').value,
                direccion: `
                    ${document.getElementById('calle').value},
                    ${document.getElementById('cp').value},
                    ${document.getElementById('localidad').value},
                    ${document.getElementById('provincia').value}
                `
            },
            configuracion: elecciones,
            extras: extrasGuardados,
            descuento: valorDescuento,
            total: document.getElementById('total-price').innerText,
            plazo: document.getElementById('plazo').value
        };

        /* guardar localmente */
        localStorage.setItem('pedidoActual', JSON.stringify(datosPedido));

        window.location.href = './contacto.html';
    } else {
        alert("Por favor, revisa los datos marcados en rojo.");
    }
});