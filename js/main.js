
		pixels=null;
		latestGazePoint=null;
		eyex=null;
		windowID=null;
		maxDistance=30;
		maxHeatPerScan=0.1;
		windowScale=0.2;
		
		
		function init() {
		
			createHeatMap();
			var initMap = {X:1, Y:1};
			writePointToHeatMap(initMap);
			dumpHeatMap();
			overwolf.windows.obtainDeclaredWindow ("MainWindow",function(result){
				if (result.status=="success"){
					windowID = result.window.id;
					console.log("window assign succeeded with id " + windowID);
				}
				else{
					console.log("window assign failed");
				}
			});
			console.log("windowid " + windowID);
			setTimeout(function(){
					overwolf.windows.changePosition(windowID,-5,-5,function(){
					console.log("moved successfuly "+windowID );
				});
			},5000);
			setTimeout(function(){
				overwolf.windows.changeSize (windowID, Math.round(screen.width*windowScale), Math.round(screen.height*windowScale), function(){
					console.log("resized successfuly "+windowID);
					console.log("screen.width, screen.height: " + (screen.width*windowScale)+","+ (screen.height*windowScale));
					
					overwolf.windows.obtainDeclaredWindow("MainWindow",function(result){
						console.log("result size is  "+result.window.width+","+result.window.height);
						console.log("result is  "+result);
					});										
				});
			},2000);
			
			setTimeout(function(){
			console.log("***canvas start***");
				var c = document.getElementById("myCanvas");
				var ctx = c.getContext("2d");	
				c.width  = screen.width*windowScale; // in pixels
				c.height = screen.height*windowScale; // in pixels		
				// translate context to center of canvas
				ctx.translate(0,0);
				// scale y component
				ctx.scale(windowScale, windowScale);	
				//dumpHeatMap();
				console.log("***canvas finish***");
			},200); 
			
			
			overwolf.extensions.current.getExtraObject("eyex", function (result) {
		            if (result.status == "success") {
		                eyex = result.object;
		                eyex.onGazePoint.addListener(onGazePoint);
		                //eyex.onUserPresenceChanged.addListener(onUserPresenceChanged);
		                eyex.init();
						console.log("eyex successfully inited");
		            }
					else{
						console.log("eyex inited unsuccessfully");
					}
		        });
			
				
			/*var writeIntervalID = setInterval(
					function(){
						//alert("Interval reached");
						if(eyex!=null&&eyex!=undefined){
							eyex.getGazePoint(writePointToHeatMap);
							console.log("write interval successfully inited");
						}else{
							console.log("write interval eyex is "+eyex);
						}
					},
				100);*/
				
			var coolIntervalID = setInterval(
					function(){
						coolHeatMap();
					},
				100);
				
			var dumpIntervalID = setInterval(
					function(){
						//alert("Interval reached");
						if(eyex!=null&&eyex!=undefined){
							dumpHeatMap();
							console.log("dump interval successfully inited");
						}
						else{
							console.log("dump interval eyex is "+eyex);
						}
					},
				2000);
				
		        //overwolf.settings.registerHotKey("close_window", closeWindowIfLookedAt);

		        
				
				
				
				console.log("Initialized");
		    }
			
		function createHeatMap(){
			pixels = new Array(-(-screen.width));
				for (var i = 0; i < screen.width; i++) {
					pixels[i] = new Array(-(-screen.height));
				/*				
				 *  You will all be wandering by now "WHY DOESN'T HE USE new Array(screen.width)"! Bitch please, javascript could upcast the
				 *  returning value as string and create an array of 1 element with the value of screen.width
				 */
				 
				}
				for(var x=0;x<-(-screen.width);x++)
				{
					for(var y=0;y<-(-screen.width);y++)
					{
						pixels[x][y]=0;
					}
				}
		}
		function writePointToHeatMap(thisGazePoint){
			for(var x=(Math.round(thisGazePoint.X)-maxDistance);x<(Math.round(thisGazePoint.X)+maxDistance);x++)
			{
				if(x>0 && x<screen.width){
					for(var y=(Math.round(thisGazePoint.Y)-maxDistance);y<(Math.round(thisGazePoint.Y)+maxDistance);y++)
					{
					
						if(y>0 && y<screen.height){
						
							var d;
							//console.log("test1")
							var xDist = Math.pow((x-thisGazePoint.X),2);
							//console.log("test2")
							var yDist = Math.pow((y-thisGazePoint.Y),2);
							//console.log("test3")
							d=Math.sqrt(xDist+yDist);
							
							if(d<maxDistance&&d!=undefined&&d!=null&&d!="NaN"){
								pixels[x][y]+=30-d;//Math.pow((d-maxDistance),2)*((Math.pow(maxDistance,2))/maxHeatPerScan);
								if(pixels[x][y]>255){
									pixels[x][y]=255;
								}								
								//console.log("x:"+x+"  y:"+y)
							}		
							else{
								//console.log("d is "+d+"  for ("+x+","+y+") from ("+gazePoint.X+","+gazePoint.Y+")");
							}
						}
					}
				}
			}
			//console.log("test5")
			
		}			
		function coolHeatMap(){
			for(var x=0;x<-(-screen.width);x++){				
				for(var y=0;y<-(-screen.height);y++){
					pixels[x][y]-=10;
					if(pixels[x][y]<0)
					{	
						pixels[x][y]=0;
					}
				}
			}
		
		}
		function dumpHeatMap(){		
			var c = document.getElementById("myCanvas");
			var ctx = c.getContext("2d");	
		
			for(var x=0;x<screen.width;x++){				
				for(var y=0;y<screen.height;y++){
						var blueDec = 100-pixels[x][y];
						var redDec = pixels[x][y];
						if(redDec>255)
						{
							redDec=255;
						}
						if(blueDec>255)
						{
							blueDec=255;
						}
						var blueHex = Math.round(blueDec * 2.55);
						var redHex = Math.round(redDec * 2.55);
						
						var blueHexString = blueHex.toString(16);
						var redHexString = redHex.toString(16);						
						ctx.fillStyle = "#"+redHexString+"00"+blueHexString;
						if(redHexString=="00" && blueHexString=="00")
						{
							console.log("black at "+x+","+y);
						}
						ctx.fillRect(x,y,1,1);							
				}								
			}
						
						
						
		}
		function onGazePoint(gazePoint) {
		    	//console.log("Gaze point at: (" + gazePoint.X + ", " + gazePoint.Y +")");

		    	latestGazePoint = gazePoint;
				
					writePointToHeatMap(gazePoint);
				
		    	/*var elementGazePoint = document.getElementById("gazePoint");
		    	elementGazePoint.innerHTML = "{X="+Math.round(gazePoint.X)+", Y="+ Math.round(gazePoint.Y) 
		    		+ ", Timestamp=" + Math.round(gazePoint.Timestamp) + "}";

				overwolf.windows.getCurrentWindow(function(result){
					if (result.status=="success"){
						if (isGazePointWithinWindow(result.window, gazePoint)){
		    				document.getElementById("content").style.opacity = "1.0";
						}
						else {
		    				document.getElementById("content").style.opacity = "0.4";
		    			};
					}
				});*/
		    }

		    /*
			 * Shows is the user is present or not based on data from the Tobii EyeX Engine.
		     */
			function onUserPresenceChanged(isUserPresent) {
				console.log("User Presence: (" + isUserPresent +")");
				present=isUserPresent;
				userPresenceElement = document.getElementById("userPresence");
		    	userPresenceElement.innerHTML = "User is " + isUserPresent.Value;
			}
		
		function dragMove(){
				overwolf.windows.getCurrentWindow(function(result){
					if (result.status=="success"){
						overwolf.windows.dragMove(result.window.id);
					}
				});
		};
		
		
		window.addEventListener("load", init);
		