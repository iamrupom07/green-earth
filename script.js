// ---------------- API ----------------
const API = {
  allPlants: 'https://openapi.programming-hero.com/api/plants',
  categories: 'https://openapi.programming-hero.com/api/categories',
  byCategory: id => `https://openapi.programming-hero.com/api/category/${id}`,
  plant: id => `https://openapi.programming-hero.com/api/plant/${id}`,
};

// ---------------- ELEMENTS & STATE ----------------
const els = {
  spinner: document.getElementById('spinner'),
  cats: document.getElementById('categoryList'),
  grid: document.getElementById('grid'),
  cartList: document.getElementById('cartList'),
  cartTotal: document.getElementById('cartTotal'),
  modal: document.getElementById('modal'),
  modalTitle: document.getElementById('modalTitle'),
  modalImg: document.getElementById('modalImg'),
  modalDesc: document.getElementById('modalDesc'),
  modalCat: document.getElementById('modalCat'),
  modalPrice: document.getElementById('modalPrice'),
};

const state = {
  activeCat: 'all',
  cart: /** @type {Record<string,{id:string,name:string,price:number,qty:number}>} */ ({}),
};

// ---- MOCK (offline fallback) ----
const MOCK = {
  categories: [
    { id: 'all', category: 'All Trees' },
    { id: '1', category: 'Fruit Trees' },
    { id: '2', category: 'Flowering Trees' },
    { id: '3', category: 'Shade Trees' },
  ],
  plants: [
    { id: '101', name: 'Mango Tree', image: 'https://images.unsplash.com/photo-1524592714635-61b8f8b62f1e?q=80&w=1200&auto=format&fit=crop', category: 'Fruit Tree', price: 500, description: 'A fast-growing tropical tree that produces delicious, juicy mangoes during summer.' },
    { id: '102', name: 'Guava Tree', image: 'https://images.unsplash.com/photo-1582971280450-31c0dcfc05f4?q=80&w=1200&auto=format&fit=crop', category: 'Fruit Tree', price: 500, description: 'Hardy and fragrant, bears sweet guavas rich in vitamin C.' },
    { id: '103', name: 'Bougainvillea', image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop', category: 'Flowering Tree', price: 350, description: 'Vibrant flowering climber that brightens fences and pergolas.' },
    { id: '104', name: 'Neem', image: 'https://images.unsplash.com/photo-1594633312681-425c1b469f9f?q=80&w=1200&auto=format&fit=crop', category: 'Shade Tree', price: 450, description: 'Evergreen shade tree known for air-purifying medicinal leaves.' }
  ]
};

// ---------------- HELPERS ----------------
const showSpinner = (on=true)=> els.spinner?.classList[on?'remove':'add']('hidden');
const money = (n)=> `৳${(n||0).toLocaleString('bn-BD')}`;
const truncate = (s,max=95)=> s?.length>max? s.slice(0,max-1)+'…' : s || '';

/** Normalize plant object from various API shapes */
function normalizePlant(it){
  return {
    id: String(it?.id ?? it?.plantId ?? it?._id ?? Math.random().toString(36).slice(2)),
    name: it?.name ?? it?.plant_name ?? it?.title ?? 'Tree',
    image: it?.image ?? it?.img ?? it?.thumbnail ?? '',
    category: it?.category ?? it?.category_name ?? it?.type ?? 'Tree',
    price: Number(it?.price ?? it?.cost ?? 0),
    description: it?.description ?? it?.short_description ?? it?.about ?? '',
  };
}

/** Normalize category so names always show */
function normalizeCategory(c, idx = 0){
  return {
    id: String(c?.id ?? c?.category_id ?? c?._id ?? c?.slug ?? idx),
    name: c?.category ?? c?.category_name ?? c?.name ?? c?.title ?? c?.label ?? c?.slug ?? 'Category'
  };
}

// ---------------- PERSISTENCE ----------------
const CART_KEY = 'ge_cart';
const saveCart = ()=>{ try{ localStorage.setItem(CART_KEY, JSON.stringify(state.cart)); }catch{} };
const loadCart = ()=>{ try{ const raw = localStorage.getItem(CART_KEY); if(raw) state.cart = JSON.parse(raw)||{}; }catch{} };

// ---------------- CATEGORY LOAD ----------------
async function loadCategories(){
  showSpinner(true);
  try{
    const res = await fetch(API.categories, {cache:'no-store'});
    if(!res.ok) throw 0;
    const data = await res.json();
    const rawList = data?.categories ?? data?.data ?? [];
    const normalized = rawList.map((c,i)=> normalizeCategory(c,i));
    renderCategories([{ id: 'all', name: 'All Trees' }, ...normalized]);
  }catch(e){
    console.warn('Category fetch failed — using MOCK');
    const normalized = MOCK.categories.map((c,i)=> normalizeCategory(c,i));
    renderCategories([{ id: 'all', name: 'All Trees' }, ...normalized.slice(1)]);
  }finally{
    showSpinner(false);
  }
}

function renderCategories(list){
  els.cats.innerHTML = '';
  list.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'w-full text-left rounded-lg px-3 py-2 hover:bg-green-50 border border-transparent';
    btn.dataset.id = c.id;
    btn.textContent = c.name;
    btn.addEventListener('click', ()=> setActiveCat(c.id));
    els.cats.appendChild(btn);
  });
  setActiveCat('all');
}

