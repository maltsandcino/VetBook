# Generated by Django 4.2.7 on 2024-03-08 18:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('VetBooker', '0011_remove_client_pet_remove_pet_owner_pet_owner'),
    ]

    operations = [
        migrations.AlterField(
            model_name='booking',
            name='Client',
            field=models.ManyToManyField(related_name='booking_owner', to='VetBooker.client'),
        ),
        migrations.AlterField(
            model_name='booking',
            name='Pet',
            field=models.ManyToManyField(related_name='booking_pet', to='VetBooker.pet'),
        ),
        migrations.AlterField(
            model_name='booking',
            name='procedure',
            field=models.ManyToManyField(related_name='booking_procedure', to='VetBooker.procedure'),
        ),
        migrations.AlterField(
            model_name='booking',
            name='vet',
            field=models.ManyToManyField(related_name='booking_vet', to='VetBooker.vet'),
        ),
        migrations.AlterField(
            model_name='client',
            name='bills',
            field=models.ManyToManyField(blank=True, related_name='bills', to='VetBooker.bill'),
        ),
        migrations.AlterField(
            model_name='client',
            name='bookings',
            field=models.ManyToManyField(blank=True, related_name='client_bookings', to='VetBooker.booking'),
        ),
        migrations.AlterField(
            model_name='pet',
            name='bookings',
            field=models.ManyToManyField(blank=True, related_name='pet_bookings', to='VetBooker.booking'),
        ),
        migrations.AlterField(
            model_name='pet',
            name='comments',
            field=models.ManyToManyField(blank=True, related_name='booking_comments', to='VetBooker.booking'),
        ),
        migrations.AlterField(
            model_name='vet',
            name='bookings',
            field=models.ManyToManyField(blank=True, related_name='vet_bookings', to='VetBooker.booking'),
        ),
        migrations.AlterField(
            model_name='vet',
            name='general_availibility',
            field=models.ManyToManyField(to='VetBooker.shift'),
        ),
        migrations.AlterField(
            model_name='vet',
            name='priority_skills',
            field=models.ManyToManyField(related_name='priority_skill', to='VetBooker.skill'),
        ),
        migrations.AlterField(
            model_name='vet',
            name='secondary_skills',
            field=models.ManyToManyField(related_name='secondary_skill', to='VetBooker.skill'),
        ),
    ]