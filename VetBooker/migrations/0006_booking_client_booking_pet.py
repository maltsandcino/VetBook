# Generated by Django 4.2.7 on 2024-02-26 11:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('VetBooker', '0005_alter_vet_bookings'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='Client',
            field=models.ManyToManyField(null=True, related_name='booking_owner', to='VetBooker.client'),
        ),
        migrations.AddField(
            model_name='booking',
            name='Pet',
            field=models.ManyToManyField(null=True, related_name='booking_pet', to='VetBooker.pet'),
        ),
    ]
