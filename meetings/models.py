from django.db import models

class Meeting(models.Model):
    # This stores the date.
    date = models.DateField()
    
    # This stores the hours
    hours_worked = models.DecimalField(max_digits=5, decimal_places=2)
    
    # This stores the text description of the work.
    description = models.TextField()

    def __str__(self):
        # This tells Django how to name a meeting in the admin list
        return f"Meeting on {self.date}"