from django.db import models

class Meeting(models.Model):

    date = models.DateField() #store date.
    
    hours_worked = models.DecimalField(max_digits=5, decimal_places=2) #stores hours
    
    description = models.TextField() #store text description of the work.

    def __str__(self):
        return f"Meeting on {self.date}" #tells Django how to name a meeting in the admin list