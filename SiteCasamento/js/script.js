/* ==========================================================================
   CONVITE DE CASAMENTO · Natiely & Gustavo
   Índice:
   0. Configuração  (o que você precisa editar)
   1. Utilidades
   2. Envelope de abertura
   3. Música
   4. Abas
   5. Contagem regressiva
   6. Imagem ampliada
   7. Aba Cores (aviso enquanto o cores.png não existir)
   8. Confirmação de presença pelo WhatsApp
   9. Partículas douradas
   ========================================================================== */

(() => {
    "use strict";

    /* 0. CONFIGURAÇÃO ======================================================= */
    const CONFIG = {
        // Número do WhatsApp que vai RECEBER as confirmações.
        // Só números, com 55 + DDD + número. Exemplo: "5545999999999"
        whatsapp: "5545991329807",

        // Data e hora do casamento (com fuso de Brasília, igual para todo convidado)
        dataEvento: "2027-04-03T17:00:00-03:00",

        // Textos usados na mensagem de WhatsApp
        casal: "Natiely e Gustavo",
        dataTexto: "03/04/2027",

        // Máximo de pessoas por confirmação
        maxPessoas: 10,
    };


    /* 1. UTILIDADES ========================================================= */
    const $  = (seletor, raiz = document) => raiz.querySelector(seletor);
    const $$ = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)];
    const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";


    /* 2. ENVELOPE DE ABERTURA =============================================== */
    const intro      = $("#intro");
    const envelope   = $("#envelope");
    const botaoAbrir = $("#openSite");
    const app        = $("#app");
    const abas       = $(".tabbar");
    const botaoMusica = $("#musicButton");

    // Com o envelope fechado, o site por trás fica "inerte" (Tab e leitor de tela não entram nele)
    app.inert = true;
    abas.inert = true;

    function abrirConvite() {
        if (intro.classList.contains("is-open")) return;
        intro.classList.add("is-open");
        iniciarMusica();

        const espera = reduzirMovimento ? 150 : 2000;      // tempo da animação da carta
        const fade   = reduzirMovimento ? 50  : 950;       // tempo do desaparecimento
        setTimeout(() => intro.classList.add("is-leaving"), espera);
        setTimeout(encerrarIntro, espera + fade);
    }

    function encerrarIntro() {
        intro.hidden = true;
        document.body.classList.remove("is-locked");
        app.inert = false;
        abas.inert = false;
        botaoMusica.hidden = false;
        window.scrollTo(0, 0);
        app.focus({ preventScroll: true });
        iniciarParticulas();
    }

    botaoAbrir.addEventListener("click", abrirConvite);
    envelope.addEventListener("click", abrirConvite);       // tocar no envelope também abre


    /* 3. MÚSICA ============================================================= */
    const musica = $("#music");
    let retomarAoVoltar = false;

    function atualizarBotaoMusica(tocando) {
        botaoMusica.setAttribute("aria-pressed", String(tocando));
        botaoMusica.setAttribute("aria-label", tocando ? "Pausar música" : "Tocar música");
    }

    function iniciarMusica() {
        musica.volume = 0;
        const promessa = musica.play();
        if (promessa && promessa.catch) promessa.catch(() => atualizarBotaoMusica(false));

        // Entrada suave até 50% do volume
        let volume = 0;
        const fadeIn = setInterval(() => {
            volume = Math.min(volume + 0.05, 0.5);
            musica.volume = volume;
            if (volume >= 0.5) clearInterval(fadeIn);
        }, 200);
    }

    botaoMusica.addEventListener("click", () => {
        if (musica.paused) {
            musica.volume = 0.5;
            musica.play().then(() => atualizarBotaoMusica(true)).catch(() => atualizarBotaoMusica(false));
        } else {
            musica.pause();
            atualizarBotaoMusica(false);
        }
    });

    // Pausa quando a pessoa troca de app e retoma quando volta
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            retomarAoVoltar = !musica.paused;
            musica.pause();
        } else if (retomarAoVoltar) {
            retomarAoVoltar = false;
            musica.play().catch(() => atualizarBotaoMusica(false));
        }
    });


    /* 4. ABAS =============================================================== */
    const paineis = $$("[data-panel]");
    const links   = $$(".tab");
    const idsValidos = paineis.map((p) => p.id);

    function mostrarAba(id, { rolar = true } = {}) {
        if (!idsValidos.includes(id)) id = "inicio";
        paineis.forEach((p) => { p.hidden = p.id !== id; });
        links.forEach((a) => {
            if (a.dataset.tab === id) a.setAttribute("aria-current", "page");
            else a.removeAttribute("aria-current");
        });
        if (rolar) window.scrollTo(0, 0);
    }

    window.addEventListener("hashchange", () => mostrarAba(location.hash.slice(1)));

    // Tocar na aba que já está aberta volta ao topo
    links.forEach((a) => a.addEventListener("click", (e) => {
        if (a.getAttribute("aria-current") === "page") {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: reduzirMovimento ? "auto" : "smooth" });
        }
    }));

    mostrarAba(location.hash.slice(1), { rolar: false });


    /* 5. CONTAGEM REGRESSIVA ================================================ */
    const alvo = new Date(CONFIG.dataEvento).getTime();
    const elDias = $("#days"), elHoras = $("#hours"), elMin = $("#minutes"), elSeg = $("#seconds");
    const elContagem = $("#countdown"), elContagemFim = $("#countdownDone");
    const doisDigitos = (n) => String(n).padStart(2, "0");
    let relogio = null;

    function atualizarContagem() {
        const resto = alvo - Date.now();

        if (resto <= 0) {
            clearInterval(relogio);
            const ehHoje = new Date().toDateString() === new Date(alvo).toDateString();
            elContagem.hidden = true;
            elContagemFim.hidden = false;
            elContagemFim.textContent = ehHoje
                ? "É hoje! Nos vemos em breve."
                : "Obrigado por celebrar com a gente.";
            return;
        }

        const total = Math.floor(resto / 1000);
        elDias.textContent  = Math.floor(total / 86400);
        elHoras.textContent = doisDigitos(Math.floor((total % 86400) / 3600));
        elMin.textContent   = doisDigitos(Math.floor((total % 3600) / 60));
        elSeg.textContent   = doisDigitos(total % 60);
    }

    atualizarContagem();
    relogio = setInterval(atualizarContagem, 1000);


    /* 6. IMAGEM AMPLIADA ==================================================== */
    const janela    = $("#lightbox");
    const janelaImg = $("#lightboxImg");

    function ampliar(src, alt) {
        // Navegador muito antigo sem <dialog>: abre a imagem em outra aba
        if (typeof janela.showModal !== "function") {
            window.open(src, "_blank", "noopener");
            return;
        }
        janelaImg.src = src;
        janelaImg.alt = alt;
        janela.showModal();
    }

    document.addEventListener("click", (e) => {
        const gatilho = e.target.closest("[data-lightbox]");
        if (gatilho) ampliar(gatilho.dataset.lightbox, gatilho.dataset.alt || "");
    });

    // Fecha ao tocar em qualquer lugar fora da imagem (inclui o botão X)
    janela.addEventListener("click", (e) => { if (e.target !== janelaImg) janela.close(); });
    janela.addEventListener("close", () => janelaImg.removeAttribute("src"));


    /* 6b. MAPA: aparece suavemente quando terminar de carregar */
    const mapaFrame = $(".map iframe");
    mapaFrame.addEventListener("load", () => mapaFrame.parentElement.classList.add("is-loaded"));


    /* 7. ABA CORES ========================================================== */
    // Se o arquivo img/cores.png ainda não existir, mostra um aviso amigável.
    const coresImg   = $("#coresImg");
    const coresFigura = $("#coresFigure");
    const coresVazio = $("#coresVazio");

    function mostrarAvisoCores() {
        coresFigura.hidden = true;
        coresVazio.hidden = false;
    }
    coresImg.addEventListener("error", mostrarAvisoCores);
    if (coresImg.complete && coresImg.naturalWidth === 0) mostrarAvisoCores();


    /* 8. CONFIRMAÇÃO DE PRESENÇA PELO WHATSAPP ============================== */
    const form        = $("#rsvp");
    const campoNome   = $("#nome");
    const erroNome    = $("#nomeErro");
    const campoPessoas = $("#pessoas");
    const erroPessoas = $("#pessoasErro");
    const blocoPessoas = $("#campoPessoas");
    const campoRecado = $("#recado");
    const statusForm  = $("#rsvpStatus");

    const vaiComparecer = () => form.elements.vai.value === "sim";
    const limitar = (n, min, max) => Math.min(Math.max(n, min), max);

    function marcarErro(campo, aviso, temErro) {
        campo.setAttribute("aria-invalid", String(temErro));
        aviso.hidden = !temErro;
    }

    function mostrarStatus(texto, { erro = false, link = null } = {}) {
        statusForm.classList.toggle("is-error", erro);
        statusForm.textContent = texto;
        if (link) {
            const a = document.createElement("a");
            a.href = link;
            a.target = "_blank";
            a.rel = "noopener";
            a.textContent = "toque aqui";
            statusForm.append(" Se ele não abrir, ", a, ".");
        }
    }

    // Aceita (45) 99999-9999 ou 5545999999999 e devolve só os dígitos com 55
    function normalizarTelefone(valor) {
        let digitos = String(valor).replace(/\D/g, "");
        if (digitos.length === 10 || digitos.length === 11) digitos = "55" + digitos;
        return /^\d{12,15}$/.test(digitos) ? digitos : "";
    }

    function montarMensagem({ nome, vai, pessoas, recado }) {
        const linhas = [`Olá, ${CONFIG.casal}!`];
        if (vai) {
            linhas.push(`Aqui é *${nome}* e confirmo presença no casamento de vocês (${CONFIG.dataTexto}).`);
            linhas.push(`Pessoas: ${pessoas}`);
        } else {
            linhas.push(`Aqui é *${nome}*. Infelizmente não poderei comparecer ao casamento de vocês (${CONFIG.dataTexto}). Desejo muita felicidade!`);
        }
        if (recado) linhas.push(`Recado: ${recado}`);
        return linhas.join("\n");
    }

    function abrirWhatsApp(url) {
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener";
        document.body.append(a);
        a.click();
        a.remove();
    }

    // Mostra ou esconde "Quantas pessoas" conforme Sim / Não
    $$('input[name="vai"]', form).forEach((r) => r.addEventListener("change", () => {
        blocoPessoas.hidden = !vaiComparecer();
    }));

    // Botões − e +
    $$("[data-step]", form).forEach((botao) => botao.addEventListener("click", () => {
        const atual = parseInt(campoPessoas.value, 10) || 1;
        campoPessoas.value = limitar(atual + Number(botao.dataset.step), 1, CONFIG.maxPessoas);
        marcarErro(campoPessoas, erroPessoas, false);
    }));

    campoNome.addEventListener("input", () => marcarErro(campoNome, erroNome, false));
    campoPessoas.addEventListener("input", () => marcarErro(campoPessoas, erroPessoas, false));

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        mostrarStatus("");

        const nome = campoNome.value.trim().replace(/\s+/g, " ").replace(/[*_~`]/g, "");
        const vai = vaiComparecer();
        const pessoas = parseInt(campoPessoas.value, 10);

        const nomeOk = nome.length >= 2;
        const pessoasOk = !vai || (Number.isInteger(pessoas) && pessoas >= 1 && pessoas <= CONFIG.maxPessoas);
        marcarErro(campoNome, erroNome, !nomeOk);
        marcarErro(campoPessoas, erroPessoas, !pessoasOk);

        if (!nomeOk) { campoNome.focus(); return; }
        if (!pessoasOk) { campoPessoas.focus(); return; }

        const numero = normalizarTelefone(CONFIG.whatsapp);
        if (!numero) {
            mostrarStatus("O número de WhatsApp dos noivos ainda não foi configurado.", { erro: true });
            return;
        }

        const mensagem = montarMensagem({ nome, vai, pessoas, recado: campoRecado.value.trim() });
        const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

        abrirWhatsApp(url);
        mostrarStatus("Abrindo o WhatsApp.", { link: url });
    });


    /* 9. PARTÍCULAS DOURADAS ================================================ */
    let particulasAtivas = false;

    function iniciarParticulas() {
        if (particulasAtivas || reduzirMovimento) return;
        particulasAtivas = true;

        const canvas = $("#particles");
        const ctx = canvas.getContext("2d");
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const quantidade = window.innerWidth < 600 ? 28 : 60;   // menos no celular: economiza bateria
        let largura = 0, altura = 0;

        function ajustar() {
            largura = window.innerWidth;
            altura = window.innerHeight;
            canvas.width = largura * dpr;
            canvas.height = altura * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        ajustar();
        window.addEventListener("resize", ajustar);

        const pontos = Array.from({ length: quantidade }, () => ({
            x: Math.random() * largura,
            y: Math.random() * altura,
            raio: Math.random() * 1.6 + 0.4,
            velocidade: Math.random() * 0.4 + 0.15,
            brilho: Math.random() * 0.3 + 0.15,
        }));

        function desenhar() {
            ctx.clearRect(0, 0, largura, altura);
            for (const p of pontos) {
                ctx.fillStyle = `rgba(200, 168, 106, ${p.brilho})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.raio, 0, Math.PI * 2);
                ctx.fill();
                p.y += p.velocidade;
                if (p.y > altura + 5) { p.y = -5; p.x = Math.random() * largura; }
            }
            requestAnimationFrame(desenhar);
        }
        desenhar();
    }
})();
