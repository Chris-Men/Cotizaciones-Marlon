// Función para generar filas dinámicamente
function generarFilas() {
  const secciones = document.querySelectorAll('section[data-tipo]');

  secciones.forEach(section => {
    const tipo = section.dataset.tipo;
    const totalFilas = parseInt(section.dataset.filas);
    const tbody = section.querySelector('.tabla-contenido');

    // Verificar que el tbody existe
    if (!tbody) {
      console.error(`No se encontró tbody para la sección ${tipo}`);
      return;
    }

    // Limpiar contenido existente
    tbody.innerHTML = '';

    for (let i = 1; i <= totalFilas; i++) {
      let fila = document.createElement('tr');

      if (tipo === 'mano') {
        fila.innerHTML = `
          <td>
            <textarea id="mano_desc_${i}" placeholder="Descripción..." maxlength="200"></textarea>
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
  // Calcular total mano de obra
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

  // Calcular total trabajo externo
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

  // Calcular total repuestos
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

  // Calcular subtotal
  const subtotal = totalMano + totalExterno + totalRepuestos;
  const subtotalElement = document.getElementById('subtotal');
  if (subtotalElement) {
    subtotalElement.value = `$ ${subtotal.toFixed(2)}`;
  }

  // Calcular IVA (13%)
  const iva = subtotal * 0.13;
  const ivaElement = document.getElementById('iva');
  if (ivaElement) {
    ivaElement.value = `$ ${iva.toFixed(2)}`;
  }

  // Calcular total general
  const totalGeneral = subtotal + iva;
  const totalGeneralElement = document.getElementById('total_general');
  if (totalGeneralElement) {
    totalGeneralElement.value = `$ ${totalGeneral.toFixed(2)}`;
  }
}

// Función para agregar event listeners a los campos de valor
function agregarEventListeners() {
  // Agregar event listeners a todos los campos de valor
  const valorInputs = document.querySelectorAll('.valor-input');
  valorInputs.forEach(input => {
    input.addEventListener('input', calcularTotales);
  });
}

// Event listeners principales
document.addEventListener('DOMContentLoaded', function() {
  // Primero generar las filas
  generarFilas();
  
  // Luego agregar los event listeners
  agregarEventListeners();

  // Modal functionality
  const modal = document.getElementById('modalConfirm');
  const openModalBtn = document.getElementById('openModal');
  const confirmBtn = document.getElementById('confirmDownload');
  const cancelBtn = document.getElementById('cancelModal');

  if (openModalBtn && modal) {
    openModalBtn.addEventListener('click', function() {
      modal.style.display = 'block';
    });
  }

  if (cancelBtn && modal) {
    cancelBtn.addEventListener('click', function() {
      modal.style.display = 'none';
    });
  }

  // Cerrar modal al hacer click fuera
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Función principal para descargar PDF
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function() {
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
    signatureFile.addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
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

// Función principal para descargar PDF
function descargarPDF() {
  const elemento = document.getElementById('formulario');
  
  if (!elemento) {
    console.error('No se encontró el elemento formulario');
    return;
  }
  
  // Ocultar botones antes de generar PDF
  const botones = document.querySelector('.button-container');
  const uploadButtons = document.querySelectorAll('.upload-btn');
  const fileInputs = document.querySelectorAll('.file-input');
  
  if (botones) {
    botones.style.display = 'none';
  }
  uploadButtons.forEach(btn => btn.style.display = 'none');
  fileInputs.forEach(input => input.style.display = 'none');

  // Configuración optimizada del PDF
  const opciones = {
    margin: [5, 5, 5, 5], // Márgenes más pequeños
    filename: 'Cotizacion_AAG.pdf',
    image: { 
      type: 'jpeg', 
      quality: 0.95 
    },
    html2canvas: { 
      scale: 1.5, // Escala reducida para mejor ajuste
      useCORS: true,
      letterRendering: true,
      allowTaint: true,
      width: 800, // Ancho fijo para consistencia
      height: undefined, // Altura automática
      scrollX: 0,
      scrollY: 0,
      windowWidth: 800, // Simular ventana de escritorio
      windowHeight: 1200
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true
    },
    pagebreak: { 
      mode: ['avoid-all', 'css', 'legacy'] 
    }
  };

  // Generar y descargar PDF
  html2pdf().set(opciones).from(elemento).save().then(function() {
    // Mostrar botones nuevamente después de generar PDF
    if (botones) {
      botones.style.display = 'flex';
    }
    uploadButtons.forEach(btn => {
      const signatureImage = btn.parentElement.querySelector('.signature-image');
      if (!signatureImage || signatureImage.style.display === 'none') {
        btn.style.display = 'block';
      }
    });
    
    console.log('PDF generado exitosamente');
  }).catch(function(error) {
    console.error('Error al generar PDF:', error);
    // Mostrar botones en caso de error
    if (botones) {
      botones.style.display = 'flex';
    }
    uploadButtons.forEach(btn => {
      const signatureImage = btn.parentElement.querySelector('.signature-image');
      if (!signatureImage || signatureImage.style.display === 'none') {
        btn.style.display = 'block';
      }
    });
  });
}