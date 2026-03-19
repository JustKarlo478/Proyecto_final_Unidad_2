// ============================================================
// main.js — Biblioteca POO
// ============================================================

// ---- Cursor ----
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
    const interactivos = document.querySelectorAll(
      'a, button, .btn, .version-card, .feature-card, label, .member-tab, .diagram-img-wrap'
    );
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

// ---- AnimacionEntrada ----
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

// ---- Uploader ----
class Uploader {
  constructor() {
    this.area      = document.getElementById('uploadArea');
    this.input     = document.getElementById('fileInput');
    this.resultado = document.getElementById('uploadResult');
    this.btnUpload = document.getElementById('btnUpload');
    if (this.area && this.input && this.resultado && this.btnUpload) {
      this.init();
    }
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

// ---- Descarga de zips embebidos en base64 ----
function descargarVersion(id) {
  const version = zipData[id];

  if (!version) {
    console.warn('Version no encontrada:', id);
    return;
  }

  const btn = document.querySelector('[data-version="' + id + '"]');

  if (!version.disponible || !version.data) {
    if (btn) {
      const original = btn.textContent;
      btn.textContent = 'No disponible aun';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 2000);
    }
    return;
  }

  if (btn) {
    const original = btn.textContent;
    btn.textContent = 'Preparando...';
    btn.disabled = true;

    setTimeout(() => {
      try {
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

        btn.textContent = 'Descargado ✓';
      } catch (e) {
        console.error('Error al descargar:', e);
        btn.textContent = 'Error al descargar';
      }

      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 2000);
    }, 400);
  }
}

// ---- Navegacion suave ----
// IMPORTANTE: excluir los botones de descarga (data-version) para que no
// intercepten el onclick="descargarVersion(...)"
function iniciarNavegacion() {
  document.querySelectorAll('a[href^="#"]:not([data-version])').forEach(enlace => {
    enlace.addEventListener('click', (e) => {
      e.preventDefault();
      const destino = document.querySelector(enlace.getAttribute('href'));
      if (destino) destino.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ---- Scroll spy ----
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

// ---- Galeria de diagramas ----
function showDiagram(name, btn) {
  document.querySelectorAll('.diagram-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.member-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('diag-' + name).classList.add('active');
  btn.classList.add('active');
}

function openOverlay(wrapper) {
  const img = wrapper.querySelector('img');
  if (!img) return;
  document.getElementById('overlayImg').src = img.src;
  document.getElementById('imgOverlay').classList.add('open');
}

function closeOverlay() {
  document.getElementById('imgOverlay').classList.remove('open');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeOverlay();
});

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  new Cursor();
  new AnimacionEntrada('.fade-in');
  new Uploader();
  iniciarNavegacion();
  iniciarScrollSpy();
  actualizarAnio();
});
