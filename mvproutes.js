console.log("Inicio del script");

function makeRequest(url, data = null) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
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
}

async function GETRoutesInfoByID() {
  try {
    const responseStr = await makeRequest("https://8ef20a34c5e1.sn.mynetname.net/widget/GETRoutesInfoByID");
    console.log(responseStr);
    const routesData = JSON.parse(responseStr);
    console.log(routesData);
    setTimeout(() => {
      displayRouteAndTaskInfo(routesData);
    }, 5000);
    return routesData;
  } catch (error) {
    console.error("Error fetching routes info:", error);
  }
}

async function GETTasksInfoByID(data) {
  try {
    const jsonData = JSON.stringify(data);
    const responseStr = await makeRequest("https://8ef20a34c5e1.sn.mynetname.net/widget/GETTasksInfoByID", jsonData);
    console.log(responseStr);
    const taskData = JSON.parse(responseStr);
    console.log(taskData);
    //displayRouteAndTaskInfo(taskData);
  } catch (error) {
    console.error("Error fetching tasks info:", error);
  }
}

async function fetchAndDisplayData() {
  console.log("Inicio del script");
  const routesData = await GETRoutesInfoByID();
  if (routesData) {
    await GETTasksInfoByID(routesData);
  }
}

fetchAndDisplayData();

function displayRouteAndTaskInfo(routesData) {
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
    console.log(maxTasks);
    tableHTML += "<tr>";
    tableHTML += `<td rowspan="${maxTasks}">${route.title}</td>`;
    tableHTML += `<td rowspan="${maxTasks}">${route.ownerFullName}</td>`;
    tableHTML += `<td rowspan="${maxTasks}">${route.state}</td>`;

    route.tasks.forEach((task, index) => {
      console.log(maxTasks+"=?=?=?="+index);
      if (index === 0) {
        tableHTML += `<td>${task.title}</td><td>${task.taskAssignee}</td><td>${task.current}</td></tr>`;
      } else {
        tableHTML += `<tr><td>${task.title}</td><td>${task.taskAssignee}</td><td>${task.current}</td></tr>`;
      
    }});
  });

  tableHTML += "</tbody></table>";
  routeInfoDiv.innerHTML = tableHTML;
}
