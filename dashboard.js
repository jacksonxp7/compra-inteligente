// Carregar dados para o Dashboard
let historico = JSON.parse(localStorage.getItem('sm_hist')) || [];
let itensAtuais = JSON.parse(localStorage.getItem('sm_itens')) || [];

const formatar = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

window.onload = () => {
    renderDashboard();
};

function renderDashboard() {
    const grid = document.getElementById('dash-render');
    if (!grid) return;

    // --- CÁLCULOS DE BASE ---
    const totalAtual = itensAtuais.reduce((acc, i) => acc + i.total, 0);
    const totalGeralHist = historico.reduce((acc, h) => acc + h.total, 0);
    const qtdMeses = historico.length || 1;
    const mediaMensal = totalGeralHist / qtdMeses;
    
    // Volume de itens (Soma das quantidades)
    const volAtual = itensAtuais.reduce((acc, i) => acc + (i.qtd || 1), 0);
    const volHist = historico.reduce((acc, h) => acc + (h.qtd || 0), 0);

    // Itens mais caro e mais barato da lista atual
    const precosAtuais = itensAtuais.map(i => i.preco).filter(p => p > 0);
    const maisCaro = precosAtuais.length ? Math.max(...precosAtuais) : 0;
    const maisBarato = precosAtuais.length ? Math.min(...precosAtuais) : 0;

    // Recordes Históricos
    const totaisMeses = historico.map(h => h.total);
    const recordeGasto = totaisMeses.length ? Math.max(...totaisMeses) : 0;

    // --- CONSTRUÇÃO DO ARRAY DE MÉTRICAS ---
    let metrics = [
        // BLOCO 1: FINANCEIRO GERAL
        { t: "Gasto Lista Atual", v: formatar(totalAtual), i: "💰", c: "highlight" },
        { t: "Média Mensal (Histórico)", v: formatar(mediaMensal), i: "📊", c: "" },
        { t: "Total Acumulado", v: formatar(totalGeralHist), i: "🏦", c: "" },
        { t: "Ticket Médio p/ Mês", v: formatar(totalGeralHist / qtdMeses), i: "🎫", c: "" },

        // BLOCO 2: VOLUME E QUANTIDADE
        { t: "Produtos na Lista", v: itensAtuais.length + " tipos", i: "📦", c: "" },
        { t: "Volume Total Itens", v: volAtual + " unid.", i: "🔢", c: "" },
        { t: "Média Itens p/ Mês", v: Math.round(volHist / qtdMeses) + " unid.", i: "🛒", c: "" },
        { t: "Total Itens Comprados", v: volHist, i: "🏭", c: "" },

        // BLOCO 3: PROJEÇÕES INTELIGENTES
        { t: "Projeção Trimestral", v: formatar(mediaMensal * 3), i: "📅", c: "" },
        { t: "Gasto Anual Estimado", v: formatar(mediaMensal * 12), i: "📈", c: "" },
        { t: "Reserva Emergencial (15%)", v: formatar(mediaMensal * 0.15), i: "🛡️", c: "" },
        { t: "Inflação Estimada (Lista)", v: formatar(totalAtual * 0.045), i: "💸", c: "" },

        // BLOCO 4: EXTREMOS DA LISTA ATUAL
        { t: "Item Mais Caro Atual", v: formatar(maisCaro), i: "🔝", c: "" },
        { t: "Item Mais Barato Atual", v: formatar(maisBarato), i: "🔅", c: "" },
        { t: "Preço Médio p/ Produto", v: formatar(totalAtual / (itensAtuais.length || 1)), i: "⚖️", c: "" },
        { t: "Recorde de Gasto Mensal", v: formatar(recordeGasto), i: "🏆", c: "" }
    ];

    // BLOCO 5: ANÁLISE POR CATEGORIA (Dinâmico + Percentuais)
    const categorias = ["Alimentos", "Limpeza", "Higiene", "Pet", "Bebidas", "Frios", "Outros"];
    categorias.forEach(cat => {
        const itensCat = itensAtuais.filter(i => i.cat === cat);
        const somaCat = itensCat.reduce((acc, i) => acc + i.total, 0);
        
        if(somaCat > 0) {
            const perc = ((somaCat / totalAtual) * 100).toFixed(1);
            metrics.push({ t: `Gasto: ${cat}`, v: formatar(somaCat), i: "🏷️", c: "" });
            metrics.push({ t: `% do Orçamento: ${cat}`, v: perc + "%", i: "🎯", c: "" });
        }
    });

    // BLOCO 6: COMPARATIVO E STATUS
    const diffMedia = totalAtual - mediaMensal;
    const statusCor = diffMedia > 0 ? "⚠️" : "✅";
    metrics.push({ 
        t: "Vs. Média Mensal", 
        v: (diffMedia > 0 ? "+" : "") + formatar(diffMedia), 
        i: statusCor, 
        c: "" 
    });

    metrics.push({ 
        t: "Economia se poupar 10%", 
        v: formatar(totalAtual * 0.1), 
        i: "💡", 
        c: "" 
    });

    // BLOCO 7: ÚLTIMOS MESES (Histórico Rápido)
    historico.slice(-3).forEach(mes => {
        metrics.push({ t: `Total em ${mes.mes}`, v: formatar(mes.total), i: "🗓️", c: "" });
    });

    // RENDERIZAÇÃO FINAL
    grid.innerHTML = metrics.map(m => `
        <div class="metric-card ${m.c}">
            <i>${m.i}</i>
            <span>${m.t}</span>
            <h3>${m.v}</h3>
        </div>
    `).join('');
}