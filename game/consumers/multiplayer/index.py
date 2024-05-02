from channels.generic.websocket import AsyncWebsocketConsumer
import json
import math
from django.conf import settings
from django.core.cache import cache

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer

from match_system.src.match_server.match_service import Match
from game.models.player.player import Player
from channels.db import database_sync_to_async
class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        if self.room_name:
            await self.channel_layer.group_discard(self.room_name, self.channel_name);

    async def create_player(self, data):
        self.room_name = None
        self.uid = data['uid']

        transport = TSocket.TSocket('127.0.0.1', 9090)
        transport = TTransport.TBufferedTransport(transport)

        protocol = TBinaryProtocol.TBinaryProtocol(transport)

        client = Match.Client(protocol)

        def db_get_player():
            return Player.objects.get(user__username=data['username'])

        player = await database_sync_to_async(db_get_player)()

        transport.open()
        client.add_player(player.score, data['uid'], data['username'], data['photo'], self.channel_name)

        transport.close()

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
        if not self.room_name:
            return
        players = cache.get(self.room_name)

        if not players:
            return

        for player in players:
            if player['uid'] == data['attackee_uid']:
                player['hp'] -= 25

        remain_cnt = 0
        for player in players:
            if player['hp'] > 0:
                remain_cnt += 1


        if remain_cnt > 1: #继续进行哦游戏
            if self.room_name:
                cache.set(self.room_name, players, 3600)
            if remain_cnt == 2:
                for player in players:
                    if player['hp'] <= 0:
                        player['rank'] = 3
                        print(player['rank'])
                        cache.set(self.room_name, players, 3600)

        else: #游戏结算
            no1 = ""
            no2 = ""
            no3 = ""
            no1_score = 0
            no2_score = 0
            no3_score = 0
            def db_update_player_score(username, score):
                player = Player.objects.get(user__username=username)
                player.score += score
                player.save()
            # 计算预期胜率
            def expected_score(player_rating, opponent_rating):
                return 1 / (1 + math.pow(10, (opponent_rating - player_rating) / 400))
            # 结算后的增加/减少的分数
            def update_rating(player_rating, opponent_rating, player_score, k_factor=32):
                expected = expected_score(player_rating, opponent_rating)
                return k_factor * (player_score - expected)
            for player in players:
                print("=====\n",player)
                if player['hp'] <= 0 and player['rank'] == 0:
                    player['rank'] = 2
                    no2_score = player['score']
                    no2 = player['username']
                if player['hp'] > 0 and player['rank'] == 0:
                    player['rank'] = 1
                    no1_score = player['score']
                    no1 = player['username']
                if player['rank'] == 3:
                    no3_score = player['score']
                    no3 = player['username']

            # no1赢了no2和no3
            score1 = update_rating(no1_score, no2_score, 1)
            score1 += update_rating(no1_score, no3_score, 1)
            # no2赢了no3 输给了no1
            score2 = update_rating(no2_score, no3_score, 1)
            score2 += update_rating(no2_score, no1_score, 0)
            # no3输给了no1和no2
            score3 = update_rating(no3_score, no1_score, 0)
            score3 += update_rating(no3_score, no2_score, 0)
            print(score1, score2, score3)
            print(no1, no2, no3)



            await database_sync_to_async(db_update_player_score)(no1, score1)
            await database_sync_to_async(db_update_player_score)(no2, score2)
            await database_sync_to_async(db_update_player_score)(no3, score3)

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

    async def message(self, data):
        await self .channel_layer.group_send(self.room_name, {
            'type': "group_send_event",
            'event': "message",
            'uid': data['uid'],
            'username': data['username'],
            'text': data['text'],
        })

    async def group_send_event(self, data):
        if not self.room_name:  #找到所在游戏房间
            keys = cache.keys('*%s*'%(self.uid))
            if keys:
                self.room_name = keys[0]
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
        elif event == "message":
            await self.message(data)