# Frontend - Sistema de Controle de Pedidos

Este repositório contém o **frontend** de um sistema de controle de pedidos desenvolvido com **HTML**, **CSS**, **JavaScript** e **React**. A interface do usuário permite interagir com a API backend para visualizar, adicionar, excluir produtos e criar pedidos com preenchimento automático de endereço via CEP.

## Funcionalidades principais:

### 🔸 **Pedidos:**
- **Criação de Pedidos:**  
  - Permite ao usuário criar um pedido, preenchendo automaticamente os dados do endereço através do CEP informado.
- **Listagem de Pedidos:**  
  - Exibe todos os pedidos registrados no sistema.
- **Exclusão de Pedidos:**  
  - Permite ao usuário excluir pedidos individuais.

## 🔧 **Tecnologias utilizadas:**
- **HTML/CSS** - Estrutura e estilização da página.
- **JavaScript** - Linguagem de programação para interação com a API e manipulação de dados.
- **Fetch API** - Para comunicação assíncrona com o backend via requisições HTTP.

## 🔐 **Integração com a API Backend**

O frontend se comunica com a API backend construída em Flask, realizando requisições **GET**, **POST**, **DELETE** para manipulação dos pedidos. O preenchimento automático de endereço via CEP é feito utilizando a API ViaCEP.

## Estrutura de Componentes:

- **app.js:** Arquivo principal que integra os diferentes componentes e gerencia a lógica da aplicação.
- **index.html:** Arquivo principal do frontEnd.
- **Estilos (CSS):** Estilos modernos e futuristas aplicados com **Flexbox** e **CSS Grid** para criar uma interface limpa e interativa.

### Passos para rodar a aplicação:

1. Clone o repositório:
   ```bash
   git clone https://github.com/seuusuario/projeto-frontend.git
   cd projeto-frontend
