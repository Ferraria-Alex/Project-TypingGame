from django.db import models

class Classes(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Classes"

class Character(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Powers(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    owned = models.BooleanField(default=False)
    character_class = models.ForeignKey(
        Classes,
        on_delete=models.CASCADE,
        related_name='powers'
    )

    def __str__(self):
        return self.name