import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework.test import APIRequestFactory
from rest_framework import status
from uasams.models import User, Student, Scholarship, Application
from datetime import datetime, timedelta
from unittest.mock import MagicMock
import csv
from io import StringIO
from django.http import HttpResponse
from uasams import UserType
from uasams import ApplicationStatus

@pytest.mark.django_db
def test_create_user_endpoint():
    client = APIClient()
    url = reverse('create_user')
    data = {
        'netID': 'test_netID',
        'username': 'test_username',
        'password': 'test_password',
        'email': 'test@example.com',
        'sec1Q': 'test_sec1Q',
        'sec1A': 'test_sec1A',
        'sec2Q': 'test_sec2Q',
        'sec2A': 'test_sec2A',
        'firstName': 'Test',
        'lastName': 'User',
        'phone': '1234567890'
    }

    response = client.post(url, data, format='json')
    assert response.status_code == status.HTTP_201_CREATED

    # Check if the user and student are created in the database
    assert User.objects.filter(netID='test_netID').exists()
    assert Student.objects.filter(netID='test_netID').exists()

@pytest.mark.django_db
def test_get_users_endpoint():
    # Create some sample users for testing
    User.objects.create(
        userID=1,
        netID='test_netID1',
        username='test_username1',
        email='test1@example.com',
        type='Student',
        firstName='Test1',
        lastName='User1',
        phone='1234567890'
    )
    User.objects.create(
        userID=2,
        netID='test_netID2',
        username='test_username2',
        email='test2@example.com',
        type='Student',
        firstName='Test2',
        lastName='User2',
        phone='1234567890'
    )

    client = APIClient()
    url = reverse('get_users')

    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK

    # Check if the returned data matches the sample users
    assert len(response.data['users']) == 2
    assert response.data['users'][0]['netID'] == 'test_netID1'
    assert response.data['users'][1]['netID'] == 'test_netID2'

@pytest.mark.django_db
def test_update_user_endpoint():
    # Create a sample user for testing
    user = User.objects.create(
        userID=1,
        netID='test_netID',
        username='test_username',
        email='test@example.com',
        type='Student',
        firstName='Test',
        lastName='User',
        phone='1234567890'
    )

    client = APIClient()
    url = reverse('update_user')
    updated_data = {
        'userID': user.userID,
        'username': 'updated_username',
        'email': 'updated_email@example.com',
        'type': 'updated_type',
        'firstName': 'Updated',
        'lastName': 'User',
        'phone': '0987654321'
    }

    response = client.put(url, updated_data, format='json')

    assert response.status_code == status.HTTP_200_OK

    # Check if the user is updated in the database
    user.refresh_from_db()
    assert user.username == 'updated_username'
    assert user.email == 'updated_email@example.com'
    assert user.type == 'updated_type'
    assert user.firstName == 'Updated'
    assert user.phone == '0987654321'

@pytest.mark.django_db
def test_create_scholarship_endpoint():
    client = APIClient()
    url = reverse('create_scholarship')
    data = {
        'scholarshipName': 'Test Scholarship',
        'awardAmount': 1000,
        'sponsorID': 1,
        'numberAvailable': 5,
        'gpa': 3.5,
        'deadline': '2024-05-31',
        'otherRequirements': 'Test requirements',
        'majors': ['Computer Science'],
        'minors': ['Mathematics']
    }

    response = client.post(url, data, format='json')
    assert response.status_code == status.HTTP_201_CREATED

    # Check if the scholarship is created in the database
    assert Scholarship.objects.filter(scholarshipName='Test Scholarship').exists()
    scholarship = Scholarship.objects.get(scholarshipName='Test Scholarship')
    assert scholarship.scholarshipName == data['scholarshipName']
    assert scholarship.awardAmount == data['awardAmount']
    assert scholarship.sponsorID == data['sponsorID']
    assert scholarship.numberAvailable == data['numberAvailable']
    assert scholarship.gpa == data['gpa']
    assert scholarship.deadline == datetime.strptime(data['deadline'], '%Y-%m-%d')
    assert scholarship.otherRequirements == data['otherRequirements']
    assert scholarship.majors == data['majors']
    assert scholarship.minors == data['minors']

@pytest.mark.django_db
def test_create_application_endpoint():
    # Create sample user, student, and scholarship for testing
    user = User.objects.create(
        userID=1,
        netID='test_user',
        username='test_username',
        password='test_password',
        type='Student',
        sec1Q='Security Question 1',
        sec1A='Hashed Answer 1',
        sec2Q='Security Question 2',
        sec2A='Hashed Answer 2',
        firstName='John',
        lastName='Doe',
        phone=1234567890,
        email='test@example.com',
        listColumn=[]
    )

    student = Student.objects.create(
        studentID=1,
        netID='test_user',
        pronouns='',
        ethnicity='',
        currentYear='',
        gpa=0.0,
        majors='',
        minors='',
        personalStatement='',
        workExperience=''
    )

    scholarship = Scholarship.objects.create(
        scholarshipID=1,
        scholarshipName='Test Scholarship',
        awardAmount=1000,
        sponsorID=1,
        numberAvailable=5,
        gpa=3.5,
        deadline=datetime.now(),
        otherRequirements='Test requirements',
        majors=['Computer Science'],
        minors=['Mathematics'],
        applications=[]
    )

    client = APIClient()
    url = reverse('create_application')
    data = {
        'applicationID': 1,
        'userID': 'test_user',
        'scholarshipID': 1,
        'firstName': 'John',
        'lastName': 'Doe',
        'essay': 'Test essay',
        'transcript': 'Test transcript',
        'recommendationLetter': 'Test recommendation letter',
    }

    response = client.post(url, data, format='json')
    assert response.status_code == status.HTTP_201_CREATED

    # Check if the application is created in the database
    assert Application.objects.filter(applicationID=1).exists()
    application = Application.objects.get(applicationID=1)
    assert application.netID == 'test_user'
    assert application.scholarshipID == 1
    assert application.firstName == 'John'
    assert application.lastName == 'Doe'
    assert application.essay == 'Test essay'
    assert application.transcript == 'Test transcript'
    assert application.recommendationLetter == 'Test recommendation letter'

    # Check if the user and scholarship are updated with the application ID
    user.refresh_from_db()
    assert application.id in user.listColumn
    scholarship.refresh_from_db()
    assert application.id in scholarship.applications

@pytest.mark.django_db
def test_get_scholarship_applications_endpoint():
    # Create a sample scholarship and associated applications for testing
    scholarship = Scholarship.objects.create(
        scholarshipID=1,
        scholarshipName='Test Scholarship',
        awardAmount=1000,
        sponsorID=1,
        numberAvailable=5,
        gpa=3.5,
        deadline=datetime.now(),
        otherRequirements='Test requirements',
        majors=['Computer Science'],
        minors=['Mathematics'],
        applications=[]
    )

    application_data = {
        'applicationID': 1,
        'netID': 'test_user',
        'scholarshipID': 1,
        'timestamp': datetime.now(),
        'firstName': 'John',
        'lastName': 'Doe',
        'essay': 'Test essay',
        'transcript': 'Test transcript',
        'recommendationLetter': 'Test recommendation letter',
        'status': 'Submitted'
    }

    application = Application.objects.create(**application_data)
    scholarship.applications.append(application.applicationID)
    scholarship.save()

    client = APIClient()
    url = reverse('get_scholarship_applications', args=[1])

    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK

    # Check if the returned data matches the sample application
    assert len(response.data['applications']) == 1
    assert response.data['applications'][0]['applicationID'] == application_data['applicationID']
    assert response.data['applications'][0]['netID'] == application_data['netID']
    assert response.data['applications'][0]['scholarshipID'] == application_data['scholarshipID']
    assert response.data['applications'][0]['timestamp'] == str(application_data['timestamp'])
    assert response.data['applications'][0]['firstName'] == application_data['firstName']
    assert response.data['applications'][0]['lastName'] == application_data['lastName']
    assert response.data['applications'][0]['essay'] == application_data['essay']
    assert response.data['applications'][0]['transcript'] == application_data['transcript']
    assert response.data['applications'][0]['recommendationLetter'] == application_data['recommendationLetter']
    assert response.data['applications'][0]['status'] == application_data['status']

