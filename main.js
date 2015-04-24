	
	/*
		-----------------
		Global Variables
		-----------------
	*/
	
	var canvas = document.getElementById('mainc');
	var C = {width:0,height:0,fps:33}; C.width = canvas.width; C.height = canvas.height; C.centerX = C.width/2; C.centerY = C.height/2;
	var mouse = {x:0,y:0}, player = {x:C.centerX,y:50,velx:0,vely:20,speed:5,rot:0,laser:false,fire:0,trigger:3,recoil:2,ammo:150,health:100,hit:15,alive:true}, move = {a:false,w:false,s:false,d:false};
	var ctx = canvas.getContext("2d"); var mousepress = false; var HOpaque = 0.0; 
	var GameObjects = [];
	
	var shotsourcefile = "sounds/shot.wav";
	var spr_player = new Image();
	spr_player.src = "sprites/armguard1.png";
	var spr_muzzle = new Image();
	spr_muzzle.src = "sprites/flash.png";
	var spr_flash = new Image();
	spr_flash.src = "sprites/flashhalo.png";
	
	var riflesprite = "sprites/armguard1.png", cannonsprite = "sprites/armguardcanon.png", barrelsprite = "sprites/armguardbarrel.png"
	
	/*
		------
		Clock
		------
	*/
	
	setInterval(function() {
		draw();
		player.x += player.velx; if(player.velx > 0){ player.velx--}else if(player.velx < 0){ player.velx++};
		player.y += player.vely; if(player.vely > 0){ player.vely--}else if(player.vely < 0){ player.vely++};
		moving();
		if(player.velx < 1 && player.velx > -1){ player.velx = 0 }
		if(player.vely < 1 && player.vely > -1){ player.vely = 0 }
		if(player.fire > 0){player.fire--}
	},1000/C.fps)
	
	/*
		---------------------
		Game Constructors
		---------------------
	*/
	
	function gameConstruct(){
		var robotsprite = new Image(); robotsprite.src = "sprites/robot1.png";
		var Enemy1 = new Enemy("Robot1", "bot", robotsprite, 120, 250, 60, 60, 0.0, 0.03, 0, 100, 0.0, 0.0, 0, 10, 1, true);
		var Enemy2 = new Enemy("Robot2", "bot", robotsprite, 250, 300, 60, 60, 0.0, 0.03, 0, 100, 0.0, 0.0, 0, 20, 2, true);
		GameObjects.push(Enemy1);GameObjects.push(Enemy2);
	};gameConstruct();
	
	function Enemy(name, t, sprite, x, y, w, h, r, rv, s, hp, ho, hito, fi, tri, dmg, d){
		return {name: name, type: t, spr: sprite, x: x, y: y, w: w, h: h, rot: r, rotv: rv, speed: s, hp: hp, ho: ho, hito: hito, fire: fi, trigger: tri, dmg: dmg, alive: d}
	}
	
	
	/*
		---------------------
		Drawing the canvas
		---------------------
	*/
	
	function draw(){
		ctx.clearRect(0,0,C.width,C.height);
		drawObjects();
		drawplayer(player.x,player.y,player.rot);
		AI();
		drawGUI();
		
		drawcursor(mouse.x,mouse.y);
	}
	
	function drawcursor(x,y){
		ctx.fillStyle = "rgba(255,255,255,0.7)"
		for(i = 0; i < GameObjects.length; i++){ obj = GameObjects[i];
			if( obj.alive == true && mouse.x < obj.x+(obj.w/2) && mouse.x > obj.x-(obj.w/2) && mouse.y < obj.y+(obj.h/2) && mouse.y > obj.y-(obj.h/2)  ){
				if( obj.type == "bot" ){ ctx.fillStyle = "rgba(255,0,0,0.7)" }
			}
		}
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
	
	function drawObjects(){
		//ctx.fillRect(200,200,200,200)
		for(i = 0; i < GameObjects.length; i++){ obj = GameObjects[i];
			if (obj.type == "bot"){
				ctx.save();
				ctx.translate(obj.x,obj.y);
				ctx.rotate(obj.rot);
				ctx.fillStyle = "#ff0000"
				ctx.translate(0, 0);
				ctx.shadowColor = 'rgba(0,0,0,0.5)';
				ctx.shadowBlur = 20;
				ctx.shadowOffsetX = (obj.x - C.centerX)/15;
				ctx.shadowOffsetY = (obj.y - C.centerY)/15;
				ctx.drawImage(obj.spr,0-obj.w/2,0-obj.h/2,obj.w,obj.h)
				ctx.shadowColor = 'rgba(0,0,0,0)';
				
				if(obj.fire == obj.trigger){
					ctx.strokeStyle = "#fff8a6";
					ctx.drawImage(spr_flash,-50,-100,200,200)
					ctx.shadowColor = 'rgba(250,200,100,1)';
					ctx.shadowBlur = 25;
					ctx.shadowOffsetX = 0;
					ctx.shadowOffsetY = 0;
					ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(C.width*2, 0); ctx.lineWidth = 2;
					ctx.stroke();
					ctx.drawImage(spr_muzzle,20,-20,60,40)
					ctx.shadowColor = 'rgba(0,0,0,0)';
				}
				
				ctx.beginPath();
				ctx.strokeStyle = "rgba(20,20,20,"+obj.ho+")";
				ctx.arc(0, 0, 34, Math.PI/2, Math.PI*1+Math.PI/2, false);
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(0, 0, 34, Math.PI/2, Math.PI*(obj.hp/100)+Math.PI/2, false);
				ctx.lineWidth = 2;
				ctx.strokeStyle = "rgba(255,0,0,"+obj.ho+")"; if( obj.hp < 1) { ctx.strokeStyle = "rgba(0,0,0,0)"; }
				ctx.stroke();
				
				if (obj.ho > 0.0) { obj.ho -= 0.005 }
				if(obj.fire > 0){obj.fire--}
				
				ctx.restore();
			}
		}
	}
	
	function drawplayer(x,y,r){
		var dx = mouse.x - player.x;
		var dy = mouse.y - player.y;
		var laser = ctx.createLinearGradient(0,0,500,0); laser.addColorStop(0,"rgba(255,20,0,0.4)"); laser.addColorStop(1,"rgba(255,20,0,0)");
		if(player.alive == true){player.rot = Math.atan2(dy, dx);}
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
			ctx.fillRect(10,-2,3000,1);
		}
		if(player.fire == player.trigger){
			ctx.strokeStyle = "#fff8a6"; ctx.fillStyle = "#fff8a6"
			ctx.drawImage(spr_flash,-50,-100,200,200)
			ctx.shadowColor = 'rgba(250,200,100,1)';
			ctx.shadowBlur = 25;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(C.width*2, 0); ctx.lineWidth = 2; testforTarget();
			if(shotsourcefile == "sounds/darkshot.wav"){ ctx.lineWidth = 6; } ctx.stroke();
			ctx.drawImage(spr_muzzle,20,-20,60,40)
			if(player.scatter > 0){
				ctx.rotate(Math.random()*(player.scatter/10)-(player.scatter/10)/2);
				ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(C.width*2, 0); ctx.lineWidth = 2; testforTarget(); ctx.stroke();
				ctx.rotate(Math.random()*(player.scatter/10)-(player.scatter/10)/2);
				ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(C.width*2, 0); ctx.lineWidth = 2; testforTarget(); ctx.stroke();
				ctx.rotate(Math.random()*(player.scatter/10)-(player.scatter/10)/2);
				ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(C.width*2, 0); ctx.lineWidth = 2; testforTarget(); ctx.stroke();
				ctx.rotate(Math.random()*(player.scatter/10)-(player.scatter/10)/2);
				ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(C.width*2, 0); ctx.lineWidth = 2; testforTarget(); ctx.stroke();
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
	
	/*
		------
		Guns
		------
	*/
	
	function equipRifle() {
		player.trigger=5;player.recoil=2;player.scatter=0;player.fire=0;player.hit=15;
		spr_player.src = riflesprite;shotsourcefile = "sounds/shot.wav";
		s_equip = new Audio("sounds/equip2.wav"); s_equip.play();
	}
	function equipCanon() {
		player.trigger=50;player.recoil=5;player.scatter=0;player.fire=0;player.hit=40;
		spr_player.src = cannonsprite;shotsourcefile = "sounds/darkshot.wav";
		s_equip = new Audio("sounds/equip3.wav"); s_equip.play();
	}
	function equipShotgun() {
		player.trigger=40;player.recoil=2;player.scatter=5;player.fire=0;player.hit=10;
		spr_player.src = barrelsprite;shotsourcefile = "sounds/barrel.wav";
		s_equip = new Audio("sounds/equip1.wav"); s_equip.play();
	}
	
	
	/*
		-------------------
		Events & Controls
		-------------------
	*/
	
	//Target detection
	function testforTarget(){
		target = getTarget();
	}
	function getTarget(){
		
		for(i = 0; i < GameObjects.length; i++){ obj = GameObjects[i]
			if( obj.alive == true && mouse.x < obj.x+(obj.w/2) && mouse.x > obj.x-(obj.w/2) && mouse.y < obj.y+(obj.h/2) && mouse.y > obj.y-(obj.h/2)  ){
				obj.hp -= player.hit; obj.ho = 1.0;
				if( obj.hp < 1 ){
					var robotspritedead = new Image(); robotspritedead.src = "sprites/robot1dead.png";
					obj.spr = robotspritedead;
					obj.alive = false
				}
			}
			//if( obj.x <  )
		}
		
		//if (ctx.isPointInPath)
		//return { x: , y: , width: , height: }
	}
	
	function AI() {
		for(i = 0; i < GameObjects.length; i++){ obj = GameObjects[i]
			if( obj.type == "bot" && obj.alive == true ){
				if ( player.alive == true && player.x < obj.x+500 && player.x > obj.x-500 && player.y < obj.y+500 && player.y > obj.y-500 ){
					var dx = player.x - obj.x;
					var dy = player.y - obj.y;
					obj.rot = Math.atan2(dy, dx)
					if( obj.fire < 1 ){
						var thisshot = new Audio("sounds/shot.wav");
						obj.fire = obj.trigger; thisshot.play();
						if( obj.rot == Math.atan2(dy, dx) ){
							//Player was hit
							obj.hito = 0.5;
							player.health -= obj.dmg; HOpaque = 1.0;
						if (player.health < 1){
							player.alive = false;
						}
						}
					}
				}else{
					obj.rot += 0.01;
				}
				ctx.save();
				var dx = player.x - obj.x;
				var dy = player.y - obj.y;
				ctx.translate(player.x, player.y);
				r = Math.atan2(dy, dx);
				ctx.rotate(r);
				ctx.beginPath();
				ctx.arc(0, 0, 50, Math.PI/1.1, Math.PI/10+Math.PI, false);
				ctx.lineWidth = 10;
				ctx.strokeStyle = "rgba(255,0,0,"+obj.hito+")";
				ctx.stroke();
				ctx.translate(0, 0);
				ctx.restore();
				if( obj.hito > 0 ){ obj.hito -= 0.01 }
				
			}
		}
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
		if( player.alive == true )
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
			if( player.alive == true && player.fire < 1 && player.ammo > 0){
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