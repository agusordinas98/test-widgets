// URL del JSON en GitHub Pages
const jsonUrl = "https://agusordinas98.github.io/test-widgets/response.json";

async function loadIssues() {
    try {
        const response = await fetch(jsonUrl);
        if (!response.ok) {
            throw new Error("Error al cargar el JSON: " + response.status);
        }

        const data = await response.json();

        // Verificamos que tenga el bloque "issues"
        if (!data.body || !data.body.issues) {
            throw new Error("Formato de JSON inválido: falta 'body.issues'");
        }

        const issues = data.body.issues;

        // Construimos la tabla
        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Physical ID</th>
                        <th>Name</th>
                        <th>Title</th>
                        <th>State</th>
                        <th>Owner</th>
                    </tr>
                </thead>
                <tbody>
        `;

        issues.forEach(issue => {
            const physicalId = issue.physicalId || "";
            const name = issue.name || "";
            const title = issue.title || "";
            const state = issue.state || "";
            const ownerName = (issue.owner && issue.owner.fullName) ? issue.owner.fullName : "";

            html += `
                <tr>
                    <td>${physicalId}</td>
                    <td>${name}</td>
                    <td>${title}</td>
                    <td>${state}</td>
                    <td>${ownerName}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        document.getElementById("issues-container").innerHTML = html;

    } catch (error) {
        document.getElementById("issues-container").innerHTML = 
            `<p style="color:red;">${error.message}</p>`;
    }
}

// Ejecutamos al cargar la página
loadIssues();
