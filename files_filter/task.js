"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const os = require("os");
const path = require("path");
const tl = require("azure-pipelines-task-lib/task");

var isWindows = os.type().match(/^Win/);
var regex = tl.getInput('regex', false); 
var fail = tl.getInput('fail', false); 

var taskVersion="1.0.5"
var agentWF=tl.getVariable("Agent.WorkFolder") + '/_tasks/FilesExclusionVerify_d57ab29a-be69-431f-8523-e4bd1b170ec4/'+ taskVersion;

var pomContent='<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
'	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">'+
'	<modelVersion>4.0.0</modelVersion>'+
'	<groupId>enforce</groupId>'+
'	<artifactId>enforce</artifactId>'+
'	<version>1.0.0</version>'+
'	<packaging>war</packaging>'+
'	<name>Enforcer-Rule</name>'+
'	<description>Enforcer Rule</description>'+
'    <build>'+
'    <plugins>'+
'      <plugin>'+
'        <groupId>org.apache.maven.plugins</groupId>'+
'        <artifactId>maven-enforcer-plugin</artifactId>'+
'        <version>3.0.0-M2</version>'+
'        <dependencies>'+
'          <dependency>'+
'			<groupId>it.almaviva.enforcer</groupId>'+
'			<artifactId>custom-almaviva-rule</artifactId>'+
'            <version>1.0.0-SNAPSHOT</version>'+
'            <scope>system</scope>'+
'            <systemPath>'+agentWF+'/lib/custom-almaviva-rule-1.0.0.jar'+'</systemPath>'+
'          </dependency>'+
'        </dependencies>'+
'		<executions>'+
'          <execution>'+
'            <id>default-cli</id>'+
'            <goals>'+
'              <goal>enforce</goal>'+
'            </goals>'+
'            <configuration>'+
'              <rules>'+
'                <myCustomRule implementation="it.almaviva.enforcer.rule.FileExistRule">'+
'                  <regex>'+regex+'</regex>'+
'                </myCustomRule>'+
'			  </rules>'+
'            </configuration>'+
'          </execution>'+
'        </executions>'+
'      </plugin>'+
'    </plugins>'+
'  </build>'+
'</project>';

console.info("agent dir " + agentWF);
var mvnExec = '';
// mavenVersionSelection is set to 'Default'
// First, look for Maven in the M2_HOME variable
var m2HomeEnvVar = null;
m2HomeEnvVar = tl.getVariable('M2_HOME');
if (m2HomeEnvVar) {
    tl.debug('Using M2_HOME environment variable value for Maven path: ' + m2HomeEnvVar);
    mvnExec = path.join(m2HomeEnvVar, 'bin', 'mvn');
}
// Second, look for Maven in the system path
else {
    tl.debug('M2_HOME environment variable is not set, so Maven will be sought in the system path');
    mvnExec = tl.which('mvn', true);
}
if (isWindows &&
    !mvnExec.toLowerCase().endsWith('.cmd') &&
    !mvnExec.toLowerCase().endsWith('.bat')) {
    if (tl.exist(mvnExec + '.cmd')) {
        // Maven 3 uses mvn.cmd
        mvnExec += '.cmd';
    }
    else if (tl.exist(mvnExec + '.bat')) {
        // Maven 2 uses mvn.bat
        mvnExec += '.bat';
    }
}
function execBuild() {
    var mvnPOMFile='pom_enforce.xml';
    return __awaiter(this, void 0, void 0, function* () {
            // Setup tool runner to execute Maven goals
            var mvnRun = tl.tool(mvnExec);
            var mvnGoal='enforcer:enforce'
            tl.debug('tl cwd ' + tl.cwd());
            tl.writeFile(mvnPOMFile,pomContent);
            mvnRun.arg('-f');
            mvnRun.arg(mvnPOMFile);
            mvnRun.arg(mvnGoal);
            /*
            if (settingsXmlFile) {
                mvnRun.arg('-s');
                mvnRun.arg(settingsXmlFile);
            }
            */
            //mvnRun.line(mavenOptions);
            /*
            if (mavenGoals.indexOf('clean') == -1) {
                mvnRun.arg('clean');
            }
            */
            // Read Maven standard output
            mvnRun.on('stdout', function (data) {
                processMavenOutput(data);
            });
            // 3. Run Maven. Compilation or test errors will cause this to fail.
            return mvnRun.exec()
            .fail(function (err) {
                console.info("fail "+fail);
                if(fail.match("true")){
                    tl.setResult(tl.TaskResult.Failed, "Build failed.");
                }else{
                    tl.setResult(tl.TaskResult.SucceededWithIssues, "Build failed.");
                }
                //process.exit(1);
                })
                .then(function(data){
                    tl.rmRF(mvnPOMFile);
                });
    });
}
// Processes Maven output for errors and warnings and reports them to the build summary.
function processMavenOutput(data) {
    if (data == null) {
        return;
    }
    data = data.toString();
    var input = data;
    var severity = 'NONE';
    if (data.charAt(0) === '[') {
        var rightIndex = data.indexOf(']');
        if (rightIndex > 0) {
            severity = data.substring(1, rightIndex);
            if (severity === 'ERROR' || severity === 'WARNING') {
                // Try to match Posix output like:
                // /Users/user/agent/_work/4/s/project/src/main/java/com/contoso/billingservice/file.java:[linenumber, columnnumber] error message here 
                // or Windows output like:
                // /C:/a/1/s/project/src/main/java/com/contoso/billingservice/file.java:[linenumber, columnnumber] error message here 
                // A successful match will return an array of 5 strings - full matched string, file path, line number, column number, error message
                input = input.substring(rightIndex + 1);
                var match;
                var matches = [];
                var compileErrorsRegex = isWindows ? /\/([^:]+:[^:]+):\[([\d]+),([\d]+)\](.*)/g //Windows path format - leading slash with drive letter
                    : /([a-zA-Z0-9_ \-\/.]+):\[([0-9]+),([0-9]+)\](.*)/g; // Posix path format
                while (match = compileErrorsRegex.exec(input.toString())) {
                    matches = matches.concat(match);
                }
                if (matches != null) {
                    var index = 0;
                    while (index + 4 < matches.length) {
                        tl.debug('full match = ' + matches[index + 0]);
                        tl.debug('file path = ' + matches[index + 1]);
                        tl.debug('line number = ' + matches[index + 2]);
                        tl.debug('column number = ' + matches[index + 3]);
                        tl.debug('message = ' + matches[index + 4]);
                        // task.issue is only for the xplat agent and doesn't provide the sourcepath link on the summary page.
                        // We should use task.logissue when the xplat agent is retired so this will work on the CoreCLR agent.
                        tl.command('task.issue', {
                            type: severity.toLowerCase(),
                            sourcepath: matches[index + 1],
                            linenumber: matches[index + 2],
                            columnnumber: matches[index + 3]
                        }, matches[index + 0]);
                        index = index + 5;
                    }
                }
            }
        }
    }
}
execBuild();