function setActiveCat(id){
  state.activeCat = id;
  [...els.cats.children].forEach(ch => ch.classList.toggle('active-cat', ch.dataset.id===id));
  if(id === 'all') loadPlants(); else loadPlantsByCategory(id);
}

// ---------------- PLANT LOAD ----------------
async function loadPlants(){
  showSpinner(true);
  try{
    const res = await fetch(API.allPlants, {cache:'no-store'});
    if(!res.ok) throw 0;
    const data = await res.json();
    const items = (data?.plants ?? data?.data ?? []).map(normalizePlant);
    renderGrid(items);
  }catch(e){
    console.warn('Plants fetch failed — using MOCK');
    renderGrid(MOCK.plants.map(normalizePlant));
  }finally{ showSpinner(false); }
}

async function loadPlantsByCategory(id){
  showSpinner(true);
  try{
    const res = await fetch(API.byCategory(id), {cache:'no-store'});
    if(!res.ok) throw 0;
    const data = await res.json();
    const items = (data?.data ?? data?.plants ?? []).map(normalizePlant);
    renderGrid(items);
  }catch(e){
    console.warn('Category plants fetch failed — using MOCK filter');
    const map = { '1':'Fruit', '2':'Flower', '3':'Shade' };
    const key = map[String(id)] || '';
    const items = MOCK.plants
      .filter(p => key ? p.category.toLowerCase().includes(key.toLowerCase()) : true)
      .map(normalizePlant);
    renderGrid(items);
  }finally{ showSpinner(false); }
}

// ---------------- RENDER GRID ----------------
function renderGrid(items){
  if(!Array.isArray(items) || items.length===0){
    els.grid.innerHTML = '<div class="col-span-full text-center text-slate-600">No trees found.</div>';
    return;
  }
  els.grid.innerHTML = items.map(it=> cardHTML(it)).join('');
  els.grid.querySelectorAll('[data-action="details"]').forEach(btn=> btn.addEventListener('click', onOpenDetails));
  els.grid.querySelectorAll('[data-action="add"]').forEach(btn=> btn.addEventListener('click', onAddToCart));
}

