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

  // Calcular retención del 1% SOLO si el subtotal es >= $100
  let retencion = 0;
  if (subtotal >= 100) {
    retencion = subtotal * 0.01;
  }
  const retencionElement = document.getElementById('retencion');
  if (retencionElement) {
    retencionElement.value = `$ ${retencion.toFixed(2)}`;
  }

  // Calcular total general (subtotal + IVA - retención)
  const totalGeneral = subtotal + iva - retencion;
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

  // Auto-expandir textarea de notas
  const notasTextarea = document.getElementById('notas');
  if (notasTextarea) {
    notasTextarea.addEventListener('input', function() {
      autoExpandTextarea(this);
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