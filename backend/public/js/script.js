/**
 * =========================================================================
 * MINI SISTEMA — GERENCIAMENTO DE APARELHOS APPLE (FRONTEND)
 * =========================================================================
 *
 * ⚠️ CONFIGURAÇÃO CENTRALIZADA DA URL DA API:
 *
 * - Para desenvolvimento LOCAL:
 *   const API_URL = "http://localhost:3000";
 *
 * - Para PRODUÇÃO NA VERCEL:
 *   Substitua a URL abaixo pelo domínio fornecido pela Vercel após o deploy:
 *   const API_URL = "https://seu-projeto.vercel.app";
 *
 * Não espalhe URLs em outras partes do código.
 * =========================================================================
 */
// Detecção inteligente: se estiver rodando na nuvem (Vercel), utiliza o próprio domínio; se local (file:// ou dev), usa http://localhost:3000
const API_URL = (typeof window !== "undefined" && window.location.protocol.startsWith("http") && !window.location.origin.includes(":5500"))
  ? window.location.origin
  : "http://localhost:3000";

// Estado local da aplicação
let aparelhosCache = [];
let aparelhoParaExcluirId = null;

// Elementos do DOM
const gridAparelhos = document.getElementById("grid-aparelhos");
const estadoCarregando = document.getElementById("estado-carregando");
const estadoVazio = document.getElementById("estado-vazio");
const alertaErro = document.getElementById("alerta-erro");
const alertaErroMensagem = document.getElementById("alerta-erro-mensagem");
const btnRecarregar = document.getElementById("btn-recarregar");

const statTotalAparelhos = document.getElementById("stat-total-aparelhos");
const statValorTotal = document.getElementById("stat-valor-total");
const filtroBusca = document.getElementById("filtro-busca");

const apiStatusBadge = document.getElementById("api-status-badge");
const apiStatusText = document.getElementById("api-status-text");

// Modais
const modalCadastro = document.getElementById("modal-cadastro");
const formCadastro = document.getElementById("form-cadastro");
const btnAbrirCadastro = document.getElementById("btn-abrir-cadastro");
const btnVazioCadastrar = document.getElementById("btn-vazio-cadastrar");
const cadFoto = document.getElementById("cad-foto");
const previewContainerCad = document.getElementById("preview-container-cad");
const imgPreviewCad = document.getElementById("img-preview-cad");

const modalEdicao = document.getElementById("modal-edicao");
const formEdicao = document.getElementById("form-edicao");
const editId = document.getElementById("edit-id");
const editModelo = document.getElementById("edit-modelo");
const editPreco = document.getElementById("edit-preco");
const editFoto = document.getElementById("edit-foto");
const previewContainerEdit = document.getElementById("preview-container-edit");
const imgPreviewEdit = document.getElementById("img-preview-edit");

const modalExclusao = document.getElementById("modal-exclusao");
const excluirNomeModelo = document.getElementById("excluir-nome-modelo");
const btnConfirmarExclusao = document.getElementById("btn-confirmar-exclusao");

const toastContainer = document.getElementById("toast-container");

// Imagem SVG de fallback para produtos Apple caso a URL da imagem falhe
const IMAGEM_FALLBACK = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='220' viewBox='0 0 300 220' fill='%23f5f5f7'%3E%3Crect width='300' height='220' fill='%23f5f5f7'/%3E%3Cg transform='translate(138, 70) scale(1)'%3E%3Cpath d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.78 1.06-1.85.94-2.93-.93.04-2.03.63-2.69 1.4-.58.68-1.1 1.77-.96 2.82 1.03.08 2.08-.51 2.71-1.29z' fill='%2386868b'/%3E%3C/g%3E%3Ctext x='150' y='145' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%2386868b'%3EImagem Indispon%C3%ADvel%3C/text%3E%3C/svg%3E";

/**
 * =========================================================================
 * INICIALIZAÇÃO
 * =========================================================================
 */
document.addEventListener("DOMContentLoaded", () => {
  verificarStatusApi();
  carregarAparelhos();
  configurarEventos();
});

/**
 * =========================================================================
 * COMUNICAÇÃO COM A API (FETCH)
 * =========================================================================
 */

// Verifica se a API está online (Health Check)
async function verificarStatusApi() {
  try {
    apiStatusBadge.className = "status-badge checking";
    apiStatusText.textContent = "Verificando...";

    const res = await fetch(`${API_URL}/api`, { method: "GET" });
    if (res.ok) {
      apiStatusBadge.className = "status-badge online";
      apiStatusText.textContent = "API Online";
    } else {
      definirApiOffline();
    }
  } catch (error) {
    definirApiOffline();
  }
}