@pytest.mark.django_db
def test_get_scholarships_from_applications_endpoint():
    # Create a sample scholarship and associated application for testing
    scholarship = Scholarship.objects.create(
        scholarshipID=1,
        scholarshipName='Test Scholarship',
        awardAmount=1000,
        sponsorID=1,
        numberAvailable=5,
        gpa=3.5,
        deadline=datetime.now(),
        otherRequirements='Test requirements',
        majors=['Computer Science'],
        minors=['Mathematics'],
        applications=[]
    )

    application = Application.objects.create(
        applicationID=1,
        netID='test_user',
        scholarshipID=1,
        timestamp=datetime.now(),
        firstName='John',
        lastName='Doe',
        essay='Test essay',
        transcript='Test transcript',
        recommendationLetter='Test recommendation letter',
        status='Submitted'
    )

    client = APIClient()
    url = reverse('get_scholarships_from_applications', args=['1'])

    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK

    # Check if the returned data matches the sample scholarship
    assert len(response.data['scholarships']) == 1
    assert response.data['scholarships'][0]['applicationID'] == '1'
    assert response.data['scholarships'][0]['scholarshipName'] == 'Test Scholarship'

@pytest.mark.django_db
def test_get_student_applications_endpoint():
    # Create a sample application for testing
    application_data = {
        'applicationID': 1,
        'netID': 'test_user',
        'scholarshipID': 1,
        'timestamp': datetime.now(),
        'firstName': 'John',
        'lastName': 'Doe',
        'essay': 'Test essay',
        'transcript': 'Test transcript',
        'recommendationLetter': 'Test recommendation letter',
        'status': 'Submitted'
    }

    application = Application.objects.create(**application_data)

    client = APIClient()
    url = reverse('get_student_applications', args=['test_user'])

    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK

    # Check if the returned data matches the sample application
    assert len(response.data['applications']) == 1
    assert response.data['applications'][0]['applicationID'] == application_data['applicationID']
    assert response.data['applications'][0]['netID'] == application_data['netID']
    assert response.data['applications'][0]['scholarshipID'] == application_data['scholarshipID']
    assert response.data['applications'][0]['timestamp'] == str(application_data['timestamp'])
    assert response.data['applications'][0]['firstName'] == application_data['firstName']
    assert response.data['applications'][0]['lastName'] == application_data['lastName']
    assert response.data['applications'][0]['essay'] == application_data['essay']
    assert response.data['applications'][0]['transcript'] == application_data['transcript']
    assert response.data['applications'][0]['recommendationLetter'] == application_data['recommendationLetter']
    assert response.data['applications'][0]['status'] == application_data['status']

@pytest.mark.django_db
def test_get_applications_endpoint():
    # Create sample applications for testing
    application_data_1 = {
        'applicationID': 1,
        'netID': 'test_user1',
        'scholarshipID': 1,
        'timestamp': datetime.now(),
        'firstName': 'John',
        'lastName': 'Doe',
        'essay': 'Test essay',
        'transcript': 'Test transcript',
        'recommendationLetter': 'Test recommendation letter',
        'status': 'Submitted'
    }

    application_data_2 = {
        'applicationID': 2,
        'netID': 'test_user2',
        'scholarshipID': 2,
        'timestamp': datetime.now(),
        'firstName': 'Jane',
        'lastName': 'Smith',
        'essay': 'Another test essay',
        'transcript': 'Another test transcript',
        'recommendationLetter': 'Another test recommendation letter',
        'status': 'Pending'
    }

    Application.objects.create(**application_data_1)
    Application.objects.create(**application_data_2)

    client = APIClient()
    url = reverse('get_applications')

    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK

    # Check if the returned data matches the sample applications
    assert len(response.data['applications']) == 2

    # Check the first application
    assert response.data['applications'][0]['applicationID'] == application_data_1['applicationID']
    assert response.data['applications'][0]['netID'] == application_data_1['netID']
    assert response.data['applications'][0]['scholarshipID'] == application_data_1['scholarshipID']
    assert response.data['applications'][0]['timestamp'] == str(application_data_1['timestamp'])
    assert response.data['applications'][0]['firstName'] == application_data_1['firstName']
    assert response.data['applications'][0]['lastName'] == application_data_1['lastName']
    assert response.data['applications'][0]['essay'] == application_data_1['essay']
    assert response.data['applications'][0]['transcript'] == application_data_1['transcript']
    assert response.data['applications'][0]['recommendationLetter'] == application_data_1['recommendationLetter']
    assert response.data['applications'][0]['status'] == application_data_1['status']

    # Check the second application
    assert response.data['applications'][1]['applicationID'] == application_data_2['applicationID']
    assert response.data['applications'][1]['netID'] == application_data_2['netID']
    assert response.data['applications'][1]['scholarshipID'] == application_data_2['scholarshipID']
    assert response.data['applications'][1]['timestamp'] == str(application_data_2['timestamp'])
    assert response.data['applications'][1]['firstName'] == application_data_2['firstName']
    assert response.data['applications'][1]['lastName'] == application_data_2['lastName']
    assert response.data['applications'][1]['essay'] == application_data_2['essay']
    assert response.data['applications'][1]['transcript'] == application_data_2['transcript']
    assert response.data['applications'][1]['recommendationLetter'] == application_data_2['recommendationLetter']
    assert response.data['applications'][1]['status'] == application_data_2['status']

@pytest.mark.django_db
def test_update_application_endpoint():
    # Create a sample application for testing
    application = Application.objects.create(
        applicationID=1,
        netID='test_user',
        scholarshipID=1,
        timestamp=datetime.now(),
        firstName='John',
        lastName='Doe',
        essay='Test essay',
        transcript='Test transcript',
        recommendationLetter='Test recommendation letter',
        status='Submitted'
    )

    client = APIClient()
    url = reverse('update_application')

    # Update data
    updated_data = {
        'applicationID': 1,
        'netID': 'updated_user',
        'scholarshipID': 2,
        'timestamp': datetime.now(),
        'firstName': 'Jane',
        'lastName': 'Smith',
        'essay': 'Updated essay',
        'transcript': 'Updated transcript',
        'recommendationLetter': 'Updated recommendation letter',
        'status': 'Pending'
    }

    response = client.put(url, updated_data, format='json')

    assert response.status_code == status.HTTP_200_OK

    # Check if the application is updated in the database
    updated_application = Application.objects.get(applicationID=1)
    assert updated_application.netID == updated_data['netID']
    assert updated_application.scholarshipID == updated_data['scholarshipID']
    assert updated_application.firstName == updated_data['firstName']
    assert updated_application.lastName == updated_data['lastName']
    assert updated_application.essay == updated_data['essay']
    assert updated_application.transcript == updated_data['transcript']
    assert updated_application.recommendationLetter == updated_data['recommendationLetter']
    assert updated_application.status == updated_data['status']

