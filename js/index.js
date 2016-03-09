var app = {
    initialize: function() {
        this.bindEvents();
		window.onerror = function(message, url, lineNumber) {
			alert("Error: "+message+" in "+url+" at line "+lineNumber);
		}
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
		var deviceRegistrationId = '';
		var loggedUserInfo = false;
		deviceRegistrationId = 'APA91bErF7TzkmWCGrwcsNhsNqy4Z0OegUc0tEgCuHakvzvwL7YDwZE1sPi0zywo_rKNx72bmTKw7XWvHxXbMrk397WVcSQ0Cpb-eo4oG5wzAsGX4hwQlLDRW8vcDibyrQzDI8zOIy7W';
		/*
        var push = PushNotification.init({
            "android": {
                "senderID": "967121045807"
            },
            "ios": {"alert": "true", "badge": "true", "sound": "true"}, 
            "windows": {} 
        });
        
        push.on('registration', function(data) {
            deviceRegistrationId = data.registrationId;
			if(deviceRegistrationId != ''){
				$.post("http://iconcept.lv/ichat/api/appservice.php", {action:'registerDevice', deviceId:deviceRegistrationId}, function(data){
					alert(data);
				});
			}
        });

        push.on('notification', function(data) {
        	console.log("notification event");
            console.log(JSON.stringify(data));
            var cards = document.getElementById("cards");
            var push = '<div class="row">' +
		  		  '<div class="col s12 m6">' +
				  '  <div class="card darken-1">' +
				  '    <div class="card-content black-text">' +
				  '      <span class="card-title black-text">' + data.title + '</span>' +
				  '      <p>' + data.message + '</p>' +
				  '    </div>' +
				  '  </div>' +
				  ' </div>' +
				  '</div>';
            cards.innerHTML += push;
        });

        push.on('error', function(e) {
            console.log("push error");
        });
		*/
		$("#login_content").on("click", '#liveChat_login_submit', function(){
			var login = $("#liveChat_login_email").val();
			var pass = $("#liveChat_login_password").val();
			$.post("http://iconcept.lv/ichat/api/appservice.php", {action:'tryUserLogin', deviceRegId:deviceRegistrationId, login:login,pass:pass}, function(data){
				console.log(data);
				if(data.status == 'fail'){
					$("#liveChat_login_error").html(data.message).show();
				}else{
					loggedUserInfo = data.userInfo;
					checkLoggedIn();
				}
			}, 'json');
		})
		$("#chat_content").on("click", '.liveChat_chat_exit', function(){
			$.post("http://iconcept.lv/ichat/api/appservice.php", {action:'logoutUser', deviceRegId:deviceRegistrationId}, function(data){
				loggedUserInfo = false;
				checkLoggedIn();
			});
		})
		function checkLoggedIn(){
			$.post("http://iconcept.lv/ichat/api/appservice.php", {action:'checkIfUserLoggedIn', deviceRegId:deviceRegistrationId}, function(data){
				if(data.loggedIn == 0){
					$("#login_content").show();
					$("#chat_content").hide();
				}else{
					loggedUserInfo = data.userInfo;
					chatListInterval = setInterval(function(){
						$.post("http://iconcept.lv/ichat/api/appservice.php", 
						{
							action:'getChatList',
							company_id:loggedUserInfo.id_company,
							user_id:loggedUserInfo.id
						}, function(data){
							$("#liveChat_chat_conversation_list").html(data);
						});
					}, 5000)
					$("#login_content").hide();
					$("#chat_content").show();
				}
			}, 'json');
		}
		checkLoggedIn();
		var lastMessageId = chatId = null;
		
		$("#chat_list").on("click", '.liveChat_chat_conversation', function(){
			chatId = $(this).attr("ids");
			$("#chatList").hide()
			$("#contents, .chatMessageBox").show();
			//alert(deviceRegistrationId)
			$.post("http://iconcept.lv/ichat/api/appservice.php", {action:'takeChatOver', chatId:chatId, deviceId:deviceRegistrationId}, function(data){
				alert(data);
				getMessagesInterval = setInterval(getNewMessages, 1000)
			});
		})
		$(".showListButton").click(function(){
			$("#chatList").show()
			$("#contents, .chatMessageBox").hide();
			clearInterval(getMessagesInterval)
		})
		$("#submitMessage").click(submitMessage)
		function submitMessage(){
			clearInterval(getMessagesInterval);
			var text = $("#messageText").val();
			$.post("http://iconcept.lv/ichat/api/appservice.php", {action:'submitMessage', chatId:chatId, text:text}, function(data){
				getMessagesInterval = setInterval(getNewMessages, 1000)
				$("#messageText").val('');
			});
		}
		function getNewMessages(){
			$.post("http://iconcept.lv/ichat/api/appservice.php", {action:'getChatContents', chatId:chatId, lastMessageId:lastMessageId}, function(data){
				if(data.length != 0){
					$.each(data, function(idx, val){
						side = (val.author=='admin'?'right':'left')
						addMessageToChat(val, side);
					})
				}
			}, 'json');
		}
		function addMessageToChat(mData, side){
			lastMessageId = mData.id;
			$('#chatMessages').append('<div class="col s10 m10 l10 '+( side=='right'?'blue lighten-3':'deep-purple lighten-3' )+' '+side+' '+side+'-align round"><p>'+ mData.text +'</p></div>')
			window.scrollTo(0,document.body.scrollHeight);
		}
    }
};

app.initialize();