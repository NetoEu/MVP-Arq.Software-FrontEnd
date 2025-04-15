document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("pedido-form");
  const cepInput = document.getElementById("cep");
  const mensagem = document.getElementById("mensagem");
  const listaPedidos = document.getElementById("lista-pedidos");

  // Buscar CEP
  cepInput.addEventListener("blur", async () => {
    const cep = cepInput.value.trim();
    if (cep.length === 8) {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/cep/${cep}`);
        const data = await res.json();

        if (data.erro || data.error) {
          mensagem.textContent = "CEP não encontrado.";
          return;
        }

        document.getElementById("logradouro").value = data.logradouro || "";
        document.getElementById("bairro").value = data.bairro || "";
        document.getElementById("cidade").value = data.localidade || "";
        document.getElementById("estado").value = data.uf || "";

        mensagem.textContent = "";
      } catch (err) {
        mensagem.textContent = "Erro ao buscar CEP.";
      }
    }
  });

  // Enviar pedido
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const pedido = {
      nome_cliente: form.nome_cliente.value,
      produto: form.produto.value,
      data_evento: form.data_evento.value,
      cep: form.cep.value,
      logradouro: form.logradouro.value,
      bairro: form.bairro.value,
      cidade: form.cidade.value,
      estado: form.estado.value
    };

    try {
      const res = await fetch("http://127.0.0.1:5000/api/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido)
      });

      if (!res.ok) {
        throw new Error("Erro ao enviar pedido");
      }

      const data = await res.json();
      mensagem.textContent = `Pedido registrado com sucesso para ${data.nome_cliente}!`;
      form.reset();
      carregarPedidos();  // Atualiza a lista após envio
    } catch (err) {
      mensagem.textContent = "Erro ao enviar o pedido.";
    }
  });

  // Função para carregar e exibir pedidos
  async function carregarPedidos() {
    const lista = document.getElementById("lista-pedidos");
    lista.innerHTML = ""; // Limpa a lista atual

    try {
      const res = await fetch("http://127.0.0.1:5000/api/pedido");
      const pedidos = await res.json();

      pedidos.forEach(pedido => {
        const card = document.createElement("div");
        card.className = "card";

        const info = document.createElement("div");
        info.className = "card-info";

        const enderecoCompleto = `${pedido.logradouro}, ${pedido.bairro}, ${pedido.cidade} - ${pedido.estado} (${pedido.cep})`;
        const dataFormatada = new Date(pedido.data_evento).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });

        info.innerHTML = `
          <strong>${pedido.nome_cliente}</strong><br>
          Produto: ${pedido.produto}<br>
          Data: ${dataFormatada}<br>
          Endereço: ${enderecoCompleto}
        `;

        const botao = document.createElement("button");
        botao.className = "delete-btn";
        botao.innerHTML = "🗑️";
        botao.onclick = async () => {
          const ok = confirm("Tem certeza que deseja excluir este pedido?");
          if (ok) {
            try {
              const resDelete = await fetch(`http://127.0.0.1:5000/api/pedido/${pedido.id}`, { method: "DELETE" });

              if (resDelete.ok) {
                alert("Pedido excluído com sucesso!");
                carregarPedidos();  // Atualiza a lista após exclusão
              } else {
                alert("Erro ao excluir o pedido.");
              }
            } catch (error) {
              alert("Erro ao tentar excluir o pedido.");
            }
          }
        };
        card.appendChild(info);
        card.appendChild(botao);
        lista.appendChild(card);

        const editarBtn = document.createElement("button");
        editarBtn.className = "edit-btn";
        editarBtn.innerHTML = "✏️";
        editarBtn.onclick = async () => {
          const novoNome = prompt("Novo nome do cliente:", pedido.nome_cliente);
          const novoProduto = prompt("Novo produto:", pedido.produto);
          const novaData = prompt("Nova data do evento:", pedido.data_evento);
          const novoCEP = prompt("Novo CEP:", pedido.cep);

          if (novoNome && novoProduto && novaData && novoCEP) {
            try {
              const res = await fetch(`http://127.0.0.1:5000/api/pedido/${pedido.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  nome_cliente: novoNome,
                  produto: novoProduto,
                  data_evento: novaData,
                  cep: novoCEP
                })
              });

              if (!res.ok) {
                alert("Erro ao atualizar o pedido.");
              } else {
                alert("Pedido atualizado com sucesso!");
                carregarPedidos();
              }
            } catch (err) {
              alert("Erro de comunicação com o servidor.");
            }
          }
        };

card.appendChild(editarBtn); // Adiciona o botão de editar ao card

      });
    } catch (err) {
      lista.innerHTML = "<li>Erro ao carregar pedidos.</li>";
    }

    
  }

  // Carrega pedidos ao iniciar
  carregarPedidos();
});