function safeAttr(v=''){ return String(v).replace(/"/g, '&quot;'); }

function cardHTML(it){
  const {id, name, image, category, price, description} = it;
  // Put data on the clickable name so the modal has everything immediately.
  return `
    <article class="card overflow-hidden">
      <div class="aspect-[4/3] bg-slate-100">${image? `<img src="${image}" alt="${name}" class="h-full w-full object-cover"/>` : `<div class='skeleton w-full h-full'></div>`}</div>
      <div class="p-4">
        <button
          data-action="details"
          data-id="${id}"
          data-image="${safeAttr(image||'')}"
          data-category="${safeAttr(category||'Tree')}"
          data-price="${Number(price||0)}"
          data-desc="${encodeURIComponent(description||'')}"
          class="text-sm font-bold text-slate-900 hover:underline"
        >${name}</button>
        <p class="mt-1 text-sm text-slate-600">${truncate(description, 110)}</p>
        <div class="mt-2 flex items-center justify-between">
          <span class="tag">${category || 'Tree'}</span>
          <span class="font-semibold">${money(price)}</span>
        </div>
        <button data-action="add" data-id="${id}" data-name="${safeAttr(name)}" data-price="${Number(price||0)}" class="btn btn-primary w-full mt-3">Add to Cart</button>
      </div>
    </article>`;
}

// ---------------- MODAL ----------------
const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop';

async function onOpenDetails(e){
  const target = e.currentTarget;
  const id = target.dataset.id;

  // 1) Immediate fill from data-* so there is never a blank
  const instant = {
    id,
    name: target.textContent?.trim() || 'Tree',
    image: target.dataset.image || '',
    description: target.dataset.desc ? decodeURIComponent(target.dataset.desc) : '',
    category: target.dataset.category || 'Tree',
    price: Number(target.dataset.price || 0)
  };
  fillModal(instant);

  // 2) Try to fetch richer details; if succeed, override
  try{
    showSpinner(true);
    const res = await fetch(API.plant(id));
    if(!res.ok) throw 0;
    const { plant } = await res.json();
    const p = normalizePlant(plant||{});
    // Only override fields that come back non-empty
    fillModal({
      ...instant,
      name: p.name || instant.name,
      image: p.image || instant.image,
      description: p.description || instant.description,
      category: p.category || instant.category,
      price: typeof p.price==='number' && !Number.isNaN(p.price) ? p.price : instant.price
    });
  }catch(err){
    // nothing — we already filled from the card
  }finally{
    showSpinner(false);
  }
}

function fillModal(p){
  els.modalTitle.textContent = p.name || 'Tree Details';
  els.modalImg.src = p.image || PLACEHOLDER_IMG;               // <-- never blank now
  els.modalDesc.textContent = p.description || '';
  els.modalCat.textContent = p.category || 'Tree';
  els.modalPrice.textContent = typeof p.price==='number' ? money(p.price) : (p.price||'');
  openModal();
}

function openModal(){ els.modal.classList.remove('hidden'); document.body.style.overflow='hidden'; }
function closeModal(){ els.modal.classList.add('hidden'); document.body.style.overflow=''; }
window.closeModal = closeModal;

// ---------------- CART ----------------
function onAddToCart(e){
  const id = e.currentTarget.dataset.id;
  const name = e.currentTarget.dataset.name;
  const price = Number(e.currentTarget.dataset.price || 0);
  if(!state.cart[id]) state.cart[id] = {id,name,price,qty:0};
  state.cart[id].qty += 1;
  renderCart();
}
function removeFromCart(id){ delete state.cart[id]; renderCart(); }
function increaseQty(id){ if(!state.cart[id]) return; state.cart[id].qty += 1; renderCart(); }
function decreaseQty(id){ const it = state.cart[id]; if(!it) return; it.qty -= 1; if(it.qty<=0) delete state.cart[id]; renderCart(); }

function renderCart(){
  const entries = Object.values(state.cart);
  els.cartList.innerHTML = entries.map(it=> `
    <li class="flex items-center justify-between gap-3 py-2 px-4 rounded-2xl bg-[#CFF0DC] my-2">
      <div>
        <div class="font-medium">${it.name}</div>
        <div class="text-xs text-slate-500">${money(it.price)} × ${it.qty}</div>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1">
          <button aria-label="decrease" class="rounded-md bg-slate-100 px-2 py-1 hover:bg-slate-200" onclick="decreaseQty('${it.id}')">−</button>
          <span class="min-w-[1.5rem] text-center">${it.qty}</span>
          <button aria-label="increase" class="rounded-md bg-slate-100 px-2 py-1 hover:bg-slate-200" onclick="increaseQty('${it.id}')">+</button>
        </div>
        <div class="font-semibold">${money(it.price*it.qty)}</div>
        <button aria-label="remove" class="rounded-md bg-slate-100 px-2 py-1 hover:bg-slate-200" onclick="removeFromCart('${it.id}')">✖</button>
      </div>
    </li>`).join('');
  const total = entries.reduce((s,it)=> s + it.price*it.qty, 0);
  els.cartTotal.textContent = money(total);
  saveCart();
  window.removeFromCart = removeFromCart;
  window.increaseQty = increaseQty;
  window.decreaseQty = decreaseQty;
}

// ---------------- INIT ----------------
(async function init(){
  loadCart();
  renderCart();
  await loadCategories();
  await loadPlants();
})();
