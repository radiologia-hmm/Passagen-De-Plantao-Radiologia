document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('checklistForm');
  const container = document.getElementById('mainContainer');

  form.addEventListener('submit', async function(event) {
    event.preventDefault();

    // Validação dos campos obrigatórios 
    let allFieldsFilled = true;
    const requiredInputs = form.querySelectorAll('[required]');
    requiredInputs.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('error-field');
        allFieldsFilled = false;
      } else {
        input.classList.remove('error-field');
      }
    });
    if (!allFieldsFilled) {
      alert('Por favor, preencha todos os campos obrigatórios marcados em vermelho.');
      return;
    }

    // Captura de dados e preparação 
    const dataEntrada = document.getElementById('dataEntrada').value;
    const horasEntrada = document.getElementById('horasEntrada').value;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Gerando PDF...';
    submitButton.disabled = true;

    // Determinar o tipo de formulário 
    const tituloForm = document.querySelector('h2')?.textContent.toLowerCase() || '';
    let tipo = 'checklist';
    if (tituloForm.includes('tomografia')) tipo = 'checklist_tomografia';
    else if (tituloForm.includes('raios') || tituloForm.includes('raio')) tipo = 'checklist_raiosx';
    else {
      // fallback baseado no nome do arquivo
      const path = window.location.pathname.toLowerCase();
      if (path.includes('tomografia')) tipo = 'checklist_tomografia';
      else if (path.includes('raiox')) tipo = 'checklist_raiosx';
    }

    // === Ajustes visuais para PDF ===
    container.style.boxShadow = 'none';
    container.style.borderRadius = '0';
    container.style.margin = '0';
    container.style.padding = '20px';
    document.body.style.background = '#fff';
    submitButton.style.display = 'none';

    // === Configuração do html2pdf ===
    const opt = {
      margin: [5, 5, 5, 5],
      filename: `${tipo}_${dataEntrada || 'data'}_${horasEntrada || 'hora'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollY: -5,
        logging: false
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };
// Substitui o "textarea" para uma "div" assim consigo capturar o texto inteiro. 
const textareas = form.querySelectorAll("textarea");
textareas.forEach((ta) => {
  // Cria um elemento visual com o conteúdo do textarea
  const div = document.createElement("div");
  div.className = "textarea-print";
  div.innerHTML = `<strong>${ta.previousElementSibling?.innerText || ''}</strong><br>${ta.value.replace(/\n/g, "<br>")}`;
  // Substitui temporariamente o textarea pelo conteúdo renderizado
  ta.style.display = "none";
  ta.parentNode.insertBefore(div, ta.nextSibling);
});

    try {
      await html2pdf().set(opt).from(container).save();
      alert('PDF gerado com sucesso!');
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Ocorreu um erro ao gerar o PDF.');
    } finally {
      // === Restaurar elementos após o download ===
      submitButton.style.display = 'block';
      submitButton.textContent = originalText;
      submitButton.disabled = false;
      container.removeAttribute('style');
      document.body.removeAttribute('style');
    }
    //  Restaurar textareas
document.querySelectorAll(".textarea-print").forEach(div => div.remove());
document.querySelectorAll("textarea").forEach(ta => ta.style.display = "block");

  });
});
