## To change db:
Link: https://www.w3schools.com/django/django_update_model.php

- Make sure all latest migrations have been merged to main
- Pull latest migrations from main
- Make changes to models.py
- Save changes
```
# From venv at /backend
python manage.py makemigrations uasams
```
- If there is a non-nullable field message, enter 1 and set default to
 - "" for varchar/text
 - 0 for int/bigint
 - 0.0 for decimal/float
- After makemigrations,
```
python manage.py migrate
```
- If all goes well, there should be one new migration file, and it should say "Applying <migration file name>... OK"
- If not, let Amy know


## To reset db:**

- Delete uasams folder
- Delete migrations folder
- Delete uasams from settings.py installed apps
```
#From venv at /backend
python manage.py startapp uasams
```
- Re-enter uasams to setting.py installed apps
```
#From venv at /backend
python manage.py makemigrations
python manage.py migrate
```