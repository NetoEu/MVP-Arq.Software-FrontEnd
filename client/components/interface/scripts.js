document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const form = $("pedido-form"), produto = $("produto"), preco = $("valor_unitario"), quantidade = $("quantidade");
  const salvar = $("salvar-pedido"), cancelar = $("cancelar-edicao"), lista = $("lista-pedidos");
  const base = (window.API_BASE_URL || "").replace(/\/$/, "");
  const catalogo = window.CATALOGO_PRODUTOS || [];
  const moeda = valor => new Intl.NumberFormat("pt-BR", {style:"currency",currency:"BRL"}).format(valor / 100);
  let editando = null, pedidos = [], consulta = 0, ocupado = false, excluindo = null, carregamento = 0;
  const campo = nome => form.elements[nome];
  function aviso(texto, erro = false) { $("mensagem").textContent = texto; $("mensagem").hidden = !texto; $("mensagem").classList.toggle("erro", erro); }
  function opcoes() {
    produto.replaceChildren(new Option("Selecione um produto", ""));
    for (const item of catalogo) produto.add(new Option(item.nome, item.nome));
  }
  opcoes();
  function total() {
    $("produto-detalhes").hidden = !produto.value;
    preco.required = Boolean(produto.value); quantidade.required = Boolean(produto.value);
    const valor = Math.round(Number(preco.value) * 100) * Number(quantidade.value);
    $("total-pedido").textContent = preco.value && quantidade.value && Number.isFinite(valor) && valor >= 0 ? moeda(valor) : "—";
  }
  produto.addEventListener("change", () => { const item = catalogo.find(p => p.nome === produto.value); preco.value = item ? (item.centavos / 100).toFixed(2) : ""; total(); });
  preco.addEventListener("input", total); quantidade.addEventListener("input", total);
  async function request(path, options = {}) {
    let response;
    try { response = await fetch(`${base}${path}`, options); } catch { throw new Error("Não foi possível conectar à API. Verifique se os serviços estão em execução."); }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.erro || data.error || (response.status === 422 ? "Confira os campos: CEP, data, preço e quantidade devem ser válidos." : "Não foi possível concluir a operação."));
    return data;
  }
  function endereco(data = {}) { for (const [key,value] of Object.entries({logradouro:data.logradouro,bairro:data.bairro,cidade:data.localidade ?? data.cidade,estado:data.uf ?? data.estado})) campo(key).value = value || ""; }
  $("cep").addEventListener("input", () => { consulta++; endereco(); $("cep-status").textContent = "Informe oito dígitos para buscar o endereço."; });
  $("cep").addEventListener("blur", async () => {
    const cep = campo("cep").value.trim(), atual = ++consulta;
    if (!/^[0-9]{8}$/.test(cep)) return;
    $("cep-status").textContent = "Buscando endereço…";
    try { const data = await request(`/api/cep/${cep}`); if (atual !== consulta) return; endereco(data); $("cep-status").textContent = "Endereço encontrado pelo CEP."; }
    catch (error) { if (atual === consulta) { endereco(); $("cep-status").textContent = error.message; } }
  });
  function limpar() { consulta++; editando = null; form.reset(); opcoes(); total(); $("form-titulo").textContent = "Novo pedido"; salvar.textContent = "Criar pedido ↗"; cancelar.hidden = true; $("cep-status").textContent = "Informe o CEP para buscar o endereço."; }
  function bloquear(valor) { ocupado = valor; for (const el of form.elements) el.disabled = valor; document.querySelectorAll(".actions button").forEach(el => el.disabled = valor); }
  cancelar.addEventListener("click", () => { limpar(); aviso("Edição cancelada."); });
  form.addEventListener("submit", async event => {
    event.preventDefault(); if (ocupado) return;
    const data = {};
    for (const key of ["nome_cliente","produto","data_evento","cep"]) data[key] = campo(key).value.trim();
    if (!data.nome_cliente) { aviso("Informe o nome do cliente.", true); return; }
    data.valor_unitario_centavos = Math.round(Number(preco.value) * 100); data.quantidade = Number(quantidade.value);
    if (!preco.value || !Number.isInteger(data.quantidade) || data.quantidade < 1 || data.quantidade > 10000 || data.valor_unitario_centavos < 0 || data.valor_unitario_centavos > 100000000) { aviso("Informe um preço válido e uma quantidade inteira entre 1 e 10.000.", true); return; }
    const id = editando; consulta++; bloquear(true); salvar.textContent = "Salvando…";
    try { await request(id === null ? "/api/pedido" : `/api/pedido/${id}`, {method:id === null ? "POST" : "PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)}); limpar(); aviso(id === null ? "Pedido criado com sucesso." : "Pedido atualizado com sucesso."); await carregar(); }
    catch (error) { aviso(error.message, true); }
    finally { bloquear(false); salvar.textContent = editando === null ? "Criar pedido ↗" : "Salvar alterações"; }
  });
  function node(tag, className, text) { const el = document.createElement(tag); el.className = className; el.textContent = text; return el; }
  function editar(p) {
    if (ocupado) return; consulta++; editando = p.id; opcoes();
    if (!catalogo.some(item => item.nome === p.produto)) produto.add(new Option(`${p.produto} (pedido anterior)`,p.produto));
    for (const key of ["nome_cliente","produto","data_evento","cep"]) campo(key).value = p[key];
    preco.value = p.valor_unitario_centavos == null ? "" : (p.valor_unitario_centavos/100).toFixed(2); quantidade.value = p.quantidade || 1; total(); endereco(p);
    $("form-titulo").textContent = `Editar pedido #${p.id}`; salvar.textContent = "Salvar alterações"; cancelar.hidden = false;
    $("cep-status").textContent = "Endereço salvo no pedido."; aviso(""); campo("nome_cliente").focus(); form.scrollIntoView({behavior:"smooth",block:"start"});
  }
  function render() {
    const hoje = new Date(); const dia = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}-${String(hoje.getDate()).padStart(2,"0")}`;
    $("stat-pedidos").textContent = pedidos.length;
    $("stat-eventos").textContent = pedidos.filter(p => p.data_evento >= dia).length;
    $("stat-valor").textContent = moeda(pedidos.reduce((sum,p) => sum + (p.valor_unitario_centavos ?? 0) * (p.quantidade || 1),0));
    const termo = $("busca").value.toLocaleLowerCase("pt-BR").trim();
    const filtrados = pedidos.filter(p => `${p.nome_cliente} ${p.produto}`.toLocaleLowerCase("pt-BR").includes(termo));
    $("contagem").textContent = `${filtrados.length} de ${pedidos.length} pedidos`;
    lista.replaceChildren();
    if (!filtrados.length) lista.append(node("li","empty-state",termo ? "Nenhum pedido encontrado. Tente outro nome ou produto." : "Sua próxima encomenda começa aqui.\nCadastre o primeiro pedido no formulário ao lado."));
    for (const p of filtrados) {
      const card = node("li","order-card", ""), top = node("div","order-top",""), nome = node("div","","");
      nome.append(node("div","order-id",`PEDIDO #${String(p.id).padStart(3,"0")}`),node("div","order-name",p.nome_cliente));
      top.append(nome,node("div","order-price",p.valor_unitario_centavos == null ? "Sem preço" : moeda(p.valor_unitario_centavos * p.quantidade)));
      const resumo = `${p.quantidade || 1} × ${p.produto}${p.valor_unitario_centavos == null ? "" : ` · ${moeda(p.valor_unitario_centavos)} / un.`}`;
      card.append(top,node("p","order-product",resumo),node("p","order-meta",[p.logradouro,p.bairro,p.cidade,p.estado].filter(Boolean).join(", ")));
      const bottom = node("div","order-bottom",""), actions = node("div","actions","");
      const edit = node("button","secondary","Editar"), del = node("button","delete-button","Excluir"); edit.type = del.type = "button"; edit.disabled = del.disabled = ocupado;
      edit.addEventListener("click", () => editar(p)); del.addEventListener("click", () => { if(ocupado) return; excluindo = p; $("exclusao-descricao").textContent = `Pedido #${p.id} de ${p.nome_cliente}.`; $("confirmar-exclusao").showModal(); });
      actions.append(edit,del); bottom.append(node("span","date-badge",`Evento · ${p.data_evento.split("-").reverse().join("/")}`),actions); card.append(bottom); lista.append(card);
    }
  }
  async function carregar() {
    const token = ++carregamento; $("atualizar-lista").disabled = true;
    try { const result = await request("/api/pedido"); if (token !== carregamento) return; pedidos = result; render(); }
    catch(error) { aviso(error.message,true); if (!pedidos.length) lista.replaceChildren(node("li","empty-state","Não foi possível carregar os pedidos. Clique em Atualizar para tentar novamente.")); }
    finally { if(token === carregamento) $("atualizar-lista").disabled = false; }
  }
  $("busca").addEventListener("input",render); $("atualizar-lista").addEventListener("click",carregar);
  $("cancelar-exclusao").addEventListener("click", () => $("confirmar-exclusao").close());
  $("excluir-confirmado").addEventListener("click", async () => {
    if(!excluindo || ocupado) return; const id = excluindo.id; $("confirmar-exclusao").close(); bloquear(true);
    try { await request(`/api/pedido/${id}`,{method:"DELETE"}); if(editando === id) limpar(); aviso("Pedido excluído com sucesso."); await carregar(); }
    catch(error) { aviso(error.message,true); } finally { bloquear(false); excluindo = null; }
  });
  total(); carregar();
});
