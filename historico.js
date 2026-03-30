// Carregar dados para o Histórico
let historico = JSON.parse(localStorage.getItem('sm_hist')) || [];
let selecaoComp = []; 

const formatar = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

window.onload = () => {
    renderHistorico();
};

function renderHistorico() {
    const container = document.getElementById('historico-render');
    if (!container) return;
    container.innerHTML = '';

    if (historico.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align:center; padding:50px; color:#666;">
                <i class="fas fa-archive" style="font-size:3rem"></i>
                <p>Nenhuma lista finalizada.</p>
            </div>`;
        return;
    }

    historico.slice().reverse().forEach(mes => {
        const isSelected = selecaoComp.includes(mes.id);
        const card = document.createElement('div');
        card.className = `card-historico-pro ${isSelected ? 'selected' : ''}`;
        card.onclick = () => alternarSelecao(mes.id);

        card.innerHTML = `
            <div class="card-header-hist">
                <span class="badge-data">${mes.data}</span>
                <button onclick="event.stopPropagation(); excluirMes(${mes.id})" class="btn-del-small" style="color:red; background:none; border:none;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="card-body-hist">
                <h3>Mês de ${mes.mes}</h3>
                <h2 class="price-tag">${formatar(mes.total)}</h2>
                <small>${mes.qtd} itens comprados</small>
            </div>
            <div class="card-preview-itens" style="font-size:0.8rem; color:#666; margin-top:10px; border-top:1px dashed #ccc; padding-top:10px;">
                ${mes.detalhes ? mes.detalhes.slice(0, 2).map(i => `<div>${i.nome} (${formatar(i.total)})</div>`).join('') : ''}
            </div>
        `;
        container.appendChild(card);
    });

    atualizarInterfaceSelecao();
}

function alternarSelecao(id) {
    const index = selecaoComp.indexOf(id);
    if (index > -1) {
        selecaoComp.splice(index, 1);
    } else {
        if (selecaoComp.length >= 2) selecaoComp.shift();
        selecaoComp.push(id);
    }
    renderHistorico();
}

function atualizarInterfaceSelecao() {
    const status = document.getElementById('status-selecao');
    const fab = document.getElementById('fab-comparar');

    if (!status || !fab) return;

    if (selecaoComp.length === 2) {
        status.innerText = "Pronto para comparar!";
        status.style.color = "#10b981";
        fab.classList.add('visible');
    } else {
        status.innerText = `Selecione mais ${2 - selecaoComp.length} para comparar`;
        status.style.color = "#64748b";
        fab.classList.remove('visible');
    }
}

function abrirModalComparacao() {
    const mesA = historico.find(h => h.id === selecaoComp[0]);
    const mesB = historico.find(h => h.id === selecaoComp[1]);
    
    const modal = document.getElementById('modal-comparacao');
    if (modal) {
        modal.style.display = 'block';
        montarColuna('col-A', mesA);
        montarColuna('col-B', mesB);
    }
}

function montarColuna(colId, dados) {
    const col = document.getElementById(colId);
    if (!col) return;
    col.innerHTML = `
        <div class="col-header" style="text-align:center; padding-bottom:15px; border-bottom:1px solid #ddd; margin-bottom:15px;">
            <h4>${dados.mes}</h4>
            <h3 style="color:#4f46e5">${formatar(dados.total)}</h3>
        </div>
        <div class="col-list">
            ${dados.detalhes.map(i => `
                <div class="mini-card-item" style="background:#fff; padding:10px; border-radius:8px; margin-bottom:8px; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                    <strong>${i.nome}</strong>
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem;">
                        <span>${i.qtd}x</span>
                        <span>${formatar(i.total)}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function fecharModalComparacao() {
    document.getElementById('modal-comparacao').style.display = 'none';
    selecaoComp = [];
    renderHistorico();
}

function excluirMes(id) {
    if (confirm("Apagar este registro permanentemente?")) {
        historico = historico.filter(h => h.id !== id);
        localStorage.setItem('sm_hist', JSON.stringify(historico));
        renderHistorico();
    }
}

function limparTodoHistorico() {
    if (confirm("ALERTA: Isso apagará TODOS os meses salvos. Confirmar?")) {
        localStorage.removeItem('sm_hist');
        historico = [];
        renderHistorico();
    }
}