@pytest.mark.django_db
def test_create_student_endpoint():
    client = APIClient()
    url = reverse('create_student')
    data = {
        'studentID': 1,
        'netID': 'test_user',
        'pronouns': 'he/him',
        'ethnicity': 'Asian',
        'currentYear': 'Senior',
        'gpa': 3.7,
        'majors': 'Computer Science',
        'minors': 'Mathematics',
        'personalStatement': 'Test personal statement',
        'workExperience': 'Test work experience'
    }

    response = client.post(url, data, format='json')
    assert response.status_code == status.HTTP_201_CREATED

    # Check if the student is created in the database
    assert Student.objects.filter(studentID=1).exists()
    student = Student.objects.get(studentID=1)
    assert student.netID == data['netID']
    assert student.pronouns == data['pronouns']
    assert student.ethnicity == data['ethnicity']
    assert student.currentYear == data['currentYear']
    assert student.gpa == data['gpa']
    assert student.majors == data['majors']
    assert student.minors == data['minors']
    assert student.personalStatement == data['personalStatement']
    assert student.workExperience == data['workExperience']

@pytest.mark.django_db
def test_login_endpoint():
    # Create a sample user for testing
    user_data = {
        'userID': 1,
        'netID': 'test_user',
        'username': 'test_username',
        'password': 'test_password',
        'email': 'test@example.com',
        'type': 'Student',
        'firstName': 'John',
        'lastName': 'Doe',
        'phone': 1234567890,
        'sec1Q': 'Test Question 1',
        'sec1A': 'Test Answer 1',
        'sec2Q': 'Test Question 2',
        'sec2A': 'Test Answer 2',
    }
    user = User.objects.create(**user_data)

    # Create a sample student for testing
    student_data = {
        'studentID': 1,
        'netID': 'test_user',
        'pronouns': 'he/him',
        'ethnicity': 'Asian',
        'currentYear': 'Senior',
        'gpa': 3.7,
        'majors': 'Computer Science',
        'minors': 'Mathematics',
        'personalStatement': 'Test personal statement',
        'workExperience': 'Test work experience'
    }
    student = Student.objects.create(**student_data)

    client = APIClient()
    url = reverse('login')
    data = {
        'username': 'test_username',
        'password': 'test_password'
    }

    response = client.post(url, data, format='json')

    assert response.status_code == status.HTTP_200_OK

    # Check if the correct response data is returned
    assert response.data['user_id'] == user.userID
    assert response.data['net_id'] == user.netID
    assert response.data['firstName'] == user.firstName
    assert response.data['lastName'] == user.lastName
    assert response.data['student_id'] == student.studentID
    assert response.data['pronouns'] == student.pronouns
    assert response.data['ethnicity'] == student.ethnicity
    assert response.data['currentYear'] == student.currentYear
    assert response.data['gpa'] == student.gpa
    assert response.data['majors'] == student.majors
    assert response.data['minors'] == student.minors
    assert response.data['type'] == user.type

@pytest.mark.django_db
def test_get_all_scholarships_endpoint():
    # Create sample scholarships for testing
    scholarship_data_1 = {
        'scholarshipID': 1,
        'scholarshipName': 'Test Scholarship 1',
        'awardAmount': 1000,
        'sponsorID': 1,
        'numberAvailable': 5,
        'majors': ['Computer Science'],
        'minors': ['Mathematics'],
        'gpa': 3.5,
        'deadline': datetime.now(),
        'otherRequirements': 'Test requirements 1',
        'applications': [],
        'awardedApplications': []
    }

    scholarship_data_2 = {
        'scholarshipID': 2,
        'scholarshipName': 'Test Scholarship 2',
        'awardAmount': 2000,
        'sponsorID': 2,
        'numberAvailable': 3,
        'majors': ['Engineering'],
        'minors': ['Physics'],
        'gpa': 3.7,
        'deadline': datetime.now(),
        'otherRequirements': 'Test requirements 2',
        'applications': [],
        'awardedApplications': []
    }

    Scholarship.objects.create(**scholarship_data_1)
    Scholarship.objects.create(**scholarship_data_2)

    client = APIClient()
    url = reverse('get_all_scholarships')

    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK

    # Check if the returned data matches the sample scholarships
    assert len(response.data['scholarships']) == 2

    # Check the first scholarship
    assert response.data['scholarships'][0]['scholarshipID'] == scholarship_data_1['scholarshipID']
    assert response.data['scholarships'][0]['scholarshipName'] == scholarship_data_1['scholarshipName']
    assert response.data['scholarships'][0]['awardAmount'] == scholarship_data_1['awardAmount']
    assert response.data['scholarships'][0]['sponsorID'] == scholarship_data_1['sponsorID']
    assert response.data['scholarships'][0]['numberAvailable'] == scholarship_data_1['numberAvailable']
    assert response.data['scholarships'][0]['majors'] == scholarship_data_1['majors']
    assert response.data['scholarships'][0]['minors'] == scholarship_data_1['minors']
    assert response.data['scholarships'][0]['gpa'] == scholarship_data_1['gpa']
    assert response.data['scholarships'][0]['deadline'] == str(scholarship_data_1['deadline'])
    assert response.data['scholarships'][0]['otherRequirements'] == scholarship_data_1['otherRequirements']

    # Check the second scholarship
    assert response.data['scholarships'][1]['scholarshipID'] == scholarship_data_2['scholarshipID']
    assert response.data['scholarships'][1]['scholarshipName'] == scholarship_data_2['scholarshipName']
    assert response.data['scholarships'][1]['awardAmount'] == scholarship_data_2['awardAmount']
    assert response.data['scholarships'][1]['sponsorID'] == scholarship_data_2['sponsorID']
    assert response.data['scholarships'][1]['numberAvailable'] == scholarship_data_2['numberAvailable']
    assert response.data['scholarships'][1]['majors'] == scholarship_data_2['majors']
    assert response.data['scholarships'][1]['minors'] == scholarship_data_2['minors']
    assert response.data['scholarships'][1]['gpa'] == scholarship_data_2['gpa']
    assert response.data['scholarships'][1]['deadline'] == str(scholarship_data_2['deadline'])
    assert response.data['scholarships'][1]['otherRequirements'] == scholarship_data_2['otherRequirements']

@pytest.mark.django_db
def test_application_match_endpoint():
    # Create sample scholarships for testing
    scholarship_data_1 = {
        'scholarshipID': 1,
        'scholarshipName': 'Test Scholarship 1',
        'awardAmount': 1000,
        'sponsorID': 1,
        'numberAvailable': 5,
        'majors': ['Computer Science'],
        'minors': ['Mathematics'],
        'gpa': 3.5,
        'deadline': datetime.now() + timedelta(days=10),
        'otherRequirements': 'Test requirements 1',
        'applications': [],
        'awardedApplications': []
    }

    scholarship_data_2 = {
        'scholarshipID': 2,
        'scholarshipName': 'Test Scholarship 2',
        'awardAmount': 2000,
        'sponsorID': 2,
        'numberAvailable': 3,
        'majors': ['Engineering'],
        'minors': ['Physics'],
        'gpa': 3.7,
        'deadline': datetime.now() + timedelta(days=5),
        'otherRequirements': 'Test requirements 2',
        'applications': [],
        'awardedApplications': []
    }

    Scholarship.objects.create(**scholarship_data_1)
    Scholarship.objects.create(**scholarship_data_2)

    client = APIClient()
    url = reverse('application_match')
    data = {
        'gpa': 3.6,
        'majors': 'Engineering',
        'minors': 'Physics'
    }

    response = client.post(url, data, format='json')

    assert response.status_code == status.HTTP_200_OK

    # Check if the returned data matches the expected scholarship
    assert len(response.data['scholarships']) == 1

    # Check the scholarship
    assert response.data['scholarships'][0]['scholarshipID'] == scholarship_data_2['scholarshipID']
    assert response.data['scholarships'][0]['scholarshipName'] == scholarship_data_2['scholarshipName']
    assert response.data['scholarships'][0]['awardAmount'] == scholarship_data_2['awardAmount']
    assert response.data['scholarships'][0]['sponsorID'] == scholarship_data_2['sponsorID']
    assert response.data['scholarships'][0]['numberAvailable'] == scholarship_data_2['numberAvailable']
    assert response.data['scholarships'][0]['majors'] == scholarship_data_2['majors']
    assert response.data['scholarships'][0]['minors'] == scholarship_data_2['minors']
    assert response.data['scholarships'][0]['gpa'] == scholarship_data_2['gpa']
    assert response.data['scholarships'][0]['deadline'] == str(scholarship_data_2['deadline'])
    assert response.data['scholarships'][0]['otherRequirements'] == scholarship_data_2['otherRequirements']

