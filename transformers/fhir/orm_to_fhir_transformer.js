//Patient info/////
var mrn=msg['PID']['PID.3']['PID.3.1'].toString();
var lastName=msg['PID']['PID.5']['PID.5.1'].toString();
var firstName=msg['PID']['PID.5']['PID.5.2'].toString();
var dob=msg['PID']['PID.7']['PID.7.1'].toString();
var sex=msg['PID']['PID.8']['PID.8.1'].toString();

//Patient Visit/////
var Patclass=msg['PV1']['PV1.2']['PV1.2.1'].toString();
var Patloc=msg['PV1']['PV1.3']['PV1.3.1'].toString();
var DocId=msg['PV1']['PV1.7']['PV1.7.1'].toString();
var DocLastName=msg['PV1']['PV1.7']['PV1.7.2'].toString();
var DocFirstName=msg['PV1']['PV1.7']['PV1.7.3'].toString();
var vistNum=msg['PV1']['PV1.19']['PV1.19.1'].toString();
var admitTim=msg['PV1']['PV1.44']['PV1.44.1'].toString().substr(0,14);

//Order (ORC/OBR)/////
var orderCon   = msg['ORC']['ORC.1']['ORC.1.1'].toString();
var PlacerID   = msg['ORC']['ORC.2']['ORC.2.1'].toString();
var transDate  = msg['ORC']['ORC.9']['ORC.9.1'].toString().substr(0,14);
var ProviderLN = msg['ORC']['ORC.12']['ORC.12.2'].toString();
var ProviderFN = msg['ORC']['ORC.12']['ORC.12.3'].toString();
var testCode   = msg['OBR']['OBR.4']['OBR.4.1'].toString();
var testName   = msg['OBR']['OBR.4']['OBR.4.2'].toString();

//data conversion to FHIR/////
var birthDate = DateUtil.convertDate('yyyyMMdd', 'yyyy-MM-dd', dob);
var genderMap = { 'M': 'male', 'F': 'female' };
var gender    = genderMap[sex];
var classMap  = { 'I': 'IMP', 'O': 'AMB', 'E': 'EMER' };
var encClass  = classMap[Patclass];
var admit     = DateUtil.convertDate('yyyyMMddHHmmss', "yyyy-MM-dd'T'HH:mm:ss", admitTim) + '-06:00';
var trans     = DateUtil.convertDate('yyyyMMddHHmmss', "yyyy-MM-dd'T'HH:mm:ss", transDate) + '-06:00';

//temporary ids/////
var patUuid = 'urn:uuid:' + UUIDGenerator.getUUID();   // stands in for Abena
var encUuid = 'urn:uuid:' + UUIDGenerator.getUUID();   // stands in for the visit

//FHIR transaction Bundle/////
var bundle = {
    resourceType: 'Bundle',
    type: 'transaction',
    entry: [
        {   // ENTRY 1: Patient
            fullUrl: patUuid,
            resource: {
                resourceType: 'Patient',
                identifier: [{
                    use: 'official',
                    system: 'http://testhosp.example.org/mrn',
                    value: mrn
                }],
                active: true,
                name: [{
                    family: lastName,
                    given: [firstName]
                }],
                gender: gender,
                birthDate: birthDate
            },
            request: {
                method: 'PUT',
                url: 'Patient?identifier=http://testhosp.example.org/mrn|' + mrn
            }
        },
        {   // ENTRY 2: Encounter
            fullUrl: encUuid,
            resource: {
                resourceType: 'Encounter',
                identifier: [{
                    use: 'official',
                    system: 'http://testhosp.example.org/visit',
                    value: vistNum
                }],
                status: 'in-progress',
                'class': { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: encClass },
                subject: { reference: patUuid },
                participant: [{
                    individual: {
                        identifier: { value: DocId },
                        display: DocFirstName + ' ' + DocLastName
                    }
                }],
                location: [{
                    location: { display: Patloc }
                }],
                period: { start: admit }
            },
            request: {
                method: 'PUT',
                url: 'Encounter?identifier=http://testhosp.example.org/visit|' + vistNum
            }
        },
        {   // ENTRY 3: ServiceRequest (ORC + OBR)
            fullUrl: 'urn:uuid:' + UUIDGenerator.getUUID(),
            resource: {
                resourceType: 'ServiceRequest',
                identifier: [{
                    use: 'official',
                    type: {
                        coding: [{
                            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                            code: 'PLAC',
                            display: 'Placer Identifier'
                        }]
                    },
                    system: 'http://testhosp.example.org/order',
                    value: PlacerID
                }],
                status: 'active',
                intent: 'order',
                code: {
                    coding: [{
                        system: 'http://loinc.org',
                        code: testCode,
                        display: testName
                    }],
                    text: testName
                },
                subject: { reference: patUuid },
                encounter: { reference: encUuid },
                authoredOn: trans,
                requester: { display: ProviderFN + ' ' + ProviderLN }
            },
            request: {
                method: 'PUT',
                url: 'ServiceRequest?identifier=http://testhosp.example.org/order|' + PlacerID
            }
        }
    ]
};

//SAVE for the destination/////
channelMap.put('fhir_bundle', JSON.stringify(bundle));
