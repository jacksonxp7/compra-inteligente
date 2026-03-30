// Variáveis de estado
let itens = JSON.parse(localStorage.getItem('sm_itens')) || [];
let historico = JSON.parse(localStorage.getItem('sm_hist')) || [];

const formatar = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Alternar entre abas
window.switchTab = function(tab, event) {
    // Esconder todas as abas
    document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar a aba alvo
    const targetSection = document.getElementById(`aba-${tab}`);
    if (targetSection) targetSection.classList.add('active');

    // Estilizar o botão clicado
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event) {
        event.currentTarget.classList.add('active');
    }

    // Se for a aba de config, renderiza os itens
    if (tab === 'config') {
        renderConfig();
    }
};

// Adicionar Item à lista
document.getElementById('btn-adicionar')?.addEventListener('click', () => {
    const nomeInput = document.getElementById('nome-item');
    const precoInput = document.getElementById('preco-item');
    const qtdInput = document.getElementById('qtd-item');
    const catInput = document.getElementById('categoria-item');

    const nome = nomeInput.value;
    const cat = catInput.value;
    const preco = parseFloat(precoInput.value) || 0;
    const qtd = parseInt(qtdInput.value) || 1;

    if (!nome) {
        alert("Por favor, digite o nome do produto.");
        return;
    }

    itens.push({ 
        id: Date.now(), 
        nome, 
        cat, 
        preco, 
        qtd, 
        total: preco * qtd 
    });

    saveAndRender();
    
    // Limpar campos
    nomeInput.value = '';
    precoInput.value = '';
    qtdInput.value = '1';
    nomeInput.focus();
});

function saveAndRender() {
    localStorage.setItem('sm_itens', JSON.stringify(itens));
    renderLista();
}

function renderLista() {
    const render = document.getElementById('lista-render');
    if (!render) return;
    render.innerHTML = '';
    let totalGeral = 0;

    if (itens.length === 0) {
        render.innerHTML = '<div style="text-align:center; padding:40px; color:#94a3b8;">Sua lista está vazia.</div>';
    } else {
        itens.forEach(i => {
            totalGeral += i.total;
            render.innerHTML += `
                <div class="item-card">
                    <div class="item-info">
                        <h4>${i.nome}</h4>
                        <span>${i.cat} • ${i.qtd}x ${formatar(i.preco)}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px">
                        <strong>${formatar(i.total)}</strong>
                        <button onclick="removerItem(${i.id})" style="background:none; border:none; color:var(--danger); padding:5px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>`;
        });
    }
    
    const totalElem = document.getElementById('total-geral');
    if (totalElem) totalElem.innerText = formatar(totalGeral);
}

function removerItem(id) {
    itens = itens.filter(i => i.id !== id);
    saveAndRender();
}

function finalizarCompra() {
    if (itens.length === 0) {
        alert("Não há itens para finalizar.");
        return;
    }
    
    const compra = {
        id: Date.now(),
        data: new Date().toLocaleDateString('pt-BR'),
        mes: new Date().toLocaleString('pt-BR', { month: 'long' }),
        total: itens.reduce((acc, i) => acc + i.total, 0),
        qtd: itens.length,
        detalhes: [...itens]
    };

    historico.push(compra);
    localStorage.setItem('sm_hist', JSON.stringify(historico));
    
    itens = [];
    saveAndRender();
    alert("Mês finalizado com sucesso! Veja no histórico.");
}

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    renderLista();
    atualizarDatalistGlobal(); // <--- CHAVE PARA AS SUGESTÕES FUNCIONAREM
});