@pytest.mark.django_db
def test_update_scholarship_endpoint():
    # Create a sample scholarship for testing
    scholarship_data = {
        'scholarshipID': 1,
        'scholarshipName': 'Test Scholarship',
        'awardAmount': 1000,
        'sponsorID': 1,
        'numberAvailable': 5,
        'majors': ['Computer Science'],
        'minors': ['Mathematics'],
        'gpa': 3.5,
        'deadline': datetime.now() + timedelta(days=10),
        'otherRequirements': 'Test requirements',
        'applications': [],
        'awardedApplications': []
    }

    Scholarship.objects.create(**scholarship_data)

    client = APIClient()
    url = reverse('update_scholarship', kwargs={'scholarship_id': 1})
    data = {
        'scholarshipName': 'Updated Test Scholarship',
        'awardAmount': 2000,
        'numberAvailable': 3,
        'majors': ['Engineering'],
        'minors': ['Physics'],
        'gpa': 3.7,
        'deadline': datetime.now() + timedelta(days=5),
        'otherRequirements': 'Updated test requirements'
    }

    response = client.put(url, data, format='json')

    assert response.status_code == status.HTTP_200_OK

    # Check if the scholarship is updated in the database
    updated_scholarship = Scholarship.objects.get(scholarshipID=1)
    assert updated_scholarship.scholarshipName == data['scholarshipName']
    assert updated_scholarship.awardAmount == data['awardAmount']
    assert updated_scholarship.numberAvailable == data['numberAvailable']
    assert updated_scholarship.majors == data['majors']
    assert updated_scholarship.minors == data['minors']
    assert updated_scholarship.gpa == data['gpa']
    assert updated_scholarship.deadline == data['deadline']
    assert updated_scholarship.otherRequirements == data['otherRequirements']

@pytest.mark.django_db
def test_filter_scholarships_by_name_endpoint():
    # Create sample scholarships for testing
    scholarship_data_1 = {
        'scholarshipID': 1,
        'scholarshipName': 'Test Scholarship 1',
        'awardAmount': 1000,
        'sponsorID': 1,
        'numberAvailable': 5,
        'majors': ['Computer Science'],
        'minors': ['Mathematics'],
        'gpa': 3.5,
        'deadline': datetime.now() + timedelta(days=10),
        'otherRequirements': 'Test requirements 1',
        'applications': [],
        'awardedApplications': []
    }

    scholarship_data_2 = {
        'scholarshipID': 2,
        'scholarshipName': 'Test Scholarship 2',
        'awardAmount': 2000,
        'sponsorID': 2,
        'numberAvailable': 3,
        'majors': ['Engineering'],
        'minors': ['Physics'],
        'gpa': 3.7,
        'deadline': datetime.now() + timedelta(days=5),
        'otherRequirements': 'Test requirements 2',
        'applications': [],
        'awardedApplications': []
    }

    Scholarship.objects.create(**scholarship_data_1)
    Scholarship.objects.create(**scholarship_data_2)

    client = APIClient()
    url = reverse('filter_scholarships_by_name')
    name = 'Test Scholarship 1'  # Search for the first scholarship

    response = client.get(url, {'name': name})

    assert response.status_code == status.HTTP_200_OK

    # Check if the returned data contains the filtered scholarship
    assert len(response.data['scholarships']) == 1
    assert response.data['scholarships'][0]['scholarshipID'] == scholarship_data_1['scholarshipID']
    assert response.data['scholarships'][0]['scholarshipName'] == scholarship_data_1['scholarshipName']
    assert response.data['scholarships'][0]['awardAmount'] == scholarship_data_1['awardAmount']
    assert response.data['scholarships'][0]['sponsorID'] == scholarship_data_1['sponsorID']
    assert response.data['scholarships'][0]['numberAvailable'] == scholarship_data_1['numberAvailable']
    assert response.data['scholarships'][0]['majors'] == scholarship_data_1['majors']
    assert response.data['scholarships'][0]['minors'] == scholarship_data_1['minors']
    assert response.data['scholarships'][0]['gpa'] == scholarship_data_1['gpa']
    assert response.data['scholarships'][0]['deadline'] == str(scholarship_data_1['deadline'])
    assert response.data['scholarships'][0]['otherRequirements'] == scholarship_data_1['otherRequirements']

def get_students_from_applications(netIDs):
    students = []
    for id in netIDs:
        student = Student.objects.get(netID=id)
        students.append({
            "studentID": student.studentID,
            "netID": student.netID,
            "pronouns": student.pronouns,
            "ethnicity": student.ethnicity,
            "currentYear": student.currentYear,
            "gpa": student.gpa,
            "majors": student.majors,
            "minors": student.minors,
            "personalStatement": student.personalStatement,
            "workExperience": student.workExperience
        })
    return students

@pytest.mark.django_db
def test_get_students_from_applications(mocker):
    # Mocking Student.objects.get method
    mock_student = MagicMock(spec=Student)
    mock_student.studentID = 1
    mock_student.netID = 'test_netID'
    mock_student.pronouns = 'he/him'
    mock_student.ethnicity = 'Asian'
    mock_student.currentYear = 'Senior'
    mock_student.gpa = 3.8
    mock_student.majors = 'Computer Science'
    mock_student.minors = 'Mathematics'
    mock_student.personalStatement = 'Test personal statement'
    mock_student.workExperience = 'Test work experience'
    mocker.patch('your_app.models.Student.objects.get', return_value=mock_student)

    # Call the function with sample data
    netIDs = ['test_netID']
    students = get_students_from_applications(netIDs)

    # Assertions
    assert len(students) == 1
    student = students[0]
    assert student['studentID'] == 1
    assert student['netID'] == 'test_netID'
    assert student['pronouns'] == 'he/him'
    assert student['ethnicity'] == 'Asian'
    assert student['currentYear'] == 'Senior'
    assert student['gpa'] == 3.8
    assert student['majors'] == 'Computer Science'
    assert student['minors'] == 'Mathematics'
    assert student['personalStatement'] == 'Test personal statement'
    assert student['workExperience'] == 'Test work experience'

