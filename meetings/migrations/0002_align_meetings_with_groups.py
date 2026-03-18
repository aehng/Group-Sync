from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("groups", "0003_add_group_invite_code"),
        ("meetings", "0001_initial"),
    ]

    operations = [
        migrations.RenameField(
            model_name="meeting",
            old_name="location",
            new_name="location_or_link",
        ),
        migrations.AddField(
            model_name="meeting",
            name="agenda",
            field=models.TextField(blank=True, default=""),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="meeting",
            name="end_time",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="meeting",
            name="group",
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="meetings", to="groups.group"),
        ),
        migrations.DeleteModel(
            name="Group",
        ),
    ]