function definirApiOffline() {
  apiStatusBadge.className = "status-badge offline";
  apiStatusText.textContent = "API Desconectada";
}

// Carrega todos os aparelhos
async function carregarAparelhos() {
  exibirEstado("carregando");
  esconderAlertaErro();

  try {
    const res = await fetch(`${API_URL}/api/aparelhos`);

    if (!res.ok) {
      const dadosErro = await res.json().catch(() => ({}));
      throw new Error(dadosErro.mensagem || `Erro ${res.status}: Não foi possível carregar os aparelhos.`);
    }

    const aparelhos = await res.json();
    aparelhosCache = Array.isArray(aparelhos) ? aparelhos : [];

    atualizarEstatisticas(aparelhosCache);

    if (aparelhosCache.length === 0) {
      exibirEstado("vazio");
    } else {
      renderizarCards(aparelhosCache);
      exibirEstado("conteudo");
    }

    apiStatusBadge.className = "status-badge online";
    apiStatusText.textContent = "API Online";
  } catch (error) {
    console.error("Erro ao carregar aparelhos:", error);
    exibirAlertaErro(
      "Não foi possível se comunicar com a API.",
      `Verifique se o backend está em execução no endereço "${API_URL}". Detalhes: ${error.message}`
    );
    exibirEstado("erro");
    definirApiOffline();
  }
}

// Cadastrar novo aparelho
async function cadastrarAparelho(evento) {
  evento.preventDefault();
  limparErrosFormulario("cad");

  const modelo = document.getElementById("cad-modelo").value.trim();
  const preco = parseFloat(document.getElementById("cad-preco").value);
  const foto = document.getElementById("cad-foto").value.trim();

  // Validações no cliente
  let temErro = false;
  if (!modelo || modelo.length < 2) {
    mostrarErroCampo("erro-cad-modelo", "Informe o modelo com no mínimo 2 caracteres.");
    temErro = true;
  }
  if (isNaN(preco) || preco <= 0) {
    mostrarErroCampo("erro-cad-preco", "Informe um preço positivo válido.");
    temErro = true;
  }
  if (!foto || !/^https?:\/\//i.test(foto)) {
    mostrarErroCampo("erro-cad-foto", "Informe uma URL válida iniciada em http:// ou https://.");
    temErro = true;
  }

  if (temErro) return;

  const btnSubmit = document.getElementById("btn-submit-cadastro");
  alternarCarregamentoBotao(btnSubmit, true);

  try {
    const res = await fetch(`${API_URL}/api/aparelhos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        marca: "Apple",
        modelo,
        preco,
        foto,
      }),
    });

    const resposta = await res.json();

    if (!res.ok) {
      throw new Error(resposta.mensagem || "Falha ao cadastrar aparelho.");
    }

    fecharModal(modalCadastro);
    formCadastro.reset();
    previewContainerCad.classList.add("hidden");
    mostrarToast("Aparelho Apple cadastrado com sucesso!", "sucesso");
    carregarAparelhos();
  } catch (error) {
    mostrarToast(error.message, "erro");
  } finally {
    alternarCarregamentoBotao(btnSubmit, false);
  }
}

// Salvar edição de aparelho
async function salvarEdicao(evento) {
  evento.preventDefault();
  limparErrosFormulario("edit");

  const id = editId.value;
  const modelo = editModelo.value.trim();
  const preco = parseFloat(editPreco.value);
  const foto = editFoto.value.trim();

  let temErro = false;
  if (!modelo || modelo.length < 2) {
    mostrarErroCampo("erro-edit-modelo", "Informe o modelo com no mínimo 2 caracteres.");
    temErro = true;
  }
  if (isNaN(preco) || preco <= 0) {
    mostrarErroCampo("erro-edit-preco", "Informe um preço positivo válido.");
    temErro = true;
  }
  if (!foto || !/^https?:\/\//i.test(foto)) {
    mostrarErroCampo("erro-edit-foto", "Informe uma URL válida iniciada em http:// ou https://.");
    temErro = true;
  }

  if (temErro) return;

  const btnSubmit = document.getElementById("btn-submit-edicao");
  alternarCarregamentoBotao(btnSubmit, true);

  try {
    const res = await fetch(`${API_URL}/api/aparelhos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        marca: "Apple",
        modelo,
        preco,
        foto,
      }),
    });

    const resposta = await res.json();

    if (!res.ok) {
      throw new Error(resposta.mensagem || "Falha ao atualizar aparelho.");
    }

    fecharModal(modalEdicao);
    mostrarToast("Aparelho atualizado com sucesso!", "sucesso");
    carregarAparelhos();
  } catch (error) {
    mostrarToast(error.message, "erro");
  } finally {
    alternarCarregamentoBotao(btnSubmit, false);
  }
}

