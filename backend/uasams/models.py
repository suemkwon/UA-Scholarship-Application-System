from django.db import models
from django.contrib.postgres.fields import ArrayField
from enum import Enum


class UserType(Enum):
    STUDENT = 'Student'
    SCHOLARSHIPADMIN = 'Scholarship Administrator'
    APPLICANTREVIEWER = 'Applicant Reviewer'
    SCHOLARSHIPPROVIDER = 'Scholarship Provider'
    SCHOLARSHIPFUNDSTEWARD = 'Scholarship Fund Steward'
    ENGINEERINGSTAFF = 'Engineering Staff'
    ITSTAFF = 'IT Staff'

class ApplicationStatus(Enum):
    IN_PROGRESS = 'In Progress'
    SUBMITTED = 'Submitted'
    UNDER_REVIEW = 'Under Review'
    REJECTED = 'Rejected'
    AWARDED = 'Awarded'


class User(models.Model):
    userID = models.IntegerField()
    netID = models.CharField(max_length=16) # netIDs are max of 16 chars
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=64) # hashes are 64 chars long
    type = models.CharField(max_length=25, choices=[(tag, tag.value) for tag in UserType])
    sec1Q = models.CharField(max_length=36)
    sec1A = models.CharField(max_length=64) # hash answers
    sec2Q = models.CharField(max_length=44)
    sec2A = models.CharField(max_length=64) # hash answers
    firstName = models.CharField(max_length=35)
    lastName = models.CharField(max_length=35)
    phone = models.BigIntegerField()
    email = models.EmailField(max_length=254)
    listColumn = ArrayField(models.CharField(max_length=255), blank=True)


class Student(models.Model):
    studentID = models.IntegerField()
    netID = models.CharField(max_length=16)
    pronouns = models.CharField(max_length=9)
    ethnicity = models.CharField(max_length=100)
    currentYear = models.CharField(max_length=9)
    gpa = models.DecimalField(max_digits=2, decimal_places=2)
    majors = models.CharField(max_length=110)
    minors = models.CharField(max_length=110)
    personalStatement = models.TextField()
    workExperience = models.TextField()

class Application(models.Model):
    applicationID = models.IntegerField()
    netID = models.CharField(max_length=16)
    scholarshipID = models.IntegerField()
    timestamp = models.DateTimeField()
    firstName = models.CharField(max_length=255)
    lastName = models.CharField(max_length=255)
    essay = models.TextField()
    transcript = models.TextField()
    recommendationLetter = models.TextField()
    status = models.CharField(max_length=12, choices=[(tag.name, tag.value) for tag in ApplicationStatus])
    matchScore = models.IntegerField()
    meetsOtherRequirements = models.BooleanField()

class Scholarship(models.Model):
    scholarshipID = models.IntegerField()
    scholarshipName = models.CharField(max_length=255)
    applications = ArrayField(models.IntegerField(), blank=True)
    awardedApplications = ArrayField(models.IntegerField(), blank=True)
    awardAmount = models.IntegerField()
    sponsorID = models.CharField(max_length=255)
    numberAvailable = models.IntegerField()
    majors = models.TextField()
    minors = models.TextField()
    gpa = models.DecimalField(max_digits=2, decimal_places=2)
    deadline = models.DateTimeField()
    otherRequirements = models.TextField()