function executeWidgetCode() {
    let myWidget = {

        makeRequest: function (url) {
            return new Promise((resolve, reject) => {
                let xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);
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

        showProject: async function () {
        const projects = await myWidget.makeRequest("https://8ef20a34c5e1.sn.mynetname.net:8700/inventory/projects");
        console.log(projects);
        },

        onLoadWidget: function() {
            myWidget.showProject();
        }


    }

    widget.addEvent("onLoad", myWidget.onLoadWidget);
}