document.addEventListener('DOMContentLoaded', function() {
    
    const productNameInput = document.getElementById('name');
    const productCategoryInput = document.getElementById('category');
    const productPriceInput = document.getElementById('price');
    const productDiscountInput = document.getElementById('discount');
    const productDescriptionInput = document.getElementById('description');
    const submitButton = document.getElementById('submit');
    const clearButton = document.getElementById('clear');
    const tbody = document.getElementById('tbody');
    const toggleThemeButton = document.getElementById('toggle-theme');
    const deleteAllButton = document.getElementById('deleteAll');
    const searchInput = document.getElementById('search');
    const searchButton = document.getElementById('searchButton');
    
    let isEditMode = false;
    let editIndex = null;
    let deleteProductId = null;

   
    function updateDashboard() {
    const products = loadFromLocalStorage();
    const totalProducts = products.length;

    // Calculate total sales
    const totalSales = products.reduce((sum, product) => {
        const price = parseFloat(product.price) || 0;
        const discount = parseFloat(product.discount) || 0;
        return sum + (price - (price * discount / 100));
    }, 0);

    // Debugging logs
    console.log('Total Products:', totalProducts);
    console.log('Total Sales:', totalSales);
    

    

    // Update dashboard elements
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalSales').textContent = `$${parseFloat(totalSales).toFixed(2)}`;
}


        
    function getTotal() {
        const price = parseFloat(productPriceInput.value) || 0;
        const discount = parseFloat(productDiscountInput.value) || 0;
        const total = price - (price * discount / 100);
        document.getElementById('total').textContent = total.toFixed(2);
        return total.toFixed(2);
    }

    productPriceInput.addEventListener('keyup', getTotal);
    productDiscountInput.addEventListener('keyup', getTotal);

    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        toggleThemeButton.classList.toggle('fa-sun');
        toggleThemeButton.classList.toggle('fa-moon');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }

    toggleThemeButton.addEventListener('click', toggleTheme);

    function loadThemeFromLocalStorage() {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            toggleThemeButton.classList.remove('fa-moon');
            toggleThemeButton.classList.add('fa-sun');
        } else {
            document.body.classList.remove('dark-mode');
            toggleThemeButton.classList.remove('fa-sun');
            toggleThemeButton.classList.add('fa-moon');
        }
    }

    function clearForm() {
        productNameInput.value = '';
        productCategoryInput.value = '';
        productPriceInput.value = '';
        productDiscountInput.value = '';
        productDescriptionInput.value = '';
        document.getElementById('total').textContent = '';
        submitButton.textContent = 'Create';
        isEditMode = false;
        editIndex = null;
    }


    function validateForm() {
        return productNameInput.value && productCategoryInput.value && productPriceInput.value && productDescriptionInput.value;
    }

    function saveToLocalStorage(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }

    function loadFromLocalStorage() {
        return JSON.parse(localStorage.getItem('products')) || [];
        return products;
    }

    function renumberProductIds(products) {
        products.forEach((product, index) => {
          product.id = index + 1;
        });
      }
      

    function getNextId(products) {
        if (products.length === 0) return 1;
        const ids = products.map(p => p.id);
        return Math.max(...ids) + 1;
    }

    function displayTableData() {
        tbody.innerHTML = '';
        const products = loadFromLocalStorage();
        if (products.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="9">No data available</td>';
            tbody.appendChild(row);
        } else {
            products.forEach(product => createRow(product));
        }
        updateDashboard();
    }


    function createRow(product) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.price}$</td>
            <td>${product.discount}%</td>
            <td>${product.total}$</td>
            <td>${product.description}</td>
            <td><button class="update-button"><i class="fas fa-edit"></i></button></td>
            <td><button class="delete-button"><i class="fas fa-trash-alt"></i></button></td>
        `;
        tbody.appendChild(row);

        if (scrollTo) {
            row.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }

        row.querySelector('.update-button').addEventListener('click', () => {
            isEditMode = true;
            editIndex = product.id;
            productNameInput.value = product.name;
            productCategoryInput.value = product.category;
            productPriceInput.value = product.price;
            productDiscountInput.value = product.discount;
            productDescriptionInput.value = product.description;
            document.getElementById('total').textContent = product.total;
            submitButton.textContent = 'Update';
            window.scrollTo(0, 0);
        });

        row.querySelector('.delete-button').addEventListener('click', () => {
            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes.""""',
                cancelButtonText: 'No.."""'
            }).then((result) => {
                if (result.isConfirmed) {
                    deleteProduct(product.id);
                }
            });
        
        });
    }


    function deleteProduct(id) {
        let products = loadFromLocalStorage();
        products = products.filter(product => product.id !== id);
        renumberProductIds(products);
        saveToLocalStorage(products);
         displayTableData();
    }

    deleteAllButton.addEventListener('click', () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This will delete all products. You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('products');
                displayTableData();
            }
        });
    });


    submitButton.addEventListener('click', () => {
        if (validateForm()) {
            let products = loadFromLocalStorage();
            const product = {
                id: isEditMode ? editIndex : getNextId(products),
                name: productNameInput.value,
                category: productCategoryInput.value,
                price: parseFloat(productPriceInput.value),
                discount: parseFloat(productDiscountInput.value),
                total: parseFloat(getTotal()),
                description: productDescriptionInput.value
            };
            if (isEditMode) {
                products = products.map(p => p.id === editIndex ? product : p);
            } 
            else {
                products.push(product);
            }
            saveToLocalStorage(products);
            displayTableData();
            clearForm();
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        } else {
            alert('Please fill in all fields');
        }
    });

    function filterTable() {
        const query = searchInput.value.toLowerCase();
        const rows = tbody.querySelectorAll('tr');

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            let match = false;

            cells.forEach(cell => {
                if (cell.textContent.toLowerCase().includes(query)) {
                    match = true;
                }
            });

            row.style.display = match ? '' : 'none';
        });
    }

    searchButton.addEventListener('click', filterTable);
    searchInput.addEventListener('keyup', filterTable);

    clearButton.addEventListener('click', clearForm);
    updateDashboard();
    loadThemeFromLocalStorage();
    displayTableData();
});




