//require("cloud/main_Akshit.js");



// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
	response.success("Hello world!");
});


// Cloud function to fetch list of classes in app.
Parse.Cloud.define("fetchClassList", function(request, response) {

	// Set up to modify user data
	// Parse.Cloud.useMasterKey();

	// console.log("Function called");

	var stringResponse;
	var jsonArrayClassses = [];
	var jsonArrayResponse = [];
	var posCurrent = 0;
	var dateDefault = new Date(1970, 0, 1, 0, 0, 0, 0);

	// jsonArrayClassses.push("_User");
	jsonArrayClassses.push("ChannelsList");
	jsonArrayClassses.push("ChannelTypes");
	jsonArrayClassses.push("ContactInfo");
	jsonArrayClassses.push("Documents");
	jsonArrayClassses.push("Feedbacks");
	jsonArrayClassses.push("GoalCategoryTypes");
	jsonArrayClassses.push("Goals");
	jsonArrayClassses.push("Links");
	jsonArrayClassses.push("Messages");
	jsonArrayClassses.push("Options");
	jsonArrayClassses.push("Questions");
	jsonArrayClassses.push("Updates");
	jsonArrayClassses.push("ResultActions");
	jsonArrayClassses.push("ResultColors");
	jsonArrayClassses.push("ResultDetails");
	jsonArrayClassses.push("Surveys");
	jsonArrayClassses.push("UserType");
	jsonArrayClassses.push("Videos");


	for (var i = 0; i < jsonArrayClassses.length; i++) {
		console.log("ClassName: "+jsonArrayClassses[i]);
		// get classname using Parse.Object.extend(...);
		var classNameParse = Parse.Object.extend(jsonArrayClassses[i]);

		// Find latest updatedAt using querying records by Class Name
		var query = new Parse.Query(classNameParse);
		query.descending("updatedAt");
		query.limit(1);
		query.find({
			success: function(results) {
				// console.log("Results Size: " + results.length + ", Current Position: " + i + ", ClassName: " + jsonArrayClassses[posCurrent]);

				// If any record found, add latest updatedAt & class name to response array.
				if (results.length != 0) {
					for (var j = 0; j < results.length; j++) {
						console.log("Fetched Details ==> ClassName: " + results[j].className + ", UpdatedAt: " + results[j].updatedAt+", ObjectID: "+results[j].id);
						var item = {};
						item["className"] = results[j].className;
						item["updatedAt"] = results[j].updatedAt.getTime();
						item["objectId"] = results[j].id;
						jsonArrayResponse.push(item);
						posCurrent++;
					}
				}

				// No result found for current class. Adding default date (1 Jan, 1970) to response array.
				else {
					console.log("No record found for class: " + jsonArrayClassses[posCurrent]);
					var item = {};
					item["className"] = jsonArrayClassses[posCurrent];
					item["updatedAt"] = dateDefault.getTime();
					item["objectId"] = "";
					jsonArrayResponse.push(item);
					posCurrent++;
				}

				// Return success response if count matches classes list size
				if (posCurrent == (jsonArrayClassses.length)) {
					stringResponse = JSON.stringify(jsonArrayResponse);
					response.success(stringResponse);
				}
			},
			error: function() {
				// Error in function, adding default values to response array.
				var item = {};
				item["className"] = jsonArrayClassses[posCurrent];
				item["updatedAt"] = dateDefault.getTime();
				item["objectId"] = "";
				jsonArrayResponse.push(item);
				posCurrent++;
				console.error("Error fetching details for class: " + jsonArrayClassses[posCurrent]);
			}
		});
	}
	// response.success("Hello world!");
});