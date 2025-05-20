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

      const linha5 = linhas[4];
      const linha6 = linhas[5];
      const linha8 = linhas[7];
      const linha9 = linhas[8];

      const container = document.querySelector(".tabela-container");
      container.innerHTML = "";

      criarTituloETabela("Tempo de Atendimento PP", ["TOTAL OS", "PRAZO", "VENCIDO", "AF %"],
        linha37.slice(1, 5), "indicador-table", container);

      criarTituloETabela("Reabertura PP", ["REAB PP", "PPS EXE", "PP %"],
        linha37.slice(5, 8), "indicador-table-reab-pp", container);

      criarTituloETabela("Tempo de Atendimento AC", ["TOTAL OS", "PRAZO", "VENCIDO", "AF %"],
        linha37.slice(8, 12), "indicador-table-ac", container);

      criarTituloETabela("Reabertura AC", ["REAB AC", "ATS EXE", "AT %"],
        linha37.slice(12, 15), "indicador-table-reab-ac", container);

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

// Chama a função automaticamente ao carregar a página
window.addEventListener("DOMContentLoaded", carregarDados);

// Também permite que o botão continue funcionando
document.getElementById("botao-atualizar").addEventListener("click", carregarDados);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .then(reg => console.log("✅ Service Worker registrado:", reg.scope))
      .catch(err => console.error("❌ Falha no registro do Service Worker:", err));
  });
}

    function criarTituloETabela(tituloTexto, titulos, dados, tabelaId, container) {
      const titulo = document.createElement("h2");
      titulo.textContent = tituloTexto;
      container.appendChild(titulo);

      const tabela = document.createElement("table");
      tabela.id = tabelaId;

      // Cabeçalho
      const cabecalho = document.createElement("tr");
      titulos.forEach(titulo => {
        const th = document.createElement("th");
        th.textContent = titulo;
        cabecalho.appendChild(th);
      });
      tabela.appendChild(cabecalho);

      // Linha de dados
      const linhaDados = document.createElement("tr");
      dados.forEach((valor, i) => {
        const td = document.createElement("td");
        td.textContent = valor;

        if (typeof valor === "string" && valor.includes('%')) {
          const num = parseFloat(valor.replace('%', '').replace(',', '.'));
          td.classList.add("porcentagem");

          if (!isNaN(num)) {
            // Regras de coloração por tabela
            switch (tabelaId) {
              case "indicador-table": // Tempo de Atendimento PP
              case "indicador-table-ac": // Tempo de Atendimento AC
                if (num >= 75.00) td.style.backgroundColor = "lightgreen";
                else td.style.backgroundColor = "lightcoral";
                break;

              case "indicador-table-reab-pp": // Reabertura PP
                if (num <= 1.99) td.style.backgroundColor = "lightgreen";
                else td.style.backgroundColor = "lightcoral";
                break;

              case "indicador-table-reab-ac": // Reabertura AC
                if (num <= 3.49) td.style.backgroundColor = "lightgreen";
                else td.style.backgroundColor = "lightcoral";
                break;
            }
          }
        }

        linhaDados.appendChild(td);
      });

      tabela.appendChild(linhaDados);
      container.appendChild(tabela);
    }

// Menu hambúrguer
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

    // Verifica por novas versões do Service Worker
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

// Força a recarga quando o novo SW tomar controle
navigator.serviceWorker.addEventListener("controllerchange", () => {
  window.location.reload();
});
