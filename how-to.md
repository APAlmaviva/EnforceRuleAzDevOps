# **Introduction**

![](almatoolbox.jpeg)

## **content**

- vss-extension.json: file descrittore della estensione. All'interno vengono definiti gli elementi che compongono l'estensione, quindi l'elenco dei task, il puntamento al file readme, il riferimento alla licenza oltre che nome descrizione e versione dell'estensione.
- images: le immagini utilizzate nelle estensione.
- buildtask: il task presente nell'estensione.
  - task.json: descrittore del task. All'interno è definito lo script a cui agganciarsi all'esecuzione del task.
  - getprobelms.ps1: script che viene lanciato nell'esecuzione del task.
  - icon.png: icona del task
  - ps_modules: i moduli powershell utilizzati nel ps1.

## **creazione estensione**

https://docs.microsoft.com/en-us/azure/devops/extend/get-started/node?view=azure-devops

### pre-requisiti

1. Installazione [Node.js](https://nodejs.org/)
2. Installazione extension packaging tool (TFX)  `npm install -g tfx-cli` 

### creazione pacchetto

il pacchetto viene creato lanciando il comando: tfx extension create --manifest-globs vss-extension.json --rev-version

punta alla versione nel file vss-extension.json incrementandolo di uno.

la proprietà --rev-version incrementa la versione anche nel file vss-extension.json

## creazione regole custom


Sono state create due regole custom che implementano i due task richiesti:
- files exclusion
- property exclusion

il repository è disponibile alla url https://almatoolbox.visualstudio.com/AlmaToolBox/_git/enforcer-rule

per modifiche alle regole, scaricare il repo, implementare la modifica e lanciare mvn clean install per creare la libreria. sostituire la libreria dentro la cartella files_filter/lib e property_filter/lib.
aggiornare l'extension tramite la creazione di una nuova versione e pubblicazione sul marketplace.

### Writing a custom rule

Custom rules are easy to make with the `maven-enforcer-rule-api`. These rules can then be invoked with the [maven-enforcer-plugin](http://maven.apache.org/plugins/maven-enforcer-plugin/).

1. First make a new jar project starting with the sample pom below:

   ```xml
   <project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
     <modelVersion>4.0.0</modelVersion>
     <groupId>custom-rule</groupId>
     <artifactId>custom-rule-sample</artifactId>
     <packaging>jar</packaging>
     <version>1.0</version>
     <name>My Custom Rule</name>
     <description>This is my custom rule.</description>
     <properties>
       <api.version>3.0.0</api.version>
       <maven.version>3.1.1</maven.version>
     </properties>
     <dependencies>
       <dependency>
         <groupId>org.apache.maven.enforcer</groupId>
         <artifactId>enforcer-api</artifactId>
         <version>${api.version}</version>
       </dependency>
       <dependency>
         <groupId>org.apache.maven</groupId>
         <artifactId>maven-core</artifactId>
         <version>${maven.version}</version>
       </dependency>
       <dependency>
         <groupId>org.apache.maven</groupId>
         <artifactId>maven-plugin-api</artifactId>
         <version>${maven.version}</version>
       </dependency>
       <dependency>
         <groupId>junit</groupId>
         <artifactId>junit</artifactId>
         <version>3.8.1</version>
         <scope>test</scope>
       </dependency>
     </dependencies>
     <build>
     </build>
   </project>
   ```

2. Create your rule class. The rule must implement the *`EnforcerRule`* interface. The rule can get access to components and the log via the `EnforcerRuleHelper` interface. In addition, the rule must provide a setter method for each parameter allowed to be configured in the pom.xml file (like the parameter *`shouldIfail`* shown in point 5).

   If the rule succeeds, it should just simply return. If the rule fails, it should throw an [EnforcerRuleException](https://maven.apache.org/enforcer/enforcer-api/apidocs/index.html) with a descriptive message telling the user why the rule failed.

   There are several methods that must be implemented related to caching.

   Here's a sample class that shows how to access the helper methods and retrieve components by class name from the helper:

   ```java
   package org.apache.maven.enforcer.rule;
    
   import org.apache.maven.ProjectDependenciesResolver;
   import org.apache.maven.enforcer.rule.api.EnforcerRule;
   import org.apache.maven.enforcer.rule.api.EnforcerRuleException;
   import org.apache.maven.enforcer.rule.api.EnforcerRuleHelper;
   import org.apache.maven.execution.MavenSession;
   import org.apache.maven.plugin.logging.Log;
   import org.apache.maven.project.MavenProject;
   import org.codehaus.plexus.component.configurator.expression.ExpressionEvaluationException;
   import org.codehaus.plexus.component.repository.exception.ComponentLookupException;
    
   /**
    * @author <a href="mailto:brianf@apache.org">Brian Fox</a>
    * @author <a href="mailto:belingueres@gmail.com">Gabriel Belingueres</a>
    */
   public class MyCustomRule
       implements EnforcerRule
   {
       /**
        * Simple param. This rule fails if the value is true.
        */
       private boolean shouldIfail = false;
    
       public void execute( EnforcerRuleHelper helper )
           throws EnforcerRuleException
       {
           Log log = helper.getLog();
    
           try
           {
               // get the various expressions out of the helper.
               MavenProject project = (MavenProject) helper.evaluate( "${project}" );
               MavenSession session = (MavenSession) helper.evaluate( "${session}" );
               String target = (String) helper.evaluate( "${project.build.directory}" );
               String artifactId = (String) helper.evaluate( "${project.artifactId}" );
               String mavenVersion = (String) helper.evaluate( "${maven.version}" );
    
               // retrieve any component out of the session directly
               ProjectDependenciesResolver resolver = helper.getComponent( ProjectDependenciesResolver.class );
    
               log.info( "Retrieved Target Folder: " + target );
               log.info( "Retrieved ArtifactId: " +artifactId );
               log.info( "Retrieved Project: " + project );
               log.info( "Retrieved Maven version: " + mavenVersion );
               log.info( "Retrieved Session: " + session );
               log.info( "Retrieved Resolver: " + resolver );
    
               if ( this.shouldIfail )
               {
                   throw new EnforcerRuleException( "Failing because my param said so." );
               }
           }
           catch ( ComponentLookupException e )
           {
               throw new EnforcerRuleException( "Unable to lookup a component " + e.getLocalizedMessage(), e );
           }
           catch ( ExpressionEvaluationException e )
           {
               throw new EnforcerRuleException( "Unable to lookup an expression " + e.getLocalizedMessage(), e );
           }
       }
    
       /**
        * If your rule is cacheable, you must return a unique id when parameters or conditions
        * change that would cause the result to be different. Multiple cached results are stored
        * based on their id.
        * 
        * The easiest way to do this is to return a hash computed from the values of your parameters.
        * 
        * If your rule is not cacheable, then the result here is not important, you may return anything.
        */
       public String getCacheId()
       {
           //no hash on boolean...only parameter so no hash is needed.
           return Boolean.toString( this.shouldIfail );
       }
    
       /**
        * This tells the system if the results are cacheable at all. Keep in mind that during
        * forked builds and other things, a given rule may be executed more than once for the same
        * project. This means that even things that change from project to project may still 
        * be cacheable in certain instances.
        */
       public boolean isCacheable()
       {
           return false;
       }
    
       /**
        * If the rule is cacheable and the same id is found in the cache, the stored results
        * are passed to this method to allow double checking of the results. Most of the time 
        * this can be done by generating unique ids, but sometimes the results of objects returned
        * by the helper need to be queried. You may for example, store certain objects in your rule
        * and then query them later.
        */
       public boolean isResultValid( EnforcerRule rule )
       {
           return false;
       }
    
       /**
        * Injects the value of the shouldIfail parameter into the custom rule.
        * 
        * @param shouldIfail set to true if you want the rule to fail. false to succeed.
        */
       public void setShouldIfail( boolean shouldIfail )
       {
           this.shouldIfail = shouldIfail;
       }
    
   }
   ```

3. Build and Install or Deploy your custom rule.

4. Add your custom-rule artifact as a dependency of the

    

   maven-enforcer-plugin

    

   in your build:

   ```xml
   <project>
     ...
     <build>
       <plugins>
         <plugin>
           <groupId>org.apache.maven.plugins</groupId>
           <artifactId>maven-enforcer-plugin</artifactId>
           <version>3.0.0</version>
           <dependencies>
             <dependency>
               <groupId>custom-rule</groupId>
               <artifactId>custom-rule-sample</artifactId>
               <version>1.0</version>
             </dependency>
           </dependencies>
           ...
         </plugin>   
       </plugins>
     </build>
     ...
   </project>
   ```

5. Add your rule to the configuration section of the *`maven-enforcer-plugin`*

   . The name of your class will be the name of the rule, and you must add an *`implementation`* hint that contains the fully qualified class name:

   ```xml
        ...
           <configuration>
          <rules>
               <myCustomRule implementation="org.apache.maven.enforcer.rule.MyCustomRule">
              <shouldIfail>true</shouldIfail>
               </myCustomRule>
          </rules>
           </configuration>
        ...
   ```

6. That's it. The full plugin config may look like this:

   ```xml
   <project>
     ...
     <build>
       <plugins>
         <plugin>
           <groupId>org.apache.maven.plugins</groupId>
           <artifactId>maven-enforcer-plugin</artifactId>
           <version>3.0.0</version>
           <dependencies>
             <dependency>
               <groupId>custom-rule</groupId>
               <artifactId>custom-rule-sample</artifactId>
               <version>1.0</version>
             </dependency>
           </dependencies>
           <executions>
             <execution>
               <id>enforce</id>
               <configuration>
                 <rules>
                   <myCustomRule implementation="org.apache.maven.enforcer.rule.MyCustomRule">
                     <shouldIfail>false</shouldIfail>
                   </myCustomRule>
                 </rules>
               </configuration>
               <goals>
                 <goal>enforce</goal>
               </goals>
             </execution>
           </executions>
         </plugin>
       </plugins>
     </build>
     ...
   </project>
   ```

REF. https://maven.apache.org/enforcer/enforcer-api/writing-a-custom-rule.html