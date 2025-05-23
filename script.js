function carregarDados() {
  const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSosxgDZTlbK_m97ie4nepmGwc8i6B_EbE1SpvLqkhB2fsyZeYH3vYA-NjAr6n9ciydvS0PyKwmYKla/pub?gid=889291349&single=true&output=csv";

  fetch("https://api.allorigins.win/raw?url=" + encodeURIComponent(url))
    .then(response => response.text())
    .then(csv => {
      const resultado = Papa.parse(csv, {
        header: false,
        skipEmptyLines: true,
      });

      const linhas = resultado.data;
      const linha37 = linhas[36];

      if (!linha37 || !linha37.length) {
        console.error("❌ A linha 37 está vazia ou não existe. Verifique a estrutura da planilha.");
        return;
      }

      const linha5 = linhas[4];
      const linha6 = linhas[5];
      const linha8 = linhas[7];
      const linha9 = linhas[8];

      const container = document.querySelector(".tabela-container");
      container.innerHTML = "";

      criarTituloETabela("Tempo de Atendimento PP", ["TOTAL OS", "PRAZO", "VENCIDO", "TA %"],
        linha37.slice(1, 5), "indicador-table", container);

      criarTituloETabela("Reabertura PP", ["REAB PP", "PPS EXE", "PP %"],
        linha37.slice(5, 8), "indicador-table-reab-pp", container);

      criarTituloETabela("Tempo de Atendimento AC", ["TOTAL OS", "PRAZO", "VENCIDO", "TA %"],
        linha37.slice(8, 12), "indicador-table-ac", container);

      criarTituloETabela("Reabertura AC", ["REAB AC", "ATS EXE", "AT %"],
        linha37.slice(12, 15), "indicador-table-reab-ac", container);

      // ✅ Mover chamada após criação das tabelas principais
      adicionarTabelaAteOntem(linhas);

      const tabelaFaltaPara = document.getElementById("FaltaPara");
      tabelaFaltaPara.innerHTML = "";
 
      const cabecalho = document.createElement("tr");
      ["CATEGORIA", "FALTA", "PARA"].forEach(titulo => {
        const th = document.createElement("th");
        th.textContent = titulo;
        cabecalho.appendChild(th);
      });
      tabelaFaltaPara.appendChild(cabecalho);

      [linha5, linha6, linha8, linha9].forEach(linha => {
        const tr = document.createElement("tr");
        linha.slice(16, 19).forEach(valor => {
          const td = document.createElement("td");
          td.textContent = valor;
          tr.appendChild(td);
        });
        tabelaFaltaPara.appendChild(tr);
      });
    })
    .catch(err => {
      console.error("Erro ao carregar os dados:", err);
    });
}

// Função para adicionar mini tabelas "Até Ontem"
function adicionarTabelaAteOntem(linhas) {
  const hoje = new Date();
  const diaAtual = hoje.getDate();
  const diaOntem = diaAtual - 1;

  const linhaOntem = linhas.find(l => parseInt(l[0]) === diaOntem);
  if (!linhaOntem) return;

  const tabelas = [
    { id: "indicador-table", titulo: "Até Ontem - Tempo de Atendimento PP", indice: 4 },
    { id: "indicador-table-reab-pp", titulo: "Até Ontem - Reabertura PP", indice: 7 },
    { id: "indicador-table-ac", titulo: "Até Ontem - Tempo de Atendimento AC", indice: 11 },
    { id: "indicador-table-reab-ac", titulo: "Até Ontem - Reabertura AC", indice: 14 },
  ];

  tabelas.forEach(t => {
    const tabelaPrincipal = document.getElementById(t.id);
    if (!tabelaPrincipal) return;

    const container = tabelaPrincipal.parentElement;

    const titulo = document.createElement("h4");
    titulo.textContent = t.titulo;

    const tabela = document.createElement("table");
    tabela.classList.add("mini-tabela-ate-ontem");

    const cabecalho = document.createElement("tr");
    ["Dia", "Indicador"].forEach(txt => {
      const th = document.createElement("th");
      th.textContent = txt;
      cabecalho.appendChild(th);
    });
    tabela.appendChild(cabecalho);

    const linha = document.createElement("tr");

    const tdDia = document.createElement("td");
    tdDia.textContent = linhaOntem[0];
    linha.appendChild(tdDia);

    const tdValor = document.createElement("td");
    const valor = linhaOntem[t.indice] || "-";
    tdValor.textContent = valor;

    // Aplica a cor de fundo se for percentual
    if (typeof valor === "string" && valor.includes('%')) {
      const num = parseFloat(valor.replace('%', '').replace(',', '.'));

      if (!isNaN(num)) {
        switch (t.id) {
          case "indicador-table":
          case "indicador-table-ac":
            tdValor.style.backgroundColor = num >= 75.00 ? "lightgreen" : "lightcoral";
            break;
          case "indicador-table-reab-pp":
            tdValor.style.backgroundColor = num <= 1.99 ? "lightgreen" : "lightcoral";
            break;
          case "indicador-table-reab-ac":
            tdValor.style.backgroundColor = num <= 3.49 ? "lightgreen" : "lightcoral";
            break;
        }
      }
    }

    linha.appendChild(tdValor);
    tabela.appendChild(linha);

    container.insertBefore(titulo, tabelaPrincipal.nextSibling);
    container.insertBefore(tabela, titulo.nextSibling);
  });
}