// Executar exclusão de aparelho
async function executarExclusao() {
  if (!aparelhoParaExcluirId) return;

  alternarCarregamentoBotao(btnConfirmarExclusao, true);

  try {
    const res = await fetch(`${API_URL}/api/aparelhos/${aparelhoParaExcluirId}`, {
      method: "DELETE",
    });

    const resposta = await res.json();

    if (!res.ok) {
      throw new Error(resposta.mensagem || "Falha ao excluir aparelho.");
    }

    fecharModal(modalExclusao);
    mostrarToast("Aparelho excluído com sucesso!", "sucesso");
    aparelhoParaExcluirId = null;
    carregarAparelhos();
  } catch (error) {
    mostrarToast(error.message, "erro");
  } finally {
    alternarCarregamentoBotao(btnConfirmarExclusao, false);
  }
}

/**
 * =========================================================================
 * RENDERIZAÇÃO DE INTERFACE
 * =========================================================================
 */

// Renderiza os cards de aparelhos
function renderizarCards(aparelhos) {
  gridAparelhos.innerHTML = "";

  if (aparelhos.length === 0) {
    gridAparelhos.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--color-text-muted);">
        Nenhum modelo corresponde à pesquisa informada.
      </div>
    `;
    return;
  }

  aparelhos.forEach((aparelho) => {
    const card = document.createElement("article");
    card.className = "apple-card";
    card.setAttribute("data-id", aparelho._id);

    // Formatação do preço em Real Brasileiro
    const precoFormatado = formatarMoeda(aparelho.preco);

    card.innerHTML = `
      <div class="card-image-box">
        <img
          src="${sanitizar(aparelho.foto)}"
          alt="${sanitizar(aparelho.modelo)}"
          class="card-image"
          loading="lazy"
          onerror="tratarErroImagem(this)"
        />
      </div>
      <div class="card-body">
        <span class="card-brand">${sanitizar(aparelho.marca || "Apple")}</span>
        <h2 class="card-model">${sanitizar(aparelho.modelo)}</h2>
        <div class="card-price-row">
          <span class="card-price-label">Preço à vista</span>
          <span class="card-price">${precoFormatado}</span>
        </div>
      </div>
      <div class="card-actions">
        <button class="btn btn-card btn-editar" data-id="${aparelho._id}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Editar
        </button>
        <button class="btn btn-card btn-card-danger btn-excluir" data-id="${aparelho._id}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Excluir
        </button>
      </div>
    `;

    // Eventos de clique dos botões de ação do card
    const btnEditar = card.querySelector(".btn-editar");
    btnEditar.addEventListener("click", () => abrirModalEdicao(aparelho));

    const btnExcluir = card.querySelector(".btn-excluir");
    btnExcluir.addEventListener("click", () => abrirModalExclusao(aparelho));

    gridAparelhos.appendChild(card);
  });
}

// Fallback visual caso a imagem não carregue
window.tratarErroImagem = function (imgElement) {
  imgElement.onerror = null; // evita loop infinito
  imgElement.src = IMAGEM_FALLBACK;
  imgElement.alt = "Imagem não disponível";
};

// Formatação monetária (Real Brasileiro)
function formatarMoeda(valor) {
  const num = typeof valor === "number" ? valor : parseFloat(valor);
  if (isNaN(num)) return "R$ 0,00";
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Atualiza contadores e estatísticas do catálogo
function atualizarEstatisticas(lista) {
  statTotalAparelhos.textContent = lista.length;
  const valorTotal = lista.reduce((acc, item) => acc + (Number(item.preco) || 0), 0);
  statValorTotal.textContent = formatarMoeda(valorTotal);
}

// Controle de exibição dos estados
function exibirEstado(estado) {
  estadoCarregando.classList.add("hidden");
  estadoVazio.classList.add("hidden");
  gridAparelhos.classList.add("hidden");

  if (estado === "carregando") {
    estadoCarregando.classList.remove("hidden");
  } else if (estado === "vazio") {
    estadoVazio.classList.remove("hidden");
  } else if (estado === "conteudo") {
    gridAparelhos.classList.remove("hidden");
  }
}

function exibirAlertaErro(titulo, mensagem) {
  document.getElementById("alerta-erro-titulo").textContent = titulo;
  alertaErroMensagem.textContent = mensagem;
  alertaErro.classList.remove("hidden");
}

function esconderAlertaErro() {
  alertaErro.classList.add("hidden");
}

/**
 * =========================================================================
 * MODAIS E FORMULÁRIOS
 * =========================================================================
 */

function abrirModal(modal) {
  modal.classList.remove("hidden");
  const primeiroInput = modal.querySelector("input:not([readonly])");
  if (primeiroInput) primeiroInput.focus();
}

function fecharModal(modal) {
  modal.classList.add("hidden");
}

function abrirModalEdicao(aparelho) {
  editId.value = aparelho._id;
  editModelo.value = aparelho.modelo;
  editPreco.value = aparelho.preco;
  editFoto.value = aparelho.foto;
  imgPreviewEdit.src = aparelho.foto;
  limparErrosFormulario("edit");
  abrirModal(modalEdicao);
}

function abrirModalExclusao(aparelho) {
  aparelhoParaExcluirId = aparelho._id;
  excluirNomeModelo.textContent = `${aparelho.modelo} (${formatarMoeda(aparelho.preco)})`;
  abrirModal(modalExclusao);
}

function mostrarErroCampo(elementId, mensagem) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = mensagem;
}

function limparErrosFormulario(prefixo) {
  document.querySelectorAll(`[id^="erro-${prefixo}-"]`).forEach((el) => (el.textContent = ""));
}

function alternarCarregamentoBotao(botao, carregando) {
  const texto = botao.querySelector(".btn-text");
  const spinner = botao.querySelector(".btn-spinner");
  botao.disabled = carregando;

  if (carregando) {
    if (texto) texto.classList.add("hidden");
    if (spinner) spinner.classList.remove("hidden");
  } else {
    if (texto) texto.classList.remove("hidden");
    if (spinner) spinner.classList.add("hidden");
  }
}

// Sanitização básica contra XSS
function sanitizar(str) {
  if (typeof str !== "string") return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Notificações Toast
function mostrarToast(mensagem, tipo = "sucesso") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${tipo === "sucesso" ? "success" : "error"}`;
  toast.textContent = mensagem;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * =========================================================================
 * CONFIGURAÇÃO DE EVENTOS
 * =========================================================================
 */
function configurarEventos() {
  // Abrir modal de cadastro
  btnAbrirCadastro.addEventListener("click", () => {
    limparErrosFormulario("cad");
    formCadastro.reset();
    previewContainerCad.classList.add("hidden");
    abrirModal(modalCadastro);
  });

  btnVazioCadastrar.addEventListener("click", () => {
    btnAbrirCadastro.click();
  });

  // Fechar modais ao clicar no botão 'x' ou botões com data-modal
  document.querySelectorAll("[data-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-modal");
      const modal = document.getElementById(modalId);
      if (modal) fecharModal(modal);
    });
  });

  // Fechar modal clicando fora dele (no overlay)
  [modalCadastro, modalEdicao, modalExclusao].forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) fecharModal(modal);
    });
  });

  // Fechar com a tecla ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      fecharModal(modalCadastro);
      fecharModal(modalEdicao);
      fecharModal(modalExclusao);
    }
  });

  // Submissão dos formulários
  formCadastro.addEventListener("submit", cadastrarAparelho);
  formEdicao.addEventListener("submit", salvarEdicao);
  btnConfirmarExclusao.addEventListener("click", executarExclusao);
  btnRecarregar.addEventListener("click", carregarAparelhos);

  // Pré-visualização de imagem ao digitar URL no cadastro
  cadFoto.addEventListener("input", (e) => {
    const url = e.target.value.trim();
    if (/^https?:\/\//i.test(url)) {
      imgPreviewCad.src = url;
      previewContainerCad.classList.remove("hidden");
    } else {
      previewContainerCad.classList.add("hidden");
    }
  });

  // Pré-visualização de imagem no modal de edição
  editFoto.addEventListener("input", (e) => {
    const url = e.target.value.trim();
    if (/^https?:\/\//i.test(url)) {
      imgPreviewEdit.src = url;
    }
  });

  // Filtro de busca em tempo real
  filtroBusca.addEventListener("input", (e) => {
    const termo = e.target.value.toLowerCase().trim();
    if (!termo) {
      renderizarCards(aparelhosCache);
      return;
    }
    const filtrados = aparelhosCache.filter((item) =>
      item.modelo.toLowerCase().includes(termo)
    );
    renderizarCards(filtrados);
  });
}
