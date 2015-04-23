	var canvas = document.getElementById('mainc');
	var C = {width:0,height:0,fps:60}; C.width = canvas.width; C.height = canvas.height; C.centerX = C.width/2; C.centerY = C.height/2;
	var mouse = {x:0,y:0}, player = {x:C.centerX,y:50,velx:0,vely:20,speed:3,rot:0,laser:false,fire:0,trigger:10,recoil:2,ammo:50,health:100}, move = {a:false,w:false,s:false,d:false};
	var ctx = canvas.getContext("2d"); var mousepress = false; var HOpaque = 1.0; 
	
	var spr_player = new Image();
	spr_player.src = "sprites/armguard1.png";
	var spr_muzzle = new Image();
	spr_muzzle.src = "sprites/flash.png";
	var spr_flash = new Image();
	spr_flash.src = "sprites/flashhalo.png";
	
	
	setInterval(function() {
		draw();
		player.x += player.velx; if(player.velx > 0){ player.velx--}else if(player.velx < 0){ player.velx++};
		player.y += player.vely; if(player.vely > 0){ player.vely--}else if(player.vely < 0){ player.vely++};
		moving();
		if(player.velx < 1 && player.velx > -1){ player.velx = 0 }
		if(player.vely < 1 && player.vely > -1){ player.vely = 0 }
		if(player.fire > 0){player.fire--}
	},1000/C.fps)
	
	function draw(){
		ctx.clearRect(0,0,C.width,C.height)
		drawplayer(player.x,player.y,player.rot);
		drawGUI()
		
		drawcursor(mouse.x,mouse.y);
	}
	
	function drawcursor(x,y){
		ctx.fillStyle = "rgba(255,255,255,0.7)"
		ctx.fillRect(x-1,y-1,2,2);
		ctx.fillRect(x-10,y-1,6,2);
		ctx.fillRect(x+10,y-1,-6,2);
		ctx.fillRect(x-1,y-10,2,6);
		ctx.fillRect(x-1,y+10,2,-6);
	}
	
	function drawGUI() {
		ctx.font = "bold 15px serif";
		ctx.fillStyle = "rgba(255,255,255,0.7)"; if (player.ammo < 20){ ctx.fillStyle = "rgba(255,255,0,0.7)"; if (player.ammo < 10){ ctx.fillStyle = "rgba(255,50,0,0.8)"; } }
		ctx.fillText(""+player.ammo,mouse.x+10,mouse.y-10)
	}
	
	function drawplayer(x,y,r){
		var dx = mouse.x - player.x;
		var dy = mouse.y - player.y;
		var laser = ctx.createLinearGradient(0,0,300,0); laser.addColorStop(0,"rgba(255,20,0,0.4)"); laser.addColorStop(1,"rgba(255,20,0,0)");
		player.rot = Math.atan2(dy, dx);
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(r);
		ctx.fillStyle = "#34aaff"
		ctx.shadowColor = 'rgba(0,0,0,0.5)';
		ctx.shadowBlur = 20;
		ctx.shadowOffsetX = (player.x - C.centerX)/15;
		ctx.shadowOffsetY = (player.y - C.centerY)/15;
		ctx.drawImage(spr_player,-30,-20,60,40)
		ctx.shadowColor = 'rgba(0,0,0,0)';
		if(player.laser == true){
			ctx.fillStyle = laser
			ctx.fillRect(10,-6,3000,1);
		}
		if(player.fire == player.trigger){
			ctx.fillStyle = "#fff8a6"
			ctx.drawImage(spr_flash,-50,-100,200,200)
			ctx.shadowColor = 'rgba(250,200,100,1)';
			ctx.shadowBlur = 25;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.fillRect(30,-1,3000,2);
			ctx.drawImage(spr_muzzle,20,-20,60,40)
			ctx.shadowColor = 'rgba(0,0,0,0)';
		}
		ctx.beginPath();
		ctx.strokeStyle = "rgba(20,20,20,"+HOpaque+")";
		ctx.arc(0, 0, 34, Math.PI/2, Math.PI*1+Math.PI/2, false);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(0, 0, 34, Math.PI/2, Math.PI*(player.health/100)+Math.PI/2, false);
		ctx.lineWidth = 2;
		ctx.strokeStyle = "rgba(255,0,0,"+HOpaque+")";
		ctx.stroke();
		
		if (HOpaque > 0.0) { HOpaque -= 0.005 }
		
		ctx.translate(0, 0);
		ctx.restore();
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
	$('#mainc').on('mousedown mouseup', function mouseState(e) {
		if (e.type == "mousedown") {
			mousepress = true;console.log("hold")
			mouseclick();
		}else{
			mousepress = false;console.log("unhold")
		}
	});
	
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
			case 82:
				if(player.laser == false){player.laser = true}else{player.laser = false}
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
		if(move.a == true && move.w == true && move.d == false && move.s == false){
			player.velx = -player.speed/Math.sqrt(2);
			player.vely = -player.speed/Math.sqrt(2);
		};
		if(move.d == true && move.s == true && move.a == false && move.w == false){
			player.velx = player.speed/Math.sqrt(2);
			player.vely = player.speed/Math.sqrt(2);
		};
		if(move.w == true && move.d == true && move.a == false && move.s == false){
			player.velx = player.speed/Math.sqrt(2);
			player.vely = -player.speed/Math.sqrt(2);
		};
		if(move.s == true && move.a == true && move.w == false && move.d == false){
			player.velx = -player.speed/Math.sqrt(2);
			player.vely = player.speed/Math.sqrt(2);
		};
	}

	function mouseclick(){
		//When the mouse is clicked
			if(player.fire < 1 && player.ammo > 0){
				x = mouse.x-player.x; y = mouse.y-player.y;
				player.fire = player.trigger
				if (  x > y*2 && x < -y*2  )   {player.vely = player.recoil;}  //top triangle
				else if (  x < y*2 && x > -y*2  )   {player.vely = -player.recoil;}  //bottom triangle
				if (  -y > x*2 && -y < -x*2  )   {player.velx = player.recoil;}  //left triangle
				else if(  -y < x*2 && -y > -x*2  )    {player.velx = -player.recoil;}  //right triangle
				
				var s_shot1 = new Audio("sounds/shot.wav");
				s_shot1.play();
				player.ammo--
			}
	};