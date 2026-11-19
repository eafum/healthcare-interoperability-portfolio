// Safety check: this channel handles one shot per message
if (msg['RXA'].length() > 1) { throw 'Message has ' + msg['RXA'].length() + ' RXA vaccines; this channel only supports one per message'; }

channelMap.put("last_message_id", msg['MSH']['MSH.10']['MSH.10.1'].toString());
channelMap.put("sending_facility", msg['MSH']['MSH.4']['MSH.4.1'].toString());

// Patient
var mrn = msg['PID']['PID.3'][0]['PID.3.1'].toString();
if (msg['PID']['PID.3'][0]['PID.3.5'].toString() != 'MR') { mrn = msg['PID']['PID.3'][1]['PID.3.1'].toString(); }
channelMap.put("mrn", mrn);
channelMap.put("last_name", msg['PID']['PID.5'][0]['PID.5.1'].toString());
channelMap.put("first_name", msg['PID']['PID.5'][0]['PID.5.2'].toString());
var dob = msg['PID']['PID.7']['PID.7.1'].toString().substr(0,8);
channelMap.put("dob", dob ? DateUtil.convertDate('yyyyMMdd','yyyy-MM-dd',dob) : '');
channelMap.put("sex", msg['PID']['PID.8']['PID.8.1'].toString());

// Order
channelMap.put("filler_order", msg['ORC'][0]['ORC.3']['ORC.3.1'].toString());
channelMap.put("ordering_npi", msg['ORC'][0]['ORC.12']['ORC.12.1'].toString());

// Vaccine
var adm = msg['RXA'][0]['RXA.3']['RXA.3.1'].toString().substr(0,14);
channelMap.put("admin_datetime", adm ? DateUtil.convertDate('yyyyMMddHHmmss','yyyy-MM-dd HH:mm:ss',adm) : '');
channelMap.put("cvx_code", msg['RXA'][0]['RXA.5']['RXA.5.1'].toString());
channelMap.put("vaccine_name", msg['RXA'][0]['RXA.5']['RXA.5.2'].toString());
channelMap.put("dose_amount", msg['RXA'][0]['RXA.6']['RXA.6.1'].toString());
channelMap.put("dose_units", msg['RXA'][0]['RXA.7']['RXA.7.1'].toString());
channelMap.put("record_source", msg['RXA'][0]['RXA.9']['RXA.9.1'].toString());
channelMap.put("administered_npi", msg['RXA'][0]['RXA.10']['RXA.10.1'].toString());
channelMap.put("administered_by", msg['RXA'][0]['RXA.10']['RXA.10.3'].toString() + ' ' + msg['RXA'][0]['RXA.10']['RXA.10.2'].toString());
channelMap.put("lot_number", msg['RXA'][0]['RXA.15']['RXA.15.1'].toString());
var exp = msg['RXA'][0]['RXA.16']['RXA.16.1'].toString().substr(0,8);
channelMap.put("lot_expiration", exp ? DateUtil.convertDate('yyyyMMdd','yyyy-MM-dd',exp) : '');
channelMap.put("mvx_code", msg['RXA'][0]['RXA.17']['RXA.17.1'].toString());
channelMap.put("manufacturer", msg['RXA'][0]['RXA.17']['RXA.17.2'].toString());
channelMap.put("completion_status", msg['RXA'][0]['RXA.20']['RXA.20.1'].toString());
channelMap.put("action_code", msg['RXA'][0]['RXA.21']['RXA.21.1'].toString());

// Route and site
channelMap.put("route", msg['RXR'][0]['RXR.1']['RXR.1.2'].toString());
channelMap.put("site", msg['RXR'][0]['RXR.2']['RXR.2.2'].toString());

// VFC eligibility: find the OBX by its LOINC code (OBX order can change)
var vfc = '';
for (var i = 0; i < msg['OBX'].length(); i++) {
    if (msg['OBX'][i]['OBX.3']['OBX.3.1'].toString() == '64994-7') {
        vfc = msg['OBX'][i]['OBX.5']['OBX.5.1'].toString();
    }
}
channelMap.put("vfc_eligibility", vfc);
