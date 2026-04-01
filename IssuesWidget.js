function executeWidgetCode() {
    var myWidget = {
        loadData: async function () {
            try {
                // Aquí simulamos la carga del archivo response.json
                const response = await fetch("response.json");
                const data = await response.json();

                // Extraemos los issues
                const facets = data.body.facets;
                const issues = facets.filter(f => f.sixw.includes("ds6w:what/ds6w:policy") && f.object === "Issue");

                myWidget.displayIssues(issues);
            } catch (error) {
                console.error("Error cargando datos:", error);
            }
        },

        displayIssues: function (issues) {
            const container = document.getElementById("issuesList");
            if (!container) return;

            let html = "<table><thead><tr><th>Physical ID</th><th>Count</th></tr></thead><tbody>";

            issues.forEach(issue => {
                html += `<tr><td>${issue.getEnoviaRefineId}</td><td>${issue.count}</td></tr>`;
            });

            html += "</tbody></table>";
            container.innerHTML = html;
        }
    };

    widget.addEvent("onLoad", myWidget.loadData);
}
