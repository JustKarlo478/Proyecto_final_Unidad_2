// ============================================================
// main.js — Biblioteca POO
// Lógica principal: cursor, animaciones, subida de archivo
// y descarga de zips embebidos en base64
// ============================================================

// ---- clase Cursor (referencia a instanciacion de objetos POO) ----
class Cursor {
  constructor() {
    this.dot    = document.getElementById('cursor');
    this.trail  = document.getElementById('cursor-trail');
    this.trailX = 0;
    this.trailY = 0;
    this.init();
  }

  init() {
    document.addEventListener('mousemove', (e) => this.move(e));
    const interactivos = document.querySelectorAll('a, button, .btn, .version-card, .feature-card, label');
    interactivos.forEach(el => {
      el.addEventListener('mouseenter', () => this.activarHover());
      el.addEventListener('mouseleave', () => this.desactivarHover());
    });
    this.animarTrail();
  }

  move(e) {
    this.dot.style.left = e.clientX + 'px';
    this.dot.style.top  = e.clientY + 'px';
    this.trailX = e.clientX;
    this.trailY = e.clientY;
  }

  activarHover() {
    this.dot.classList.add('hover');
    this.trail.classList.add('hover');
  }

  desactivarHover() {
    this.dot.classList.remove('hover');
    this.trail.classList.remove('hover');
  }

  animarTrail() {
    let x = 0, y = 0;
    const loop = () => {
      x += (this.trailX - x) * 0.15;
      y += (this.trailY - y) * 0.15;
      this.trail.style.left = x + 'px';
      this.trail.style.top  = y + 'px';
      requestAnimationFrame(loop);
    };
    loop();
  }
}

// ---- clase AnimacionEntrada ----
class AnimacionEntrada {
  constructor(selector) {
    this.elementos = document.querySelectorAll(selector);
    this.observer  = new IntersectionObserver(
      (entries) => this.callback(entries),
      { threshold: 0.1 }
    );
    this.init();
  }

  init() {
    this.elementos.forEach(el => this.observer.observe(el));
  }

  callback(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        this.observer.unobserve(entry.target);
      }
    });
  }
}

// ---- clase Uploader ----
class Uploader {
  constructor() {
    this.area      = document.getElementById('uploadArea');
    this.input     = document.getElementById('fileInput');
    this.resultado = document.getElementById('uploadResult');
    this.btnUpload = document.getElementById('btnUpload');
    this.init();
  }

  init() {
    this.btnUpload.addEventListener('click', () => this.input.click());
    this.input.addEventListener('change', (e) => this.manejarArchivo(e.target.files[0]));

    this.area.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.area.classList.add('dragover');
    });
    this.area.addEventListener('dragleave', () => {
      this.area.classList.remove('dragover');
    });
    this.area.addEventListener('drop', (e) => {
      e.preventDefault();
      this.area.classList.remove('dragover');
      const archivo = e.dataTransfer.files[0];
      if (archivo) this.manejarArchivo(archivo);
    });
  }

  manejarArchivo(archivo) {
    if (!archivo) return;
    const extensionesValidas = ['.zip', '.java', '.jar', '.rar'];
    const nombre = archivo.name.toLowerCase();
    const esValido = extensionesValidas.some(ext => nombre.endsWith(ext));
    if (!esValido) {
      alert('Por favor sube un archivo .zip, .java o .jar');
      return;
    }
    const kb = (archivo.size / 1024).toFixed(1);
    document.getElementById('resultFileName').textContent = archivo.name;
    document.getElementById('resultFileSize').textContent = 'Tamanio: ' + kb + ' KB';
    this.resultado.classList.add('show');
    setTimeout(() => {
      document.getElementById('versions').scrollIntoView({ behavior: 'smooth' });
    }, 800);
  }
}

// ---- descarga de zips embebidos en base64 ----
// zipData viene de zips-data.js que se carga antes que este script
function descargarVersion(id) {
  const version = zipData[id];

  if (!version) {
    console.warn('Version no encontrada:', id);
    return;
  }

  const btn = document.querySelector('[data-version="' + id + '"]');

  // si el zip todavia no esta disponible mostramos aviso
  if (!version.disponible || !version.data) {
    if (btn) {
      const original = btn.textContent;
      btn.textContent = 'No disponible aun';
      setTimeout(() => { btn.textContent = original; }, 2000);
    }
    return;
  }

  if (btn) {
    const original = btn.textContent;
    btn.textContent = 'Preparando...';
    btn.disabled = true;

    setTimeout(() => {
      // decodificar base64 a bytes y crear Blob descargable
      const byteChars = atob(version.data);
      const byteNums  = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNums[i] = byteChars.charCodeAt(i);
      }
      const blob = new Blob([new Uint8Array(byteNums)], { type: 'application/zip' });
      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href     = url;
      link.download = version.nombre;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      btn.textContent = 'Descargado';
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 2000);
    }, 400);
  }
}

// ---- navegacion suave ----
function iniciarNavegacion() {
  document.querySelectorAll('a[href^="#"]').forEach(enlace => {
    enlace.addEventListener('click', (e) => {
      e.preventDefault();
      const destino = document.querySelector(enlace.getAttribute('href'));
      if (destino) destino.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ---- scroll spy ----
function iniciarScrollSpy() {
  const secciones = document.querySelectorAll('section[id]');
  const links     = document.querySelectorAll('.nav-links a');
  const observer  = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.style.color = '');
        const link = document.querySelector('.nav-links a[href="#' + entry.target.id + '"]');
        if (link) link.style.color = 'var(--accent)';
      }
    });
  }, { threshold: 0.4 });
  secciones.forEach(s => observer.observe(s));
}

function actualizarAnio() {
  const el = document.getElementById('anio');
  if (el) el.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', () => {
  new Cursor();
  new AnimacionEntrada('.fade-in');
  new Uploader();
  iniciarNavegacion();
  iniciarScrollSpy();
  actualizarAnio();
});
