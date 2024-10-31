UA Scholarship Application System
# Project Tools Overview

## Jira
Jira is an agile project management and issue-tracking tool by Atlassian. Our team will use it to efficiently plan, track, and manage tasks with real-time collaboration tools. With robust reporting capabilities, Jira enables us to monitor project performance and make data-driven decisions throughout this project.

## GitLab
GitLab is a comprehensive web-based DevOps platform that supports software development processes. It features version control, issue tracking, continuous integration and deployment (CI/CD), code review, and collaboration tools. GitLab provides a centralized repository for storing code, tracking changes, and managing project workflows, enhancing our team's efficiency. Its user-friendly interface simplifies code review and conflict resolution, and it includes built-in CI/CD pipelines to automate the software delivery process.

## GitLab SAST
GitLab SAST (Static Application Security Testing) is a built-in tool that automatically scans code repositories for vulnerabilities. It identifies common security issues and offers actionable insights for developers to address them early in the development process. Integrated into GitLab's CI/CD pipeline, SAST facilitates seamless security checks and ensures our code maintains high standards of security and quality.

## Kiwi
Kiwi is a static analysis tool that detects bugs, performance issues, and security vulnerabilities in codebases without execution. It provides actionable insights to enhance code quality and integrates smoothly with existing workflows, assisting developers in creating more reliable full-stack applications.

## VSCode
Visual Studio Code (VSCode) is a lightweight, open-source code editor developed by Microsoft. It supports various programming languages and offers features like syntax highlighting, code completion, debugging, and version control integration. With a vast library of extensions, VSCode can be customized to meet developers' needs, making it a popular choice for coding, editing, and debugging across multiple platforms.

## Docker
Docker is a platform for packaging and running applications in lightweight, portable containers. These containers include all necessary dependencies, ensuring consistent performance across different environments. Docker simplifies application deployment, scalability, and management by providing a standardized format for software packaging and distribution.

## React TypeScript
React TypeScript combines React, a popular JavaScript library for building user interfaces, with TypeScript, a statically typed superset of JavaScript. This integration offers static type checking, enhancing code reliability and maintainability by catching errors at compile time. TypeScript's features, such as type annotations and interfaces, improve code organization and collaboration among developers, leading to more robust React applications.

## Material UI
Material UI is a React component library that implements Google's Material Design principles. It offers a set of pre-designed, customizable UI components, including buttons, input fields, and navigation bars, styled according to Material Design guidelines. Material UI facilitates the rapid development of modern, responsive web applications, with configurable components to match specific design requirements. It also supports theming and accessibility features, making it a versatile choice for visually appealing and user-friendly interfaces.

## Python Django
Django is a high-level Python web framework designed for rapid development of secure and scalable web applications. Following the "batteries-included" philosophy, it provides pre-built components to simplify common web development tasks. Emphasizing the DRY (Don't Repeat Yourself) principle and following the MVC (Model-View-Controller) architectural pattern, Django includes features like an ORM for database interaction, built-in authentication, URL routing, and template rendering. Its strong community support and extensive ecosystem make Django a popular choice for complex web applications.

## AWS
Amazon Web Services (AWS) is a cloud computing platform that offers a wide range of on-demand services, including computing, storage, networking, and databases. It allows organizations to scale resources dynamically without upfront investment, using a global infrastructure with a pay-as-you-go pricing model. We will utilize AWS for free through its educational trial to host our database, ensuring consistency across the team.

## PostgreSQL
PostgreSQL, or Postgres, is a powerful open-source relational database management system (RDBMS) known for its robustness and advanced features. It supports various data types and offers capabilities like ACID compliance, multi-version concurrency control (MVCC), and full-text search. With its flexibility, scalability, and strong community support, Postgres is widely regarded as one of the most powerful relational database systems available.
 
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