// Carrega os dados ao carregar a página
window.addEventListener("DOMContentLoaded", carregarDados);

document.getElementById("botao-atualizar").addEventListener("click", carregarDados);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .then(reg => console.log("✅ Service Worker registrado:", reg.scope))
      .catch(err => console.error("❌ Falha no registro do Service Worker:", err));
  });
}

// Função para criar título e tabela
function criarTituloETabela(tituloTexto, titulos, dados, tabelaId, container) {
  const titulo = document.createElement("h2");
  titulo.textContent = tituloTexto;
  container.appendChild(titulo);

  const tabela = document.createElement("table");
  tabela.id = tabelaId;

  const cabecalho = document.createElement("tr");
  titulos.forEach(titulo => {
    const th = document.createElement("th");
    th.textContent = titulo;
    cabecalho.appendChild(th);
  });
  tabela.appendChild(cabecalho);

  const linhaDados = document.createElement("tr");
  dados.forEach((valor, i) => {
    const td = document.createElement("td");
    td.textContent = valor;

    // Verifica se o valor é uma porcentagem e aplica a cor de fundo
    if (typeof valor === "string" && valor.includes('%')) {
      const num = parseFloat(valor.replace('%', '').replace(',', '.'));
      td.classList.add("porcentagem");

      if (!isNaN(num)) {
        switch (tabelaId) {
          case "indicador-table":
          case "indicador-table-ac":
            td.style.backgroundColor = num >= 75.00 ? "lightgreen" : "lightcoral";
            break;
          case "indicador-table-reab-pp":
            td.style.backgroundColor = num <= 1.99 ? "lightgreen" : "lightcoral";
            break;
          case "indicador-table-reab-ac":
            td.style.backgroundColor = num <= 3.49 ? "lightgreen" : "lightcoral";
            break;
        }
      }
    }

    linhaDados.appendChild(td);
  });

  tabela.appendChild(linhaDados);
  container.appendChild(tabela);
}

// Função para abrir e fechar o menu hamburguer
const menu = document.getElementById('menu');
const menuButton = document.getElementById('menu-button');
const closeButton = document.getElementById('close-menu');

menuButton.addEventListener('click', () => {
  menu.classList.toggle('open');
});

closeButton.addEventListener('click', () => {
  menu.classList.remove('open');
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").then(reg => {
    console.log("✅ Service Worker registrado:", reg.scope);

    if (reg.waiting) {
      showUpdateNotification(reg.waiting);
    }

    reg.addEventListener("updatefound", () => {
      const newWorker = reg.installing;
      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          showUpdateNotification(newWorker);
        }
      });
    });
  });
}

function showUpdateNotification(worker) {
  const notification = document.getElementById("update-notification");
  notification.style.display = "block";
  notification.addEventListener("click", () => {
    worker.postMessage({ action: "skipWaiting" });
  });
}

navigator.serviceWorker.addEventListener("controllerchange", () => {
  window.location.reload();
});

/* Mini tabelas "Até Ontem" */
const estiloMiniTabela = document.createElement("style");

document.head.appendChild(estiloMiniTabela);
