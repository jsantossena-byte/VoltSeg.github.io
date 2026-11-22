const DB="voltseg_products_v7", CART="voltseg_cart_v2", ORDERS="voltseg_orders_v2", IMAGES="voltseg_site_images_v1";
const seed=[
{id:1,name:"Câmera Bullet 4K",category:"Câmeras",price:489.90,stock:12,description:"Imagem 4K, visão noturna e detecção inteligente.",image:"camera-frente-casa.jpg",tag:"Mais vendido"},
{id:2,name:"Câmera PTZ com Zoom",category:"Câmeras",price:1299.90,stock:5,description:"Movimentação panorâmica, zoom óptico e monitoramento remoto.",image:"camera-rua.jpg",tag:"Tecnologia"},
{id:3,name:"Câmera Térmica",category:"Câmeras",price:2490,stock:3,description:"Monitoramento térmico para aplicações profissionais.",image:"monitoramento-premium.png",tag:"Profissional"},
{id:4,name:"Câmera com Proteção Balística",category:"Câmeras",price:3890,stock:2,description:"Modelo ilustrativo. Confirme laudos e certificações com o fabricante.",image:"camera-garagem.jpg",tag:"Linha especial"},
{id:5,name:"Central de Alarme Wi-Fi",category:"Alarmes",price:699.90,stock:8,description:"Central com aplicativo, sensores e notificações.",image:"monitoramento.png",tag:"Conectado"},
{id:6,name:"Controle de Acesso Biométrico",category:"Controle de acesso",price:899.90,stock:6,description:"Acesso por biometria, senha e cartão conforme o modelo.",image:"controle-acesso-biometria.png",tag:"Empresas"},
{id:7,name:"Kit de Cerca Elétrica",category:"Perímetro",price:558.90,stock:10,description:"Kit para proteção perimetral. Instalação por profissional habilitado.",image:"monitoramento-referencia.png",tag:"Proteção"},
{id:8,name:"Gravador NVR 8 Canais",category:"Gravadores",price:799.90,stock:7,description:"Gravação e gerenciamento de câmeras IP compatíveis.",image:"monitoramento.png",tag:"Sistema"}
];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}}, write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const money=n=>Number(n||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const products=()=>read(DB,seed), cart=()=>read(CART,[]);
function navigate(page){$$(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+page));window.scrollTo({top:0,behavior:"smooth"});if(page==="employee")refreshAdmin();}
function renderProducts(category="Todos",query=""){
 const list=products().filter(p=>(category==="Todos"||p.category===category)&&(`${p.name} ${p.category} ${p.description}`.toLowerCase().includes(query.toLowerCase())));
 $("#product-grid").innerHTML=list.length?list.map(p=>`<article class="product-card"><div class="product-image"><img src="${esc(p.image)}" alt="${esc(p.name)}"><span class="product-tag">${esc(p.tag||p.category)}</span></div><div class="product-info"><small>${esc(p.category)}</small><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="product-bottom"><b class="price">${money(p.price)}</b><button class="add-btn" data-add="${p.id}" ${p.stock<=0?"disabled":""}>${p.stock<=0?"Indisponível":"Adicionar +"}</button></div></div></article>`).join(""):'<p class="muted">Nenhum produto encontrado.</p>';
}
function renderCart(){
 const list=cart();let total=0,count=0;
 $("#cart-items").innerHTML=list.length?list.map(i=>{const p=products().find(x=>x.id===i.id);if(!p)return"";total+=p.price*i.qty;count+=i.qty;return `<div class="cart-row"><span><b>${esc(p.name)}</b><br>${money(p.price)} × ${i.qty}</span><span><button data-qty="${p.id}" data-delta="-1">−</button> ${i.qty} <button data-qty="${p.id}" data-delta="1">+</button> <button data-remove="${p.id}">Remover</button></span></div>`}).join(""):'<p class="muted">Seu carrinho está vazio.</p>';
 $("#cart-total").textContent=money(total);$("#cart-count").textContent=count;
}
function add(id){const p=products().find(x=>x.id===id);if(!p)return;let c=cart(),i=c.find(x=>x.id===id);if(i){if(i.qty>=p.stock)return alert("Limite de estoque atingido.");i.qty++}else{if(!p.stock)return alert("Produto sem estoque.");c.push({id,qty:1})}write(CART,c);renderCart();}
function qty(id,delta){let c=cart(),i=c.find(x=>x.id===id),p=products().find(x=>x.id===id);if(!i||!p)return;i.qty+=delta;if(i.qty<=0)c=c.filter(x=>x.id!==id);if(i&&i.qty>p.stock)i.qty=p.stock;write(CART,c);renderCart();}
function checkout(){
 const c=cart();if(!c.length)return alert("Adicione produtos ao carrinho primeiro.");
 const method=document.querySelector('input[name="payment-method"]:checked')?.value;
 if(!method)return alert("Selecione uma forma de pagamento.");
 const ps=products(),total=c.reduce((s,i)=>s+(ps.find(p=>p.id===i.id)?.price||0)*i.qty,0);
 const order={id:Date.now(),date:new Date().toLocaleString("pt-BR"),items:c,total,status:"Aguardando pagamento",paymentMethod:method};
 const orders=read(ORDERS,[]);orders.push(order);write(ORDERS,orders);write(CART,[]);renderCart();refreshAdmin();
 const feedback=$("#checkout-feedback");
 if(feedback)feedback.innerHTML=`<b>Pedido #${order.id} registrado!</b><br>Forma de pagamento escolhida: <strong>${esc(method)}</strong>.<br><span>O pedido está aguardando a integração do provedor para gerar a cobrança ou processar o cartão. Nenhum pagamento foi realizado.</span>`;
 alert(`Pedido registrado!\nForma de pagamento: ${method}\nStatus: aguardando pagamento.\n\nA cobrança ainda precisa ser habilitada por uma integração de pagamento.`);
}
function refreshAdmin(){
 const ps=products(),os=read(ORDERS,[]);
 $("#stat-products").textContent=ps.length;$("#stat-stock").textContent=ps.reduce((s,p)=>s+Number(p.stock||0),0);$("#stat-orders").textContent=os.length;$("#stat-revenue").textContent=money(os.reduce((s,o)=>s+o.total,0));
 $("#products-table").innerHTML=ps.map(p=>`<tr><td>${esc(p.name)}</td><td>${money(p.price)}</td><td>${p.stock}</td><td><button data-edit="${p.id}">Editar</button> <button data-delete="${p.id}">Excluir</button></td></tr>`).join("");
 $("#orders-list").innerHTML=os.length?os.slice().reverse().map(o=>`<p><b>Pedido #${o.id}</b> — ${esc(o.date)} — ${money(o.total)} — ${esc(o.status)}<br><small>Pagamento: ${esc(o.paymentMethod||"Não informado")}</small></p>`).join(""):'<p class="muted">Ainda não há pedidos registrados neste navegador.</p>';
}
function startProductEdit(id){
 const p=products().find(x=>x.id===id);if(!p)return;const f=$("#product-form");
 f.elements.name.value=p.name;f.elements.category.value=p.category;f.elements.price.value=p.price;f.elements.stock.value=p.stock;f.elements.description.value=p.description||"";
 f.elements.imageUrl.value=p.image?.startsWith("data:")?"":(p.image||"");f.elements.imageFile.value="";f.dataset.editId=String(id);
 $("#product-form-title").textContent="Editar produto";$("#save-product-btn").textContent="ATUALIZAR PRODUTO";$("#cancel-edit-btn").hidden=false;f.scrollIntoView({behavior:"smooth",block:"center"});
}
function cancelProductEdit(){const f=$("#product-form");f.reset();delete f.dataset.editId;$("#product-form-title").textContent="Adicionar produto";$("#save-product-btn").textContent="SALVAR PRODUTO";$("#cancel-edit-btn").hidden=true;}
function fileToData(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)})}
async function compressImage(file,max=1200){
 const data=await fileToData(file);return new Promise(resolve=>{const img=new Image();img.onload=()=>{const scale=Math.min(1,max/Math.max(img.width,img.height));const canvas=document.createElement("canvas");canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL("image/jpeg",.78))};img.src=data;});
}
function loadSiteImages(){const im=read(IMAGES,{});if(im.hero)$("#hero-preview").src=im.hero;["cam1","cam2","cam3"].forEach((k,i)=>{if(im[k])$("#cam-img-"+(i+1)).src=im[k]})}
document.addEventListener("DOMContentLoaded",()=>{
 document.addEventListener("click",e=>{
  const nav=e.target.closest("[data-page]");if(nav){e.preventDefault();navigate(nav.dataset.page)}
  const cat=e.target.closest("[data-category-link]");if(cat){navigate("products");$$(".filter").forEach(b=>b.classList.toggle("active",b.dataset.category===cat.dataset.categoryLink));renderProducts(cat.dataset.categoryLink,$("#product-search").value)}
  const addBtn=e.target.closest("[data-add]");if(addBtn)add(Number(addBtn.dataset.add));
  const q=e.target.closest("[data-qty]");if(q)qty(Number(q.dataset.qty),Number(q.dataset.delta));
  const rem=e.target.closest("[data-remove]");if(rem){write(CART,cart().filter(i=>i.id!==Number(rem.dataset.remove)));renderCart()}
  const edit=e.target.closest("[data-edit]");if(edit)startProductEdit(Number(edit.dataset.edit));
  const del=e.target.closest("[data-delete]");if(del&&confirm("Excluir este produto?")){write(DB,products().filter(p=>p.id!==Number(del.dataset.delete)));refreshAdmin();renderProducts()}
 });
 $("#category-filters").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;$$(".filter").forEach(x=>x.classList.toggle("active",x===b));renderProducts(b.dataset.category,$("#product-search").value)});
 $("#product-search").addEventListener("input",()=>renderProducts($(".filter.active")?.dataset.category||"Todos",$("#product-search").value));
 $("#checkout-btn").addEventListener("click",checkout);
 $("#quote-form").addEventListener("submit",e=>{e.preventDefault();alert("Solicitação preenchida. Para receber e armazenar orçamentos de clientes, conecte o formulário a um servidor ou sistema de atendimento.");e.target.reset()});
 $("#login-form").addEventListener("submit",e=>{e.preventDefault();if($("#username").value==="funcionario"&&$("#password").value==="voltseg123"){sessionStorage.setItem("voltseg_employee","yes");$("#employee-login").hidden=true;$("#employee-dashboard").hidden=false;refreshAdmin()}else alert("Usuário ou senha incorretos.")});

 $$(".premium-feed").forEach(card=>card.addEventListener("dblclick",()=>{const grid=$("#camera-grid");grid.classList.add("focus-mode");$$(".premium-feed").forEach(c=>c.classList.toggle("focused",c===card));$$("[data-layout]").forEach(b=>b.classList.toggle("active",b.dataset.layout==="focus"))}));
 if(sessionStorage.getItem("voltseg_employee")==="yes"){$("#employee-login").hidden=true;$("#employee-dashboard").hidden=false;refreshAdmin()}
 renderProducts();renderCart();loadSiteImages();
});
