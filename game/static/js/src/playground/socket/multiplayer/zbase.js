class MultiPlayerSocket{
    constructor(playground){
        this.playground = playground;
        this.ws = new WebSocket("ws://8.140.22.23:8000/ws/multiplayer/");
        this.start();
    }
    start(){
        this.receive();
    }
    receive(){
        let outer = this;
        this.ws.onmessage = function(e){
            let data =  JSON.parse(e.data);
            let uid = data.uid;
            if(uid === outer.uid) return false;

            let event = data.event;
            console.log(event);
            if(event === "create_player"){
                outer.receive_create_player(uid, data.username, data.photo);
            }
            else if(event === "move_to"){
                outer.receive_move_to(uid, data.tx, data.ty);
            }
            else if(event === "shoot_fireball"){
                outer.receive_shoot_fireball(uid, data.tx, data.ty, data.ball_uid);
            }
            else if(event === "attack"){
                outer.receive_attack(uid, data.attackee_uid, data.x, data.y, data.angle, data.damage, data.ball_uid);
            }
            else if(event === "message"){
                console.log("receive post");
                outer.receive_message(data.username, data.text);
            }
            else if(event === "posion_attack"){
                outer.receive_posion_attack(uid);
            }
        };
    }
    send_create_player(username, photo){
        let outer = this;
        //console.log(username);
        this.ws.send(JSON.stringify({
            'event': 'create_player',
            'uid': outer.uid,
            'username': username,
            'photo': photo,
        }));
    }
    receive_create_player(uid, username, photo){
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.3,
            "enemy",
            username,
            photo,
        );
        player.uid = uid;
        this.playground.players.push(player);
    }
    get_player(uid){
        let players = this.playground.players;
        for(let i = 0; i < players.length; i ++ ){
            let player = players[i];
            //console.log("player:",player);
            if(player.uid === uid){
                return player;
            }
        }
        return null;
    }
    send_move_to(tx, ty){
        let outer = this;
        //console.log("send move to:", tx, ty, outer);
        this.ws.send(JSON.stringify({
            'event': 'move_to',
            'uid': outer.uid,
            'tx': tx,
            'ty': ty,
        }));
    }
    receive_move_to(uid, tx, ty){
        let player = this.get_player(uid);
        //console.log("receive move to:", tx, ty, player);
        if(player){
            player.move_to(tx, ty);
        }
    }
    send_shoot_fireball(tx, ty, ball_uid){
        let outer = this;
        //console.log("shoot fireball", tx, ty);
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uid': outer.uid,
            'tx': tx,
            'ty': ty,
            'ball_uid': ball_uid,
        }));
    }
    receive_shoot_fireball(uid, tx, ty, ball_uid){
        let player = this.get_player(uid);
        //console.log("receive shoot fireball", tx, ty);
        if(player){
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uid = ball_uid;
        }
    }
    send_attack(attackee_uid, x, y, angle, damage, ball_uid, source){
        let outer = this;
        //console.log("send attack");
        this.ws.send(JSON.stringify({
            'event': "attack",
            'uid': outer.uid,
            'attackee_uid': attackee_uid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uid': ball_uid,
            'source': source,
        }));
    }
    receive_attack(uid, attackee_uid, x, y, angle, damage, ball_uid){
        //console.log("receive_attack");
        let attacker = this.get_player(uid);
        let attackee = this.get_player(attackee_uid);
        if(attacker && attackee){
            attackee.receive_attack(x, y, angle, damage, ball_uid, attacker);
        }
    }
    send_message(text){
        //console.log("send", text);
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "message",
            'uid': outer.uid,
            'username': outer.playground.root.settings.username,
            'text': text,
        }));
    }
    receive_message(username, text){
        //console.log("receive", text);
        this.playground.chat.add_message(username, text);
    }
    send_posion_attack(){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "posion_attack",
            'uid': outer.uid,
        }));
    }
    receive_posion_attack(uid){
        let player = this.get_player(uid);
        console.log("receive posion attack");
        if(player){
            player.is_posion_attacked();
        }
    }
}