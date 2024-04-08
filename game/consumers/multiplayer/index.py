from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = None
        for i in range(1000):
            name = "room-%d" % (i)
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break
        if not self.room_name: #无空房
            return

        await self.accept()

        if not cache.has_key(self.room_name): #房间不存在则新建房间
            cache.set(self.room_name, [], 3600)  #房间有效期1h

        for player in cache.get(self.room_name): #对该房间已经存在的用户，信息传给新加入用户
            await self.send(text_data=json.dumps({
                'event': "create_player",
                'uid': player['uid'],
                'username': player['username'],
                'photo': player['photo'],
            }))
        await self.channel_layer.group_add(self.room_name, self.channel_name)


    async def disconnect(self, close_code):
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name);

    async def create_player(self, data):
        players = cache.get(self.room_name)
        players.append({
            'uid': data['uid'],
            'username': data['username'],
            'photo': data['photo'],
        })
        cache.set(self.room_name, players, 3600)  ## 更新房间存在时间 （每加入一名玩家）
        # 群发消息更新
        await self.channel_layer.group_send(self.room_name, {
            'type': 'group_send_event', #群发消息后作为客户端接收者所用的函数名
            'event': 'create_player',
            'uid': data['uid'],
            'username': data['username'],
            'photo': data['photo'],
        })

    async def move_to(self, data):
        await self.channel_layer.group_send(self.room_name, {
                'type': "group_send_event",
                'event': "move_to",
                'uid': data['uid'],
                'tx': data['tx'],
                'ty': data['ty'],
        })

    async def shoot_fireball(self, data):
        await self.channel_layer.group_send(self.room_name, {
            'type': "group_send_event",
            'event': "shoot_fireball",
            'uid': data['uid'],
            'tx': data['tx'],
            'ty': data['ty'],
            'ball_uid': data['ball_uid'],
        })

    async def attack(self, data):
        await self .channel_layer.group_send(self.room_name, {
            'type': "group_send_event",
            'event': "attack",
            'uid': data['uid'],
            'attackee_uid': data['attackee_uid'],
            'x': data['x'],
            'y': data['y'],
            'angle': data['angle'],
            'damage': data['damage'],
            'ball_uid': data['ball_uid'],
        })

    async def group_send_event(self, data):
        await self.send(text_data=json.dumps(data))   #发送给前端

    async def receive(self, text_data): #从前端接收
        data = json.loads(text_data)
        print(data)
        event = data['event']
        if event == 'create_player':
            await self.create_player(data)
        elif event == "move_to":
            await self.move_to(data)
        elif event == "shoot_fireball":
            await self.shoot_fireball(data)
        elif event == "attack":
            await self.attack(data)