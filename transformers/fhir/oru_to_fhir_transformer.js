// ===== ORU^R01 -> FHIR R4 transaction Bundle: DiagnosticReport + one Observation per OBX =====

//1. READ: patient and order/report header/////
var mrn        = msg['PID']['PID.3']['PID.3.1'].toString();                     // 9050
var lastName   = msg['PID']['PID.5']['PID.5.1'].toString();                     // Ofori
var firstName  = msg['PID']['PID.5']['PID.5.2'].toString();                     // Abena
var dob        = msg['PID']['PID.7']['PID.7.1'].toString().substr(0,8);         // 19920814
var sex        = msg['PID']['PID.8']['PID.8.1'].toString();                     // F
var provLN     = msg['OBR']['OBR.16']['OBR.16.2'].toString();                   // Smith
var provFN     = msg['OBR']['OBR.16']['OBR.16.3'].toString();                   // Robert
var placerID   = msg['OBR']['OBR.2']['OBR.2.1'].toString();                     // ORD5002 (our order number)
var fillerID   = msg['OBR']['OBR.3']['OBR.3.1'].toString();                     // LAB30002 (the lab's number)
var panelCode  = msg['OBR']['OBR.4']['OBR.4.1'].toString();                     // 58410-2
var panelName  = msg['OBR']['OBR.4']['OBR.4.2'].toString();                     // CBC panel
var collected  = msg['OBR']['OBR.7']['OBR.7.1'].toString().substr(0,14);        // specimen collected
var reported   = msg['OBR']['OBR.22']['OBR.22.1'].toString().substr(0,14);      // results reported
var rptStatus  = msg['OBR']['OBR.25']['OBR.25.1'].toString();                   // F

//2. CONVERT: maps and dates/////
var statusMap = { 'F': 'final', 'P': 'preliminary', 'C': 'corrected', 'X': 'cancelled' };
var flagMap   = { 'H': 'High', 'L': 'Low', 'N': 'Normal', 'HH': 'Critical high', 'LL': 'Critical low', 'A': 'Abnormal' };
var genderMap = { 'M': 'male', 'F': 'female' };
var collectedFhir = DateUtil.convertDate('yyyyMMddHHmmss', "yyyy-MM-dd'T'HH:mm:ss", collected) + '-06:00';
var reportedFhir  = DateUtil.convertDate('yyyyMMddHHmmss', "yyyy-MM-dd'T'HH:mm:ss", reported) + '-06:00';

//3. Patient and order entries (PUT finds the existing ones; urn:uuid links everything)/////
var patUuid = 'urn:uuid:' + UUIDGenerator.getUUID();
var srUuid  = 'urn:uuid:' + UUIDGenerator.getUUID();
var patientRef = patUuid;
var orderRef   = srUuid;

var entries = [];      // all Bundle entries
var obsRefs = [];      // links from the DiagnosticReport to each Observation

var patient = {
    resourceType: 'Patient',
    identifier: [{ use: 'official', system: 'http://testhosp.example.org/mrn', value: mrn }],
    active: true,
    name: [{ family: lastName, given: [firstName] }],
    gender: genderMap[sex]
};
if (dob) { patient.birthDate = DateUtil.convertDate('yyyyMMdd', 'yyyy-MM-dd', dob); }

entries.push({
    fullUrl: patUuid,
    resource: patient,
    request: { method: 'PUT', url: 'Patient?identifier=http://testhosp.example.org/mrn|' + mrn }
});

// Final results mean the order is done: active -> completed
var serviceRequest = {
    resourceType: 'ServiceRequest',
    identifier: [{
        use: 'official',
        type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'PLAC', display: 'Placer Identifier' }] },
        system: 'http://testhosp.example.org/order',
        value: placerID
    }],
    status: (rptStatus == 'F') ? 'completed' : 'active',
    intent: 'order',
    code: { coding: [{ system: 'http://loinc.org', code: panelCode, display: panelName }], text: panelName },
    subject: { reference: patUuid },
    requester: { display: provFN + ' ' + provLN }
};

entries.push({
    fullUrl: srUuid,
    resource: serviceRequest,
    request: { method: 'PUT', url: 'ServiceRequest?identifier=http://testhosp.example.org/order|' + placerID }
});

