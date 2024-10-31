# UASAMS/backend/backend/views.py
import datetime
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from uasams.models import User
from uasams.models import Student
from uasams.models import Application
from uasams.models import Scholarship
import json
import datetime
from django.utils import timezone
from django.db.models import Max
import csv
from django.http import HttpResponse
from django.http import JsonResponse

SCHOLARSHIP_NOT_FOUND = "Scholarship not found."

@api_view(['GET'])
def send_some_data(request):
    if request.method == 'GET':
        return Response({
            "data": "Hello from Django backend"
        })

@api_view(['POST'])
def create_user(request):
    if request.method == 'POST':
        data = request.data

        try:
            # Get the current maximum userID from the database
            max_user_id = User.objects.aggregate(max_id=Max('userID'))['max_id']
            if max_user_id is None:
                max_user_id = 0

            # Generate the next userID
            next_user_id = max_user_id + 1

            # Create the user
            user = User.objects.create(
                userID=next_user_id,
                netID=data['netID'],
                username=data['username'],
                password=data['password'],
                email=data['email'],
                type="Student",
                sec1Q=data['sec1Q'],
                sec1A=data['sec1A'],
                sec2Q=data['sec2Q'],
                sec2A=data['sec2A'],
                firstName=data['firstName'],
                lastName=data['lastName'],
                phone=data['phone'],
                listColumn='{}'
            )

            # Get the current maximum studentID from the database
            max_student_id = Student.objects.aggregate(max_id=Max('studentID'))['max_id']
            if max_student_id is None:
                max_student_id = 0

            # Generate the next studentID
            next_student_id = max_student_id + 1

            # Create the student associated with the user
            student = Student.objects.create(
                studentID=next_student_id,
                netID=data['netID'],
                pronouns='',
                ethnicity='',
                currentYear='',
                gpa=0.0,
                majors='',
                minors='',
                personalStatement='',
                workExperience=''
            )

            # Return success response
            return Response({
                "message": "User created successfully",
                "student_id": student.studentID
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            # Handle errors
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_users(request):
    if request.method == 'GET':
        users = User.objects.all()
        user_data = []

        for user in users:
            user_data.append({
                "userID": user.userID,
                "netID": user.netID,
                "username": user.username,
                "email": user.email,
                "type": user.type,
                "firstName": user.firstName,
                "lastName": user.lastName,
                "phone": user.phone
            })

        return Response({
            "users": user_data
        })

@api_view(['PUT'])
def update_user(request):
    if request.method == 'PUT':
        data = request.data

        user_id = data.get('userID')
        if not user_id:
            return Response({
                "error": "No user_id provided"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Update existing user
            user = User.objects.get(userID=user_id)
            # Delete corresponding student object if usertype is Student
            if user.type == 'Student' and data.get('type') != 'Student':
                student = Student.objects.get(netID=user.username)
                student.delete()

            # Update existing user
            user = User.objects.get(userID=user_id)
            user.username = data.get('username', user.username)
            user.email = data.get('email', user.email)
            user.type = data.get('type', user.type)
            user.firstName = data.get('firstName', user.firstName)
            user.lastName = data.get('lastName', user.lastName)
            user.phone = data.get('phone', user.phone)
            user.save()

            return Response({
                "message": "User updated successfully",
                "user_id": user.userID
            })
        except User.DoesNotExist:
            return Response({
                "error": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        
def delete_application_trace(net_id):

    application_ids = []
    scholarships_ids = []

    applications = Application.objects.filter(netID=net_id)
    for application in applications:
        application_ids.append(application.applicationID)
        scholarships_ids.append(application.scholarshipID)
        application.delete()

    for scholarship_id in scholarships_ids:
        scholarship = Scholarship.objects.get(scholarshipID=scholarship_id)
        scholarship.applications = [x for x in scholarship.applications if x not in application_ids]
        scholarship.save()


@api_view(['DELETE'])
def delete_user(request):
    if request.method == 'DELETE':
        data = request.data
        try:
            # Check if the student object exists using the net_id
            if Student.objects.filter(netID=data['netID']).exists():
                # Get the student object using the net_id
                student = Student.objects.get(netID=data['netID'])

                # Delete the student object
                student.delete()

            # Check if the student object exists using the net_id
            if User.objects.filter(netID=data['netID']).exists():
                # Get the student object using the net_id
                user = User.objects.get(netID=data['netID'])

                if user.type == 'Student':
                    delete_application_trace(user.netID)

                # Delete the student object
                user.delete()

            return Response({"message": "User deleted successfully"})
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
@api_view(['PUT'])
def update_student(request):
    if request.method == 'PUT':
        data = request.data

        netid = data.get('netID')
        if not netid:
            return Response({
                "error": "No user_id provided"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            student = Student.objects.get(netID=netid)

            if data.get('type') == 'Student':
            # Update existing Student
                student.netID = data.get('netID', student.netID)
                student.pronouns = data.get('pronouns', student.pronouns)
                student.currentYear = data.get('currentYear', student.currentYear)
                student.gpa = data.get('gpa', student.gpa)
                student.majors = data.get('majors', student.majors)
                student.minors = data.get('minors', student.minors)
                student.personalStatement = data.get('personalStatement', student.personalStatement)
                student.workExperience = data.get('workExperience', student.workExperience)
                student.ethnicity = data.get('ethnicity', student.ethnicity)
                student.save()
            else:
                student.delete()
                user = User.objects.get(netID=netid)
                user.firstName = data.get('firstName', user.firstName)
                user.lastName = data.get('lastName', user.lastName)
                user.email = data.get('email', user.email)
                user.username = data.get('username', user.username)
                user.type = data.get('type', user.type)
                user.phone = data.get('phone', user.phone)
                user.save()

            return Response({
                "message": "User updated successfully",
                "student_id": student.studentID,
                "netID": student.netID
            })
        except User.DoesNotExist:
            return Response({
                "error": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def create_scholarship(request):
    print(request)
    if request.method == 'POST':
        data = request.data

        try:
            # Get the current maximum scholarshipID from the database
            max_scholarship_id = Scholarship.objects.aggregate(max_id=Max('scholarshipID'))['max_id']
            if max_scholarship_id is None:
                max_scholarship_id = 0

            # Generate the next scholarshipID
            next_scholarship_id = max_scholarship_id + 1

            deadline_str = data['deadline']
            # Check if the string already includes time information
            if len(deadline_str.split(' ')) == 1:
                # Append a default time if not provided
                deadline_str += " 00:00:00"

            deadline = datetime.datetime.strptime(deadline_str, '%Y-%m-%d %H:%M:%S')
            
            scholarship = Scholarship.objects.create(
                scholarshipName=data['scholarshipName'],
                scholarshipID=next_scholarship_id,
                awardAmount=data['awardAmount'],
                sponsorID=data['scholarshipDonor'],
                numberAvailable=data['numberAvailable'],
                gpa=data['gpa'],
                deadline=deadline,
                otherRequirements=data['otherRequirements'],
                majors=data['majors'],
                minors=data['minors'],
                applications=[],
                awardedApplications=[],
            )
            # Return a success response
            return Response({
                "message": "Scholarship created successfully",
                "scholarship_id": scholarship.scholarshipID
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            # Handle any errors that occur during scholarship creation
            return Response({
                "error": str(e) # Return the error message
            }, status=status.HTTP_400_BAD_REQUEST)

# Create a new application for a specific scholarship
@api_view(['POST'])
def create_application(request):
    if request.method == 'POST':
        data = request.data
        try:
            # Check if user exists
            student = Student.objects.get(netID=data['userID'])
            user = User.objects.get(netID=data['userID'])
            scholarship = Scholarship.objects.get(scholarshipID=data['scholarshipID'])

            score = 1

            if student.gpa >= scholarship.gpa:
                score += 1
            if student.majors.lower() in scholarship.majors.lower():
                score += 1
            if student.minors.lower() in scholarship.minors.lower():
                score += 1

            print(score)

        except User.DoesNotExist:
            return Response({
                "error": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Scholarship.DoesNotExist:
            return Response({
                "error": "Scholarship not found"
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            application = Application.objects.create(
                applicationID=data['applicationID'],
                netID=data['userID'],
                scholarshipID=data['scholarshipID'],
                timestamp=datetime.datetime.now(),
                firstName=data['firstName'],
                lastName=data['lastName'],
                essay=data['essay'],
                matchScore=score,
                meetsOtherRequirements=True,
                transcript=data['transcript'],
                recommendationLetter=data['recommendationLetter'],
                status='Submitted',
            )
            # Return a success response
            print(application.applicationID)
            print(user)
            user.listColumn.append(application.applicationID)
            user.save()
            scholarship.applications.append(application.applicationID)
            scholarship.save()
            return Response({
                "message": "Application created successfully",
                "application_id": application.id,
                "student_id": student.id,
                "scholarship_id": scholarship.id
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            # Handle any errors that occur during application creation
            return Response({
                "error": str(e)  # Return the error message
            }, status=status.HTTP_400_BAD_REQUEST)
        

# Get all applications for a specific scholarship
@api_view(['GET'])
def get_scholarship_applications(request, scholarship_id):
    if request.method == 'GET':
        try:
            scholarship = Scholarship.objects.get(scholarshipID=scholarship_id)
        except Scholarship.DoesNotExist:
            return Response({"error": "SCHOLARSHIP_NOT_FOUND"}, status=404)

        applications = scholarship.applications
        application_list = []
        for application in applications:
            application_data = Application.objects.get(applicationID=application)
            application_list.append({
                "applicationID": application_data.applicationID,
                "netID": application_data.netID,
                "scholarshipID": application_data.scholarshipID,
                "timestamp": application_data.timestamp,
                "firstName": application_data.firstName,
                "lastName": application_data.lastName,
                "matchScore": application_data.matchScore,
                "meetsOtherRequirements": application_data.meetsOtherRequirements,
                "essay": application_data.essay,
                "transcript": application_data.transcript,
                "recommendationLetter": application_data.recommendationLetter,
                "status": application_data.status
            })
        return Response({
            "applications": application_list
        })
    
# Get all scholarships names and IDs froma given list of application IDs
@api_view(['GET'])
def get_scholarships_from_applications(request, application_ids):
    print(application_ids)
    if request.method == 'GET':
        application_ids = application_ids.split(',')
        scholarships = []
        for application_id in application_ids:
            try:
                application = Application.objects.get(applicationID=application_id)
                scholarship = Scholarship.objects.get(scholarshipID=application.scholarshipID)
                scholarships.append({
                    "applicationID": application_id,
                    "scholarshipName": scholarship.scholarshipName
                })
            except Application.DoesNotExist:
                return Response({"error": "Application not found"}, status=404)
            except Scholarship.DoesNotExist:
                return Response({"error": "Scholarship not found"}, status=404)
        print(scholarships)
        return Response({
            "scholarships": scholarships
        })
    
# Get all applications for a specific student
@api_view(['GET'])
def get_student_applications(request, net_id):
    if request.method == 'GET':
        try:
            applications = Application.objects.filter(netID=net_id)
        except Application.DoesNotExist:
            return Response({"error": "Applications not found"}, status=404)
        
        application_list = []
        for application in applications:
            application_list.append({
                "applicationID": application.applicationID,
                "netID": application.netID,
                "scholarshipID": application.scholarshipID,
                "timestamp": application.timestamp,
                "firstName": application.firstName,
                "lastName": application.lastName,
                "essay": application.essay,
                "transcript": application.transcript,
                "recommendationLetter": application.recommendationLetter,
                "status": application.status
            })
        return Response({
            "applications": application_list
        })
    
# Get all applications
@api_view(['GET'])
def get_applications(request):
    if request.method == 'GET':
        applications = Application.objects.all()
        application_list = []
        for application in applications:
            application_list.append({
                "applicationID": application.applicationID,
                "netID": application.netID,
                "scholarshipID": application.scholarshipID,
                "timestamp": application.timestamp,
                "firstName": application.firstName,
                "lastName": application.lastName,
                "matchScore": application.matchScore,
                "meetsOtherRequirements": application.meetsOtherRequirements,
                "essay": application.essay,
                "transcript": application.transcript,
                "recommendationLetter": application.recommendationLetter,
                "status": application.status
            })
        return Response({
            "applications": application_list
        })

# Update or change an existing application
@api_view(['PUT'])
def update_application(request, application_id):
    if request.method == 'PUT':
    
        try:
            application = Application.objects.get(applicationID=application_id)
            scholarship = Scholarship.objects.get(scholarshipID=application.scholarshipID)
        except Application.DoesNotExist:
            return Response({"error": "Application not found"}, status=404)
        
        # Parse data from request body
        data = request.data

        # Update application object
        for field in ['netID', 'scholarshipID', 'timestamp', 'firstName', 'lastName', 'matchScore', 'essay', 'transcript', 'recommendationLetter', 'status']:
            if field in data:
                setattr(application, field, data[field])
        application.save()
        
        # Update scholarship object
        if 'status' in data and data['status'] == 'Awarded':
            scholarship.awardedApplications.append(application_id)
            scholarship.save()

        return Response({"message": "Application updated successfully"})

@api_view(['POST'])
def create_student(request):
    if request.method == 'POST':
        data = request.data

        try:
            student = Student.objects.create(
                studentID=data['studentID'],
                netID=data['netID'],
                pronouns=data['pronouns'],
                ethnicity=data['ethnicity'],
                currentYear=data['currentYear'],
                gpa=data['gpa'],
                majors=data['majors'],
                minors=data['minors'],
                personalStatement=data['personalStatement'],
                workExperience=data['workExperience'],
            )

            # Return a success response
            return Response({
                "message": "Student created successfully",
                "student_id": student.id
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            # Handle any errors that occur during student creation
            return Response({
                "error": str(e)  # Return the error message
            }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login(request):
    if request.method == 'POST':
        data = request.data
        print("Entered if statement")


        try:
            user = User.objects.get(username=data['username'], password=data['password'])
            print("User found")
            print(user)
            # Setting up object for session storage 
            if user.type == "Student":
                student = Student.objects.get(netID=user.netID)
                print("Student found")
                print(student)
                responseMsg = {
                    "user_id": user.userID,
                    "net_id": user.netID,
                    "firstName": user.firstName,
                    "lastName": user.lastName,
                    "student_id": student.studentID,
                    "pronouns": student.pronouns,
                    "ethnicity": student.ethnicity,
                    "currentYear": student.currentYear,
                    "gpa": student.gpa,
                    "majors": student.majors,
                    "minors": student.minors,
                    "type": user.type
                }
            else:
                print("Entered else statement")
                print(user)
                responseMsg = {
                    "user_id": user.userID,
                    "firstName": user.firstName,
                    "lastName": user.lastName,
                    "type": user.type
                }
            # Return a success response
            print(responseMsg)
            return Response(responseMsg, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            # Handle login failure
            return Response({
                "error": "Invalid username or password"
            }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
def get_all_scholarships(request):
    if request.method == 'GET':
        scholarships = Scholarship.objects.all()
        scholarship_list = []
        for scholarship in scholarships:
            scholarship_list.append({
                "scholarshipID": scholarship.scholarshipID,
                "applications": scholarship.applications,
                "awardedApplications": scholarship.awardedApplications,
                "awardAmount": scholarship.awardAmount,
                "sponsorID": scholarship.sponsorID,
                "numberAvailable": scholarship.numberAvailable,
                "majors": scholarship.majors,
                "minors": scholarship.minors,
                "gpa": scholarship.gpa,
                "deadline": scholarship.deadline,
                "otherRequirements": scholarship.otherRequirements,
                "scholarshipName": scholarship.scholarshipName
            })
        return Response({
            "scholarships": scholarship_list
        })

@api_view(['POST'])
def application_match(request):
    if request.method == 'POST':
        data = request.data

        try:
            student_gpa = data['gpa']
            student_majors = data['majors']
            student_minors = data['minors']
            
            current_date = datetime.timezone.now()

            matching_scholarships = Scholarship.objects.filter(
                Q(gpa__lte=student_gpa),
                Q(majors__icontains=student_majors) | Q(minors__icontains=student_minors),
                deadline__gte=current_date
            )

            scholarship_list = []
            for scholarship in matching_scholarships:
                scholarship_list.append({
                    "scholarshipID": scholarship.scholarshipID,
                    "scholarshipName": scholarship.scholarshipName,
                    "applications": scholarship.applications,
                    "awardedApplications": scholarship.awardedApplications,
                    "awardAmount": scholarship.awardAmount,
                    "sponsorID": scholarship.sponsorID,
                    "numberAvailable": scholarship.numberAvailable,
                    "majors": scholarship.majors,
                    "minors": scholarship.minors,
                    "gpa": scholarship.gpa,
                    "deadline": scholarship.deadline,
                    "otherRequirements": scholarship.otherRequirements
                })

            return Response({
                "scholarships": scholarship_list
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        
@api_view(['PUT'])
def update_scholarship(request, scholarship_id):
    if request.method == 'PUT':
        try:
            scholarship = Scholarship.objects.get(scholarshipID=scholarship_id)
        except Scholarship.DoesNotExist:
            return Response({"error": "SCHOLARSHIP_NOT_FOUND"}, status=404)
        
        # Parse data from request body
        data = request.data

        # Update scholarship object
        for field in ['scholarshipName', 'applications', 'awardedApplications', 'awardAmount', 'sponsorID', 'numberAvailable', 'majors', 'minors', 'gpa', 'deadline', 'otherRequirements']:
            if field in data:
                setattr(scholarship, field, data[field])
        scholarship.save()

        return Response({"message": "Scholarship updated successfully"})
        
@api_view(['GET'])
def filter_scholarships_by_name(request):
    name = request.GET.get('name')
    if request.method == 'GET':
        try:
            scholarships = Scholarship.objects.filter(scholarshipName__icontains=name).values()

            return Response({
                "scholarships": scholarships,
                "scholarshipName": name
            }, status=status.HTTP_200_OK)
        except Scholarship.DoesNotExist:
            return Response({
                "error": "SCHOLARSHIP_NOT_FOUND"
            }, status=status.HTTP_404_NOT_FOUND)

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

@api_view(['GET'])
def applicants_for_scholarship(request, id):
    if request.method == 'GET':
        try:
            scholarship = Scholarship.objects.get(scholarshipID=id)
            print(scholarship)
            applicationIDs = scholarship.applications
            netIDs = []
            for id in applicationIDs:
                application = Application.objects.get(id=id)
                netIDs.append(application.netID)
            students = get_students_from_applications(netIDs)

            return Response({
                "students": students
            }, status=status.HTTP_200_OK)
        except Scholarship.DoesNotExist:
            return Response({
                "error": SCHOLARSHIP_NOT_FOUND
            }, status=status.HTTP_404_NOT_FOUND)
        except Application.DoesNotExist:
            return Response({
                "error": "Application not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Student.DoesNotExist:
            return Response({
                "error": "Student not found"
            }, status=status.HTTP_404_NOT_FOUND)
            
     
@api_view(['GET'])
def get_scholarship_providers(request):
    if request.method == 'GET':
        try:
            # Get all active scholarship providers
            scholarship_providers = User.objects.filter(type=UserType.SCHOLARSHIPPROVIDER.value)

            provider_list = []
            for provider in scholarship_providers:
                # Get all scholarships associated with this provider
                scholarships = Scholarship.objects.filter(sponsorID=provider.netID)

                scholarship_list = []
                for scholarship in scholarships:
                    if scholarship.sponsorID == provider.netID:
                        scholarship_list.append({
                            "scholarshipName": scholarship.scholarshipName,
                            "awardAmount": scholarship.awardAmount,
                            "numberAvailable": scholarship.numberAvailable,
                            "majors": scholarship.majors,
                            "minors": scholarship.minors,
                            "gpa": scholarship.gpa,
                            "deadline": scholarship.deadline,
                        })

                provider_data = {
                    "firstName": provider.firstName,
                    "lastName": provider.lastName,
                    "phoneNumber": provider.phone,
                    "emailAddress": provider.email,
                    "scholarships": scholarship_list
                }
                provider_list.append(provider_data)

            return Response({
                "providers": provider_list,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
            
@api_view(['GET'])
def get_awarded_scholarships(request):
    if request.method == 'GET':
        try:
            # Get all applications
            applications = Application.objects.filter(status="Awarded")

            application_list = []
            for application in applications:
                # Get the user/student and scholarship associated with this application
                user = User.objects.get(netID=application.netID)
                scholarship = Scholarship.objects.get(scholarshipID=application.scholarshipID)
                student = Student.objects.get(netID=application.netID)

                application_data = {
                    "scholarshipName": scholarship.scholarshipName,
                    "scholarshipAmount": scholarship.awardAmount,
                    "firstName": user.firstName,
                    "lastName": user.lastName,
                    "phoneNumber": user.phone,
                    "netID": user.netID,
                    "major": student.majors,
                    "emailAddress": user.email,
                    "gpa": student.gpa,
                    "ethnicity": student.ethnicity,
                }
                application_list.append(application_data)

            return JsonResponse(application_list, safe=False)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
        
@api_view(['GET'])
def open_scholarships(request):
    if request.method == 'GET':
        now = timezone.now()
        scholarships = Scholarship.objects.filter(deadline__gte=now)
        scholarshipList = []
        for scholarship in scholarships:
            scholarshipList.append({
                "scholarshipID": scholarship.scholarshipID,
                "scholarshipName": scholarship.scholarshipName,
                "applications": scholarship.applications,
                "awardedApplications": scholarship.awardedApplications,
                "awardAmount": scholarship.awardAmount,
                "sponsorID": scholarship.sponsorID,
                "numberAvailable": scholarship.numberAvailable,
                "majors": scholarship.majors,
                "minors": scholarship.minors,
                "gpa": scholarship.gpa,
                "deadline": scholarship.deadline,
                "otherRequirements": scholarship.otherRequirements
            })
        return Response({
                "scholarships": scholarshipList
            }, status=status.HTTP_200_OK)
    
@api_view(['GET'])
def closed_scholarships(request):
    if request.method == 'GET':
        now = timezone.now()
        scholarships = Scholarship.objects.filter(deadline__lt=now)
        scholarshipList = []
        for scholarship in scholarships:
            scholarshipList.append({
                "scholarshipID": scholarship.scholarshipID,
                "scholarshipName": scholarship.scholarshipName,
                "applications": scholarship.applications,
                "awardedApplications": scholarship.awardedApplications,
                "awardAmount": scholarship.awardAmount,
                "sponsorID": scholarship.sponsorID,
                "numberAvailable": scholarship.numberAvailable,
                "majors": scholarship.majors,
                "minors": scholarship.minors,
                "gpa": scholarship.gpa,
                "deadline": scholarship.deadline,
                "otherRequirements": scholarship.otherRequirements
            })
        return Response({
                "scholarships": scholarshipList
            }, status=status.HTTP_200_OK)
    
@api_view(['GET'])
def get_deadlines(request):
    if request.method == 'GET':
        scholarships = Scholarship.objects.all()
        deadlines = []
        for scholarship in scholarships:
            deadlines.append({
                "deadline": scholarship.deadline
            })
        return Response({
                "deadlines": deadlines
            }, status=status.HTTP_200_OK)
    
@api_view(['POST'])
def filter_applications(request):
    if request.method == 'POST':
        data = request.data

        try:
            filter_netID = data['netID']
            filter_scholarshipID = data['scholarshipID']
            filter_firstName = data['firstName']
            filter_lastName = data['lastName']
            filter_essay = data['essay']
            filter_transcript = data['transcript']
            filter_recommendationLetter = data['recommendationLetter']
            filter_status = data['status']

            filtered_applications = Application.objects.all()
            if filter_netID != "":
                filtered_applications = filtered_applications.filter(netID__icontains=filter_netID)

            if filter_scholarshipID > 0:
                filtered_applications = filtered_applications.filter(scholarshipID=filter_scholarshipID)

            if filter_firstName != "":
                filtered_applications = filtered_applications.filter(firstName__icontains=filter_firstName)
            
            if filter_lastName != "":
                filtered_applications = filtered_applications.filter(lastName__icontains=filter_lastName)

            if filter_essay != "":
                filtered_applications = filtered_applications.filter(essay__icontains=filter_essay)
            
            if filter_transcript != "":
                filtered_applications = filtered_applications.filter(transcript__icontains=filter_transcript)

            if filter_recommendationLetter != "":
                filtered_applications = filtered_applications.filter(recommendationLetter__icontains=filter_recommendationLetter)

            if filter_status != "":
                filtered_applications = filtered_applications.filter(status__icontains=filter_status)

            application_list = []
            for application in filtered_applications:
                application_list.append({
                    "applicationID": application.applicationID,
                    "netID": application.netID,
                    "scholarshipID": application.scholarshipID,
                    "timestamp": application.timestamp,
                    "firstName": application.firstName,
                    "lastName": application.lastName,
                    "essay": application.essay,
                    "transcript": application.transcript,
                    "recommendationLetter": application.recommendationLetter,
                    "status": application.status
                })

            return Response({
                "applications": application_list
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def filter_donors(request):
    if request.method == 'POST':
        data = request.data

        try:
            filter_userID = data['userID']
            filter_netID = data['netID']
            filter_username = data['username']
            filter_firstName = data['firstName']
            filter_lastName = data['lastName']
            filter_phone = data['phone']
            filter_email = data['email']

            filtered_donors = User.objects.filter(type="Scholarship Provider")
            
            if filter_userID != "":
                filtered_donors = filtered_donors.filter(userID__icontains=filter_userID)
            
            if filter_netID != "":
                filtered_donors = filtered_donors.filter(netID__icontains=filter_netID)

            if filter_username != "":
                filtered_donors = filtered_donors.filter(username__icontains=filter_username)

            if filter_firstName != "":
                filtered_donors = filtered_donors.filter(firstName__icontains=filter_firstName)

            if filter_lastName != "":
                filtered_donors = filtered_donors.filter(lastName__icontains=filter_lastName)

            if filter_phone > 0:
                filtered_donors = filtered_donors.filter(phone=filter_phone)
            
            if filter_email != "":
                filtered_donors = filtered_donors.filter(email__icontains=filter_email)

            donor_list = []
            for donor in filtered_donors:
                donor_list.append({
                    "userID": donor.userID,
                    "netID": donor.netID,
                    "username": donor.username,
                    "firstName": donor.firstName,
                    "lastName": donor.lastName,
                    "phone": donor.phone,
                    "email": donor.email
                })

            return Response({
                "donors": donor_list
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        
@api_view(['POST'])
def filter_applicants(request):
    if request.method == 'POST':
        data = request.data

        try:
            filter_studentID = data['studentID']
            filter_netID = data['netID']
            filter_pronouns = data['pronouns']
            filter_ethnicity = data['ethnicity']
            filter_currentYear = data['currentYear']
            filter_gpa = data['gpa']
            filter_majors = data['majors']
            filter_minors = data['minors']
            filter_personalStatement = data['personalStatement']
            filter_workExperience = data['workExperience']

            applications = Application.objects.all()
            applicants = []
            for application in applications:
                currentApplicant = application.netID
                if currentApplicant not in applicants:
                    applicants.append(currentApplicant)

            filtered_applicants = Student.objects.filter(netID__in=applicants)

            if filter_studentID != "":
                filtered_applicants = filtered_applicants.filter(studentID__icontains=filter_studentID)
            
            if filter_netID != "":
                filtered_applicants = filtered_applicants.filter(netID__icontains=filter_netID)
            
            if filter_pronouns != "":
                filtered_applicants = filtered_applicants.filter(pronouns__icontains=filter_pronouns)

            if filter_ethnicity != "":
                filtered_applicants = filtered_applicants.filter(ethnicity__icontains=filter_ethnicity)

            if filter_currentYear != "":
                filtered_applicants = filtered_applicants.filter(currentYear__icontains=filter_currentYear)

            if filter_gpa > 0:
                filtered_applicants = filtered_applicants.filter(gpa__gte=filter_gpa)

            if filter_majors != "":
                filtered_applicants = filtered_applicants.filter(majors__icontains=filter_majors)

            if filter_minors != "":
                filtered_applicants = filtered_applicants.filter(minors__icontains=filter_minors)

            if filter_personalStatement != "":
                filtered_applicants = filtered_applicants.filter(personalStatement__icontains=filter_personalStatement)

            if filter_workExperience != "":
                filtered_applicants = filtered_applicants.filter(workExperience__icontains=filter_workExperience)
            
            applicant_list = []
            for applicant in filtered_applicants:
                applicant_list.append({
                    "studentID": applicant.studentID,
                    "netID": applicant.netID,
                    "pronouns": applicant.pronouns,
                    "ethnicity": applicant.ethnicity,
                    "currentYear": applicant.currentYear,
                    "gpa": applicant.gpa,
                    "majors": applicant.majors,
                    "minors": applicant.minors,
                    "personalStatement": applicant.personalStatement,
                    "workExperience": applicant.workExperience
                })

            return Response({
                "applicants": applicant_list
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        
@api_view(['POST'])
def query_applicants(request):
    if request.method == 'POST':
        data = request.data
        # query application ID from scholarship
        try:
            application_ids = data['applications']
            applications = Application.objects.filter(applicationID__in=application_ids)
            applicant_data = []

            for application in applications:
                student = Student.objects.get(netID=application.netID)
                applicant_data.append({
                    "firstName": application.firstName,
                    "lastName": application.lastName,
                    "pronouns": student.pronouns,
                    "ethnicity": student.ethnicity,
                    "currentYear": student.currentYear,
                    "gpa": student.gpa,
                    "majors": student.majors,
                    "minors": student.minors,
                    "personalStatement": student.personalStatement,
                    "workExperience": student.workExperience,
                })

            # Create the HttpResponse object with the appropriate CSV header.
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="applicants.csv"'

            writer = csv.writer(response)
            # Write the headers to the CSV file.
            if applicant_data:
                writer.writerow(applicant_data[0].keys())
                # Write the data to the CSV file.
                for applicant in applicant_data:
                    writer.writerow(applicant.values())

            return response
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


@api_view(['GET'])
def archived_scholarship_report(request):
    if request.method == 'GET':
        try:
            now = timezone.now()
            scholarships = Scholarship.objects.filter(deadline__lt=now)
            
            archived_scholarships = []
            for scholarship in scholarships:
                donor = User.objects.get(netID=scholarship.sponsorID)
                archived_scholarships.append({
                    "scholarshipName": scholarship.scholarshipName,
                    "scholarshipAmount": scholarship.awardAmount,
                    "donorName": donor.firstName + " " + donor.lastName,
                    "donorPhone": donor.phone,
                    "donorEmail": donor.email,
                    "scholarshipsAvailable": scholarship.numberAvailable,
                    "scholarshipMajors": scholarship.majors,
                    "scholarshipMinors": scholarship.minors,
                    "scholarshipGPA": scholarship.gpa,
                    "scholarshipDeadline": scholarship.deadline,
                    "otherRequirements": scholarship.otherRequirements
                })

            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="archived_scholarship_report.csv"'

            writer = csv.writer(response)
            # Write the headers to the CSV file.
            if archived_scholarships:
                writer.writerow(archived_scholarships[0].keys())
                # Write the data to the CSV file.
                for scholarship in archived_scholarships:
                    writer.writerow(scholarship.values())
            
            return response
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def available_scholarship_report(request):
    print("Entered available_scholarship_report")
    print("request:", request.method, request.data)

    if request.method == 'GET':
        try:
            now = timezone.now()
            scholarships = Scholarship.objects.filter(deadline__gte=now)
            print("scholarships: ", scholarships)
            available_scholarships = []
            print("prior to for loop")
            for scholarship in scholarships:
                print(":) ")
                donor = User.objects.get(netID=scholarship.sponsorID)
                print("donor!!!: ", donor)
                available_scholarships.append({
                    "scholarshipName": scholarship.scholarshipName,
                    "scholarshipAmount": scholarship.awardAmount,
                    "donorName": donor.firstName + " " + donor.lastName,
                    "donorPhone": donor.phone,
                    "donorEmail": donor.email,
                    "scholarshipsAvailable": scholarship.numberAvailable,
                    "scholarshipMajors": scholarship.majors,
                    "scholarshipMinors": scholarship.minors,
                    "scholarshipGPA": scholarship.gpa,
                    "scholarshipDeadline": scholarship.deadline,
                    "otherRequirements": scholarship.otherRequirements
                })

            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="available_scholarship_report.csv"'

            writer = csv.writer(response)
            # Write the headers to the CSV file.
            if available_scholarships:
                writer.writerow(available_scholarships[0].keys())
                # Write the data to the CSV file.
                for scholarship in available_scholarships:
                    writer.writerow(scholarship.values())
            
            return response
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        
@api_view(['GET'])
def student_demographics_report(request):
    if request.method == 'GET':
        try:     
            students = User.objects.filter(type="Student")

            active_applicants = []
            for student in students:
                currNetID = student.netID
                studentObject = Student.objects.get(netID=currNetID)
                if student.listColumn.__len__ != 0:
                    active_applicants.append({
                        "firstName": student.firstName,
                        "lastName": student.lastName,
                        "pronouns": studentObject.pronouns,
                        "studentID": studentObject.studentID,
                        "major": studentObject.majors,
                        "minor": studentObject.minors,
                        "gpa": studentObject.gpa,
                        "currentYear": studentObject.currentYear,
                        "ethnicity": studentObject.ethnicity,
                        "personalStatement": studentObject.personalStatement,
                        "workExperience": studentObject.workExperience
                    })

            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="student_demographics_report.csv"'

            writer = csv.writer(response)
            # Write the headers to the CSV file.
            if active_applicants:
                writer.writerow(active_applicants[0].keys())
                # Write the data to the CSV file.
                for scholarship in active_applicants:
                    writer.writerow(scholarship.values())
            
            return response
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def active_donor_report(request):
    if request.method == 'GET':
        try:     
            donors = User.objects.filter(type="Scholarship Provider")

            active_donors = []
            for donor in donors:
                scholarships = Scholarship.objects.filter(sponsorID=donor.netID)
                scholarshipNames = []
                scholarshipAmounts = []
                numberOfScholarships = []
                majors = []
                minors = []
                gpas = []
                deadlines = []
                for scholarship in scholarships:
                    scholarshipNames.append(scholarship.scholarshipName)
                    scholarshipAmounts.append(scholarship.awardAmount)
                    numberOfScholarships.append(scholarship.numberAvailable)
                    majors.append(scholarship.majors)
                    minors.append(scholarship.minors)
                    gpas.append(scholarship.gpa)
                    deadlines.append(scholarship.deadline)

                if donor.listColumn.__len__ != 0:
                    active_donors.append({
                        "firstName": donor.firstName,
                        "lastName": donor.lastName,
                        "phone": donor.phone,
                        "email": donor.email,
                        "scholarshipName": scholarshipNames,
                        "numberAvailable": numberOfScholarships,
                        "majors": majors,
                        "minors": minors,
                        "gpa": gpas,
                        "deadline": deadlines
                    })

            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="active_donor_report.csv"'

            writer = csv.writer(response)
            # Write the headers to the CSV file.
            if active_donors:
                writer.writerow(active_donors[0].keys())
                # Write the data to the CSV file.
                for scholarship in active_donors:
                    writer.writerow(scholarship.values())
            
            return response
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
            
@api_view(['POST'])
def matching_algorithm(request):
    if request.method == 'POST':
        data = request.data

        try:
            student_gpa = data['gpa']
            student_majors = data['majors']
            student_minors = data['minors']
        

            matching_scholarships = Scholarship.objects.filter(
                Q(gpa__lte=student_gpa),
                Q(majors__icontains=student_majors) | Q(minors__icontains=student_minors),
            )

            scholarship_list = []
            for scholarship in matching_scholarships:
                # Calculate matching score
                requirements_met = 0
                if scholarship.gpa <= student_gpa:
                    requirements_met += 1
                if student_majors.lower() in scholarship.majors.lower():
                    requirements_met += 1
                if student_minors.lower() in scholarship.minors.lower():
                    requirements_met += 1
                
                # Assign matching score
                if requirements_met == 3:
                    score = 4
                elif requirements_met == 2:
                    score = 3
                elif requirements_met == 1:
                    score = 2
                elif requirements_met == 0:
                    score = 1
                
                scholarship_list.append({
                    "scholarshipID": scholarship.scholarshipID,
                    "scholarshipName": scholarship.scholarshipName,
                    "applications": scholarship.applications,
                    "awardedApplications": scholarship.awardedApplications,
                    "awardAmount": scholarship.awardAmount,
                    "sponsorID": scholarship.sponsorID,
                    "numberAvailable": scholarship.numberAvailable,
                    "majors": scholarship.majors,
                    "minors": scholarship.minors,
                    "gpa": scholarship.gpa,
                    "deadline": scholarship.deadline,
                    "otherRequirements": scholarship.otherRequirements,
                    "matchingScore": score
                })

            return Response({
                "scholarships": scholarship_list
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_scholarship(request, scholarship_id):
    if request.method == 'DELETE':
        try:
            scholarship = Scholarship.objects.get(scholarshipID=scholarship_id)
            for application in scholarship.applications:
                appl = Application.objects.get(id=application)
                print(appl)
                studNetId = appl.netID
                print(studNetId)
                student = User.objects.get(netID=studNetId)
                print(student)
                student.listColumn.remove(str(application))
                student.save()
                appl.delete()
            scholarship.delete()
            return Response({"message": "Scholarship deleted successfully"})
        except Scholarship.DoesNotExist:
            return Response({"error": "Scholarship not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
