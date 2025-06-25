from django.db import models

class Accounts(models.Model):
    username = models.CharField(max_length=25, unique=True)
    email = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=25, unique=False)
    gold = models.BigIntegerField(blank=True)
    is_active = models.BooleanField()
    last_login = models.DateField()

    def __str__(self):
        return self.name

class Classes(models.Model):
    name = models.CharField(max_length=25, unique=True)

    def __str__(self):
        return self.name

class Powers(models.Model):
    name = models.CharField(max_length=25, unique=True)
    description = models.TextField(null=True)
    type = models.CharField(max_length=25)
    classe = models.ForeignKey(
        Classes,
        on_delete=models.CASCADE,
        related_name='powers'
    )

    def __str__(self):
        return self.name
    
class Characters(models.Model):
    name = models.CharField(max_length=50)
    id_class = models.ForeignKey(
        Classes,
        on_delete=models.CASCADE,
        related_name='characters'
    )
    account = models.ForeignKey(
        Accounts,
        on_delete=models.CASCADE,
        related_name='characters'
    )

    def __str__(self):
        return self.name
    
class Levels(models.Model):
    name = models.CharField(max_length=50, unique=True)
    completion_time = models.TimeField()
    kill_amount = models.IntegerField(null=True)
    character = models.ForeignKey(
        Characters, 
        on_delete=models.CASCADE,
        related_name='levels'
    )

    def __str__(self):
        return self.name

    
class CharacterPower(models.Model):
    character = models.ForeignKey(
        Characters, 
        on_delete=models.CASCADE,
        db_column='id_character'
    )
    power = models.ForeignKey(
        Powers, 
        on_delete=models.CASCADE,
        db_column='id_power'
    )
    slots = models.PositiveSmallIntegerField(default=0)
    
    class Meta:
        db_table = 'character_powers'
        unique_together = ('character', 'power')
    

class AccountPower(models.Model):
    account = models.ForeignKey(
        Accounts, 
        on_delete=models.CASCADE,
        db_column='id_account'
    )
    power = models.ForeignKey(
        Powers, 
        on_delete=models.CASCADE,
        db_column='id_power'
    )
    unlocked_at = models.DateField()
    
    class Meta:
        db_table = 'account_powers'
        unique_together = ('account', 'power')