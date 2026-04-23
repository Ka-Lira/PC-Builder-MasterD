import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
/* import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; */
import 'bootstrap/dist/css/bootstrap.min.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// Cena, onde os objetos serão colocados
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// Câmera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 3, 5);

// Renderizador
const renderer = new THREE.WebGLRenderer({ 
  antialias: true,
  powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.domElement.style.filter = 'blur(10px)';
renderer.domElement.style.position = 'fixed';
renderer.domElement.style.top = '0';
renderer.domElement.style.zIndex = '1';

document.body.appendChild(renderer.domElement);

// Luzes
/* Configurações essenciais */
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
/* Iluminação em si */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 2);
keyLight.position.set(5, 5, 5);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 1);
fillLight.position.set(-5, 2, 2);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 2.5);
rimLight.position.set(0, 5, -5);
scene.add(rimLight)

const rgbLight = new THREE.PointLight(0x00ffff, 10, 5);
rgbLight.position.set(-1, 1, 0);
scene.add(rgbLight);

/* screen 3d */

//variables necessárias
let noticias = [];
let noticiaActualIndex = 0;
let textoProgreso = "";
let charIndex = 0;
let animacionTypewriter;


const monitorCanvas = document.createElement('canvas');
monitorCanvas.width = 1024;
monitorCanvas.height = 512;
const ctx = monitorCanvas.getContext('2d');
const monitorTexture = new THREE.CanvasTexture(monitorCanvas);

//para que la pantalla no quede al revés.
 monitorTexture.flipY = false;

//crear interfaz 'hacker'
function dibujarInterfazHacker() {
  if (!noticias || noticias.length === 0) return;

  const noticia = noticias[noticiaActualIndex];
  if (!noticia) return;

  //fondo
  ctx.fillStyle = '#050a0a'
  ctx.fillRect(0, 0, 1024, 512);

  //barra topo
  ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
  ctx.fillRect(0, 0, 1024, 40);
  ctx.fillStyle = '#00ffff'
  ctx.font = 'bold 18px Courier New';
  ctx.fillText("HARDWARE NEWS V2.36", 20, 27);
  ctx.fillText("[X]", 980, 27);

  //izquierda
  ctx.fillStyle = 'rgba(0, 255,255, 0.05)';
  ctx.fillRect(10, 50, 280, 450);

  noticias.forEach((item, i) => {
    const yPos = 80 + (i * 35);
    const numero = (i + 1).toString().padStart(2, '0');
    const tituloCorto = item.titulo.substring(0, 15).toUpperCase() + "...";

    //destaca noticia actual
    if (i === noticiaActualIndex) {
      ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
      ctx.fillRect(15, yPos - 20, 270, 30);
      ctx.fillStyle = '#ffffff';
    } else {
      ctx.fillStyle = '#00ffff';
    }

    ctx.font = '14px Courier New';
    ctx.fillText(`${numero} - ${tituloCorto}`, 25, yPos);
  });

  // derecha
  const winX = 310, winY = 60, winW = 690, winH = 430;

  //border
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(winX, winY, winW, winH);

  //titulo
  ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
  ctx.fillRect(winX, winY, winW, 30);
  ctx.fillStyle = '#00ffff';
  ctx.font = 'bold 16px Courier New';
  ctx.fillText(`> NEWS_FEED: ${noticia.titulo}`, winX + 15, winY + 20);

  //cuerpo texto
  ctx.fillStyle = '#ffffff';
  ctx.font = '18px Courier New';

  const lineas = fragmentarTexto(textoProgreso, 50);
  lineas.forEach((linea, index) => {
    ctx.fillText(linea, winX + 20, winY + 70 + (index * 25));
  });

  // cursor
  if (Math.floor(Date.now() / 500) % 2) {
    const ultimaLinea = lineas[lineas.length - 1] || "";
    const cursorX = ctx.measureText(ultimaLinea).width;
    ctx.fillRect(winX + 25 + cursorX, winY + 52 + (lineas.length * 25), 10, 18);
  }

  monitorTexture.needsUpdate = true;

}

//auxiliar para que texto no salga del monitor
function fragmentarTexto(texto, maxChars) {
  let palabras = texto.split(' ');
  let lineas = [];
  let lineaActual = "";

  palabras.forEach(palabra => {
    if ((lineaActual + palabra).length < maxChars) {
      lineaActual += palabra + " ";
    } else {
      lineas.push(lineaActual);
      lineaActual = palabra + " ";
    }
  });
  lineas.push(lineaActual);
  return lineas;
}

