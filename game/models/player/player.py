from django.db import models
from django.contrib.auth.models import User
class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # player是从User表扩充来的，每个player与user一一对应
    # 后一个参数是指当user被删除时，对应player也要被删除
    photo = models.URLField(max_length=256, blank=True)  # 存储头像
    score = models.IntegerField(default=1500)
    # isOnline = models.BooleanField(default=False)
    history_scores = models.JSONField(default=[1500])

    def __str__(self):
        return str(self.user)