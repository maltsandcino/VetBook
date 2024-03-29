# Generated by Django 4.2.7 on 2024-02-14 09:56

import django.contrib.auth.models
import django.contrib.auth.validators
from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Bill',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
        ),
        migrations.CreateModel(
            name='Booking',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_time', models.DateTimeField()),
                ('end_time', models.DateTimeField()),
                ('comments', models.TextField(blank=True)),
                ('bill', models.ManyToManyField(null=True, related_name='procedure_bill', to='VetBooker.bill')),
            ],
        ),
        migrations.CreateModel(
            name='Client',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField(blank=True)),
                ('telephone', models.TextField(blank=True)),
                ('email', models.TextField(blank=True)),
                ('address', models.TextField(blank=True)),
                ('bills', models.ManyToManyField(null=True, related_name='bills', to='VetBooker.bill')),
                ('bookings', models.ManyToManyField(null=True, related_name='client_bookings', to='VetBooker.booking')),
            ],
        ),
        migrations.CreateModel(
            name='Procedure',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField(blank=True)),
                ('price', models.IntegerField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Shift',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('day', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Skill',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('skill', models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('email', models.EmailField(blank=True, max_length=254, verbose_name='email address')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='Vet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField(blank=True)),
                ('bookings', models.ManyToManyField(null=True, related_name='vet_bookings', to='VetBooker.booking')),
                ('general_availibility', models.ManyToManyField(null=True, to='VetBooker.shift')),
                ('priority_skills', models.ManyToManyField(null=True, related_name='priority_skill', to='VetBooker.skill')),
                ('secondary_skills', models.ManyToManyField(null=True, related_name='secondary_skill', to='VetBooker.skill')),
            ],
        ),
        migrations.CreateModel(
            name='Pet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField(blank=True)),
                ('species', models.TextField(blank=True)),
                ('breed', models.TextField(blank=True, null=True)),
                ('conditions', models.TextField(blank=True)),
                ('bookings', models.ManyToManyField(null=True, related_name='pet_bookings', to='VetBooker.booking')),
                ('comments', models.ManyToManyField(null=True, related_name='booking_comments', to='VetBooker.booking')),
                ('owner', models.ManyToManyField(null=True, related_name='owner_pet', to='VetBooker.client')),
            ],
        ),
        migrations.AddField(
            model_name='client',
            name='pet',
            field=models.ManyToManyField(null=True, related_name='pet_owner', to='VetBooker.pet'),
        ),
        migrations.AddField(
            model_name='booking',
            name='procedure',
            field=models.ManyToManyField(null=True, related_name='booking_procedure', to='VetBooker.procedure'),
        ),
    ]
