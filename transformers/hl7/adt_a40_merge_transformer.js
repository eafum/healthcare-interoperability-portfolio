// ===== ADT^A40 (merge patient): read, validate, save =====

//message_Headers
channelMap.put('message_id', msg['MSH']['MSH.10']['MSH.10.1'].toString());

//EVENT_DETAILS
var event_Raw  = msg['EVN']['EVN.2']['EVN.2.1'].toString();
var event_time = DateUtil.convertDate('yyyyMMddHHmmss', "yyyy-MM-dd'T'HH:mm:ss", event_Raw);
channelMap.put('event_time', event_time);
channelMap.put('merged_by', msg['EVN']['EVN.5']['EVN.5.3'].toString() + ' ' + msg['EVN']['EVN.5']['EVN.5.2'].toString());

//Patient Details: READ into variables
var surviving_mrn = msg['PID']['PID.3']['PID.3.1'].toString();   // survivor
var retired_mrn   = msg['MRG']['MRG.1']['MRG.1.1'].toString();   // duplicate being retired
var patient_name  = msg['PID']['PID.5']['PID.5.2'].toString() + ' ' + msg['PID']['PID.5']['PID.5.1'].toString();

//VALIDATE before changing any data
if (surviving_mrn == '' || retired_mrn == '') {
    throw 'A40 missing PID.3 or MRG.1';
}
if (surviving_mrn == retired_mrn) {
    throw 'A40 surviving and retired MRN are the same: ' + surviving_mrn;
}

//SAVE
channelMap.put('surviving_mrn', surviving_mrn);
channelMap.put('retired_mrn', retired_mrn);
channelMap.put('patient_name', patient_name);
