# Generated migration to refactor Group model and add GroupMember model

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import groups.models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('groups', '0001_initial'),
    ]

    operations = [
        # First, remove the ManyToMany field
        migrations.RemoveField(
            model_name='group',
            name='members',
        ),
        # Remove description field
        migrations.RemoveField(
            model_name='group',
            name='description',
        ),
        # Rename created_by to owner
        migrations.RenameField(
            model_name='group',
            old_name='created_by',
            new_name='owner',
        ),
        # Alter name field to have max_length=100 and add validator
        migrations.AlterField(
            model_name='group',
            name='name',
            field=models.CharField(
                help_text='The name of the group (max 100 characters)',
                max_length=100,
                validators=[groups.models.validate_group_name]
            ),
        ),
        # Create the new GroupMember model
        migrations.CreateModel(
            name='GroupMember',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('role', models.CharField(
                    choices=[('owner', 'Owner'), ('member', 'Member')],
                    default='member',
                    help_text='The role of the user in the group',
                    max_length=10
                )),
                ('joined_at', models.DateTimeField(auto_now_add=True)),
                ('group', models.ForeignKey(
                    help_text='The group this membership belongs to',
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='members',
                    to='groups.group'
                )),
                ('user', models.ForeignKey(
                    help_text='The user who is a member of the group',
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='group_memberships',
                    to=settings.AUTH_USER_MODEL
                )),
            ],
            options={
                'verbose_name': 'Group Member',
                'verbose_name_plural': 'Group Members',
                'ordering': ['-joined_at'],
            },
        ),
        # Add unique constraint
        migrations.AlterUniqueTogether(
            name='groupmember',
            unique_together={('group', 'user')},
        ),
    ]
