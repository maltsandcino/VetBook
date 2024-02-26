# Generated by Django 4.2.7 on 2024-02-26 11:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('VetBooker', '0004_alter_booking_day_alter_booking_end_time_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='vet',
            name='bookings',
            field=models.ManyToManyField(blank=True, null=True, related_name='vet_bookings', to='VetBooker.booking'),
        ),
    ]
