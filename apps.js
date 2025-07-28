// Función para auto-expandir textarea (solo verticalmente)
function autoExpandTextarea(textarea) {
  textarea.style.height = 'auto';
  const newHeight = Math.max(textarea.scrollHeight, 40);
  textarea.style.height = newHeight + 'px';

  // También expandir la celda padre si existe
  const td = textarea.parentElement;
  if (td && td.tagName === 'TD') {
    td.style.height = 'auto';
    td.style.minHeight = (newHeight + 16) + 'px';
  }
}

// Función para generar filas dinámicamente
function generarFilas() {
  const secciones = document.querySelectorAll('section[data-tipo]');

  secciones.forEach(section => {
    const tipo = section.dataset.tipo;
    const totalFilas = parseInt(section.dataset.filas);
    const tbody = section.querySelector('.tabla-contenido');

    if (!tbody) {
      console.error(`No se encontró tbody para la sección ${tipo}`);
      return;
    }

    tbody.innerHTML = '';

    for (let i = 1; i <= totalFilas; i++) {
      let fila = document.createElement('tr');

      if (tipo === 'mano') {
        fila.innerHTML = `
          <td>
            <textarea id="mano_desc_${i}" placeholder="Descripción..." maxlength="200" oninput="autoExpandTextarea(this)"></textarea>
          </td>
          <td>
            <input type="text" id="mano_valor_${i}" class="valor-input" placeholder="0.00" />
          </td>
        `;
      } else {
        const prefix = tipo === 'externo' ? 'ext' : 'rep';
        const descPlaceholder = tipo === 'externo' ? 'Descripción del servicio' : 'Descripción del repuesto';
        fila.innerHTML = `
          <td><input type="text" id="${prefix}_cant_${i}" placeholder="1" /></td>
          <td><input type="text" id="${prefix}_desc_${i}" placeholder="${descPlaceholder}" maxlength="100" /></td>
          <td><input type="text" id="${prefix}_valor_${i}" class="valor-input" placeholder="0.00" /></td>
        `;
      }

      tbody.appendChild(fila);
    }
  });
}

// Función para calcular totales automáticamente
function calcularTotales() {
  let totalMano = 0;
  for (let i = 1; i <= 5; i++) {
    const elemento = document.getElementById(`mano_valor_${i}`);
    if (elemento) {
      const valor = parseFloat(elemento.value) || 0;
      totalMano += valor;
    }
  }
  const totalManoElement = document.getElementById('total_mano');
  if (totalManoElement) {
    totalManoElement.value = `$ ${totalMano.toFixed(2)}`;
  }

  let totalExterno = 0;
  for (let i = 1; i <= 3; i++) {
    const elemento = document.getElementById(`ext_valor_${i}`);
    if (elemento) {
      const valor = parseFloat(elemento.value) || 0;
      totalExterno += valor;
    }
  }
  const totalExternoElement = document.getElementById('total_externo');
  if (totalExternoElement) {
    totalExternoElement.value = `$ ${totalExterno.toFixed(2)}`;
  }

  let totalRepuestos = 0;
  for (let i = 1; i <= 12; i++) {
    const elemento = document.getElementById(`rep_valor_${i}`);
    if (elemento) {
      const valor = parseFloat(elemento.value) || 0;
      totalRepuestos += valor;
    }
  }
  const totalRepuestosElement = document.getElementById('total_repuestos');
  if (totalRepuestosElement) {
    totalRepuestosElement.value = `$ ${totalRepuestos.toFixed(2)}`;
  }

  const subtotal = totalMano + totalExterno + totalRepuestos;
  const subtotalElement = document.getElementById('subtotal');
  if (subtotalElement) {
    subtotalElement.value = `$ ${subtotal.toFixed(2)}`;
  }

  const iva = subtotal * 0.13;
  const ivaElement = document.getElementById('iva');
  if (ivaElement) {
    ivaElement.value = `$ ${iva.toFixed(2)}`;
  }

  const totalGeneral = subtotal + iva;
  const totalGeneralElement = document.getElementById('total_general');
  if (totalGeneralElement) {
    totalGeneralElement.value = `$ ${totalGeneral.toFixed(2)}`;
  }
}