//4. LOOP: one Observation per OBX/////
for (var i = 0; i < msg['OBX'].length(); i++) {
    var obx = msg['OBX'][i];

    // READ this OBX
    var code   = obx['OBX.3']['OBX.3.1'].toString();      // 718-7
    var name   = obx['OBX.3']['OBX.3.2'].toString();      // Hemoglobin
    var value  = obx['OBX.5']['OBX.5.1'].toString();      // 10.8
    var units  = obx['OBX.6']['OBX.6.1'].toString();      // g/dL
    var range  = obx['OBX.7']['OBX.7.1'].toString();      // 12.0-15.5
    var flag   = obx['OBX.8']['OBX.8.1'].toString();      // L
    var status = obx['OBX.11']['OBX.11.1'].toString();    // F

    // FHIR-2101: set ID + validation (never store a result without a code or value)
    var setId = obx['OBX.1']['OBX.1.1'].toString();       // 1, 2, 3
    if (code == '' || value == '') {
        throw 'OBX ' + setId + ' is missing a code or value';
    }

    // BUILD the Observation
    var obsUuid = 'urn:uuid:' + UUIDGenerator.getUUID();
    var observation = {
        resourceType: 'Observation',
        text: {
            status: 'generated',
            div: '<div xmlns="http://www.w3.org/1999/xhtml">' + name + ': ' + value + ' ' + units + (flag ? ' (' + flag + ')' : '') + '</div>'
        },
        identifier: [{ system: 'http://mirthlab.example.org/result', value: fillerID + '-' + setId }],
        basedOn: [{ reference: orderRef }],
        status: statusMap[status] || 'final',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'laboratory', display: 'Laboratory' }] }],
        code: { coding: [{ system: 'http://loinc.org', code: code, display: name }], text: name },
        subject: { reference: patientRef },
        effectiveDateTime: collectedFhir,
        issued: reportedFhir,
        valueQuantity: { value: parseFloat(value), unit: units, system: 'http://unitsofmeasure.org', code: units }
    };

    // Only add a flag if OBX.8 has one
    if (flag) {
        observation.interpretation = [{ coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
            code: flag, display: flagMap[flag] || flag }] }];
    }

    // Only add a reference range if OBX.7 looks like "low-high"
    if (range.indexOf('-') > 0) {
        var parts = range.split('-');
        observation.referenceRange = [{
            low:  { value: parseFloat(parts[0]), unit: units, system: 'http://unitsofmeasure.org', code: units },
            high: { value: parseFloat(parts[1]), unit: units, system: 'http://unitsofmeasure.org', code: units }
        }];
    }

    entries.push({
        fullUrl: obsUuid,
        resource: observation,
        request: { method: 'PUT', url: 'Observation?identifier=http://mirthlab.example.org/result|' + fillerID + '-' + setId }
    });
    obsRefs.push({ reference: obsUuid });
}

//5. BUILD the DiagnosticReport (the OBR: the whole CBC report)/////
var report = {
    resourceType: 'DiagnosticReport',
    text: {
        status: 'generated',
        div: '<div xmlns="http://www.w3.org/1999/xhtml">' + panelName + ' (' + (statusMap[rptStatus] || 'final') + '), reported ' + reportedFhir + '</div>'
    },
    identifier: [{ system: 'http://mirthlab.example.org/report', value: fillerID }],
    basedOn: [{ reference: orderRef }],
    status: statusMap[rptStatus] || 'final',
    category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0074', code: 'LAB', display: 'Laboratory' }] }],
    code: { coding: [{ system: 'http://loinc.org', code: panelCode, display: panelName }], text: panelName },
    subject: { reference: patientRef },
    effectiveDateTime: collectedFhir,
    issued: reportedFhir,
    result: obsRefs
};

entries.push({
    fullUrl: 'urn:uuid:' + UUIDGenerator.getUUID(),
    resource: report,
    request: { method: 'PUT', url: 'DiagnosticReport?identifier=http://mirthlab.example.org/report|' + fillerID }
});

//6. BUILD the Bundle and SAVE/////
var bundle = { resourceType: 'Bundle', type: 'transaction', entry: entries };
channelMap.put('fhir_bundle', JSON.stringify(bundle));