@pytest.mark.django_db
def test_applicants_for_scholarship_endpoint():
    # Create a sample scholarship and application for testing
    scholarship = Scholarship.objects.create(scholarshipID=1)
    application = Application.objects.create(applicationID=1, netID='test_netID')
    scholarship.applications.add(application.id)

    client = APIClient()
    url = reverse('applicants_for_scholarship', kwargs={'id': 1})

    # Mocking get_students_from_applications function
    get_students_from_applications_mock = [
        {
            "studentID": 1,
            "netID": "test_netID",
            "pronouns": "he/him",
            "ethnicity": "Asian",
            "currentYear": "Senior",
            "gpa": 3.8,
            "majors": "Computer Science",
            "minors": "Mathematics",
            "personalStatement": "Test personal statement",
            "workExperience": "Test work experience"
        }
    ]
    with pytest.patch('your_module.get_students_from_applications', return_value=get_students_from_applications_mock):
        response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['students']) == 1
    student = response.data['students'][0]
    assert student['studentID'] == 1
    assert student['netID'] == 'test_netID'
    assert student['pronouns'] == 'he/him'
    assert student['ethnicity'] == 'Asian'
    assert student['currentYear'] == 'Senior'
    assert student['gpa'] == 3.8
    assert student['majors'] == 'Computer Science'
    assert student['minors'] == 'Mathematics'
    assert student['personalStatement'] == 'Test personal statement'
    assert student['workExperience'] == 'Test work experience'

@pytest.mark.django_db
def test_get_scholarship_providers_endpoint():
    # Create sample scholarship providers and scholarships for testing
    provider1 = User.objects.create(netID='provider1', type=UserType.SCHOLARSHIPPROVIDER.value, firstName='Provider', lastName='One', phone='1234567890', email='provider1@example.com')
    provider2 = User.objects.create(netID='provider2', type=UserType.SCHOLARSHIPPROVIDER.value, firstName='Provider', lastName='Two', phone='9876543210', email='provider2@example.com')
    
    scholarship1 = Scholarship.objects.create(scholarshipName='Scholarship 1', sponsorID='provider1', awardAmount=1000, numberAvailable=5, majors='Computer Science', minors='', gpa=3.5, deadline='2024-05-30')
    scholarship2 = Scholarship.objects.create(scholarshipName='Scholarship 2', sponsorID='provider2', awardAmount=2000, numberAvailable=3, majors='Engineering', minors='', gpa=3.7, deadline='2024-06-15')
    
    client = APIClient()
    url = reverse('get_scholarship_providers')

    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['providers']) == 2
    
    # Check data for provider 1
    provider1_data = response.data['providers'][0]
    assert provider1_data['firstName'] == 'Provider'
    assert provider1_data['lastName'] == 'One'
    assert provider1_data['phoneNumber'] == '1234567890'
    assert provider1_data['emailAddress'] == 'provider1@example.com'
    assert len(provider1_data['scholarships']) == 1
    assert provider1_data['scholarships'][0]['scholarshipName'] == 'Scholarship 1'
    assert provider1_data['scholarships'][0]['awardAmount'] == 1000
    assert provider1_data['scholarships'][0]['numberAvailable'] == 5
    assert provider1_data['scholarships'][0]['majors'] == 'Computer Science'
    assert provider1_data['scholarships'][0]['minors'] == ''
    assert provider1_data['scholarships'][0]['gpa'] == 3.5
    assert provider1_data['scholarships'][0]['deadline'] == '2024-05-30'
    
    # Check data for provider 2
    provider2_data = response.data['providers'][1]
    assert provider2_data['firstName'] == 'Provider'
    assert provider2_data['lastName'] == 'Two'
    assert provider2_data['phoneNumber'] == '9876543210'
    assert provider2_data['emailAddress'] == 'provider2@example.com'
    assert len(provider2_data['scholarships']) == 1
    assert provider2_data['scholarships'][0]['scholarshipName'] == 'Scholarship 2'
    assert provider2_data['scholarships'][0]['awardAmount'] == 2000
    assert provider2_data['scholarships'][0]['numberAvailable'] == 3
    assert provider2_data['scholarships'][0]['majors'] == 'Engineering'
    assert provider2_data['scholarships'][0]['minors'] == ''
    assert provider2_data['scholarships'][0]['gpa'] == 3.7
    assert provider2_data['scholarships'][0]['deadline'] == '2024-06-15'

@pytest.mark.django_db
def test_get_awarded_scholarships_endpoint():
    # Create sample data for awarded applications, users, scholarships, and students
    user = User.objects.create(netID='test_user', firstName='John', lastName='Doe', phone='1234567890', email='john.doe@example.com')
    student = Student.objects.create(netID='test_user', majors='Computer Science', gpa=3.8, ethnicity='Asian')
    scholarship = Scholarship.objects.create(scholarshipID=1, scholarshipName='Test Scholarship', awardAmount=1000)
    application = Application.objects.create(applicationID=1, netID='test_user', scholarshipID=1, status=ApplicationStatus.AWARDED.value)

    client = APIClient()
    url = reverse('get_awarded_scholarships')

    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['applications']) == 1

    # Check the data of the awarded scholarship application
    application_data = response.data['applications'][0]
    assert application_data['scholarshipName'] == 'Test Scholarship'
    assert application_data['scholarshipAmount'] == 1000
    assert application_data['firstName'] == 'John'
    assert application_data['lastName'] == 'Doe'
    assert application_data['phoneNumber'] == '1234567890'
    assert application_data['netID'] == 'test_user'
    assert application_data['major'] == 'Computer Science'
    assert application_data['emailAddress'] == 'john.doe@example.com'
    assert application_data['gpa'] == 3.8
    assert application_data['ethicity'] == 'Asian'

@pytest.mark.django_db
def test_open_scholarships_endpoint():
    # Create sample data for scholarships with various deadlines
    current_time = timezone.now()
    future_deadline = current_time + timedelta(days=7)
    past_deadline = current_time - timedelta(days=7)

    # Scholarship with a future deadline (should be included in the response)
    future_scholarship = Scholarship.objects.create(
        scholarshipName='Future Scholarship',
        deadline=future_deadline
    )

    # Scholarship with a past deadline (should not be included in the response)
    past_scholarship = Scholarship.objects.create(
        scholarshipName='Past Scholarship',
        deadline=past_deadline
    )

    client = APIClient()
    url = reverse('open_scholarships')

    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['scholarships']) == 1

    # Check that only the scholarship with a future deadline is included in the response
    scholarship_data = response.data['scholarships'][0]
    assert scholarship_data['scholarshipName'] == 'Future Scholarship'
    assert scholarship_data['deadline'] == future_deadline.strftime('%Y-%m-%d %H:%M:%S')

@pytest.mark.django_db
def test_closed_scholarships_endpoint():
    # Create sample data for scholarships with various deadlines
    current_time = timezone.now()
    future_deadline = current_time + timedelta(days=7)
    past_deadline = current_time - timedelta(days=7)

    # Scholarship with a future deadline (should not be included in the response)
    future_scholarship = Scholarship.objects.create(
        scholarshipName='Future Scholarship',
        deadline=future_deadline
    )

    # Scholarship with a past deadline (should be included in the response)
    past_scholarship = Scholarship.objects.create(
        scholarshipName='Past Scholarship',
        deadline=past_deadline
    )

    client = APIClient()
    url = reverse('closed_scholarships')

    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['scholarships']) == 1

    # Check that only the scholarship with a past deadline is included in the response
    scholarship_data = response.data['scholarships'][0]
    assert scholarship_data['scholarshipName'] == 'Past Scholarship'
    assert scholarship_data['deadline'] == past_deadline.strftime('%Y-%m-%d %H:%M:%S')

@pytest.mark.django_db
def test_get_deadlines_endpoint():
    # Create sample data for scholarships with various deadlines
    deadlines = [
        datetime.now() + timedelta(days=1),
        datetime.now() + timedelta(days=2),
        datetime.now() + timedelta(days=3)
    ]
    for deadline in deadlines:
        Scholarship.objects.create(deadline=deadline)

    client = APIClient()
    url = reverse('get_deadlines')

    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK

    # Check that the response contains the deadlines of all scholarships
    assert len(response.data['deadlines']) == len(deadlines)
    for i, deadline_data in enumerate(response.data['deadlines']):
        assert deadline_data['deadline'] == deadlines[i].strftime('%Y-%m-%d %H:%M:%S')
    
