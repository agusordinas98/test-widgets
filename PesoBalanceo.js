function executeWidgetCode() {
    require(['DS/papaparse'], function (Papa) {
        let myWidget = {
            
            processInfo: function () {
                console.log("*********************************************");
                console.log("Inició la función de process info");
                console.log("*********************************************");
                // document.addEventListener("DOMContentLoaded", function() {
                const csvData = `Level,Position Matrix,Masa,"Centro de Gravedad (X,Y,Z) [m]",Title,CAD Format,Lock,Instance Title,Revision,Type,Designación,Owner,Name,Is Last Version,Maturity State,Enterprise Item Number,Effectivity,Variant/Option,Current Evolution,Projected Evolution,Configuration Context,Instantiated Configuration,Weight,CoG along Y,CoG along X,CoG along Z
                    0,,,,mass23,CATIAV5,Not Locked,,1,Physical Product,,Lucas Delgado,prd-R1132101311184-00015479,true,En curso,, , , , , , ,,,,
                    1,"1.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,1.0,-162.230995178223,0.0,-143.991081237793",0.0190386767887171,"-0.100635269165039,0.138501525878906,0.01",testpart,CATIAV5,Not Locked,Part1.1,1,Physical Product,,Lucas Delgado,prd-R1132101311184-00015480,true,En curso,, , , , , , ,,,,
                    1,"1.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,1.0,-146.19436645507798,0.0,-34.0481033325195",,,sub,CATIAV5,Not Locked,Product1.1,1,Physical Product,,Lucas Delgado,prd-R1132101311184-00015478,true,En curso,, , , , , , ,,,,
                    2,"1.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,1.0,96.22566380347409,0.0,71.4664306640625",0.0339776137410494,"0.01,0.265625152587891,-0.0901933212280273",Part1,CATIAV5,Not Locked,Part1.1,1,Physical Product,,Lucas Delgado,prd-R1132101311184-00015481,true,En curso,, , , , , , ,,,,`;

                Papa.parse(csvData, {
                    header: true,
                    skipEmptyLines: true,
                    complete: function (results) {
                        const data = myWidget.processCSV(results.data);
                        myWidget.displayTable(data);
                    }
                });
            },

            processCSV: function (data) {
                const lvl = 0;
                const [ux, uy, uz] = [1, 2, 3];
                const [vx, vy, vz] = [4, 5, 6];
                const [wx, wy, wz] = [7, 8, 9];
                const [dx, dy, dz] = [10, 11, 12];
                const m = 13;
                const [locx, locy, locz] = [14, 15, 16];
                // Convert data to a suitable format
                const processedData = data.map(row => {
                    const fields = row["Position Matrix"].split(',').map(parseFloat);
                    const cg = row["Centro de Gravedad (X,Y,Z) [m]"] ? row["Centro de Gravedad (X,Y,Z) [m]"].split(',').map(parseFloat) : [0, 0, 0];
                    return [
                        parseInt(row.Level),
                        ...fields.slice(0, 9),
                        ...fields.slice(9, 12).map(x => x / 1000), // Convert to meters
                        parseFloat(row.Masa || 0),
                        ...cg
                    ];
                });

                // Fill missing transformation matrices
                for (let i = 0; i < processedData.length; i++) {
                    const subArray = processedData[i].slice(ux, dz + 1);
                    if (subArray.every(x => x === 0)) {
                        processedData[i].splice(ux, 12, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0);
                    }
                }
                // Add a zero line at the end
                processedData.push(new Array(17).fill(0));
                let nivel_buscado = Math.max(...processedData.map(row => row[lvl]));
                while (nivel_buscado >= 0) {
                    for (let i = 0; i < processedData.length - 1; i++) {
                        const nivel_actual = processedData[i][lvl];
                        const nivel_prox = processedData[i + 1][lvl];
                        if (nivel_actual === (nivel_buscado - 1) && nivel_prox === nivel_buscado) {
                            let j = i;
                            let [M, CGX, CGY, CGZ] = [0, 0, 0, 0];
                            while (processedData[j + 1][lvl] >= nivel_buscado) {
                                j += 1;
                                if (processedData[j][lvl] === nivel_buscado) {
                                    const mi = processedData[j][m];
                                    M += mi;
                                    const cgx = processedData[j][dx] + processedData[j][locx] * processedData[j][ux] + processedData[j][locy] * processedData[j][vx] + processedData[j][locz] * processedData[j][wx];
                                    const cgy = processedData[j][dy] + processedData[j][locx] * processedData[j][uy] + processedData[j][locy] * processedData[j][vy] + processedData[j][locz] * processedData[j][wy];
                                    const cgz = processedData[j][dz] + processedData[j][locx] * processedData[j][uz] + processedData[j][locy] * processedData[j][vz] + processedData[j][locz] * processedData[j][wz];
                                    CGX += cgx * mi;
                                    CGY += cgy * mi;
                                    CGZ += cgz * mi;
                                }
                            }
                            processedData[i][m] = M;
                            processedData[i][locx] = CGX / M;
                            processedData[i][locy] = CGY / M;
                            processedData[i][locz] = CGZ / M;
                        }
                    }
                    nivel_buscado -= 1;
                }
                // Prepare final data
                const finalData = processedData.slice(0, -1).map(row => [
                    row[lvl],
                    row[m],
                    row[locx] * 1000,
                    row[locy] * 1000,
                    row[locz] * 1000
                ]);

                return finalData;
            },

            displayTable: function (data) {
                const table = document.createElement("table");
                table.border = 1;
                const header = table.insertRow();
                ["Nivel", "Masa [Kg]", "localx [mm]", "localy [mm]", "localz [mm]"].forEach(text => {
                    const cell = header.insertCell();
                    cell.appendChild(document.createTextNode(text));
                });
                data.forEach(row => {
                    const rowElement = table.insertRow();
                    row.forEach(cellData => {
                        const cell = rowElement.insertCell();
                        cell.appendChild(document.createTextNode(cellData));
                    });
                });
                document.body.appendChild(table);
            },

            onLoadWidget: function() {
                myWidget.processInfo();
            }
        }
        widget.addEvent("onLoad", myWidget.onLoadWidget);
    });
}