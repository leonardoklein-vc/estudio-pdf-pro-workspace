# 📄 Estúdio PDF Pro & AI Suite

![Architecture](https://img.shields.io/badge/Architecture-Serverless_SPA-blue?style=for-the-badge)
![Google Workspace](https://img.shields.io/badge/Environment-Google_Workspace-4285F4?style=for-the-badge&logo=google)
![JavaScript](https://img.shields.io/badge/Processing-Client--Side_JS-F7DF1E?style=for-the-badge&logo=javascript)
![Security](https://img.shields.io/badge/Compliance-LGPD_Ready-10a37f?style=for-the-badge)
![AI Powered](https://img.shields.io/badge/AI-Powered_Suite-8b5cf6?style=for-the-badge&logo=openai)

Uma suíte completa de manipulação de PDFs e Inteligência Artificial rodando de forma 100% nativa, *client-side* e *serverless* dentro do Google Workspace. 

Desenvolvida para substituir ferramentas web de terceiros (como iLovePDF, SmallPDF), garantindo **privacidade absoluta (LGPD)** para dados corporativos e médicos, com custo zero de infraestrutura.

---

## 🚨 O Problema: Segurança vs. Produtividade

Setores administrativos e clínicos manipulam centenas de PDFs diariamente. Quando não há uma ferramenta oficial ágil, as equipes recorrem a sites gratuitos. O resultado é catastrófico para a segurança da informação:
* **Risco de Vazamento (LGPD):** Fazer upload de prontuários e relatórios em servidores desconhecidos.
* **Limitações Técnicas:** Arquivos pesados sofrem com limites de upload ou *timeouts* de rede.
* **Custos de Licenciamento:** Softwares desktop corporativos (como Adobe Acrobat) cobram assinaturas caras por máquina.

---

## 💡 A Solução: O Navegador como Servidor

Para contornar o limite de tempo de execução do Google Apps Script (6 minutos) e garantir a segurança dos dados, a arquitetura inverte a lógica tradicional: **o servidor envia o motor de processamento para o navegador do usuário**.

Utilizando `pdf-lib`, `pdf.js` e `tesseract.js` embarcados no frontend, a manipulação binária ocorre inteiramente na memória RAM da máquina local. **O arquivo nunca sai do ambiente corporativo.**

*(Insira aqui um print da tela inicial mostrando o grid com todas as ferramentas disponíveis)*
> `![Tela Inicial - Hub de Ferramentas](./assets/hub_inicial.png)`

---

## 🧠 Módulo de Inteligência Artificial Integrado
A suíte vai além da manipulação estrutural de arquivos, atuando como um assistente de leitura inteligente:

* **💬 Chat com PDF:** Interação conversacional direta com o documento. A IA rastreia e extrai respostas precisas baseadas exclusivamente no contexto do arquivo carregado.
* **📝 Resumo e Extração:** Geração de tópicos principais e resumos executivos de documentos extensos em segundos.
* **🎓 Gerador de Quiz:** Criação automatizada de testes de múltipla escolha com gabarito a partir do conteúdo lido.
* **🗣️ Leitor Imersivo (TTS):** Conversão de Texto para Voz com destaque visual síncrono (estilo "karaokê") para acessibilidade e multitarefa.
* **🌐 Tradução Nativa:** Tradução de páginas inteiras preservando o jargão técnico e o contexto hospitalar.

*(Insira aqui um print da interface de Chat com PDF ou do Leitor Imersivo)*
> `![Interface de IA e Chat](./assets/modulo_ia.png)`

---

## 🛠️ Módulo de Manipulação de PDF
Mais de 15 ferramentas nativas rodando offline no navegador com suporte a *Drag & Drop* e *Bulk Actions* (Ações em Lote):

| Ferramenta | Descrição Operacional |
| :--- | :--- |
| **Faxina Inteligente** | Exclui automaticamente páginas em branco de lotes escaneados. |
| **Merge & Split** | Juntar múltiplos PDFs ou dividir intervalos de páginas específicos. |
| **Achatar (Flatten)** | Fixa formulários preenchidos e anotações, tornando-os não editáveis. |
| **Ocultar (Redact)** | Aplica faixas pretas irreversíveis sobre dados sensíveis (LGPD). |
| **OCR Local** | Transforma imagens escaneadas em texto pesquisável (`tesseract.js`). |
| **Timbre & Marca D'água** | Aplica sobreposições (Overlay) de papéis timbrados em todo o lote. |
| **Conversor Universal** | Transforma DOCX, XLSX, PPTX e JPG para PDF utilizando a API do Google Drive como ponte térmica. |

*(Insira aqui um print da mesa de trabalho, mostrando os PDFs como miniaturas, a Lupa de Zoom ou a ação de corte)*
> `![Mesa de Trabalho - Manipulação](./assets/mesa_trabalho.png)`

---

## ⚙️ Arquitetura *Library / Shell* e Governança

O sistema foi orquestrado para escalar por toda a instituição de forma modular:

1. **Core Library (O Motor):** Toda a lógica pesada e a interface gráfica (HTML/CSS) residem em um único repositório central. 
2. **Client Shells (As Cascas):** Diferentes setores e planilhas invocam o componente injetando-o via `HtmlService`. Se uma regra de negócio mudar, o código é atualizado no *Core* e reflete instantaneamente na empresa inteira.

*(Insira aqui um print do VS Code ou do Editor do Apps Script mostrando a árvore de arquivos limpa)*
> `![Arquitetura de Pastas](./assets/arquitetura_pastas.png)`

### 👁️ Torre de Controle (Real-Time Admin)
Gestão visual para a equipe de TI auditar o uso da ferramenta em tempo real:
* **Sistema de *Heartbeat*:** O frontend emite um "Ping" a cada 30 segundos via `PropertiesService`.
* **Dashboard Administrativo:** Um painel exibe quem está online, o e-mail institucional e qual ferramenta exata está sendo utilizada naquele milissegundo.

*(Insira aqui um print do Painel Admin mostrando os usuários ativos na ferramenta)*
> `![Torre de Controle Admin](./assets/painel_admin.png)`

---

## 🎨 Design System e UX
A interface foi meticulosamente desenhada para entregar uma experiência *Premium*, com padrões visuais que superam ferramentas pagas do mercado:
* **Glassmorphism & Animações:** Uso de desfoque de fundo (backdrop-filter) e loaders personalizados.
* **Modal Fullscreen:** Visualizador integrado com Lupa de Inspeção para conferência de assinaturas ou detalhes antes da mesclagem.
* **Micro-interações:** Feedback tátil e visual para operações de arrastar e soltar (Drag & Drop).

---

## 🚀 Stack Tecnológico
* **Backend / Orquestração:** Google Apps Script (V8 Engine), Drive API.
* **Frontend:** Vanilla JavaScript, HTML5, CSS3.
* **Processamento Client-Side:** * `pdf-lib` (Manipulação Binária e Metadata).
  * `pdf.js` (Renderização e Rasterização de Canvas).
  * `tesseract.js` (Optical Character Recognition).
  * `html2canvas` (Rasterização de DOM).
* **UI/UX:** Bootstrap 5 (Grid base) + CSS Customizado (Animações e Theming).
