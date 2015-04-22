	var canvas = document.getElementById('mainc');
	var C = {width:0,height:0,fps:60}; C.width = canvas.width; C.height = canvas.height; C.centerX = C.width/2; C.centerY = C.height/2;
	var mouse = {x:0,y:0}, player = {x:C.centerX,y:50,velx:0,vely:20,speed:3}, move = {a:false,w:false,s:false,d:false};
	var ctx = canvas.getContext("2d");
	
	setInterval(function() {
		draw();
		player.x += player.velx; if(player.velx > 0){ player.velx--}else if(player.velx < 0){ player.velx++};
		player.y += player.vely; if(player.vely > 0){ player.vely--}else if(player.vely < 0){ player.vely++};
		moving();
		if(player.velx < 1 && player.velx > -1){ player.velx = 0 }
		if(player.vely < 1 && player.vely > -1){ player.vely = 0 }
	},1000/C.fps)
	
	function draw(){
		ctx.clearRect(0,0,C.width,C.height)
		drawplayer(player.x,player.y);
		
		drawcursor(mouse.x,mouse.y);
	}
	
	function drawcursor(x,y){
		ctx.fillStyle = "rgba(255,255,255,0.8)"
		ctx.fillRect(x-1,y-1,2,2);
		ctx.fillRect(x-10,y-1,6,2);
		ctx.fillRect(x+10,y-1,-6,2);
		ctx.fillRect(x-1,y-10,2,6);
		ctx.fillRect(x-1,y+10,2,-6);
	}
	
	function drawplayer(x,y){
		ctx.fillStyle = "#34aaff"
		ctx.fillRect(x-10,y-10,20,20);
	}
	
	function getMousePos(canvas, evt) {
		//Update the mouse position
        var rekt = canvas.getBoundingClientRect();
        return {x: evt.clientX - rekt.left, y: evt.clientY - rekt.top}
      }

	canvas.addEventListener('mousemove', function(evt) {
		//When the mouse is moved
		mouse = getMousePos(canvas, evt);
	}, false);
	canvas.onmousedown = function(){
		mouseclick();
	};
	//window.addEventListener( "keydown", keyDown, true )
	//canvas.addEventListener( "keyup", keyUp, true )
	
	/*function keyDown(e){
		key = e.keyCode;
		if( key == 97 ){
			player.velx = -5;
		}
		if( key == 100 ){
			player.velx = 5;
		}
		if( key == 119 ){
			player.vely = -5;
		}
		if( key == 115 ){
			player.vely = 5;
		}
		
	}*/
	
	window.onkeydown = function (e){
		key = e.keyCode ? e.keyCode : e.which;
		switch(key){
			case 65:
				move.a = true; break;
			case 68:
				move.d = true; break;
			case 87:
				move.w = true; break;
			case 83:
				move.s = true; break;
		}
	}
	window.onkeyup = function (e){
		key = e.keyCode ? e.keyCode : e.which;
		switch(key){
			case 65:
				move.a = false; break;
			case 68:
				move.d = false; break;
			case 87:
				move.w = false; break;
			case 83:
				move.s = false; break;
		}
	}
	
	function moving(){
		if(move.a == true && move.d == false){
			player.velx = -player.speed;
		};
		if(move.d == true && move.a == false){
			player.velx = player.speed;
		};
		if(move.w == true && move.s == false){
			player.vely = -player.speed;
		};
		if(move.s == true && move.w == false){
			player.vely = player.speed;
		};
		if(move.a == true && move.w == true){
			player.velx = -player.speed/Math.sqrt(2);
			player.vely = -player.speed/Math.sqrt(2);
		};
		if(move.d == true && move.s == true){
			player.velx = player.speed/Math.sqrt(2);
			player.vely = player.speed/Math.sqrt(2);
		};
		if(move.w == true && move.d == true){
			player.velx = player.speed/Math.sqrt(2);
			player.vely = -player.speed/Math.sqrt(2);
		};
		if(move.s == true && move.a == true){
			player.velx = -player.speed/Math.sqrt(2);
			player.vely = player.speed/Math.sqrt(2);
		};
	}

	function mouseclick(){
		//When the mouse is clicked
	};