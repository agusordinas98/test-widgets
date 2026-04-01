function executeWidgetCode(){
  require(['DS/DataDragAndDrop/DataDragAndDrop'], function (DataDragAndDrop) {
      let myWidget = {

          makeRequest: function (url, method="GET", data=null) {
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
                  xhr.send(data);
              });
          },

          GETRoutesInfoByID: async function() {
            try {
                const responseStr = await myWidget.makeRequest("https://8ef20a34c5e1.sn.mynetname.net/widget/GETRoutesInfoByID");
                const routesData = JSON.parse(responseStr);
                return routesData;
              } catch (error) {
                console.error("Error fetching routes info:", error);
              }
        },

          GETRouteInfoByID: async function(route_id) {
              try {
                  const responseStr = await myWidget.makeRequest("https://8ef20a34c5e1.sn.mynetname.net/widget/GETRouteInfoByID?route_id="+route_id);
                  const routesData = JSON.parse(responseStr);
                  return routesData;
                } catch (error) {
                  console.error("Error fetching routes info:", error);
                }
          },

          GETTasksInfoByID: async function(data) {
              try {
                const jsonData = JSON.stringify(data);
                console.log(jsonData);
                const responseStr = await myWidget.makeRequest("https://8ef20a34c5e1.sn.mynetname.net/widget/GETTasksInfoByID",method="POST", jsonData);
                  const taskData = JSON.parse(responseStr);
                  return taskData
                } catch (error) {
                  console.error("Error fetching tasks info:", error);
                }
          },
          
          GETDocInfo: async function(doc_id) {
            try {
              const responseStr = await myWidget.makeRequest(`https://8ef20a34c5e1.sn.mynetname.net/widget/GETDocInfo?doc_id=${doc_id}`,method="GET", null);
                const docData = JSON.parse(responseStr);
                return docData
              } catch (error) {
                console.error("Error fetching Doc info:", error);
              }
        },

          displayRouteInfo: function(routesData) {
              const routeInfoDiv = document.getElementById("routeInfo");
              if (!routeInfoDiv) {
                console.error("Element with ID 'routeInfo' not found!");
                return;
              }
          
              let tableHTML = "<table><thead><tr>";
              tableHTML += "<th>Título Ruta</th><th>Nombre Autor</th><th>Estado de la Ruta</th><th>Iiciar Firma</th><th>Ruta local del documento</th><th>Cargar Documento</th><th>Estado</th></tr></thead><tbody>";
          
              routesData.data.forEach(route => {
                maxTasks = route.tasks.length
                tableHTML += "<tr>";
                tableHTML += `<td class="R${route.id}" >${route.title}</td>`;
                tableHTML += `<td>${route.ownerFullName}</td>`;
                tableHTML += `<td>${route.state}</td>`;
                tableHTML += `<td><button class="start_sign_document_process" route_id=${route.id}>INICIAR  DE FIRMAS</button></td>`;
                tableHTML += `<td><input type="text" name="document_local_path" id="document_local_path" placeholder="Introduzca la ruta local del documento" required></td>`;
                tableHTML += `<td><button class="upload_document" route_id=${route.id}>SUBIR DOCUMENTO FIRMADO</button></td>`;

              });
          
              tableHTML += "</tbody></table>";
              routeInfoDiv.innerHTML = tableHTML;
          },


          onFilterSubjectsChange: function(eventFilter) {
              var arrResult = [];
      
              var arrSubjects = eventFilter.filteredSubjectList;
      
              for (var i = 0; i < myWidget.dataFull.length; i++) {
                 var objData = myWidget.dataFull[i];
                 if (arrSubjects.indexOf(objData.userId) !== -1) {
                     arrResult.push(objData);
                 }
              }

              if (arrResult.length === 0 && eventFilter.allfilters.length <= 0) {
                  arrResult = myWidget.dataFull;
              }
              myWidget.displayData(arrResult);
          },

          fetchAndDisplayData: async function() {
              console.log("Inicio del script");
              let routesData = await myWidget.GETRoutesInfoByID();
              console.log(routesData);
              let i = 0
              for (route of routesData["data"]){
                for (task of route["tasks"]){
                  task_title = task["title"]
                  task_id = task["id"]
                  if (!task_title.startsWith("Firma")){
                    routesData["data"].splice(i)
                    break
                  }
                }
                i += 1
              }

              myWidget.displayRouteInfo(routesData)
          },

          onLoadWidget: function() {
              myWidget.fetchAndDisplayData();
          }
      }

      document.addEventListener("click", async function (event) {
        if (event.target.classList.contains('start_sign_document_process')) {
            console.log("Botón de inicio de proceso de firmas pulsado");
            const route_id = event.target.getAttribute('route_id');
            let routeData = await myWidget.GETRouteInfoByID(route_id);
            if (routeData) {
              taskData = await myWidget.GETTasksInfoByID(routeData);
              for (let task of taskData["data"]) {
                task_title = task["dataelements"]["title"];
                if (task_title.startsWith("Firma de")){
                  doc_id = task["relateddata"]["references"][0]["id"];
                  docData = await myWidget.GETDocInfo(doc_id);
                  for (file of docData["data"]){
                    console.log(file);
                    file_title = file["dataelements"]["title"]
                    file_id = file["id"]
                    if (file_title) {
                      await myWidget.makeRequest(`https://8ef20a34c5e1.sn.mynetname.net/widget/DownloadDocument?DocID=${doc_id}&FileID=${file_id}`, method="POST");    
                    }
                  }
                  
                }
              }
            }
          }
      });
      
      document.addEventListener("click", async function (event) {
        if (event.target.classList.contains('upload_document')) {
          console.log("Botón de carga de documento pulsado");
          const path_input = document.getElementById("document_local_path");
          let document_local_path = path_input.value;
          console.log(document_local_path);
          
        }
      });

    widget.addEvent("onLoad", myWidget.onLoadWidget);
  })
}