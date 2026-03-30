// Gerenciamento de Sugestões e Ajustes
const sugestoesPadrao = ["Arroz", "Feijão", "Leite", "Café", "Açúcar", "Óleo", "Pão", "Detergente"];
let sugestoes = JSON.parse(localStorage.getItem('sm_sugestoes')) || sugestoesPadrao;

// Função para atualizar o datalist que fica na aba 'Lista'
function atualizarDatalistGlobal() {
    const dl = document.getElementById('sugestoes');
    if (dl) {
        dl.innerHTML = ''; // Limpa antes de preencher
        sugestoes.forEach(s => {
            const option = document.createElement('option');
            option.value = s;
            dl.appendChild(option);
        });
    }
}

function renderConfig() {
    const container = document.getElementById('aba-config');
    if (!container) return;

    container.innerHTML = `
        <div class="card">
            <h3><i class="fas fa-magic"></i> Sugestões de Compra</h3>
            <p style="font-size:0.8rem; color:#666; margin-bottom:10px;">Itens que aparecem ao digitar o nome do produto.</p>
            <div class="input-row">
                <input type="text" id="nova-sugestao" placeholder="Ex: Manteiga">
                <button onclick="addSugestao()" class="btn-dash" style="background:var(--primary); color:white">+</button>
            </div>
            <ul class="config-list" id="lista-sugestoes-config" style="margin-top:15px; list-style:none;"></ul>
        </div>

        <div class="card">
            <h3><i class="fas fa-sliders-h"></i> Sistema</h3>
            <div class="config-group-row" style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                <span>Modo Escuro</span>
                <button onclick="toggleDarkMode()" class="btn-dash">Alternar</button>
            </div>
            <div class="config-group-row" style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                <span>Limpar Tudo</span>
                <button onclick="resetApp()" class="btn-finish" style="background:var(--danger)">Reset Total</button>
            </div>
        </div>
    `;
    renderSugestoesListaInterna();
}

function renderSugestoesListaInterna() {
    const ul = document.getElementById('lista-sugestoes-config');
    if (!ul) return;
    
    ul.innerHTML = sugestoes.map((s, idx) => `
        <li style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #eee;">
            ${s} 
            <i class="fas fa-trash" onclick="removerSugestao(${idx})" style="color:var(--danger); cursor:pointer"></i>
        </li>
    `).join('');
    
    // Sempre que renderizar a lista interna, atualiza o datalist da home
    atualizarDatalistGlobal();
}

function addSugestao() {
    const input = document.getElementById('nova-sugestao');
    const val = input.value.trim();
    if (val) {
        sugestoes.push(val);
        localStorage.setItem('sm_sugestoes', JSON.stringify(sugestoes));
        input.value = '';
        renderSugestoesListaInterna();
    }
}

function removerSugestao(idx) {
    sugestoes.splice(idx, 1);
    localStorage.setItem('sm_sugestoes', JSON.stringify(sugestoes));
    renderSugestoesListaInterna();
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-theme');
}

function resetApp() {
    if (confirm("Isso apagará TODOS os seus itens e histórico. Confirmar?")) {
        localStorage.clear();
        location.reload();
    }
}