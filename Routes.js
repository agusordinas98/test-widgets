function executeWidgetCode(){
    require(['DS/DataDragAndDrop/DataDragAndDrop',"DS/TagNavigatorProxy/TagNavigatorProxy"], function(DataDragAndDrop,TagNavigatorProxy) {
        let myWidget = {

            makeRequest: function (url, method="GET", data = null) {
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
                    console.log(responseStr);
                    const routesData = JSON.parse(responseStr);
                    console.log(routesData);
                    setTimeout(() => {
                        myWidget.displayRouteAndTaskInfo(routesData);
                    }, 5000);
                    return routesData;
                  } catch (error) {
                    console.error("Error fetching routes info:", error);
                  }
            },

            GETTasksInfoByID: async function(data) {
                try {
                    const jsonData = JSON.stringify(data);
                    const responseStr = await myWidget.makeRequest("https://8ef20a34c5e1.sn.mynetname.net/widget/GETTasksInfoByID",method="POST", jsonData);
                    console.log(responseStr);
                    const taskData = JSON.parse(responseStr);
                    console.log(taskData);
                  } catch (error) {
                    console.error("Error fetching tasks info:", error);
                  }
            },

            initTagger: function(routesData) {
				if(!myWidget.taggerProxy) {
                	var options = {
						widgetId: widget.id,
						filteringMode: "WithFilteringServices"
                	};
                	myWidget.taggerProxy = TagNavigatorProxy.createProxy(options);
                	myWidget.setTags(routesData.data);
                	myWidget.taggerProxy.addEvent("onFilterSubjectsChange", myWidget.onFilterSubjectsChange);
				}else{
                    console.log("Error en tagger  proxy");
                }
            },

            setTags: function(arrData) {
                console.log("Seteo de tags");
                let tags = myWidget.tagsData;

                tags = {}; 

                arrData.forEach(objData => {
                    let Id = objData.id;
                    tags[Id] = [];
                    type = objData.type
                    tags[Id].push({
                       object: objData.title,
                       sixw: "ds6w:what/"+type+"/title",
                       dispValue: objData.title
                    });
                    tags[Id].push({
                       object: objData.ownerFullName,
                       sixw: "ds6w:what/"+type+"/ownerFullName",
                       dispValue: objData.ownerFullName
                    });
                    tags[Id].push({
                        object: objData.state,
                        sixw: "ds6w:what/"+type+"/state",
                        dispValue: objData.state
                     });
                });
                console.log(tags);
                myWidget.taggerProxy.setSubjectsTags(tags);
                console.log("Seteo de tags exitoso");
            },

            displayRouteAndTaskInfo: function(routesData) {
                console.log(routesData.data)
                const routeInfoDiv = document.getElementById("routeInfo");
                if (!routeInfoDiv) {
                  console.error("Element with ID 'routeInfo' not found!");
                  return;
                }
            
                let tableHTML = "<table><thead><tr>";
                tableHTML += "<th>Título Ruta</th><th>Nombre Autor</th><th>Estado de la Ruta</th><th>Título tarea</th><th>Nombre autor</th><th>Estado tarea</th></tr></thead><tbody>";
            
                let maxTasks = 0;
            
                routesData.data.forEach(route => {
                  maxTasks = route.tasks.length
                  tableHTML += "<tr>";
                  tableHTML += `<td class="R${route.id}" rowspan="${maxTasks}" >${route.title}</td>`;
                  tableHTML += `<td rowspan="${maxTasks}">${route.ownerFullName}</td>`;
                  tableHTML += `<td rowspan="${maxTasks}">${route.state}</td>`;

                  route.tasks.forEach((task, index) => {
                    if (index === 0) {
                      tableHTML += `<td class="T${task.id}">${task.title}</td><td>${task.taskAssignee}</td><td>${task.current}</td></tr>`;
                    } else {
                      tableHTML += `<tr><td class="T${task.id}">${task.title}</td><td>${task.taskAssignee}</td><td>${task.current}</td></tr>`;
                  }});
                });
            
                tableHTML += "</tbody></table>";
                routeInfoDiv.innerHTML = tableHTML;
                routesData.data.forEach(route => {
                    routeId = route.id;
                    routeType = route.type;
                    routeDataDragJSON = {
                        "protocol": "3DXContent",
                        "version": "2.1",
                        "source": "X3PSEAR_AP",
                        "widgetId": "preview-fdc683",
                        "data":{
                            "items":[{
                                "envId": "R1132101311184",
                                "serviceId": "3DSpace",
                                "contextId": "ctx::VPLMCreator.Company Name.Solaer",
                                "objectId": routeId,
                                "objectType": routeType,
                                "displayName": "R-R1132101311184-0000112",
                                "i3dx": "",
                                "displayType": "Route"
                            }]
                        }
                    }
                    elemRoute = widget.body.querySelectorAll(".R"+routeId);
                    console.log(elemRoute);
                    DataDragAndDrop.draggable(elemRoute[0], {
                        data: JSON.stringify(routeDataDragJSON),
                        start: function(){
                            console.log("Start drag");
                        },
                        stop: function(){
                            console.log("Stop drag");
                        }
                    });
                    route.tasks.forEach(task => {
                        taskId = task.id;
                        taskType = task.type;
                        taskDataDragJSON = {
                            "data":{
                                "items":[{
                                    "envId": "R1132101311184",
                                    "serviceId": "3DSpace",
                                    "contextId": "ctx::VPLMCreator.Company Name.Solaer",
                                    "objectId": taskId,
                                    "objectType": taskType,
                                    "i3dx": "",
                                    "displayType": "Task"
                                }]
                            }
                        }
                        elemTask = widget.body.querySelectorAll(".T"+taskId);
                        console.log(elemTask);
                        DataDragAndDrop.draggable(elemTask[0], {
                            data: JSON.stringify(taskDataDragJSON),
                            start: function(){
                                console.log("Start drag");
                            },
                            stop: function(){
                                console.log("Stop drag");
                            }
                        });
                    })
                });
            },

            displayData: function(arrData) {
                var tableHTML = "<table><thead><tr><th>First Name</th><th>Last Name</th><th>userId</th></tr></thead><tbody>";

                for (var i = 0; i < arrData.length; i++) {
                    tableHTML =
                        tableHTML + "<tr><td>" + arrData[i].firstName + "</td><td>" + arrData[i].lastName + "</td><td>" + arrData[i].userId + "</td></tr>";
                }

                tableHTML += "</tbody></table>";

                widget.body.innerHTML = tableHTML;
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
                if (routesData) {
                    await myWidget.GETTasksInfoByID(routesData);
                    myWidget.initTagger(routesData);
                }
            },

            // makeDraggable: function() {
            //     let routesElems = widget.body.querySelectorAll(".dragRoute");

            //     for(var i=0;i<routesElems.length;i++) {
            //         DataDragAndDrop.draggable(routesElems[i] , {
            //             data: JSON.stringify(dataDragJSON),
            //             start: function(){
            //                 console.log("Start drag");
            //             },
            //             stop: function(){
            //                 console.log("Stop drag");
            //             }
            //         });
            //     }

            // },

            onLoadWidget: function() {
                myWidget.fetchAndDisplayData();
            }
        }
        widget.addEvent("onLoad", myWidget.onLoadWidget);
    });
}