//efecto TypeWriter
function iniciarEfectoTypewriter() {
  const noticia = noticias[noticiaActualIndex];
  textoProgreso = "";
  charIndex = 0;

  if (animacionTypewriter) clearInterval(animacionTypewriter);

  animacionTypewriter = setInterval(() => {
    if (charIndex < noticia.resumo.length) {
      textoProgreso += noticia.resumo.charAt(charIndex);
      charIndex++;
      dibujarInterfazHacker();
    } else {
      clearInterval(animacionTypewriter);
    }
  }, 30);
}
//actualizar monitor
setInterval(() => {
  dibujarInterfazHacker();
}, 500);



//request AJAX
async function cargarNoticiasMonitor() {
  try {
    const res = await fetch('/noticias.json');
    noticias = await res.json();

    if(noticias.length > 0) {
      iniciarEfectoTypewriter()

      const container = document.getElementById('news-container');
      container.innerHTML = `<h5>${noticias[0].titulo}</h5>`;
    }
  } catch(e) { console.error(e); }
}

/* screen clicable  */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  //apontar o mouse desde a camera
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const obj = intersects[0];

    //se el objeto es na pantalla
    if (obj.object.name === "Circle_1") {
      const uv = obj.uv;

      const canvasX = uv.x * 1024;
      const canvasY = uv.y * 512;

      /* 
        columna ezquierda = x10 y x290
        noticias empieza y60
        cada noticia mide 35
      */
      if (canvasX > 10 && canvasX < 290) {
        const filaClicada = Math.floor((canvasY - 60) / 35);

        if (filaClicada >= 0 && filaClicada < noticias.length) {
          console.log("Cambiando a noticia:", filaClicada);

          noticiaActualIndex = filaClicada;
          iniciarEfectoTypewriter();

          const container = document.getElementById('news-container');
          if (container) {
            container.innerHTML = `<h5>${noticias[noticiaActualIndex].titulo}</h5>`;
          }
        }
      }
    }
  }
});

// Draco e Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/'); // Caminho para os arquivos na pasta public

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

loader.load('/setup-v1.glb', (gltf) => {
  scene.add(gltf.scene);
  console.log("Setup cargado");

  /* aplicar 'screen editable' dentro del monitor */
  const model = gltf.scene;
  model.traverse((node) => {
    if (node.isMesh && node.name === "Circle_1") {
      node.material = new THREE.MeshBasicMaterial({ 
        map: monitorTexture,
        transparent: true,
        opacity: 1,
      });
    }
  });
  cargarNoticiasMonitor();

  /* posição inicial da camera */
  camera.position.set(-0.5351297067506476, 2.6703000976397693, -3.365845706511445);
  camera.rotation.set(-2.2121799974674055, -0.5313242255565992, -2.5454041745946077);

  /* linha do tempo relacionada ao scroll */
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "main",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.8,

      snap: {
        snapTo: [0, 0.33, 0.66, 1],
        duration: {min: 0.1, max: 0.3},
        delay: 0.05,
        ease: "power1.inOut"
      }
    }
  });

  /* sections fade-in/out */
  //animacion bienvenida
  gsap.to("#welcome .text-center", {
  opacity: 1,
  y: 0,
  duration: 1.2,
  delay: 2,
  ease: "power4.out"
});

  /* news */
  tl.to("#news .card-sober", {
    opacity: 1,
    y: 0,
    duration: 1
  }, "news-=1");

  tl.to("#news .card-sober", {
    opacity: 0,
    y: -30,
    duration: 1
  }, "news+=2");

  /* highlights */
  tl.to(".highlights-modal", { 
    opacity: 1, 
    y: 0, 
    duration: 1
  }, "highlights-=1");

  tl.to("#highlights-backdrop", { 
    opacity: 1,
    duration: 1
  }, "highlights-=1");

  tl.to(".highlights-modal", {
    opacity: 0,
    y: -30,
    duration: 1
  }, "highlights+=2");

  tl.to("highlights-backdrop", {
    opacity: 0,
    duration: 1
  }, "highlights+=2");

  /* footer */
  tl.to("#main-footer .container", { 
    opacity: 1, 
    y: 0, 
    duration: 0.5 
  }, "footer");

    /* quitar blur */
    tl.to(renderer.domElement, {
      filter: "blur(0px)",
      ease: "none"
    }, "news");

    /* Seccion News */
    tl.to(camera.position, {
      x: 0.4608164382420372,
      y: 1.5071870077162426,
      z: -2.787747209552082,
      ease: "none"
    }, "news");

    tl.to(camera.rotation, {
      x: 0.41369856622216594,
      y: -1.516127439216957,
      z: 0.41314852329411145,
      ease: "none"
    }, "news");

    /* Section highlights */
    tl.to(camera.position, {
      x: 0.4064700271197532,
      y: 1.6724837003750936,
      z: -2.3269216383424176,
      ease: "none"
    }, "highlights");

    tl.to(camera.rotation, {
      x: -1.8828657697409816,
      y: -0.6166860498006655,
      z: -2.0796289245159567,
      ease: "none"
    }, "highlights");

    /* section footer */
    tl.to(camera.position, {
      x: 0.4064700271197532,
      y: 1.6724837003750936,
      z: -2.3269216383424176,
      ease: "none"
    }, "footer");

    tl.to(camera.rotation, {
      x: -1.8828657697409816,
      y: -0.6166860498006655,
      z: -2.0796289245159567,
       ease: "none"
    }, "footer");

}, undefined, (error) => {
  console.error("Error cargando el modelo:", error);  
});

