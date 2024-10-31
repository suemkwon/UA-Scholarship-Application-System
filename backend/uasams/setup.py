from setuptools import setup, find_packages

setup(
    name='uasams',
    version='0.1',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'asgiref==3.7.2',
        'Django==4.2.9',
        'django-cors-headers==4.3.1',
        'djangorestframework==3.14.0',
        'psycopg2-binary==2.9.9',
        'pytz==2023.4',
        'sqlparse==0.4.4',
        'typing_extensions==4.9.0',
        'pytest==7.0.1',
    ],
)