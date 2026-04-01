function executeWidgetCode() {
    require(["DS/TagNavigatorProxy/TagNavigatorProxy"], function(TagNavigatorProxy) {
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
                var tableHTML = "<table><thead><tr><th>First Name</th><th>Last Name</th><th>userId</th></tr></thead><tbody>";

                for (var i = 0; i < arrData.length; i++) {
                    tableHTML =
                        tableHTML + "<tr><td>" + arrData[i].firstName + "</td><td>" + arrData[i].lastName + "</td><td>" + arrData[i].userId + "</td></tr>";
                }

                tableHTML += "</tbody></table>";

                widget.body.innerHTML = tableHTML;
            },

            onLoadWidget: function() {
                //Initialize Tags
                myWidget.initTagger();

                //Display data
                myWidget.displayData(myWidget.dataFull);
            },

            onSearchWidget: function(searchQuery) {
                var arrResult = [];
                for (var i = 0; i < myWidget.dataFull.length; i++) {
                    var objData = myWidget.dataFull[i];
                    if (objData.firstName === searchQuery || objData.lastName === searchQuery) {
                        arrResult.push(objData);
                    }
                }
                myWidget.displayData(arrResult);
            },

            onResetSearchWidget: function() {
                myWidget.displayData(myWidget.dataFull);
            },

            taggerProxy: null,
            tagsData: {},

            initTagger: function() {
				if(!myWidget.taggerProxy) {
                	var options = {
						widgetId: widget.id,
						filteringMode: "WithFilteringServices"
                	};
                	myWidget.taggerProxy = TagNavigatorProxy.createProxy(options);
                	myWidget.setTags(myWidget.dataFull);
                	myWidget.taggerProxy.addEvent("onFilterSubjectsChange", myWidget.onFilterSubjectsChange);
				}
            },

            setTags: function(arrData) {
                var tags = myWidget.tagsData; //Shortcut for script

                tags = {}; //Clear

                for (var i = 0; i < arrData.length; i++) {
                    var objData = arrData[i];
                    var uId = objData.userId;
                    tags[uId] = [];
                    tags[uId].push({
                       object: objData.firstName,
                       sixw: "ds6w:who/firstName",
                       dispValue: objData.firstName
                    });
                    tags[uId].push({
                       object: objData.lastName,
                       sixw: "ds6w:who/lastName",
                       dispValue: objData.lastName
                    });
                    tags[uId].push({
                       object: objData.firstName + " " + objData.lastName,
                       sixw: "ds6w:who/fullName",
                       dispValue: objData.firstName + " " + objData.lastName
                    });
                }

                myWidget.taggerProxy.setSubjectsTags(tags);
            },

            onFilterSubjectsChange: function(eventFilter) {
				var arrResult = [];
				
                var arrSubjects = eventFilter.filteredSubjectList;
				
                for (var i = 0; i < myWidget.dataFull.length; i++) {
                   var objData = myWidget.dataFull[i];
                   if (arrSubjects.indexOf(objData.userId) !== -1) {
                        //It's one of the selected subject
                       arrResult.push(objData);
                   }
                }

                if (arrResult.length === 0 && eventFilter.allfilters.length <= 0) {
                    //No result and no filters applied : Filters are probably cleared !
                    arrResult = myWidget.dataFull;
                }
                myWidget.displayData(arrResult);
            }
        };

        widget.addEvent("onLoad", myWidget.onLoadWidget);
        widget.addEvent("onSearch", myWidget.onSearchWidget);
        widget.addEvent("onResetSearch", myWidget.onResetSearchWidget);
    });
}
