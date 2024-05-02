#! /usr/bin/env python3

import glob
import sys
sys.path.insert(0, glob.glob('../../')[0])

from match_server.match_service import Match

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer

from queue import Queue
from time import sleep
from threading import Thread

from app.asgi import channel_layer
from asgiref.sync import async_to_sync # 多线程变为单线程
from django.core.cache import cache

queue = Queue() #消息队列

class Player:
    def __init__(self, score, uid, username, photo, channel_name):
        self.score = score
        self.uid = uid
        self.username = username
        self.photo = photo
        self.channel_name = channel_name
        self.waiting_time = 0

class Pool:
    def __init__(self):
        self.players = []

    def add_player(self, player):
        self.players.append(player)

    def check_match(self, a, b): #检验是不是匹配
        dt = abs(a.score - b.score) #分差
        a_max_dif = a.waiting_time * 50
        b_max_dif = b.waiting_time * 50
        # print("a_max_dif", a_max_dif)
        return dt <= a_max_dif and dt <= b_max_dif

    def match_success(self, players):
        print("Match Success: %s %s %s" % (players[0].username, players[1].username, players[2].username))
        room_name = "room-%s-%s-%s" % (players[0].uid, players[1].uid, players[2].uid)  #创建游戏房间
        room_players = []
        for player in players:
            async_to_sync(channel_layer.group_add)(room_name, player.channel_name)
            room_players.append({
                'uid': player.uid,
                'username': player.username,
                'photo': player.photo,
                'hp': 100,
                'score': player.score,
                'rank': 0
            })
        cache.set(room_name, room_players, 3600)  # 将房间信息存到内存
        for player in players:
            async_to_sync(channel_layer.group_send)(  # 将玩家信息群发
                room_name,
                {
                    'type': "group_send_event",
                    'event': "create_player",
                    'uid': player.uid,
                    'username': player.username,
                    'photo': player.photo,
                }
            )

    def increase_waiting_time(self):
        for player in self.players:
            # print(player.waiting_time)
            player.waiting_time += 1

    def match(self):

        while len(self.players) >= 3:
            self.players = sorted(self.players, key=lambda p: p.score)
            flag = False
            for i in range(len(self.players) - 2):
                a, b, c = self.players[i], self.players[i + 1], self.players[i + 2]
                print("Match : %d %d %d" % (a.score, b.score, c.score))
                if self.check_match(a, b) and self.check_match(b, c) and self.check_match(c, a):
                    self.match_success([a, b, c])
                    self.players = self.players[:i] + self.players[i + 3:]
                    flag = True
                    break
            if not flag:
                    break

        self.increase_waiting_time()



class MatchHandler:  #生产者
    def add_player(self, score, uid, username, photo, channel_name):
        print("Add Player: %s %d" % (username, score))
        player = Player(score, uid, username, photo, channel_name)
        queue.put(player)
        return 0

def get_player_from_queue():
    try:
        return queue.get_nowait()
    except:
        return None

def worker(): #消费者
    pool = Pool()
    while True:
        player = get_player_from_queue()
        if player:
            pool.add_player(player)
        else:
            pool.match()
            sleep(1)  #防止匹配进程占满cpu


if __name__ == '__main__':
    handler = MatchHandler()
    processor = Match.Processor(handler)
    transport = TSocket.TServerSocket(host='127.0.0.1', port=9090)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()



    server = TServer.TThreadedServer(
        processor, transport, tfactory, pfactory)

    Thread(target=worker, daemon=True).start()  # daemon = true 将线程设置为守护线程，着当主线程结束时，守护线程也会随之结束。

    print('Starting the server...')
    server.serve()
    print('done.')