// Función para agregar event listeners a los campos de valor
function agregarEventListeners() {
  const valorInputs = document.querySelectorAll('.valor-input');
  valorInputs.forEach(input => {
    input.addEventListener('input', calcularTotales);
  });
}

// Función principal para descargar PDF
function descargarPDF() {
  // 1. Regenerar filas y recalcular totales
  generarFilas();
  calcularTotales();

  const formularioElement = document.getElementById('formulario');
  if (!formularioElement) {
    console.error('No se encontró el elemento formulario');
    return;
  }

  const botones = document.querySelector('.button-container');
  const uploadButtons = document.querySelectorAll('.upload-btn');
  const fileInputs = document.querySelectorAll('.file-input');

  if (botones) botones.style.display = 'none';
  uploadButtons.forEach(btn => btn.style.display = 'none');
  fileInputs.forEach(input => input.style.display = 'none');

  const opciones = {
    margin: [5, 5, 5, 5], // Ajustar los márgenes
    filename: 'Cotizacion_AAG.pdf',
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      allowTaint: true,
      width: 800,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 800,
      windowHeight: 1200,
      // Agrega estas propiedades para centrar el contenido
      x: 0,
      y: 0,
      // Centra horizontalmente
      'x-align': 'center',
      // Centra verticalmente
      'y-align': 'center'
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true,
      // Centra el contenido en la página
      'x-align': 'center',
      'y-align': 'center'
    }
  };

  html2pdf().from(formularioElement).set(opciones).save().then(() => {
    // Mostrar botones y elementos de firma después de la generación del PDF
    if (botones) botones.style.display = 'flex';
    uploadButtons.forEach(btn => {
      const signatureImage = btn.parentElement.querySelector('.signature-image');
      if (!signatureImage || signatureImage.style.display === 'none') {
        btn.style.display = 'block';
      }
    });
    console.log('PDF generado exitosamente');
  }).catch(error => {
    console.error('Error al generar PDF:', error);
    // Mostrar botones y elementos de firma en caso de error
    if (botones) botones.style.display = 'flex';
    uploadButtons.forEach(btn => {
      const signatureImage = btn.parentElement.querySelector('.signature-image');
      if (!signatureImage || signatureImage.style.display === 'none') {
        btn.style.display = 'block';
      }
    });
  });
}


// Event listeners principales
document.addEventListener('DOMContentLoaded', function () {
  generarFilas();
  agregarEventListeners();

  const notasTextarea = document.getElementById('notas');
  if (notasTextarea) {
    notasTextarea.addEventListener('input', function () {
      autoExpandTextarea(this);
    });
  }

  // Modal functionality
  const modal = document.getElementById('modalConfirm');
  const openModalBtn = document.getElementById('openModal');
  const confirmBtn = document.getElementById('confirmDownload');
  const cancelBtn = document.getElementById('cancelModal');

  if (openModalBtn && modal) {
    openModalBtn.addEventListener('click', function () {
      modal.style.display = 'block';
    });
  }

  if (cancelBtn && modal) {
    cancelBtn.addEventListener('click', function () {
      modal.style.display = 'none';
    });
  }

  // Cerrar modal al hacer click fuera
  window.addEventListener('click', function (event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Función principal para descargar PDF
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function () {
      if (modal) {
        modal.style.display = 'none';
      }
      descargarPDF();
    });
  }

  // Función para manejar la subida de firma
  const signatureFile = document.getElementById('signatureFile');
  const signatureImage = document.getElementById('signatureImage');
  const uploadBtn = document.querySelector('.upload-btn');

  if (signatureFile && signatureImage) {
    signatureFile.addEventListener('change', function (event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          signatureImage.src = e.target.result;
          signatureImage.style.display = 'block';
          if (uploadBtn) {
            uploadBtn.style.display = 'none';
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }



});
