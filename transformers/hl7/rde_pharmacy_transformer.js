// INC-2093: RDE^O11 pharmacy order -> channelMap for HL7_PharmacyOrders

//Message Header
channelMap.put('message_id',msg['MSH']['MSH.10']['MSH.10.1'].toString());

//ORDER_DETAILS
channelMap.put('order_control',msg['ORC']['ORC.1']['ORC.1.1'].toString());
channelMap.put('placer_order',msg['ORC']['ORC.2']['ORC.2.1'].toString());
channelMap.put('filler_order',msg['ORC']['ORC.3']['ORC.3.1'].toString());

//Patient_details
channelMap.put('mrn',msg['PID']['PID.3']['PID.3.1'].toString());
channelMap.put('patient_name',msg['PID']['PID.5']['PID.5.2'].toString() +' '+ msg['PID']['PID.5']['PID.5.1'].toString());

//Pat_location
channelMap.put('location',msg['PV1']['PV1.3']['PV1.3.1'].toString());

//medication info
channelMap.put('ndc_code',msg['RXE']['RXE.2']['RXE.2.1'].toString());
channelMap.put('drug_name',msg['RXE']['RXE.2']['RXE.2.2'].toString());
channelMap.put('dose',msg['RXE']['RXE.3']['RXE.3.1'].toString());
channelMap.put('dose_unit',msg['RXE']['RXE.5']['RXE.5.1'].toString());
channelMap.put('dosage_form',msg['RXE']['RXE.6']['RXE.6.1'].toString());
channelMap.put('frequency',msg['RXE']['RXE.1']['RXE.1.2'].toString());
channelMap.put('dispense_qty',msg['RXE']['RXE.10']['RXE.10.1'].toString());
channelMap.put('route',msg['RXR']['RXR.1']['RXR.1.1'].toString());

//Provider details
channelMap.put('ordering_provider',msg['ORC']['ORC.12']['ORC.12.3'].toString() +' '+ msg['ORC']['ORC.12']['ORC.12.2'].toString());
channelMap.put('provider_npi',msg['ORC']['ORC.12']['ORC.12.1'].toString());

//Order date
var date_ordered = msg['ORC']['ORC.9']['ORC.9.1'].toString();
var ordered_at = DateUtil.convertDate('yyyyMMddHHmmss', "yyyy-MM-dd'T'HH:mm:ss", date_ordered);
channelMap.put('ordered_at', ordered_at);

//Order status from ORC.1
var control = msg['ORC']['ORC.1']['ORC.1.1'].toString();
var statusMap={'NW': 'active', 'DC': 'discontinued', 'CA': 'cancelled', 'XO': 'active', 'HD': 'on hold' };
channelMap.put('order_status', statusMap[control]);

//Validation: never save an order that cannot be matched later
if (channelMap.get('placer_order') == '') {
    throw 'Missing placer order number (ORC.2)';
}
if (channelMap.get('mrn') == '') {
    throw 'Missing MRN (PID.3)';
}
