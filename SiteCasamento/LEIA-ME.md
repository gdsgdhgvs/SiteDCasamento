# Convite de casamento · Natiely & Gustavo

Para ver o site, abra o arquivo `index.html` no navegador (ou use o Live Server do VS Code).

## O que falta preencher (2 itens)

### 1. Número do WhatsApp que recebe as confirmações
Abra `js/script.js` e, no topo, preencha:

```js
whatsapp: "5545999999999",   // 55 + DDD + número, só dígitos
```

Enquanto estiver vazio, o botão "Enviar pelo WhatsApp" mostra um aviso em vez de abrir o WhatsApp.
O número que aparece no cardápio (045-999906748) é do Recanto Dal Pont, por isso **não** foi usado.

### 2. Imagem com as cores dos padrinhos
Salve a imagem com este nome exato: `img/cores.png`.
Ao salvar, a aba **Cores** passa a mostrar a imagem sozinha (toque para ampliar).
Sem o arquivo, a aba mostra o aviso "A paleta de cores será publicada aqui em breve".

## Para conferir depois de publicar
- Toque em **Google Maps** e **Waze** na aba Início e veja se abrem o local certo.
  Se o nome do local não for encontrado, troque o texto do endereço nos links do `index.html`.
- A aba **Cerimônia** não tem mapa porque o endereço da Igreja Matriz não está no projeto.
- Para a prévia do link aparecer com foto no WhatsApp, siga o comentário no topo do `index.html` (tag `og:image`).

## Onde mexer em cada coisa

| O que | Onde |
|---|---|
| Textos, horário, local | `index.html` |
| Data e hora do casamento | `js/script.js` → `dataEvento` |
| Cores e fontes do site | `css/style.css` → bloco `:root` no início |
| Cardápio | `index.html` → aba Buffet |
| Foto da capa | `img/hero.jpg` |
| Música | `audio/athousandyears.mp3` |

## Estrutura

```
SiteCasamento/
├── index.html
├── css/style.css
├── js/script.js
├── img/        logo, hero, buffet, ícones (e cores.png)
├── audio/      música
└── fonts/      fontes hospedadas junto com o site
```
