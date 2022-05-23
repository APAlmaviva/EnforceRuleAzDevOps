# **Introduction**

**Questa Estensione permette di Integrare funzionalità di Dynatrace all'interno del mondo di AzureDevOps**

![](almatoolbox.jpeg)

## **content**

- Dynatrace Integration Get Problems by Tag: permette di recuperare i problemi relativi a tutte le applicazioni correlate ad un  determinato TAG. 
- Dynatrace Integration Set Metrics: consente di creare una anomaly detection su Dynatrace a partire da un file .json di cui farne upload.

***Dynatrace Integration Get Problems by Tag***

Attraverso l'utilizzo di questo task è possibile recuperare i problemi relativi a tutte le applicazioni correlate ad un  determinato TAG e ottenere un errore o un warning all'interno della pipeline in base al valore del campo "problem error count" e "problem warning count".

Contenuto del task:

- dynatraceendpoint service/server end point (required): connessione all'ambiente dynatrace:

  - API Token: token di autenticazione al servizio. Deve avere i permessi di recupero dei problem
  - service url: url di accesso al servizio, comprensivo di eventuale EnvironmentID

- Dynatrace apimethod (required): l'API method da richiamare per l'utilizzo della funzuonalità getProblems. la url di connessione sarà così composta: 

  > $apiurl +"api/v1/"+ $apimethod

  Default "*problem/feed*"

- Dynatrace timeRange (required): l'intervallo di tempo entro cui recuperare i problems. Default "*3days*"
-  Dynatrace tag (required): il tag per cui recuperare i problems.
- problem warning count (required): il numero di problem per cui la pipeline restituirà un warning.
- problem error count (required): il numero di problem per cui si considera la pipelina fallita.

***Dynatrace Integration Set Metrics***

Attraverso questo task è possibile settare una determinata rule (anomaly detection) a partire da un determinato JSON per le applicazioni referenti un determinato tag.

Contenuto del task:

- dynatraceendpoint service/server end point (required): connessione all'ambiente dynatrace:
  - API Token: token di autenticazione al servizio. Deve avere i permessi di recupero dei problem
  - service url: url di accesso al servizio, comprensivo di eventuale EnvironmentID

- Dynatrace apimethod (required): l'API method da richiamare per l'utilizzo della funzuonalità getProblems. la url di connessione sarà così composta: 

  > $apiurl +"api/config/v1/"+ $apimethod

  Default "*anomalyDetection/metricEvents*"

- Dynatrace appservicename: è prevista la possibilità, all'interno del json di riferimento, di sostituire un valore con una variablie di pipeline, in modo da rendere il json rappresentante la metrica customizzabile a runtime. 
  Vuol dire che all'interno del JSON la parola chiave APPSERVICE (key sensitive) sarà sostituita con il valore di questo campo.

- JSON metric file (required): il path al json file rappresentante la metrica da realizzare.
  esempio json file:

> {
>
>   "metadata": {
>
> ​    "configurationVersions": [
>
> ​      4,
>
> ​      2
>
> ​    ],
>
> ​    "clusterVersion": "0.0.0."
>
>   },
>
>   "metricId": "com.dynatrace.builtin:host.disk.bytesread",
>
>   "name": "My metric event",
>
>   "description": "This is the description for my metric event.",
>
>   "aggregationType": "AVG",
>
>   "severity": "CUSTOM_ALERT",
>
>   "alertCondition": "ABOVE",
>
>   "samples": 5,
>
>   "violatingSamples": 3,
>
>   "dealertingSamples": 5,
>
>   "threshold": 80,
>
>   "alertingScope": [
>
> ​    {
>
> ​      "filterType": "ENTITY_ID",
>
> ​      "entityId": "HOST-000000000001E240"
>
> ​    },
>
> ​    {
>
> ​      "filterType": "TAG",
>
> ​      "tagFilter": {
>
> ​        "context": "CONTEXTLESS",
>
> ​        "key": "someKey",
>
> ​        "value": "someValue"
>
> ​      }
>
> ​    }
>
>   ],
>
>   "metricDimensions": [
>
> ​    {
>
> ​      "filterType": "ENTITY",
>
> ​      "name": "disk",
>
> ​      "index": 1,
>
> ​      "nameFilter": {
>
> ​        "value": "diskName",
>
> ​        "operator": "EQUALS"
>
> ​      }
>
> ​    }
>
>   ],
>
>   "enabled": true,
>
>   "unit": "KILO_BYTE_PER_SECOND"
>
> } 

### Dynatrace integration Set Tags

Attraverso questo task è possibile creare un determinato tag a cui riferire una o più applicazioni per poter recuperare eventuali problem o a cui settare eventuali metriche.

Contenuto del task:

- dynatraceendpoint service/server end point (required): connessione all'ambiente dynatrace:

  - API Token: token di autenticazione al servizio. Deve avere i permessi di recupero dei problem
  - service url: url di accesso al servizio, comprensivo di eventuale EnvironmentID

- Dynatrace apimethod (required): l'API method da richiamare per l'utilizzo della funzuonalità getProblems. la url di connessione sarà così composta: 

  > $apiurl +"api/config/v1/"+ $apimethod

  Default "*anomalyDetection/metricEvents*"

- Dynatrace appservicename: il nome del tag da creare, fa riferimento ad una o più APPSERVICE.

