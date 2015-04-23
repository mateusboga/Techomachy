	var canvas = document.getElementById('mainc');
	var C = {width:0,height:0,fps:60}; C.width = canvas.width; C.height = canvas.height; C.centerX = C.width/2; C.centerY = C.height/2;
	var mouse = {x:0,y:0}, player = {x:C.centerX,y:50,velx:0,vely:20,speed:3,rot:0,laser:false,fire:0,trigger:3,recoil:2,ammo:150,health:100}, move = {a:false,w:false,s:false,d:false};
	var ctx = canvas.getContext("2d"); var mousepress = false; var HOpaque = 1.0; 
	
	var shotsourcefile = "sounds/shot.wav";
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
			ctx.fillRect(30,-1,3000,2);  if(shotsourcefile == "sounds/darkshot.wav"){ ctx.fillRect(30,-3,3000,6) }
			ctx.drawImage(spr_muzzle,20,-20,60,40)
			if(player.scatter > 0){
				ctx.rotate(Math.random()*(player.scatter/20)-(player.scatter/20)/2);
				ctx.fillRect(30,-1,3000,2);
				ctx.rotate(Math.random()*(player.scatter/20)-(player.scatter/20)/2);
				ctx.fillRect(30,-1,3000,2);
				ctx.rotate(Math.random()*(player.scatter/20)-(player.scatter/20)/2);
				ctx.fillRect(30,-1,3000,2);
				ctx.rotate(Math.random()*(player.scatter/20)-(player.scatter/20)/2);
				ctx.fillRect(30,-1,3000,2);
			}
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
	
	
	function equipRifle() {
		player.trigger=10;player.recoil=2;player.scatter=0;player.fire=0;
		spr_player.src = "sprites/armguard1.png";shotsourcefile = "sounds/shot.wav";
		s_equip = new Audio("sounds/equip2.wav"); s_equip.play();
	}
	function equipCanon() {
		player.trigger=50;player.recoil=5;player.scatter=0;player.fire=0;
		spr_player.src = "sprites/armguardcanon.png";shotsourcefile = "sounds/darkshot.wav";
		s_equip = new Audio("sounds/equip3.wav"); s_equip.play();
	}
	function equipShotgun() {
		player.trigger=40;player.recoil=2;player.scatter=5;player.fire=0;
		spr_player.src = "sprites/armguardbarrel.png";shotsourcefile = "sounds/barrel.wav";
		s_equip = new Audio("sounds/equip1.wav"); s_equip.play();
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
			mousepress = true;
			mouseclick();
		}else{
			mousepress = false;
		}
	});
	
	window.onkeydown = function (e){
		key = e.keyCode ? e.keyCode : e.which;
		console.log(key)
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
			case 49:
				equipRifle(); break;
			case 50:
				equipCanon(); break;
			case 51:
				equipShotgun(); break;
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
				
				var s_shot1 = new Audio(shotsourcefile);
				s_shot1.play();
				player.ammo--
			}
	};