function executeWidgetCode() {
    // Insert CSS into the document
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
        /* Reset some basic elements */
        body, p {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            color: #333;
        }

        /* Body styling */
        body {
            background-color: #f4f4f9;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        /* Table styling */
        table {
            width: 80%;
            margin: 20px auto;
            border-collapse: collapse;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            background-color: #fff;
        }

        /* Table headers */
        table th {
            background-color: #6200ea;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: normal;
        }

        /* Table rows */
        table tr:nth-child(even) {
            background-color: #f2f2f2;
        }

        /* Table cells */
        table td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
        }

        /* Hover effect for rows */
        table tr:hover {
            background-color: #dcdcdc;
        }

        /* Styling for draggable rows */
        .dragEligible {
            cursor: move;
        }

        /* Styling for dragged element */
        .dragEligible:active {
            background-color: #e0e0e0;
        }

        /* Table caption styling */
        table caption {
            margin: 10px 0;
            font-size: 1.2em;
            font-weight: bold;
            color: #555;
        }

        /* Customizing the widget body */
        #widget-body {
            width: 100%;
            max-width: 1200px;
            margin: auto;
            padding: 20px;
        }
    `;
    document.head.appendChild(style);

    require(['DS/DataDragAndDrop/DataDragAndDrop'], function(DataDragAndDrop) {
        var myWidget = {
            dataFull: [
                {
                    firstName: "John",
                    lastName: "Doe",
                    userId: "JD1"
                },
                {
                    firstName: "Jane",
                    lastName: "Doe",
                    userId: "JD2"
                },
                {
                    firstName: "David",
                    lastName: "Doe",
                    userId: "DD1"
                },
                {
                    firstName: "David",
                    lastName: "Black",
                    userId: "DB1"
                },
                {
                    firstName: "David",
                    lastName: "White",
                    userId: "DW1"
                },
                {
                    firstName: "Walter",
                    lastName: "White",
                    userId: "WW1"
                }
            ],

            displayData: function(arrData) {
                var tableHTML = "<table><thead><tr><th>First Name</th><th>Last Name</th><th>User ID</th></tr></thead><tbody>";

                for (var i = 0; i < arrData.length; i++) {
                    tableHTML +=
                        "<tr class='dragEligible'><td>" + arrData[i].firstName + "</td><td>" 
                        + arrData[i].lastName + "</td><td>" + arrData[i].userId + "</td></tr>";
                }

                tableHTML += "</tbody></table>";

                document.getElementById("widget-body").innerHTML = tableHTML;
            },
            makeDraggable: function() {
                // Code for drag functionality
                var allElems  = document.querySelectorAll(".dragEligible");
                for (var i = 0; i < allElems.length; i++) {
                    DataDragAndDrop.draggable(allElems[i], {
                        data: allElems[i].id,
                        start: function() {
                            console.log("Start drag");
                        },
                        stop: function() {
                            console.log("Stop drag");
                        }
                    });
                }
            },

            onLoadWidget: function() {
                myWidget.displayData(myWidget.dataFull);
                myWidget.makeDraggable(); // Code for drag functionality
            }
        };

        widget.addEvent("onLoad", myWidget.onLoadWidget);
    });
}
