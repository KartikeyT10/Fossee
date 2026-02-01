from django.db import models

class Dataset(models.Model):
    file = models.FileField(upload_to='datasets/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    summary_stats = models.JSONField(default=dict)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"Dataset {self.id} - {self.uploaded_at}"