@pytest.mark.django_db
def test_filter_applications_endpoint():
    # Create sample data for applications
    Application.objects.create(netID='test_netID_1', scholarshipID=1, firstName='John', lastName='Doe', essay='Test Essay 1', transcript='Test Transcript 1', recommendationLetter='Test Recommendation Letter 1', status='Submitted')
    Application.objects.create(netID='test_netID_2', scholarshipID=2, firstName='Jane', lastName='Doe', essay='Test Essay 2', transcript='Test Transcript 2', recommendationLetter='Test Recommendation Letter 2', status='Reviewed')
    Application.objects.create(netID='test_netID_3', scholarshipID=1, firstName='Alice', lastName='Smith', essay='Test Essay 3', transcript='Test Transcript 3', recommendationLetter='Test Recommendation Letter 3', status='Accepted')

    client = APIClient()
    url = reverse('filter_applications')

    # Filter criteria
    filter_data = {
        "netID": "test_netID_1",
        "scholarshipID": 1,
        "firstName": "John",
        "lastName": "Doe",
        "essay": "Test Essay 1",
        "transcript": "Test Transcript 1",
        "recommendationLetter": "Test Recommendation Letter 1",
        "status": "Submitted"
    }

    response = client.post(url, filter_data, format='json')

    assert response.status_code == status.HTTP_200_OK

    # Check that the response contains the filtered application
    assert len(response.data['applications']) == 1
    filtered_application = response.data['applications'][0]
    assert filtered_application['netID'] == filter_data['netID']
    assert filtered_application['scholarshipID'] == filter_data['scholarshipID']
    assert filtered_application['firstName'] == filter_data['firstName']
    assert filtered_application['lastName'] == filter_data['lastName']
    assert filtered_application['essay'] == filter_data['essay']
    assert filtered_application['transcript'] == filter_data['transcript']
    assert filtered_application['recommendationLetter'] == filter_data['recommendationLetter']
    assert filtered_application['status'] == filter_data['status']

@pytest.mark.django_db
def test_filter_donors_endpoint():
    # Create sample data for donors
    User.objects.create(userID=1, netID='donor1', username='donor1', firstName='John', lastName='Doe', phone='1234567890', email='donor1@example.com', type='Scholarship Provider')
    User.objects.create(userID=2, netID='donor2', username='donor2', firstName='Jane', lastName='Doe', phone='9876543210', email='donor2@example.com', type='Scholarship Provider')
    User.objects.create(userID=3, netID='donor3', username='donor3', firstName='Alice', lastName='Smith', phone='5555555555', email='donor3@example.com', type='Scholarship Provider')

    client = APIClient()
    url = reverse('filter_donors')

    # Filter criteria
    filter_data = {
        "userID": 1,
        "netID": "donor1",
        "username": "donor1",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "1234567890",
        "email": "donor1@example.com"
    }

    response = client.post(url, filter_data, format='json')

    assert response.status_code == status.HTTP_200_OK

    # Check that the response contains the filtered donors
    assert len(response.data['donors']) == 1
    filtered_donor = response.data['donors'][0]
    assert filtered_donor['userID'] == filter_data['userID']
    assert filtered_donor['netID'] == filter_data['netID']
    assert filtered_donor['username'] == filter_data['username']
    assert filtered_donor['firstName'] == filter_data['firstName']
    assert filtered_donor['lastName'] == filter_data['lastName']
    assert filtered_donor['phone'] == filter_data['phone']
    assert filtered_donor['email'] == filter_data['email']

@pytest.mark.django_db
def test_filter_applicants_endpoint():
    # Create sample data for applicants
    student1 = Student.objects.create(studentID=1, netID='student1', pronouns='he/him', ethnicity='Asian', currentYear='Sophomore', gpa=3.5, majors='Computer Science', minors='Mathematics', personalStatement='Lorem ipsum', workExperience='Internship at XYZ Corp')
    student2 = Student.objects.create(studentID=2, netID='student2', pronouns='she/her', ethnicity='African American', currentYear='Junior', gpa=3.2, majors='Engineering', minors='', personalStatement='Dolor sit amet', workExperience='Research assistant at ABC University')

    # Create sample data for applications
    Application.objects.create(applicationID=1, netID='student1', scholarshipID=1, status='Submitted', essay='Essay content', transcript='Transcript content', recommendationLetter='Recommendation content')
    Application.objects.create(applicationID=2, netID='student2', scholarshipID=2, status='Submitted', essay='Essay content', transcript='Transcript content', recommendationLetter='Recommendation content')

    client = APIClient()
    url = reverse('filter_applicants')

    # Filter criteria
    filter_data = {
        "studentID": 1,
        "netID": "student1",
        "pronouns": "he/him",
        "ethnicity": "Asian",
        "currentYear": "Sophomore",
        "gpa": 3.5,
        "majors": "Computer Science",
        "minors": "Mathematics",
        "personalStatement": "Lorem ipsum",
        "workExperience": "Internship at XYZ Corp"
    }

    response = client.post(url, filter_data, format='json')

    assert response.status_code == status.HTTP_200_OK

    # Check that the response contains the filtered applicants
    assert len(response.data['applicants']) == 1
    filtered_applicant = response.data['applicants'][0]
    assert filtered_applicant['studentID'] == filter_data['studentID']
    assert filtered_applicant['netID'] == filter_data['netID']
    assert filtered_applicant['pronouns'] == filter_data['pronouns']
    assert filtered_applicant['ethnicity'] == filter_data['ethnicity']
    assert filtered_applicant['currentYear'] == filter_data['currentYear']
    assert filtered_applicant['gpa'] == filter_data['gpa']
    assert filtered_applicant['majors'] == filter_data['majors']
    assert filtered_applicant['minors'] == filter_data['minors']
    assert filtered_applicant['personalStatement'] == filter_data['personalStatement']
    assert filtered_applicant['workExperience'] == filter_data['workExperience']

