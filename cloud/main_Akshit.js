// Functions

Parse.Cloud.define("checkForUpdates", funCheckForUpdates);


// Triggers

Parse.Cloud.afterSave("Feedbacks", afterSaveFeedback);

Parse.Cloud.afterSave("UserAchievementsProgress", afterSaveUserAchievementsProgress);


// Background jobs



function funCheckForUpdates(request, response) {

    var user = request.user;

    if (!user) {
        response.error("No user passed. Updates are available for users only.");
    } else {
        console.log("User: " + user.id);

        var version = request.params.version;
        if (!version) {
            version = 0;
        }

        var query = new Parse.Query("Updates");
        query.equalTo("isActive", true);
        query.descending("datetime");
        query.lessThanOrEqualTo("datetime", new Date());
        query.greaterThan("versionReleased", version);
        query.first({
            success: function(update) {
                // newestUpdate = update;
                console.log(update);
                return update;
            },
            error: function(error) {
                console.error(error);
                response.error(error);
            }
        }).then(function(update) {

            if (update) {
                response.success({
                    "newestUpdate": update,
                    "classes": getListOfClasses()
                });
            } else {
                response.error("You already have the latest update.");
            }

        });
    }
}



function getListOfClasses() {
    return [{
        "class": "ChannelTypes",
        "checkVersion": false
    }, {
        "class": "ChannelsList",
        "checkVersion": true
    }, {
        "class": "ContactInfo",
        "checkVersion": true
    }, {
        "class": "Documents",
        "checkVersion": true
    }, {
        "class": "GoalCategoryTypes",
        "checkVersion": false
    }, {
        "class": "Links",
        "checkVersion": true
    }, {
        "class": "Messages",
        "checkVersion": false
    }, {
        "class": "Options",
        "checkVersion": true
    }, {
        "class": "Questions",
        "checkVersion": true
    }, {
        "class": "ResultActions",
        "checkVersion": true
    }, {
        "class": "ResultColors",
        "checkVersion": true
    }, {
        "class": "Surveys",
        "checkVersion": true
    }, {
        "class": "UserType",
        "checkVersion": false
    }, {
        "class": "Videos",
        "checkVersion": true
    }, {
        "class": "ActionTypes",
        "checkVersion": false
    }, {
        "class": "BlogPosts",
        "checkVersion": false
    }, {
        "class": "GoalTitlesList",
        "checkVersion": true
    }, {
        "class": "Achievements",
        "checkVersion": false
    }, {
        "class": "ResultActionButtons",
        "checkVersion": true
            // }, {//     "class": "UserAchievementsCompleted",
            //     "checkVersion": false,
            //     "checkInstallation": true

    }];
}



function afterSaveFeedback(response) {

    var feedback = response.object;

    if (feedback.existed()) {
        return;
    }

    var queryFeedbackEmail = new Parse.Query("ContactInfo");
    queryFeedbackEmail.descending("updatedAt");
    queryFeedbackEmail.first({
        success: function(contactObject) {
        	console.log("Entered");
            var didSendEmail = false;
            if (feedback.didSendEmail) {
                didSendEmail = didSendEmail;
            }

            console.log(contactObject.get("feedbackEmail"));

            if (!didSendEmail) {
            	console.log("Will send email");
                var params = {
                    method: "POST",
                    url: "http://vitalworklife.com/adminpanel/api/post.php",
                    params: {
                        action: "sendmail",
                        actiontype: "sendmail",
                        emailto: contactObject.get("feedbackEmail"),
                        emailsubject: "Feedback received from mobile app",
                        emailmessage: feedback.get("message")
                    }
                };

                return Parse.Cloud.httpRequest(params).then(function(httpResponse) {

                    console.log("Saved");
                    // feedback.set("didSendEmail", true);
                    // feedback.save();

                    // var response = JSON.parse(httpResponse.text).response;

                    // console.log("Response posts: " + response);

                    return httpResponse;

                });

                // var Mailgun = require('mailgun');
                // Mailgun.initialize('vitalworklife.parseapp.com', 'key-7559e3e929822ed9a67e6fc1b45d4a27');
                // Mailgun.sendEmail({
                //     to: contactObject.get("feedbackEmail"),
                //     from: contactObject.get("feedbackEmail"),
                //     subject: "Feedback received from mobile app",
                //     text: feedback.get("message")
                // }, {
                //     success: function(httpResponse) {
                //         console.log(httpResponse);
                // feedback.set("didSendEmail", true);
                // feedback.save();

                //         // response.success("Email sent!");
                //     },
                //     error: function(httpResponse) {
                //         console.error(httpResponse);
                //         // response.error("Uh oh, something went wrong");
                //     }
                // });
            } else {
                console.log("Email has been sent already :)");
                // response.success("Email has been sent already :)");
            }
        },
        error: function(error) {
            console.error("Could not find email address to send email.");
            // response.error("Could not find email address to send email.");
        }
    });
}



function afterSaveUserAchievementsProgress(response) {

    var arrayNewAchievements = [];

    var achievementProgress = response.object;

    var countNew = achievementProgress.get("count");
    var action = achievementProgress.get("action");
    // var channel = achievementProgress.get("channel");
    var channelType = achievementProgress.get("channelType");
    var user = achievementProgress.get("user");
    var installation = achievementProgress.get("installation");

    var queryLatestAchievement = new Parse.Query("UserAchievementsCompleted");
    queryLatestAchievement.equalTo("action", action);
    // queryLatestAchievement.equalTo("channel", channel);
    queryLatestAchievement.equalTo("channelType", channelType);
    queryLatestAchievement.equalTo("installation", installation);
    queryLatestAchievement.equalTo("user", user);
    queryLatestAchievement.descending("count");
    queryLatestAchievement.first({

        success: function(latestAchievement) {
            return latestAchievement;
        },
        error: function(error) {
            console.error(error);
        }
    }).then(function(latestAchievement) {

        var countLatestAchievement = 0;
        if (latestAchievement) {
            countLatestAchievement = latestAchievement.get("count");
        }

        var queryAchievement = new Parse.Query("Achievements");
        // queryAchievement.equalTo("channel", channel);
        queryAchievement.equalTo("channelType", channelType);
        queryAchievement.equalTo("action", action);
        queryAchievement.greaterThan("totalCount", countLatestAchievement);
        queryAchievement.lessThanOrEqualTo("totalCount", countNew);

        console.log("countNew: " + countNew);
        console.log("countLatestAchievement: " + countLatestAchievement);

        return queryAchievement.each(function(achievement) {

            console.log("Achievements: " + achievement);

            var UserAchievementsCompletedClass = Parse.Object.extend("UserAchievementsCompleted");
            var achievementCompleted = new UserAchievementsCompletedClass();
            achievementCompleted.set("action", action);
            achievementCompleted.set("achievement", achievement);
            // achievementCompleted.set("channel", channel);
            achievementCompleted.set("channelType", channelType);
            achievementCompleted.set("count", achievement.get("totalCount"));
            achievementCompleted.set("installation", installation);
            achievementCompleted.set("isActive", true);
            achievementCompleted.set("user", user);
            achievementCompleted.set("title", achievement.get("title"));
            achievementCompleted.set("description", achievement.get("description"));

            arrayNewAchievements.push(achievementCompleted);

        });

    }).then(function() {

        Parse.Object.saveAll(arrayNewAchievements, {
            success: function(argument) {
                console.log("Saved");
            },
            error: function(argument) {
                console.error("Error: " + argument);
            }
        });
    });
}