// Controles
/* const controls = new OrbitControls(camera, renderer.domElement); */

// Loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Localizar posição da camera
window.addEventListener('keydown', (e) => {
  if(e.key === 'p') {
    console.log("Camera Pos:", camera.position);
    console.log("Camera Pos:", camera.rotation);
  }
});

/* navbar//footer logic */
const menuToggle = document.getElementById('menu-toggle');
const navOverlay = document.getElementById('nav-overlay');

let menuAberto = false;

/* expandir/abrir o menu */
function abrirMenu() {
  menuAberto = true;
  navOverlay.classList.add('active');

  const tl = gsap.timeline();

  /* Animacion círculo */
  tl.to(menuToggle, {
    width: "100%",
    height: "75vh",
    duration: 0.8,
    ease: "expo.inOut"
  });

  /* Animacion texto */
  tl.to("#menu-content", {
    opacity: 1,
    pointerEvents: "auto",
    duration: 0.4
  }, "-=0.3");

  document.getElementById('page-title').innerText = 'CERRAR';
}

/* fechar o menu */
function fecharMenu(){
  menuAberto = false;
  navOverlay.classList.remove('active');

  const tl = gsap.timeline();

  /* quitar contenido primero */
  tl.to("#menu-content", {
    opacity: 0,
    pointerEvents: "none",
    duration: 0.3
  });

  /* subir circulo */
  tl.to(menuToggle, {
    width: "70%",
    height: "60px",
    duration: 0.6,
    ease: "expo.out"
  });

  updatePageTitle();
}


/* detectar o nome da pagina ativa */
function updatePageTitle() {
  const path = window.location.pathname;
  const pageTitleElement = document.getElementById('page-title');
  if (!pageTitleElement) return;

  if (path.includes('galeria')) {
    pageTitleElement.innerText = 'CATÁLOGO';
  } else if (path.includes('presupuesto')) {
    pageTitleElement.innerText = 'ARMAR TU PC';
  } else if (path.includes('contacto')) {
    pageTitleElement.innerText = 'CONTACTO';
  } else {
    pageTitleElement.innerText = 'INICIO';
  }
}
updatePageTitle();

/* reconhecer o click no botao//fora do circulo */
menuToggle.addEventListener('click', (e) => {
  e.stopPropagation(); /* para que o click não atinga algo atrás dele */

  if (!menuAberto) {
    abrirMenu();
  } else {
    fecharMenu();
  }
});

navOverlay.addEventListener('click', () => {
  if (menuAberto) fecharMenu();
});

/* menu drop on loading */
gsap.fromTo(".nav-toggle",
  { 
    y: -100,
    scaleX: 0.8,
    opacity: 0
  },
  {
    y: 0,
    scaleX: 1,
    opacity: 1,
    duration: 1.5,
    ease: "expo.out",
    delay: 0.5
  }
);

/* scroll hint */
const scrollHint = document.getElementById('scroll-hint');

/* delay para aparecer */
gsap.to(scrollHint, {
  opacity: 1,
  duration: 1,
  delay: 3.5
});

/* desaparecer cuanto empiece scroll */
gsap.to(scrollHint, {
  scrollTrigger: {
    trigger: "main",
    start: "top top",
    end: "20% top",
    scrub: true,
  },
  opacity: 0,
  scale: 0.5,
  pointerEvents: "none"
});

/* carrusel */
(function() {
  const items = document.querySelectorAll('.carrusel-item');
  const dots = document.querySelectorAll('.dot');
  const btnPrev = document.getElementById('carrusel-prev');
  const btnNext = document.getElementById('carrusel-next');
  let actual = 0;
  let intervalo;

  function irA(indice) {
    items[actual].classList.remove('active');
    dots[actual].classList.remove('active');

    actual = (indice + items.length) % items.length;

    items[actual].classList.add('active');
    dots[actual].classList.add('active');
  }

  function siguiente() { irA(actual + 1); }
  function anterior() { irA(actual - 1); }

  function iniciarAutoplay() {
    intervalo = setInterval(siguiente, 4000);
  }

  function reiniciarAutoplay() {
    clearInterval(intervalo);
    iniciarAutoplay();
  }

  btnNext.addEventListener('click', () => { siguiente(); reiniciarAutoplay(); });
  btnPrev.addEventListener('click', () => { anterior(); reiniciarAutoplay(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { irA(i); reiniciarAutoplay(); });
  });

  iniciarAutoplay();
})();