@pytest.mark.django_db
def test_query_applicants_endpoint():
    # Create sample data for applicants
    student1 = Student.objects.create(netID='student1', pronouns='he/him', ethnicity='Asian', currentYear='Sophomore', gpa=3.5, majors='Computer Science', minors='Mathematics', personalStatement='Lorem ipsum', workExperience='Internship at XYZ Corp')
    student2 = Student.objects.create(netID='student2', pronouns='she/her', ethnicity='African American', currentYear='Junior', gpa=3.2, majors='Engineering', minors='', personalStatement='Dolor sit amet', workExperience='Research assistant at ABC University')

    # Create sample data for applications
    application1 = Application.objects.create(applicationID=1, netID='student1', scholarshipID=1, status='Submitted', firstName='John', lastName='Doe', essay='Essay content', transcript='Transcript content', recommendationLetter='Recommendation content')
    application2 = Application.objects.create(applicationID=2, netID='student2', scholarshipID=2, status='Submitted', firstName='Jane', lastName='Smith', essay='Essay content', transcript='Transcript content', recommendationLetter='Recommendation content')

    client = APIClient()
    url = reverse('query_applicants')

    # Post request data
    post_data = {
        "applications": [1, 2]
    }

    response = client.post(url, post_data, format='json')

    assert response.status_code == status.HTTP_200_OK

    # Check if response is CSV
    assert response['Content-Type'] == 'text/csv'

    # Check CSV content
    csv_data = StringIO(response.content.decode('utf-8'))
    reader = csv.DictReader(csv_data)
    rows = list(reader)

    # Check if the number of rows in the CSV matches the number of queried applications
    assert len(rows) == 2

    # Check if the CSV contains the correct applicant data
    assert rows[0]['firstName'] == 'John'
    assert rows[0]['lastName'] == 'Doe'
    assert rows[0]['pronouns'] == 'he/him'
    assert rows[0]['ethnicity'] == 'Asian'
    assert rows[0]['currentYear'] == 'Sophomore'
    assert rows[0]['gpa'] == '3.5'
    assert rows[0]['majors'] == 'Computer Science'
    assert rows[0]['minors'] == 'Mathematics'
    assert rows[0]['personalStatement'] == 'Lorem ipsum'
    assert rows[0]['workExperience'] == 'Internship at XYZ Corp'

    assert rows[1]['firstName'] == 'Jane'
    assert rows[1]['lastName'] == 'Smith'
    assert rows[1]['pronouns'] == 'she/her'
    assert rows[1]['ethnicity'] == 'African American'
    assert rows[1]['currentYear'] == 'Junior'
    assert rows[1]['gpa'] == '3.2'
    assert rows[1]['majors'] == 'Engineering'
    assert rows[1]['minors'] == ''
    assert rows[1]['personalStatement'] == 'Dolor sit amet'
    assert rows[1]['workExperience'] == 'Research assistant at ABC University'

@pytest.mark.django_db
def test_archived_scholarship_report_endpoint():
    # Create sample data for scholarships
    donor = User.objects.create(netID='donor1', firstName='John', lastName='Doe', phone='1234567890', email='john@example.com')
    scholarship1 = Scholarship.objects.create(scholarshipName='Scholarship 1', awardAmount=1000, sponsorID='donor1', numberAvailable=10, majors='Computer Science', minors='', gpa=3.5, deadline='2022-01-01', otherRequirements='None')
    scholarship2 = Scholarship.objects.create(scholarshipName='Scholarship 2', awardAmount=2000, sponsorID='donor1', numberAvailable=5, majors='Engineering', minors='Mathematics', gpa=3.2, deadline='2022-02-01', otherRequirements='Recommendation Letter')

    client = APIClient()
    url = reverse('archived_scholarship_report')

    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK

    # Check if response is CSV
    assert response['Content-Type'] == 'text/csv'

    # Check CSV content
    csv_data = StringIO(response.content.decode('utf-8'))
    reader = csv.DictReader(csv_data)
    rows = list(reader)

    # Check if the number of rows in the CSV matches the number of archived scholarships
    assert len(rows) == 2

    # Check if the CSV contains the correct scholarship data
    assert rows[0]['scholarshipName'] == 'Scholarship 1'
    assert rows[0]['scholarshipAmount'] == '1000'
    assert rows[0]['donorName'] == 'John Doe'
    assert rows[0]['donorPhone'] == '1234567890'
    assert rows[0]['donorEmail'] == 'john@example.com'
    assert rows[0]['scholarshipsAvailable'] == '10'
    assert rows[0]['scholarshipMajors'] == 'Computer Science'
    assert rows[0]['scholarshipMinors'] == ''
    assert rows[0]['scholarshipGPA'] == '3.5'
    assert rows[0]['scholarshipDeadline'] == '2022-01-01'
    assert rows[0]['otherRequirements'] == 'None'

    assert rows[1]['scholarshipName'] == 'Scholarship 2'
    assert rows[1]['scholarshipAmount'] == '2000'
    assert rows[1]['donorName'] == 'John Doe'
    assert rows[1]['donorPhone'] == '1234567890'
    assert rows[1]['donorEmail'] == 'john@example.com'
    assert rows[1]['scholarshipsAvailable'] == '5'
    assert rows[1]['scholarshipMajors'] == 'Engineering'
    assert rows[1]['scholarshipMinors'] == 'Mathematics'
    assert rows[1]['scholarshipGPA'] == '3.2'
    assert rows[1]['scholarshipDeadline'] == '2022-02-01'
    assert rows[1]['otherRequirements'] == 'Recommendation Letter'

@pytest.mark.django_db
def test_available_scholarship_report_endpoint():
    # Create sample data for scholarships
    donor = User.objects.create(netID='donor1', firstName='John', lastName='Doe', phone='1234567890', email='john@example.com')
    scholarship1 = Scholarship.objects.create(scholarshipName='Scholarship 1', awardAmount=1000, sponsorID='donor1', numberAvailable=10, majors='Computer Science', minors='', gpa=3.5, deadline='2022-01-01', otherRequirements='None')
    scholarship2 = Scholarship.objects.create(scholarshipName='Scholarship 2', awardAmount=2000, sponsorID='donor1', numberAvailable=5, majors='Engineering', minors='Mathematics', gpa=3.2, deadline='2022-02-01', otherRequirements='Recommendation Letter')

    client = APIClient()
    url = reverse('available_scholarship_report')

    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK

    # Check if response is CSV
    assert response['Content-Type'] == 'text/csv'

    # Check CSV content
    csv_data = StringIO(response.content.decode('utf-8'))
    reader = csv.DictReader(csv_data)
    rows = list(reader)

    # Check if the number of rows in the CSV matches the number of available scholarships
    assert len(rows) == 2

    # Check if the CSV contains the correct scholarship data
    assert rows[0]['scholarshipName'] == 'Scholarship 1'
    assert rows[0]['scholarshipAmount'] == '1000'
    assert rows[0]['donorName'] == 'John Doe'
    assert rows[0]['donorPhone'] == '1234567890'
    assert rows[0]['donorEmail'] == 'john@example.com'
    assert rows[0]['scholarshipsAvailable'] == '10'
    assert rows[0]['scholarshipMajors'] == 'Computer Science'
    assert rows[0]['scholarshipMinors'] == ''
    assert rows[0]['scholarshipGPA'] == '3.5'
    assert rows[0]['scholarshipDeadline'] == '2022-01-01'
    assert rows[0]['otherRequirements'] == 'None'

    assert rows[1]['scholarshipName'] == 'Scholarship 2'
    assert rows[1]['scholarshipAmount'] == '2000'
    assert rows[1]['donorName'] == 'John Doe'
    assert rows[1]['donorPhone'] == '1234567890'
    assert rows[1]['donorEmail'] == 'john@example.com'
    assert rows[1]['scholarshipsAvailable'] == '5'
    assert rows[1]['scholarshipMajors'] == 'Engineering'
    assert rows[1]['scholarshipMinors'] == 'Mathematics'
    assert rows[1]['scholarshipGPA'] == '3.2'
    assert rows[1]['scholarshipDeadline'] == '2022-02-01'
    assert rows[1]['otherRequirements'] == 'Recommendation Letter'

