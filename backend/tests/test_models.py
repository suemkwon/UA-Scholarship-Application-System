import pytest
from django.utils import timezone
from uasams.models import User, Student, Application, Scholarship

@pytest.mark.django_db
def test_user_model():
    # Create a user instance
    user = User.objects.create(userID=1, netID='net123', username='testuser', password='hashedpassword', type='Student', sec1Q='q1', sec1A='a1', sec2Q='q2', sec2A='a2', firstName='John', lastName='Doe', phone=1234567890, email='john.doe@example.com')

    # Retrieve the user instance
    retrieved_user = User.objects.get(userID=1)

    # Assert the content of the retrieved user
    assert retrieved_user.firstName == 'John'
    assert retrieved_user.lastName == 'Doe'

@pytest.mark.django_db
def test_student_model():
    # Create a student instance
    student = Student.objects.create(studentID=1, netID='net123', pronouns='he/him', ethnicity='Asian', currentYear='Sophomore', gpa=3.5, majors='Systems Engineering', minors='Electrical and Computer Engineering', personalStatement='I am a student.', workExperience='I have worked as a TA.')

    # Retrieve the student instance
    retrieved_student = Student.objects.get(studentID=1)

    # Assert the content of the retrieved student
    assert retrieved_student.firstName == 'John'
    assert retrieved_student.lastName == 'Doe'

@pytest.mark.django_db
def test_application_model():
    # Create an application instance
    application = Application.objects.create(applicationID=1, netID='net123', scholarshipID=1, timestamp=timezone.now(), firstName='John', lastName='Doe', essay='This is an essay.', transcript='This is a transcript.', recommendationLetter='This is a recommendation letter.', status='In Progress')

    # Retrieve the application instance
    retrieved_application = Application.objects.get(applicationID=1)

    # Assert the content of the retrieved application
    assert retrieved_application.firstName == 'John'
    assert retrieved_application.lastName == 'Doe'

@pytest.mark.django_db
def test_scholarship_model():
    # Create a scholarship instance
    scholarship = Scholarship.objects.create(scholarshipID=1, scholarshipName='Test Scholarship', applications=[], awardedApplications=[], awardAmount=1000, sponsorID='sponsor123', numberAvailable=10, majors='Systems Engineering', minors='Electrical and Computer Engineering', gpa=3.0, deadline=timezone.now(), otherRequirements='Must be a sophomore.')

    # Retrieve the scholarship instance
    retrieved_scholarship = Scholarship.objects.get(scholarshipID=1)

    # Assert the content of the retrieved scholarship
    assert retrieved_scholarship.scholarshipName == 'Test Scholarship'