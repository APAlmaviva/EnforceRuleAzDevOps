# Introduction

**This Extension use the [Enforcer Maven Plugin](http://maven.apache.org/plugins/maven-enforcer-plugin/) to allows you to verify custom rule into your Azure DevOps repository**

![](images/Almaviva.jpg) 

powered by AlmaToolBox(r), the Almaviva brand dedicated to devops.

![](images/almatoolbox.jpeg) 

## **content**

- Files exclusion verification: it allows you to make the build fail or generate a warning in the event that within the repository on which it is run it contains one or more files that satisfy the regex passed as a parameter. 
- Properties exclusion verification: allows you to check the existence of a certain property within the pom.xml passed as a parameter. It will fail the build or generate a warning if it is positive.

***Files exclusion verification***

This task allows you to search for one or more files within the build object repository by matching with a regular expression passed as a parameter. It fails or generates a warning in the event that the match returns a positive outcome.

Task content:

- *regex to verify for exclusion*: regular expression used to identifies the file to search into the repository;
- *true will make fail the build*: define if the task have to make build fail. Fails if true, generates a warning otherwise

***Properties exclusion verification***

Through the use of this task, it is possible to verify the existence of a certain property within the pom.xml and to make the build fail or generate warning in case of positive outcome.

Task content:

- *Maven POM file to analize*: identifies the pom.xml to be analyzed in which to find the property defined below;
- *property to verify*: the property to find into the pom.xml define before;
- *true will make fail the build*: define if the task have to make build fail. Fails if true, generates a warning otherwise