@pytest.mark.django_db
def test_student_demographics_report_endpoint():
    # Create sample data for students
    student1 = User.objects.create(netID='student1', firstName='Alice', lastName='Smith', type='Student')
    student2 = User.objects.create(netID='student2', firstName='Bob', lastName='Jones', type='Student')

    # Create corresponding student objects
    student1_details = Student.objects.create(netID='student1', pronouns='she/her', studentID='123', majors='Computer Science', minors='', gpa=3.5, currentYear='Junior', ethnicity='Asian', personalStatement='Some personal statement', workExperience='Some work experience')
    student2_details = Student.objects.create(netID='student2', pronouns='he/him', studentID='456', majors='Engineering', minors='', gpa=3.2, currentYear='Senior', ethnicity='Caucasian', personalStatement='Another personal statement', workExperience='More work experience')

    client = APIClient()
    url = reverse('student_demographics_report')

    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK

    # Check if response is CSV
    assert response['Content-Type'] == 'text/csv'

    # Check CSV content
    csv_data = StringIO(response.content.decode('utf-8'))
    reader = csv.DictReader(csv_data)
    rows = list(reader)

    # Check if the number of rows in the CSV matches the number of students
    assert len(rows) == 2

    # Check if the CSV contains the correct student data
    assert rows[0]['firstName'] == 'Alice'
    assert rows[0]['lastName'] == 'Smith'
    assert rows[0]['pronouns'] == 'she/her'
    assert rows[0]['studentID'] == '123'
    assert rows[0]['major'] == 'Computer Science'
    assert rows[0]['minor'] == ''
    assert rows[0]['gpa'] == '3.5'
    assert rows[0]['currentYear'] == 'Junior'
    assert rows[0]['ethnicity'] == 'Asian'
    assert rows[0]['personalStatement'] == 'Some personal statement'
    assert rows[0]['workExperience'] == 'Some work experience'

    assert rows[1]['firstName'] == 'Bob'
    assert rows[1]['lastName'] == 'Jones'
    assert rows[1]['pronouns'] == 'he/him'
    assert rows[1]['studentID'] == '456'
    assert rows[1]['major'] == 'Engineering'
    assert rows[1]['minor'] == ''
    assert rows[1]['gpa'] == '3.2'
    assert rows[1]['currentYear'] == 'Senior'
    assert rows[1]['ethnicity'] == 'Caucasian'
    assert rows[1]['personalStatement'] == 'Another personal statement'
    assert rows[1]['workExperience'] == 'More work experience'

@pytest.mark.django_db
def test_active_donor_report_endpoint():
    # Create sample data for donors and scholarships
    donor1 = User.objects.create(netID='donor1', firstName='John', lastName='Doe', type='Scholarship Provider', phone='123-456-7890', email='john@example.com')
    donor2 = User.objects.create(netID='donor2', firstName='Jane', lastName='Smith', type='Scholarship Provider', phone='987-654-3210', email='jane@example.com')

    scholarship1 = Scholarship.objects.create(sponsorID='donor1', scholarshipName='Scholarship 1', awardAmount=1000, numberAvailable=5, majors='Computer Science', minors='', gpa=3.5, deadline='2024-05-30')
    scholarship2 = Scholarship.objects.create(sponsorID='donor1', scholarshipName='Scholarship 2', awardAmount=1500, numberAvailable=3, majors='Engineering', minors='', gpa=3.2, deadline='2024-06-15')
    scholarship3 = Scholarship.objects.create(sponsorID='donor2', scholarshipName='Scholarship 3', awardAmount=2000, numberAvailable=7, majors='Business', minors='', gpa=3.0, deadline='2024-07-01')

    client = APIClient()
    url = reverse('active_donor_report')

    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK

    # Check if response is CSV
    assert response['Content-Type'] == 'text/csv'

    # Check CSV content
    csv_data = StringIO(response.content.decode('utf-8'))
    reader = csv.DictReader(csv_data)
    rows = list(reader)

    # Check if the number of rows in the CSV matches the number of donors
    assert len(rows) == 2

    # Check if the CSV contains the correct donor and scholarship data
    assert rows[0]['firstName'] == 'John'
    assert rows[0]['lastName'] == 'Doe'
    assert rows[0]['phone'] == '123-456-7890'
    assert rows[0]['email'] == 'john@example.com'
    assert rows[0]['scholarshipName'] == '["Scholarship 1", "Scholarship 2"]'
    assert rows[0]['numberAvailable'] == '[5, 3]'
    assert rows[0]['majors'] == '["Computer Science", "Engineering"]'
    assert rows[0]['minors'] == ''
    assert rows[0]['gpa'] == '[3.5, 3.2]'
    assert rows[0]['deadline'] == '["2024-05-30", "2024-06-15"]'

    assert rows[1]['firstName'] == 'Jane'
    assert rows[1]['lastName'] == 'Smith'
    assert rows[1]['phone'] == '987-654-3210'
    assert rows[1]['email'] == 'jane@example.com'
    assert rows[1]['scholarshipName'] == '["Scholarship 3"]'
    assert rows[1]['numberAvailable'] == '[7]'
    assert rows[1]['majors'] == '["Business"]'
    assert rows[1]['minors'] == ''
    assert rows[1]['gpa'] == '[3.0]'
    assert rows[1]['deadline'] == '["2024-07-01"]'

@pytest.mark.django_db
def test_matching_algorithm_endpoint():
    # Create sample scholarship data
    Scholarship.objects.create(
        scholarshipID='1',
        scholarshipName='Test Scholarship 1',
        applications=50,
        awardedApplications=20,
        awardAmount=1000,
        sponsorID='sponsor1',
        numberAvailable=30,
        majors='Computer Science',
        minors='',
        gpa=3.5,
        deadline='2024-06-30',
        otherRequirements='None'
    )
    Scholarship.objects.create(
        scholarshipID='2',
        scholarshipName='Test Scholarship 2',
        applications=40,
        awardedApplications=15,
        awardAmount=1500,
        sponsorID='sponsor2',
        numberAvailable=25,
        majors='Engineering',
        minors='Physics',
        gpa=3.0,
        deadline='2024-07-15',
        otherRequirements='None'
    )

    client = APIClient()
    url = reverse('matching_algorithm')

    # Define sample request data
    data = {
        'gpa': 3.2,
        'majors': 'Computer Science',
        'minors': ''
    }

    # Send POST request with sample data
    response = client.post(url, data, format='json')

    # Check if endpoint returns HTTP 200 OK
    assert response.status_code == status.HTTP_200_OK

    # Check if response data contains the expected scholarship
    assert len(response.data['scholarships']) == 1
    assert response.data['scholarships'][0]['scholarshipName'] == 'Test Scholarship 1'
    assert response.data['scholarships'][0]['gpa'] == 3.5
    assert response.data['scholarships'][0]['matchingScore'] == 4

@pytest.mark.django_db
def test_delete_scholarship_endpoint():
    # Create sample scholarship data
    scholarship = Scholarship.objects.create(
        scholarshipID='1',
        scholarshipName='Test Scholarship',
        applications=[1, 2, 3],  # Assuming applications are stored as a list of IDs
        awardedApplications=2,
        awardAmount=1000,
        sponsorID='sponsor1',
        numberAvailable=1,
        majors='Computer Science',
        minors='',
        gpa=3.5,
        deadline='2024-06-30',
        otherRequirements='None'
    )

    # Create sample application data
    Application.objects.create(
        id=1,
        netID='student1',
        scholarshipID='1',
        status='AWARDED'
    )
    Application.objects.create(
        id=2,
        netID='student2',
        scholarshipID='1',
        status='PENDING'
    )
    Application.objects.create(
        id=3,
        netID='student3',
        scholarshipID='1',
        status='PENDING'
    )

    client = APIClient()
    url = reverse('delete_scholarship', kwargs={'scholarship_id': scholarship.scholarshipID})

    # Send DELETE request
    response = client.delete(url)

    # Check if scholarship and associated applications are deleted
    assert response.status_code == status.HTTP_200_OK
    assert Scholarship.objects.filter(scholarshipID=scholarship.scholarshipID).count() == 0
    assert Application.objects.filter(scholarshipID=scholarship.scholarshipID).count() == 0

    # Check if associated applications are removed from students' lists
    students_with_deleted_applications = User.objects.filter(listColumn__contains=str(1))
    assert len(students_with_deleted_applications) == 0