// Banco de Dados Local
let itens = JSON.parse(localStorage.getItem('SMART_ITENS')) || [];
let historico = JSON.parse(localStorage.getItem('SMART_HISTORY')) || [];
let orcamento = parseFloat(localStorage.getItem('SMART_BUDGET')) || 0;

// Formatador BRL
const BRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('budget-input').value = orcamento;
    renderLista();
});

// Navegação
function switchTab(tab) {
    document.querySelectorAll('.tab-content, .nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
    event.currentTarget.classList.add('active');
    if(tab === 'historico') renderHistorico();
    if(tab === 'dashboard') renderDashboard();
}

// Adicionar Item
document.getElementById('add-btn').addEventListener('click', () => {
    const nome = document.getElementById('nome').value;
    const categoria = document.getElementById('categoria').value;
    const preco = parseFloat(document.getElementById('preco').value) || 0;
    const qtd = parseFloat(document.getElementById('qtd').value) || 1;
    const unidade = document.getElementById('unidade').value;

    if (!nome) return alert("Digite o nome do produto!");

    itens.push({
        id: Date.now(),
        nome,
        categoria,
        preco,
        qtd,
        unidade,
        totalItem: preco * qtd,
        comprado: false
    });

    salvarESincronizar();
    document.getElementById('nome').value = '';
    document.getElementById('preco').value = '';
});

// Funções de Lista
function toggleComprado(id) {
    const item = itens.find(i => i.id === id);
    item.comprado = !item.comprado;
    salvarESincronizar();
}

function removerItem(id) {
    itens = itens.filter(i => i.id !== id);
    salvarESincronizar();
}

function salvarESincronizar() {
    localStorage.setItem('SMART_ITENS', JSON.stringify(itens));
    renderLista();
}

function renderLista() {
    const listaUl = document.getElementById('lista-ul');
    const busca = document.getElementById('search-input').value.toLowerCase();
    listaUl.innerHTML = '';
    
    let total = 0;
    let comprados = 0;

    const itensFiltrados = itens.filter(i => i.nome.toLowerCase().includes(busca));

    itensFiltrados.forEach(item => {
        total += item.totalItem;
        if(item.comprado) comprados++;

        const li = document.createElement('li');
        li.className = `item-card ${item.comprado ? 'checked' : ''}`;
        li.onclick = () => toggleComprado(item.id);
        li.innerHTML = `
            <div class="checkbox-custom">${item.comprado ? '<i class="fas fa-check"></i>' : ''}</div>
            <div class="item-info">
                <h4>${item.nome}</h4>
                <span>${item.categoria} • ${item.qtd}${item.unidade} x ${BRL(item.preco)}</span>
            </div>
            <div class="item-price">
                <strong>${BRL(item.totalItem)}</strong>
                <button onclick="event.stopPropagation(); removerItem(${item.id})" class="btn-del" style="color:var(--danger); border:none; margin-left:10px; background:none"><i class="fas fa-times"></i></button>
            </div>
        `;
        listaUl.appendChild(li);
    });

    // Atualiza Progresso e Total
    const pct = (comprados / (itens.length || 1)) * 100;
    document.getElementById('progress-bar').style.width = `${pct}%`;
    
    const totalEl = document.getElementById('total-geral');
    totalEl.innerText = BRL(total);
    totalEl.parentElement.classList.toggle('total-over', orcamento > 0 && total > orcamento);
}

// Histórico Mensal
function finalizarCompra() {
    if(itens.length === 0) return;
    
    const compra = {
        id: Date.now(),
        data: new Date().toLocaleDateString('pt-BR'),
        mesAno: new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
        total: itens.reduce((acc, i) => acc + i.totalItem, 0),
        qtdProdutos: itens.length,
        itens: [...itens]
    };

    historico.unshift(compra);
    localStorage.setItem('SMART_HISTORY', JSON.stringify(historico));
    itens = [];
    salvarESincronizar();
    alert("Compra salva no histórico!");
}

function renderHistorico() {
    const container = document.getElementById('historico-container');
    container.innerHTML = historico.length === 0 ? '<p style="text-align:center; padding:20px;">Nenhum histórico salvo.</p>' : '';

    historico.forEach((comp, idx) => {
        const div = document.createElement('div');
        div.className = 'history-card';
        div.innerHTML = `
            <div class="history-header">
                <span>${comp.data}</span>
                <button onclick="removerHistorico(${idx})" style="border:none; color:var(--danger); background:none"><i class="fas fa-trash"></i></button>
            </div>
            <div style="display:flex; justify-content:space-between">
                <div>
                    <strong>${comp.mesAno}</strong><br>
                    <small>${comp.qtdProdutos} produtos</small>
                </div>
                <h3 style="color:var(--primary)">${BRL(comp.total)}</h3>
            </div>
        `;
        container.appendChild(div);
    });
}

function removerHistorico(idx) {
    if(confirm("Deseja apagar este registro?")) {
        historico.splice(idx, 1);
        localStorage.setItem('SMART_HISTORY', JSON.stringify(historico));
        renderHistorico();
    }
}

// Dashboard (Comparativo e Métricas)
function renderDashboard() {
    const grid = document.getElementById('dash-grid');
    grid.innerHTML = '';

    const totalAtual = itens.reduce((acc, i) => acc + i.totalItem, 0);
    const totalUltimoMes = historico[0]?.total || 0;
    const diff = totalUltimoMes > 0 ? ((totalAtual - totalUltimoMes) / totalUltimoMes) * 100 : 0;

    const metrics = [
        { label: "Gasto Atual", value: BRL(totalAtual) },
        { label: "Variação Histórica", value: `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%` },
        { label: "Média Histórica", value: BRL(historico.reduce((acc, h) => acc + h.total, 0) / (historico.length || 1)) },
        { label: "Maior Compra", value: BRL(Math.max(0, ...historico.map(h => h.total))) },
        { label: "Total de Meses", value: historico.length },
        { label: "Itens no Carrinho", value: itens.filter(i => i.comprado).length },
        { label: "Budget Restante", value: BRL(orcamento - totalAtual) },
        { label: "Top Categoria", value: getTopCategory() }
    ];

    metrics.forEach(m => {
        grid.innerHTML += `<div class="dash-card"><small>${m.label}</small><br><strong>${m.value}</strong></div>`;
    });
}

function getTopCategory() {
    if(itens.length === 0) return "---";
    const counts = {};
    itens.forEach(i => counts[i.categoria] = (counts[i.categoria] || 0) + i.totalItem);
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

// Outras Funções
function saveBudget() {
    orcamento = parseFloat(document.getElementById('budget-input').value) || 0;
    localStorage.setItem('SMART_BUDGET', orcamento);
    renderLista();
}

function limparMarcados() {
    itens = itens.filter(i => !i.comprado);
    salvarESincronizar();
}

function exportarDados() {
    let relatorio = `RELATÓRIO DE COMPRAS - SMARTMARKET\n`;
    relatorio += `Total: ${BRL(itens.reduce((acc, i) => acc + i.totalItem, 0))}\n\n`;
    itens.forEach(i => {
        relatorio += `[${i.comprado ? 'X' : ' '}] ${i.nome} - ${i.qtd}${i.unidade} x ${BRL(i.preco)} = ${BRL(i.totalItem)}\n`;
    });
    
    const blob = new Blob([relatorio], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lista-compras-${new Date().toLocaleDateString()}.txt`;
    a.click();
}