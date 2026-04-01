function executeWidgetCode() {
    require(['DS/DataDragAndDrop/DataDragAndDrop'], function (DataDragAndDrop) {
        let myWidget = {
            makeRequest: function (url, method="GET") {
                return new Promise((resolve, reject) => {
                    let xhr = new XMLHttpRequest();
                    xhr.open(method, url, true);
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200) {
                                resolve(xhr.responseText);
                            } else {
                                reject(new Error("Request failed with status " + xhr.status));
                            }
                        }
                    };
                    xhr.send();
                });
            },

            calculateCommittedQuantity: function (partId, productData) {
                let committedQuantity = 0;

                productData.forEach(product => {
                    const quantityToProduce = product.quantityToProduce;
                    const requirements = product.requirements;

                    if (requirements[partId]) {
                        committedQuantity += requirements[partId] * quantityToProduce;
                    }
                });

                return committedQuantity;
            },

            calculateEngaged: function (partId, productData) {
                let engaged = 0;

                productData.forEach(product => {
                    const inProduction = product.inProduction;
                    const requirements = product.requirements;

                    if (requirements[partId]) {
                        engaged += requirements[partId] * inProduction;
                    }
                });

                return engaged;
            },

            createFilters: function (productData) {
                const filterDiv = document.getElementById('filters');
                if (!filterDiv) {
                    console.error("Element with ID 'filters' not found!");
                    return;
                }

                let filterHTML = `<select id="stockFilter">
                                    <option value="">Todos los estados</option>
                                    <option value="stock-ok">Stock OK</option>
                                    <option value="low-stock">Poco Stock</option>
                                    <option value="out-of-stock">Sin Stock</option>
                                  </select>`;

                filterHTML += `<select id="productFilter">
                                <option value="">Todos los productos</option>`;

                productData.forEach(product => {
                    filterHTML += `<option value="${product.id}">${product.name}</option>`;
                });

                filterHTML += `</select>`;

                filterDiv.innerHTML = filterHTML;

                document.getElementById('stockFilter').addEventListener('change', myWidget.applyFilters);
                document.getElementById('productFilter').addEventListener('change', myWidget.applyFilters);
            },

            applyFilters: function () {
                const stockFilter = document.getElementById('stockFilter').value;
                const productFilter = document.getElementById('productFilter').value;

                const allRows = document.querySelectorAll('#inventoryInfo table tbody tr');

                allRows.forEach(row => {
                    const stockClass = row.className;
                    const partId = row.querySelector('td').textContent;

                    let showRow = true;

                    if (stockFilter && !row.classList.contains(stockFilter)) {
                        showRow = false;
                    }

                    if (productFilter && !myWidget.isPartInProduct(partId, productFilter)) {
                        showRow = false;
                    }

                    row.style.display = showRow ? '' : 'none';
                });
            },

            isPartInProduct: function (partId, productId) {
                return myWidget.productData.some(product => {
                    return product.id === productId && product.requirements[partId];
                });
            },

            displayOrdersInfo: function (productData) {
                const ordersInfoDiv = document.getElementById("ordersInfo");
                if (!ordersInfoDiv) {
                    console.error("Element with ID 'ordersInfo' not found!");
                    return;
                }

                let tableHTML = "<table><thead><tr>";
                tableHTML += "<th>Nombre Producto</th><th>ID Prodcuto</th><th>En producción</th><th>Simulación</th></tr></thead><tbody>";

                productData.forEach(product => {
                    console.log(product);
                    tableHTML += `<tr>`;
                    tableHTML += `<td>${product.name}</td>`;
                    tableHTML += `<td>${product.id}</td>`;
                    tableHTML += `<td>${product.inProduction}</td>`
                    tableHTML += `<td>
                        <button class="update-order-quantity" data-product-id="${product.id}" data-delta="-1">-</button>
                        ${product.quantityToProduce}
                        <button class="update-order-quantity" data-product-id="${product.id}" data-delta="1">+</button>
                    </td>`;

                    tableHTML += `</tr>`;
                });

                tableHTML += "</tbody></table>";
                ordersInfoDiv.innerHTML = tableHTML;
            },

            displayInventoryInfo: function (partsData, productData) {
                const inventoryInfoDiv = document.getElementById("inventoryInfo");
                if (!inventoryInfoDiv) {
                    console.error("Element with ID 'inventoryInfo' not found!");
                    return;
                }

                let tableHTML = "<table><thead><tr>";
                tableHTML += "<th>Id Parte</th><th>Grupo</th><th>Nombre</th><th>Criticalidad</th><th>Comprometido</th><th>Stock</th><th>Simulación</th><th>Pedido</th><th>Stock proyectado</th><th>Status</th></tr></thead><tbody>";

                partsData.forEach(part => {
                    const committedQuantity = myWidget.calculateCommittedQuantity(part.id, productData);
                    const engaged = myWidget.calculateEngaged(part.id, productData)
                    const projectedStock = part.stock - committedQuantity - engaged + part.ordered;
                    let statusClass = '';

                    if (projectedStock > 50) {
                        statusClass = 'stock-ok';
                    } else if (projectedStock > 10) {
                        statusClass = 'low-stock'; 
                    } else {
                        statusClass = 'out-of-stock'; 
                    }

                    tableHTML += `<tr class="${statusClass}">`;
                    tableHTML += `<td>${part.id}</td>`;
                    tableHTML += `<td>${part.name}</td>`;
                    tableHTML += `<td>${part.description}</td>`;
                    tableHTML += `<td>${part.critically}</td>`;
                    tableHTML += `<td>${engaged}</td>`;
                    tableHTML += `<td>${part.stock}</td>`;
                    tableHTML += `<td>${committedQuantity}</td>`;
                    tableHTML += `<td>${part.ordered}</td>`;
                    tableHTML += `<td>${projectedStock}</td>`;
                    tableHTML += `<td>${statusClass.replace('-', ' ')}</td>`;
                    tableHTML += `</tr>`;
                });

                tableHTML += "</tbody></table>";
                inventoryInfoDiv.innerHTML = tableHTML;

                myWidget.createFilters(productData);
            },

            fetchAndDisplayData: async function () {
                try {
                    const responseStrParts = await myWidget.makeRequest("https://8ef20a34c5e1.sn.mynetname.net:8701/inventory/parts");
                    const responseStrProducts = await myWidget.makeRequest("https://8ef20a34c5e1.sn.mynetname.net:8701/inventory/products");
                    const partsData = JSON.parse(responseStrParts);
                    const productData = JSON.parse(responseStrProducts);
                    myWidget.partsData = partsData;
                    myWidget.productData = productData;

                    myWidget.displayInventoryInfo(partsData, productData);
                    myWidget.displayOrdersInfo(productData);

                } catch (error) {
                    console.error("Error fetching inventory info:", error);
                }
            },

            updateOrderQuantity: async function (productId, delta) {
                console.log("Actualizando orden");
                const response = await myWidget.makeRequest(`https://8ef20a34c5e1.sn.mynetname.net:8701/inventory/products/${productId}?delta=${delta}`)
                myWidget.fetchAndDisplayData();
            },

            onLoadWidget: function () {
                myWidget.fetchAndDisplayData();
            }
        };

        document.addEventListener("click", function (event) {
            if (event.target.classList.contains('update-order-quantity')) {
                console.log("Botón pulsado");
                const productId = event.target.getAttribute('data-product-id');
                const delta = parseInt(event.target.getAttribute('data-delta'));
                myWidget.updateOrderQuantity(productId, delta);
            }
        });
        
        widget.addEvent("onLoad", myWidget.onLoadWidget);

    });
}
