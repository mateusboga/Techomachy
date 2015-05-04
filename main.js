	
	/*
		-----------------
		Global Variables
		-----------------
	*/
	
	var pause = false;
	var PI = Math.PI;
	var canvas = document.getElementById('mainc'); var canvas2 = document.getElementById("secondc"); var canvasbg = document.getElementById("backc"); var ctx = canvas.getContext("2d"); var ctx2 = canvas2.getContext('2d'); var ctxbg = canvasbg.getContext('2d');
	var C = {width:canvas.width,height:canvas.height,fps:33}; C.centerX = C.width/2; C.centerY = C.height/2;
	var mouse = {x:0,y:0}, player = {x:0,y:0,velx:0,vely:0,speed:5,rot:0,laser:false,fire:0,trigger:5,recoil:2,ammo:Infinity,health:100,hit:15,alive:true, cooldown: 0, invis: 0}, move = {a:false,w:false,s:false,d:false};
	var mousepress = false; var HOpaque = 0.0; var Stealth = 0; var Supress = 50; var XP = 0; var PI = Math.PI;
	var GameObjects = [];	var GameTiles = [];	var GameParticles = []; var Volume = 0.01;
	var LC = {};
	ctx.imageSmoothingEnabled = false;
	
	var collisionData = ctx.createImageData(C.width, C.height);
	
	$("#slider").slider({
		value  : 75,
		step   : 1,
		range  : 'min',
		min    : 0,
		max    : 100,
		change : function(){
			var value = $("#slider").slider("value");
			Volume = value/100;
		}
	});
	
	/*
		------
		Clock
		------
	*/
	
	setInterval(function() {
		if(pause == false){
			ctx2.clearRect(0,0,C.width, C.height);
			LCenter = getCenter();
			draw();
			
			
			
			player.x += player.velx; if(player.velx > 0){ player.velx--}else if(player.velx < 0){ player.velx++};
			player.y += player.vely; if(player.vely > 0){ player.vely--}else if(player.vely < 0){ player.vely++};
			moving();
			if(player.velx < 1 && player.velx > -1){ player.velx = 0 }
			if(player.vely < 1 && player.vely > -1){ player.vely = 0 }
			if(player.fire > 0){player.fire--}; if( Stealth > 0.5 ){ Stealth-= 0.1+player.invis/10000; }else{ Stealth=0}; if( player.cooldown > 0 ){ player.cooldown-- }; if(player.invis > 0){ player.invis-- }; if( Stealth > 10 && player.invis > 0 ){ player.invis = 0; s_invisoff.volume = Volume; s_invisoff.play(); };
			if( player.auto == true && mousepress == true && player.fire == 0 ){ mouseclick(); }
		} else{
			drawPause();
		}
	},1000/C.fps)
	
	/*
		---------------------
		Game Constructors
		---------------------
	*/
	
	function gameConstruct(){
		//var Pannel = new Tile("Floorpannel", spr_pannel, 64, 64, -100, -100, 100, 100); GameTiles.push(Pannel);
		var newe = new Enemy("Ewac", "bot", robotsprite, robotspritelegs, 120, 250, 60, 60, 0.0, 0.03, 0.01, 0, 100, 0.0, 0.0, 0, 10, 2, true, 200, 20); GameObjects.push(newe);
		var newe = new Enemy("Aoey", "bot", robotsprite, robotspritelegs, 250, 300, 60, 60, 1.0, 0.03, 0.01, 0, 100, 0.0, 0.0, 0, 10, 2, true, 200, 20); GameObjects.push(newe);
		var newe = new Enemy("Itoa", "bot", robotsprite, robotspritelegs, 200, 350, 60, 60, 2.0, 0.03, 0.01, 0, 100, 0.0, 0.0, 0, 10, 2, true, 200, 20); GameObjects.push(newe);
		var newe = new Enemy("Uyoc", "bot", robotsprite, robotspritelegs, 0, 400, 60, 60, 2.0, 0.03, 0.01, 0, 100, 0.0, 0.0, 0, 10, 2, true, 200, 20); GameObjects.push(newe);
		var Barrel = new G_Object("Barrel1", "explosive", barrelsprite, 510, 350, 40, 40, true, 20); GameObjects.push(Barrel);
	};gameConstruct();
	
	function Enemy(name, t, sprite, sprite2, x, y, w, h, r, rv, rd, s, hp, ho, hito, fi, tri, dmg, d, range, xp){
		return {name: name, type: t, spr: sprite, spr2: sprite2, x: x, y: y, w: w, h: h, rot: r, rotv: rv, rotd: rd, speed: s, hp: hp, ho: ho, hito: hito, fire: fi, trigger: tri, dmg: dmg, alive: d, range: range, xp: xp}
	}
	function G_Object(name, t, sprite, x, y, w, h, destr, hp){
		return {name: name, type: t, sprite: sprite, x: x, y: y, w: w, h: h, candestroy: destr, hp: hp, expl: 0}
	}
	function Tile(name, spr, w, h, xmin, ymin, xmax, ymax){
		return {name: name, src: spr, w: w, h: h, xmin: xmin, ymin: ymin, xmax: xmax, ymax: ymax}
	}
	function Particle(id, sprite, x, y, xv, yv, w, h, r, rs, life, maxlife){
		return {id: id, src: sprite, x:x, y:y, xv:xv, yv:yv ,w:w,h:h, rot: r, rotv: rs,l:life, maxl:maxlife}
	}
	
	function getCenter(){
		_x = getGPX(mouse.x)/2+player.x/2; _y = getGPY(mouse.y)/2+player.y/2;
		return {x: _x, y: _y, x0: (C.width/2), y0: (C.height/2) }
	}
	
	function getLPX(x){
		return C.centerX+(x-LCenter.x)*2
	}
	function getLPY(y){
		return C.centerY+(y-LCenter.y)*2
	}
	function getGPX(x){
		return (x+player.x)-C.centerX
	}
	function getGPY(y){
		return (y+player.y)-C.centerY
	}
	
	
	var rayIntersect = function (x1, y1, x2, y2, w2, h2, phi ) {
		var p = { x: x1, y: y1};
		var r = {x: x2, y: y2, w: w2, h: h2};
		var n = {x: 0, y: 0};
		n.x = Math.cos(phi);
		n.y = Math.sin(phi);
	
		var lowerLimitX = (r.x-r.w/2 - p.x) / n.x;
		var upperLimitY =  (r.y-r.h/2 - p.y) / n.y;
		var upperLimitX = (r.x + r.w/2 - p.x) / n.x;
		var lowerLimitY  = (r.y + r.h/2 - p.y) / n.y;

		return Math.max(lowerLimitX, lowerLimitY) <=
			Math.min(upperLimitX, upperLimitY);
	};
	
	/*
		---------------------
		Drawing the canvas
		---------------------
	*/
	
	function draw(){
		ctx.clearRect(0,0,C.width,C.height);
		drawBackground();
		drawParticles();
		drawShadowmap();
		drawObjects();
		drawplayer(player.rot);
		AI();
		drawGUI();
		drawcursor(mouse.x,mouse.y);
	}
	function drawPause(){
		ctx2.clearRect(0,0,C.width,C.height);
		ctx2.fillStyle = "rgba(0,0,0,0.5)"; ctx2.fillRect(0,0,C.width,C.height);
		drawcursor2(mouse.x,mouse.y);
	}
	
	function drawTiles(){
		
		for( i = 0; i < GameTiles.length; i++ ){ tile = GameTiles[i];
			for( k = 0; k < (Math.abs(tile.ymin)+Math.abs(tile.ymax)); k++ ){
				for( j = 0; j < (Math.abs(tile.xmin)+Math.abs(tile.xmax)); j++ ){
					ctx.drawImage(tile.src, (tile.xmin+(tile.width*j)), (tile.ymin+(tile.height*k)), tile.w, tile.h)
				}
			}
		}
		//ctx.drawImage(spr_pannel, getLPX(200), getLPY(200), 64, 64)
	};
	
	function drawcursor(x,y){
		ctx.fillStyle = "rgba(255,255,255,0.7)"
		for(i = 0; i < GameObjects.length; i++){ obj = GameObjects[i];
			if( getGPX(mouse.x) < obj.x+(obj.w/4) && getGPX(mouse.x) > obj.x-(obj.w/4) && getGPY(mouse.y) < obj.y+(obj.h/4) && getGPY(mouse.y) > obj.y-(obj.h/4)  ){
				if( obj.type == "bot" && obj.alive == true ){
					ctx.fillStyle = "rgba(255,0,0,0.8)";
					ctx.font = "bold 15px serif";
					ctx.fillText(""+obj.type,mouse.x+0,mouse.y+35);
					ctx.fillStyle = "rgba(255,0,0,0.7)";
				}
				if( player.fire == player.trigger-1 ){
					drawspark(x,y);
				}
			}
		}
		ctx.fillRect(x-1,y-1,2,2);
		ctx.fillRect(x-10,y-1,6,2);
		ctx.fillRect(x+10,y-1,-6,2);
		ctx.fillRect(x-1,y-10,2,6);
		ctx.fillRect(x-1,y+10,2,-6);
		ctx.fillStyle = "rgba(255,255,255,0.5)";
		ctx.fillRect(getLPX(LCenter.x)-1,getLPY(LCenter.y)-1,2,2)
	}
	
	function drawcursor2(x,y){
		ctx2.fillStyle = "rgba(255,255,255,0.7)"
		ctx2.beginPath();
		ctx2.moveTo(x,y);
		ctx2.lineTo(x+10,y+20);
		ctx2.lineTo(x+12,y+12);
		ctx2.lineTo(x+20,y+10);
		ctx2.closePath();
		ctx2.fill();
	}
	
	function drawspark(x,y){
		ctx.save();
		ctx.translate(x,y);
		ctx.rotate((Math.random()*3));
		ctx.translate(0, 0);
		_spr = Math.ceil(Math.random()*3);
		switch(_spr){
			case 1: sparksprite = spr_spark1; break;
			case 2: sparksprite = spr_spark2; break;
			case 3: sparksprite = spr_spark3; break;
		}
		ctx.drawImage(sparksprite,-60,-60,120,120)
		ctx.restore();
	}
	
	function drawGUI() {
		var angle = Math.atan2(getLPY(player.y)-mouse.y,getLPX(player.x)-mouse.x);
		var ammoX = 45, ammoY = 5;
		var dx2 = ammoX;
		var dy2 = ammoY;
		if( player.ammo == Infinity ){ ammo = "\u221E" }else{ ammo = player.ammo }
		dx3 = dx2 * Math.cos(angle) - dy2 * Math.sin(angle);
		dy3 = dx2 * Math.sin(angle) + dy2 * Math.cos(angle);
		x2 = dx3 + mouse.x;
		y2 = dy3 + mouse.y;
		ctx.textAlign = 'center';
		ctx.save();
		ctx.translate(mouse.x,mouse.y);
		ctx.translate(0, 0);
		ctx.font = "bold 15px serif";
		ctx.fillStyle = "rgba(255,255,255,0.5)"; if (player.ammo < 20){ ctx.fillStyle = "rgba(255,255,0,0.5)"; if (player.ammo < 10){ ctx.fillStyle = "rgba(255,50,0,0.5)"; } }
		ctx.fillText(""+ammo,dx3,dy3)
		ctx.rotate(Math.atan2( getLPY(player.y)-mouse.y, getLPX(player.x)-mouse.x ));
		ctx.beginPath();
		ctx.strokeStyle = "rgba(255,255,255,0.1)";
		ctx.arc(0, 0, 42, PI+PI/2-0.05, PI+PI/2+0.05, false);
		ctx.lineWidth = 4;
		ctx.stroke();ctx.beginPath();
		ctx.arc(0, 0, 42, PI-PI/2-0.05, PI-PI/2+0.05, false);ctx.stroke();
		ctx.rotate(-Math.atan2( getLPY(player.y)-mouse.y, getLPX(player.x)-mouse.x )*2);
		ctx.strokeStyle = "rgba(255,255,255,0.2)";
		ctx.beginPath();
		ctx.arc(0, 0, 20, PI+PI/2-0.8, PI+PI/2+0.8, false);ctx.stroke();ctx.beginPath();
		ctx.arc(0, 0, 20, PI-PI/2-0.8, PI-PI/2+0.8, false);ctx.stroke();
		
		//ctx.fillStyle = "rgba(255,255,0,0.5)";
		//ctx.fillText(""+XP,mouse.x-20,mouse.y-0)
		ctx.restore();
	}
	
	function drawObjects(){
		//ctx.fillRect(200,200,200,200)
		for(i = 0; i < GameObjects.length; i++){ obj = GameObjects[i];
			if (obj.type == "explosive"){
				ctx.save();
				ctx.translate(getLPX(obj.x),getLPY(obj.y)); if( obj.expl >= 1 ){ ctx.drawImage(spr_burnt, -64, -64, 128, 128) }
				ctx.translate(0, 0);
				ctx.shadowColor = 'rgba(0,0,0,0.5)';
				ctx.shadowBlur = 20;
				ctx.shadowOffsetX = (getLPX(obj.x) - C.centerX)/15;
				ctx.shadowOffsetY = (getLPY(obj.y) - C.centerY)/15;
				if( obj.expl < 1 ){ ctx.drawImage(barrelsprite,0-obj.w/2,0-obj.h/2,obj.w,obj.h) }
				ctx.shadowColor = 'rgba(0,0,0,0)';
				if( obj.expl >= 1 ){
					switch(obj.expl){
						case 1: ctx.drawImage(spr_expl1,-60,-60,120,120); break;
						case 2: ctx.drawImage(spr_expl2,-60,-60,120,120); break;
						case 3: ctx.drawImage(spr_expl3,-60,-60,120,120); break;
						case 4: ctx.drawImage(spr_expl4,-60,-60,120,120); break;
						case 200: GameObjects.splice(i, 1); break;
					}obj.expl++;
				}
				ctx.restore();
			}
			if (obj.type == "bot"){
				var laser = ctx.createLinearGradient(0,0,500,0); laser.addColorStop(0,"rgba(255,20,0,0.7)"); laser.addColorStop(1,"rgba(255,20,0,0)");
				var dx = player.x - obj.x;
				var dy = player.y - obj.y;
				ctx.save();
				ctx.globalAlpha = obj.alpha;
				ctx.translate(getLPX(obj.x),getLPY(obj.y));
				if( obj.expl ){ ctx.drawImage(spr_burnt, -64, -64, 128, 128); }
				if( obj.spr2 ){ ctx.drawImage(obj.spr2,0-obj.w/2,0-obj.h/2,obj.w,obj.h) }
				//ctx.fillText(obj.rot, 0,50);
				//ctx.fillText(Math.atan2(dy, dx)+PI, 20, 20);
				ctx.rotate(obj.rot-PI);
				ctx.fillStyle = "#ff0000"
				ctx.translate(0, 0);
				ctx.shadowColor = 'rgba(0,0,0,0.5)';
				ctx.shadowBlur = 20;
				ctx.shadowOffsetX = (getLPX(obj.x) - C.centerX)/15;
				ctx.shadowOffsetY = (getLPY(obj.y) - C.centerY)/15;
				ctx.drawImage(obj.spr,0-obj.w/2,0-obj.h/2,obj.w,obj.h)
				//ctx.globalAlpha = 1.0;
				ctx.shadowColor = 'rgba(0,0,0,0)';
				if ( obj.alive == true ){
					ctx.fillStyle = laser
					ctx.fillRect(10,-2,3000,1);}
				
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
				
				if( obj.expl ){
					switch(obj.expl){
						case 1: 
							ctx.drawImage(spr_flash,-100,-100,200,200);
							ctx.drawImage(spr_expl1,-60,-60,120,120); 
							var par = new Particle(Math.floor(Math.random()*100), spr_debree, obj.x, obj.y, Math.floor(Math.random()*10)-5, Math.floor(Math.random()*10)-5, 6, 8, 0, Math.random()*3, 0, 500); GameParticles.push(par);
							var par = new Particle(Math.floor(Math.random()*100), spr_debree2, obj.x, obj.y, Math.floor(Math.random()*10)-5, Math.floor(Math.random()*10)-5, 6, 8, 0, Math.random()*3, 0, 500); GameParticles.push(par);
							var par = new Particle(Math.floor(Math.random()*100), spr_debree3, obj.x, obj.y, Math.floor(Math.random()*10)-5, Math.floor(Math.random()*10)-5, 6, 8, 0, Math.random()*3, 0, 500); GameParticles.push(par);
							var par = new Particle(Math.floor(Math.random()*100), spr_debree4, obj.x, obj.y, Math.floor(Math.random()*10)-5, Math.floor(Math.random()*10)-5, 6, 8, 0, Math.random()*3, 0, 500); GameParticles.push(par);
							
							break;
						case 2: ctx.drawImage(spr_expl2,-60,-60,120,120); break;
						case 3: ctx.drawImage(spr_expl3,-60,-60,120,120); break;
						case 4: ctx.drawImage(spr_expl4,-60,-60,120,120); break;
						 
					}obj.expl++;
					
				}
				
				ctx.beginPath();
				ctx.strokeStyle = "rgba(20,20,20,"+obj.ho+")";
				ctx.arc(0, 0, 34, Math.PI/2, Math.PI*1+Math.PI/2, false);
				ctx.lineWidth = 4;
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(0, 0, 34, Math.PI/2, Math.PI*(obj.hp/100)+Math.PI/2, false);
				ctx.lineWidth = 2;
				ctx.strokeStyle = "rgba(255,0,0,"+obj.ho+")"; if( obj.hp < 1) { ctx.strokeStyle = "rgba(0,0,0,0)"; }
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(getLPX(obj.x), getLPY(obj.y));
				ctx.lineTo(getLPX(obj.x) + getLPX(player.x) * 100, getLPY(obj.y) + getLPY(player.y) * 100);
				ctx.fill();
				/*ctx.beginPath();
				ctx.arc(0, 0, obj.range+obj.range*Stealth/10, Math.PI, Math.PI*4, false);
				ctx.lineWidth = 5;
				ctx.fillStyle = "rgba(0,200,200,0.01)"
				ctx.fill();*/
				
				if (obj.ho > 0.0) { obj.ho -= 0.005 }
				if (obj.fire > 0){obj.fire--}
				if (obj.timer > -1){ obj.timer++; if( obj.timer > 7000 && obj.alpha > 0){ obj.alpha -= 0.00033 } }
				if (obj.timer > 10000){
					GameObjects.splice(i, 1);
				}
				
				ctx.restore();
			}
		}
	}
	
	function drawplayer(r){
		var x = getLPX(player.x), y = getLPY(player.y);
		var dx = getGPX(mouse.x) - player.x;
		var dy = getGPY(mouse.y) - player.y;
		var laser = ctx.createLinearGradient(0,0,500,0); laser.addColorStop(0,"rgba(255,20,0,0.7)"); laser.addColorStop(1,"rgba(255,20,0,0)");
		if(player.alive == true){player.rot = Math.atan2(dy, dx);}
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(r);
		ctx.fillStyle = "#34aaff"
		ctx.shadowColor = 'rgba(0,0,0,0.5)';
		ctx.shadowBlur = 20;
		ctx.shadowOffsetX = (x - C.centerX)/15;
		ctx.shadowOffsetY = (y - C.centerY)/15;
		if( player.invis > 0 ){
			ctx.beginPath();
			ctx.arc(0, 0, 40, Math.PI/2, Math.PI*((player.invis/100)/10)+Math.PI/2, false);
			ctx.lineWidth = 4;
			ctx.strokeStyle = "rgba(100,255,100,0.2)";
			ctx.stroke();
			ctx.globalAlpha = 0.1;
		}
		switch( player.invis ){
			case 1: ctx.globalAlpha = 0.5; s_invisoff.volume = Volume/3; s_invisoff.play(); break;
			case 3: ctx.globalAlpha = 0.5; break;
			case 5: ctx.globalAlpha = 0.5; break;
			case 7: ctx.globalAlpha = 0.5; break;
			case 9: ctx.globalAlpha = 0.5; break;
			case 11: ctx.globalAlpha = 0.5; break;
			case 13: ctx.globalAlpha = 0.5; break;
			case 14: ctx.globalAlpha = 0.5; break;
			case 15: ctx.globalAlpha = 0.5; break;
			case 16: ctx.globalAlpha = 0.5; break;
		}
		ctx.drawImage((spr_player),-spr_player.width,-spr_player.height,spr_player.width*2,spr_player.height*2)
		ctx.shadowColor = 'rgba(0,0,0,0)';
		ctx.globalAlpha = 1.0;
		if(player.laser == true){
			ctx.fillStyle = laser
			ctx.fillRect(10,-2,3000,1);
		}
		if(player.fire == player.trigger){
			ctx.strokeStyle = "#fff8a6"; ctx.fillStyle = "#fff8a6"
			ctx.drawImage(spr_flash,-50,-100,200,200)
			ctx.shadowColor = 'rgba(250,200,100,1)';
			ctx.shadowBlur = 20;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(C.width*2, 0); ctx.lineWidth = 2;
			if(shotsourcefile == "sounds/darkshot.wav"){ ctx.lineWidth = 6; } ctx.stroke();
			ctx.drawImage(spr_muzzle,20,-20,60,40)
			if(player.scatter > 0){
				ctx.rotate(Math.random()*(player.scatter/10)-(player.scatter/10)/2);
				ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(C.width*2, 0); ctx.lineWidth = 2; ctx.stroke();
				ctx.rotate(Math.random()*(player.scatter/10)-(player.scatter/10)/2);
				ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(C.width*2, 0); ctx.lineWidth = 2; ctx.stroke();
				ctx.rotate(Math.random()*(player.scatter/10)-(player.scatter/10)/2);
				ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(C.width*2, 0); ctx.lineWidth = 2; ctx.stroke();
				ctx.rotate(Math.random()*(player.scatter/10)-(player.scatter/10)/2);
				ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(C.width*2, 0); ctx.lineWidth = 2; ctx.stroke();
			}
			testforTarget();
			ctx.shadowColor = 'rgba(0,0,0,0)';
		}
		
		if( Math.abs(getGPX(mouse.x)-player.x)+Math.abs(getGPY(mouse.y)-player.y) < 100 ){
			MClose = 1/(Math.abs(getGPX(mouse.x)-player.x)+Math.abs(getGPY(mouse.y)-player.y))*10
			if( MClose > 1 ){ MClose = 1 }
			if( MClose > HOpaque/1.2 ){
			_HO = MClose/1.2;
			}
		} else { _HO = HOpaque; }
		
		ctx.beginPath();
		ctx.strokeStyle = "rgba(20,20,20,"+_HO+")";
		ctx.arc(0, 0, 34, Math.PI/2, Math.PI*1+Math.PI/2, false);
		ctx.lineWidth = 4;
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(0, 0, 34, Math.PI/2, Math.PI*(player.health/100)+Math.PI/2, false);
		ctx.lineWidth = 2;
		ctx.strokeStyle = "rgba(255,0,0,"+_HO+")";if( player.alive == false ){ ctx.strokeStyle = "rgba(255,0,0,0)" }
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(0, 0, 30, Math.PI/2, Math.PI*(Stealth/100)+Math.PI/2, false);
		ctx.lineWidth = 3;
		ctx.strokeStyle = "rgba(100,255,255,0.2)";
		ctx.stroke();
		
		ctx.rotate(-r);
		//ctx.fillText(parseFloat((getGPX(mouse.x)-player.x)/(getGPY(mouse.y)-player.y)).toFixed(2), -50, 0)
		
		if (HOpaque > 0.0) { HOpaque -= 0.001 }
		
		ctx.translate(0, 0);
		ctx.restore();
	}
	
	
	function drawBackground() {
		ctx.drawImage(spr_floor1, getLPX(-1000), getLPY(-1000), 4000, 4000);
	}
	function drawShadowmap() {
		ctx.drawImage(spr_floor1shadowmap, getLPX(-1000), getLPY(-1000), 4000, 4000);
	}
	
	function drawParticles() {
		for (i = 0; i < GameParticles.length; i++){ par = GameParticles[i];
			ctx.save();
			par.x += par.xv; par.y += par.yv; par.rot += par.rotv;
			ctx.translate(getLPX(par.x), getLPY(par.y));
			ctx.rotate(par.rot);
			ctx.drawImage(par.src, -par.w, -par.h, par.w*2, par.h*2);
			if( par.xv >= 1 ){ par.xv-=0.2 } else if( par.xv <= -1 ){ par.xv+=0.2 } else { par.xv = 0 };
			if( par.yv >= 1 ){ par.yv-=0.2 } else if( par.yv <= -1 ){ par.yv+=0.2 } else { par.yv = 0 };
			if( par.rotv > 0 ){ par.rotv-=par.rotv/50 } else { par.rotv = 0 }
			par.l++;
			if( par.l > par.maxl ){ GameParticles.splice(i, 1); }
			ctx.rotate(-par.rot);
			ctx.translate(0, 0);
			ctx.restore();
		}
	}
	
	/*
		------
		Guns
		------
	*/
	
	function equipRifle() {
		player.trigger=5;player.recoil=2;player.scatter=0;player.fire=0;player.hit=15;Supress = 30; player.auto = false;
		spr_player.src = riflesprite;shotsourcefile = src_rifleshot;
		s_equip = new Audio("sounds/equip2.wav"); s_equip.volume = Volume; s_equip.play();
		spr_shell = spr_shellrifle;
	}
	function equipRifleSilence() {
		player.trigger=5;player.recoil=2;player.scatter=0;player.fire=0;player.hit=15;Supress = 5; player.auto = false;
		spr_player.src = silencesprite;shotsourcefile = src_silenceshot;
		s_equip = new Audio("sounds/equip2.wav"); s_equip.volume = Volume; s_equip.play();
		spr_shell = spr_shellrifle;
	}
	function equipCanon() {
		player.trigger=50;player.recoil=5;player.scatter=0;player.fire=0;player.hit=40;Supress = 50; player.auto = false;
		spr_player.src = cannonsprite;shotsourcefile = src_cannonshot;
		s_equip = new Audio("sounds/equip3.wav"); s_equip.volume = Volume; s_equip.play();
		spr_shell = spr_shellcannon;
	}
	function equipShotgun() {
		player.trigger=40;player.recoil=2;player.scatter=5;player.fire=0;player.hit=10;Supress = 50; player.auto = false;
		spr_player.src = shotgunsprite;shotsourcefile = src_shotgunshot;
		s_equip = new Audio("sounds/equip1.wav"); s_equip.volume = Volume; s_equip.play();
		spr_shell = spr_shellshotgun;
	}
	function equipMG() {
		player.trigger=3;player.recoil=2;player.scatter=0;player.fire=0;player.hit=10;Supress = 30; player.auto = true;
		spr_player.src = MGsprite;shotsourcefile = src_rifleshot1;
		s_equip = new Audio("sounds/equip2.wav"); s_equip.volume = Volume; s_equip.play();
		spr_shell = spr_shellrifle;
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
			var LOx = getLPX(obj.x), LOy = getLPY(obj.y);
			var dx = obj.x - player.x;
			var dy = obj.y - player.y;
			var dx1 = (obj.x+obj.w) - player.x;
			var dy1 = (obj.y+obj.h) - player.y;
			var dx2 = (obj.x-obj.w) - player.x;
			var dy2 = (obj.y-obj.h) - player.y;
			if( mouse.x < LOx+(obj.w/2) && mouse.x > LOx-(obj.w/2) && mouse.y < LOy+(obj.h/2) && mouse.y > LOy-(obj.h/2) ){
				sound = Math.floor(Math.random()*5)+1; s_hit = new Audio();
				switch (sound){
					case 1: s_hit.src = s_hit1; break;
					case 2: s_hit.src = s_hit2; break;
					case 3: s_hit.src = s_hit3; break;
					case 4: s_hit.src = s_hit4; break;
					case 5: s_hit.src = s_hit5; break;
				} s_hit.volume = Volume/5; s_hit.play();
			}
			if( obj.alive == true && mouse.x < LOx+(obj.w/2) && mouse.x > LOx-(obj.w/2) && mouse.y < LOy+(obj.h/2) && mouse.y > LOy-(obj.h/2)  ){
			//if( obj.alive == true && player.rot > Math.atan2(dx1, dy1) && player.rot < Math.atan2(dx2, dy2) ){
				obj.hp -= player.hit; obj.ho = 1.0;
				
				if( obj.hp < 1 ){
					var robotspritedead = new Image(); robotspritedead.src = "sprites/robot1dead.png"; s_explosion = new Audio(s_explode); s_explosion.volume = Volume;
					s_explosion.play();
					if( obj.xp ){ XP += obj.xp }
					obj.spr = robotspritedead;
					obj.alive = false; if(!obj.timer) { obj.timer = 0; }; obj.alpha = 1.0;
					obj.expl = 1;
				}
			}
			if( obj.type == "explosive" && obj.hp > 0 && mouse.x < LOx+(obj.w/2) && mouse.x > LOx-(obj.w/2) && mouse.y < LOy+(obj.h/2) && mouse.y > LOy-(obj.h/2) ){
				obj.hp -= player.hit;
				if( obj.hp < 1 ){
					s_explosion = new Audio(s_explode); s_explosion.volume = Volume;
					s_explosion.play();
					obj.expl = 1;
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
				if ( ( player.alive == true && player.invis < 1 && player.x < obj.x+obj.range && player.x > obj.x-obj.range && player.y < obj.y+obj.range && player.y > obj.y-obj.range) || ( player.alive == true && player.invis < 1 && Stealth > 0  && player.x < obj.x+obj.range+obj.range*Stealth/20 && player.x > obj.x-obj.range-obj.range*Stealth/20 && player.y < obj.y+obj.range+obj.range*Stealth/20 && player.y > obj.y-obj.range-obj.range*Stealth/20 ) ){
					if( !obj.rant ){ obj.rant = 1 }
					var LPx = getLPX(player.x), LPy = getLPY(player.y);
					var dx = player.x - obj.x;
					var dy = player.y - obj.y;
					var dx1 = LPx-20 - obj.x;
					var dy1 = LPy-20 - obj.y;
					var dx2 = LPx+20 - obj.x;
					var dy2 = LPy+20 - obj.y;
					//if( Math.atan2(player.x, player.y)-PI > obj.rot ) { obj.rot = (obj.rot >= 2*PI) ? 0 : (obj.rot + obj.rotv); }
						//obj.rot = (obj.rot <= 0) ? 2*PI : (obj.rot - obj.rotv);
						/*var odir = Math.atan2(dx, dy)+PI;
						if(odir > 0){ odir += 2*PI }; if(odir > 2*PI){ odir -= 2*PI }
						if(obj.rot-PI < odir) { obj.rot = ( obj.rot >= 2*PI ) ? (obj.rot-2*PI)+obj.rotv : obj.rot+obj.rotv } else { obj.rot = ( obj.rot <= 0 ) ? (obj.rot+2*PI)-obj.rotv : obj.rot-obj.rotv }
						*/
						
					//if( Math.atan2(dy, dx) >= obj.rot ){ obj.rot += obj.rotv }
					//else if( Math.atan2(dy, dx) <= obj.rot ){ obj.rot -= obj.rotv }
						
						obj.rot = Math.atan2(dy, dx)-PI;
						
					if( obj.fire < 1 ){ 
						var s_shot1 = new Audio(src_rifleshot); s_shot1.volume = Volume/3;
						s_shot1.play(); shells = Math.floor(Math.random()*4)+1;
						switch( shells ){
							case 1: s_shell1.volume = Volume ; s_shell1.play(); break;
							case 2: s_shell2.volume = Volume ;s_shell2.play(); break;
							case 3: s_shell3.volume = Volume ;s_shell3.play(); break;
							case 4: s_shell4.volume = Volume ;s_shell4.play(); break;
						}
						obj.hito = 0.2;
						obj.fire = obj.trigger;
						if( rayIntersect(obj.x, obj.y, player.x, player.y, 40, 40, obj.rot-PI ) ){
							//Player was hit
							obj.hito = 0.5; sound = Math.floor(Math.random()*4)+1; s_ricochet = new Audio();
							switch (sound){
								case 1: s_ricochet.src = s_ricochet1; break;
								case 2: s_ricochet.src = s_ricochet2; break;
								case 3: s_ricochet.src = s_ricochet3; break;
								case 4: s_ricochet.src = s_ricochet4; break;
							} s_ricochet.volume = Volume/2; s_ricochet.play();
							player.health -= obj.dmg; HOpaque = 1.0;Stealth = 50; player.invis = 0;
						if( player.alive == true && player.x < obj.x+obj.range && player.x > obj.x-obj.range && player.y < obj.y+obj.range && player.y > obj.y-obj.range ){ Stealth = 50; }
							if (player.health < 1){
								player.alive = false;
								move = {a:false,w:false,s:false,d:false};
							}
						}
					}
					if( obj.rant == 1 ){
						groan = Math.floor(Math.random()*6)+1;
						switch( groan ){
							case 1: s_turret1.volume = Volume ; s_turret1.play(); console.log(obj.name+" - Fire away!"); break;
							case 2: s_turret2.volume = Volume ;s_turret2.play(); console.log(obj.name+" - Enemy spotted!"); break;
							case 3: s_turret3.volume = Volume ;s_turret3.play(); console.log(obj.name+" - Attack!"); break;
							case 4: s_turret4.volume = Volume ;s_turret4.play(); console.log(obj.name+" - Fire at will!"); break;
							case 5: s_turret5.volume = Volume ;s_turret5.play(); console.log(obj.name+" - Target adquired!"); break;
							case 6: s_turret6.volume = Volume ;s_turret6.play(); console.log(obj.name+" - Hey!"); break;
						}
						obj.rant++;
					}
				}else{
					if( obj.rot > 4 && obj.rotd > 0 ){
						obj.rotd = 0.01;
					}else if( obj.rot < 2 && obj.rotd < 0 ){
						obj.rotd = -0.01;
					}
					obj.rot += obj.rotd; obj.rant = 0;
				}
				ctx.save();
				var dx = player.x - obj.x;
				var dy = player.y - obj.y;
				ctx.translate(getLPX(obj.x), getLPY(obj.y));
				//ctx.fillText(odir, 20,-20);
				ctx.translate(-getLPX(obj.x), -getLPY(obj.y));
				ctx.translate(LPx, LPy);
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
	/*$('#mainc').on('mousedown mouseup', function mouseState(e) {
		if (e.type == "mousedown") {
			
		}else{
			mousepress = false;
		}
	});*/
	$('#mainc').mousedown(function(e) {
		switch (e.which) {
			case 1: //Left mouse button
				mousepress = true;
				mouseclick();
				break;
			case 2: //Middle mouse button
				
				break;
			case 3: //Right mouse button
				
				break;
		}
	});
	$('#mainc').mouseup(function(e) {
		switch (e.which) {
			case 1: //Left mouse button
				mousepress = false;
				break;
			case 2: //Middle mouse button
				
				break;
			case 3: //Right mouse button
				
				break;
		}
	});
	
	window.onkeydown = function (e){
		key = e.keyCode ? e.keyCode : e.which;
		console.log(key+" -  "+String.fromCharCode(key))
		if( player.alive == true )
		switch(key){
			//case 27:
				//if( pause == false ){ pause = true }else{ pause = false; move = {a:false,w:false,s:false,d:false}; } break;
			case 65:
				move.a = true; break;
			case 68:
				move.d = true; break;
			case 87:
				move.w = true; break;
			case 83:
				move.s = true; break;
			case 82:
				if(player.laser == false){player.laser = true}else{player.laser = false}; break;
			case 49:
				if( shotsourcefile != src_rifleshot && player.cooldown == 0 )
				equipRifle(); player.cooldown = 10;  break;
			case 50:
				if( shotsourcefile != src_cannonshot && player.cooldown == 0 )
				equipCanon(); player.cooldown = 10; break;
			case 51:
				if( shotsourcefile != src_shotgunshot && player.cooldown == 0 )
				equipShotgun(); player.cooldown = 10; break;
			case 52:
				if( shotsourcefile != src_silenceshot && player.cooldown == 0 )
				equipRifleSilence(); player.cooldown = 10; break;
			case 53:
				if( shotsourcefile != src_rifleshot1 && player.cooldown == 0 )
				equipMG(); player.cooldown = 10; break;
			case 73:
				if(player.invis < 1 && Stealth < 30){player.invis = 500; s_invis.volume = Volume; s_invis.play(); }
		} if (key == 27){
			if( pause == false ){ pause = true }else{ pause = false; move = {a:false,w:false,s:false,d:false}; }
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
	
	window.oncontextmenu = function(){
		return false;
	};
	
	function moving(){
		if(move.a == true && move.d == false){
			//for(i = 0; i < GameObjects.length; i++){ obj = GameObjects[i]
				//if( !((player.x-30 > obj.x || player.x+30 < obj.x) && (player.y-obj.height)) ){
					// player.x = obj.x+29 » player.x !> obj.x & player.x
					player.velx = -player.speed;
				//}
			//}
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
		if( pause == false ){
			if( player.alive == true && player.fire < 1 && player.ammo > 0){
				var shellxvel = 0, shellyvel = 0;
				x = mouse.x-getLPX(player.x); y = mouse.y-getLPY(player.y);
				player.fire = player.trigger
				if (  x > y*2 && x < -y*2  )   {player.vely = player.recoil; shellxvel = (Math.random()*5)+5; }  //top triangle
				else if (  x < y*2 && x > -y*2  )   {player.vely = -player.recoil; shellxvel = -(Math.random()*5)-5; }  //bottom triangle
				if (  -y > x*2 && -y < -x*2  )   {player.velx = player.recoil; shellyvel = -(Math.random()*5)-5; }  //left triangle
				else if(  -y < x*2 && -y > -x*2  )    {player.velx = -player.recoil; shellyvel = (Math.random()*5)+5; }  //right triangle
				
				var s_shot1 = new Audio(shotsourcefile); s_shot1.volume = Volume/3;
				s_shot1.play(); 
				if( shotsourcefile == src_rifleshot || shotsourcefile == src_rifleshot1 || shotsourcefile == src_silenceshot || shotsourcefile == src_shotgunshot ) { shells = Math.floor(Math.random()*4)+1;
				switch( shells ){
					case 1: s_shell1.volume = Volume ; s_shell1.play(); break;
					case 2: s_shell2.volume = Volume ;s_shell2.play(); break;
					case 3: s_shell3.volume = Volume ;s_shell3.play(); break;
					case 4: s_shell4.volume = Volume ;s_shell4.play(); break;
				}}
				player.ammo--; if( Stealth < Supress ){ Stealth = Supress };
				
				//if( player.rot > PI/2 && player.rot < PI ){ shellxvel = 5; shellyvel = 5; }
				//if( player.rot > 0 && player.rot < PI/2 ){ shellxvel = 5; shellyvel = -5; }
				//if( player.rot > -PI/2 && player.rot < 0 ){ shellxvel = -5; shellyvel = -5; }
				//if( player.rot > -PI && player.rot < -PI/2 ){ shellxvel = -5; shellyvel = 5; }
				var par = new Particle("PlayerShell", spr_shell, player.x, player.y, shellxvel, shellyvel, 6, 8, 0, (Math.random()*2), 0, 20); GameParticles.push(par);
			}
			if( player.alive == true && player.fire < 1 && player.ammo == 0){
				var s_click = new Audio(s_empty); s_click.volume = Volume/10;
				s_click.play();
			}
		}
	};