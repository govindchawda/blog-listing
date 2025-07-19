// target id
const target_products = document.getElementById("products");
const pagination_id = document.getElementById("pagination");

// declare variables
let Deafult_page = 1;
let show_records_per_page = 3;
let global_data = [];
let all_data = [];
let current_category = "";
let search_query = "";

// get url from  windows
function init() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("category")) {
    current_category = params.get("category").replace(/-/g, " ");
  }
  if (params.has("query")) {
    search_query = params.get("query").replace(/-/g, " ");
  }
  GetData(current_category || undefined, { skipURLSync: true });
  
}
init();

// get data from json file

function GetData(value, opts = {}) {
  try {
    fetch('data.json').then((res) => res.json()).then((data) => {

      Deafult_page = 1;
      all_data = data;
      current_category = value ? value : "";

      let filtered_data = current_category ? data.filter(item => item.category === current_category) : data;

      global_data = filtered_data;

      const all_buttons = document.querySelectorAll(".products_rightBar li a");
      all_buttons.forEach((btn) => btn.classList.remove("color"));
      const current = document.getElementById(current_category || 'all');

      if (current) current.classList.add("color");

      if (search_query.trim() !== "") {
        applySearchFilter();
      } else {
        Show_products()
      }


      if (!opts.skipURLSync) syncURL();

    })
      .catch((error) => console.log("internal server error", error));
  } catch (error) {
    console.log("get products error", error);
  }
}

// pagination and show products

function Show_products() {
  let total_products = global_data.length;
  let total_page = Math.ceil(total_products / show_records_per_page);
  pagination(total_page);

  if (total_products === 0) {
    target_products.innerHTML = `<p class="empty-state"><img  src="https://tampcol.com/public/assets/images/product_not_found2.png" /></p>`;
    return;
  }

  let start_index = (Deafult_page - 1) * show_records_per_page;
  let end_index = Math.min(start_index + show_records_per_page, total_products);


  let statement = "";
  for (let i = start_index; i < end_index; i++) {
    const item = global_data[i];
    statement += `
      <div class="products_box">
        <img class="products_images" src="${item.image}" alt="">
        <div class="product-data">
          <h5>${item.category}</h5>
          <p>${item.title}</p>
        </div>
      </div>
    `;
  }

  target_products.innerHTML = statement;

  document.querySelectorAll(".dynamic-items").forEach((items) => {
    items.classList.remove("active");
  });

  const active_page = document.getElementById(`page${Deafult_page}`);
  if (active_page) {
    active_page.classList.add("active");
  }

  const prev_button = document.getElementById("prevbtn");
  const next_button = document.getElementById("nextbtn");
  if (Deafult_page == 1) {
    prev_button.classList.add("disable");
  } else {
    prev_button.classList.remove("disable");
  }
  if (Deafult_page == total_page) {
    next_button.classList.add("disable");
  } else {
    next_button.classList.remove("disable");
  }

}



function getPaginationItems(current, total, windowSize = 1) {
  const pages = [];
  pages.push(1);
  const start = Math.max(2, current - windowSize);
  const end = Math.min(total - 1, current + windowSize);
  if (start > 2) {
    pages.push("dots");
  }
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  if (end < total - 1) {
    pages.push("dots");
  }
  if (total > 1) {
    pages.push(total);
  }
  return pages;
}

function pagination(total_page) {
  if (!pagination_id) return;
  const items = getPaginationItems(Deafult_page, total_page, 1);

  const prev_button = `<li id="prevbtn" class="${Deafult_page === 1 ? 'disable' : ''}">
  <a onclick="prevButton()" href="javascript:void(0)"><i class="fa fa-arrow-left"></i> <span>Previous</span></a></li>`;
  
  const next_button = `<li id="nextbtn" class="${Deafult_page === total_page ? 'disable' : ''}"> <a onclick="nextButton()" href="javascript:void(0)">
  <span>Next</span> <i class="fa fa-arrow-right"></i></a></li>`;
  
  let list = "";
  items.forEach(items => {
    if (items === "dots") {
      list += `<li class="dots lists-number" ><i class="fa fa-ellipsis-h" aria-hidden="true"></i></li>`;
    } else {
      list += `<li id="page${items}" class="lists-number ${items === Deafult_page ? 'active' : ''}">
        <a onclick="page(${items})" href="javascript:void(0)">${items}</a></li>`;
    }
  });

  pagination_id.innerHTML = `${prev_button} ${list} ${next_button}`;
}

// using for next page
function nextButton() {
  Deafult_page++;
  Show_products();
}

// using for prev page
function prevButton() {
  Deafult_page--;
  Show_products();
}

// using for direct click on page
function page(index) {
  console.log(index,"index")
  Deafult_page = index;
  Show_products();
}



// use function for search
function searchProducts(value) {
  search_query = value.trim();
  applySearchFilter();
  syncURL();
}

function applySearchFilter() {
  let new_data = current_category ? all_data.filter(item => item.category === current_category) : all_data;

  if (search_query.trim() !== "") {
    new_data = new_data.filter(item =>{
      return item.title.toLowerCase().includes(search_query.toLowerCase()) ||item.category.toLowerCase().includes(search_query.toLowerCase())
    }
    );
  }

  global_data = new_data;
  Deafult_page = 1;
  Show_products();
}

// set categories and querys in window url
function syncURL() {
  const params = new URLSearchParams();
  if (current_category) {
    params.set("category", current_category.replace(/\s+/g, "-"));
  }
  if (search_query) {
    params.set("query", search_query.replace(/\s+/g, "-"));
  }
  const new_path = params.toString();
  const new_uRL = new_path ? `${window.location.pathname}?${new_path}` : window.location.pathname;

  window.history.replaceState({}, "", new_uRL)
}