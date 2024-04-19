# Generated by Django 4.2.7 on 2024-03-26 10:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('VetBooker', '0013_remove_vet_secondary_skills'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='duration',
            field=models.IntegerField(blank=True, choices=[(15, 'Short'), (30, 'Medium'), (60, 'Long'), (120, 'Extra Long')], default=15, null=True, verbose_name='Duration'),
        ),
    ]