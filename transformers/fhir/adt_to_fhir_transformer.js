//Patient info/////
var mrn=msg['PID']['PID.3']['PID.3.1'].toString();
var lastName=msg['PID']['PID.5']['PID.5.1'].toString();
var firstName=msg['PID']['PID.5']['PID.5.2'].toString();
var dob=msg['PID']['PID.7']['PID.7.1'].toString();
var sex=msg['PID']['PID.8']['PID.8.1'].toString();
//patientvisit
var patclass=msg['PV1']['PV1.2']['PV1.2.1'].toString();
var patloc=msg['PV1']['PV1.3']['PV1.3.1'].toString();
var patrmnum=msg['PV1']['PV1.3']['PV1.3.2'].toString();
var patbednm=msg['PV1']['PV1.3']['PV1.3.3'].toString();
var providerid=msg['PV1']['PV1.7']['PV1.7.1'].toString();
var providerLN=msg['PV1']['PV1.7']['PV1.7.2'].toString();
var providerFN=msg['PV1']['PV1.7']['PV1.7.3'].toString();
var visit = msg['PV1']['PV1.19']['PV1.19.1'].toString();
var patadmitDate=msg['PV1']['PV1.44']['PV1.44.1'].toString().substr(0,14);

//convert/////
var dob=DateUtil.convertDate('yyyyMMdd','yyyy-MM-dd',dob);
var genderMap={'M':'male','F':'female'};
var gender=genderMap[sex];
var classMap={'I':'IMP','O':'AMB','E':'EMER'};
var encClass = classMap[patclass];
var patadmitDate=DateUtil.convertDate('yyyyMMddHHmmss',"yyyy-MM-dd'T'HH:mm:ss",patadmitDate) + '-06:00';

//Fhir bundle///
var patUuid = 'urn:uuid:' + UUIDGenerator.getUUID();

var bundle = {
    resourceType: 'Bundle',
    type: 'transaction',
    entry: [
        {
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
                birthDate: dob
            },
            request: {
                method: 'PUT',
                url: 'Patient?identifier=http://testhosp.example.org/mrn|' + mrn
            }
        },
        {
            fullUrl: 'urn:uuid:' + UUIDGenerator.getUUID(),
            resource: {
                resourceType: 'Encounter',
                identifier: [{
                    system: 'http://testhosp.example.org/visit',
                    value: visit
                }],
                status: 'in-progress',
                'class': {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                    code: encClass
                },
                subject: { reference: patUuid },
                participant: [{
                    individual: {
                        identifier: { value: providerid },
                        display: providerFN + ' ' + providerLN
                    }
                }],
                period: { start: patadmitDate },
                location: [{
                    location: { display: patloc + ' Room ' + patrmnum + ' Bed ' + patbednm }
                }]
            },
            request: {
                method: 'PUT',
                url: 'Encounter?identifier=http://testhosp.example.org/visit|' + visit
            }
        }
    ]
};

//SAVE for the destination/////
channelMap.put('fhir_bundle', JSON.stringify(bundle));
